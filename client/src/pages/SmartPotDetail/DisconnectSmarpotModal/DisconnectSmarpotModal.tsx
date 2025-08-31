import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { H5 } from '../../../components/Text/Heading/Heading'
import { selectSmartPots } from '../../../redux/selectors/smartPotSelectors'
import { updateFlowerData } from '../../../redux/slices/flowersSlice'
import { disconnectSmartPot, updateSmartPotLocally, updateSmartPotThunk } from '../../../redux/slices/smartPotsSlice'
import { AppDispatch } from '../../../redux/store/store'
import './DisconnectSmarpotModal.sass'

interface DisconnectSmarpotModalProps {
    onClose: () => void
    smartPotId: string
    householdId: string
    serialNumber: string
    type: 'flower' | 'household'
}

const DisconnectSmarpotModal: React.FC<DisconnectSmarpotModalProps> = ({
    onClose,
    smartPotId,
    householdId,
    serialNumber,
    type,
}) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const [isLoading, setIsLoading] = useState(false)
    const smartPots = useSelector(selectSmartPots)
    const smartPot = smartPots.find(pot => pot._id === smartPotId)

    const handleDisconnect = async () => {
        if (!smartPot) {
            toast.error(t('smart_pot_detail.disconnect_error'))
            return
        }
        try {
            setIsLoading(true)
            if (type === 'flower') {
                if (smartPot.active_flower_id) {
                    await dispatch(
                        updateFlowerData({
                            id: smartPot.active_flower_id,
                            flower: { serial_number: null },
                        }),
                    )
                }

                const response = await dispatch(
                    disconnectSmartPot({ serialNumber, householdId, activeFlowerId: smartPot.active_flower_id }),
                ).unwrap()

                if (response.success) {
                    dispatch(
                        updateSmartPotLocally({
                            smartPotId,
                            updates: { active_flower_id: null },
                        }),
                    )

                    toast.success(t('smart_pot_detail.disconnect_success'))
                } else {
                    toast.error(response.message || t('smart_pot_detail.disconnect_error'))
                }
            } else {
                if (smartPot.active_flower_id) {
                    await dispatch(
                        updateFlowerData({
                            id: smartPot.active_flower_id,
                            flower: { serial_number: null },
                        }),
                    )
                }

                const response = await dispatch(
                    updateSmartPotThunk({
                        serialNumber,
                        activeFlowerId: null,
                        householdId: null,
                    }),
                ).unwrap()

                if (response) {
                    dispatch(
                        updateSmartPotLocally({
                            smartPotId,
                            updates: { active_flower_id: null, household_id: null },
                        }),
                    )

                    toast.success(t('smart_pot_detail.disconnect_from_household_success'))
                }
            }
            onClose()
        } catch (error) {
            toast.error(t('smart_pot_detail.disconnect_error'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="disconnect-smartpot-container">
            <div className="disconnect-smartpot-step-container">
                <button className="disconnect-smartpot-close-button" onClick={onClose}>
                    ×
                </button>
                <H5 variant="primary">{t('smart_pot_detail.disconnect_title')}</H5>

                <div className="disconnect-smartpot-content">
                    <p className="disconnect-smartpot-message">{t('smart_pot_detail.disconnect_message')}</p>

                    <div className="disconnect-smartpot-buttons">
                        <button
                            className="disconnect-smartpot-button disconnect-smartpot-button--cancel"
                            onClick={onClose}
                            disabled={isLoading}>
                            {t('smart_pot_detail.cancel')}
                        </button>
                        <button
                            className={`disconnect-smartpot-button disconnect-smartpot-button--confirm${
                                type === 'household' ? ' disconnect-smartpot-button--danger' : ''
                            }`}
                            onClick={handleDisconnect}
                            disabled={isLoading}>
                            {isLoading
                                ? t('smart_pot_detail.disconnecting')
                                : type === 'flower'
                                ? t('smart_pot_detail.confirm_disconnect')
                                : t('smart_pot_detail.disconnect_from_household')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DisconnectSmarpotModal
