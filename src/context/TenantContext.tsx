import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'
import { getTenantSlugForApp } from '@/lib/tenant'

export type TenantState =
  | { status: 'loading'; slug: string | null; orgId: null; error: null }
  | { status: 'missing_slug'; slug: null; orgId: null; error: null }
  | { status: 'not_found'; slug: string; orgId: null; error: null }
  | { status: 'error'; slug: string | null; orgId: null; error: string }
  | { status: 'ready'; slug: string; orgId: string; error: null }

const TenantContext = createContext<{
  tenant: TenantState
  refetch: () => Promise<void>
} | null>(null)

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantState>(() => ({
    status: 'loading',
    slug: null,
    orgId: null,
    error: null,
  }))

  const resolve = useCallback(async () => {
    const slug = getTenantSlugForApp(window.location.hostname)

    if (!slug) {
      setTenant({ status: 'missing_slug', slug: null, orgId: null, error: null })
      return
    }

    setTenant({ status: 'loading', slug, orgId: null, error: null })

    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !key) {
      setTenant({
        status: 'error',
        slug,
        orgId: null,
        error: 'missing_env',
      })
      return
    }

    const { data, error } = await supabase.rpc('get_org_id_by_subdomain', {
      p_subdomain: slug,
    })

    if (error) {
      setTenant({
        status: 'error',
        slug,
        orgId: null,
        error: error.message,
      })
      return
    }

    if (!data) {
      setTenant({ status: 'not_found', slug, orgId: null, error: null })
      return
    }

    setTenant({ status: 'ready', slug, orgId: data, error: null })
  }, [])

  useEffect(() => {
    void resolve()
  }, [resolve])

  const value = useMemo(() => ({ tenant, refetch: resolve }), [tenant, resolve])

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenantContext() {
  const ctx = useContext(TenantContext)
  if (!ctx) {
    throw new Error('useTenantContext must be used within TenantProvider')
  }
  return ctx
}
