import { jwtVerify } from 'jose'
import type { Env } from '../types'

export type SupabaseJwtPayload = {
  sub: string
  aud?: string
  role?: string
  app_metadata?: { org_id?: string }
  user_metadata?: { org_id?: string }
  exp?: number
}

export async function verifySupabaseJwt(
  token: string,
  env: Pick<Env, 'SUPABASE_JWT_SECRET'>,
): Promise<SupabaseJwtPayload> {
  const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET)
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ['HS256'],
  })
  return payload as unknown as SupabaseJwtPayload
}

export function orgIdFromJwt(payload: SupabaseJwtPayload): string | undefined {
  const fromApp = payload.app_metadata?.org_id
  if (typeof fromApp === 'string' && fromApp.length > 0) return fromApp
  const fromUser = payload.user_metadata?.org_id
  if (typeof fromUser === 'string' && fromUser.length > 0) return fromUser
  return undefined
}
