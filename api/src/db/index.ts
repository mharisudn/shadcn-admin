import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

export function createDB(databaseUrl: string) {
  const sql = neon(databaseUrl)
  return drizzle(sql, { schema })
}
