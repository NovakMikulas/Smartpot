import { PencilSimple } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Loader from '../../../../components/Loader/Loader'
import { H4 } from '../../../../components/Text/Heading/Heading'
import { Flower } from '../../../../types/flowerTypes'
import EditFlowerProfile from '../../Modals/EditFlowerProfile/EditFlowerProfile'
import './ProfileSection.sass'

interface ProfileSectionProps {
    flower: Flower | null
    isLoading: boolean
}

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
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ flower, isLoading }) => {
    const { t } = useTranslation()
    const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false)

    if (isLoading) {
        return <Loader />
    }

    if (!flower?.profile) {
        return null
    }

    return (
        <motion.div className="profile-content" variants={containerVariants} initial="hidden" animate="visible">
            <div className="profile-header">
                <H4>{t('flower_detail.auto_watering_settings')}</H4>
                <button className="edit-button" onClick={() => setIsProfileEditModalOpen(true)}>
                    <PencilSimple size={20} weight="bold" color="#ebe6e6" />
                </button>
            </div>

            <div className="profile-text">{t('flower_detail.custom_settings')}</div>
            <motion.div className="profile-settings" variants={containerVariants}>
                <motion.div className="setting-group" variants={itemVariants}>
                    <div className="setting-title">{t('flower_detail.temperature')}</div>
                    <div className="setting-item">
                        <span>{t('flower_detail.min')}</span>
                        <span>
                            {flower.profile.temperature?.min || 0}
                            {t('flower_detail.unit.celsius')}
                        </span>
                    </div>
                    <div className="setting-item">
                        <span>{t('flower_detail.max')}</span>
                        <span>
                            {flower.profile.temperature?.max || 0}
                            {t('flower_detail.unit.celsius')}
                        </span>
                    </div>
                </motion.div>
                <motion.div className="setting-group" variants={itemVariants}>
                    <div className="setting-title">{t('flower_detail.humidity')}</div>
                    <div className="setting-item">
                        <span>{t('flower_detail.min')}</span>
                        <span>
                            {flower.profile.humidity?.min || 0}
                            {t('flower_detail.unit.percent')}
                        </span>
                    </div>
                    <div className="setting-item">
                        <span>{t('flower_detail.max')}</span>
                        <span>
                            {flower.profile.humidity?.max || 0}
                            {t('flower_detail.unit.percent')}
                        </span>
                    </div>
                </motion.div>
                <motion.div className="setting-group" variants={itemVariants}>
                    <div className="setting-title">{t('flower_detail.light')}</div>
                    <div className="setting-item">
                        <span>{t('flower_detail.min')}</span>
                        <span>
                            {flower.profile.light?.min || 0}
                            {t('flower_detail.unit.lightness')}
                        </span>
                    </div>
                    <div className="setting-item">
                        <span>{t('flower_detail.max')}</span>
                        <span>
                            {flower.profile.light?.max || 0}
                            {t('flower_detail.unit.lightness')}
                        </span>
                    </div>
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {isProfileEditModalOpen && flower && (
                    <EditFlowerProfile
                        isOpen={isProfileEditModalOpen}
                        onClose={() => setIsProfileEditModalOpen(false)}
                        flowerId={flower._id}
                        currentProfile={undefined}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ProfileSection
