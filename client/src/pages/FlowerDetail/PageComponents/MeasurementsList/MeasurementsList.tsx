import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { TranslationFunction } from '../../../../i18n'
import { selectFilteredMeasurements } from '../../../../redux/selectors/measurementSelectors'
import { RootState } from '../../../../redux/store/store'
import './MeasurementsList.sass'

type FlowerpotMeasurementType = 'humidity' | 'temperature' | 'light' | 'battery'

interface MeasurementsListProps {
    flowerId: string
    measurementType: FlowerpotMeasurementType
}

const MeasurementsList: React.FC<MeasurementsListProps> = ({ flowerId, measurementType }) => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const [selectedDate, setSelectedDate] = useState<string>('')

    const filteredMeasurements = useSelector(
        (state: RootState) => selectFilteredMeasurements(state, flowerId, measurementType, selectedDate),
        (prev, next) => {
            if (!prev || !next) return false
            if (prev.length !== next.length) return false
            return prev.every((m, i) => m._id === next[i]._id)
        },
    )

    const getMeasurementLabel = () => {
        switch (measurementType) {
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
        switch (measurementType) {
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

    return (
        <div className="measurement-list-measurement">
            <div className="chart-header">
                <h3 className="chart-title">
                    {t(`flower_measurments.measurments.${measurementType}`)} {t('flower_measurments.measurements')}
                </h3>
                <div className="date-picker">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            <div className="measurement-list-container">
                <div className="measurements-grid">
                    {filteredMeasurements.length > 0 ? (
                        filteredMeasurements.map(measurement => (
                            <div key={measurement._id} className="measurement-item">
                                <span className="measurement-title">{formatDate(measurement.createdAt)}</span>
                                <span className="measurement-value">
                                    {measurement.value}
                                    {getMeasurementUnit()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="measurement-item">
                            <span className="measurement-title">{t('flower_measurments.no_measurements')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MeasurementsList
