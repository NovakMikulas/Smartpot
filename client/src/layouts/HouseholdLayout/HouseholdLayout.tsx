import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { selectUserId } from '../../redux/selectors/authSelectors'
import { selectHouseholds, selectIsHouseholdOwner } from '../../redux/selectors/houseHoldSelectors'
import { getInvited, getMembers } from '../../redux/services/householdsApi'
import { loadFlowerProfiles } from '../../redux/slices/flowerProfilesSlice'
import { loadFlowers } from '../../redux/slices/flowersSlice'
import { loadHouseholds } from '../../redux/slices/householdsSlice'
import { fetchLatestMeasurements } from '../../redux/slices/measurementsSlice'
import { fetchInactiveSmartPots, fetchSmartPots } from '../../redux/slices/smartPotsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import { Household } from '../../types/householdTypes'

import './HouseholdLayout.sass'

import { useNavigate } from 'react-router-dom'

import { CaretRight, Flower, Gear, House, PottedPlant, Users } from '@phosphor-icons/react'
import Loader from '../../components/Loader/Loader'
import SettingsInHousehold from '../../components/SettingsInHousehold/SettingsInHousehold'

const HouseholdLayout = () => {
    const { householdId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const { t } = useTranslation()

    const households = useSelector(selectHouseholds)
    const userId = useSelector(selectUserId)
    const householdsLoading = useSelector((state: RootState) => state.households.loading)
    const isOwner = useSelector((state: RootState) => selectIsHouseholdOwner(state, householdId || ''))
    const household = useMemo(() => households.find((h: Household) => h._id === householdId), [households, householdId])

    const [accessStatus, setAccessStatus] = useState<'checking' | 'granted' | 'denied'>('checking')
    const [initialLoadAttempted, setInitialLoadAttempted] = useState(false)
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [members, setMembers] = useState<Array<{ _id: string; email: string }>>([])
    const [invitedMembers, setInvitedMembers] = useState<Array<{ _id: string; email: string }>>([])

    
    const contextValue = useMemo(
        () => ({
            members,
            invitedMembers,
            setMembers,
            setInvitedMembers,
            household,
            isOwner,
        }),
        [members, invitedMembers, household, isOwner],
    )

   
    useEffect(() => {
        if (!initialLoadAttempted) {
            dispatch(loadHouseholds())
            setInitialLoadAttempted(true)
        }
    }, [dispatch, initialLoadAttempted])

    
    useEffect(() => {
        if (householdId && initialLoadAttempted) {
            const loadAllData = async () => {
                setIsDataLoading(true)
                try {
                    const [flowersResponse] = await Promise.all([
                        dispatch(loadFlowers(householdId)),
                        dispatch(loadFlowerProfiles()),
                        dispatch(fetchSmartPots(householdId)),
                        dispatch(fetchInactiveSmartPots(householdId)),
                        
                        getMembers(householdId).then(response => setMembers(response.data)),
                        getInvited(householdId).then(response => setInvitedMembers(response.data)),
                    ])

                    
                    const flowers = flowersResponse.payload
                    if (Array.isArray(flowers)) {
                        await Promise.all(
                            flowers.map(flower =>
                                dispatch(
                                    fetchLatestMeasurements({
                                        flowerId: flower._id,
                                        householdId,
                                    }),
                                ),
                            ),
                        )
                    }
                } catch (error) {
                    toast.error('Error loading household data')
                } finally {
                    setIsDataLoading(false)
                }
            }
            loadAllData()
        }
    }, [dispatch, householdId, initialLoadAttempted])

    
    useEffect(() => {
        if (householdsLoading || !initialLoadAttempted) {
            return
        }

        if (!householdId) {
            setAccessStatus('denied')
            navigate('/households', { replace: true })
            return
        }

        const currentHouseholdExists = households.some((h: Household) => h._id === householdId)

        if (currentHouseholdExists) {
            setAccessStatus('granted')
        } else {
            toast.error(t('households.access_denied_toast'))
            setAccessStatus('denied')
            navigate('/households', { replace: true })
        }
    }, [householdsLoading, householdId, households, navigate, t, initialLoadAttempted])

    const getActiveClass = (path: string) => {
        return location.pathname.includes(path) ? 'active' : ''
    }

    if (householdsLoading || accessStatus === 'checking' || (isDataLoading && !household)) {
        return <Loader />
    }

    return (
        <>
            <div className="navigation-indicator">
                <CaretRight size={32} weight="bold" />
            </div>
            <div className="household-layout__navigation">
                <House size={32} color="#bfbfbf" onClick={() => navigate(`/households/`)} />
                <Flower
                    size={32}
                    color="#bfbfbf"
                    onClick={() => navigate(`/households/${householdId}/flowers`)}
                    className={getActiveClass('flowers')}
                />
                <PottedPlant
                    size={32}
                    color="#bfbfbf"
                    onClick={() => navigate(`/households/${householdId}/smartPots`)}
                    className={getActiveClass('smartPots')}
                />
                {isOwner && (
                    <Users
                        size={32}
                        color="#bfbfbf"
                        onClick={() => navigate(`/households/${householdId}/members`)}
                        className={getActiveClass('members')}
                    />
                )}
                <Gear
                    size={32}
                    color="#bfbfbf"
                    onClick={() => setIsSettingsOpen(true)}
                    className={getActiveClass('settings')}
                />
            </div>
            <Outlet context={contextValue} />
            <SettingsInHousehold
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                householdId={householdId || ''}
            />
        </>
    )
}

export default HouseholdLayout
