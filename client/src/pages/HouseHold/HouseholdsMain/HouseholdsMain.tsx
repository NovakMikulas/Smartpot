import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/Button/Button'
import Loader from '../../../components/Loader/Loader'
import { H2 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
import { selectHouseholds, selectHouseholdsLoading } from '../../../redux/selectors/houseHoldSelectors'
import { selectUser } from '../../../redux/slices/authSlice'
import { loadHouseholds } from '../../../redux/slices/householdsSlice'
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks'
import CreateHousehold from '../CreateHousehold/CreateHousehold'
import HouseHoldItem from '../components/HouseHoldItem/HouseHoldItem'
import './HouseholdsMain.sass'

type FilterType = 'all' | 'owner' | 'member'

const HouseholdsMain: React.FC = () => {
    const dispatch = useAppDispatch()
    const households = useAppSelector(selectHouseholds)
    const loading = useAppSelector(selectHouseholdsLoading)
    const user = useAppSelector(selectUser)
    const userId = user?.id || ''
    const token = localStorage.getItem('token')
    const { t } = useTranslation() as { t: TranslationFunction }
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [filterType, setFilterType] = useState<FilterType>('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (token) {
            dispatch(loadHouseholds())
        }
    }, [dispatch, token])

    const handleCreateHousehold = useCallback(() => {
        setIsCreateModalOpen(true)
    }, [])

    const handleCloseModal = useCallback(() => {
        setIsCreateModalOpen(false)
    }, [])

    const handleCreateSuccess = useCallback(() => {
        setIsCreateModalOpen(false)
    }, [])

    const filteredHouseholds = useMemo(() => {
        if (!Array.isArray(households)) return []
        return households.filter(household => {
            const isOwner = String(household.owner) === userId
            const isMember = Array.isArray(household.members) && household.members.map(String).includes(userId)
            const matchesFilter =
                filterType === 'all' ||
                (filterType === 'owner' && isOwner) ||
                (filterType === 'member' && isMember && !isOwner)
            const matchesSearch = household.name.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesFilter && matchesSearch
        })
    }, [households, filterType, searchQuery, userId])

    return (
        <div className="house-holds-main-container">
            <div>
                <H2 variant="secondary" className="main-title">
                    {t('households.households_list.title')}
                </H2>
            </div>
            <div className="households-filter-buttons">
                <button
                    className="households-filter-button"
                    onClick={() => setFilterType('all')}
                    style={{ background: filterType === 'all' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                    {t('households.filters.all')}
                </button>
                <button
                    className="households-filter-button"
                    onClick={() => setFilterType('owner')}
                    style={{ background: filterType === 'owner' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                    {t('households.filters.owner')}
                </button>
                <button
                    className="households-filter-button"
                    onClick={() => setFilterType('member')}
                    style={{ background: filterType === 'member' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                    {t('households.filters.member')}
                </button>
                <input
                    className="households-search-input"
                    type="text"
                    placeholder={t('households.filters.search_placeholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            {loading && !households.length && <Loader />}
            <div className="households-list">
                {filteredHouseholds.length === 0 ? (
                    <div className="no-households-text">{t('households.households_list.no_households')}</div>
                ) : (
                    filteredHouseholds.map(household => {
                        let role: 'owner' | 'member' | undefined = undefined
                        if (String(household.owner) === userId) {
                            role = 'owner'
                        } else if (Array.isArray(household.members) && household.members.map(String).includes(userId)) {
                            role = 'member'
                        }
                        return (
                            household._id && (
                                <HouseHoldItem
                                    key={household._id}
                                    name={household.name}
                                    id={household._id}
                                    owner={household.owner}
                                    members={household.members}
                                    role={role}
                                />
                            )
                        )
                    })
                )}
            </div>
            <div className="households-add-section">
                <Button variant="default" className="create-household-button" onClick={handleCreateHousehold}>
                    {t('households.households_list.actions.create_new')}
                </Button>
            </div>
            {isCreateModalOpen && (
                <CreateHousehold
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseModal}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </div>
    )
}

export default React.memo(HouseholdsMain)
