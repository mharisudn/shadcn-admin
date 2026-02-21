import { Hono } from 'hono'
import type { Bindings } from './index'

export function createApp() {
  const app = new Hono<{ Bindings: Bindings }>()

  // Register routes here
  return app
}
