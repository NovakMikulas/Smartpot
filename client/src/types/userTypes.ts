export interface User {
    id: string
    name: string
    surname: string
    email: string
    phone: string
    password: string
    role?: 'owner' | 'member'
}
