import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import flower1 from '../../../../assets/flower_profiles_avatatars/flower1.png'
import flower2 from '../../../../assets/flower_profiles_avatatars/flower2.png'
import flower3 from '../../../../assets/flower_profiles_avatatars/flower3.png'
import flower4 from '../../../../assets/flower_profiles_avatatars/flower4.png'
import flower5 from '../../../../assets/flower_profiles_avatatars/flower5.png'
import flower6 from '../../../../assets/flower_profiles_avatatars/flower6.png'
import Button from '../../../../components/Button/Button'
import { TranslationFunction } from '../../../../i18n'
import './HomePageIntro.sass'

import { H3 } from '../../../../components/Text/Heading/Heading'
import { Paragraph } from '../../../../components/Text/Paragraph/Paragraph'
import { useNavigate } from 'react-router-dom'

const HomePageIntro: React.FC = () => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const [currentFlower, setCurrentFlower] = useState(0)
    const [isVisible, setIsVisible] = useState(true)
    const flowers = [flower1, flower2, flower3, flower4, flower5, flower6]
    const navigate = useNavigate()

    useEffect(() => {
        const intervalId = setInterval(() => {
            setIsVisible(false)
            setTimeout(() => {
                setCurrentFlower(prev => (prev + 1) % flowers.length)
                setIsVisible(true)
            }, 500)
        }, 15000)

    

        return () => clearInterval(intervalId)
    }, [flowers.length])

    return (
        <div className="smart-planter">
            <div className="content-container">
                <div className={`flower-container ${isVisible ? 'visible' : 'hidden'}`}>
                    <div className="flower-wrapper">
                        <img src={flowers[currentFlower]} alt="Smart Planter Flower" className="flower-image" />
                    </div>
                </div>

                <div className="text-container">
                    <H3 variant="primary" className="title">
                        {t('homepage.homepage_intro.title')}
                    </H3>
                    <Paragraph variant="secondary" size="xl" className="description">
                        {t('homepage.homepage_intro.description')}
                    </Paragraph>

                    <Button className="create-button" variant="default" onClick={() => navigate('/households')}>
                        {t('homepage.homepage_intro.button')}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default HomePageIntro
