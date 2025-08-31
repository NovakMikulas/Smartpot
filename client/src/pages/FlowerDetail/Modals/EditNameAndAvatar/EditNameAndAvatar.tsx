import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import Button from '../../../../components/Button/Button'
import GradientDiv from '../../../../components/GradientDiv/GradientDiv'
import { H5 } from '../../../../components/Text/Heading/Heading'
import { updateFlowerData, updateFlowerLocally } from '../../../../redux/slices/flowersSlice'
import { AppDispatch } from '../../../../redux/store/store'
import './EditNameAndAvatar.sass'

const avatars = [
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308837/flowerpots_avatars/librk2eqiamvp7cuzjxa.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308835/flowerpots_avatars/qohoubp5tjmajz4li5iu.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308832/flowerpots_avatars/iipwugfwpqxpahjxjalo.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308831/flowerpots_avatars/bfsivvzsqjzwig8uqzua.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308830/flowerpots_avatars/xwi1ujvpmm2d1magwid8.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308825/flowerpots_avatars/emgeoupoglpwkuknuvsi.png',
]

interface EditNameAndAvatarProps {
    isOpen: boolean
    onClose: () => void
    flowerId: string
    currentName: string
    currentAvatar: string
}

const EditNameAndAvatar: React.FC<EditNameAndAvatarProps> = ({
    isOpen,
    onClose,
    flowerId,
    currentName,
    currentAvatar,
}) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const [name, setName] = useState(currentName)
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault()
        }
        setError(null)

        const updates = {
            name,
            avatar: selectedAvatar,
        }

       

        dispatch(
            updateFlowerLocally({
                id: flowerId,
                updates,
            }),
        )

        onClose()

        try {
           

            await dispatch(
                updateFlowerData({
                    id: flowerId,
                    flower: updates,
                }),
            ).unwrap()

            toast.success(t('flower_detail.edit_name_avatar.success.updated'))
        } catch (err) {
           
            dispatch(
                updateFlowerLocally({
                    id: flowerId,
                    updates: {
                        name: currentName,
                        avatar: currentAvatar,
                    },
                }),
            )

            const errorMessage = t('flower_detail.edit_name_avatar.error.update_failed')
            setError(errorMessage)
            toast.error(errorMessage)
            console.error(t('flower_detail.edit_name_avatar.console.update_error_prefix'), err)
        }
    }

    if (!isOpen) return null

    return (
        <div className="edit-name-avatar-container">
            <GradientDiv className="edit-name-avatar-step-container">
                <H5 variant="primary">{t('flower_detail.edit_name_avatar.title')}</H5>
                <button className="edit-name-avatar-close-button" onClick={onClose}>
                    ×
                </button>

                <form onSubmit={handleSubmit} className="edit-name-avatar-form">
                    <div className="edit-name-avatar-form-group">
                        <label className="edit-name-avatar-input-label">{t('add_flower.name')}</label>
                        <input
                            type="text"
                            className="edit-name-avatar-input"
                            placeholder={t('add_flower.name_placeholder')}
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="edit-name-avatar-avatar-section">
                        <label className="edit-name-avatar-input-label">{t('add_flower.avatar')}</label>
                        <div className="edit-name-avatar-avatar-grid">
                            {avatars.map((avatar, index) => (
                                <img
                                    src={avatar}
                                    alt={t('add_flower.avatar_alt_text', { index: index + 1 })}
                                    key={index}
                                    className={`edit-name-avatar-avatar-image ${
                                        selectedAvatar === avatar ? 'edit-name-avatar-avatar-image--selected' : ''
                                    }`}
                                    onClick={() => setSelectedAvatar(avatar)}
                                />
                            ))}
                        </div>
                    </div>

                    {error && <div className="edit-name-avatar-error-message">{error}</div>}

                    <Button variant="default" onClick={handleSubmit} disabled={loading}>
                        {loading ? t('flower_detail.saving') : t('flower_detail.save')}
                    </Button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default EditNameAndAvatar
