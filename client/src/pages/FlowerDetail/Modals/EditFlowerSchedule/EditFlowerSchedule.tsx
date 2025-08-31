import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import Button from '../../../../components/Button/Button'
import GradientDiv from '../../../../components/GradientDiv/GradientDiv'
import { H5 } from '../../../../components/Text/Heading/Heading'
import { updateSchedule, updateScheduleLocally } from '../../../../redux/slices/scheduleSlice'
import { AppDispatch } from '../../../../redux/store/store'
import { Schedule } from '../../../../types/flowerTypes'
import './EditFlowerSchedule.sass'

interface ScheduleDay {
    from: string | null
    to: string | null
}

interface ScheduleData {
    _id?: string
    monday: ScheduleDay
    tuesday: ScheduleDay
    wednesday: ScheduleDay
    thursday: ScheduleDay
    friday: ScheduleDay
    saturday: ScheduleDay
    sunday: ScheduleDay
    active: boolean
}

interface EditFlowerScheduleProps {
    isOpen: boolean
    onClose: () => void
    flowerId: string
    currentSchedule: ScheduleData
}

const EditFlowerSchedule: React.FC<EditFlowerScheduleProps> = ({ isOpen, onClose, flowerId, currentSchedule }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const [scheduleData, setScheduleData] = useState<ScheduleData>(currentSchedule)
    const [error, setError] = useState<string | null>(null)

    const dayTranslations: Record<string, string> = {
        monday: t('flower_detail.days.monday'),
        tuesday: t('flower_detail.days.tuesday'),
        wednesday: t('flower_detail.days.wednesday'),
        thursday: t('flower_detail.days.thursday'),
        friday: t('flower_detail.days.friday'),
        saturday: t('flower_detail.days.saturday'),
        sunday: t('flower_detail.days.sunday'),
    }

    const handleTimeChange = (day: keyof ScheduleData, type: 'from' | 'to', value: string) => {
        const dayData = scheduleData[day] as ScheduleDay
        setScheduleData(prev => ({
            ...prev,
            [day]: {
                ...dayData,
                [type]: value,
            },
        }))
    }

    const handleClearDay = (day: keyof ScheduleData) => {
        setScheduleData(prev => ({
            ...prev,
            [day]: {
                from: null,
                to: null,
            },
        }))
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault()
        }

        for (const day of Object.keys(scheduleData)) {
            if (day === 'active') continue
            const dayData = scheduleData[day as keyof ScheduleData] as ScheduleDay
            if (dayData && dayData.from && dayData.to && dayData.from > dayData.to) {
                toast.error(t('flower_detail.edit_schedule.error.invalid_time'))
                return
            }
        }

        const atLeastOneDay = Object.keys(scheduleData).some(day => {
            if (day === 'active') return false
            const dayData = scheduleData[day as keyof ScheduleData] as ScheduleDay
            return !!(dayData && (dayData.from || dayData.to))
        })
        if (!atLeastOneDay) {
            toast.error(t('flower_detail.edit_schedule.error.at_least_one_day'))
            return
        }

        const scheduleToUpdate: Schedule = {
            ...scheduleData,
            id: currentSchedule._id,
            flower_id: flowerId,
        }

        try {
     
            const result = await dispatch(
                updateSchedule({
                    schedule: scheduleToUpdate,
                }),
            ).unwrap()


            if (result && result.data) {
                const updatedSchedule = {
                    ...result.data,
                    _id: result.data._id || currentSchedule._id,
                    flower_id: flowerId,
                    active: true,
                }
                dispatch(updateScheduleLocally(updatedSchedule))
            }

            onClose()
            toast.success(t('flower_detail.edit_schedule.success.schedule_updated'))
        } catch (err) {
            
            toast.error(t('flower_detail.edit_schedule.error.update_failed'))
            const originalSchedule: Schedule = {
                ...currentSchedule,
                id: currentSchedule._id,
                flower_id: flowerId,
            }
            dispatch(updateScheduleLocally(originalSchedule))
            toast.error(t('flower_detail.edit_schedule.error.update_failed'))
        }
    }

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'auto'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="edit-flower-schedule-container">
            <GradientDiv className="edit-flower-schedule-step-container">
                <H5 variant="primary">{t('flower_detail.edit_schedule.title')}</H5>
                <button className="edit-flower-schedule-close-button" onClick={onClose}>
                    ×
                </button>

                <form onSubmit={handleSubmit} className="edit-flower-schedule-form">
                    <div className="edit-flower-schedule-schedule-section">
                        <div className="edit-flower-schedule-schedule-days">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                                const dayTimes = scheduleData[day as keyof Omit<ScheduleData, 'active'>] as ScheduleDay
                                return (
                                    <div key={day} className="edit-flower-schedule-schedule-day">
                                        <div className="edit-flower-schedule-day-header">
                                            <span className="edit-flower-schedule-day-label">
                                                {dayTranslations[day]}
                                            </span>
                                            <button
                                                type="button"
                                                className="edit-flower-schedule-clear-button"
                                                onClick={() => handleClearDay(day as keyof ScheduleData)}>
                                                ×
                                            </button>
                                        </div>
                                        <div className="edit-flower-schedule-time-inputs">
                                            <div className="edit-flower-schedule-time-input-group">
                                                <input
                                                    type="time"
                                                    className="edit-flower-schedule-time-input"
                                                    value={dayTimes.from || ''}
                                                    onChange={e =>
                                                        handleTimeChange(
                                                            day as keyof ScheduleData,
                                                            'from',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            -
                                            <div className="edit-flower-schedule-time-input-group">
                                                <input
                                                    type="time"
                                                    className="edit-flower-schedule-time-input"
                                                    value={dayTimes.to || ''}
                                                    onChange={e =>
                                                        handleTimeChange(
                                                            day as keyof ScheduleData,
                                                            'to',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {error && <div className="edit-flower-schedule-error-message">{error}</div>}

                    <Button variant="default" onClick={handleSubmit}>
                        {t('flower_detail.save')}
                    </Button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default EditFlowerSchedule
