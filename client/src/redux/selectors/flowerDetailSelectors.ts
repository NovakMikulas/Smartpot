import { createSelector } from '@reduxjs/toolkit'
import { Measurements } from '../../types/flowerDetailTypes'
import { ScheduleResponse } from '../../types/flowerTypes'
import { RootState } from '../store/rootReducer'
import { selectAllSmartPots, selectSmartPots } from './smartPotSelectors'

export const selectFlower = (state: RootState) => {
    return state.flowers.selectedFlower
}

export const selectFlowers = (state: RootState) => state.flowers.flowers

const selectAllFlowerMeasurements = (state: RootState) => state.measurements.measurements

export const selectMeasurements = createSelector(
    [selectAllFlowerMeasurements, (state: RootState, flowerId: string) => flowerId],
    (allMeasurements, flowerId): Measurements => {
        const measurements = allMeasurements[flowerId]
        return measurements || { humidity: [], temperature: [], light: [], battery: [], water: [] }
    },
)

const selectMeasurementsLoading = (state: RootState) => state.measurements.loading
const selectFlowersLoading = (state: RootState) => state.flowers.loading
const selectFlowerProfilesLoading = (state: RootState) => state.flowerProfiles.loading
const selectScheduleLoading = (state: RootState) => state.schedule.loading

const selectMeasurementsError = (state: RootState) => state.measurements.error
const selectFlowersError = (state: RootState) => state.flowers.error
const selectFlowerProfilesError = (state: RootState) => state.flowerProfiles.error
const selectScheduleError = (state: RootState) => state.schedule.error

export const selectLoading = createSelector(
    [selectMeasurementsLoading, selectFlowersLoading, selectFlowerProfilesLoading, selectScheduleLoading],
    (measLoading, flowLoading, profLoading, schedLoading) => measLoading || flowLoading || profLoading || schedLoading,
)

export const selectError = createSelector(
    [selectMeasurementsError, selectFlowersError, selectFlowerProfilesError, selectScheduleError],
    (measError, flowError, profError, schedError) => measError || flowError || profError || schedError,
)

export const selectSchedule = (state: RootState) => state.schedule.schedule as unknown as ScheduleResponse

export const selectSmartPot = createSelector(
    [selectAllSmartPots, (state: RootState, serialNumber: string) => serialNumber],
    (allPots, serialNumber) => allPots.find(pot => pot.serial_number === serialNumber),
)

export const selectConnectedSmartPot = createSelector(
    [selectSmartPots, (state: RootState, flowerId: string) => flowerId],
    (smartPots, flowerId) => smartPots.find(pot => pot.active_flower_id === flowerId),
)

export const selectLatestMeasurement = createSelector(
    [selectMeasurements, (state: RootState, flowerId: string, type: keyof Measurements) => type],
    (measurements, type) => measurements[type]?.[0] || null,
)

export const selectBatteryStatus = createSelector([selectMeasurements], measurements => {
    const latestBattery = measurements.battery?.[0]
    if (!latestBattery) return { value: null, hasWarning: false }
    const batteryValue = Number(latestBattery.value)
    return { value: batteryValue, hasWarning: batteryValue < 30 }
})

export const selectFlowerpotData = createSelector([selectFlower, selectMeasurements], (flower, measurements) => {
    if (!flower) return null

    const mapToNumber = (data: Array<{ createdAt: string; value: any }>) =>
        data.map(m => ({ timestamp: m.createdAt, value: Number(m.value) }))

    const humidity_measurement = measurements.humidity.map(m => ({
        timestamp: m.createdAt,
        humidity: Number(m.value),
    }))
    const temperature_measurement = measurements.temperature.map(m => ({
        timestamp: m.createdAt,
        temperature: Number(m.value),
    }))
    const light_measurement = measurements.light.map(m => ({
        timestamp: m.createdAt,
        light: Number(m.value),
    }))
    const battery_measurement = measurements.battery.map(m => ({
        timestamp: m.createdAt,
        battery: Number(m.value),
    }))
    const water_measurement = measurements.water.map(m => ({
        timestamp: m.createdAt,
        water: m.value,
    }))

    return {
        name: flower.name,
        status: 'active',
        flower_avatar: flower.avatar,
        humidity_measurement,
        temperature_measurement,
        light_measurement,
        battery_measurement,
        water_measurement,
    }
})
