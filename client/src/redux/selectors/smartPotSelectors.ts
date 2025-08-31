import { createSelector } from '@reduxjs/toolkit'
import { SmartPot } from '../../types/flowerTypes'
import { RootState } from '../store/rootReducer'


export const selectSmartPots = (state: RootState) => state.smartPots.smartPots

export const selectInactiveSmartPots = createSelector([selectSmartPots], smartPots =>
    smartPots.filter((pot: SmartPot) => pot.active_flower_id === null),
)

export const selectActiveSmartPots = createSelector([selectSmartPots], smartPots =>
    smartPots.filter((pot: SmartPot) => pot.active_flower_id !== null),
)

export const selectAllSmartPots = selectSmartPots
