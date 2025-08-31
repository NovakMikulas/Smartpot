import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import translationCZ from '../locales/cz.json'
import translationEN from '../locales/en.json'

export type TranslationFunction = (key: string) => string

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            cz: {
                translation: translationCZ,
            },
            en: {
                translation: translationEN,
            },
        },
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n
