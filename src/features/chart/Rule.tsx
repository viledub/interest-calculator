import {RootState, store} from "../../app/store";
import {useDispatch, useSelector} from 'react-redux'
import {ruleAdded, ruleRemoved, ruleValueEdited, ruleFromEdited, ruleBiasEdited, ruleSelectors, filteredRuleSelectors} from "./chartSlice";

interface RulesControlProps {
    id: string,
}

export function Rule({id}: RulesControlProps) {
    const rule = useSelector(filteredRuleSelectors.getRule(id))
    const dispatch = useDispatch();
    if(!rule) {
        return <></>
    }
    if (rule.type === 'extra') {
        return (<div>
            <p>{rule.type} {rule.ruleId} {rule.planId}: {rule.order}</p>
            <label>Value</label>

            <input type="number" value={rule.value} step=".25" onChange={(e)=>dispatch(
                ruleValueEdited({ruleId: rule.ruleId, value:parseFloat(e.target.value)}))}
            />
            <label>From</label>

            <input onChange={(e)=>dispatch(
                ruleFromEdited({ruleId: rule.ruleId, value:parseInt(e.target.value)}))}
                   type="number" step="1" value={rule.from}/>

            <label>Bias</label>
            <input type="number" value={rule.bias} step=".25" onChange={(e)=>dispatch(
                ruleBiasEdited({ruleId: rule.ruleId, value:parseFloat(e.target.value)}))}
            />
            <button type="button" onClick={()=>{
                dispatch(ruleRemoved(id))
            }
            }>Remove</button>
        </div>)
    }
    return (<div>
        <p>{rule.type} {rule.ruleId} {rule.planId}: {rule.order}</p>
        <label>Value</label>

        <input type="number" value={rule.value} step=".25" onChange={(e)=>dispatch(
            ruleValueEdited({ruleId: rule.ruleId, value:parseFloat(e.target.value)}))}
               />
        <label>From</label>

        <input onChange={(e)=>dispatch(
            ruleFromEdited({ruleId: rule.ruleId, value:parseInt(e.target.value)}))}
               type="number" step="1" value={rule.from}/>
        <button type="button" onClick={()=>{
            dispatch(ruleRemoved(id))
        }
        }>Remove</button>
    </div>)
}