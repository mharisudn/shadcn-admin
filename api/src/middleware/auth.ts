import { Context, Next } from 'hono'
import type { DecodedToken } from '../lib/jwt'
import { verifySupabaseToken } from '../lib/jwt'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' }, 401)
  }

  const token = authHeader.substring(7)
  const jwksUrl = c.env.SUPABASE_JWKS_URL
  const jwtSecret = c.env.JWT_SECRET

  const decoded = await verifySupabaseToken(token, jwksUrl, jwtSecret)

  if (!decoded) {
    return c.json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' }, 401)
  }

  c.set('user', decoded)
  await next()
}
