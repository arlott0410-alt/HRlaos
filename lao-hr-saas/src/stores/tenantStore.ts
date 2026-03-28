import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const LOCALHOST = new Set(['localhost', '127.0.0.1', '[::1]'])

function extractSubdomain(hostname: string): string | null {
  const host = hostname.split(':')[0].toLowerCase()
  const parts = host.split('.').filter(Boolean)
  if (parts.length < 2) return null
  if (LOCALHOST.has(parts[parts.length - 1]) && parts.length >= 2) {
    return parts[0] === 'localhost' ? null : parts[0]
  }
  if (parts[0] === 'www') return null
  if (parts.length >= 3) return parts[0]
  return null
}

type TenantState = {
  orgId: string | null
  orgName: string | null
  orgPlan: string | null
  maxEmployees: number | null
  subdomain: string | null
  isLoading: boolean
  error: string | null
  init: () => Promise<void>
  reset: () => void
}

export const useTenantStore = create<TenantState>((set) => ({
  orgId: null,
  orgName: null,
  orgPlan: null,
  maxEmployees: null,
  subdomain: null,
  isLoading: true,
  error: null,

  reset: () =>
    set({
      orgId: null,
      orgName: null,
      orgPlan: null,
      maxEmployees: null,
      subdomain: null,
      isLoading: false,
      error: null,
    }),

  init: async () => {
    const devSlug = import.meta.env.VITE_DEV_TENANT_SLUG?.trim()
    const fromHost = extractSubdomain(window.location.hostname)
    const slug = fromHost ?? devSlug ?? null

    if (!slug) {
      set({
        subdomain: null,
        orgId: null,
        orgName: null,
        orgPlan: null,
        maxEmployees: null,
        isLoading: false,
        error: null,
      })
      return
    }

    set({ isLoading: true, error: null, subdomain: slug })

    const { data: orgId, error: rpcError } = await supabase.rpc(
      'get_org_id_by_subdomain',
      { p_subdomain: slug },
    )

    if (rpcError || !orgId) {
      set({
        orgId: null,
        orgName: null,
        orgPlan: null,
        maxEmployees: null,
        isLoading: false,
        error: rpcError?.message ?? 'tenant_not_found',
      })
      return
    }

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, plan')
      .eq('id', orgId)
      .maybeSingle()

    if (orgError || !org) {
      set({
        orgId: null,
        orgName: null,
        orgPlan: null,
        maxEmployees: null,
        isLoading: false,
        error: orgError?.message ?? 'tenant_not_found',
      })
      return
    }

    set({
      orgId: org.id,
      orgName: org.name,
      orgPlan: org.plan,
      maxEmployees: null,
      isLoading: false,
      error: null,
    })
  },
}))
