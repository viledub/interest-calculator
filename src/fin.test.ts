import {generateSchedule} from './fin';

test('renders learn react link', () => {
    expect(generateSchedule([],100,5,4.0).length).toBe(60);
});

test('extra rule does something', () => {
    const extraRule = {ruleId:'', planId:1, from: 0, type: 'extra', value: -33, until:-1, every: 1, bias: .5, order: 0}
    const sched = generateSchedule([extraRule],1000,4,7.3);
    expect(sched.length).toBe(60);
});