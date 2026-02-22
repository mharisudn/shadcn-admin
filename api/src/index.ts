import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { errorHandler } from './middleware/error-handler'
import { authMiddleware } from './middleware/auth'
import { cmsRouter } from './routes/cms'
import type { HonoEnv } from './env.d'

const app = new Hono<HonoEnv>()

// Global middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://admin.assurur.com'],
  credentials: true,
}))

// Health check
app.get('/', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Error handler (must be after routes but we'll add it last)
app.onError(errorHandler)

// API routes
app.route('/api/cms', cmsRouter)

export default app
