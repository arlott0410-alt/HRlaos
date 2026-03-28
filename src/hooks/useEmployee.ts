import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useTenant } from '@/hooks/useTenant'

export type EmployeeRow = {
  id: string
  org_id: string
  first_name: string
  last_name: string
  email: string | null
  status: string
}

/**
 * Loads employees for the current tenant (RLS applies). Returns empty until org + session are ready.
 */
export function useEmployee() {
  const { tenant } = useTenant()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tenant.status !== 'ready' || !isAuthenticated || authLoading) {
      setEmployees([])
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    supabase
      .from('employees')
      .select('id, org_id, first_name, last_name, email, status')
      .eq('org_id', tenant.orgId)
      .order('last_name')
      .then(({ data, error: e }) => {
        if (cancelled) return
        if (e) {
          setError(e.message)
          setEmployees([])
        } else {
          setEmployees((data ?? []) as EmployeeRow[])
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tenant, isAuthenticated, authLoading])

  return { employees, loading, error }
}
