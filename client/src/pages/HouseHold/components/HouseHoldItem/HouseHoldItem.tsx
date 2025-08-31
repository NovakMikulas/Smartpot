import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import GradientDiv from '../../../../components/GradientDiv/GradientDiv'
import { TranslationFunction } from '../../../../i18n'
import './HouseHoldItem.sass'

interface HouseHoldItemProps {
    name?: string
    description?: string
    id?: string
    owner?: string
    members?: string[]
    role?: 'owner' | 'member'
}

const HouseHoldItem: React.FC<HouseHoldItemProps> = memo(({ name, id, role, description }) => {
    const navigate = useNavigate()
    const { t } = useTranslation() as { t: TranslationFunction }

    const handleCheckClick = useCallback(() => {
        if (id) {
            navigate(`/households/${id}/flowers`)
        }
    }, [id, navigate])

    return (
        <div className="household-item-wrapper">
            <GradientDiv className="household-item-container" onClick={handleCheckClick}>
                <div className="household-item-content">
                    <div className="household-item-header-content">
                        <div className="household-name">{name}</div>
                        {role && <div className={`owner-tag owner-tag-${role}`}>{t(`households.role.${role}`)}</div>}
                    </div>
                    {description && <div className="household-description">{description}</div>}
                </div>
            </GradientDiv>
        </div>
    )
})

HouseHoldItem.displayName = 'HouseHoldItem'

export default HouseHoldItem
