import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CreateHouseholdData, Household } from '../../types/householdTypes'
import {
    addHousehold,
    deleteHousehold,
    fetchHouseholds,
    inviteMember,
    leaveHousehold,
    makeOwner,
    removeMember,
    updateHousehold,
} from '../services/householdsApi'
import { logout } from './authSlice'

interface HouseholdsState {
    households: Household[]
    invites: any[]
    loading: boolean
    error: string | null
}

const initialState: HouseholdsState = {
    households: [],
    invites: [],
    loading: false,
    error: null,
}

interface ApiHouseholdResponse {
    status: string
    data: Array<Omit<Household, '_id'> & { _id?: string }>
}

export const loadHouseholds = createAsyncThunk<ApiHouseholdResponse, void, { rejectValue: string }>(
    'households/load',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchHouseholds()
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní domácností')
        }
    },
)

export const createHousehold = createAsyncThunk(
    'households/create',
    async (data: CreateHouseholdData, { rejectWithValue }) => {
        try {
            return await addHousehold(data)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri vytváraní domácnosti')
        }
    },
)

export const removeHousehold = createAsyncThunk('households/delete', async (id: string, { rejectWithValue }) => {
    try {
        await deleteHousehold(id)
        return id
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri mazaní domácnosti')
    }
})

export const updateHouseholdData = createAsyncThunk(
    'households/update',
    async ({ id, data }: { id: string; data: Partial<Household> }, { rejectWithValue }) => {
        try {
            return await updateHousehold(id, data)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri aktualizácii domácnosti')
        }
    },
)

export const leaveHouseholdAction = createAsyncThunk('households/leave', async (id: string, { rejectWithValue }) => {
    try {
        await leaveHousehold(id)
        return id
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri opustení domácnosti')
    }
})

export const inviteMemberAction = createAsyncThunk(
    'households/invite',
    async ({ householdId, userId }: { householdId: string; userId: string }, { rejectWithValue }) => {
        try {
            return await inviteMember(householdId, userId)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri pozvaní člena')
        }
    },
)

export const removeMemberAction = createAsyncThunk(
    'households/removeMember',
    async ({ householdId, memberId }: { householdId: string; memberId: string }, { rejectWithValue }) => {
        try {
            return await removeMember(householdId, memberId)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri odstránení člena')
        }
    },
)

export const makeOwnerAction = createAsyncThunk(
    'households/makeOwner',
    async ({ householdId, newOwnerId }: { householdId: string; newOwnerId: string }, { rejectWithValue }) => {
        try {
            return await makeOwner(householdId, newOwnerId)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri zmene vlastníka')
        }
    },
)

const householdsSlice = createSlice({
    name: 'households',
    initialState,
    reducers: {
        clearError: state => {
            state.error = null
        },
        resetHouseholds: () => initialState,
        updateHouseholdInvites: (
            state,
            action: PayloadAction<{ householdId: string; invitedUser: { _id: string; email: string } }>,
        ) => {
            const { householdId, invitedUser } = action.payload
            const household = state.households.find(h => h._id === householdId)
            if (household) {
                if (!household.invites) {
                    household.invites = []
                }
                household.invites.push(invitedUser._id)
            }
        },
        updateHouseholdName: (state, action: PayloadAction<{ householdId: string; newName: string }>) => {
            const { householdId, newName } = action.payload
            const household = state.households.find(h => h._id === householdId)
            if (household) {
                household.name = newName
            }
        },
        removeMemberFromState: (state, action: PayloadAction<{ householdId: string; memberId: string }>) => {
            const { householdId, memberId } = action.payload
            const household = state.households.find(h => h._id === householdId)
            if (household && household.members) {
                household.members = household.members.filter(id => id !== memberId)
            }
        },
        updateHouseholdOwner: (state, action: PayloadAction<{ householdId: string; newOwnerId: string }>) => {
            const { householdId, newOwnerId } = action.payload
            const household = state.households.find(h => h._id === householdId)
            if (household) {
                household.owner = newOwnerId
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadHouseholds.pending, state => {
                if (!state.households.length) {
                    state.loading = true
                }
                state.error = null
            })
            .addCase(loadHouseholds.fulfilled, (state, action: PayloadAction<ApiHouseholdResponse>) => {
                state.households = action.payload.data.map(data => ({ ...data, _id: data._id || '' }))
                state.loading = false
            })
            .addCase(loadHouseholds.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(createHousehold.pending, state => {
                state.error = null
            })
            .addCase(createHousehold.fulfilled, (state, action: PayloadAction<Household>) => {
                if (!action.payload._id) {
                    console.error('Received household without ID:', action.payload)
                    return
                }
                const newHousehold = {
                    ...action.payload,
                    members: action.payload.members || [],
                    invites: action.payload.invites || [],
                }
                state.households = state.households.concat(newHousehold)
            })
            .addCase(createHousehold.rejected, (state, action) => {
                state.error = action.payload as string
            })
            .addCase(removeHousehold.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(removeHousehold.fulfilled, (state, action: PayloadAction<string>) => {
                state.households = state.households.filter(household => household._id !== action.payload)
                state.loading = false
            })
            .addCase(removeHousehold.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(updateHouseholdData.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(updateHouseholdData.fulfilled, (state, action: PayloadAction<Household>) => {
                const index = state.households.findIndex(h => h._id === action.payload._id)
                if (index !== -1) {
                    state.households[index] = {
                        ...state.households[index],
                        ...action.payload,
                    }
                }
                state.loading = false
                state.error = null
            })
            .addCase(updateHouseholdData.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(leaveHouseholdAction.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(leaveHouseholdAction.fulfilled, (state, action: PayloadAction<string>) => {
                state.households = state.households.filter(household => household._id !== action.payload)
                state.loading = false
            })
            .addCase(leaveHouseholdAction.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(inviteMemberAction.pending, state => {
                state.error = null
            })
            .addCase(inviteMemberAction.fulfilled, state => {
                state.error = null
            })
            .addCase(inviteMemberAction.rejected, (state, action) => {
                state.error = action.payload as string
            })
            .addCase(removeMemberAction.pending, state => {
                state.error = null
            })
            .addCase(removeMemberAction.fulfilled, (state, action: PayloadAction<Household>) => {
                const index = state.households.findIndex(h => h._id === action.payload._id)
                if (index !== -1) {
                    state.households[index] = action.payload
                }
                state.error = null
            })
            .addCase(removeMemberAction.rejected, (state, action) => {
                state.error = action.payload as string
            })
            .addCase(makeOwnerAction.pending, state => {
                state.error = null
            })
            .addCase(makeOwnerAction.fulfilled, (state, action: PayloadAction<Household>) => {
                const index = state.households.findIndex(h => h._id === action.payload._id)
                if (index !== -1) {
                    state.households[index] = action.payload
                }
                state.error = null
            })
            .addCase(makeOwnerAction.rejected, (state, action) => {
                state.error = action.payload as string
            })
            .addCase(logout.fulfilled, () => {
                return initialState
            })
    },
})

export const {
    clearError,
    resetHouseholds,
    updateHouseholdInvites,
    removeMemberFromState,
    updateHouseholdOwner,
    updateHouseholdName,
} = householdsSlice.actions
export default householdsSlice.reducer
