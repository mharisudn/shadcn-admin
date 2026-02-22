import { Hono } from 'hono'
import type { HonoEnv } from './env.d'

export function createApp() {
  const app = new Hono<HonoEnv>()

  // Register routes here
  return app
}
