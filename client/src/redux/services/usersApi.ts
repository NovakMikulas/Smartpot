import { User } from '../../types/userTypes'
import { api } from './api'

export const fetchUsers = async (): Promise<User[]> => {
    const response = await api.get<{ users: User[] }>('/users')
    return response.data.users
}

export const fetchUsersBatch = async (householdId: string): Promise<{ [key: string]: User }> => {
    const response = await api.get<{ [key: string]: User }>(`/household/members/${householdId}`)
    return response.data
}

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
    const response = await api.post<User>('/users', user)
    return response.data
}

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
}

export const updateUser = async (id: string, user: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/user/${id}`, user)
    return response.data
}
