import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Flower } from '../../types/flowerTypes'
import {
    addFlower,
    deleteFlower,
    detachFlower,
    fetchFlowerDetails,
    fetchFlowersByHousehold,
    transplantFlowerToSmartPot,
    transplantFlowerWithoutSmartPot,
    transplantFlowerWithSmartPot,
    updateFlower,
} from '../services/flowersApi'
import { RootState } from '../store/store'
import { logout } from './authSlice'

interface FlowersState {
    flowers: Flower[]
    selectedFlower: Flower | null
    loading: boolean
    error: string | null
}

const initialState: FlowersState = {
    flowers: [],
    selectedFlower: null,
    loading: false,
    error: null,
}

export const loadFlowers = createAsyncThunk('flowers/load', async (householdId: string) => {
    return await fetchFlowersByHousehold(householdId)
})

export const loadFlowerDetails = createAsyncThunk<{ status: string; data: Flower }, string>(
    'flowers/loadDetails',
    async (flowerId, { rejectWithValue }) => {
        try {
            const response = await fetchFlowerDetails(flowerId)
            return response
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní detailov kvetiny')
        }
    },
)

export const createFlower = createAsyncThunk(
    'flowers/create',
    async (flower: Omit<Flower, '_id'>, { rejectWithValue }) => {
        try {
            return await addFlower(flower)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri vytváraní kvetiny')
        }
    },
)

export const removeFlower = createAsyncThunk('flowers/delete', async (id: string) => {
    await deleteFlower(id)
    return id
})

export const updateFlowerData = createAsyncThunk<Flower, { id: string; flower: Partial<Flower> }>(
    'flowers/update',
    async ({ id, flower }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState
            const currentFlower = state.flowers.flowers.find(f => f._id === id)

            if (!currentFlower) {
                throw new Error('Flower not found')
            }

            const response = await updateFlower(id, flower)

            // If serial_number is explicitly set in flower updates, use that value
            // Otherwise preserve the current serial_number
            const serial_number = 'serial_number' in flower ? flower.serial_number : currentFlower.serial_number

            return {
                ...currentFlower,
                ...response,
                serial_number,
                household_id: currentFlower.household_id,
            }
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri aktualizácii kvetiny')
        }
    },
)

export const transplantFlowerToSmartPotThunk = createAsyncThunk(
    'flowers/transplantToSmartPot',
    async (
        {
            flowerId,
            targetSmartPotId,
            householdId,
        }: { flowerId: string; targetSmartPotId: string; householdId: string },
        { rejectWithValue },
    ) => {
        try {
            return await transplantFlowerToSmartPot(flowerId, targetSmartPotId, householdId)
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Chyba pri presadzovaní kvetiny do kvetináča',
            )
        }
    },
)

export const transplantFlowerWithSmartPotThunk = createAsyncThunk(
    'flowers/transplantWithSmartPot',
    async (
        {
            smartPotSerialNumber,
            targetHouseholdId,
        }: {smartPotSerialNumber: string ; targetHouseholdId: string },
        { rejectWithValue },
    ) => {
        try {
            return await transplantFlowerWithSmartPot(smartPotSerialNumber, targetHouseholdId)
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Chyba pri presadzovaní kvetiny s kvetináčom',
            )
        }
    },
)

export const transplantFlowerWithoutSmartPotThunk = createAsyncThunk(
    'flowers/transplantWithoutSmartPot',
    async (
        {
            flowerId,
            targetHouseholdId,
            assignOldSmartPot,
            newFlowerId,
        }: {
            flowerId: string
            targetHouseholdId: string
            assignOldSmartPot: boolean
            newFlowerId: string
        },
        { rejectWithValue },
    ) => {
        try {
            return await transplantFlowerWithoutSmartPot(flowerId, targetHouseholdId, assignOldSmartPot, newFlowerId)
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Chyba pri presadzovaní kvetiny bez kvetináča',
            )
        }
    },
)

export const detachFlowerFromPotThunk = createAsyncThunk<string, string, { state: RootState }>(
    'flowers/detachFromPot',
    async (flowerId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState()
            const flower = state.flowers.selectedFlower
            const response = await detachFlower(flowerId, flower?.serial_number)

            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to detach flower')
            }

            return flowerId
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to detach flower')
        }
    },
)

const flowersSlice = createSlice({
    name: 'flowers',
    initialState,
    reducers: {
        clearSelectedFlower: state => {
            state.selectedFlower = null
        },
        clearError: state => {
            state.error = null
        },
        updateFlowerLocally: (state, action: PayloadAction<{ id: string; updates: Partial<Flower> }>) => {
            const { id, updates } = action.payload

            const newState = {
                ...state,
                flowers: state.flowers.map(flower => {
                    if (flower._id === id) {
                        const updatedFlower = {
                            ...flower,
                            ...updates,
                            serial_number: flower.serial_number,
                            household_id: flower.household_id,
                        }
                        return updatedFlower
                    }
                    return flower
                }),
                selectedFlower:
                    state.selectedFlower?._id === id
                        ? {
                              ...state.selectedFlower,
                              ...updates,
                              serial_number: state.selectedFlower.serial_number,
                              household_id: state.selectedFlower.household_id,
                          }
                        : state.selectedFlower,
            }


            return newState
        },
    },
    extraReducers: builder => {
        builder
            .addCase(logout.fulfilled, () => {
                return initialState
            })
            .addCase(loadFlowers.pending, state => {
                state.loading = true
                state.error = null
                state.flowers = []
            })
            .addCase(loadFlowers.fulfilled, (state, action: PayloadAction<Flower[]>) => {
                state.flowers = action.payload.map(flower => ({
                    ...flower,
                }))
                state.loading = false
            })
            .addCase(loadFlowers.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Chyba pri načítaní kvetináčov'
            })
            .addCase(loadFlowerDetails.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(loadFlowerDetails.fulfilled, (state, action: PayloadAction<{ status: string; data: Flower }>) => {
                state.loading = false
                state.selectedFlower = action.payload.data
            })
            .addCase(loadFlowerDetails.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
                state.selectedFlower = null
            })
            .addCase(createFlower.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(createFlower.fulfilled, (state, action: PayloadAction<Flower>) => {
                state.flowers.push(action.payload)
                state.loading = false
            })
            .addCase(createFlower.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(removeFlower.fulfilled, (state, action: PayloadAction<string>) => {
                state.flowers = state.flowers.filter(flower => flower._id !== action.payload)
                if (state.selectedFlower?._id === action.payload) {
                    state.selectedFlower = null
                }
            })
            .addCase(updateFlowerData.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(updateFlowerData.fulfilled, (state, action: PayloadAction<Flower>) => {
                const index = state.flowers.findIndex(flower => flower._id === action.payload._id)
                if (index !== -1) {
                    state.flowers[index] = action.payload
                }
                if (state.selectedFlower?._id === action.payload._id) {
                    state.selectedFlower = action.payload
                }
                state.loading = false
            })
            .addCase(updateFlowerData.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(transplantFlowerToSmartPotThunk.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(transplantFlowerToSmartPotThunk.fulfilled, (state, action: PayloadAction<Flower>) => {
                const index = state.flowers.findIndex(flower => flower._id === action.payload._id)
                if (index !== -1) {
                    state.flowers[index] = action.payload
                }
                if (state.selectedFlower?._id === action.payload._id) {
                    state.selectedFlower = action.payload
                }
                state.loading = false
            })
            .addCase(transplantFlowerToSmartPotThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(transplantFlowerWithSmartPotThunk.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(transplantFlowerWithSmartPotThunk.fulfilled, (state, action: PayloadAction<Flower>) => {
                const index = state.flowers.findIndex(flower => flower._id === action.payload._id)
                if (index !== -1) {
                    state.flowers[index] = action.payload
                }
                if (state.selectedFlower?._id === action.payload._id) {
                    state.selectedFlower = action.payload
                }
                state.loading = false
            })
            .addCase(transplantFlowerWithSmartPotThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(transplantFlowerWithoutSmartPotThunk.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(transplantFlowerWithoutSmartPotThunk.fulfilled, (state, action: PayloadAction<Flower>) => {
                const index = state.flowers.findIndex(flower => flower._id === action.payload._id)
                if (index !== -1) {
                    state.flowers[index] = action.payload
                }
                if (state.selectedFlower?._id === action.payload._id) {
                    state.selectedFlower = action.payload
                }
                state.loading = false
            })
            .addCase(transplantFlowerWithoutSmartPotThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(detachFlowerFromPotThunk.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(detachFlowerFromPotThunk.fulfilled, (state, action: PayloadAction<string>) => {
                const index = state.flowers.findIndex(flower => flower._id === action.payload)
                if (index !== -1) {
                    state.flowers[index] = { ...state.flowers[index], serial_number: null }
                }
                if (state.selectedFlower?._id === action.payload) {
                    state.selectedFlower = { ...state.selectedFlower, serial_number: null }
                }
                state.loading = false
                state.error = null
            })
            .addCase(detachFlowerFromPotThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearSelectedFlower, clearError, updateFlowerLocally } = flowersSlice.actions
export default flowersSlice.reducer
