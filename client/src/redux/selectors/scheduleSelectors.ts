import { Schedule } from '../../types/flowerTypes'
import { RootState } from '../store/rootReducer'

type TimeSlot = {
    from: string | null
    to: string | null
}


export const selectSchedule = (state: RootState) => state.schedule.schedule

export const selectScheduleLoading = (state: RootState) => state.schedule.loading

export const selectScheduleError = (state: RootState) => state.schedule.error


export const selectScheduleActive = (state: RootState) => state.schedule.schedule?.active || false

export const selectScheduleForDay = (state: RootState, day: string) => {
    const schedule = state.schedule.schedule
    if (!schedule) return null
    return schedule[day as keyof Schedule] as TimeSlot
}

export const selectScheduleTimeSlots = (state: RootState, day: string) => {
    const daySchedule = selectScheduleForDay(state, day)
    if (!daySchedule) return null
    return {
        from: daySchedule.from,
        to: daySchedule.to,
    }
}

export const selectHasSchedule = (state: RootState) => !!state.schedule.schedule

export const selectIsScheduleActive = (state: RootState) => state.schedule.schedule?.active || false

export const selectScheduleDays = (state: RootState) => {
    const schedule = state.schedule.schedule
    if (!schedule) return []

    return Object.keys(schedule).filter(key => !['_id', 'flower_id', 'active', 'createdAt', 'updatedAt'].includes(key))
}
