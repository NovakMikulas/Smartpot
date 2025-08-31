import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H5 } from '../../../components/Text/Heading/Heading'
import { selectUser } from '../../../redux/selectors/authSelectors'
import { selectFlowers } from '../../../redux/selectors/flowerDetailSelectors'
import { selectHouseholds } from '../../../redux/selectors/houseHoldSelectors'
import { selectSmartPots } from '../../../redux/selectors/smartPotSelectors'
import { loadFlowers, updateFlowerData } from '../../../redux/slices/flowersSlice'
import { loadHouseholds } from '../../../redux/slices/householdsSlice'
import {
    fetchSmartPots,
    transplantSmartPotToFlowerThunk,
    transplantSmartPotWithFlowerThunk,
    transplantSmartPotWithoutFlowerThunk,
    updateSmartPotLocally,
    updateSmartPotThunk,
} from '../../../redux/slices/smartPotsSlice'
import { AppDispatch } from '../../../redux/store/store'
import { Household } from '../../../types/householdTypes'
import { SmartPot } from '../../../types/smartPotTypes'
import './TransplantSmartPot.sass'

interface TransplantSmartPotProps {
    isOpen: boolean
    onClose: () => void
    smartPotId: string
    currentHouseholdId: string
    serialNumber: string
    activeFlowerId?: string | null
}

const TransplantSmartPot: React.FC<TransplantSmartPotProps> = ({
    isOpen,
    onClose,
    smartPotId,
    currentHouseholdId,
    serialNumber,
    activeFlowerId,
}) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>(currentHouseholdId)
    const [selectedFlowerId, setSelectedFlowerId] = useState<string>('')
    const [transplantType, setTransplantType] = useState<'same_household' | 'different_household'>('same_household')
    const [loading, setLoading] = useState(false)
    const [isDataLoaded, setIsDataLoaded] = useState(false)
    const [keepFlower, setKeepFlower] = useState<boolean>(true)
    const [assignFlower, setAssignFlower] = useState<boolean>(false)
    const [selectedNewSmartPotId, setSelectedNewSmartPotId] = useState<string>('')

    const households = useSelector(selectHouseholds) as Household[]
    const flowers = useSelector(selectFlowers)
    const smartPots = useSelector(selectSmartPots) as SmartPot[]
    const user = useSelector(selectUser)

    const currentHousehold = useMemo(
        () => households.find(h => h._id === currentHouseholdId),
        [households, currentHouseholdId],
    )

    const isOwner = useMemo(() => currentHousehold?.owner === user?.id, [currentHousehold, user])

    const availableFlowers = useMemo(
        () => flowers.filter(flower => flower.household_id === currentHouseholdId && !flower.serial_number),
        [flowers, currentHouseholdId],
    )

    const hasAllData = useMemo(() => {
        return households.length > 0 && flowers.length > 0 && smartPots.length > 0
    }, [households, flowers, smartPots])

    const availableNewSmartPots = useMemo(
        () => smartPots.filter(pot => pot.household_id === currentHouseholdId && pot.active_flower_id === null),
        [smartPots, currentHouseholdId],
    )

    const handleSameHouseholdTransplant = async () => {
        if (!selectedFlowerId) {
            throw new Error('No flower selected')
        }

        try {
            const result = await dispatch(
                transplantSmartPotToFlowerThunk({
                    smartPotId,
                    targetFlowerId: selectedFlowerId,
                }),
            ).unwrap()

            if (result.success) {
                if (activeFlowerId) {
                    await dispatch(
                        updateFlowerData({
                            id: activeFlowerId,
                            flower: {
                                serial_number: null,
                            },
                        }),
                    )
                }

                const smartPot = smartPots.find(pot => pot._id === smartPotId)
                if (smartPot) {
                    await dispatch(
                        updateFlowerData({
                            id: selectedFlowerId,
                            flower: {
                                serial_number: smartPot.serial_number,
                            },
                        }),
                    )

                    dispatch(
                        updateSmartPotLocally({
                            smartPotId,
                            updates: {
                                active_flower_id: selectedFlowerId,
                            },
                        }),
                    )
                }

                toast.success(t('smart_pot_detail.transplant_success'))
                onClose()
            } else {
                toast.error(result.message || t('smart_pot_detail.transplant_error'))
            }
        } catch (error) {
            toast.error(t('smart_pot_detail.transplant_error'))
        }
    }

    const handleDifferentHouseholdNoFlower = async () => {
        const smartPot = smartPots.find(smartPot => smartPot._id === smartPotId)

        try {
            await dispatch(
                updateSmartPotThunk({
                    serialNumber: smartPot?.serial_number ?? '',
                    activeFlowerId: null,
                    householdId: selectedHouseholdId,
                }),
            ).unwrap()

            dispatch(
                updateSmartPotLocally({
                    smartPotId,
                    updates: {
                        active_flower_id: null,
                        household_id: selectedHouseholdId,
                    },
                }),
            )

            onClose()
            toast.success(t('smart_pot_detail.transplant_success'))

            if (selectedHouseholdId !== currentHouseholdId) {
                navigate(`/households/${selectedHouseholdId}/smartpots`)
            }
        } catch (error) {
            toast.error(t('smart_pot_detail.transplant_error'))
        }
    }

    const handleDifferentHouseholdKeepFlower = async () => {
        const smartPot = smartPots.find(smartPot => smartPot._id === smartPotId)
        if (!smartPot?.serial_number) {
            toast.error(t('smart_pot_detail.transplant_error'))
            return
        }

        try {
            await dispatch(
                transplantSmartPotWithFlowerThunk({
                    smartPotSerialNumber: smartPot.serial_number,
                    targetHouseholdId: selectedHouseholdId,
                }),
            ).unwrap()

            dispatch(
                updateSmartPotLocally({
                    smartPotId,
                    updates: {
                        household_id: selectedHouseholdId,
                    },
                }),
            )

            toast.success(t('smart_pot_detail.transplant_success'))
            if (selectedHouseholdId !== currentHouseholdId) {
                navigate(`/households/${selectedHouseholdId}/smartpots`)
            }
            onClose()
        } catch (error) {
            toast.error(t('smart_pot_detail.transplant_error'))
        }
    }

    const handleDifferentHouseholdRemoveFlower = async () => {
        try {
            await dispatch(
                transplantSmartPotWithoutFlowerThunk({
                    smartPotId,
                    targetHouseholdId: selectedHouseholdId,
                    assignOldFlower: assignFlower,
                    oldFlowerId: activeFlowerId || '',
                    oldHouseholdId: currentHouseholdId,
                    selectedNewSmartPotId: selectedNewSmartPotId,
                }),
            ).unwrap()

            toast.success(t('smart_pot_detail.transplant_success'))
            if (selectedHouseholdId !== currentHouseholdId) {
                navigate(`/households/${selectedHouseholdId}/smartpots`)
            }
            onClose()
        } catch (error) {
            toast.error(t('smart_pot_detail.transplant_error'))
        }
    }

    useEffect(() => {
        if (isOpen && !hasAllData) {
            const loadData = async () => {
                try {
                    const promises = []

                    if (households.length === 0) {
                        promises.push(dispatch(loadHouseholds()))
                    }
                    if (flowers.length === 0) {
                        promises.push(dispatch(loadFlowers(currentHouseholdId)))
                    }
                    if (smartPots.length === 0) {
                        promises.push(dispatch(fetchSmartPots(currentHouseholdId)))
                    }

                    if (promises.length > 0) {
                        await Promise.all(promises)
                    }
                    setIsDataLoaded(true)
                } catch (error) {
                    toast.error(t('smart_pot_detail.load_error'))
                }
            }

            loadData()
        }
    }, [isOpen, currentHouseholdId, dispatch, hasAllData, households.length, flowers.length, smartPots.length])

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            setLoading(true)

            try {
                if (transplantType === 'same_household') {
                    await handleSameHouseholdTransplant()
                } else {
                    if (!selectedHouseholdId) {
                        throw new Error('No household selected')
                    }

                    if (!activeFlowerId) {
                        await handleDifferentHouseholdNoFlower()
                    } else if (keepFlower && !assignFlower) {
                        await handleDifferentHouseholdKeepFlower()
                    } else if (!keepFlower) {
                        await handleDifferentHouseholdRemoveFlower()
                    }
                }
            } catch (error) {
                toast.error(t('smart_pot_detail.transplant_error'))
            } finally {
                setLoading(false)
            }
        },
        [
            transplantType,
            selectedFlowerId,
            dispatch,
            currentHouseholdId,
            smartPotId,
            selectedHouseholdId,
            t,
            onClose,
            navigate,
            activeFlowerId,
            keepFlower,
            assignFlower,
            selectedNewSmartPotId,
            smartPots,
        ],
    )

    const handleTransplantTypeChange = useCallback((type: 'same_household' | 'different_household') => {
        setTransplantType(type)
    }, [])

    const handleFlowerChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFlowerId(e.target.value)
    }, [])

    const handleHouseholdChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedHouseholdId(e.target.value)
    }, [])

    if (!isOpen) return null

    return (
        <div className="transplant-smart-pot-container">
            <GradientDiv className="transplant-smart-pot-content">
                <button className="transplant-smart-pot-close-button" onClick={onClose}>
                    ×
                </button>
                <H5 variant="primary">{t('smart_pot_detail.transplant_title')}</H5>

                <form onSubmit={handleSubmit} className="transplant-smart-pot-form">
                    <div className="transplant-smart-pot-form-group">
                        <label className="transplant-smart-pot-label">{t('smart_pot_detail.current_household')}</label>
                        <div className="transplant-smart-pot-current">{currentHousehold?.name}</div>
                    </div>

                    <div className="transplant-smart-pot-form-group">
                        <label className="transplant-smart-pot-label">{t('smart_pot_detail.transplant_type')}</label>
                        <div className="transplant-smart-pot-radio-group">
                            <label>
                                <input
                                    type="radio"
                                    checked={transplantType === 'same_household'}
                                    onChange={() => handleTransplantTypeChange('same_household')}
                                />
                                {t('smart_pot_detail.same_household')}
                            </label>
                            {isOwner && (
                                <label>
                                    <input
                                        type="radio"
                                        checked={transplantType === 'different_household'}
                                        onChange={() => handleTransplantTypeChange('different_household')}
                                    />
                                    {t('smart_pot_detail.different_household')}
                                </label>
                            )}
                        </div>
                    </div>

                    {transplantType === 'same_household' ? (
                        <div className="transplant-smart-pot-form-group">
                            <label className="transplant-smart-pot-label">{t('smart_pot_detail.select_flower')}</label>
                            {availableFlowers.length > 0 ? (
                                <select
                                    className="transplant-smart-pot-select"
                                    value={selectedFlowerId}
                                    onChange={handleFlowerChange}>
                                    <option value="">{t('smart_pot_detail.select_flower_placeholder')}</option>
                                    {availableFlowers.map(flower => (
                                        <option key={flower._id} value={flower._id}>
                                            {flower.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="transplant-smart-pot-no-flowers">
                                    {t('smart_pot_detail.no_flowers_available')}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="transplant-smart-pot-form-group">
                                <label className="transplant-smart-pot-label">
                                    {t('smart_pot_detail.select_new_household')}
                                </label>
                                <select
                                    className="transplant-smart-pot-select"
                                    value={selectedHouseholdId}
                                    onChange={handleHouseholdChange}>
                                    <option value="">{t('smart_pot_detail.select_household_placeholder')}</option>
                                    {households
                                        .filter(h => h._id !== currentHouseholdId)
                                        .map(household => (
                                            <option key={household._id} value={household._id}>
                                                {household.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {activeFlowerId && (
                                <>
                                    <div className="transplant-smart-pot-form-group">
                                        <label className="transplant-smart-pot-label">
                                            {t('smart_pot_detail.keep_flower')}
                                        </label>
                                        <div className="transplant-smart-pot-radio-group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    checked={keepFlower}
                                                    onChange={() => setKeepFlower(true)}
                                                />
                                                {t('smart_pot_detail.yes')}
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    checked={!keepFlower}
                                                    onChange={() => setKeepFlower(false)}
                                                />
                                                {t('smart_pot_detail.no')}
                                            </label>
                                        </div>
                                    </div>

                                    {!keepFlower && (
                                        <>
                                            <div className="transplant-smart-pot-form-group">
                                                <label className="transplant-smart-pot-label">
                                                    {t('smart_pot_detail.assign_flower')}
                                                </label>
                                                <div className="transplant-smart-pot-radio-group">
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            checked={assignFlower}
                                                            onChange={() => setAssignFlower(true)}
                                                        />
                                                        {t('smart_pot_detail.yes')}
                                                    </label>
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            checked={!assignFlower}
                                                            onChange={() => setAssignFlower(false)}
                                                        />
                                                        {t('smart_pot_detail.no')}
                                                    </label>
                                                </div>
                                            </div>

                                            {assignFlower && (
                                                <div className="transplant-smart-pot-form-group">
                                                    <label className="transplant-smart-pot-label">
                                                        {t('smart_pot_detail.select_new_smart_pot')}
                                                    </label>
                                                    {availableNewSmartPots.length > 0 ? (
                                                        <select
                                                            className="transplant-smart-pot-select"
                                                            value={selectedNewSmartPotId}
                                                            onChange={e => setSelectedNewSmartPotId(e.target.value)}>
                                                            <option value="">
                                                                {t('smart_pot_detail.select_smart_pot_placeholder')}
                                                            </option>
                                                            {availableNewSmartPots.map(pot => (
                                                                <option key={pot._id} value={pot._id}>
                                                                    {pot.serial_number}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div className="transplant-smart-pot-no-smartpots">
                                                            {t('smart_pot_detail.no_smartpots_available')}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    <button
                        type="submit"
                        className="transplant-smart-pot-button"
                        disabled={Boolean(
                            loading ||
                                (transplantType === 'same_household' && !selectedFlowerId) ||
                                (transplantType === 'different_household' &&
                                    (!selectedHouseholdId ||
                                        (activeFlowerId && !keepFlower && assignFlower && !selectedNewSmartPotId))),
                        )}>
                        {loading ? t('smart_pot_detail.transplanting') : t('smart_pot_detail.confirm_transplant')}
                    </button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default TransplantSmartPot
