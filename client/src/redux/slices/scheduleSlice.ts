import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Schedule, ScheduleResponse } from '../../types/flowerTypes'
import { fetchScheduleByFlower, updateScheduleByFlower } from '../services/flowersApi'

interface ScheduleState {
    schedule: Schedule | null
    error: string | null
    loading: boolean
}

const initialState: ScheduleState = {
    schedule: null,
    error: null,
    loading: false,
}

export const loadSchedule = createAsyncThunk<Schedule, string, { rejectValue: string }>(
    'schedule/load',
    async (flowerId, { rejectWithValue }) => {
        try {
            const response = await fetchScheduleByFlower(flowerId)
            return response
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní rozvrhu')
        }
    },
)

export const updateSchedule = createAsyncThunk<ScheduleResponse, { schedule: Schedule }, { rejectValue: string }>(
    'schedule/updateSchedule',
    async ({ schedule }, { rejectWithValue }) => {
        try {
            const response = await updateScheduleByFlower(schedule)
            return response
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri aktualizácii rozvrhu')
        }
    },
)

const scheduleSlice = createSlice({
    name: 'schedule',
    initialState,
    reducers: {
        clearSchedule: state => {
            state.schedule = null
            state.error = null
            state.loading = false
        },
        clearError: state => {
            state.error = null
        },
        updateScheduleLocally: (state, action: PayloadAction<Schedule>) => {
            state.schedule = action.payload
            state.loading = false
            state.error = null
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadSchedule.pending, state => {
                state.error = null
                state.loading = true
            })
            .addCase(loadSchedule.fulfilled, (state, action: PayloadAction<Schedule>) => {
                state.schedule = action.payload
                state.loading = false
                state.error = null
            })
            .addCase(loadSchedule.rejected, (state, action) => {
                state.error = action.payload || 'Neznáma chyba pri načítaní rozvrhu'
                state.loading = false
            })
            .addCase(updateSchedule.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(updateSchedule.fulfilled, (state, action) => {
                if (action.payload && action.payload.data) {
                    state.schedule = action.payload.data
                }
                state.loading = false
                state.error = null
            })
            .addCase(updateSchedule.rejected, (state, action) => {
                state.error = action.payload || 'Neznáma chyba pri aktualizácii rozvrhu'
                state.loading = false
            })
    },
})

export const { clearSchedule, clearError, updateScheduleLocally } = scheduleSlice.actions
export default scheduleSlice.reducer
