import {createEntityAdapter, createSlice, EntityState, PayloadAction} from '@reduxjs/toolkit'
import {createCachedSelector } from 're-reselect'
import { createSelectorCreator, defaultMemoize } from 'reselect'
import {generateSchedule, PaymentDetail, PaymentRule} from '../../fin'
import {RootState} from "../../app/store";

export interface ChartState {
    plans: PlanState[],
    rules: EntityState<PaymentRule>,
}

export interface PlanState {
    initialPrinciple: number,
    initialRate: number,
    initialYears: number,
}

const rulesAdapter = createEntityAdapter<PaymentRule>({
    selectId: (rule) => rule.ruleId,
    sortComparer: (a, b) => a.ruleId.localeCompare(b.ruleId),
})

const initialState: ChartState = {
    plans: [{
        initialPrinciple: 100000,
        initialYears: 20,
        initialRate: 7.3,
    },
    {
        initialPrinciple: 100000,
        initialYears: 20,
        initialRate: 7.3,
    }
    ],
    rules: rulesAdapter.getInitialState(),
}



interface TargetedPayload {
    id: number;
    value: number;
    rules: PaymentRule[];
}

export interface RuleChange {
    ruleId: string,
    value: number
}

function orderSort(first: PaymentRule, second: PaymentRule) {
    if (first.order === second.order) {
        return 0;
    }
    if (first.order > second.order) {
        return 1;
    }
    return -1;
}

export function selectSchedule(planId: number) {
    return (state: RootState) => {
        const plan = state.chart.plans[planId];
        const rules = state.chart.rules.ids.map(id => state.chart.rules.entities[id] as PaymentRule).filter(rule => rule.planId === planId).sort(orderSort)
        return generateSchedule(rules, plan.initialPrinciple, plan.initialYears, plan.initialRate)
    }
}

const shallowArrayEqualityCheck = (currentVal:any[], previousVal:any[]) => {
    if(!Array.isArray(currentVal)){
        return currentVal === previousVal;
    }
    if (currentVal.length !== previousVal.length) {
        return false
    }
    const length = currentVal.length
    for (let i = 0; i < length; i++) {
        if (currentVal[i] !== previousVal[i]) {
            return false
        }
    }
    return true
}

const createShallowEqualSelector = createSelectorCreator(
    defaultMemoize,
    shallowArrayEqualityCheck,
)

const getInterest = (state:RootState, planId: number) => state.chart.plans[planId].initialRate
const getPrinciple = (state:RootState, planId: number) => state.chart.plans[planId].initialPrinciple
const getYears = (state:RootState, planId: number) => state.chart.plans[planId].initialYears

function getRules(state: RootState, planId: number) {
    return state.chart.rules.ids.map(id => state.chart.rules.entities[id] as PaymentRule).filter(rule => rule.planId === planId).sort(orderSort)
}
function combo(rules:PaymentRule[], principle:number, years:number, rate:number):PaymentDetail[] {
    return generateSchedule(rules, principle, years, rate);
}

export const selectCachedSchedule = createCachedSelector(getRules, getPrinciple, getYears, getInterest, combo)(
    {
        keySelector: (state, plan) => plan,
        selectorCreator: createShallowEqualSelector
    }
    )


export const chartSlice = createSlice({
    name: 'chart',
    initialState,
    reducers: {
        changePrinciple: (state,action: PayloadAction<TargetedPayload>) => {
            const plan = state.plans[action.payload.id];
            plan.initialPrinciple = action.payload.value
        },
        changeStartingRate: (state, action: PayloadAction<TargetedPayload>) => {
            const plan = state.plans[action.payload.id];
            plan.initialRate = action.payload.value;
        },
        changeYears: (state, action:PayloadAction<TargetedPayload>) => {
            const plan = state.plans[action.payload.id];
            plan.initialYears = action.payload.value;
        },
        ruleAdded: (state,action:PayloadAction<PaymentRule>) => {
            rulesAdapter.addOne(state.rules, action.payload);
        },
        ruleRemoved: (state,action:PayloadAction<string>) => {
            rulesAdapter.removeOne(state.rules, action.payload);
        },
        ruleValueEdited: (state, action:PayloadAction<RuleChange>) => {
            const rewl= state.rules.entities[action.payload.ruleId]
            if(!rewl) {
                return
            }
            rewl.value=action.payload.value ? action.payload.value : 0
        },
        ruleFromEdited: (state, action:PayloadAction<RuleChange>) => {
            const rewl= state.rules.entities[action.payload.ruleId]
            if(!rewl) {
                return
            }
            rewl.from=action.payload.value ? action.payload.value : 0
        },
        ruleBiasEdited: (state, action:PayloadAction<RuleChange>) => {
            const rewl= state.rules.entities[action.payload.ruleId]
            if(!rewl) {
                return
            }
            rewl.bias=action.payload.value ? action.payload.value : 0
        },
    }
});
export const ruleSelectors = rulesAdapter.getSelectors<RootState>((state) => state.chart.rules)


export const filteredRuleSelectors = {
    rulesForId(id: number) {
        return (state: RootState) => {
            return ruleSelectors.selectAll(state).filter((rule)=> rule.planId === id).sort(orderSort);
        }
    },
    getRule(id: string) {
        return (state: RootState) => {
            return ruleSelectors.selectById(state, id)
        }
    }

}
export const { changePrinciple, changeYears, changeStartingRate, ruleAdded, ruleRemoved, ruleValueEdited, ruleFromEdited, ruleBiasEdited } = chartSlice.actions

export default chartSlice.reducer