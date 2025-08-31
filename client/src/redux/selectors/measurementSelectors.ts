import { createSelector } from '@reduxjs/toolkit'
import { MeasurementType } from '../../types/flowerTypes'
import { RootState } from '../store/store'

export const selectMeasurementsState = (state: RootState) => state.measurements

export const selectMeasurementsLoading = (state: RootState) => state.measurements.loading

export const selectMeasurementsError = (state: RootState) => state.measurements.error

export const selectWebSocketStatus = (state: RootState) => state.measurements.webSocketStatus

export const selectProcessedMeasurements = (state: RootState, flowerId: string) =>
    state.measurements.processedMeasurements[flowerId]

export const selectLastChange = (state: RootState) => state.measurements.lastChange

export const selectAllMeasurements = (state: RootState) => state.measurements.measurements

export const selectMeasurementsByFlowerId = (state: RootState, flowerId: string) =>
    state.measurements.measurements[flowerId]

export const selectMeasurementsByType = (state: RootState, flowerId: string, type: MeasurementType) =>
    state.measurements.measurements[flowerId]?.[type] || []

export const selectMeasurementsForFlower = createSelector(
    [selectMeasurementsState, (_, flowerId: string) => flowerId],
    (measurementsState, flowerId) => measurementsState.measurements[flowerId] || null,
)

export const selectLatestMeasurement = (state: RootState, flowerId: string) => {
    const measurements = state.measurements.measurements[flowerId]
    if (!measurements) return null

    const latestHumidity = measurements.humidity[0]
    const latestTemperature = measurements.temperature[0]
    const latestLight = measurements.light[0]
    const latestBattery = measurements.battery?.[0]
    const latestWater = measurements.water?.[0]

    return {
        humidity: latestHumidity,
        temperature: latestTemperature,
        light: latestLight,
        battery: latestBattery,
        water: latestWater,
    }
}

export const selectFilteredMeasurements = (
    state: RootState,
    flowerId: string,
    measurementType: 'humidity' | 'temperature' | 'light' | 'battery',
    selectedDate?: string,
) => {
    const measurements = state.measurements.measurements[flowerId]
    if (!measurements) return []

    if (!selectedDate || selectedDate === '') {
        return measurements[measurementType] || []
    }

    const selectedDateObj = new Date(selectedDate)
    selectedDateObj.setHours(0, 0, 0, 0)
    const nextDay = new Date(selectedDateObj)
    nextDay.setDate(nextDay.getDate() + 1)

    return (measurements[measurementType] || []).filter(measurement => {
        const measurementDate = new Date(measurement.createdAt)
        return measurementDate >= selectedDateObj && measurementDate < nextDay
    })
}

export const selectChartData = (
    state: RootState,
    flowerId: string,
    measurementType: 'humidity' | 'temperature' | 'light' | 'battery',
    timeRange: 'day' | 'week' | 'month' | 'custom',
    customDateRange?: { from: string; to: string },
) => {
    const measurements = state.measurements.measurements[flowerId]
    if (!measurements || !measurements[measurementType]) return []

    const data = measurements[measurementType]
        .map(m => ({
            timestamp: m.createdAt,
            value: Number(m.value),
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    if (!data || data.length === 0) return data

    const now = new Date()
    let startDate = new Date(now)

    if (timeRange === 'custom' && customDateRange?.from && customDateRange?.to) {
        const fromDate = new Date(customDateRange.from)
        const toDate = new Date(customDateRange.to)
        toDate.setHours(23, 59, 59, 999)

        return data
            .filter(item => {
                const itemDate = new Date(item.timestamp)
                return itemDate >= fromDate && itemDate <= toDate
            })
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    }

    switch (timeRange) {
        case 'day':
            startDate.setHours(0, 0, 0, 0)
            break
        case 'week':
            startDate.setDate(now.getDate() - 7)
            break
        case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
    }
    startDate.setHours(0, 0, 0, 0)

    return data
        .filter(item => {
            const itemDate = new Date(item.timestamp)
            return itemDate >= startDate && itemDate <= now
        })
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export const selectMeasurementLimits = (
    state: RootState,
    flowerId: string,
    measurementType: 'humidity' | 'temperature' | 'light' | 'battery',
) => {
    if (measurementType === 'battery') {
        return { min: 30, max: 100 }
    }

    const flower = state.flowers.selectedFlower
    if (!flower) {
        const defaults = {
            humidity: { min: 0, max: 100 },
            temperature: { min: -20, max: 50 },
            light: { min: 0, max: 100 },
            battery: { min: 0, max: 100 },
        }
        return defaults[measurementType]
    }

    if (flower.profile?.[measurementType]) {
        return {
            min: flower.profile[measurementType].min,
            max: flower.profile[measurementType].max,
        }
    }

    const defaults = {
        humidity: { min: 0, max: 100 },
        temperature: { min: -20, max: 50 },
        light: { min: 0, max: 100 },
        battery: { min: 0, max: 100 },
    }
    return defaults[measurementType]
}
