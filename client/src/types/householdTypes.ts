export interface Household {
    _id: string
    name: string
    owner: string
    members: string[]
    invites: string[]
    createdAt?: string
    updatedAt?: string
}

export interface CreateHouseholdData {
    name: string
    members?: string[]
    invites?: string[]
}
