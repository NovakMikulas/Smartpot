import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { selectUserId } from '../../redux/selectors/authSelectors'
import { selectHouseholdById, selectIsHouseholdOwner } from '../../redux/selectors/houseHoldSelectors'
import { deleteHousehold } from '../../redux/services/householdsApi'
import {
    leaveHouseholdAction,
    loadHouseholds,
    updateHouseholdData,
    updateHouseholdName,
} from '../../redux/slices/householdsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import Button from '../Button/Button'
import GradientDiv from '../GradientDiv/GradientDiv'
import { H5 } from '../Text/Heading/Heading'
import './SettingsInHousehold.sass'

interface SettingsInHouseholdProps {
    isOpen: boolean
    onClose: () => void
    householdId: string
}

const SettingsInHousehold: React.FC<SettingsInHouseholdProps> = ({ isOpen, onClose, householdId }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const [newHouseholdName, setNewHouseholdName] = useState('')
    const [loading, setLoading] = useState(false)

    const userId = useSelector(selectUserId)
    const household = useSelector((state: RootState) => selectHouseholdById(state, householdId))
    const isOwner = useSelector((state: RootState) => selectIsHouseholdOwner(state, householdId))

    const handleRenameHousehold = async () => {
        if (!newHouseholdName.trim()) {
            toast.error(t('settings.toast.enter_household_name'))
            return
        }

        setLoading(true)
        try {
            await dispatch(updateHouseholdData({ id: householdId, data: { name: newHouseholdName } })).unwrap()
            dispatch(updateHouseholdName({ householdId, newName: newHouseholdName }))
            toast.success(t('settings.toast.rename_success'))
            setNewHouseholdName('')
            onClose()
        } catch (error) {
            toast.error(t('settings.toast.rename_error'))
        } finally {
            setLoading(false)
        }
    }

    const handleLeaveHousehold = async () => {
        setLoading(true)
        try {
            navigate('/households')
            await dispatch(leaveHouseholdAction(householdId))
            toast.success(t('settings.toast.leave_success'))
            onClose()
        } catch (error) {
            toast.error(t('settings.toast.leave_error'))
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteHousehold = async () => {
        setLoading(true)
        try {
            navigate('/households')
            await deleteHousehold(householdId)
            await dispatch(loadHouseholds()).unwrap()
            toast.success(t('settings.toast.delete_success'))
            onClose()
        } catch (error) {
            toast.error(t('settings.toast.delete_error'))
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="settings-household-container">
            <GradientDiv className="settings-household-step-container">
                <H5 variant="primary">{t('settings.household_settings')}</H5>
                <button className="settings-household-close-button" onClick={onClose}>
                    ×
                </button>

                <div className="settings-household-content">
                    {isOwner && (
                        <div className="settings-household-section">
                            <h3>{t('settings.rename_household')}</h3>
                            <div className="settings-household-form-group">
                                <input
                                    type="text"
                                    className="settings-household-input"
                                    placeholder={t('settings.new_household_name')}
                                    value={newHouseholdName}
                                    onChange={e => setNewHouseholdName(e.target.value)}
                                />
                                <Button variant="default" onClick={handleRenameHousehold} disabled={loading}>
                                    {t('settings.rename')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {!isOwner && (
                        <div className="settings-household-section">
                            <h3>{t('settings.leave_household')}</h3>
                            <Button variant="default" onClick={handleLeaveHousehold} disabled={loading}>
                                {t('settings.leave')}
                            </Button>
                        </div>
                    )}

                    {isOwner && (
                        <div className="settings-household-section">
                            <h3>{t('settings.delete_household')}</h3>
                            <Button variant="warning" onClick={handleDeleteHousehold} disabled={loading}>
                                {t('settings.delete')}
                            </Button>
                        </div>
                    )}
                </div>
            </GradientDiv>
        </div>
    )
}

export default SettingsInHousehold
