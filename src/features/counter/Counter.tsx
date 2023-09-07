import React, {useState} from 'react'
import {RootState} from '../../app/store'
import {useDispatch, useSelector} from 'react-redux'
import {append, decrement, increment, incrementByAmount, paste, Task} from './counterSlice'

type CounterProps = {
    hello: string;
}

export function Counter(props: CounterProps) {
    const count = useSelector((state: RootState) => state.counter.value)
    const content = useSelector((state: RootState) => state.counter.content)
    const pastedImages = useSelector((state: RootState) => state.counter.pastedImages)
    console.log(pastedImages)
    const dispatch = useDispatch()
    const [incrementAmount, setIncrementAmount] = useState('2')
    const [addingContent, setAddingContent] = useState('')
    const pasteHandler = (event: any) => {
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        console.log(JSON.stringify(items)); // might give you mime types
        for (var index in items) {
            var item = items[index];
            if (item.kind === 'file') {
                var blob = item.getAsFile();
                var reader = new FileReader();
                reader.onload = function (event) {
                    console.log(event); // data url!
                    const url = ((event.target || {result: ''} ).result || '').toString()
                    dispatch(paste(url))
                };
                reader.readAsDataURL(blob);
            }
        }
    }
    return (<div>
        <div>
            <h1>{props.hello}</h1>
            <button aria-label="Increment value" onClick={() => dispatch(increment())}>
                Increment
            </button>
            <span>{count}</span>
            <button aria-label="Decrement value" onClick={() => dispatch(decrement())}>
                Decrement
            </button>
            <input value={incrementAmount}
                   onChange={e => setIncrementAmount(e.target.value)}></input>

            <button onClick={() => dispatch(incrementByAmount(Number(incrementAmount) || 0))}>
                Increment By Amount
            </button>
            <input value={addingContent}
                   onChange={e => setAddingContent(e.target.value)}></input>
            {content.map((task, i) => <div key={i}>{task.text}</div>)}
            <button onClick={() => dispatch(append(addingContent || '' ))}>
                Append
            </button>
            <div onPaste={pasteHandler}><p>hmmm</p>
                {pastedImages.map((uri, key) => {
                    return <img src={uri} key={key}></img>
                })}
            </div>
        </div>
    </div>)
}