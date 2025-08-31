import { RootState } from '../store/rootReducer'

export const selectUser = (state: RootState) => state.auth.user

export const selectAuthLoading = (state: RootState) => state.auth.loading

export const selectAuthError = (state: RootState) => state.auth.error

export const selectUserId = (state: RootState) => state.auth.user?.id

export const selectUserFullName = (state: RootState) => {
    const user = state.auth.user
    if (!user) return ''

    try {
        const name = decodeURIComponent(escape(user.name || ''))
        const surname = decodeURIComponent(escape(user.surname || ''))
        return `${name} ${surname}`
    } catch (e) {
        return `${user.name} ${user.surname}`
    }
}

export const selectIsAuthenticated = (state: RootState) => !!state.auth.user
