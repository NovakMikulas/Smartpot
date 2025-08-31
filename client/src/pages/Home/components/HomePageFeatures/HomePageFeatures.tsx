import React from 'react'
import { useTranslation } from 'react-i18next'
import GradientDiv from '../../../../components/GradientDiv/GradientDiv'
import { H4, H5 } from '../../../../components/Text/Heading/Heading'
import { Paragraph } from '../../../../components/Text/Paragraph/Paragraph'
import './HomePageFeatures.sass'

const HomePageFeatures: React.FC = () => {
    const { t } = useTranslation()

    
    const featureKeys = ['smart_pot', 'flower_care', 'household_management']

    return (
        <div className="features-main-container">
            <H4 className="features-title" variant="primary">
                {t('homepage.homepage_features.title')}
            </H4>
            <div className="features-container">
                {featureKeys.map(key => (
                    <GradientDiv key={key} className="feature-item">
                        <H5 variant="primary" className="feature-title">
                            {t(`homepage.homepage_features.features.${key}.title`)}
                        </H5>
                        <Paragraph variant="secondary" size="sm" className="feature-description">
                            {t(`homepage.homepage_features.features.${key}.description`)}
                        </Paragraph>
                    </GradientDiv>
                ))}
            </div>
        </div>
    )
}

export default HomePageFeatures
