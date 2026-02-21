import type { ErrorHandler } from 'hono'

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Error:', err)
  return c.json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }, 500)
}
