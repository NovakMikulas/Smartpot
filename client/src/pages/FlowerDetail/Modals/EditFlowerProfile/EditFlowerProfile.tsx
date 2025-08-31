import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Button from '../../../../components/Button/Button'
import GradientDiv from '../../../../components/GradientDiv/GradientDiv'
import { H4, H5 } from '../../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../../i18n'
import { selectProfiles } from '../../../../redux/selectors/flowerProfilesSelectors'
import { updateFlowerData } from '../../../../redux/slices/flowersSlice'
import { AppDispatch } from '../../../../redux/store/store'
import { FlowerProfile } from '../../../../types/flowerTypes'
import './EditFlowerProfile.sass'

interface EditFlowerProfileProps {
    isOpen: boolean
    onClose: () => void
    flowerId: string
    currentProfile?: FlowerProfile
}

const EditFlowerProfile: React.FC<EditFlowerProfileProps> = ({ isOpen, onClose, flowerId, currentProfile }) => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const [profileType, setProfileType] = useState<'global' | 'custom'>('global')
    const [customProfile, setCustomProfile] = useState<Partial<FlowerProfile>>({
        temperature: { min: 18, max: 25 },
        humidity: { min: 40, max: 60 },
        light: { min: 30, max: 70 },
    })
    const [selectedProfileId, setSelectedProfileId] = useState<string>('')
    const profiles = useSelector(selectProfiles)
    const dispatch = useDispatch<AppDispatch>()
    const [loading, setLoading] = useState(false)
    const [flower, setFlower] = useState<FlowerProfile | null>(null)

    useEffect(() => {
        if (currentProfile) {
            setProfileType('global')
            setSelectedProfileId(currentProfile._id)
            setFlower(currentProfile)
        } else {
            setProfileType('custom')
            setCustomProfile({
                temperature: { min: 18, max: 25 },
                humidity: { min: 40, max: 60 },
                light: { min: 30, max: 70 },
            })
        }
    }, [currentProfile])

    const handleCustomProfileChange = (
        type: 'temperature' | 'humidity' | 'light',
        field: 'min' | 'max',
        value: number,
    ) => {
        setCustomProfile(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value,
            },
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (profileType === 'custom' && !validateCustomProfile()) {
            return
        }

        if (profileType === 'global' && !selectedProfileId) {
            toast.error(t('edit_flower_profile.select_profile_error'))
            return
        }

        let updateData: {
            id: string
            flower: {
                profile_id: string | null
                profile: {
                    humidity: { min: number; max: number }
                    temperature: { min: number; max: number }
                    light: { min: number; max: number }
                }
            }
        } = {
            id: flowerId,
            flower: {
                profile_id: null,
                profile: {
                    humidity: { min: 40, max: 60 },
                    temperature: { min: 18, max: 25 },
                    light: { min: 30, max: 70 },
                },
            },
        }

        if (profileType === 'global' && selectedProfileId) {
            const selectedProfile = profiles.find(p => p._id === selectedProfileId)
            if (selectedProfile) {
                updateData = {
                    ...updateData,
                    flower: {
                        profile_id: selectedProfileId,
                        profile: {
                            humidity: selectedProfile.humidity,
                            temperature: selectedProfile.temperature,
                            light: selectedProfile.light,
                        },
                    },
                }
            }
        } else {
            updateData = {
                ...updateData,
                flower: {
                    profile_id: null,
                    profile: {
                        humidity: customProfile.humidity || { min: 40, max: 60 },
                        temperature: customProfile.temperature || { min: 18, max: 25 },
                        light: customProfile.light || { min: 30, max: 70 },
                    },
                },
            }
        }

        dispatch({
            type: 'flowers/updateFlowerLocally',
            payload: {
                id: flowerId,
                updates: {
                    profile_id: updateData.flower.profile_id,
                    profile: updateData.flower.profile,
                },
            },
        })

        onClose()

        try {
            await dispatch(updateFlowerData(updateData)).unwrap()
            toast.success(t('edit_flower_profile.success.update_success'))
        } catch (error) {
            if (currentProfile) {
                dispatch({
                    type: 'flowers/updateFlowerLocally',
                    payload: {
                        id: flowerId,
                        updates: {
                            profile_id: currentProfile._id,
                            profile: currentProfile,
                        },
                    },
                })
            }
            toast.error(t('edit_flower_profile.error.update_error'))
        }
    }

    const validateCustomProfile = () => {
        const { temperature, humidity, light } = customProfile
        if (!temperature?.min || !temperature?.max || !humidity?.min || !humidity?.max || !light?.min || !light?.max) {
            toast.error(t('edit_flower_profile.fill_all_values'))
            return false
        }
        if (temperature.min > temperature.max || humidity.min > humidity.max || light.min > light.max) {
            toast.error(t('edit_flower_profile.min_greater_than_max'))
            return false
        }
        return true
    }

    if (!isOpen) return null

    return (
        <div className="edit-flower-profile-container">
            <GradientDiv className="edit-flower-profile-step-container">
                <H5 variant="primary">{t('edit_flower_profile.title')}</H5>
                <button className="edit-flower-profile-close-button" onClick={onClose}>
                    ×
                </button>

                <form className="edit-flower-profile-form" onSubmit={handleSubmit}>
                    <div className="edit-flower-profile-option-section">
                        <h3>{t('edit_flower_profile.profile_type')}</h3>
                        <div className="edit-flower-profile-profile-type-selection">
                            <label>
                                <input
                                    type="radio"
                                    value="global"
                                    checked={profileType === 'global'}
                                    onChange={e => setProfileType(e.target.value as 'global' | 'custom')}
                                />
                                {t('edit_flower_profile.use_existing_profile')}
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="custom"
                                    checked={profileType === 'custom'}
                                    onChange={e => setProfileType(e.target.value as 'global' | 'custom')}
                                />
                                {t('edit_flower_profile.custom_settings')}
                            </label>
                        </div>

                        {profileType === 'global' ? (
                            <>
                                <div className="edit-flower-profile-form-group">
                                    <label>{t('edit_flower_profile.select_profile')}</label>
                                    <select
                                        className="edit-flower-profile-profile-select"
                                        value={selectedProfileId}
                                        onChange={e => setSelectedProfileId(e.target.value)}>
                                        <option value="">{t('edit_flower_profile.select_profile_placeholder')}</option>
                                        {profiles.map(profile => (
                                            <option key={profile._id} value={profile._id}>
                                                {profile.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedProfileId && (
                                    <div className="edit-flower-profile-profile-settings">
                                        <div className="edit-flower-profile-form-group">
                                            <label>{t('edit_flower_profile.temperature')}</label>
                                            <div className="edit-flower-profile-range-inputs">
                                                <span className="edit-flower-profile-readonly-value">
                                                    {profiles.find(p => p._id === selectedProfileId)?.temperature.min}
                                                </span>
                                                <span>{t('edit_flower_profile.range_separator_display')}</span>
                                                <span className="edit-flower-profile-readonly-value">
                                                    {profiles.find(p => p._id === selectedProfileId)?.temperature.max}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="edit-flower-profile-form-group">
                                            <label>{t('edit_flower_profile.humidity')}</label>
                                            <div className="edit-flower-profile-range-inputs">
                                                <span className="edit-flower-profile-readonly-value">
                                                    {profiles.find(p => p._id === selectedProfileId)?.humidity.min}
                                                </span>
                                                <span>{t('edit_flower_profile.range_separator_display')}</span>
                                                <span className="edit-flower-profile-readonly-value">
                                                    {profiles.find(p => p._id === selectedProfileId)?.humidity.max}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="edit-flower-profile-form-group">
                                            <label>{t('edit_flower_profile.light')}</label>
                                            <div className="edit-flower-profile-range-inputs">
                                                <span className="edit-flower-profile-readonly-value">
                                                    {profiles.find(p => p._id === selectedProfileId)?.light.min}
                                                </span>
                                                <span>{t('edit_flower_profile.range_separator_display')}</span>
                                                <span className="edit-flower-profile-readonly-value">
                                                    {profiles.find(p => p._id === selectedProfileId)?.light.max}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="edit-flower-profile-profile-settings">
                                <H4 variant="secondary">{t('edit_flower_profile.custom_settings')}</H4>
                                <div className="edit-flower-profile-form-group">
                                    <label>{t('edit_flower_profile.temperature')}</label>
                                    <div className="edit-flower-profile-range-inputs">
                                        <input
                                            type="number"
                                            value={customProfile.temperature?.min}
                                            onChange={e =>
                                                handleCustomProfileChange(
                                                    'temperature',
                                                    'min',
                                                    parseInt(e.target.value),
                                                )
                                            }
                                            placeholder={t('edit_flower_profile.custom_profile.placeholder_min')}
                                        />
                                        <span>{t('edit_flower_profile.range_separator_display')}</span>
                                        <input
                                            type="number"
                                            value={customProfile.temperature?.max}
                                            onChange={e =>
                                                handleCustomProfileChange(
                                                    'temperature',
                                                    'max',
                                                    parseInt(e.target.value),
                                                )
                                            }
                                            placeholder={t('edit_flower_profile.custom_profile.placeholder_max')}
                                        />
                                    </div>
                                </div>

                                <div className="edit-flower-profile-form-group">
                                    <label>{t('edit_flower_profile.humidity')}</label>
                                    <div className="edit-flower-profile-range-inputs">
                                        <input
                                            type="number"
                                            value={customProfile.humidity?.min}
                                            onChange={e =>
                                                handleCustomProfileChange('humidity', 'min', parseInt(e.target.value))
                                            }
                                            placeholder={t('edit_flower_profile.custom_profile.placeholder_min')}
                                        />
                                        <span>{t('edit_flower_profile.range_separator_display')}</span>
                                        <input
                                            type="number"
                                            value={customProfile.humidity?.max}
                                            onChange={e =>
                                                handleCustomProfileChange('humidity', 'max', parseInt(e.target.value))
                                            }
                                            placeholder={t('edit_flower_profile.custom_profile.placeholder_max')}
                                        />
                                    </div>
                                </div>

                                <div className="edit-flower-profile-form-group">
                                    <label>{t('edit_flower_profile.light')}</label>
                                    <div className="edit-flower-profile-range-inputs">
                                        <input
                                            type="number"
                                            value={customProfile.light?.min}
                                            onChange={e =>
                                                handleCustomProfileChange('light', 'min', parseInt(e.target.value))
                                            }
                                            placeholder={t('edit_flower_profile.custom_profile.placeholder_min')}
                                        />
                                        <span>{t('edit_flower_profile.range_separator_display')}</span>
                                        <input
                                            type="number"
                                            value={customProfile.light?.max}
                                            onChange={e =>
                                                handleCustomProfileChange('light', 'max', parseInt(e.target.value))
                                            }
                                            placeholder={t('edit_flower_profile.custom_profile.placeholder_max')}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Button type="submit">{t('edit_flower_profile.save')}</Button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default EditFlowerProfile
