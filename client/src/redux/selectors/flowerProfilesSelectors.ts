import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store/rootReducer'
import { selectFlower } from './flowerDetailSelectors'

export const selectProfiles = (state: RootState) => state.flowerProfiles.profiles

export const selectProfilesLoading = (state: RootState) => state.flowerProfiles.loading

export const selectProfilesError = (state: RootState) => state.flowerProfiles.error

export const selectProfileById = createSelector(
    [selectProfiles, (state: RootState, profileId: string) => profileId],
    (profiles, profileId) => profiles.find(profile => profile._id === profileId),
)

export const selectFlowerProfile = createSelector(
    [selectFlower, selectProfiles, (state: RootState, flowerId: string) => flowerId],
    (flower, profiles, flowerId) => {
        if (!flower || !flower.profile_id) return null
        return profiles.find(profile => profile._id === flower.profile_id)
    },
)

export const selectIsValidProfile = (state: RootState, profileId: string) => {
    const profile = selectProfileById(state, profileId)
    if (!profile) return false

    const { temperature, humidity, light } = profile
    return (
        temperature?.min != null &&
        temperature?.max != null &&
        humidity?.min != null &&
        humidity?.max != null &&
        light?.min != null &&
        light?.max != null &&
        temperature.min <= temperature.max &&
        humidity.min <= humidity.max &&
        light.min <= light.max
    )
}

export const selectGlobalProfiles = createSelector([selectProfiles], profiles =>
    profiles.filter(profile => profile.is_global === true),
)

export const selectCustomProfiles = createSelector([selectProfiles], profiles =>
    profiles.filter(profile => profile.is_global === false),
)
