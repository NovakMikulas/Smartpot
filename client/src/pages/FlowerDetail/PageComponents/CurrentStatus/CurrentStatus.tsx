import { motion } from 'framer-motion'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectLastChange } from '../../../../redux/selectors/measurementSelectors'
import { MeasurementValue } from '../../../../types/flowerTypes'
import './CurrentStatus.sass'

type FlowerpotMeasurementType = 'humidity' | 'temperature' | 'light' | 'battery' /* | 'water' */

interface CurrentStatusProps {
    measurements: {
        humidity?: MeasurementValue[]
        temperature?: MeasurementValue[]
        light?: MeasurementValue[]
        battery?: MeasurementValue[]
        water?: MeasurementValue[]
    }
    flower?: {
        profile?: {
            humidity?: { min: number; max: number }
            temperature?: { min: number; max: number }
            light?: { min: number; max: number }
        }
    }
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

const CurrentStatus: React.FC<CurrentStatusProps> = ({ measurements, flower }) => {
    const { t } = useTranslation()
    const lastChange = useSelector(selectLastChange)

    const getLastValue = (
        measurements: MeasurementValue[] | undefined,
        type: FlowerpotMeasurementType,
    ): number | null => {
        if (!measurements || measurements.length === 0) return null
        const lastMeasurement = measurements[0]
        return typeof lastMeasurement.value === 'string' ? parseFloat(lastMeasurement.value) : lastMeasurement.value
    }

    const getStatusText = (type: FlowerpotMeasurementType, value: number | null) => {
        if (value === null || value === undefined)
            return { text: t('flower_measurments.status_unknown'), className: '' }

        if (type === 'battery') {
            if (value < 30) return { text: t('flower_measurments.status_low_battery'), className: 'low' }
            if (value < 50) return { text: t('flower_measurments.status_medium_battery'), className: 'medium' }
            return { text: t('flower_measurments.status_ok'), className: 'good' }
        }

        const limits = {
            humidity: {
                min: flower?.profile?.humidity?.min ?? 30,
                max: flower?.profile?.humidity?.max ?? 70,
            },
            temperature: {
                min: flower?.profile?.temperature?.min ?? 15,
                max: flower?.profile?.temperature?.max ?? 30,
            },
            light: {
                min: flower?.profile?.light?.min ?? 100,
                max: flower?.profile?.light?.max ?? 1000,
            },
        }

        const currentLimits = limits[type] || { min: 0, max: 100 }

        if (value < currentLimits.min) return { text: t(`flower_measurments.status_low_${type}`), className: 'low' }
        if (value > currentLimits.max) return { text: t(`flower_measurments.status_high_${type}`), className: 'high' }
        return { text: t('flower_measurments.status_ok'), className: 'good' }
    }

    const lastHumidity = getLastValue(measurements.humidity, 'humidity')
    const lastTemperature = getLastValue(measurements.temperature, 'temperature')
    const lastLight = getLastValue(measurements.light, 'light')
    const lastBattery = getLastValue(measurements.battery, 'battery')

    return (
        <motion.div className="status-section" variants={containerVariants} initial="hidden" animate="visible">
            <h3>{t('flower_measurments.status')}</h3>

            <motion.div className="status-measurements" variants={containerVariants}>
                <motion.div className="status-item temperature" variants={itemVariants}>
                    <span>{t('flower_measurments.measurments.temperature')}: </span>
                    <b>
                        {lastTemperature !== null
                            ? `${lastTemperature.toFixed(1)} °C`
                            : t('flower_measurments.no_value_placeholder')}
                    </b>
                    <motion.span
                        className={`status-text ${getStatusText('temperature', lastTemperature).className}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}>
                        {getStatusText('temperature', lastTemperature).text}
                    </motion.span>
                </motion.div>
                <motion.div className="status-item humidity" variants={itemVariants}>
                    <span>{t('flower_measurments.measurments.humidity')}: </span>
                    <b>
                        {lastHumidity !== null
                            ? `${lastHumidity.toFixed(1)} %`
                            : t('flower_measurments.no_value_placeholder')}
                    </b>
                    <motion.span
                        className={`status-text ${getStatusText('humidity', lastHumidity).className}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}>
                        {getStatusText('humidity', lastHumidity).text}
                    </motion.span>
                </motion.div>
                <motion.div className="status-item light" variants={itemVariants}>
                    <span>{t('flower_measurments.measurments.light')}: </span>
                    <b>
                        {lastLight !== null
                            ? `${lastLight.toFixed(1)} ${t('flower_measurments.unit.lux')}`
                            : t('flower_measurments.no_value_placeholder')}
                    </b>
                    <motion.span
                        className={`status-text ${getStatusText('light', lastLight).className}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}>
                        {getStatusText('light', lastLight).text}
                    </motion.span>
                </motion.div>
                <motion.div className="status-item battery" variants={itemVariants}>
                    <span>{t('flower_measurments.measurments.battery')}: </span>
                    <b>
                        {lastBattery !== null
                            ? `${lastBattery.toFixed(1)} %`
                            : t('flower_measurments.no_value_placeholder')}
                    </b>
                    <motion.span
                        className={`status-text ${getStatusText('battery', lastBattery).className}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}>
                        {getStatusText('battery', lastBattery).text}
                    </motion.span>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

export default CurrentStatus
