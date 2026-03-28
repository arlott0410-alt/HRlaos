import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/lib/supabase'
import { useTenantStore } from '@/stores/tenantStore'

export function EmployeeDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const orgId = useTenantStore((s) => s.orgId)

  const q = useQuery({
    queryKey: ['employee', id, orgId],
    enabled: !!id && !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id!)
        .eq('org_id', orgId!)
        .maybeSingle()
      if (error) throw error
      return data as Tables<'employees'> | null
    },
  })

  if (q.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (q.isError || !q.data) {
    return <p className="text-danger-600">{t('common.error')}</p>
  }

  const e = q.data

  return (
    <div className="space-y-4">
      <Link to="/employees" className="text-sm text-primary-600 hover:underline">
        {t('common.back')}
      </Link>
      <h1 className="text-xl font-bold text-slate-900">
        {t('employee_detail.title')}: {e.first_name} {e.last_name}
      </h1>
      <dl className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">{t('employee.email')}</dt>
          <dd className="font-medium">{e.email ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('employee.phone')}</dt>
          <dd className="font-medium">{e.phone ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('employee.province')}</dt>
          <dd className="font-medium">{e.province ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('employee.status')}</dt>
          <dd className="font-medium">{e.status}</dd>
        </div>
      </dl>
    </div>
  )
}
