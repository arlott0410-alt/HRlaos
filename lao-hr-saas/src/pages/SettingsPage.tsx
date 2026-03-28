import { useTranslation } from 'react-i18next'

export function SettingsPage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">{t('settings.title')}</h1>
      <p className="mt-2 text-sm text-slate-600">{t('settings.subtitle')}</p>
    </div>
  )
}
