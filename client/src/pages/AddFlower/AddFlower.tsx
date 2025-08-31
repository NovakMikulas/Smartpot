import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../../components/Button/Button'
import { H5 } from '../../components/Text/Heading/Heading'
import { selectProfiles } from '../../redux/selectors/flowerProfilesSelectors'
import { createSchedule } from '../../redux/services/flowersApi'
import { createFlower } from '../../redux/slices/flowersSlice'
import { AppDispatch } from '../../redux/store/store'
import { FlowerProfile } from '../../types/flowerTypes'
import './AddFlower.sass'

const avatars = [
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308837/flowerpots_avatars/librk2eqiamvp7cuzjxa.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308835/flowerpots_avatars/qohoubp5tjmajz4li5iu.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308832/flowerpots_avatars/iipwugfwpqxpahjxjalo.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308831/flowerpots_avatars/bfsivvzsqjzwig8uqzua.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308830/flowerpots_avatars/xwi1ujvpmm2d1magwid8.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308825/flowerpots_avatars/emgeoupoglpwkuknuvsi.png',
]

interface AddFlowerProps {
    onClose: () => void
}

interface ScheduleData {
    monday: { from: string | null; to: string | null }
    tuesday: { from: string | null; to: string | null }
    wednesday: { from: string | null; to: string | null }
    thursday: { from: string | null; to: string | null }
    friday: { from: string | null; to: string | null }
    saturday: { from: string | null; to: string | null }
    sunday: { from: string | null; to: string | null }
    active: boolean
}

const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        },
    },
}

const AddFlower: React.FC<AddFlowerProps> = ({ onClose }) => {
    const dispatch = useDispatch<AppDispatch>()
    const { householdId } = useParams<{ householdId: string }>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedAvatar, setSelectedAvatar] = useState<string>(avatars[0])
    const [name, setName] = useState('')
    const [profileType, setProfileType] = useState<'global' | 'custom'>('global')
    const [customProfile, setCustomProfile] = useState<Partial<FlowerProfile>>({
        temperature: { min: 18, max: 25 },
        humidity: { min: 40, max: 60 },
        light: { min: 30, max: 70 },
    })
    const [scheduleData, setScheduleData] = useState<ScheduleData>({
        monday: { from: '', to: '' },
        tuesday: { from: '', to: '' },
        wednesday: { from: '', to: '' },
        thursday: { from: '', to: '' },
        friday: { from: '', to: '' },
        saturday: { from: '', to: '' },
        sunday: { from: '', to: '' },
        active: false,
    })
    const profiles = useSelector(selectProfiles)
    const [selectedProfileId, setSelectedProfileId] = useState<string>('')
    const { t } = useTranslation()

    const dayTranslations: Record<string, string> = {
        monday: t('add_flower.schedule.monday'),
        tuesday: t('add_flower.schedule.tuesday'),
        wednesday: t('add_flower.schedule.wednesday'),
        thursday: t('add_flower.schedule.thursday'),
        friday: t('add_flower.schedule.friday'),
        saturday: t('add_flower.schedule.saturday'),
        sunday: t('add_flower.schedule.sunday'),
    }

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

    const handleTimeChange = (day: keyof Omit<ScheduleData, 'active'>, type: 'from' | 'to', value: string) => {
        setScheduleData(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: value,
            },
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!name.trim()) {
            toast.error(t('add_flower.error.name_required'))
            setLoading(false)
            return
        }
        if (profileType === 'global' && !selectedProfileId) {
            toast.error(t('add_flower.error.profile_required'))
            setLoading(false)
            return
        }

        const hasValidSchedule = Object.entries(scheduleData).some(([day, times]) => {
            if (day === 'active') return false
            return times.from && times.to && times.from < times.to
        })

        if (!hasValidSchedule) {
            toast.error(t('add_flower.error.schedule_required'))
            setLoading(false)
            return
        }

        const hasInvalidTimeRange = Object.entries(scheduleData).some(([day, times]) => {
            if (day === 'active') return false
            if (times.from && times.to && times.from >= times.to) {
                toast.error(t('add_flower.error.invalid_time_range', { day: dayTranslations[day] }))
                return true
            }
            return false
        })

        if (hasInvalidTimeRange) {
            setLoading(false)
            return
        }

        try {
            let flowerData: {
                name: string
                household_id: string
                avatar: string
                serial_number: string | null
                profile_id: string | null
                profile: {
                    humidity: { min: number; max: number }
                    temperature: { min: number; max: number }
                    light: { min: number; max: number }
                }
            } = {
                name: name || t('add_flower.default_flower_name'),
                household_id: householdId || '',
                avatar: selectedAvatar || '',
                serial_number: null,
                profile_id: null,
                profile: {
                    humidity: { min: 40, max: 60 },
                    temperature: { min: 18, max: 25 },
                    light: { min: 30, max: 70 },
                },
            }

            if (profileType === 'global' && selectedProfileId) {
                const selectedProfile = profiles.find(p => p._id === selectedProfileId)
                if (selectedProfile) {
                    flowerData = {
                        ...flowerData,
                        profile_id: selectedProfileId,
                        profile: {
                            humidity: selectedProfile.humidity,
                            temperature: selectedProfile.temperature,
                            light: selectedProfile.light,
                        },
                    }
                }
            } else {
                flowerData = {
                    ...flowerData,
                    profile: {
                        humidity: customProfile.humidity || { min: 40, max: 60 },
                        temperature: customProfile.temperature || { min: 18, max: 25 },
                        light: customProfile.light || { min: 30, max: 70 },
                    },
                }
            }

            const newFlower = await dispatch(createFlower(flowerData)).unwrap()

            if (!newFlower._id) {
                throw new Error(t('add_flower.error.no_flower_id_returned'))
            }

            const scheduleResponse = await createSchedule({
                flower_id: newFlower._id,
                active: scheduleData.active,
                monday: scheduleData.monday,
                tuesday: scheduleData.tuesday,
                wednesday: scheduleData.wednesday,
                thursday: scheduleData.thursday,
                friday: scheduleData.friday,
                saturday: scheduleData.saturday,
                sunday: scheduleData.sunday,
            })

            if (!scheduleResponse) {
                throw new Error(t('add_flower.error.schedule_creation_failed'))
            }

            onClose()
            toast.success(t('add_flower.success.flower_added'))
        } catch (err) {
            setError(t('add_flower.error.creation_failed_message'))
            toast.error(t('add_flower.error.creation_failed_toast'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                className="add-flower-container"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={modalVariants}>
                <div className="add-flower-step-container">
                    <button className="add-flower-close-button" onClick={onClose}>
                        ×
                    </button>
                    <H5 variant="primary">{t('add_flower.title')}</H5>

                    <form onSubmit={handleSubmit} className="add-flower-form">
                        <div className="add-flower-form-group">
                            <label className="add-flower-input-label">{t('add_flower.name')}</label>
                            <input
                                type="text"
                                className="add-flower-input"
                                placeholder={t('add_flower.name_placeholder')}
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div className="add-flower-option-section">
                            <div className="add-flower-profile-type-selection">
                                <label className="add-flower-profile-type-label">
                                    <input
                                        type="radio"
                                        className="add-flower-profile-type-radio"
                                        value="global"
                                        checked={profileType === 'global'}
                                        onChange={e => setProfileType(e.target.value as 'global' | 'custom')}
                                    />
                                    {t('add_flower.use_existing_profile')}
                                </label>
                                <label className="add-flower-profile-type-label">
                                    <input
                                        type="radio"
                                        className="add-flower-profile-type-radio"
                                        value="custom"
                                        checked={profileType === 'custom'}
                                        onChange={e => setProfileType(e.target.value as 'global' | 'custom')}
                                    />
                                    {t('add_flower.custom_settings')}
                                </label>
                            </div>

                            {profileType === 'global' ? (
                                <div className="add-flower-form-group">
                                    <label className="add-flower-input-label">{t('add_flower.select_profile')}</label>
                                    <select
                                        className="add-flower-input"
                                        value={selectedProfileId}
                                        onChange={e => setSelectedProfileId(e.target.value)}>
                                        <option value="">{t('add_flower.select_profile_placeholder')}</option>
                                        {profiles.map(profile => (
                                            <option key={profile._id} value={profile._id}>
                                                {profile.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="add-flower-profile-settings">
                                    <div className="add-flower-form-group">
                                        <label className="add-flower-input-label">{t('add_flower.temperature')}</label>
                                        <div className="add-flower-range-inputs">
                                            <input
                                                type="number"
                                                className="add-flower-range-input"
                                                value={customProfile.temperature?.min}
                                                onChange={e =>
                                                    handleCustomProfileChange(
                                                        'temperature',
                                                        'min',
                                                        parseInt(e.target.value),
                                                    )
                                                }
                                                placeholder={t('add_flower.placeholder_min')}
                                            />
                                            <span className="add-flower-range-separator">
                                                {t('add_flower.range_separator')}
                                            </span>
                                            <input
                                                type="number"
                                                className="add-flower-range-input"
                                                value={customProfile.temperature?.max}
                                                onChange={e =>
                                                    handleCustomProfileChange(
                                                        'temperature',
                                                        'max',
                                                        parseInt(e.target.value),
                                                    )
                                                }
                                                placeholder={t('add_flower.placeholder_max')}
                                            />
                                        </div>
                                    </div>

                                    <div className="add-flower-form-group">
                                        <label className="add-flower-input-label">{t('add_flower.humidity')}</label>
                                        <div className="add-flower-range-inputs">
                                            <input
                                                type="number"
                                                className="add-flower-range-input"
                                                value={customProfile.humidity?.min}
                                                onChange={e =>
                                                    handleCustomProfileChange(
                                                        'humidity',
                                                        'min',
                                                        parseInt(e.target.value),
                                                    )
                                                }
                                                placeholder={t('add_flower.placeholder_min')}
                                            />
                                            <span className="add-flower-range-separator">
                                                {t('add_flower.range_separator')}
                                            </span>
                                            <input
                                                type="number"
                                                className="add-flower-range-input"
                                                value={customProfile.humidity?.max}
                                                onChange={e =>
                                                    handleCustomProfileChange(
                                                        'humidity',
                                                        'max',
                                                        parseInt(e.target.value),
                                                    )
                                                }
                                                placeholder={t('add_flower.placeholder_max')}
                                            />
                                        </div>
                                    </div>

                                    <div className="add-flower-form-group">
                                        <label className="add-flower-input-label">{t('add_flower.light')}</label>
                                        <div className="add-flower-range-inputs">
                                            <input
                                                type="number"
                                                className="add-flower-range-input"
                                                value={customProfile.light?.min}
                                                onChange={e =>
                                                    handleCustomProfileChange('light', 'min', parseInt(e.target.value))
                                                }
                                                placeholder={t('add_flower.placeholder_min')}
                                            />
                                            <span className="add-flower-range-separator">
                                                {t('add_flower.range_separator')}
                                            </span>
                                            <input
                                                type="number"
                                                className="add-flower-range-input"
                                                value={customProfile.light?.max}
                                                onChange={e =>
                                                    handleCustomProfileChange('light', 'max', parseInt(e.target.value))
                                                }
                                                placeholder={t('add_flower.placeholder_max')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="add-flower-avatar-section">
                            <label className="add-flower-input-label">{t('add_flower.avatar')}</label>
                            <div className="add-flower-avatar-grid">
                                {avatars.map((avatar, index) => (
                                    <img
                                        src={avatar}
                                        alt={t('add_flower.avatar_alt_text', { index: index + 1 })}
                                        key={index}
                                        className={`add-flower-avatar-image ${
                                            selectedAvatar === avatar ? 'add-flower-avatar-image--selected' : ''
                                        }`}
                                        onClick={() => setSelectedAvatar(avatar)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="add-flower-schedule-section">
                            <div className="add-flower-schedule-days">
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
                                    day => (
                                        <div key={day} className="add-flower-schedule-day">
                                            <span className="add-flower-schedule-day-label">
                                                {dayTranslations[day]}
                                            </span>
                                            <div className="add-flower-time-inputs">
                                                <label className="add-flower-time-label">
                                                    {t('add_flower.schedule_from')}
                                                </label>
                                                <input
                                                    type="time"
                                                    className="add-flower-time-input"
                                                    value={
                                                        scheduleData[day as keyof Omit<ScheduleData, 'active'>].from ||
                                                        ''
                                                    }
                                                    onChange={e =>
                                                        handleTimeChange(
                                                            day as keyof Omit<ScheduleData, 'active'>,
                                                            'from',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <label className="add-flower-time-label">
                                                    {t('add_flower.schedule_to')}
                                                </label>
                                                <input
                                                    type="time"
                                                    className="add-flower-time-input"
                                                    value={
                                                        scheduleData[day as keyof Omit<ScheduleData, 'active'>].to || ''
                                                    }
                                                    onChange={e =>
                                                        handleTimeChange(
                                                            day as keyof Omit<ScheduleData, 'active'>,
                                                            'to',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        {error && <div className="add-flower-error-message">{error}</div>}

                        <Button
                            type="submit"
                            className="add-flower-button add-flower-button--default"
                            disabled={loading}>
                            {loading ? t('add_flower.saving') : t('add_flower.final_button')}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default AddFlower
