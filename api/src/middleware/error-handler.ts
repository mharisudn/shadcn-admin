import type { ErrorHandler } from 'hono'

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Error:', err)

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return c.json({ error: 'VALIDATION_ERROR', message: err.message }, 400)
  }

  if (err.name === 'NotFoundError') {
    return c.json({ error: 'NOT_FOUND', message: err.message }, 404)
  }

  // Generic error
  return c.json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }, 500)
}
