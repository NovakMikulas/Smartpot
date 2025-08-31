import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import { H3 } from '../../components/Text/Heading/Heading'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { TranslationFunction } from '../../i18n'
import { selectUser } from '../../redux/selectors/authSelectors'
import { selectFlowers } from '../../redux/selectors/flowerDetailSelectors'
import {
    selectProfiles,
    selectProfilesError,
    selectProfilesLoading,
} from '../../redux/selectors/flowerProfilesSelectors'
import { selectHouseholdById, selectIsHouseholdOwner } from '../../redux/selectors/houseHoldSelectors'
import { selectMeasurementsError, selectMeasurementsLoading } from '../../redux/selectors/measurementSelectors'
import { selectInactiveSmartPots, selectSmartPots } from '../../redux/selectors/smartPotSelectors'
import { AppDispatch, RootState } from '../../redux/store/store'
import AddFlower from '../AddFlower/AddFlower'
import FlowerItem from './FlowerItem/FlowerItem'
import './FlowerList.sass'

type FilterType = 'all' | 'active' | 'not-active'
type ProfileFilter = string

const FlowerList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { t } = useTranslation() as { t: TranslationFunction }
    const { householdId } = useParams<{ householdId: string }>()

    const user = useSelector(selectUser)
    const flowers = useSelector(selectFlowers)
    const profiles = useSelector(selectProfiles)
    const profilesLoading = useSelector(selectProfilesLoading)
    const profilesError = useSelector(selectProfilesError)
    const smartPots = useSelector(selectSmartPots)
    const inactiveSmartPots = useSelector(selectInactiveSmartPots)
    const measurementsLoading = useSelector(selectMeasurementsLoading)
    const measurementsError = useSelector(selectMeasurementsError)
    const currentHousehold = useSelector((state: RootState) => selectHouseholdById(state, householdId || ''))
    const isOwner = useSelector((state: RootState) => selectIsHouseholdOwner(state, householdId || ''))

    const [filterType, setFilterType] = useState<FilterType>('all')
    const [profileFilter, setProfileFilter] = useState<ProfileFilter>('all')
    const [isAddFlowerModalOpen, setIsAddFlowerModalOpen] = useState(false)

    if (!householdId) {
        return null
    }

    const getProfileName = (profileId: string | null | undefined): string => {
        if (!profileId) return ''
        const profile = Array.isArray(profiles) ? profiles.find(p => p._id === profileId) : null
        return profile ? profile.name : ''
    }

    const handleAddFlower = () => {
        setIsAddFlowerModalOpen(true)
    }

    const handleCloseAddFlowerModal = () => {
        setIsAddFlowerModalOpen(false)
    }

    const householdFlowers = Array.isArray(flowers) ? flowers : []
    const emptyFlowers = householdFlowers.length === 0

    const filteredFlowers = householdFlowers.filter(flower => {
        const hasSmartPot = flower.serial_number !== undefined && flower.serial_number !== null
        const matchesProfile =
            profileFilter === 'all' || (profileFilter === 'not_assigned' ? !flower.profile : flower.profile)

        switch (filterType) {
            case 'active':
                return hasSmartPot && matchesProfile
            case 'not-active':
                return !hasSmartPot && matchesProfile
            default:
                return matchesProfile
        }
    })

    if (measurementsError || profilesError) {
        let errorMessage = t('flower_list.error.generic_loading_failed')
        if (measurementsError) {
            errorMessage = t('flower_list.error.measurements_loading_failed')
        } else if (profilesError) {
            errorMessage = t('flower_list.error.profiles_loading_failed')
        }

        return (
            <div className="error-container">
                <Paragraph variant="primary" size="md">
                    {errorMessage}
                </Paragraph>
            </div>
        )
    }

    return (
        <div className="flower-list-container">
            <div>
                <H3 variant="secondary" className="main-title">
                    {t('flower_list.title')} {currentHousehold?.name}
                </H3>
            </div>

            <div className="flower-list-filter-buttons">
                <Button variant="default" className="flower-list-filter-button" onClick={() => setFilterType('all')}>
                    {t('flower_list.filters.all')}
                </Button>
                <Button variant="default" className="flower-list-filter-button" onClick={() => setFilterType('active')}>
                    {t('flower_list.filters.active')}
                </Button>
                <Button
                    variant="default"
                    className="flower-list-filter-button"
                    onClick={() => setFilterType('not-active')}>
                    {t('flower_list.filters.not_active')}
                </Button>
                <select
                    className="flower-list-profile-select"
                    value={profileFilter}
                    onChange={e => setProfileFilter(e.target.value)}>
                    <option value="all">{t('flower_list.filters.all_profiles')}</option>
                    <option value="not_assigned">{t('flower_list.filters.not_assigned')}</option>
                    <option value="assigned">{t('flower_list.filters.assigned')}</option>
                </select>
            </div>

            <div className="flower-list-items">
                {filteredFlowers.length > 0 ? (
                    filteredFlowers.map(flower => (
                        <FlowerItem
                            key={flower._id}
                            name={flower.name}
                            flowerpot={flower.serial_number ? flower.serial_number : ''}
                            id={flower._id}
                            avatar={flower.avatar}
                            householdId={householdId}
                            profile={flower.profile}
                        />
                    ))
                ) : (
                    <div className="flower-list-no-flowers-text">
                        <Paragraph variant="primary" size="md">
                            {t('flower_list.no_flowers')}
                        </Paragraph>
                    </div>
                )}
            </div>

            <div className="flower-list-add-section">
                <Button variant="default" className="flower-list-add-button" onClick={handleAddFlower}>
                    {t('flower_list.actions.add')}
                </Button>
            </div>

            {isAddFlowerModalOpen && <AddFlower onClose={handleCloseAddFlowerModal} />}
        </div>
    )
}

export default FlowerList
