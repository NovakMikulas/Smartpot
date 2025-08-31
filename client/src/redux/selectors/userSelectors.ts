import { RootState } from '../store/rootReducer'

export const selectUsers = (state: RootState) => state.users.users

export const selectUserById = (state: RootState, userId: string) => state.users.users[userId]

export const selectUsersLoading = (state: RootState) => state.users.loading

export const selectUsersError = (state: RootState) => state.users.error

export const selectAllUsers = (state: RootState) => Object.values(state.users.users)
