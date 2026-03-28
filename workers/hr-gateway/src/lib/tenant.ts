import type { Env, TenantConfig } from '../types'

/** First label of *.hrlaos.la; returns null for apex or non-matching host. */
export function subdomainFromHost(host: string): string | null {
  const h = host.split(':')[0].toLowerCase()
  const parts = h.split('.').filter(Boolean)
  if (parts.length < 3) return null
  if (parts[parts.length - 2] === 'hrlaos' && parts[parts.length - 1] === 'la') {
    const sub = parts[0]
    if (sub === 'www') return null
    return sub
  }
  return null
}

export async function resolveOrgIdBySubdomain(
  env: Pick<Env, 'SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY'>,
  subdomain: string,
): Promise<string | null> {
  const url = `${env.SUPABASE_URL}/rest/v1/rpc/get_org_id_by_subdomain`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_subdomain: subdomain }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as unknown
  if (typeof data === 'string') return data
  if (data === null) return null
  return null
}

export async function getTenantConfigCached(
  env: Env,
  orgId: string,
): Promise<TenantConfig | null> {
  const cacheKey = `tc:${orgId}`
  const cached = await env.HR_LAOS_KV.get(cacheKey, 'json')
  if (cached && typeof cached === 'object' && cached !== null && 'org_id' in cached) {
    return cached as TenantConfig
  }

  const q = new URL(`${env.SUPABASE_URL}/rest/v1/organizations`)
  q.searchParams.set('id', `eq.${orgId}`)
  q.searchParams.set(
    'select',
    'id,plan,status,features,max_employees',
  )

  const res = await fetch(q.toString(), {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/json',
    },
  })
  if (!res.ok) return null
  const rows = (await res.json()) as Array<{
    id: string
    plan: string
    status: string
    features: unknown
    max_employees: number | null
  }>
  const row = rows[0]
  if (!row) return null

  const config: TenantConfig = {
    org_id: row.id,
    plan: row.plan,
    status: row.status,
    features: row.features ?? [],
    max_employees: row.max_employees ?? null,
  }

  await env.HR_LAOS_KV.put(cacheKey, JSON.stringify(config), {
    expirationTtl: 300,
  })

  return config
}
