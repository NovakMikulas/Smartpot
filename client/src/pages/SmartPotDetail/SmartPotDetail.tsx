import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../../components/Button/Button'
import Loader from '../../components/Loader/Loader'
import { H5 } from '../../components/Text/Heading/Heading'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { selectFlowers } from '../../redux/selectors/flowerDetailSelectors'
import { selectMeasurementsForFlower } from '../../redux/selectors/measurementSelectors'
import { selectSmartPots } from '../../redux/selectors/smartPotSelectors'
import { loadFlowers } from '../../redux/slices/flowersSlice'
import { fetchLatestMeasurements } from '../../redux/slices/measurementsSlice'
import { fetchSmartPots } from '../../redux/slices/smartPotsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import DisconnectSmarpotModal from './DisconnectSmarpotModal/DisconnectSmarpotModal'
import './SmartPotDetail.sass'
import TransplantSmartPot from './TransplantSmartPot/TransplantSmartPot'
const emptySmartPot = require('../../assets/flower_profiles_avatatars/empty-smart-pot.png')

interface SmartPotData {
    serialNumber: string
    status_description: string
    activeFlowerId: string | null
    lastConnection: string
    batteryLevel: number
}

const SmartPotDetail: React.FC = () => {
    const { t } = useTranslation()
    const { smartPotId, householdId } = useParams<{ smartPotId: string; householdId: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const smartPots = useSelector(selectSmartPots)
    const smartPotsLoading = useSelector((state: RootState) => state.smartPots.loading)
    const smartPotsError = useSelector((state: RootState) => state.smartPots.error)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showDisconnectModal, setShowDisconnectModal] = useState(false)
    const [disconnectType, setDisconnectType] = useState<'flower' | 'household'>('flower')
    const [showTransplantModal, setShowTransplantModal] = useState(false)
    const smartPot = smartPots.find(pot => pot._id === smartPotId)
    const flowers = useSelector(selectFlowers)
    const flower = smartPot?.active_flower_id
        ? flowers.find(flower => flower._id === smartPot.active_flower_id)
        : undefined

    const measurements = useSelector((state: RootState) => {
        if (!smartPot?.active_flower_id) return null
        return selectMeasurementsForFlower(state, smartPot.active_flower_id)
    })

    const batteryLevel = measurements?.battery?.[0]?.value ? Number(measurements.battery[0].value) : null

    const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false)
    const [hasMoreMeasurements, setHasMoreMeasurements] = useState(true)
    const [measurementPage, setMeasurementPage] = useState(1)

    const loadMoreMeasurements = useCallback(async () => {
        if (!smartPot?.active_flower_id || !householdId || isLoadingMeasurements || !hasMoreMeasurements) return

        try {
            setIsLoadingMeasurements(true)
            const now = new Date()
            const startDate = new Date(now)
            startDate.setMonth(now.getMonth() - measurementPage)

            const endDate = new Date(now)
            endDate.setMonth(now.getMonth() - (measurementPage - 1))

            const result = await dispatch(
                fetchLatestMeasurements({
                    flowerId: smartPot.active_flower_id,
                    householdId,
                }),
            ).unwrap()

            if (
                !result ||
                (typeof result === 'object' &&
                    Object.values(result).every(arr => Array.isArray(arr) && arr.length === 0))
            ) {
                setHasMoreMeasurements(false)
            } else {
                setMeasurementPage(prev => prev + 1)
            }
        } catch (error) {
        } finally {
            setIsLoadingMeasurements(false)
        }
    }, [dispatch, smartPot?.active_flower_id, householdId, measurementPage, isLoadingMeasurements, hasMoreMeasurements])

    useEffect(() => {
        const loadData = async () => {
            if (householdId) {
                setIsLoading(true)
                try {
                    await Promise.all([dispatch(fetchSmartPots(householdId)), dispatch(loadFlowers(householdId))])
                } catch (error) {
                    setError('Failed to load data')
                } finally {
                    setIsLoading(false)
                }
            }
        }

        loadData()
    }, [dispatch, householdId])

    useEffect(() => {
        if (flower && householdId && !measurements) {
            dispatch(
                fetchLatestMeasurements({
                    flowerId: flower._id,
                    householdId,
                }),
            )
        }
    }, [dispatch, flower, householdId, measurements])

    const handleCloseDisconnectModal = () => {
        setShowDisconnectModal(false)
    }

    if (isLoading || smartPotsLoading) {
        return <Loader />
    }

    if (smartPotsError || error) {
        toast.error(t('smart_pot_detail.error_loading'))
        navigate(`/households/${householdId}/smartPots`)
        return null
    }

    if (!smartPot) {
        toast.error(t('smart_pot_detail.smart_pot_not_found'))
        navigate(`/households/${householdId}/smartPots`)
        return null
    }

    const smartPotData: SmartPotData = {
        serialNumber: smartPot.serial_number,
        status_description: smartPot.active_flower_id ? 'Smart pot je aktívny' : 'Smart pot nie je aktívny',
        activeFlowerId: smartPot.active_flower_id,
        lastConnection: smartPot.createdAt || new Date().toISOString(),
        batteryLevel: batteryLevel || 0,
    }

    return (
        <div className="smart-pot-detail">
            <div className="smart-pot-detail__container">
                <div className="smart-pot-detail__header">
                    <h1 className="smart-pot-detail__title">{smartPotData.serialNumber}</h1>
                    <img
                        src={emptySmartPot}
                        alt={`${smartPotData.serialNumber} smart pot`}
                        className="smart-pot-detail__avatar"
                    />
                </div>

                <div className="smart-pot-detail__info">
                    <div className="smart-pot-detail__info-section">
                        <div className="smart-pot-detail-assigned-flower">
                            <div className="smart-pot-detail-flower-info">
                                {flower ? (
                                    <>
                                        <H5>Assigned into {flower.name}</H5>
                                        <img
                                            src={flower.avatar}
                                            alt="Flower avatar"
                                            className="smart-pot-detail-flower-avatar"
                                        />
                                    </>
                                ) : (
                                    <H5>No flower assigned</H5>
                                )}
                            </div>
                            {smartPotData.activeFlowerId ? (
                                <Button
                                    variant="default"
                                    onClick={() =>
                                        navigate(`/households/${householdId}/flowers/${smartPotData.activeFlowerId}`)
                                    }>
                                    {t('smart_pot_detail.view_flower')}
                                </Button>
                            ) : (
                                <Paragraph variant="secondary">{t('smart_pot_detail.no_flower_assigned')}</Paragraph>
                            )}
                        </div>

                        <div className="smart-pot-detail__info-title">{t('smart_pot_detail.battery_level')}</div>
                        <div className="smart-pot-detail__battery">
                            <div
                                className={`smart-pot-detail__battery-progress ${
                                    batteryLevel && batteryLevel < 30 ? 'low' : ''
                                }`}
                                style={{ '--battery-level': `${smartPotData.batteryLevel}%` } as React.CSSProperties}
                            />
                            <div className="smart-pot-detail__battery-value">{smartPotData.batteryLevel}%</div>
                        </div>
                    </div>

                    <div className="smart-pot-detail__info-section">
                        <div className="smart-pot-detail-info-buttons">
                            <Button variant="default" onClick={() => setShowTransplantModal(true)}>
                                {t('smart_pot_detail.transplant')}
                            </Button>
                            {smartPotData.activeFlowerId && (
                                <Button
                                    variant="warning"
                                    onClick={() => {
                                        setDisconnectType('flower')
                                        setShowDisconnectModal(true)
                                    }}>
                                    {t('smart_pot_detail.disconnect')}
                                </Button>
                            )}
                            <Button
                                variant="warning"
                                onClick={() => {
                                    setDisconnectType('household')
                                    setShowDisconnectModal(true)
                                }}>
                                {t('smart_pot_detail.disconnect_from_household')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {showDisconnectModal && (
                <DisconnectSmarpotModal
                    onClose={handleCloseDisconnectModal}
                    smartPotId={smartPotId || ''}
                    householdId={householdId || ''}
                    serialNumber={smartPotData.serialNumber}
                    type={disconnectType}
                />
            )}

            {showTransplantModal && (
                <TransplantSmartPot
                    isOpen={showTransplantModal}
                    onClose={() => setShowTransplantModal(false)}
                    smartPotId={smartPotId || ''}
                    currentHouseholdId={householdId || ''}
                    serialNumber={smartPotData.serialNumber}
                    activeFlowerId={smartPotData.activeFlowerId}
                />
            )}
        </div>
    )
}

export default SmartPotDetail
