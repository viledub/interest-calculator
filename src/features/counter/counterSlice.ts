import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Task {
    text: string,
}

export interface CounterState {
    value: number,
    content: Task[],
    pastedImages: string[],
}

const initialState: CounterState = {
    value: 0,
    content: [],
    pastedImages: [],
}

export const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        increment: (state) => {
            state.value += 1
        },
        decrement: (state) => {
            state.value -= 1
        },
        incrementByAmount: (state, action: PayloadAction<number>) => {
            state.value += action.payload
        },
        append: (state, action: PayloadAction<string>) => {
            state.content.push({text: action.payload})
        },
        paste: (state,action: PayloadAction<string>) => {
            console.log(action.payload)
            state.pastedImages.push(action.payload)
        }
    },
})

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount, append, paste } = counterSlice.actions

export default counterSlice.reducer