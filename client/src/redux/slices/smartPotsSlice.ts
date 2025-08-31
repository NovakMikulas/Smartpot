import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SmartPot } from '../../types/flowerTypes'
import { api } from '../services/api'
import {
    connectNewSmartPot,
    disconnectSmartPot as disconnectSmartPotApi,
    loadSmartPots,
    transplantSmartPotToFlower,
    transplantSmartPotWithFlower,
    transplantSmartPotWithoutFlower,
    updateSmartPot as updateSmartPotApi,
} from '../services/smartPotsApi'
import { RootState } from '../store/rootReducer'

interface SmartPotsState {
    smartPots: SmartPot[]
    inactiveSmartPots: SmartPot[]
    loading: boolean
    error: string | null
    status: string
}

const initialState: SmartPotsState = {
    smartPots: [],
    inactiveSmartPots: [],
    loading: false,
    error: null,
    status: 'idle',
}

export const fetchSmartPots = createAsyncThunk(
    'smartPots/fetchAll',
    async (householdId: string, { rejectWithValue }) => {
        try {
            const response = await loadSmartPots(householdId)
            return response
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní smart potov')
        }
    },
)

export const disconnectSmartPot = createAsyncThunk(
    'smartPots/disconnectSmartPot',
    async (
        {
            serialNumber,
            householdId,
            activeFlowerId,
        }: { serialNumber: string; householdId: string; activeFlowerId: string | null },
        { dispatch },
    ) => {
        try {
            const response = await disconnectSmartPotApi(serialNumber, householdId, activeFlowerId)
            return response
        } catch (error) {
            throw error
        }
    },
)

export const fetchInactiveSmartPots = createAsyncThunk<SmartPot[], string>(
    'smartPots/fetchInactive',
    async (householdId, { rejectWithValue }) => {
        try {
            const response = await loadSmartPots(householdId)
            return response.filter(pot => pot.active_flower_id === null)
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Chyba pri načítaní neaktívnych smart potov',
            )
        }
    },
)

export const transplantSmartPotToFlowerThunk = createAsyncThunk(
    'smartPots/transplantToFlower',
    async ({ smartPotId, targetFlowerId }: { smartPotId: string; targetFlowerId: string }, { rejectWithValue }) => {
        try {
            const result = await transplantSmartPotToFlower(smartPotId, targetFlowerId)
            if (!result.success) {
                return rejectWithValue(result.message || 'Chyba pri presadzovaní kvetináča k kvetine')
            }
            return result
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Chyba pri presadzovaní kvetináča k kvetine',
            )
        }
    },
)

export const transplantSmartPotWithFlowerThunk = createAsyncThunk(
    'smartPots/transplantSmartPotWithFlower',
    async (
        {
            smartPotSerialNumber,
            targetHouseholdId
        }: { smartPotSerialNumber: string ; targetHouseholdId: string },
        { rejectWithValue },
    ) => {
        try {
            await transplantSmartPotWithFlower(smartPotSerialNumber , targetHouseholdId)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri presádzaní smartpotu s kvetinou')
        }
    },
)

export const transplantSmartPotWithoutFlowerThunk = createAsyncThunk(
    'smartPots/transplantWithoutFlower',
    async (
        {
            smartPotId,
            targetHouseholdId,
            assignOldFlower,
            oldFlowerId,
            oldHouseholdId,
            selectedNewSmartPotId,
        }: {
            smartPotId: string
            targetHouseholdId: string
            assignOldFlower: boolean
            oldFlowerId: string
            oldHouseholdId: string
            selectedNewSmartPotId: string
        },
        { rejectWithValue },
    ) => {
        try {
            const currentSmartPotResponse = await api.get<{ status: string; data: SmartPot }>(
                `/smart-pot/get/${smartPotId}?household_id=${oldHouseholdId}`,
            )
            const currentSmartPot = currentSmartPotResponse.data.data

            if (!currentSmartPot.serial_number) {
                throw new Error('Current smart pot has no serial number')
            }

            if (!currentSmartPot.household_id) {
                throw new Error('Current smart pot has no household ID')
            }

            let newSmartPotSerialNumber = null
            if (assignOldFlower) {
                const newSmartPotResponse = await api.get<{ status: string; data: SmartPot }>(
                    `/smart-pot/get/${selectedNewSmartPotId}?household_id=${oldHouseholdId}`,
                )
                const newSmartPot = newSmartPotResponse.data.data

                if (!newSmartPot.serial_number) {
                    throw new Error('New smart pot has no serial number')
                }
                newSmartPotSerialNumber = newSmartPot.serial_number
            }

            return await transplantSmartPotWithoutFlower(
                currentSmartPot.serial_number,
                newSmartPotSerialNumber,
                targetHouseholdId,
                oldHouseholdId,
                assignOldFlower,
                oldFlowerId,
            )
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Chyba pri presadzovaní kvetináča bez kvetiny',
            )
        }
    },
)

export const updateSmartPotThunk = createAsyncThunk(
    'smartPots/updateSmartPot',
    async (
        {
            serialNumber,
            activeFlowerId,
            householdId,
        }: { serialNumber: string | null; activeFlowerId: string | null; householdId: string | null },
        { rejectWithValue },
    ) => {
        try {
            return await updateSmartPotApi(serialNumber ?? null, {
                active_flower_id: activeFlowerId,
                household_id: householdId,
            })
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri update smartpotu')
        }
    },
)

export const connectNewSmartPotThunk = createAsyncThunk(
    'smartPots/connectNew',
    async ({ serialNumber, householdId }: { serialNumber: string; householdId: string }, { rejectWithValue }) => {
        try {
            const result = await connectNewSmartPot(serialNumber, householdId)
            return result
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri pripájaní smart potu')
        }
    },
)

const smartPotsSlice = createSlice({
    name: 'smartPots',
    initialState,
    reducers: {
        clearError: state => {
            state.error = null
        },
        clearSmartPots: state => {
            state.smartPots = []
            state.inactiveSmartPots = []
            state.error = null
        },
        updateSmartPotLocally: (
            state,
            action: PayloadAction<{
                smartPotId: string
                updates: Partial<SmartPot>
            }>,
        ) => {
            const { smartPotId, updates } = action.payload
            const index = state.smartPots.findIndex(pot => pot._id === smartPotId)
            if (index !== -1) {
                state.smartPots[index] = { ...state.smartPots[index], ...updates }
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchSmartPots.pending, state => {
                state.loading = true
                state.error = null
                state.smartPots = []
            })
            .addCase(fetchSmartPots.fulfilled, (state, action: PayloadAction<SmartPot[]>) => {
                state.smartPots = action.payload
                state.loading = false
            })
            .addCase(fetchSmartPots.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            .addCase(disconnectSmartPot.pending, state => {
                state.status = 'loading'
            })
            .addCase(disconnectSmartPot.fulfilled, (state, action) => {
                state.status = 'succeeded'
                if (action.payload.data) {
                    const index = state.smartPots.findIndex(
                        pot => pot.serial_number === action.payload.data?.serial_number,
                    )
                    if (index !== -1) {
                        state.smartPots[index] = action.payload.data
                    }
                }
            })
            .addCase(disconnectSmartPot.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || 'Failed to disconnect smart pot'
            })

            .addCase(fetchInactiveSmartPots.pending, state => {
                state.loading = true
                state.error = null
                state.inactiveSmartPots = []
            })
            .addCase(fetchInactiveSmartPots.fulfilled, (state, action: PayloadAction<SmartPot[]>) => {
                state.inactiveSmartPots = action.payload
                state.loading = false
            })
            .addCase(fetchInactiveSmartPots.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            .addCase(transplantSmartPotToFlowerThunk.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(transplantSmartPotToFlowerThunk.fulfilled, (state, action) => {
                if (action.payload.data) {
                    const index = state.smartPots.findIndex(pot => pot._id === action.payload.data?._id)
                    if (index !== -1) {
                        state.smartPots[index] = action.payload.data
                    } else {
                        state.smartPots.push(action.payload.data)
                    }
                }
                state.loading = false
                state.error = null
            })
            .addCase(transplantSmartPotToFlowerThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            .addCase(transplantSmartPotWithFlowerThunk.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(transplantSmartPotWithFlowerThunk.fulfilled, state => {
                state.loading = false
            })
            .addCase(transplantSmartPotWithFlowerThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            .addCase(transplantSmartPotWithoutFlowerThunk.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(transplantSmartPotWithoutFlowerThunk.fulfilled, (state, action) => {
                if (action.payload.data) {
                    const index = state.smartPots.findIndex(pot => pot._id === action.payload.data?._id)
                    if (index !== -1) {
                        state.smartPots[index] = action.payload.data
                    }
                }
                state.loading = false
            })
            .addCase(transplantSmartPotWithoutFlowerThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(updateSmartPotThunk.fulfilled, (state, action: PayloadAction<SmartPot>) => {
                const index = state.smartPots.findIndex(pot => pot.serial_number === action.payload.serial_number)
                if (index !== -1) {
                    state.smartPots[index] = action.payload
                }
                state.loading = false
            })
            .addCase(updateSmartPotThunk.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(updateSmartPotThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(connectNewSmartPotThunk.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(connectNewSmartPotThunk.fulfilled, (state, action: PayloadAction<SmartPot>) => {
                state.smartPots.push(action.payload)
                state.loading = false
                state.error = null
            })
            .addCase(connectNewSmartPotThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearError, clearSmartPots, updateSmartPotLocally } = smartPotsSlice.actions

export const selectInactiveSmartPots = (state: RootState) => state.smartPots.inactiveSmartPots

export const selectActiveSmartPots = (state: RootState) =>
    state.smartPots.smartPots.filter((pot: SmartPot) => pot.active_flower_id !== null)

export default smartPotsSlice.reducer
