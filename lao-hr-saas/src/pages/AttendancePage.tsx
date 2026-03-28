import { useTranslation } from 'react-i18next'

export function AttendancePage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">{t('attendance.title')}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {t('attendance.clock_in')} / {t('attendance.clock_out')}
      </p>
    </div>
  )
}
