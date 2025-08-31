import { createAction, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MeasurementType, MeasurementValue } from '../../types/flowerTypes'
import { api } from '../services/api'
import { getMeasurementsForFlower } from '../services/measurmentApi'
import { webSocketService } from '../services/websocketService'
import { AppDispatch, RootState } from '../store/store'

const WebSocketStates = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
} as const

export type WebSocketConnectionStatus =
    | 'idle'
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'disconnected'
    | 'error'
    | 'closing'

export interface MeasurementsByType {
    water: MeasurementValue[]
    temperature: MeasurementValue[]
    light: MeasurementValue[]
    humidity: MeasurementValue[]
    battery: MeasurementValue[]
    soil: MeasurementValue[]
}

export interface Measurements extends MeasurementsByType {
    lastChange: string
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

const initialState: MeasurementsState = {
    measurements: {},
    loading: false,
    error: null,
    webSocketStatus: 'idle',
    lastChange: null,
    processedMeasurements: {},
}

const createEmptyMeasurements = (): Measurements => ({
    water: [],
    temperature: [],
    light: [],
    humidity: [],
    battery: [],
    soil: [],
    lastChange: new Date().toISOString(),
})

export const startWebSocketConnectionThunk = createAsyncThunk(
    'measurements/startWebSocketConnection',
    async (_, { dispatch, getState }) => {
        const state = getState() as RootState
        const measurementsState = state.measurements

        if (['idle', 'disconnected', 'error', 'closing'].includes(measurementsState.webSocketStatus)) {
            dispatch(measurementsSlice.actions.setWebSocketStatus('connecting'))
            webSocketService.connect()
        } else if (measurementsState.webSocketStatus === 'connected') {
        }
    },
)

export const stopWebSocketConnectionThunk = createAsyncThunk(
    'measurements/stopWebSocketConnection',
    async (_, { getState }) => {
        const state = getState() as RootState
        const { webSocketStatus } = state.measurements

        try {
            webSocketService.prepareForIntentionalDisconnect()
            webSocketService.disconnect()
            return true
        } catch (error) {
            console.error('WebSocket: Error during cleanup:', error)
            return false
        }
    },
)

export const fetchMeasurementsForFlower = createAsyncThunk(
    'measurements/fetchForFlower',
    async (
        {
            flowerId,
            householdId,
            dateFrom,
            dateTo,
        }: { flowerId: string; householdId: string; dateFrom: string; dateTo: string },
        { rejectWithValue },
    ) => {
        try {
            const formatDate = (date: Date) => {
                return date.toISOString().split('T')[0]
            }

            const fromDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 24 * 60 * 60 * 1000)
            const toDate = dateTo ? new Date(dateTo) : new Date()

            const formattedDateFrom = formatDate(fromDate)
            const formattedDateTo = formatDate(toDate)

            const types = ['water', 'humidity', 'temperature', 'light', 'battery', 'soil'] as const
            const results = await Promise.all(
                types.map(async type => {
                    try {
                        return await getMeasurementsForFlower(flowerId, formattedDateFrom, formattedDateTo, type)
                    } catch (error) {
                        console.error(`Error fetching ${type} measurements:`, error)
                        return { data: [] }
                    }
                }),
            )

            const measurementsByType = {
                water: [],
                temperature: [],
                light: [],
                humidity: [],
                battery: [],
                soil: [],
            } as MeasurementsByType

            results.forEach((result, index) => {
                if (result.data?.length > 0) {
                    measurementsByType[types[index]] = result.data
                }
            })

            return {
                flowerId,
                measurements: measurementsByType,
            }
        } catch (error) {
            console.error('Error in fetchMeasurementsForFlower:', error)
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní meraní')
        }
    },
)

export const fetchLatestMeasurements = createAsyncThunk(
    'measurements/fetchLatest',
    async ({ flowerId, householdId }: { flowerId: string; householdId: string }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/measurement/getLatest/${flowerId}`)
            return response.data.data
        } catch (error: any) {
            if (error.response?.status === 404) {
                return {
                    water: null,
                    humidity: null,
                    light: null,
                    temperature: null,
                    battery: null,
                }
            }
            return rejectWithValue(error.message || 'Chyba pri načítaní meraní')
        }
    },
)

export const setActiveWebSocketFlowerId = createAction<string | null>('measurements/setActiveWebSocketFlowerId')

export const measurementsSlice = createSlice({
    name: 'measurements',
    initialState,
    reducers: {
        setWebSocketStatus: (state, action: PayloadAction<WebSocketConnectionStatus>) => {
            state.webSocketStatus = action.payload
        },
        clearMeasurements: state => {
            state.measurements = {}
            state.webSocketStatus = 'idle'
            state.error = null
            state.loading = false
            state.lastChange = null
        },
        setMeasurements: (state, action: PayloadAction<{ flowerId: string; measurements: Measurements }>) => {
            const { flowerId, measurements } = action.payload
            const initialMeasurements: Measurements = {
                water: [],
                temperature: [],
                light: [],
                humidity: [],
                battery: [],
                soil: [],
                lastChange: new Date().toISOString(),
            }

            if (!state.measurements[flowerId]) {
                state.measurements[flowerId] = initialMeasurements
            }

            Object.entries(measurements).forEach(([type, values]) => {
                if (type in state.measurements[flowerId]) {
                    state.measurements[flowerId][type as keyof Omit<Measurements, 'lastChange'>] = values
                }
            })

            state.measurements[flowerId].lastChange = new Date().toISOString()
        },
        addMeasurement: (state, action: PayloadAction<{ flowerId: string; measurement: MeasurementValue }>) => {
            const { flowerId, measurement } = action.payload

            if (!state.measurements[flowerId]) {
                state.measurements[flowerId] = createEmptyMeasurements()
            }

            if (!state.processedMeasurements[flowerId]) {
                state.processedMeasurements[flowerId] = createEmptyMeasurements()
            }

            const measurementType = measurement.typeOfData as keyof MeasurementsByType
            const measurements = state.measurements[flowerId][measurementType]
            const processedMeasurements = state.processedMeasurements[flowerId][measurementType]

            const existingIndex = measurements.findIndex(m => m._id === measurement._id)
            if (existingIndex !== -1) {
                measurements.splice(existingIndex, 1)
                processedMeasurements.splice(existingIndex, 1)
            }

            measurements.unshift(measurement)
            processedMeasurements.unshift(measurement)

            state.measurements[flowerId].lastChange = new Date().toISOString()
            state.processedMeasurements[flowerId].lastChange = new Date().toISOString()

            state.lastChange = {
                flowerId,
                type: measurement.typeOfData,
                timestamp: new Date().toISOString(),
            }
        },
        updateMeasurement: (state, action: PayloadAction<{ flowerId: string; measurement: MeasurementValue }>) => {
            const { flowerId, measurement } = action.payload
            const validTypes = ['water', 'temperature', 'light', 'humidity', 'battery', 'soil'] as const
            type ValidType = (typeof validTypes)[number]

            if (
                state.measurements[flowerId] &&
                measurement.typeOfData &&
                validTypes.includes(measurement.typeOfData as ValidType)
            ) {
                const measurementType = measurement.typeOfData as ValidType
                const index = state.measurements[flowerId][measurementType].findIndex(
                    (m: MeasurementValue) => m._id === measurement._id,
                )
                if (index !== -1) {
                    state.measurements[flowerId][measurementType][index] = measurement
                    state.measurements[flowerId].lastChange = new Date().toISOString()
                }
            }
        },
        removeMeasurement: (
            state,
            action: PayloadAction<{ flowerId: string; type: MeasurementType; measurementId: string }>,
        ) => {
            const { flowerId, type, measurementId } = action.payload
            const validTypes = ['water', 'temperature', 'light', 'humidity', 'battery', 'soil'] as const
            type ValidType = (typeof validTypes)[number]

            if (state.measurements[flowerId] && validTypes.includes(type as ValidType)) {
                const measurementType = type as ValidType
                state.measurements[flowerId][measurementType] = state.measurements[flowerId][measurementType].filter(
                    (m: MeasurementValue) => m._id !== measurementId,
                )
                state.measurements[flowerId].lastChange = new Date().toISOString()
            }
        },
        clearActiveWebSocketFlowerId: state => {},
    },
    extraReducers: builder => {
        builder
            .addCase(fetchMeasurementsForFlower.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchMeasurementsForFlower.fulfilled, (state, action) => {
                state.loading = false
                const { flowerId, measurements: newMeasurementsByType } = action.payload

                if (!state.measurements[flowerId]) {
                    state.measurements[flowerId] = {
                        water: [],
                        temperature: [],
                        light: [],
                        humidity: [],
                        battery: [],
                        soil: [],
                        lastChange: new Date().toISOString(),
                    }
                }

                if (!state.processedMeasurements[flowerId]) {
                    state.processedMeasurements[flowerId] = {
                        water: [],
                        temperature: [],
                        light: [],
                        humidity: [],
                        battery: [],
                        soil: [],
                        lastChange: new Date().toISOString(),
                    }
                }

                const existingMeasurements = state.measurements[flowerId]
                const existingProcessedMeasurements = state.processedMeasurements[flowerId]
                let changed = false

                const validTypes = ['water', 'temperature', 'light', 'humidity', 'battery'] as const
                type ValidType = (typeof validTypes)[number]

                Object.keys(newMeasurementsByType).forEach(type => {
                    if (!validTypes.includes(type as ValidType)) return

                    const measurementType = type as ValidType
                    const existing = existingMeasurements[measurementType] || []
                    const newlyFetched = newMeasurementsByType[measurementType] || []

                    if (newlyFetched.length > 0) {
                        changed = true

                        const uniqueMeasurementsMap = new Map()

                        existing.forEach(m => {
                            uniqueMeasurementsMap.set(m._id, m)
                        })

                        newlyFetched.forEach(m => {
                            uniqueMeasurementsMap.set(m._id, m)
                        })

                        const uniqueMeasurements = Array.from(uniqueMeasurementsMap.values()).sort(
                            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                        )

                        existingMeasurements[measurementType] = uniqueMeasurements
                        existingProcessedMeasurements[measurementType] = uniqueMeasurements
                    }
                })

                if (changed) {
                    const timestamp = new Date().toISOString()
                    existingMeasurements.lastChange = timestamp
                    existingProcessedMeasurements.lastChange = timestamp
                }
            })
            .addCase(fetchMeasurementsForFlower.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(fetchLatestMeasurements.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLatestMeasurements.fulfilled, (state, action) => {
                state.loading = false
                const flowerId = action.meta.arg.flowerId
                if (!state.measurements[flowerId]) {
                    state.measurements[flowerId] = {
                        water: [],
                        temperature: [],
                        light: [],
                        humidity: [],
                        battery: [],
                        soil: [],
                        lastChange: new Date().toISOString(),
                    }
                }

                let changed = false
                if (action.payload.water) {
                    state.measurements[flowerId].water.unshift(action.payload.water)
                    changed = true
                }
                if (action.payload.humidity) {
                    state.measurements[flowerId].humidity.unshift(action.payload.humidity)
                    changed = true
                }
                if (action.payload.light) {
                    state.measurements[flowerId].light.unshift(action.payload.light)
                    changed = true
                }
                if (action.payload.temperature) {
                    state.measurements[flowerId].temperature.unshift(action.payload.temperature)
                    changed = true
                }
                if (action.payload.battery) {
                    state.measurements[flowerId].battery.unshift(action.payload.battery)
                    changed = true
                }

                if (changed) {
                    state.measurements[flowerId].lastChange = new Date().toISOString()
                }
            })
            .addCase(fetchLatestMeasurements.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Chyba pri načítaní meraní'
            })
            .addCase(stopWebSocketConnectionThunk.fulfilled, state => {
                state.webSocketStatus = 'idle'
            })
            .addCase(cleanupWebSocket, state => {
                state.webSocketStatus = 'idle'
                state.measurements = {}
                state.processedMeasurements = {}
                state.lastChange = null
            })
            .addCase(setActiveWebSocketFlowerId, (state, action) => {})
    },
})

export const {
    clearMeasurements,
    setMeasurements,
    addMeasurement,
    updateMeasurement,
    removeMeasurement,
    clearActiveWebSocketFlowerId,
    setWebSocketStatus,
} = measurementsSlice.actions

export const cleanupWebSocket = createAction('measurements/cleanupWebSocket')

export const initializeWebSocket = (dispatch: AppDispatch) => {
    webSocketService.setDispatch(dispatch)
}

export default measurementsSlice.reducer

export {
    startWebSocketConnectionThunk as startWebSocketConnection,
    stopWebSocketConnectionThunk as stopWebSocketConnection,
}
