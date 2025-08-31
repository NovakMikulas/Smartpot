import { RootState } from '../store/rootReducer'

export const selectInvites = (state: RootState) => state.invites.invites

export const selectInvitesLoading = (state: RootState) => state.invites.loading

export const selectInvitesError = (state: RootState) => state.invites.error
