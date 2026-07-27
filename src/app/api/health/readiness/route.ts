import { NextResponse } from 'next/server'
import { getServerEnv } from '@/config/env.server'

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {}
  let healthy = true

  try {
    const start = Date.now()
    const { getDb } = await import('@/lib/db/drizzle')
    const db = getDb()
    await db.execute({ sql: { sql: 'SELECT 1', values: [] } as any, params: [] } as any).catch(() => {
      const postgres = (db as any).$client
      if (postgres) return postgres`SELECT 1`
      throw new Error('No DB client')
    })
    checks.database = { status: 'ok', latencyMs: Date.now() - start }
  } catch (e: any) {
    checks.database = { status: 'error', error: e.message }
    healthy = false
  }

  try {
    const env = getServerEnv()
    if (env.UPSTASH_REDIS_REST_URL) {
      const start = Date.now()
      const res = await fetch(env.UPSTASH_REDIS_REST_URL, {
        headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` },
      })
      checks.redis = { status: res.ok ? 'ok' : 'error', latencyMs: Date.now() - start }
      if (!res.ok) { checks.redis.error = `HTTP ${res.status}`; healthy = false }
    } else {
      checks.redis = { status: 'skipped', error: 'Not configured' }
    }
  } catch (e: any) {
    checks.redis = { status: 'error', error: e.message }
    healthy = false
  }

  try {
    getServerEnv()
    checks.config = { status: 'ok' }
  } catch (e: any) {
    checks.config = { status: 'error', error: e.message }
    healthy = false
  }

  const env = getServerEnv()
  return NextResponse.json({
    status: healthy ? 'ready' : 'not_ready',
    environment: env.APP_ENV,
    timestamp: new Date().toISOString(),
    checks,
  }, { status: healthy ? 200 : 503 })
}
