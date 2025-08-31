import { CreateHouseholdData, Household } from '../../types/householdTypes'
import { api } from './api'

interface ApiHouseholdResponse {
    status: string
    data: Array<Omit<Household, '_id'> & { _id?: string }>
}

interface MembersResponse {
    status: string
    data: Array<{
        _id: string
        email: string
    }>
}

interface InvitedResponse {
    status: string
    data: Array<{
        _id: string
        email: string
    }>
}

export const fetchHouseholds = async (): Promise<ApiHouseholdResponse> => {
    const response = await api.get<ApiHouseholdResponse>('/household/list')
    return {
        status: response.data.status,
        data: response.data.data.map(household => ({
            ...household,
            _id: household._id || '',
        })),
    }
}

export const addHousehold = async (data: CreateHouseholdData): Promise<Household> => {
    const response = await api.post<{ status: string; data: Household }>('/household/create', {
        name: data.name,
        members: [],
        invites: [],
    })
    return response.data.data
}

export const deleteHousehold = async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/household/delete', { data: { id } })
    return response.data
}

export const updateHousehold = async (id: string, household: Partial<Household>): Promise<Household> => {
    const response = await api.put<Household>('/household/update', { ...household, id })
    return response.data
}

export const leaveHousehold = async (id: string): Promise<void> => {
    const response = await api.put(`/household/leave`, { id })
    return response.data
}

export const inviteMember = async (householdId: string, userId: string): Promise<{ message: string }> => {
    const data = {
        id: householdId,
        invited_user_id: userId,
    }
    
    const response = await api.post<{ message: string }>('/household/invite', data)
    return response.data
}

export const removeMember = async (householdId: string, memberId: string): Promise<Household> => {
    const response = await api.put<Household>('/household/kick', {
        id: householdId,
        kicked_user_id: memberId,
    })
    return response.data
}

export const makeOwner = async (householdId: string, newOwnerId: string): Promise<Household> => {
    const response = await api.put<Household>('/household/changeOwner', {
        id: householdId,
        new_owner_id: newOwnerId,
    })
    return response.data
}

export const getMembers = async (householdId: string): Promise<MembersResponse> => {
    const response = await api.get<MembersResponse>(`/household/getMembers/${householdId}`)
    return response.data
}

export const getInvited = async (householdId: string): Promise<InvitedResponse> => {
    const response = await api.get<InvitedResponse>(`/household/getInvited/${householdId}`)
    return response.data
}
