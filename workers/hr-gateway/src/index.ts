import { Hono } from 'hono'
import { corsHeaders, isAllowedOrigin, withCors } from './lib/cors'
import { buildForwardHeaders, filterResponseHeaders } from './lib/proxy'
import { orgIdFromJwt, verifySupabaseJwt } from './lib/jwt'
import { envKv, rateLimitTenant } from './lib/ratelimit'
import {
  getTenantConfigCached,
  resolveOrgIdBySubdomain,
  subdomainFromHost,
} from './lib/tenant'
import type { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

function bearerToken(req: Request): string | null {
  const h = req.headers.get('Authorization')
  if (!h?.startsWith('Bearer ')) return null
  return h.slice(7).trim() || null
}

app.use('*', async (c, next) => {
  const allowed = isAllowedOrigin(c.req.header('Origin'))

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(allowed) })
  }

  await next()
})

app.all('/auth/*', async (c) => {
  const origin = isAllowedOrigin(c.req.header('Origin'))
  const env = c.env
  const u = new URL(c.req.url)
  const target = `${env.SUPABASE_URL}${u.pathname}${u.search}`

  const body =
    c.req.method === 'GET' || c.req.method === 'HEAD' ? undefined : await c.req.arrayBuffer()

  const authHeaders = new Headers()
  authHeaders.set('apikey', env.SUPABASE_ANON_KEY)
  const ct = c.req.header('Content-Type')
  if (ct) authHeaders.set('Content-Type', ct)
  const authz = c.req.header('Authorization')
  if (authz) authHeaders.set('Authorization', authz)

  const res = await fetch(target, {
    method: c.req.method,
    headers: authHeaders,
    body,
    redirect: 'manual',
  })

  const proxied = new Response(res.body, {
    status: res.status,
    headers: filterResponseHeaders(res.headers),
  })
  return withCors(proxied, origin)
})

app.post('/webhook/*', async (c) => {
  const origin = isAllowedOrigin(c.req.header('Origin'))
  const secret = c.env.WEBHOOK_SECRET
  if (!secret) {
    return withCors(c.json({ error: 'webhook_not_configured' }, 501), origin)
  }
  const auth = c.req.header('Authorization')
  if (auth !== `Bearer ${secret}`) {
    return withCors(c.json({ error: 'unauthorized' }, 401), origin)
  }

  await c.req.json().catch(() => null)

  return withCors(c.json({ ok: true, at: new Date().toISOString() }), origin)
})

app.all('/api/*', async (c) => {
  const origin = isAllowedOrigin(c.req.header('Origin'))
  const env = c.env
  const token = bearerToken(c.req.raw)
  if (!token) {
    return withCors(c.json({ error: 'missing_authorization' }, 401), origin)
  }

  let payload
  try {
    payload = await verifySupabaseJwt(token, env)
  } catch {
    return withCors(c.json({ error: 'invalid_token' }, 401), origin)
  }

  const host = c.req.header('Host') ?? ''
  const headerSlug = c.req.header('X-Tenant-Subdomain')?.trim().toLowerCase() ?? null
  const hostSlug = subdomainFromHost(host)

  let orgFromJwt = orgIdFromJwt(payload)
  let orgFromSub: string | null = null

  const slug = headerSlug || hostSlug
  if (slug) {
    orgFromSub = await resolveOrgIdBySubdomain(env, slug)
    if (!orgFromSub) {
      return withCors(c.json({ error: 'unknown_tenant_subdomain', subdomain: slug }, 404), origin)
    }
  }

  let orgId = orgFromJwt ?? orgFromSub
  if (orgFromJwt && orgFromSub && orgFromJwt !== orgFromSub) {
    return withCors(c.json({ error: 'tenant_mismatch' }, 403), origin)
  }

  if (!orgId) {
    return withCors(
      c.json(
        {
          error: 'tenant_required',
          hint: 'Set app_metadata.org_id on the user JWT and/or send Host *.hrlaos.la or X-Tenant-Subdomain',
        },
        400,
      ),
      origin,
    )
  }

  const rl = await rateLimitTenant(envKv(env), orgId)
  if (!rl.ok) {
    return withCors(c.json({ error: 'rate_limit_exceeded', limit: 100, window: '1m' }, 429), origin)
  }

  const tenantCfg = await getTenantConfigCached(env, orgId)
  if (!tenantCfg) {
    return withCors(c.json({ error: 'tenant_not_found' }, 404), origin)
  }
  if (tenantCfg.status === 'suspended' || tenantCfg.status === 'churned') {
    return withCors(c.json({ error: 'tenant_inactive', status: tenantCfg.status }, 403), origin)
  }

  const u = new URL(c.req.url)
  const restPath = u.pathname.replace(/^\/api/, '/rest/v1')
  const target = `${env.SUPABASE_URL}${restPath}${u.search}`

  const forwardHeaders = buildForwardHeaders(c.req.raw, {
    apikey: env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    'x-tenant-id': orgId,
  })

  const body =
    c.req.method === 'GET' || c.req.method === 'HEAD' ? undefined : await c.req.arrayBuffer()

  const res = await fetch(target, {
    method: c.req.method,
    headers: forwardHeaders,
    body,
    redirect: 'manual',
  })

  const out = new Response(res.body, { status: res.status })
  const fh = filterResponseHeaders(res.headers)
  fh.forEach((v, k) => out.headers.set(k, v))
  out.headers.set('x-tenant-id', orgId)
  out.headers.set('x-ratelimit-remaining', String(rl.remaining))
  return withCors(out, isAllowedOrigin(c.req.header('Origin')))
})

app.get('/', (c) =>
  withCors(
    c.json({
      service: 'hr-laos-gateway',
      routes: ['/api/*', '/auth/*', '/webhook/*'],
    }),
    isAllowedOrigin(c.req.header('Origin')),
  ),
)

export default app
