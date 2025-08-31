import { BatteryChargingVertical, Drop, PencilSimple, Sun, Thermometer } from '@phosphor-icons/react'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../../components/Button/Button'
import Loader from '../../components/Loader/Loader'
import { H4 } from '../../components/Text/Heading/Heading'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { selectConnectedSmartPot, selectFlower, selectFlowerpotData } from '../../redux/selectors/flowerDetailSelectors'
import { selectFlowerProfile, selectProfilesLoading } from '../../redux/selectors/flowerProfilesSelectors'
import { selectIsHouseholdOwner } from '../../redux/selectors/houseHoldSelectors'
import {
    selectMeasurementsError,
    selectProcessedMeasurements,
    selectWebSocketStatus,
} from '../../redux/selectors/measurementSelectors'
import { selectSchedule } from '../../redux/selectors/scheduleSelectors'
import { loadFlowerProfiles } from '../../redux/slices/flowerProfilesSlice'
import {
    detachFlowerFromPotThunk,
    loadFlowerDetails,
    removeFlower,
    updateFlowerData,
} from '../../redux/slices/flowersSlice'
import { fetchMeasurementsForFlower } from '../../redux/slices/measurementsSlice'
import { loadSchedule } from '../../redux/slices/scheduleSlice'
import { fetchInactiveSmartPots, fetchSmartPots, updateSmartPotThunk } from '../../redux/slices/smartPotsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import './FlowerDetail.sass'
import EditFlowerHousehold from './Modals/EditFlowerHousehold/EditFlowerHousehold'
import CurrentStatus from './PageComponents/CurrentStatus/CurrentStatus'
import FlowerpotMeasurment from './PageComponents/FlowerpotMeasurment/FlowerpotMeasurment'
import HeaderSection from './PageComponents/HeaderSection/HeaderSection'
import MeasurementsList from './PageComponents/MeasurementsList/MeasurementsList'
import ProfileSection from './PageComponents/ProfileSection/ProfileSection'
import ScheduleSection from './PageComponents/ScheduleSection/ScheduleSection'
import TimeRangeControls from './PageComponents/TimeRangeControls/TimeRangeControls'

type FlowerpotMeasurementType = 'humidity' | 'temperature' | 'light' | 'battery'

const measurementIcons = [
    { type: 'humidity', icon: <Drop size={24} />, label: 'Humidity' },
    { type: 'temperature', icon: <Thermometer size={24} />, label: 'Temperature' },
    { type: 'light', icon: <Sun size={24} />, label: 'Light' },
    { type: 'battery', icon: <BatteryChargingVertical size={24} />, label: 'Battery' },
]

const measurementTypeColors = {
    humidity: '#3498db',
    temperature: '#e74c3c',
    light: '#f1c40f',
    battery: '#2ecc71',
}

const FlowerDetail: React.FC = () => {
    const { t } = useTranslation()
    const { flowerId, householdId } = useParams<{ flowerId: string; householdId: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'custom'>('day')
    const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' })
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isTransplantModalOpen, setIsTransplantModalOpen] = useState(false)
    const navigate = useNavigate()
    const [selectedMeasurementType, setSelectedMeasurementType] = useState<FlowerpotMeasurementType>('humidity')

    const flower = useSelector(selectFlower)
    const flowerProfileData = useSelector((state: RootState) => selectFlowerProfile(state, flowerId || ''))
    const profilesLoading = useSelector(selectProfilesLoading)
    const processedMeasurements = useSelector((state: RootState) => selectProcessedMeasurements(state, flowerId || ''))
    const error = useSelector(selectMeasurementsError)
    const schedule = useSelector(selectSchedule)
    const connectedSmartPot = useSelector((state: RootState) => selectConnectedSmartPot(state, flowerId || ''))
    const isOwner = useSelector((state: RootState) => selectIsHouseholdOwner(state, householdId || ''))
    const flowerpotData = useSelector((state: RootState) => selectFlowerpotData(state, flowerId || ''))
    const webSocketStatus = useSelector(selectWebSocketStatus)

    const batteryStatus = useMemo(() => {
        if (!processedMeasurements?.battery || processedMeasurements.battery.length === 0) return null
        const lastBatteryValue = Number(processedMeasurements.battery[0].value)
        return {
            value: lastBatteryValue,
            hasWarning: lastBatteryValue < 30 || lastBatteryValue > 100,
        }
    }, [processedMeasurements])

    const handleDisconnectFlower = async () => {
        if (!flowerId || !householdId) return

        try {
            await dispatch(detachFlowerFromPotThunk(flowerId)).unwrap()
            toast.success(t('flower_detail.disconnect_success_toast'))
            await Promise.all([
                dispatch(fetchSmartPots(householdId)).unwrap(),
                dispatch(fetchInactiveSmartPots(householdId)).unwrap(),
                dispatch(loadFlowerProfiles()).unwrap(),
            ])
        } catch (error) {
            toast.error(t('flower_detail.disconnect_error_fallback_toast'))
        }
    }

    const handleDeleteFlower = async () => {
        if (!flowerId) return
        try {
            if (connectedSmartPot && flower?.serial_number) {
                await dispatch(
                    updateSmartPotThunk({
                        serialNumber: connectedSmartPot.serial_number,
                        activeFlowerId: null,
                        householdId: connectedSmartPot.household_id,
                    }),
                ).unwrap()
                await dispatch(
                    updateFlowerData({
                        id: flowerId,
                        flower: { serial_number: null },
                    }),
                ).unwrap()
            }
            await dispatch(removeFlower(flowerId)).unwrap()
            toast.success(t('flower_detail.delete_success_toast'))
            navigate(`/households/${householdId}/flowers`)
        } catch (error) {
            toast.error(t('flower_detail.delete_error_toast'))
        }
    }

    useEffect(() => {
        if (flowerId && householdId) {
            const loadInitialData = async () => {
                try {
                    setIsLoading(true)

                    const promises = [
                        dispatch(loadFlowerDetails(flowerId)),
                        dispatch(loadFlowerProfiles()),
                        dispatch(loadSchedule(flowerId)),
                    ]

                    await Promise.all(promises)

                    const now = new Date()
                    const startDate = new Date(now)
                    startDate.setMonth(now.getMonth() - 1)
                    const dateFrom = startDate.toISOString().split('T')[0]
                    const dateTo = now.toISOString().split('T')[0]

                    await dispatch(
                        fetchMeasurementsForFlower({
                            flowerId,
                            householdId,
                            dateFrom,
                            dateTo,
                        }),
                    ).unwrap()
                } catch (error) {
                    toast.error(t('flower_detail.error_loading_data'))
                } finally {
                    setIsLoading(false)
                }
            }

            loadInitialData()

            return () => {}
        }
    }, [dispatch, flowerId, householdId])

    const handleTimeRangeChange = (range: 'day' | 'week' | 'month' | 'custom') => {
        setTimeRange(range)
        if (range !== 'custom') {
            setCustomDateRange({ from: '', to: '' })
        }
    }

    const handleCustomDateRangeChange = (range: { from: string; to: string }) => {
        setCustomDateRange(range)
    }

    if (isLoading || !flower || !flowerpotData || profilesLoading) {
        return <Loader />
    }

    if (flower && flower._id !== flowerId) {
        return <Loader />
    }

    if (!flowerId || !householdId) {
        navigate(`/households/${householdId}/flowers`)
        toast.error(t('flower_detail.missing_params'))
        return null
    }

    if (error) {
        navigate(`/households/${householdId}/flowers`)
        toast.error(t('flower_detail.error_loading'))
        return null
    }

    if (!flower) {
        navigate(`/households/${householdId}/flowers`)
        toast.error(t('flower_detail.flower_not_found'))
        return null
    }

    if (!flowerpotData) {
        return <Loader />
    }

    return (
        <div className="flower-detail-container">
            {householdId && (
                <HeaderSection
                    flowerpotData={{
                        name: flowerpotData.name,
                        flower_avatar: flowerpotData.flower_avatar || '',
                    }}
                    flower={flower}
                    connectedSmartPot={connectedSmartPot}
                    householdId={householdId}
                    batteryStatus={batteryStatus}
                    onEditClick={() => setIsEditModalOpen(true)}
                />
            )}

            {flowerId && householdId && flowerpotData && (
                <div className="measurements-container">
                    <div className="measurements-content">
                        {processedMeasurements && (
                            <CurrentStatus measurements={processedMeasurements} flower={flower} />
                        )}

                        <div className="measurements-chart-row">
                            <div className="chart-center">
                                <FlowerpotMeasurment
                                    flowerId={flowerId}
                                    householdId={householdId}
                                    flowerpotData={{
                                        humidity_measurement: flowerpotData.humidity_measurement,
                                        temperature_measurement: flowerpotData.temperature_measurement,
                                        light_measurement: flowerpotData.light_measurement,
                                        battery_measurement: flowerpotData.battery_measurement,
                                    }}
                                    measurementType={selectedMeasurementType}
                                    timeRange={timeRange}
                                    customDateRange={customDateRange}
                                    onTimeRangeChange={handleTimeRangeChange}
                                    onCustomDateRangeChange={handleCustomDateRangeChange}
                                    color={measurementTypeColors[selectedMeasurementType]}
                                    minValue={
                                        selectedMeasurementType === 'battery'
                                            ? 0
                                            : flower?.profile?.[selectedMeasurementType]?.min ||
                                              (processedMeasurements?.[selectedMeasurementType]?.length
                                                  ? Math.min(
                                                        ...processedMeasurements[selectedMeasurementType].map(m =>
                                                            Number(m.value),
                                                        ),
                                                    )
                                                  : 0)
                                    }
                                    maxValue={
                                        selectedMeasurementType === 'battery'
                                            ? 100
                                            : flower?.profile?.[selectedMeasurementType]?.max ||
                                              (processedMeasurements?.[selectedMeasurementType]?.length
                                                  ? Math.max(
                                                        ...processedMeasurements[selectedMeasurementType].map(m =>
                                                            Number(m.value),
                                                        ),
                                                    )
                                                  : 100)
                                    }
                                />
                            </div>
                            <div className="controls-container">
                                <div className="measurement-icons">
                                    {measurementIcons.map(({ type, icon }) => (
                                        <button
                                            key={type}
                                            className={`icon-button ${
                                                selectedMeasurementType === type ? 'active' : ''
                                            }`}
                                            onClick={() =>
                                                setSelectedMeasurementType(type as FlowerpotMeasurementType)
                                            }>
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="time-range-controls-row">
                            <TimeRangeControls
                                timeRange={timeRange}
                                customDateRange={customDateRange}
                                onTimeRangeChange={handleTimeRangeChange}
                                onCustomDateRangeChange={handleCustomDateRangeChange}
                            />
                        </div>
                    </div>
                </div>
            )}

            <MeasurementsList flowerId={flowerId || ''} measurementType={selectedMeasurementType} />

            {flower?.profile && <ProfileSection flower={flower} isLoading={profilesLoading} />}

            <ScheduleSection flower={flower} schedules={schedule ? [schedule] : []} isLoading={isLoading} />

            <div className="transplant-container">
                <div className="flower-detail-transplant-title-container">
                    <H4>{t('flower_detail.transplant')} </H4>
                    <PencilSimple
                        size={20}
                        color="#ebe6e6"
                        className="pencil-icon"
                        onClick={() => setIsTransplantModalOpen(true)}
                    />
                </div>
                <Paragraph size="sm">{t('flower_detail.transplant_description')}</Paragraph>
            </div>

            <div className="flower-detail-buttons-container">
                <Button onClick={() => navigate(`/households/${householdId}/flowers`)}>
                    {t('flower_detail.back_to_list')}
                </Button>
                <Button variant="warning" onClick={handleDisconnectFlower} disabled={!flower?.serial_number}>
                    {t('flower_detail.disconnect_flower')}
                </Button>

                {isOwner && (
                    <Button variant="warning" onClick={handleDeleteFlower}>
                        {t('flower_detail.delete_flower_button_text')}
                    </Button>
                )}
            </div>

            {isTransplantModalOpen && (
                <EditFlowerHousehold
                    isOpen={isTransplantModalOpen}
                    onClose={() => setIsTransplantModalOpen(false)}
                    flowerId={flowerId || ''}
                    currentHouseholdId={householdId || ''}
                    hasSmartPot={!!connectedSmartPot}
                    smartPotId={connectedSmartPot?._id}
                />
            )}
        </div>
    )
}

export default FlowerDetail
