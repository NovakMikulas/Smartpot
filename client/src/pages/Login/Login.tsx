import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../../components/Button/Button'
import GradientDiv from '../../components/GradientDiv/GradientDiv'
import { H2 } from '../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../i18n/index'
import { selectAuthLoading } from '../../redux/selectors/authSelectors'
import { checkAuthStatus, forgotPassword, login } from '../../redux/slices/authSlice'
import { AppDispatch } from '../../redux/store/store'
import './Login.sass'

const Login: React.FC = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const loading = useSelector(selectAuthLoading)
    const { t } = useTranslation() as { t: TranslationFunction }

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const result = await dispatch(checkAuthStatus()).unwrap()
                if (result) {
                    navigate('/')
                }
            } catch (err) {
                // toast.error(t('login_page.error.invalid_credentials'))
            }
        }
        checkAuth()
    }, [dispatch, navigate, t])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (!email.trim()) {
            toast.error(t('login_page.error.empty_email'))
            return
        }

        if (isForgotPassword) {
            try {
                await dispatch(forgotPassword({ email })).unwrap()
                toast.success(t('login_page.forgot_password_success'))
                setIsForgotPassword(false)
            } catch (err: any) {
                toast.error(err.response?.data?.error || err.message || t('login_page.forgot_password_error'))
            }
            return
        }

        if (!password.trim()) {
            toast.error(t('login_page.error.empty_password'))
            return
        }

        try {
            const result = await dispatch(login({ email, password })).unwrap()
            if (result) {
                toast.success(t('login_page.success'))
                navigate('/')
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || t('login_page.error.invalid_credentials'))
            return
        }
    }

    return (
        <div className="login-page">
            <H2 variant="secondary" className="login-title">
                {t('login_page.title')}
            </H2>

            <GradientDiv className="login-form__wrapper">
                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    <div className="login-form-group">
                        <label htmlFor="email">{t('login_page.input')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    {!isForgotPassword && (
                        <div className="login-form-group">
                            <label htmlFor="password">{t('login_page.password')}</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    )}

                    <Button type="submit" variant="default" className="login-form__button" disabled={loading}>
                        {loading
                            ? t('login_page.loading')
                            : isForgotPassword
                            ? t('login_page.reset_password')
                            : t('login_page.button')}
                    </Button>

                    <div className="login-form__links">
                        <button
                            type="button"
                            className="forgot-password-link"
                            onClick={() => setIsForgotPassword(!isForgotPassword)}>
                            {isForgotPassword ? t('login_page.back_to_login') : t('login_page.forgot_password')}
                        </button>
                    </div>
                </form>
            </GradientDiv>
        </div>
    )
}

export default Login
