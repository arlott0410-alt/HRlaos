const LOCALHOST_NAMES = new Set(['localhost', '127.0.0.1', '[::1]'])

/**
 * Returns tenant slug from host like `acme.app.example.com` → `acme`.
 * Plain `localhost` / apex marketing domain → null (use env override in dev).
 */
export function extractTenantSlugFromHostname(hostname: string): string | null {
  const host = hostname.split(':')[0].toLowerCase()
  const parts = host.split('.').filter(Boolean)

  if (parts.length === 0) return null

  if (LOCALHOST_NAMES.has(parts[0])) {
    return null
  }

  // e.g. acme.localhost (some dev setups)
  if (parts.length >= 2 && LOCALHOST_NAMES.has(parts[parts.length - 1])) {
    return parts[0]
  }

  // acme.hrlaos.com → acme; www.hrlaos.com → treat www as no tenant
  if (parts[0] === 'www') {
    return null
  }

  if (parts.length >= 3) {
    return parts[0]
  }

  // apex: hrlaos.com
  return null
}

export function getTenantSlugForApp(hostname: string): string | null {
  const fromHost = extractTenantSlugFromHostname(hostname)
  if (fromHost) return fromHost

  const devSlug = import.meta.env.VITE_DEV_TENANT_SLUG?.trim()
  if (devSlug) return devSlug

  return null
}
