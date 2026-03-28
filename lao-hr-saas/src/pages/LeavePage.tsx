import { useTranslation } from 'react-i18next'

export function LeavePage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">{t('leave.title')}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {t('leave.annual_leave')} · {t('leave.pending')}
      </p>
    </div>
  )
}
