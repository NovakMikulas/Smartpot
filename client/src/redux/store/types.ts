import { Flower, FlowerProfile, MeasurementType, MeasurementValue, Schedule, SmartPot } from '../../types/flowerTypes'
import { Household } from '../../types/householdTypes'
import { User } from '../../types/userTypes'
import { UserData } from '../services/authApi'
import { HouseholdInvite } from '../services/invitesApi'

export interface ScheduleState {
    schedule: Schedule | null
    loading: boolean
    error: string | null
}

export interface AuthState {
    user: UserData | null
    loading: boolean
    error: string | null
}

export interface FlowersState {
    flowers: Flower[]
    selectedFlower: Flower | null
    loading: boolean
    error: string | null
}

export interface FlowerProfilesState {
    profiles: FlowerProfile[]
    loading: boolean
    error: string | null
}

export interface FlowerpotsState {
    flowerpots: any[]
    inactiveFlowerpots: any[]
    loading: boolean
    error: string | null
}

export interface HouseholdsState {
    households: Household[]
    loading: boolean
    error: string | null
}

export interface MeasurementsState {
    measurements: { [key: string]: { [key in MeasurementType]: MeasurementValue[] } }
    loading: boolean
    error: string | null
    activeWebSocketFlowerId: string | null
    webSocketStatus: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error' | 'closing'
    lastChange: {
        flowerId: string
        type: MeasurementType
        timestamp: string
    } | null
}

export interface UsersState {
    users: { [key: string]: User }
    loading: boolean
    error: string | null
}

export interface InvitesState {
    invites: HouseholdInvite[]
    loading: boolean
    error: string | null
}

export interface SmartPotsState {
    smartPots: SmartPot[]
    inactiveSmartPots: SmartPot[]
    loading: boolean
    error: string | null
    status: string
}
