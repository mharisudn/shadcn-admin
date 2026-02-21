import { Context, Next } from 'hono'

export async function authMiddleware(c: Context, next: Next) {
  await next()
}
