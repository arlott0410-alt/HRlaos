import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEmployee } from '@/hooks/useEmployee'

export function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { employees, loading, error } = useEmployee()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t('dashboard.welcome')}
          {user?.email ? ` — ${user.email}` : ''}
        </h1>
        <p className="mt-1 text-slate-600">{t('app.tagline')}</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('nav.employee')}
          <span className="ml-1 font-normal normal-case text-slate-400">
            ({t('dashboard.employeeListHint')})
          </span>
        </h2>
        {loading && <p className="text-sm text-slate-500">…</p>}
        {error && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>
        )}
        {!loading && !error && employees.length === 0 && (
          <p className="text-sm text-slate-500">{t('dashboard.noEmployees')}</p>
        )}
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {employees.map((e) => (
            <li key={e.id} className="px-4 py-3 text-sm">
              <span className="font-medium text-slate-800">
                {e.first_name} {e.last_name}
              </span>
              {e.email && <span className="ml-2 text-slate-500">{e.email}</span>}
              <span className="ml-2 text-xs text-slate-400">{e.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('dashboard.quickLinks')}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/employee"
            className="rounded-lg bg-brand-100 px-4 py-2 text-sm font-medium text-brand-800 hover:bg-brand-200"
          >
            {t('nav.employee')}
          </Link>
          <Link
            to="/attendance"
            className="rounded-lg bg-brand-100 px-4 py-2 text-sm font-medium text-brand-800 hover:bg-brand-200"
          >
            {t('nav.attendance')}
          </Link>
          <Link
            to="/settings"
            className="rounded-lg bg-brand-100 px-4 py-2 text-sm font-medium text-brand-800 hover:bg-brand-200"
          >
            {t('nav.settings')}
          </Link>
        </div>
      </section>
    </div>
  )
}
