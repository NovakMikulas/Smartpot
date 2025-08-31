import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../../types/userTypes'
import { fetchUsersBatch, updateUser } from '../services/usersApi'

interface UsersState {
    users: { [key: string]: User }
    loading: boolean
    error: string | null
}

const initialState: UsersState = {
    users: {},
    loading: false,
    error: null,
}

export const fetchUsers = createAsyncThunk('users/fetchBatch', async (householdId: string, { rejectWithValue }) => {
    try {
        return await fetchUsersBatch(householdId)
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní používateľov')
    }
})

export const updateUserData = createAsyncThunk(
    'users/update',
    async ({ id, data }: { id: string; data: Partial<User> }, { rejectWithValue }) => {
        try {
            return await updateUser(id, data)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri aktualizácii používateľa')
        }
    },
)

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearUsers: state => {
            state.users = {}
        },
        clearError: state => {
            state.error = null
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchUsers.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{ [key: string]: User }>) => {
                state.loading = false
                state.users = action.payload
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(updateUserData.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(updateUserData.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false
                state.users[action.payload.id] = action.payload
            })
            .addCase(updateUserData.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearUsers, clearError } = usersSlice.actions
export default usersSlice.reducer
