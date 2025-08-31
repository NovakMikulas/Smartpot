import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { authApi, checkAuth, loginUser, logoutUser, registerUser, UserData } from '../services/authApi'
import { RootState } from '../store/store'
import { cleanupWebSocket, clearMeasurements, stopWebSocketConnection } from './measurementsSlice'

interface AuthState {
    isAuthenticated: boolean
    user: UserData | null
    loading: boolean
    error: string | null
}

const initialState: AuthState = {
    isAuthenticated: !!localStorage.getItem('token'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    loading: false,
    error: null,
}

interface LoginCredentials {
    email: string
    password: string
}

interface RegisterCredentials {
    email: string
    password: string
    name: string
    surname: string
}

interface ChangePasswordCredentials {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
}

export const register = createAsyncThunk('auth/register', async (credentials: RegisterCredentials) => {
    await registerUser(credentials.email, credentials.password, credentials.name, credentials.surname)
})

export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials) => {
    return await loginUser(credentials.email, credentials.password)
})

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
    await logoutUser()
    dispatch(stopWebSocketConnection())
    dispatch(clearMeasurements())
    dispatch(cleanupWebSocket())
})

export const checkAuthStatus = createAsyncThunk('auth/check', async () => {
    const user = await checkAuth()
    if (!user) {
        throw new Error('Not authenticated')
    }
    return user
})

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async ({ email }: { email: string }, { rejectWithValue }) => {
        try {
            const response = await authApi.post('/forgotPassword', { email })
            return response.data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message)
        }
    },
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(register.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(register.fulfilled, state => {
                state.loading = false
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Registrácia zlyhala'
            })
            .addCase(login.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<UserData>) => {
                state.isAuthenticated = true
                state.user = action.payload
                state.loading = false
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Prihlásenie zlyhalo'
            })
            .addCase(logout.fulfilled, state => {
                state.isAuthenticated = false
                state.user = null
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.isAuthenticated = true
                state.user = action.payload
            })
            .addCase(checkAuthStatus.rejected, state => {
                state.isAuthenticated = false
                state.user = null
            })
            .addCase(forgotPassword.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(forgotPassword.fulfilled, state => {
                state.loading = false
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const selectUser = (state: RootState) => state.auth.user

export default authSlice.reducer
