const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/i
const HR_LAOS = /^https:\/\/([a-z0-9-]+\.)*hrlaos\.la$/i

export function isAllowedOrigin(origin: string | undefined): string | null {
  if (!origin) return null
  if (LOCAL.test(origin)) return origin
  if (HR_LAOS.test(origin)) return origin
  return null
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const o = origin ?? '*'
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers':
      'Authorization, Content-Type, apikey, x-client-info, prefer, range, accept-profile, content-profile, x-tenant-subdomain',
    'Access-Control-Expose-Headers': 'x-tenant-id, content-range',
    'Access-Control-Max-Age': '86400',
  }
  if (o !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true'
  }
  return headers
}

/** Use when returning a raw Response so CORS is always applied (e.g. proxy routes). */
export function withCors(res: Response, origin: string | null): Response {
  const headers = new Headers(res.headers)
  for (const [k, v] of Object.entries(corsHeaders(origin))) {
    headers.set(k, v)
  }
  return new Response(res.body, { status: res.status, headers })
}
