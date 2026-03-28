export type TenantConfig = {
  org_id: string
  plan: string
  status: string
  features: unknown
  max_employees: number | null
}

export type Env = {
  HR_LAOS_KV: KVNamespace
  SUPABASE_URL: string
  SUPABASE_JWT_SECRET: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_ANON_KEY: string
  WEBHOOK_SECRET?: string
}
