import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AttendancePage } from '@/pages/AttendancePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { EmployeeDetailPage } from '@/pages/EmployeeDetailPage'
import { EmployeeFormPage } from '@/pages/EmployeeFormPage'
import { EmployeeListPage } from '@/pages/EmployeeListPage'
import { LeavePage } from '@/pages/LeavePage'
import { LoginPage } from '@/pages/LoginPage'
import { PayrollPage } from '@/pages/PayrollPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useAuthStore } from '@/stores/authStore'
import { useTenantStore } from '@/stores/tenantStore'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ProtectedRoute() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" aria-hidden />
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function TenantRoute() {
  const { t } = useTranslation()
  const orgId = useTenantStore((s) => s.orgId)
  const loading = useTenantStore((s) => s.isLoading)
  const error = useTenantStore((s) => s.error)

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-slate-50 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="text-sm text-slate-600">{t('tenant.loading')}</p>
      </div>
    )
  }

  if (!orgId) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-slate-50 px-4 text-center">
        <p className="text-slate-800">{t('tenant.missing')}</p>
        {error && <p className="text-xs text-danger-600">{error}</p>}
      </div>
    )
  }

  return <Outlet />
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <TenantRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to="/dashboard" replace /> },
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'employees', element: <EmployeeListPage /> },
              { path: 'employees/new', element: <EmployeeFormPage /> },
              { path: 'employees/:id', element: <EmployeeDetailPage /> },
              { path: 'attendance', element: <AttendancePage /> },
              { path: 'leave', element: <LeavePage /> },
              { path: 'payroll', element: <PayrollPage /> },
              { path: 'reports', element: <ReportsPage /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
