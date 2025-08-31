import { WebSocketConnectionStatus } from '../redux/slices/measurementsSlice'

export interface BaseMeasurement {
    _id: string
    flower_id: string
    createdAt: string
    updatedAt: string
    type: MeasurementType
}

export interface WaterMeasurement extends BaseMeasurement {
    value: string
    type: 'water'
}

export interface BatteryMeasurement extends BaseMeasurement {
    value: number
    type: 'battery'
}

export interface TemperatureMeasurement extends BaseMeasurement {
    value: number
    type: 'temperature'
}

export interface LightMeasurement extends BaseMeasurement {
    value: number
    type: 'light'
}

export interface HumidityMeasurement extends BaseMeasurement {
    value: number
    type: 'humidity'
}

export interface MeasurementValue {
    _id?: string
    typeOfData: 'water' | 'temperature' | 'light' | 'humidity' | 'battery' | 'soil'
    value: number | string
    createdAt: string
    updatedAt: string
    flower_id?: string
}

export type MeasurementType = 'water' | 'temperature' | 'light' | 'humidity' | 'battery' | 'soil'

export interface Flower {
    _id: string
    name: string
    household_id: string
    avatar?: string
    serial_number?: string | null
    profile_id: string | null
    profile?: {
        humidity: { min: number; max: number }
        temperature: { min: number; max: number }
        light: { min: number; max: number }
    }
}

export interface FlowerProfile {
    _id: string
    name: string
    is_global: boolean
    temperature: {
        min: number
        max: number
    }
    humidity: {
        min: number
        max: number
    }
    light: {
        min: number
        max: number
    }
    created_at: string
    updated_at: string
}

export interface Schedule {
    _id?: string
    id?: string
    flower_id: string
    active: boolean
    monday: { from: string | null; to: string | null }
    tuesday: { from: string | null; to: string | null }
    wednesday: { from: string | null; to: string | null }
    thursday: { from: string | null; to: string | null }
    friday: { from: string | null; to: string | null }
    saturday: { from: string | null; to: string | null }
    sunday: { from: string | null; to: string | null }
    createdAt?: string
    updatedAt?: string
}

export interface ScheduleResponse {
    status: string
    data: Schedule
}

export interface SmartPot {
    _id: string
    serial_number: string
    household_id: string | null
    active_flower_id: string | null
    createdAt: string
    updatedAt: string
}

export interface Measurements {
    water: MeasurementValue[]
    temperature: MeasurementValue[]
    light: MeasurementValue[]
    humidity: MeasurementValue[]
    battery: MeasurementValue[]
}

export interface MeasurementsState {
    measurements: {
        [flowerId: string]: Measurements
    }
    loading: boolean
    error: string | null
    webSocketStatus: WebSocketConnectionStatus
    lastChange: {
        flowerId: string
        type: MeasurementType
        timestamp: string
    } | null
    processedMeasurements: {
        [flowerId: string]: Measurements
    }
}
