import { CheckCircle, PencilSimple, WarningCircle } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Button from '../../../../components/Button/Button'
import { Paragraph } from '../../../../components/Text/Paragraph/Paragraph'
import { Flower } from '../../../../types/flowerTypes'
import { SmartPot } from '../../../../types/smartPotTypes'
import EditNameAndAvatar from '../../Modals/EditNameAndAvatar/EditNameAndAvatar'
import './HeaderSection.sass'

interface HeaderSectionProps {
    flowerpotData: {
        name: string
        flower_avatar: string
    }
    flower: Flower | null
    connectedSmartPot: SmartPot | undefined
    householdId: string
    batteryStatus: {
        hasWarning: boolean
    } | null
    onEditClick: () => void
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
    flowerpotData,
    flower,
    connectedSmartPot,
    householdId,
    batteryStatus,
    onEditClick,
}) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [isEditNameAvatarOpen, setIsEditNameAvatarOpen] = useState(false)

    return (
        <>
            <motion.div className="flower-header">
                <div className="flower-name-container">
                    <h1 className="flowerpot-title">
                        {flowerpotData.name}
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <PencilSimple
                                size={32}
                                color="#ebe6e6"
                                className="pencil-icon"
                                onClick={() => setIsEditNameAvatarOpen(true)}
                            />
                        </motion.div>
                    </h1>
                </div>
                <motion.img
                    src={flowerpotData.flower_avatar}
                    alt={t('flower_detail.avatar_alt')}
                    className="flowerpot-avatar"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />
            </motion.div>

            <motion.div className="smartpot-container">
                <div className="smartpot-container-warning">
                    {connectedSmartPot && flower?.serial_number ? (
                        <>
                            <Paragraph>
                                {t('flower_detail.signed_into', { serialNumber: flower.serial_number })}
                            </Paragraph>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
                                {batteryStatus?.hasWarning ? (
                                    <WarningCircle size={32} color="#f93333" />
                                ) : (
                                    <CheckCircle size={32} color="#4CAF50" />
                                )}
                            </motion.div>
                        </>
                    ) : (
                        <Paragraph>{t('flower_detail.no_smartpot_assigned_text')}</Paragraph>
                    )}
                </div>

                {connectedSmartPot && (
                    <Button
                        onClick={() => {
                            navigate(`/households/${householdId}/smartPots/${connectedSmartPot._id}`)
                        }}>
                        {t('flower_detail.view_smartpot')}
                    </Button>
                )}
            </motion.div>

            <AnimatePresence>
                {isEditNameAvatarOpen && flower && (
                    <EditNameAndAvatar
                        isOpen={isEditNameAvatarOpen}
                        onClose={() => setIsEditNameAvatarOpen(false)}
                        flowerId={flower._id}
                        currentName={flowerpotData.name}
                        currentAvatar={flowerpotData.flower_avatar}
                    />
                )}
            </AnimatePresence>
        </>
    )
}

export default HeaderSection
