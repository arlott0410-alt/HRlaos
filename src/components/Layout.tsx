import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { InstallPWAHint } from '@/components/InstallPWAHint'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-brand-100',
  )

export function Layout() {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh pb-24 md:pb-8">
      <header className="sticky top-0 z-10 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="font-semibold text-brand-700">
            {t('app.name')}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              onClick={() => void supabase.auth.signOut()}
            >
              {t('common.logout')}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 md:flex-row md:py-8">
        <nav className="flex shrink-0 flex-row flex-wrap gap-1 md:w-48 md:flex-col">
          <NavLink to="/" end className={navClass}>
            {t('nav.dashboard')}
          </NavLink>
          <NavLink to="/employee" className={navClass}>
            {t('nav.employee')}
          </NavLink>
          <NavLink to="/attendance" className={navClass}>
            {t('nav.attendance')}
          </NavLink>
          <NavLink to="/payroll" className={navClass}>
            {t('nav.payroll')}
          </NavLink>
          <NavLink to="/leave" className={navClass}>
            {t('nav.leave')}
          </NavLink>
          <NavLink to="/reports" className={navClass}>
            {t('nav.reports')}
          </NavLink>
          <NavLink to="/settings" className={navClass}>
            {t('nav.settings')}
          </NavLink>
        </nav>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <InstallPWAHint />
    </div>
  )
}
