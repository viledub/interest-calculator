export function PMT(ir: number, np: number, pv: number, fv= 0, type = 0) {
    /*
     * ir   - interest rate per month
     * np   - number of periods (months)
     * pv   - present value
     * fv   - future value
     * type - when the payments are due:
     *        0: end of the period, e.g. end of month (default)
     *        1: beginning of period
     */
    var pmt, pvif;

    fv || (fv = 0);
    type || (type = 0);

    if (ir === 0)
        return -(pv + fv)/np;

    pvif = Math.pow(1 + ir, np);
    pmt = - ir * pv * (pvif + fv) / (pvif - 1);

    if (type === 1)
        pmt /= (1 + ir);

    return pmt;
}

export function NPER(rate: number, payment: number, present: number, future = 0, type = 0) {
  var num = payment * (1 + rate * type) - future * rate;
  var den = (present * rate + payment * (1 + rate * type));
  return Math.log(num / den) / Math.log(1 + rate);
}

function getRelevantRules(rules: PaymentRule[], periodNumber: number) {
    return rules.filter((rule) => {
        const pastFrom = rule.from <= periodNumber;
        // from 1, every 1 would be everything from 1 onward
        // from 1, every 2 would be 1,3,5
        // from 2, every 2 would be 2,4,6
        const matchesEvery = (periodNumber - rule.from)%rule.every === 0;
        const beforeUntil = rule.until > 0 ? periodNumber <= rule.until : true;
        return pastFrom && matchesEvery && beforeUntil;
    })

}

function createDetail(baseDetail: PaymentDetail, previousDetail: PaymentDetail, relevantRules: PaymentRule[], periodNumber: number): PaymentDetail {
    const newDetail = {...baseDetail, periodNumber};
    newDetail.remainingPeriods = previousDetail.remainingPeriods - (periodNumber - previousDetail.periodNumber)
    newDetail.initialPrinciple = previousDetail.finalPrinciple;
    newDetail.periodRate = previousDetail.periodRate;
    newDetail.payment = PMT(newDetail.periodRate, newDetail.remainingPeriods, newDetail.initialPrinciple)
    relevantRules.forEach((rule) => {
        if(rule.type === 'period') {
            newDetail.remainingPeriods = rule.value;
            newDetail.payment = PMT(newDetail.periodRate, newDetail.remainingPeriods, newDetail.initialPrinciple)
        } else if(rule.type === 'rate') {
            newDetail.periodRate = rule.value/1200;
            newDetail.payment = PMT(newDetail.periodRate, newDetail.remainingPeriods, newDetail.initialPrinciple)
        } else if(rule.type === 'extra') {
            newDetail.extraPayment = rule.value;
            newDetail.extraPaymentBias = rule.bias;
        } else if(rule.type === 'payment') {
            newDetail.payment = rule.value;
        } else if(rule.type === 'rateAdjust') {
            newDetail.periodRate += rule.value/1200;
            newDetail.payment = PMT(newDetail.periodRate, newDetail.remainingPeriods, newDetail.initialPrinciple)
        }
    });


    if (newDetail.extraPayment) {
        const targetPrinciple = newDetail.initialPrinciple + newDetail.extraPayment;
        const newPrinciple = targetPrinciple > 0 ? targetPrinciple : 0;
        const nMax = NPER(newDetail.periodRate, newDetail.payment, newPrinciple) - newDetail.remainingPeriods;
        const nBiased = (nMax * newDetail.extraPaymentBias) + newDetail.remainingPeriods
        newDetail.payment = PMT(newDetail.periodRate, nBiased, newPrinciple);
        newDetail.remainingPeriods = nBiased;
    }
    newDetail.interest = newDetail.initialPrinciple * newDetail.periodRate;
    newDetail.finalPrinciple = newDetail.initialPrinciple + newDetail.interest + newDetail.extraPayment + newDetail.payment;
    return newDetail;
}

export interface PaymentRule {
    ruleId: string,
    order: number,
    planId: number,
    from: number,
    type: string,
    value: number,
    every: number, // optional defaults to 1
    until: number, // optional defaults to -1
    bias: number,
}
export interface PaymentDetail {
    periodNumber: number
    initialPrinciple: number,
    periodRate: number,
    interest: number,
    remainingPeriods: number,
    extraPayment: number,
    extraPaymentBias: number,
    finalPrinciple: number, // probably should be derived
    payment: number
}

/**
 *
 * @param rules The payment rules used to determine changes to payment schedule. Rules are applied in order and later rules overwrite.
 *   For example, a rule 'from' period 5 which sets interest to 1% will continue to apply for 6,7,8.
 * @param principle The principle at the start of the schedule. Assumed to be 0 at the end.
 * @param years The number of years to calculate the schedule for - could be changed to periods instead.
 * @param startingInterest The yearly interest rate at the start of the schedule
 */
export function generateSchedule(rules: PaymentRule[], principle: number, years: number, startingInterest: number):PaymentDetail[] {
    // making a new schedule
    console.log('calls to sched')
    const months = years*12;
    const monthlyInterestFromInitial = startingInterest/1200;
    const payment = PMT(monthlyInterestFromInitial, months, principle);
    const newSchedule = [];
    let remainingPrinciple = principle;
    let currentPeriod = 0;
    let baseDetails: PaymentDetail = {
        periodNumber: 1,
        initialPrinciple: principle,
        periodRate: monthlyInterestFromInitial,
        interest: principle*monthlyInterestFromInitial,
        remainingPeriods: months,
        extraPayment: 0,
        extraPaymentBias: 0,
        finalPrinciple: principle,
        payment
    }
    let previousDetails = baseDetails;
    let safety=0
    while (remainingPrinciple > 0.0001 && safety<400) {
        currentPeriod++;
        safety++;
        const relevantRules = getRelevantRules(rules, currentPeriod)
        const newDetail = createDetail(baseDetails, previousDetails, relevantRules, currentPeriod)
        previousDetails = newDetail;
        newSchedule.push(newDetail)
        remainingPrinciple = newDetail.finalPrinciple;

    }
    return newSchedule;
}