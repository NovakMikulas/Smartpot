import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../slices/authSlice'
import flowerProfilesReducer from '../slices/flowerProfilesSlice'
import flowersReducer from '../slices/flowersSlice'
import householdsReducer from '../slices/householdsSlice'
import invitesReducer from '../slices/invitesSlice'
import measurementsReducer from '../slices/measurementsSlice'
import scheduleReducer from '../slices/scheduleSlice'
import smartPotsReducer from '../slices/smartPotsSlice'
import usersReducer from '../slices/usersSlice'

const rootReducer = combineReducers({
    auth: authReducer,
    flowers: flowersReducer,
    flowerProfiles: flowerProfilesReducer,
    smartPots: smartPotsReducer,
    households: householdsReducer,
    invites: invitesReducer,
    measurements: measurementsReducer,
    schedule: scheduleReducer,
    users: usersReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer
