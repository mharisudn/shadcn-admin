import type { Context } from 'hono'

export type Bindings = {
  DB: D1Database
  MEDIA: R2Bucket
  CACHE: KVNamespace
  DATABASE_URL: string
  SUPABASE_JWKS_URL: string
  JWT_SECRET: string
}

export type Variables = {
  user: {
    sub: string
    role?: 'admin' | 'editor' | 'author'
    email: string
  }
}

export type HonoEnv = {
  Bindings: Bindings
  Variables: Variables
}

// Extend Hono's Context type
declare module 'hono' {
  interface ContextVariableMap {
    user: Variables['user']
  }
}
