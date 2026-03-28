import type { Env } from '../types'

const LIMIT = 100
const WINDOW_MS = 60_000

export async function rateLimitTenant(
  kv: KVNamespace,
  tenantId: string,
): Promise<{ ok: true; remaining: number } | { ok: false }> {
  const bucket = Math.floor(Date.now() / WINDOW_MS)
  const key = `rl:${tenantId}:${bucket}`

  const raw = await kv.get(key)
  const parsed = raw ? parseInt(raw, 10) : 0
  const count = Number.isFinite(parsed) && parsed > 0 ? parsed : 0

  if (count >= LIMIT) {
    return { ok: false }
  }

  await kv.put(key, String(count + 1), { expirationTtl: 120 })

  return { ok: true, remaining: LIMIT - count - 1 }
}

export function envKv(env: Env): KVNamespace {
  return env.HR_LAOS_KV
}
