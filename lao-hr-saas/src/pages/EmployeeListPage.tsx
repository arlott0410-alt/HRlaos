import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/lib/supabase'
import { useTenantStore } from '@/stores/tenantStore'

type Employee = Tables<'employees'>

export function EmployeeListPage() {
  const { t } = useTranslation()
  const orgId = useTenantStore((s) => s.orgId)

  const q = useQuery({
    queryKey: ['employees', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, status, employee_code')
        .eq('org_id', orgId!)
        .order('last_name')
      if (error) throw error
      return data as Employee[]
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">{t('employees_page.title')}</h1>
        <Link
          to="/employees/new"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          {t('employee.new')}
        </Link>
      </div>
      {q.isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      )}
      {q.isError && <p className="text-sm text-danger-600">{t('common.error')}</p>}
      {!q.isLoading && !q.isError && (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {q.data?.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-slate-500">{t('employees_page.empty')}</li>
          )}
          {q.data?.map((e) => (
            <li key={e.id}>
              <Link
                to={`/employees/${e.id}`}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-slate-900">
                  {e.first_name} {e.last_name}
                </span>
                <span className="text-sm text-slate-500">{e.email ?? e.employee_code ?? '—'}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
