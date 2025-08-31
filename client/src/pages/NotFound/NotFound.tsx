import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import { H1, H2 } from '../../components/Text/Heading/Heading'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { TranslationFunction } from '../../i18n'
import './NotFound.sass'

const NotFound: React.FC = () => {
    const navigate = useNavigate()
    const { t } = useTranslation() as { t: TranslationFunction }

    return (
        <div className="not-found-container">
            <H1>{t('not_found.title')}</H1>
            <H2>{t('not_found.subtitle')}</H2>
            <Paragraph>{t('not_found.description')}</Paragraph>
            <Button onClick={() => navigate('/')} variant="default">
                {t('not_found.button')}
            </Button>
        </div>
    )
}

export default NotFound
