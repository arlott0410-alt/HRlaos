import { useTranslation } from 'react-i18next'

export function EmployeeFormPage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">{t('employee_form.title_new')}</h1>
      <p className="mt-2 text-sm text-slate-600">{t('dashboard.chart_placeholder')}</p>
    </div>
  )
}
