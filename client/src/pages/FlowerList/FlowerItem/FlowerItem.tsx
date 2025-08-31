import { WarningCircle } from 'phosphor-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H4 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
import { selectMeasurementsForFlower } from '../../../redux/selectors/measurementSelectors'
import { RootState } from '../../../redux/store/store'
import './FlowerItem.sass'

interface FlowerItemProps {
    name: string
    flowerpot?: string
    id: string
    householdId: string
    avatar?: string
    profile?: {
        temperature: { min: number; max: number }
        humidity: { min: number; max: number }
        light: { min: number; max: number }
    }
}

const FlowerItem: React.FC<FlowerItemProps> = ({ name, flowerpot, id, householdId, avatar, profile }) => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showWarning, setShowWarning] = useState(false)
    const [isImageLoaded, setIsImageLoaded] = useState(false)

    const measurements = useSelector((state: RootState) => selectMeasurementsForFlower(state, id))

    const checkMeasurementLimits = (type: 'temperature' | 'humidity' | 'light' | 'battery', value: number): boolean => {
        if (type === 'battery') {
            return value < 30 || value > 100
        }

        const limits = profile?.[type]
        if (!limits) return false

        return value < limits.min || value > limits.max
    }

    useEffect(() => {
        if (!measurements) {
            setShowWarning(false)
            return
        }

        const relevantWarningTypes: Array<keyof Omit<typeof measurements, 'lastChange'>> = [
            'temperature',
            'humidity',
            'light',
            'battery',
        ]

        const hasWarning = relevantWarningTypes.some(type => {
            const valuesArray = measurements[type]
            if (!Array.isArray(valuesArray) || valuesArray.length === 0) {
                return false
            }
            const lastValue = Number(valuesArray[0].value)

            if (type === 'temperature' || type === 'humidity' || type === 'light' || type === 'battery') {
                return checkMeasurementLimits(type, lastValue)
            }
            return false
        })

        setShowWarning(hasWarning)
    }, [measurements, profile])

    const handleDetailsClick = () => {
        if (householdId) {
            navigate(`/households/${householdId}/flowers/${id}`)
        }
    }

    return (
        <div className="flower-item-wrapper">
            <GradientDiv className="flower-item-container" onClick={handleDetailsClick}>
                <div className="flower-item-content">
                    <div className="flower-item-header">
                        <div className="flower-item-header-content">
                            <H4 variant="primary" className="flower-item-name">
                                {name}
                            </H4>
                            {profile ? (
                                <div className="flower-item-profile-label">{t('flower_list.profile.assigned')}</div>
                            ) : (
                                <div className="flower-item-profile-label flower-item-own-settings">
                                    {t('flower_list.profile.not_assigned')}
                                </div>
                            )}
                            {flowerpot ? (
                                <div className="flower-item-flowerpot-label">{flowerpot}</div>
                            ) : (
                                <div className="flower-item-flowerpot-label flower-item-no-flowerpot">
                                    No flowerpot assigned
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flower-item-image">
                    <img
                        src={avatar}
                        alt={`${name} flower pot`}
                        className={`flower-item-image-img ${isImageLoaded ? 'loaded' : ''}`}
                        onLoad={() => setIsImageLoaded(true)}
                        onError={e => {
                            const target = e.target as HTMLImageElement
                            target.src = '/default-flower.png'
                            setIsImageLoaded(true)
                        }}
                    />
                </div>
                {showWarning && (
                    <div className="flower-item-warning-wrapper">
                        <WarningCircle size={32} color="#f93333" className="flower-item-warning" />
                    </div>
                )}
            </GradientDiv>
        </div>
    )
}

export default FlowerItem
