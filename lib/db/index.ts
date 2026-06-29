import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '@/lib/db/schema'

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL
  return url && url.length > 0 ? url : null
}

export function getDb() {
  const url = getDatabaseUrl()
  if (!url) {
    throw new Error('DATABASE_URL is not configured')
  }
  if (!dbInstance) {
    const sql = neon(url)
    dbInstance = drizzle(sql, { schema })
  }
  return dbInstance
}

export function hasDb(): boolean {
  return getDatabaseUrl() !== null
}

export { schema }
