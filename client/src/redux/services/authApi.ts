import axios from 'axios'
import { toast } from 'react-toastify'

export const authApi = axios.create({
    baseURL: process.env.REACT_APP_AUTH_API || 'http://localhost:3003/auth',
    headers: {
        'Content-Type': 'application/json',
    },
})

export interface UserData {
    id: string
    email: string
    name: string
    surname: string
}

export const registerUser = async (email: string, password: string, name: string, surname: string): Promise<void> => {
    try {
        await authApi.post('/register', { email, password, name, surname })
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Registrácia zlyhala')
    }
}

export const loginUser = async (email: string, password: string): Promise<UserData> => {
    try {
        const response = await authApi.post('/login', { email, password })
        const { token } = response.data

        const decodedToken = JSON.parse(atob(token.split('.')[1]))

        const userData = {
            id: decodedToken.user.id,
            email: decodedToken.user.email,
            name: decodedToken.user.name,
            surname: decodedToken.user.surname,
        }

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))

        return userData
    } catch (error: any) {
        console.error('Login error:', error)
        throw new Error(error.response?.data?.error || 'Neplatné prihlasovacie údaje')
    }
}

export const logoutUser = async (): Promise<void> => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
}

export const checkAuth = async (): Promise<UserData | null> => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token) {
        return null
    }

    try {
        const response = await authApi.get('/check', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.data.authorized) {
            throw new Error('Not authorized')
        }

        // If we have user data in localStorage, use it
        if (userStr) {
            const userData = JSON.parse(userStr)
            return {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                surname: userData.surname,
            }
        }

        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const binary = atob(base64)

            const bytes = new Uint8Array(binary.length)
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i)
            }

            const jsonPayload = new TextDecoder('utf-8').decode(bytes)
            const decodedToken = JSON.parse(jsonPayload)

            const userData = {
                id: decodedToken.user.id,
                email: decodedToken.user.email,
                name: decodedToken.user.name || '',
                surname: decodedToken.user.surname || '',
            }

            localStorage.setItem('user', JSON.stringify(userData))
            return userData
        } catch (decodeError) {
            console.error('Error decoding token:', decodeError)
            throw new Error('Invalid token format')
        }
    } catch (error) {
        console.error('Auth check error:', error)
        toast.error('Auth check failed')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return null
    }
}
