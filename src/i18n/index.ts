import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import lo from './lo.json'
import th from './th.json'

export const defaultNS = 'translation'
export const resources = {
  lo: { translation: lo },
  en: { translation: en },
  th: { translation: th },
} as const

void i18n.use(initReactI18next).init({
  resources,
  lng: 'lo',
  fallbackLng: 'en',
  defaultNS,
  interpolation: { escapeValue: false },
})

export default i18n
