import {RootState, store} from "../../app/store";
import {useDispatch, useSelector} from 'react-redux'
import {ruleAdded, ruleRemoved, ruleSelectors, filteredRuleSelectors} from "./chartSlice";
import {Rule} from "./Rule";
import {v4 as uuid} from "uuid";
import {PaymentRule} from "../../fin";

interface RulesControlProps {
    id: number,
}

export function RulesControls({id}: RulesControlProps) {
    const rules = useSelector(filteredRuleSelectors.rulesForId(id));
    const lastRule: PaymentRule = rules.length > 0? rules[rules.length-1] : {ruleId:'', planId:id, from: 0, type: 'rate', value: 7.4, until:-1, every: 1, bias: .5, order: rules.length};
    const baseRule = {...lastRule, ruleId:uuid(), order: rules.length}
    const dispatch = useDispatch();
    return (<div>
        {rules.map(((rule,key) => {
            return (<Rule id={rule.ruleId} key={rule.order}></Rule>)
        }))}
        <button type="button" onClick={()=>{
            dispatch(ruleAdded({...baseRule, type: 'rate', value: 7.4}))
        }
        }>Add Rate Change</button>
        <button type="button" onClick={()=>{
            dispatch(ruleAdded({...baseRule, type: 'payment', value: -100}))
        }
        }>Add Payment Change</button>
        <button type="button" onClick={()=>{
            dispatch(ruleAdded({...baseRule, type: 'extra', value: -200}))
        }
        }>Add Extra Change</button>
        <button type="button" onClick={()=>{
            if (rules.length > 0) {
                dispatch(ruleRemoved(rules[rules.length - 1].ruleId))
            }
        }
        }>Remove Last Rule</button>
    </div>)
}