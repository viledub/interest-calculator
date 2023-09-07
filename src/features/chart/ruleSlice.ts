import { createSlice, PayloadAction, createEntityAdapter } from '@reduxjs/toolkit'
import {RootState} from "../../app/store";
import {v4 as uuid} from 'uuid';

interface UserRule {
    ruleId: number,
    planId: number,
    from: number,
    type: string,
    value: number,
    every: number, // optional defaults to 1
    until: number, // optional defaults to -1
    bias: number,
}

function initialRules() {
    return [
        {ruleId: 1, planId: 1, from: 0, type: 'rateAdjust', value: 0.0075, every: 12, until: -1, bias: 0.5},
        // {from: 31, type: 'extra', value: -30000, every: 1, until: 31, bias: 0.5},
    ]
}

const rulesAdapter = createEntityAdapter<UserRule>({
    selectId: (rule) => rule.ruleId,
    sortComparer: (a, b) => a.ruleId - b.ruleId,
})
const initialState = rulesAdapter.getInitialState();


export interface RuleChange {
    ruleId: number,
    value: number
}

export const ruleSlice = createSlice({
    name: 'rule',
    initialState: rulesAdapter.upsertMany(initialState, initialRules()),
    reducers: {
        ruleAdded: {reducer: rulesAdapter.addOne, prepare: (rule) => {
            const id = uuid();
            return {payload: {...rule, ruleId: id}}
        }},
        ruleRemoved: rulesAdapter.removeOne,
        ruleValueEdited: (state, action:PayloadAction<RuleChange>) => {

            const rewl= state.entities[action.payload.ruleId]
            if(!rewl) {
                return
            }
            rewl.value=action.payload.value
        },
        ruleFromEdited: (state, action:PayloadAction<RuleChange>) => {

            const rewl= state.entities[action.payload.ruleId]
            if(!rewl) {
                return
            }
            rewl.from=action.payload.value
        },
    }
});

export const { ruleAdded, ruleRemoved, ruleValueEdited, ruleFromEdited } = ruleSlice.actions

export default ruleSlice.reducer