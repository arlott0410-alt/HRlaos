import { useTranslation } from 'react-i18next'

export function PayrollPage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">{t('payroll.title')}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {t('payroll.gross_pay')} · {t('payroll.net_pay')}
      </p>
    </div>
  )
}
