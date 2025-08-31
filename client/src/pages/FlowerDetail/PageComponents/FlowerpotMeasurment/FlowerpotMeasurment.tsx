import { forwardRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import ChartVizual from '../../../../components/ChartVizual/ChartVizual'
import { H5 } from '../../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../../i18n'
import { selectFlower } from '../../../../redux/selectors/flowerDetailSelectors'
import {
    selectChartData,
    selectFilteredMeasurements,
    selectLastChange,
    selectMeasurementLimits,
    selectMeasurementsError,
    selectMeasurementsLoading,
} from '../../../../redux/selectors/measurementSelectors'
import { AppDispatch, RootState } from '../../../../redux/store/store'
import { Flower, FlowerProfile, MeasurementValue } from '../../../../types/flowerTypes'
import './FlowerpotMeasurment.sass'

type TimeRange = 'day' | 'week' | 'month' | 'custom'
type FlowerpotMeasurementType = 'humidity' | 'temperature' | 'light' | 'battery'

interface FlowerpotMeasurmentProps {
    flowerId: string
    householdId: string
    flowerpotData: {
        humidity_measurement: Array<{
            timestamp: string
            humidity: number
        }>
        temperature_measurement: Array<{
            timestamp: string
            temperature: number
        }>
        light_measurement: Array<{
            timestamp: string
            light: number
        }>
        battery_measurement: Array<{
            timestamp: string
            battery: number
        }>
    }
    flowerProfile?: FlowerProfile
    measurementType: FlowerpotMeasurementType
    timeRange: 'day' | 'week' | 'month' | 'custom'
    customDateRange: { from: string; to: string }
    onTimeRangeChange: (range: 'day' | 'week' | 'month' | 'custom') => void
    onCustomDateRangeChange: (range: { from: string; to: string }) => void
    color: string
    minValue: number
    maxValue: number
}

interface MeasurementLimits {
    min: number
    max: number
}

interface FlowerMeasurementSettings {
    min: number
    max: number
}

interface FlowerWithSettings {
    [key: string]: FlowerMeasurementSettings | any
    humidity?: FlowerMeasurementSettings
    temperature?: FlowerMeasurementSettings
    light?: FlowerMeasurementSettings
}

interface FlowerProfileWithSettings {
    [key: string]: FlowerMeasurementSettings | any
    humidity?: FlowerMeasurementSettings
    temperature?: FlowerMeasurementSettings
    light?: FlowerMeasurementSettings
}

type MeasurementData = {
    timestamp: string
    humidity?: number
    temperature?: number
    light?: number
    battery?: number
}

const FlowerpotMeasurment = forwardRef<HTMLDivElement, FlowerpotMeasurmentProps>((props, ref) => {
    const dispatch = useDispatch<AppDispatch>()
    const loading = useSelector(selectMeasurementsLoading)
    const error = useSelector(selectMeasurementsError)
    const flower = useSelector(selectFlower) as Flower | null
    const { t } = useTranslation() as { t: TranslationFunction }
    const measurements = useSelector((state: RootState) =>
        selectFilteredMeasurements(state, props.flowerId, props.measurementType),
    )
    const lastChange = useSelector(selectLastChange)
    const [selectedDate, setSelectedDate] = useState<string>('')

    const chartData = useSelector(
        (state: RootState) =>
            selectChartData(state, props.flowerId, props.measurementType, props.timeRange, props.customDateRange),
        (prev, next) => {
            if (!prev || !next) return false
            if (prev.length !== next.length) return false
            return prev.every((d, i) => d.timestamp === next[i].timestamp && d.value === next[i].value)
        },
    )

    const limits = useSelector(
        (state: RootState) => selectMeasurementLimits(state, props.flowerId, props.measurementType),
        (prev, next) => prev.min === next.min && prev.max === next.max,
    )

    const humidityLimits = useSelector(
        (state: RootState) => selectMeasurementLimits(state, props.flowerId, 'humidity'),
        (prev, next) => prev.min === next.min && prev.max === next.max,
    )

    const temperatureLimits = useSelector(
        (state: RootState) => selectMeasurementLimits(state, props.flowerId, 'temperature'),
        (prev, next) => prev.min === next.min && prev.max === next.max,
    )

    const lightLimits = useSelector(
        (state: RootState) => selectMeasurementLimits(state, props.flowerId, 'light'),
        (prev, next) => prev.min === next.min && prev.max === next.max,
    )

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const handleIrrigation = () => {
        setSelectedDate('')
    }

    const getTimeRangeLabel = () => {
        switch (props.timeRange) {
            case 'day':
                return t('flower_measurments.filter_date_range.day')
            case 'week':
                return t('flower_measurments.filter_date_range.week')
            case 'month':
                return t('flower_measurments.filter_date_range.month')
            case 'custom':
                return t('flower_measurments.filter_date_range.custom')
            default:
                return ''
        }
    }

    const getMeasurementLabel = () => {
        switch (props.measurementType) {
            case 'humidity':
                return t('flower_measurments.measurments.humidity')
            case 'temperature':
                return t('flower_measurments.measurments.temperature')
            case 'light':
                return t('flower_measurments.measurments.light')
            case 'battery':
                return t('flower_measurments.measurments.battery')
            default:
                return ''
        }
    }

    const getMeasurementUnit = () => {
        switch (props.measurementType) {
            case 'humidity':
                return '%'
            case 'temperature':
                return '°C'
            case 'light':
                return t('flower_measurments.unit.lux')
            case 'battery':
                return '%'
            default:
                return ''
        }
    }

    const getMeasurementValue = (data: MeasurementData, type: FlowerpotMeasurementType): number => {
        switch (type) {
            case 'humidity':
                return data.humidity || 0
            case 'temperature':
                return data.temperature || 0
            case 'light':
                return data.light || 0
            case 'battery':
                return data.battery || 0
            default:
                return 0
        }
    }

    const formatDate = (timestamp: string) => {
        if (!timestamp) {
            console.warn('Missing timestamp')
            return t('flower_measurments.no_value_placeholder')
        }

        const date = new Date(timestamp)

        if (isNaN(date.getTime())) {
            return t('flower_measurments.error.invalid_date_format')
        }

        return new Intl.DateTimeFormat('sk-SK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Europe/Bratislava',
        }).format(date)
    }

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
            if (value < 20) return { text: t('flower_measurments.status_low_battery'), className: 'low' }
            if (value < 50) return { text: t('flower_measurments.status_medium_battery'), className: 'medium' }
            return { text: t('flower_measurments.status_ok'), className: 'good' }
        }

        const currentLimits =
            type === 'humidity'
                ? humidityLimits
                : type === 'temperature'
                ? temperatureLimits
                : type === 'light'
                ? lightLimits
                : { min: 0, max: 100 }

        if (value < currentLimits.min) return { text: t(`flower_measurments.status_low_${type}`), className: 'low' }
        if (value > currentLimits.max) return { text: t(`flower_measurments.status_high_${type}`), className: 'high' }
        return { text: t('flower_measurments.status_ok'), className: 'good' }
    }

    if (!measurements) {
        return <div>{t('common.loading')}</div>
    }

    const lastHumidity = getLastValue(measurements, 'humidity')
    const lastTemperature = getLastValue(measurements, 'temperature')
    const lastLight = getLastValue(measurements, 'light')
    const lastBattery = getLastValue(measurements, 'battery')

    if (loading) {
        return <div>{t('common.loading')}</div>
    }

    if (error) {
        return (
            <div>
                {t('common.error')}: {error}
            </div>
        )
    }

    if (!props.flowerpotData) {
        return <div>{t('flower_measurments.loading_flowerpot_data')}</div>
    }

    const filteredMeasurements = measurements.filter(measurement => {
        const measurementDate = new Date(measurement.createdAt)
        const fromDate = new Date(props.customDateRange.from)
        const toDate = new Date(props.customDateRange.to)

        switch (props.timeRange) {
            case 'day':
                const today = new Date()
                return measurementDate.toDateString() === today.toDateString()
            case 'week':
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return measurementDate >= weekAgo
            case 'month':
                const monthAgo = new Date()
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                return measurementDate >= monthAgo
            case 'custom':
                return measurementDate >= fromDate && measurementDate <= toDate
            default:
                return true
        }
    })

    return (
        <div ref={ref} className="flowerpot-measurement">
            <div className="chart-container">
                <div className="flowerpot-detail">
                    <div className="chart-section">
                        <div className="measurement-chart-header">
                            <H5 variant="secondary" className="chart-header-title">
                                {getTimeRangeLabel()}
                            </H5>
                            <H5 className="chart-header-title">
                                {t(`flower_measurments.measurments.${props.measurementType}`)}
                            </H5>
                        </div>

                        <div className="chart-container">
                            <ChartVizual
                                data={chartData}
                                dataKey={props.measurementType}
                                color={props.color}
                                minValue={props.minValue}
                                maxValue={props.maxValue}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default FlowerpotMeasurment
