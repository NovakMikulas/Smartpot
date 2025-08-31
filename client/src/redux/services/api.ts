import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = process.env.REACT_APP_SERVER_API
export const api = axios.create({
    baseURL: API_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
   

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    } else {
        console.warn('No token found in localStorage')
    }

    const householdId = localStorage.getItem('householdId')
    if (householdId) {
        config.headers['x-household-id'] = householdId
    }

    return config
})

api.interceptors.response.use(
    response => {
        return response
    },
    error => {
        toast.error('Error')
        if (error.response?.status === 401) {
            if (window.location.pathname !== '/login') {
                console.warn('Unauthorized - Removing token and redirecting to login')
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/login'
            } else {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                console.warn('Unauthorized on login page - Token/User removed.')
            }
        }
        return Promise.reject(error)
    },
)
