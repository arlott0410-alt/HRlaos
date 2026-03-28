import { useTranslation } from 'react-i18next'

export function AttendancePage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold text-slate-900">{t('features.attendanceTitle')}</h1>
      <p className="text-slate-600">{t('features.attendanceBody')}</p>
    </div>
  )
}
