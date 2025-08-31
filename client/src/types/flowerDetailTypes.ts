import { MeasurementValue } from './flowerTypes'

export interface FlowerpotData {
    name: string
    status: string
    flower_avatar: string
    humidity_measurement: Array<{
        timestamp: string
        humidity: number
    }>
    temperature_measurement: Array<{
        timestamp: string
        temperature: number
    }>
    light_measurement: Array<{
        timestamp: string
        light: number
    }>
}

export interface FlowerDetailProps {
    flowerId: string
    householdId: string
}

export interface Measurements {
    humidity: MeasurementValue[]
    temperature: MeasurementValue[]
    light: MeasurementValue[]
    battery: MeasurementValue[]
    water: MeasurementValue[]
}

export type TimeRange = 'day' | 'week' | 'month' | 'custom'

export interface CustomDateRange {
    from: string
    to: string
}
