/** Forward only safe client headers to Supabase. */
const FORWARD_REQUEST_HEADERS = new Set([
  'authorization',
  'content-type',
  'prefer',
  'range',
  'accept',
  'accept-profile',
  'content-profile',
  'x-client-info',
])

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
])

export function buildForwardHeaders(
  req: Request,
  extra: Record<string, string>,
): Headers {
  const out = new Headers()
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase()
    if (HOP_BY_HOP.has(k) || !FORWARD_REQUEST_HEADERS.has(k)) return
    out.set(key, value)
  })
  for (const [k, v] of Object.entries(extra)) {
    out.set(k, v)
  }
  return out
}

export function filterResponseHeaders(src: Headers): Headers {
  const out = new Headers()
  src.forEach((value, key) => {
    const k = key.toLowerCase()
    if (k === 'content-encoding' || k === 'transfer-encoding') return
    out.append(key, value)
  })
  return out
}
