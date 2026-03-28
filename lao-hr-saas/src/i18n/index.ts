import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const supported = new Set(['lo', 'en', 'th'])

function detectLanguage(): string {
  const nav = (navigator.language || 'lo').split('-')[0]?.toLowerCase() ?? 'lo'
  if (supported.has(nav)) return nav
  return 'lo'
}

/**
 * Lazy-loads locale JSON into separate chunks (dynamic import).
 * Browser language is detected but unknown codes fall back to Lao.
 */
export async function initI18n(): Promise<typeof i18n> {
  if (i18n.isInitialized) {
    return i18n
  }

  const [loMod, enMod, thMod] = await Promise.all([
    import('./lo.json'),
    import('./en.json'),
    import('./th.json'),
  ])

  const detected = detectLanguage()

  await i18n.use(initReactI18next).init({
    resources: {
      lo: { translation: loMod.default },
      en: { translation: enMod.default },
      th: { translation: thMod.default },
    },
    lng: detected,
    fallbackLng: 'lo',
    defaultNS: 'translation',
    interpolation: { escapeValue: false },
  })

  return i18n
}

export default i18n
