import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../../components/Button/Button'
import GradientDiv from '../../components/GradientDiv/GradientDiv'
import { H2 } from '../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../i18n/index'
import { register } from '../../redux/slices/authSlice'
import { AppDispatch } from '../../redux/store/store'
import './Register.sass'

const Register: React.FC = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [surname, setSurname] = useState('')
    const [loading, setLoading] = useState(false)
    const { t } = useTranslation() as { t: TranslationFunction }
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!email.trim() || !password.trim() || !confirmPassword.trim() || !name.trim() || !surname.trim()) {
            toast.error(t('register_page.error.empty_fields'))
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            toast.error(t('register_page.error.passwords_dont_match'))
            setLoading(false)
            return
        }

        try {
            await dispatch(register({ email, password, name, surname })).unwrap()
            toast.success(t('register_page.success'))
            navigate('/login')
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || t('register_page.error.registration_failed'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-page">
            <H2 variant="secondary" className="register-title">
                {t('register_page.title')}
            </H2>

            <GradientDiv className="register-form__wrapper">
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="register-form-group">
                        <label htmlFor="name">{t('register_page.name')}</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            autoComplete="given-name"
                        />
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="surname">{t('register_page.surname')}</label>
                        <input
                            type="text"
                            id="surname"
                            value={surname}
                            onChange={e => setSurname(e.target.value)}
                            required
                            autoComplete="family-name"
                        />
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="email">{t('register_page.input')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="password">{t('register_page.password')}</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="confirmPassword">{t('register_page.confirm_password')}</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <Button variant="default" type="submit" className="register-form__button" disabled={loading}>
                        {loading ? t('register_page.loading') : t('register_page.button')}
                    </Button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default Register
