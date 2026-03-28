import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Loader2, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTenantStore } from '@/stores/tenantStore'

type NotificationRow = Tables<'notifications'>

function StatCard({
  title,
  value,
  loading,
  error,
}: {
  title: string
  value: string | number
  loading: boolean
  error: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {loading ? (
        <Loader2 className="mt-2 h-6 w-6 animate-spin text-primary-600" />
      ) : error ? (
        <p className="mt-2 text-sm text-danger-600">—</p>
      ) : (
        <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      )}
    </div>
  )
}

const chartSample = [
  { name: 'M1', v: 12 },
  { name: 'M2', v: 19 },
  { name: 'M3', v: 15 },
  { name: 'M4', v: 22 },
]

export function DashboardPage() {
  const { t } = useTranslation()
  const profile = useAuthStore((s) => s.profile)
  const orgId = useTenantStore((s) => s.orgId)
  const name = profile?.display_name?.trim() || t('layout.user_menu')

  const today = new Date().toISOString().slice(0, 10)
  const monthStart = new Date()
  monthStart.setDate(1)
  const monthStartStr = monthStart.toISOString().slice(0, 10)

  const employeesQ = useQuery({
    queryKey: ['dash-employees-count', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId!)
      if (error) throw error
      return count ?? 0
    },
  })

  const presentQ = useQuery({
    queryKey: ['dash-present', orgId, today],
    enabled: !!orgId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId!)
        .eq('work_date', today)
        .in('status', ['present', 'late'])
      if (error) throw error
      return count ?? 0
    },
  })

  const leavePendingQ = useQuery({
    queryKey: ['dash-leave-pending', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId!)
        .eq('status', 'pending')
      if (error) throw error
      return count ?? 0
    },
  })

  const payrollMonthQ = useQuery({
    queryKey: ['dash-payroll-month', orgId, monthStartStr],
    enabled: !!orgId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('payroll_runs')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId!)
        .gte('period_start', monthStartStr)
      if (error) throw error
      return count ?? 0
    },
  })

  const notificationsQ = useQuery({
    queryKey: ['dash-notifications', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, body, created_at')
        .eq('org_id', orgId!)
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return (data ?? []) as Pick<NotificationRow, 'id' | 'title' | 'body' | 'created_at'>[]
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('dashboard.welcome', { name })}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t('dashboard.chart_placeholder')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t('dashboard.stat_employees')}
          value={employeesQ.data ?? 0}
          loading={employeesQ.isLoading}
          error={employeesQ.isError}
        />
        <StatCard
          title={t('dashboard.stat_present')}
          value={presentQ.data ?? 0}
          loading={presentQ.isLoading}
          error={presentQ.isError}
        />
        <StatCard
          title={t('dashboard.stat_leave_pending')}
          value={leavePendingQ.data ?? 0}
          loading={leavePendingQ.isLoading}
          error={leavePendingQ.isError}
        />
        <StatCard
          title={t('dashboard.stat_payroll_month')}
          value={payrollMonthQ.data ?? 0}
          loading={payrollMonthQ.isLoading}
          error={payrollMonthQ.isError}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">
            {t('dashboard.trend_headcount')}
          </h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSample}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="v" fill="#1a56db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">
            {t('dashboard.trend_attendance')}
          </h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSample.map((d, i) => ({ ...d, v: d.v - i }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="v" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          to="/employees/new"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <UserPlus className="h-5 w-5" />
          {t('dashboard.add_employee')}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/leave"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-800 hover:bg-primary-100"
        >
          {t('dashboard.approve_leave')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          {t('dashboard.recent_activity')}
        </h2>
        {notificationsQ.isLoading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        )}
        {notificationsQ.isError && (
          <p className="text-sm text-danger-600">{t('common.error')}</p>
        )}
        {!notificationsQ.isLoading && !notificationsQ.isError && (
          <ul className="divide-y divide-slate-100">
            {(notificationsQ.data?.length ?? 0) === 0 && (
              <li className="py-4 text-center text-sm text-slate-500">{t('common.noData')}</li>
            )}
            {notificationsQ.data?.map((n) => (
              <li key={n.id} className="py-3">
                <p className="font-medium text-slate-800">{n.title}</p>
                {n.body && <p className="text-sm text-slate-600">{n.body}</p>}
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
