import { Check, X } from 'phosphor-react'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { H2 } from '../../components/Text/Heading/Heading'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { selectInvites } from '../../redux/selectors/invitesSelectors'
import { acceptInvite, loadInvites, rejectInvite } from '../../redux/slices/invitesSlice'
import { useAppDispatch, useAppSelector } from '../../redux/store/hooks'
import './Notifications.sass'

const emptyPhotoMembersAvatar = require('../../assets/empty_notifications.png')

interface NotificationItemProps {
    household: string
    notificationCount: number
    onClick: () => void
}

interface HouseholdInviteProps {
    id: string
    household_name: string
    inviter_name: string
    timestamp: string
    status: string
    onAccept: (id: string) => void
    onReject: (id: string) => void
    formatDate: (timestamp: string) => string
}

const NotificationItem = React.memo<NotificationItemProps>(({ household, notificationCount, onClick }) => (
    <div onClick={onClick} style={{ cursor: 'pointer', width: '100%' }}>
        <div className="notification-item">
            <span className="household-name">{household}</span>
            <div className="notification-count">{notificationCount}</div>
            <span className="arrow">›</span>
        </div>
    </div>
))

const HouseholdInvite = React.memo<HouseholdInviteProps>(
    ({ id, household_name, inviter_name, timestamp, status, onAccept, onReject, formatDate }) => (
        <div className="invite-item">
            <div className="invite-content">
                <div className="invite-header">
                    <span className="invite-household">{household_name}</span>
                    <span className="invite-timestamp">{formatDate(timestamp)}</span>
                </div>

                {status === 'pending' && (
                    <div className="invite-actions">
                        <Check
                            size={32}
                            color="#4CAF50"
                            onClick={() => onAccept(id)}
                            className="invite-action-button"
                        />
                        <X size={32} color="#f93333" onClick={() => onReject(id)} className="invite-action-button" />
                    </div>
                )}
            </div>
        </div>
    ),
)

const NoInvites = React.memo(() => {
    const { t } = useTranslation()
    return (
        <div className="no-invites-container">
            <div className="no-invites-content">
                <img
                    src={emptyPhotoMembersAvatar}
                    alt={t('notifications.invites_section.no_invites_image_alt')}
                    className="no-invites-image"
                />
                <Paragraph>{t('notifications.invites_section.no_invites_message')}</Paragraph>
            </div>
        </div>
    )
})

const Notifications: React.FC = () => {
    const dispatch = useAppDispatch()
    const invites = useAppSelector(selectInvites)
    const { t, i18n } = useTranslation()

    const formatDate = useCallback(
        (timestamp: string) => {
            const date = new Date(timestamp)
            const today = new Date()
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)

            const currentLanguage = i18n.language.split('-')[0]

            const timeFormat = new Intl.DateTimeFormat(currentLanguage, {
                hour: '2-digit',
                minute: '2-digit',
            }).format(date)

            if (date.toDateString() === today.toDateString()) {
                return `${t('notifications.format_date.today_prefix')}${timeFormat}`
            }

            if (date.toDateString() === yesterday.toDateString()) {
                return `${t('notifications.format_date.yesterday_prefix')}${timeFormat}`
            }

            if (date.getFullYear() === today.getFullYear()) {
                return new Intl.DateTimeFormat(currentLanguage, {
                    day: '2-digit',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                }).format(date)
            }

            return new Intl.DateTimeFormat(currentLanguage, {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date)
        },
        [i18n.language, t],
    )

    useEffect(() => {
        dispatch(loadInvites())
    }, [dispatch])

    const handleAcceptInvite = useCallback(
        async (id: string) => {
            try {
                await dispatch(acceptInvite(id)).unwrap()
                toast.success(t('notifications.toast.invite_accepted_success'))
            } catch (error) {
                toast.error(t('notifications.toast.invite_accepted_error'))
            }
        },
        [dispatch, t],
    )

    const handleRejectInvite = useCallback(
        async (id: string) => {
            try {
                await dispatch(rejectInvite(id)).unwrap()
                toast.success(t('notifications.toast.invite_rejected_success'))
            } catch (error) {
                toast.error(t('notifications.toast.invite_rejected_error'))
            }
        },
        [dispatch, t],
    )

    const sortedInvites = useMemo(() => {
        return [...invites].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }, [invites])

    return (
        <div className="main-notifications-container">
            <H2 className="main-notifications-title">{t('notifications.page_title')}</H2>

            {sortedInvites.length > 0 ? (
                <div className="invites-section">
                    <H2 className="invites-title">{t('notifications.invites_section.title')}</H2>
                    <div className="invites-list">
                        {sortedInvites.map(invite => (
                            <div key={invite._id}>
                                <HouseholdInvite
                                    id={invite._id}
                                    household_name={invite.name}
                                    inviter_name={invite.owner}
                                    timestamp={invite.createdAt}
                                    status="pending"
                                    onAccept={handleAcceptInvite}
                                    onReject={handleRejectInvite}
                                    formatDate={formatDate}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <NoInvites />
            )}
        </div>
    )
}

const getAlertIcon = (type: string) => {
    switch (type) {
        case 'high_soil':
            return '💧'
        case 'low_soil':
            return '🌱'
        case 'low_temperature':
            return '❄️'
        case 'high_temperature':
            return '🔥'
        case 'low_battery':
            return '🔋'
        case 'wifi_outage':
            return '📡'
        case 'wifi_restored':
            return '✅'
        default:
            return '❓'
    }
}

export default React.memo(Notifications)
