import {useDispatch, useSelector} from 'react-redux'
import {RootState} from "../../app/store";
import {
    Axis, // any of these can be non-animated equivalents
    AnimatedGrid,
    AnimatedLineSeries,
    XYChart,
    Tooltip,
} from '@visx/xychart';
import {selectCachedSchedule, selectSchedule} from "./chartSlice"
import {PaymentDetail} from "../../fin"
import {Root} from "react-dom/client";

const data1 = [
    { x: '2020-01-01', y: 50 },
    { x: '2020-01-02', y: 10 },
    { x: '2020-01-03', y: 20 },
];

const data2 = [
    { x: '2020-01-01', y: 30 },
    { x: '2020-01-02', y: 40 },
    { x: '2020-01-03', y: 80 },
];

const accessors = {
    xAccessor: (d: any) => d.x,
    yAccessor: (d: any) => d.y,
};
const accessors2 = {
    xAccessor: (d: any) => d.x,
    yAccessor: (d: any) => d.y,
};

interface ChartProps {
    id: number,
}

export function Chart({id}: ChartProps) {
    const principle = useSelector((state: RootState) => state.chart.plans[id].initialPrinciple)
    const years = useSelector((state: RootState) => state.chart.plans[id].initialPrinciple)
    const thing = useSelector((state:RootState) => selectCachedSchedule(state, id))
    const d1 = thing.map(detail => ({x: detail.periodNumber, y:-detail.payment}))
    const d2 = thing.map(detail => ({x: detail.periodNumber, y:detail.interest}))
    const d3 = thing.map(detail => ({x: detail.periodNumber, y:-detail.extraPayment}))
    function getTotal(schedule: PaymentDetail[]) {
        let total = 0;
        schedule.forEach((detail) => {
            total+=detail.payment
        });
        return total;
    }
    const totalRepayed = useSelector((state:RootState) => getTotal(thing))
    const interest = principle+totalRepayed;
    return (
        <div>
            <XYChart height={300} xScale={{ type: 'band' }} yScale={{ type: 'linear' }}>
                <Axis orientation="bottom" />
                <AnimatedGrid columns={false} numTicks={4} />
                <AnimatedLineSeries dataKey="Base Payment" data={d1} {...accessors} />
                <AnimatedLineSeries dataKey="Interest" data={d2} {...accessors2} />
                <AnimatedLineSeries dataKey="Extra" data={d3} {...accessors2} />
                <Tooltip
                    snapTooltipToDatumX
                    snapTooltipToDatumY
                    showVerticalCrosshair
                    showSeriesGlyphs
                    renderTooltip={({ tooltipData, colorScale }) => (
                            <div>
                                <div style={{ color: colorScale?(tooltipData?.nearestDatum?.key) : ''}}>
                                    {tooltipData?.nearestDatum?.key}
                                </div>
                                {accessors.xAccessor(tooltipData?.nearestDatum?.datum)}
                                {', '}
                                {accessors.yAccessor(tooltipData?.nearestDatum?.datum)}
                            </div>
                        )
                }
                />
            </XYChart>
            <p>Per Year: {principle/years}</p>
            <p>Total Paid: {totalRepayed}</p>
            <p>Interest: {interest}</p>
        </div>
    )
}

