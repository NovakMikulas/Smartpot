import React, { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Button from '../../../components/Button/Button'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H5 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
import { selectHouseholds } from '../../../redux/selectors/houseHoldSelectors'
import { createHousehold } from '../../../redux/slices/householdsSlice'
import { AppDispatch } from '../../../redux/store/store'
import './CreateHousehold.sass'

interface CreateHouseholdProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

const CreateHouseholdForm: React.FC<{
    householdName: string
    error: string | null
    loading: boolean
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSubmit: (e?: React.FormEvent) => void
}> = memo(({ householdName, error, loading, onInputChange, onSubmit }) => {
    const { t } = useTranslation() as { t: TranslationFunction }

    return (
        <form onSubmit={onSubmit} className="modal-create-household-form">
            <div className="modal-create-household-form-group">
                <input
                    type="text"
                    className="modal-create-household-input"
                    placeholder={t('create_household.input')}
                    value={householdName}
                    onChange={onInputChange}
                />
            </div>

            {error && <div className="modal-create-household-error-message">{error}</div>}

            <Button variant="default" onClick={onSubmit} disabled={loading}>
                {loading ? t('create_household.saving') : t('create_household.button')}
            </Button>
        </form>
    )
})

CreateHouseholdForm.displayName = 'CreateHouseholdForm'

const CreateHousehold: React.FC<CreateHouseholdProps> = memo(({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const [householdName, setHouseholdName] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const households = useSelector(selectHouseholds)

    const handleSubmit = useCallback(
        async (e?: React.FormEvent) => {
            if (e) {
                e.preventDefault()
            }
            setError(null)
            setLoading(true)

            if (!householdName.trim()) {
                setError(t('create_household.error.empty_name'))
                setLoading(false)
                return
            }

            const isDuplicate = households.some(
                household => household.name.toLowerCase() === householdName.trim().toLowerCase(),
            )
            if (isDuplicate) {
                setError(t('create_household.error.duplicate_name'))
                toast.error(t('create_household.error.duplicate_name'))
                setLoading(false)
                return
            }

            try {
                const result = await dispatch(
                    createHousehold({
                        name: householdName,
                        members: [],
                        invites: [],
                    }),
                ).unwrap()

                if (result && result._id) {
                    toast.success('Household created successfully')
                    onSuccess()
                    onClose()
                } else {
                    throw new Error('Invalid response from server')
                }
            } catch (err: any) {
                const errorMessage =
                    err.status === 401
                        ? t('create_household.error.unauthorized')
                        : err.status === 500
                        ? t('create_household.error.server')
                        : t('create_household.error.general')

                setError(errorMessage)
                toast.error('Error creating household')
            } finally {
                setLoading(false)
            }
        },
        [dispatch, householdName, onClose, onSuccess, t, households],
    )

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setHouseholdName(e.target.value)
    }, [])

    if (!isOpen) return null

    return (
        <div className="modal-create-household-container">
            <GradientDiv className="modal-create-household-step-container">
                <H5 variant="primary" className="modal-create-household-title">
                    {t('create_household.title')}
                </H5>
                <button className="modal-create-household-close-button" onClick={onClose}>
                    ×
                </button>

                <CreateHouseholdForm
                    householdName={householdName}
                    error={error}
                    loading={loading}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                />
            </GradientDiv>
        </div>
    )
})

CreateHousehold.displayName = 'CreateHousehold'

export default CreateHousehold
