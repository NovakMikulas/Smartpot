import { AnimatePresence, motion } from 'framer-motion'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import Button from '../../../components/Button/Button'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H5 } from '../../../components/Text/Heading/Heading'
import { api } from '../../../redux/services/api'
import { inviteMemberAction } from '../../../redux/slices/householdsSlice'
import { AppDispatch } from '../../../redux/store/store'
import './InviteMember.sass'

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

const searchResultVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.15,
            ease: 'easeIn',
        },
    },
}

interface User {
    _id: string
    name: string
    surname: string
    email: string
}

interface InviteMemberProps {
    isOpen: boolean
    onClose: () => void
    householdId: string
    existingMembers: string[]
    invitedUsers: string[]
    onInviteSuccess: (user: { _id: string; email: string }) => void
}

const SearchResultItem = memo(({ user, onSelect }: { user: User; onSelect: (user: User) => void }) => (
    <motion.div
        className="search-result-item"
        onClick={() => onSelect(user)}
        variants={searchResultVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}>
        <div style={{ fontWeight: 'bold' }}>
            {user.name} {user.surname}
        </div>
        <div style={{ fontSize: '0.9em', color: '#999' }}>{user.email}</div>
    </motion.div>
))

SearchResultItem.displayName = 'SearchResultItem'

const InviteMember: React.FC<InviteMemberProps> = memo(
    ({ isOpen, onClose, householdId, existingMembers, invitedUsers, onInviteSuccess }) => {
        const { t } = useTranslation()
        const dispatch = useDispatch<AppDispatch>()
        const [searchQuery, setSearchQuery] = useState('')
        const [searchResults, setSearchResults] = useState<User[]>([])
        const [selectedUser, setSelectedUser] = useState<User | null>(null)
        const [loading, setLoading] = useState(false)
        const [error, setError] = useState<string | null>(null)

        const searchUsers = useCallback(
            async (query: string) => {
                if (query.length < 2) {
                    setSearchResults([])
                    return
                }

                try {
                    const response = await api.get(`/user/search?query=${encodeURIComponent(query)}`)
                    const filteredUsers = response.data.data.filter(
                        (user: User) => !existingMembers.includes(user._id) && !invitedUsers.includes(user._id),
                    )
                    setSearchResults(filteredUsers)
                } catch (err) {
                    toast.error('Error searching users')
                    setSearchResults([])
                }
            },
            [existingMembers, invitedUsers],
        )

        useEffect(() => {
            const timeoutId = setTimeout(() => searchUsers(searchQuery), 300)
            return () => clearTimeout(timeoutId)
        }, [searchQuery, searchUsers])

        const handleUserSelect = useCallback((user: User) => {
            setSelectedUser(user)
            setSearchQuery(`${user.name} ${user.surname}`)
            setSearchResults([])
        }, [])

        const handleSubmit = useCallback(
            async (e?: React.FormEvent) => {
                if (e) {
                    e.preventDefault()
                }

                if (!selectedUser) {
                    setError(t('manage_household.manage_members.add_member.error.select_user'))
                    return
                }

                if (existingMembers.includes(selectedUser._id)) {
                    setError(t('manage_household.manage_members.add_member.error.user_already_member'))
                    return
                }

                if (invitedUsers.includes(selectedUser._id)) {
                    setError(t('manage_household.manage_members.add_member.error.user_already_invited'))
                    return
                }

                setLoading(true)
                setError(null)

                try {
                    await dispatch(inviteMemberAction({ householdId, userId: selectedUser._id })).unwrap()
                    toast.success(t('manage_household.manage_members.add_member.toast.invite_sent_success'))
                    onInviteSuccess({ _id: selectedUser._id, email: selectedUser.email })
                    setSearchQuery('')
                    setSelectedUser(null)
                    onClose()
                    return
                } catch (err) {
                    console.error(t('manage_household.manage_members.add_member.console.error_details_prefix'), err)
                    const errorMessage = t('manage_household.manage_members.add_member.error.invite_send_failed')
                    setError(errorMessage)
                    toast.error(errorMessage)
                } finally {
                    setLoading(false)
                }
            },
            [dispatch, householdId, selectedUser, existingMembers, invitedUsers, onClose, onInviteSuccess, t],
        )

        const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value)
            setSelectedUser(null)
        }, [])

        if (!isOpen) return null

        return (
            <motion.div
                className="invite-member-container"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={modalVariants}>
                <GradientDiv className="invite-member-step-container">
                    <H5 variant="primary" className="invite-member-title">
                        {t('manage_household.manage_members.add_member.invite_member')}
                    </H5>
                    <motion.button
                        className="invite-member-close-button"
                        onClick={onClose}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}>
                        ×
                    </motion.button>

                    <form onSubmit={handleSubmit} className="invite-member-form">
                        <div className="invite-member-form-group">
                            <div className="input-wrapper">
                                <motion.input
                                    type="text"
                                    className="invite-member-input"
                                    placeholder={t('manage_household.manage_members.add_member.search_placeholder')}
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    whileFocus={{ scale: 1.02 }}
                                />
                                <AnimatePresence>
                                    {searchResults.length > 0 && !selectedUser && (
                                        <motion.div
                                            className="search-results"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}>
                                            {searchResults.map(user => (
                                                <SearchResultItem
                                                    key={user._id}
                                                    user={user}
                                                    onSelect={handleUserSelect}
                                                />
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <Button
                                variant="default"
                                onClick={handleSubmit}
                                disabled={loading || !selectedUser}
                                type="submit">
                                {loading
                                    ? t('manage_household.manage_members.add_member.sending_button')
                                    : t('manage_household.manage_members.add_member.invite_button')}
                            </Button>
                        </div>
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="invite-member-error-message"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}>
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </GradientDiv>
            </motion.div>
        )
    },
)

InviteMember.displayName = 'InviteMember'

export default InviteMember
