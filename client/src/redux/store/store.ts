import { configureStore } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from './hooks'
import rootReducer, { RootState } from './rootReducer'

export const store = configureStore({
    reducer: rootReducer,
})

export const initializeStore = () => {
    return store
}

export type AppDispatch = typeof store.dispatch

export { useAppDispatch, useAppSelector }
export type { RootState }
