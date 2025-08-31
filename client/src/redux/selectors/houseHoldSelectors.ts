import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store/rootReducer'

const selectHouseholdsState = (state: RootState) => state.households

export const selectHouseholds = createSelector(selectHouseholdsState, householdsState => householdsState.households)

export const selectHouseholdsLoading = createSelector(selectHouseholdsState, householdsState => householdsState.loading)

export const selectHouseholdsError = createSelector(selectHouseholdsState, householdsState => householdsState.error)

export const selectHouseholdById = createSelector(
    [selectHouseholds, (_, householdId: string) => householdId],
    (households, householdId) => households.find(h => h._id === householdId),
)

export const selectHouseholdName = createSelector([selectHouseholdById], household => household?.name || '')

export const selectIsHouseholdOwner = createSelector(
    [selectHouseholdById, (state: RootState) => state.auth.user?.id],
    (household, userId) => household?.owner === userId,
)

export const selectHouseholdOwner = createSelector([selectHouseholdById], household => household?.owner)

export const selectHouseholdMembers = createSelector([selectHouseholdById], household => household?.members || [])

export const selectIsHouseholdMember = createSelector(
    [selectHouseholdById, (state: RootState) => state.auth.user?.id],
    (household, userId) => household?.members.includes(userId || '') || false,
)

export const selectUserHouseholds = createSelector(
    [selectHouseholds, (state: RootState) => state.auth.user?.id],
    (households, userId) =>
        households.filter(household => household.owner === userId || household.members.includes(userId || '')),
)

export const selectOwnedHouseholds = createSelector(
    [selectHouseholds, (state: RootState) => state.auth.user?.id],
    (households, userId) => households.filter(household => household.owner === userId),
)

export const selectMemberHouseholds = createSelector(
    [selectHouseholds, (state: RootState) => state.auth.user?.id],
    (households, userId) =>
        households.filter(household => household.members.includes(userId || '') && household.owner !== userId),
)

export const selectEmptyHouseholds = createSelector(selectHouseholds, households =>
    households.filter(household => household.members.length === 0),
)

export const selectHouseholdsWithoutFlowers = createSelector(
    [selectHouseholds, (state: RootState) => state.flowers.flowers],
    (households, flowers) =>
        households.filter(household => {
            const householdFlowers = flowers.filter(flower => flower.household_id === household._id)
            return householdFlowers.length === 0
        }),
)
