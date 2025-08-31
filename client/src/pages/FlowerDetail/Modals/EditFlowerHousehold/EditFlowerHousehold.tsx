import { AnimatePresence, motion } from 'framer-motion'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import GradientDiv from '../../../../components/GradientDiv/GradientDiv'
import { H5 } from '../../../../components/Text/Heading/Heading'
import { selectUser } from '../../../../redux/selectors/authSelectors'
import { selectFlowers } from '../../../../redux/selectors/flowerDetailSelectors'
import { selectHouseholds } from '../../../../redux/selectors/houseHoldSelectors'
import { selectSmartPots } from '../../../../redux/selectors/smartPotSelectors'
import {
    loadFlowerDetails,
    transplantFlowerToSmartPotThunk,
    transplantFlowerWithSmartPotThunk,
    transplantFlowerWithoutSmartPotThunk,
} from '../../../../redux/slices/flowersSlice'
import { fetchSmartPots } from '../../../../redux/slices/smartPotsSlice'
import { AppDispatch } from '../../../../redux/store/store'
import { Flower, SmartPot } from '../../../../types/flowerTypes'
import { Household } from '../../../../types/householdTypes'
import './EditFlowerHousehold.sass'

interface EditFlowerHouseholdProps {
    isOpen: boolean
    onClose: () => void
    flowerId: string
    currentHouseholdId: string
    hasSmartPot: boolean
    smartPotId?: string
}

interface SmartPotSelectProps {
    availableSmartPots: SmartPot[]
    selectedSmartPotId: string
    onSelect: (id: string) => void
}

interface HouseholdSelectProps {
    households: Household[]
    currentHouseholdId: string
    selectedHouseholdId: string
    onSelect: (id: string) => void
}

interface FlowerSelectProps {
    availableFlowers: Flower[]
    selectedFlowerId: string
    onSelect: (id: string) => void
}

const SmartPotSelect = React.memo<SmartPotSelectProps>(({ availableSmartPots, selectedSmartPotId, onSelect }) => {
    const { t } = useTranslation()
    return (
        <div className="edit-flower-household-form-group">
            <label className="edit-flower-household-label">{t('flower_detail.select_smart_pot')}</label>
            {availableSmartPots.length > 0 ? (
                <select
                    className="edit-flower-household-select"
                    value={selectedSmartPotId}
                    onChange={e => onSelect(e.target.value)}>
                    <option value="">{t('flower_detail.select_smart_pot_placeholder')}</option>
                    {availableSmartPots.map(pot => (
                        <option key={pot._id} value={pot._id}>
                            {pot.serial_number}
                        </option>
                    ))}
                </select>
            ) : (
                <div className="edit-flower-household-no-smartpots">{t('flower_detail.no_smartpots_available')}</div>
            )}
        </div>
    )
})

const HouseholdSelect = React.memo<HouseholdSelectProps>(
    ({ households, currentHouseholdId, selectedHouseholdId, onSelect }) => {
        const { t } = useTranslation()
        return (
            <div className="edit-flower-household-form-group">
                <label className="edit-flower-household-label">{t('flower_detail.select_new_household')}</label>
                <select
                    className="edit-flower-household-select"
                    value={selectedHouseholdId}
                    onChange={e => onSelect(e.target.value)}>
                    <option value="">{t('flower_detail.select_household_placeholder')}</option>
                    {households
                        .filter(h => h._id !== currentHouseholdId)
                        .map(household => (
                            <option key={household._id} value={household._id}>
                                {household.name}
                            </option>
                        ))}
                </select>
            </div>
        )
    },
)

const FlowerSelect = React.memo<FlowerSelectProps>(({ availableFlowers, selectedFlowerId, onSelect }) => {
    const { t } = useTranslation()
    return (
        <div className="edit-flower-household-form-group">
            <label className="edit-flower-household-label">{t('flower_detail.select_flower')}</label>
            {availableFlowers.length > 0 ? (
                <select
                    className="edit-flower-household-select"
                    value={selectedFlowerId}
                    onChange={e => onSelect(e.target.value)}>
                    <option value="">{t('flower_detail.select_flower_placeholder')}</option>
                    {availableFlowers.map(flower => (
                        <option key={flower._id} value={flower._id}>
                            {flower.name}
                        </option>
                    ))}
                </select>
            ) : (
                <div className="edit-flower-household-no-flowers">{t('flower_detail.no_flowers_available')}</div>
            )}
        </div>
    )
})

const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        },
    },
}

const EditFlowerHousehold: React.FC<EditFlowerHouseholdProps> = ({
    isOpen,
    onClose,
    flowerId,
    currentHouseholdId,
    hasSmartPot,
    smartPotId,
}) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>('')
    const [keepSmartPot, setKeepSmartPot] = useState<boolean>(true)
    const [assignSmartPot, setAssignSmartPot] = useState<boolean>(false)
    const [selectedFlowerId, setSelectedFlowerId] = useState<string>('')
    const [selectedSmartPotId, setSelectedSmartPotId] = useState<string>('')
    const [transplantType, setTransplantType] = useState<'same_household' | 'different_household'>('same_household')
    const [loading, setLoading] = useState(false)

    const households = useSelector(selectHouseholds) as Household[]
    const flowers = useSelector(selectFlowers) as Flower[]
    const smartPots = useSelector(selectSmartPots) as SmartPot[]
    const user = useSelector(selectUser)

    const currentHousehold = useMemo(
        () => households.find(h => h._id === currentHouseholdId),
        [households, currentHouseholdId],
    )

    const isOwner = useMemo(() => currentHousehold?.owner === user?.id, [currentHousehold, user])

    const availableFlowers = useMemo(
        () =>
            flowers.filter(
                (flower: Flower) =>
                    flower.household_id === currentHouseholdId && flower._id !== flowerId && !flower.serial_number,
            ),
        [flowers, currentHouseholdId, flowerId],
    )

    const availableSmartPots = useMemo(
        () =>
            smartPots.filter(
                (pot: SmartPot) => pot.household_id === currentHouseholdId && pot.active_flower_id === null,
            ),
        [smartPots, currentHouseholdId],
    )

    const handleSameHouseholdTransplant = useCallback(async () => {
        if (!selectedSmartPotId) {
            throw new Error(t('flower_detail.error.no_smart_pot_selected'))
        }

        await dispatch(
            transplantFlowerToSmartPotThunk({
                flowerId,
                targetSmartPotId: selectedSmartPotId,
                householdId: currentHouseholdId,
            }),
        ).unwrap()

        await dispatch(fetchSmartPots(currentHouseholdId))
        await dispatch(loadFlowerDetails(flowerId))
        toast.success(t('flower_detail.transplant_success'))
        onClose()
    }, [dispatch, flowerId, selectedSmartPotId, currentHouseholdId, t, onClose])

    const handleDifferentHouseholdWithSmartPot = useCallback(async () => {
        if (!smartPotId) {
            throw new Error('No smart pot ID provided')
        }

        const currentSmartPot = smartPots.find(pot => pot._id === smartPotId)
        if (!currentSmartPot) {
            throw new Error('Smart pot not found')
        }

        await dispatch(
            transplantFlowerWithSmartPotThunk({
                smartPotSerialNumber: currentSmartPot.serial_number,
                targetHouseholdId: selectedHouseholdId,
            }),
        ).unwrap()

        await dispatch(fetchSmartPots(currentHouseholdId))
        await dispatch(fetchSmartPots(selectedHouseholdId))
        await dispatch(loadFlowerDetails(flowerId))
        toast.success(t('flower_detail.transplant_success'))
        navigate(`/households/${selectedHouseholdId}/flowers`)
        onClose()
    }, [dispatch, flowerId, smartPotId, selectedHouseholdId, currentHouseholdId, t, navigate, onClose, smartPots])

    const handleDifferentHouseholdWithoutSmartPot = useCallback(async () => {
        await dispatch(
            transplantFlowerWithoutSmartPotThunk({
                flowerId,
                targetHouseholdId: selectedHouseholdId,
                assignOldSmartPot: assignSmartPot,
                newFlowerId: selectedFlowerId,
            }),
        ).unwrap()

        await dispatch(fetchSmartPots(currentHouseholdId))
        await dispatch(fetchSmartPots(selectedHouseholdId))
        await dispatch(loadFlowerDetails(flowerId))
        toast.success(t('flower_detail.transplant_success'))
        navigate(`/households/${selectedHouseholdId}/flowers`)
        onClose()
    }, [
        dispatch,
        flowerId,
        selectedHouseholdId,
        assignSmartPot,
        selectedFlowerId,
        currentHouseholdId,
        t,
        navigate,
        onClose,
    ])

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            setLoading(true)

            try {
                if (transplantType === 'same_household') {
                    await handleSameHouseholdTransplant()
                } else {
                    if (!selectedHouseholdId) {
                        throw new Error(t('flower_detail.error.no_household_selected'))
                    }

                    if (hasSmartPot && keepSmartPot) {
                        await handleDifferentHouseholdWithSmartPot()
                    } else {
                        await handleDifferentHouseholdWithoutSmartPot()
                    }
                }
            } catch (error) {
                console.error(t('flower_detail.error.transplant_error_console'), error)
                toast.error(t('flower_detail.transplant_error'))
            } finally {
                setLoading(false)
            }
        },
        [
            transplantType,
            selectedHouseholdId,
            hasSmartPot,
            keepSmartPot,
            handleSameHouseholdTransplant,
            handleDifferentHouseholdWithSmartPot,
            handleDifferentHouseholdWithoutSmartPot,
            t,
        ],
    )

    const isSubmitDisabled = useMemo(
        () =>
            loading ||
            (transplantType === 'same_household' && !selectedSmartPotId) ||
            (transplantType === 'different_household' &&
                ((isOwner && !selectedHouseholdId) || (assignSmartPot && !selectedFlowerId))),
        [loading, transplantType, selectedSmartPotId, isOwner, selectedHouseholdId, assignSmartPot, selectedFlowerId],
    )

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="edit-flower-household-container"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={modalVariants}>
                    <GradientDiv className="edit-flower-household-content">
                        <button className="edit-flower-household-close-button" onClick={onClose}>
                            ×
                        </button>
                        <H5 variant="primary">{t('flower_detail.transplant_title')}</H5>

                        <form onSubmit={handleSubmit} className="edit-flower-household-form">
                            <div className="edit-flower-household-form-group">
                                <label className="edit-flower-household-label">
                                    {t('flower_detail.current_household')}
                                </label>
                                <div className="edit-flower-household-current">{currentHousehold?.name}</div>
                            </div>

                            <div className="edit-flower-household-form-group">
                                <label className="edit-flower-household-label">
                                    {t('flower_detail.transplant_type')}
                                </label>
                                <div className="edit-flower-household-radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            checked={transplantType === 'same_household'}
                                            onChange={() => setTransplantType('same_household')}
                                        />
                                        {t('flower_detail.same_household')}
                                    </label>
                                    {isOwner && (
                                        <label>
                                            <input
                                                type="radio"
                                                checked={transplantType === 'different_household'}
                                                onChange={() => setTransplantType('different_household')}
                                            />
                                            {t('flower_detail.different_household')}
                                        </label>
                                    )}
                                </div>
                            </div>

                            {transplantType === 'same_household' ? (
                                <SmartPotSelect
                                    availableSmartPots={availableSmartPots}
                                    selectedSmartPotId={selectedSmartPotId}
                                    onSelect={setSelectedSmartPotId}
                                />
                            ) : (
                                <>
                                    {isOwner && (
                                        <HouseholdSelect
                                            households={households}
                                            currentHouseholdId={currentHouseholdId}
                                            selectedHouseholdId={selectedHouseholdId}
                                            onSelect={setSelectedHouseholdId}
                                        />
                                    )}

                                    {hasSmartPot && (
                                        <div className="edit-flower-household-form-group">
                                            <label className="edit-flower-household-label">
                                                {t('flower_detail.keep_smart_pot')}
                                            </label>
                                            <div className="edit-flower-household-radio-group">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        checked={keepSmartPot}
                                                        onChange={() => setKeepSmartPot(true)}
                                                    />
                                                    {t('flower_detail.yes')}
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        checked={!keepSmartPot}
                                                        onChange={() => setKeepSmartPot(false)}
                                                    />
                                                    {t('flower_detail.no')}
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {!keepSmartPot && (
                                        <div className="edit-flower-household-form-group">
                                            <label className="edit-flower-household-label">
                                                {t('flower_detail.assign_new_smart_pot')}
                                            </label>
                                            <div className="edit-flower-household-radio-group">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        checked={assignSmartPot}
                                                        onChange={() => setAssignSmartPot(true)}
                                                    />
                                                    {t('flower_detail.yes')}
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        checked={!assignSmartPot}
                                                        onChange={() => setAssignSmartPot(false)}
                                                    />
                                                    {t('flower_detail.no')}
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {!keepSmartPot && assignSmartPot && (
                                        <FlowerSelect
                                            availableFlowers={availableFlowers}
                                            selectedFlowerId={selectedFlowerId}
                                            onSelect={setSelectedFlowerId}
                                        />
                                    )}
                                </>
                            )}

                            <button type="submit" className="edit-flower-household-button" disabled={isSubmitDisabled}>
                                {loading ? t('flower_detail.transplanting') : t('flower_detail.confirm_transplant')}
                            </button>
                        </form>
                    </GradientDiv>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default React.memo(EditFlowerHousehold)
