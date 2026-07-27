import { NextResponse } from 'next/server'
import { getServerEnv } from '@/config/env.server'

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {}
  let healthy = true
  let environment = process.env.APP_ENV || process.env.VERCEL_ENV || 'development'

  try {
    const start = Date.now()
    const { getDb } = await import('@/lib/db/drizzle')
    const db = getDb()
    await db.$client`SELECT 1`
    checks.database = { status: 'ok', latencyMs: Date.now() - start }
  } catch (error: unknown) {
    checks.database = { status: 'error', error: getErrorMessage(error) }
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
  } catch (error: unknown) {
    checks.redis = { status: 'error', error: getErrorMessage(error) }
    healthy = false
  }

  try {
    const env = getServerEnv()
    environment = env.APP_ENV
    checks.config = { status: 'ok' }
  } catch (error: unknown) {
    checks.config = { status: 'error', error: getErrorMessage(error) }
    healthy = false
  }

  return NextResponse.json({
    status: healthy ? 'ready' : 'not_ready',
    environment,
    timestamp: new Date().toISOString(),
    checks,
  }, { status: healthy ? 200 : 503 })
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error'
}
