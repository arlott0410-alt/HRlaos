import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useTenant } from '@/hooks/useTenant'

export function Settings() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { tenant } = useTenant()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">{t('settings.title')}</h1>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">{t('settings.account')}</h2>
        <p className="mt-2 font-mono text-sm text-slate-600">{user?.email ?? '—'}</p>
        <p className="mt-1 font-mono text-xs text-slate-400">{user?.id}</p>
      </section>

      {tenant.status === 'ready' && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-800">{t('settings.tenantId')}</h2>
          <p className="mt-2 font-mono text-sm text-slate-600">{tenant.orgId}</p>
          <p className="mt-1 text-sm text-slate-500">
            Subdomain: <span className="font-mono">{tenant.slug}</span>
          </p>
        </section>
      )}
    </div>
  )
}
