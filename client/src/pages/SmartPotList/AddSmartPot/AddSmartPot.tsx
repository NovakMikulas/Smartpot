import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../../../components/Button/Button'
import { H5 } from '../../../components/Text/Heading/Heading'
import { connectNewSmartPotThunk } from '../../../redux/slices/smartPotsSlice'
import { AppDispatch } from '../../../redux/store/store'
import './AddSmartPot.sass'

interface AddSmartPotProps {
    onClose: () => void
}

const AddSmartPot: React.FC<AddSmartPotProps> = ({ onClose }) => {
    const dispatch = useDispatch<AppDispatch>()
    const { householdId } = useParams<{ householdId: string }>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [serialNumber, setSerialNumber] = useState('')
    const { t } = useTranslation()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!serialNumber.trim()) {
            toast.error(t('add_smart_pot.error.serial_required'))
            setLoading(false)
            return
        }

        if (!householdId) {
            toast.error(t('add_smart_pot.error.household_required'))
            setLoading(false)
            return
        }

        try {
            await dispatch(connectNewSmartPotThunk({ serialNumber, householdId }))
            onClose()
            toast.success(t('add_smart_pot.success'))
        } catch (err) {
            setError(t('add_smart_pot.error.general'))
            toast.error(t('add_smart_pot.error.general'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="add-smart-pot-container">
            <div className="add-smart-pot-step-container">
                <button className="add-smart-pot-close-button" onClick={onClose}>
                    ×
                </button>
                <H5 variant="primary">{t('add_smart_pot.title')}</H5>

                <form onSubmit={handleSubmit} className="add-smart-pot-form">
                    <div className="add-smart-pot-form-group">
                        <label className="add-smart-pot-input-label">{t('add_smart_pot.serial_number')}</label>
                        <input
                            type="text"
                            className="add-smart-pot-input"
                            placeholder={t('add_smart_pot.serial_number_placeholder')}
                            value={serialNumber}
                            onChange={e => setSerialNumber(e.target.value)}
                        />
                    </div>

                    {error && <div className="add-smart-pot-error-message">{error}</div>}

                    <Button
                        type="submit"
                        className="add-smart-pot-button add-smart-pot-button--default"
                        disabled={loading}>
                        {loading ? t('add_smart_pot.saving') : t('add_smart_pot.final_button')}
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default AddSmartPot
