import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import chartReducer from '../features/chart/chartSlice'
import ruleReducer from '../features/chart/ruleSlice'

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        chart: chartReducer,
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch