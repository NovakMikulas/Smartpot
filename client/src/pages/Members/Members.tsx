import { AnimatePresence, motion } from 'framer-motion'
import { UserCirclePlus } from 'phosphor-react'
import React, { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../../components/Button/Button'
import GradientDiv from '../../components/GradientDiv/GradientDiv'
import { H3, H4 } from '../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../i18n'
import {
    makeOwnerAction,
    removeMemberAction,
    removeMemberFromState,
    updateHouseholdInvites,
    updateHouseholdOwner,
} from '../../redux/slices/householdsSlice'
import { AppDispatch } from '../../redux/store/store'
import InviteMember from './InviteMember/InviteMemberModal'
import './Members.sass'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
            ease: 'easeIn',
        },
    },
}

interface MemberItemProps {
    member: { _id: string; email: string }
    household: any
    onMakeOwner: (memberId: string) => void
    onRemoveMember: (memberId: string) => void
    t: TranslationFunction
}

const MemberItem = memo(({ member, household, onMakeOwner, onRemoveMember, t }: MemberItemProps) => {
    const isOwner = member._id === household.owner

    return (
        <motion.div className="member-item" variants={itemVariants} initial="hidden" animate="visible" exit="exit">
            <div className="member-info">
                <span className="member-name">{`${member.email}`}</span>
                <motion.span
                    className={isOwner ? 'owner-tag' : 'member-tag'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    {isOwner
                        ? t('manage_household.manage_members.roles.owner')
                        : t('manage_household.manage_members.roles.member')}
                </motion.span>
            </div>
            {!isOwner && (
                <div className="member-actions">
                    <Button variant="default" className="make-owner-button" onClick={() => onMakeOwner(member._id)}>
                        {t('manage_household.manage_members.actions.make_owner')}
                    </Button>
                    <Button variant="default" className="remove-button" onClick={() => onRemoveMember(member._id)}>
                        {t('manage_household.manage_members.actions.remove')}
                    </Button>
                </div>
            )}
        </motion.div>
    )
})

MemberItem.displayName = 'MemberItem'

interface InvitedMemberItemProps {
    invitedMember: { _id: string; email: string }
    t: TranslationFunction
}

const InvitedMemberItem = memo(({ invitedMember, t }: InvitedMemberItemProps) => (
    <motion.div className="member-item" variants={itemVariants} initial="hidden" animate="visible" exit="exit">
        <div className="member-info">
            <span className="member-name">{`${invitedMember.email}`}</span>
            <motion.span className="invited-tag" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {t('manage_household.manage_members.invited_tag')}
            </motion.span>
        </div>
    </motion.div>
))

InvitedMemberItem.displayName = 'InvitedMemberItem'

interface ContextType {
    members: Array<{ _id: string; email: string }>
    invitedMembers: Array<{ _id: string; email: string }>
    setMembers: React.Dispatch<React.SetStateAction<Array<{ _id: string; email: string }>>>
    setInvitedMembers: React.Dispatch<React.SetStateAction<Array<{ _id: string; email: string }>>>
    household: any
    isOwner: boolean
}

const Members: React.FC = () => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { members, invitedMembers, setMembers, setInvitedMembers, household, isOwner } =
        useOutletContext<ContextType>()
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [existingMembers, setExistingMembers] = useState<string[]>(household?.members || [])

    const handleRemoveMember = useCallback(
        async (memberId: string) => {
            if (!household?._id) return
            try {
                await dispatch(removeMemberAction({ householdId: household._id, memberId })).unwrap()
                toast.success(t('manage_household.manage_members.toast.remove_member_success'))

                setMembers(prevMembers => prevMembers.filter(member => member._id !== memberId))
                setExistingMembers(prev => prev.filter(id => id !== memberId))

                dispatch(removeMemberFromState({ householdId: household._id, memberId }))
            } catch (error) {
                
                toast.error(t('manage_household.manage_members.toast.remove_member_error'))
            }
        },
        [dispatch, household, setMembers, t],
    )

    const handleMakeOwner = useCallback(
        async (memberId: string) => {
            if (!household?._id) return
            try {
                await dispatch(
                    makeOwnerAction({
                        householdId: household._id,
                        newOwnerId: memberId,
                    }),
                ).unwrap()
                toast.success(t('manage_household.manage_members.toast.make_owner_success'))

                dispatch(updateHouseholdOwner({ householdId: household._id, newOwnerId: memberId }))
            } catch (error) {
               
                toast.error(t('manage_household.manage_members.toast.make_owner_error'))
            }
        },
        [dispatch, household?._id, t],
    )

    const handleInviteModalOpen = useCallback(() => {
        setIsInviteModalOpen(true)
    }, [])

    const handleInviteModalClose = useCallback(() => {
        setIsInviteModalOpen(false)
    }, [])

    const handleInviteSuccess = useCallback(
        (invitedUser: { _id: string; email: string }) => {
            setInvitedMembers(prev => [...prev, invitedUser])
            dispatch(updateHouseholdInvites({ householdId: household._id, invitedUser }))
        },
        [dispatch, household._id, setInvitedMembers],
    )

    if (!household) {
        return <div>{t('manage_household.manage_members.household_not_found')}</div>
    }

    if (!isOwner) {
        navigate('/households')
        return null
    }

    return (
        <motion.div
            className="manage-members-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <H3 variant="secondary" className="manage-members-title">
                    {t('manage_household.manage_members.title')} {household.name}
                </H3>
            </motion.div>

            <GradientDiv className="manage-members-content">
                <motion.div className="members-section" variants={containerVariants}>
                    <H4 variant="primary" className="section-title">
                        {t('manage_household.manage_members.active_members')}
                    </H4>
                    <div className="section-content">
                        <AnimatePresence mode="wait">
                            <motion.div className="members-list">
                                {members?.map(member => (
                                    <MemberItem
                                        key={member._id}
                                        member={member}
                                        household={household}
                                        onMakeOwner={handleMakeOwner}
                                        onRemoveMember={handleRemoveMember}
                                        t={t}
                                    />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                <motion.div className="members-section" variants={containerVariants}>
                    <H4 variant="primary" className="section-title">
                        {t('manage_household.manage_members.invited_users')}
                    </H4>
                    <div className="section-content">
                        <AnimatePresence mode="wait">
                            <motion.div className="members-list">
                                {invitedMembers?.map(invitedMember => (
                                    <InvitedMemberItem key={invitedMember._id} invitedMember={invitedMember} t={t} />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                        <motion.div
                            className="add-member-icon"
                            onClick={handleInviteModalOpen}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}>
                            <UserCirclePlus size={32} color="#bfbfbf" />
                        </motion.div>
                    </div>
                </motion.div>
            </GradientDiv>

            <AnimatePresence>
                {isInviteModalOpen && (
                    <InviteMember
                        isOpen={isInviteModalOpen}
                        onClose={handleInviteModalClose}
                        householdId={household._id}
                        existingMembers={existingMembers}
                        invitedUsers={invitedMembers.map(member => member._id)}
                        onInviteSuccess={handleInviteSuccess}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default memo(Members)
