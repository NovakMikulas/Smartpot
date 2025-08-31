import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HouseholdInvite, invitesApi } from '../services/invitesApi'

interface InvitesState {
    invites: HouseholdInvite[]
    loading: boolean
    error: string | null
}

const initialState: InvitesState = {
    invites: [],
    loading: false,
    error: null,
}

export const loadInvites = createAsyncThunk('invites/load', async (_, { rejectWithValue }) => {
    try {
        return await invitesApi.getInvites()
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní pozvánok')
    }
})

export const acceptInvite = createAsyncThunk('invites/accept', async (id: string, { rejectWithValue }) => {
    try {
        await invitesApi.acceptInvite(id)
        return id
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri prijatí pozvánky')
    }
})

export const rejectInvite = createAsyncThunk('invites/reject', async (id: string, { rejectWithValue }) => {
    try {
        await invitesApi.rejectInvite(id)
        return id
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri zamietnutí pozvánky')
    }
})

const invitesSlice = createSlice({
    name: 'invites',
    initialState,
    reducers: {
        clearError: state => {
            state.error = null
        },
        addInvite: (state, action: PayloadAction<HouseholdInvite>) => {
            const exists = state.invites.some(invite => invite._id === action.payload._id)
            if (!exists) {
                state.invites.push(action.payload)
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadInvites.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(loadInvites.fulfilled, (state, action: PayloadAction<HouseholdInvite[]>) => {
                state.invites = action.payload
                state.loading = false
            })
            .addCase(loadInvites.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(acceptInvite.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(acceptInvite.fulfilled, (state, action: PayloadAction<string>) => {
                state.invites = state.invites.filter(invite => invite._id !== action.payload)
                state.loading = false
            })
            .addCase(acceptInvite.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(rejectInvite.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(rejectInvite.fulfilled, (state, action: PayloadAction<string>) => {
                state.invites = state.invites.filter(invite => invite._id !== action.payload)
                state.loading = false
            })
            .addCase(rejectInvite.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearError, addInvite } = invitesSlice.actions
export default invitesSlice.reducer
