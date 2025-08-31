import { unwrapResult } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { H5 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'

import { AppDispatch } from '../../../redux/store/store'
import './ChangePassModal.sass'

interface ChangePassModalProps {
    isOpen: boolean
    onClose: () => void
}

const ChangePassModal: React.FC<ChangePassModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const dispatch = useDispatch<AppDispatch>()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            setCurrentPassword('')
            setNewPassword('')
            setConfirmNewPassword('')
            setError(null)
            setLoading(false)
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
    /*     e.preventDefault()
        setError(null)

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError(t('changePassModal.error.all_fields_required'))
            return
        }

        if (newPassword.length < 6) {
            setError(t('changePassModal.error.password_too_short'))
            return
        }

        if (newPassword !== confirmNewPassword) {
            setError(t('changePassModal.error.passwords_do_not_match'))
            return
        }

        setLoading(true)
        try {
            const resultAction = await dispatch(
                changePasswordAction({ currentPassword, newPassword, confirmNewPassword }),
            )
            unwrapResult(resultAction)
            toast.success(t('changePassModal.success.password_changed'))
            onClose()
        } catch (err: any) {
            console.error('Error changing password:', err)
            setError(err || t('changePassModal.error.change_failed_unexpected'))
            toast.error(t('changePassModal.error.change_failed_toast'))
        } finally {
            setLoading(false)
        } */
    }

    if (!isOpen) {
        return null
    }

    return (
        <div className="change-pass-modal-container" onClick={onClose}>
            <div className="change-pass-modal-content" onClick={e => e.stopPropagation()}>
                <button className="change-pass-modal-close-button" onClick={onClose}>
                    ×
                </button>
                <H5 variant="primary" className="change-pass-modal-title">
                    {t('changePassModal.title')}
                </H5>

                <form onSubmit={handleSubmit} className="change-pass-modal-form">
                    <div className="change-pass-modal-form-group">
                        <label className="change-pass-modal-input-label">{t('changePassModal.current_password')}</label>
                        <input
                            type="password"
                            className="change-pass-modal-input"
                            placeholder={t('changePassModal.current_password_placeholder')}
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="change-pass-modal-form-group">
                        <label className="change-pass-modal-input-label">{t('changePassModal.new_password')}</label>
                        <input
                            type="password"
                            className="change-pass-modal-input"
                            placeholder={t('changePassModal.new_password_placeholder')}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="change-pass-modal-form-group">
                        <label className="change-pass-modal-input-label">
                            {t('changePassModal.confirm_new_password')}
                        </label>
                        <input
                            type="password"
                            className="change-pass-modal-input"
                            placeholder={t('changePassModal.confirm_new_password_placeholder')}
                            value={confirmNewPassword}
                            onChange={e => setConfirmNewPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="change-pass-modal-error-message">{error}</div>}

                    <button type="submit" className="change-pass-modal-button" disabled={loading}>
                        {loading ? t('changePassModal.saving') : t('changePassModal.submit_button')}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ChangePassModal
