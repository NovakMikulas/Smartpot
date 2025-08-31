import { PencilSimple, Power } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import Loader from '../../../../components/Loader/Loader'
import { H4, H5 } from '../../../../components/Text/Heading/Heading'
import { updateSchedule } from '../../../../redux/slices/scheduleSlice'
import { AppDispatch } from '../../../../redux/store/store'
import { Flower, Schedule } from '../../../../types/flowerTypes'
import EditFlowerSchedule from '../../Modals/EditFlowerSchedule/EditFlowerSchedule'
import './ScheduleSection.sass'

interface ScheduleSectionProps {
    flower: Flower | null
    schedules: Schedule[]
    isLoading: boolean
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({ flower, schedules, isLoading }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const [isScheduleEditModalOpen, setIsScheduleEditModalOpen] = useState(false)
    const [currentSchedules, setCurrentSchedules] = useState<Schedule[]>(schedules)

    useEffect(() => {
        if (schedules && schedules.length > 0) {
            setCurrentSchedules(schedules)
        }
    }, [schedules])

    const handleToggleSchedule = async () => {
        if (!flower || !currentSchedules[0]) return

        try {
            const newActiveState = !currentSchedules[0].active
            await dispatch(
                updateSchedule({
                    schedule: {
                        id: currentSchedules[0]._id || currentSchedules[0].id,
                        flower_id: flower._id,
                        active: newActiveState,
                        monday: currentSchedules[0].monday,
                        tuesday: currentSchedules[0].tuesday,
                        wednesday: currentSchedules[0].wednesday,
                        thursday: currentSchedules[0].thursday,
                        friday: currentSchedules[0].friday,
                        saturday: currentSchedules[0].saturday,
                        sunday: currentSchedules[0].sunday,
                    },
                }),
            ).unwrap()

            setCurrentSchedules(prev => prev.map(schedule => ({ ...schedule, active: newActiveState })))
            toast.success(
                newActiveState ? t('flower_detail.schedule_activated') : t('flower_detail.schedule_deactivated'),
            )
        } catch (error) {
            toast.error(t('flower_detail.schedule_toggle_error'))
        }
    }

    if (isLoading) {
        return <Loader />
    }

    const displaySchedules = currentSchedules.length > 0 ? currentSchedules : schedules
    const isActive = displaySchedules[0]?.active ?? false

    return (
        <motion.div
            className="schedule-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`schedule-${displaySchedules.length}-${JSON.stringify(displaySchedules)}`}>
            <div className="schedule-header">
                <H4>{t('flower_detail.schedule')}</H4>
                <div className="schedule-controls">
                    <button
                        className={`power-button ${isActive ? 'active' : ''}`}
                        onClick={handleToggleSchedule}
                        title={isActive ? t('flower_detail.disable_schedule') : t('flower_detail.enable_schedule')}>
                        <Power size={32} weight="fill" />
                    </button>
                    <button className="edit-button" onClick={() => setIsScheduleEditModalOpen(true)}>
                        <PencilSimple size={20} weight="bold" color="#ebe6e6" />
                    </button>
                </div>
            </div>

            <div className={`schedule-grid ${!isActive ? 'disabled' : ''}`}>
                {displaySchedules.length > 0 ? (
                    displaySchedules.map(schedule =>
                        Object.entries(schedule).map(([day, times]) => {
                            if (['_id', 'flower_id', 'active', 'createdAt', 'updatedAt', '__v'].includes(day)) {
                                return null
                            }
                            const timeSlot = times as { from: string | null; to: string | null }
                            if (!timeSlot.from && !timeSlot.to) {
                                return null
                            }
                            return (
                                <div key={`${day}-${timeSlot.from}-${timeSlot.to}`} className="schedule-day">
                                    <H5>{t(`flower_detail.days.${day}`)}</H5>
                                    <div className="time-slots">
                                        <div className="time-slot">
                                            <span>{t('add_flower.schedule_from')}:</span>
                                            <span>
                                                {timeSlot.from || t('flower_detail.schedule_no_time_placeholder')}
                                            </span>
                                        </div>
                                        <div className="time-slot">
                                            <span>{t('add_flower.schedule_to')}:</span>
                                            <span>
                                                {timeSlot.to || t('flower_detail.schedule_no_time_placeholder')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        }),
                    )
                ) : (
                    <div className="no-schedule">{t('flower_detail.no_schedule')}</div>
                )}
            </div>

            <AnimatePresence>
                {isScheduleEditModalOpen && flower && (
                    <EditFlowerSchedule
                        isOpen={isScheduleEditModalOpen}
                        onClose={() => setIsScheduleEditModalOpen(false)}
                        flowerId={flower._id}
                        currentSchedule={
                            displaySchedules[0] || {
                                monday: { from: null, to: null },
                                tuesday: { from: null, to: null },
                                wednesday: { from: null, to: null },
                                thursday: { from: null, to: null },
                                friday: { from: null, to: null },
                                saturday: { from: null, to: null },
                                sunday: { from: null, to: null },
                                active: true,
                            }
                        }
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ScheduleSection
