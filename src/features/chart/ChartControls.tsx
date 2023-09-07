import {RootState} from "../../app/store";
import {useDispatch, useSelector} from 'react-redux'
import {changePrinciple, changeYears, changeStartingRate} from "./chartSlice";
import {RulesControls} from "./RuleControls";
import {ruleSelectors} from "./chartSlice";

interface ControlsProps {
    id: number,
}

export function ChartControls({id}: ControlsProps) {
    const principle = useSelector((state: RootState) => state.chart.plans[id].initialPrinciple)
    const years = useSelector((state: RootState) => state.chart.plans[id].initialYears)
    const startingInterest = useSelector((state: RootState) => state.chart.plans[id].initialRate)
    const rules = useSelector(ruleSelectors.selectAll).filter(rule => rule.planId===id);
    const dispatch = useDispatch();
    return <div>
        <label>Principle</label>
        <input value={principle} onChange={(e) => dispatch(changePrinciple({id, value: parseFloat(e.target.value), rules}))}/>
        <label>Years</label>
        <input value={years} onChange={(e) => dispatch(changeYears({id, value: parseInt(e.target.value), rules}))}/>
        <label>Initial Rate</label>
        <input value={startingInterest} onChange={(e) => dispatch(changeStartingRate({id, value: parseFloat(e.target.value), rules}))}/>
        <RulesControls id={id}></RulesControls>
    </div>
}