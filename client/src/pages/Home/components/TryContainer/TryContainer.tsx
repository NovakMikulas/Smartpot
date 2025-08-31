import React from 'react'
import { useTranslation } from 'react-i18next'
import flowerImage from '../../../../assets/flower_profiles_avatatars/flower7.png'
import Button from '../../../../components/Button/Button'
import GradientDiv from '../../../../components/GradientDiv/GradientDiv'
import { H4 } from '../../../../components/Text/Heading/Heading'
import { Paragraph } from '../../../../components/Text/Paragraph/Paragraph'
import { TranslationFunction } from '../../../../i18n'
import { useNavigate } from 'react-router-dom'

import './TryContainer.sass'

const TryContainer: React.FC = () => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const navigate = useNavigate()
    return (
        <>
            <GradientDiv className="try-container__wrapper">
                <div className="try-container__image">
                    <img src={flowerImage} alt="Decorative Plant" className="try-container__plant-image" />
                </div>

                <div className="try-container__content">
                    <H4 variant="primary" className="try-container__subtitle">
                        {t('homepage.homepage_try_it.title')}
                        
                    </H4>

                   
                    <Paragraph variant="primary" size="md" className="try-container__text">
                    {t('homepage.homepage_try_it.description')}
                    </Paragraph>

                    <Button className="try-container__button" variant="default" onClick={() => navigate('/households')}>
                        {t('homepage.homepage_try_it.button')}
                    </Button>
                </div>
            </GradientDiv>
        </>
    )
}

export default TryContainer
