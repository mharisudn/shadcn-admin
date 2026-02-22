import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

export function createDB(databaseUrl: string) {
  const sql = neon(databaseUrl, { fetchOptions: { cache: 'no-store' } })
  // @ts-ignore - Known type compatibility issue between Drizzle and Neon
  return drizzle(sql, { schema })
}
