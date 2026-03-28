import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useTenant } from '@/hooks/useTenant'
import { cn } from '@/lib/utils'

export function TenantGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { tenant } = useTenant()

  if (tenant.status === 'loading') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-slate-600">{t('tenant.loading')}</p>
      </div>
    )
  }

  if (tenant.status === 'missing_slug') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-4 text-center">
        <h1 className="text-lg font-semibold text-slate-800">{t('app.name')}</h1>
        <p className="max-w-md text-sm text-slate-600">{t('tenant.missing')}</p>
      </div>
    )
  }

  if (tenant.status === 'not_found') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-4 text-center">
        <h1 className="text-lg font-semibold text-slate-800">{t('tenant.notFound')}</h1>
        <p className="text-sm text-slate-500">
          {t('tenant.slug')}: <span className="font-mono">{tenant.slug}</span>
        </p>
      </div>
    )
  }

  if (tenant.status === 'error') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-lg font-semibold text-red-800">{t('tenant.notFound')}</h1>
        <p className="max-w-md text-sm text-slate-600">{t('tenant.configureSupabase')}</p>
        {tenant.error !== 'missing_env' && (
          <pre
            className={cn(
              'max-w-full overflow-x-auto rounded-lg bg-slate-100 p-3 text-left text-xs text-slate-700',
            )}
          >
            {tenant.error}
          </pre>
        )}
      </div>
    )
  }

  return <>{children}</>
}
