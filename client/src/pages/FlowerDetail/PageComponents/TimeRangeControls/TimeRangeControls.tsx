import { motion } from 'framer-motion'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../../components/Button/Button'
import './TimeRangeControls.sass'

interface TimeRangeControlsProps {
    timeRange: 'day' | 'week' | 'month' | 'custom'
    customDateRange: { from: string; to: string }
    onTimeRangeChange: (range: 'day' | 'week' | 'month' | 'custom') => void
    onCustomDateRangeChange: (range: { from: string; to: string }) => void
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

const TimeRangeControls: React.FC<TimeRangeControlsProps> = ({
    timeRange,
    customDateRange,
    onTimeRangeChange,
    onCustomDateRangeChange,
}) => {
    const { t } = useTranslation()

    return (
        <motion.div className="time-range-controls" variants={containerVariants}>
            <motion.div className="time-range-buttons" variants={itemVariants}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        className={`time-range-button ${timeRange === 'day' ? 'active' : ''}`}
                        onClick={() => onTimeRangeChange('day')}>
                        {t('flower_measurments.filter_date_range.day')}
                    </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        className={`time-range-button ${timeRange === 'week' ? 'active' : ''}`}
                        onClick={() => onTimeRangeChange('week')}>
                        {t('flower_measurments.filter_date_range.week')}
                    </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        className={`time-range-button ${timeRange === 'month' ? 'active' : ''}`}
                        onClick={() => onTimeRangeChange('month')}>
                        {t('flower_measurments.filter_date_range.month')}
                    </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        className={`time-range-button ${timeRange === 'custom' ? 'active' : ''}`}
                        onClick={() => onTimeRangeChange('custom')}>
                        {t('flower_measurments.filter_date_range.custom')}
                    </Button>
                </motion.div>
            </motion.div>
            {timeRange === 'custom' && (
                <div className="custom-date-range">
                    <div className="date-input-group">
                        <label>{t('flower_measurments.filter_date_range.from')}</label>
                        <input
                            type="date"
                            value={customDateRange.from}
                            onChange={e =>
                                onCustomDateRangeChange({
                                    ...customDateRange,
                                    from: e.target.value,
                                })
                            }
                            max={customDateRange.to || new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="date-input-group">
                        <label>{t('flower_measurments.filter_date_range.to')}</label>
                        <input
                            type="date"
                            value={customDateRange.to}
                            onChange={e =>
                                onCustomDateRangeChange({
                                    ...customDateRange,
                                    to: e.target.value,
                                })
                            }
                            min={customDateRange.from}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
            )}
        </motion.div>
    )
}

export default TimeRangeControls
