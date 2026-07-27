import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

export type DB = ReturnType<typeof drizzle<typeof schema>>

let _db: DB | null = null

export function getDb(): DB {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  const client = postgres(url)
  _db = drizzle(client, { schema })
  return _db
}
