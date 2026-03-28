import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  Coins,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useTenantStore } from '@/stores/tenantStore'
import { cn } from '@/lib/cn'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-100 text-primary-800'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  )

export function AppLayout() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const signOut = useAuthStore((s) => s.signOut)
  const profile = useAuthStore((s) => s.profile)
  const orgName = useTenantStore((s) => s.orgName)

  const displayName =
    profile?.display_name?.trim() ||
    (profile?.id ? profile.id.slice(0, 8) : t('layout.user_menu'))

  const navItems = [
    { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/employees', labelKey: 'nav.employees', icon: Users },
    { to: '/attendance', labelKey: 'nav.attendance', icon: CalendarDays },
    { to: '/leave', labelKey: 'nav.leave', icon: ClipboardList },
    { to: '/payroll', labelKey: 'nav.payroll', icon: Coins },
    { to: '/reports', labelKey: 'nav.reports', icon: BarChart3 },
    { to: '/settings', labelKey: 'nav.settings', icon: Settings },
  ] as const

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh bg-slate-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label={t('layout.menu_close')}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4 lg:h-16">
          <span className="truncate text-lg font-semibold text-primary-700">HR Laos</span>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label={t('layout.menu_close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={navLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="h-5 w-5" />
            {t('common.logout')}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:h-16 lg:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t('layout.menu_open')}
          >
            <Menu className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:flex"
            aria-hidden
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 lg:text-base">
              {orgName ?? '—'}
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center rounded-lg border border-slate-200">
              {(['lo', 'en', 'th'] as const).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  className={cn(
                    'px-2 py-1 text-xs font-medium uppercase',
                    i18n.language === lng
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                  onClick={() => void i18n.changeLanguage(lng)}
                >
                  {lng === 'lo' ? 'ລາວ' : lng}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label={t('layout.notifications')}
            >
              <Bell className="h-5 w-5" />
            </button>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800"
              title={displayName}
            >
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
