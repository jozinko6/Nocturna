import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerEnv } from '@/config/env.server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const env = getServerEnv()
    
    const checks: Record<string, any> = {}
    
    // DB
    try {
      const start = Date.now()
      const { getDb } = await import('@/lib/db/drizzle')
      const db = getDb()
      const postgres = (db as any).$client
      if (postgres) await postgres`SELECT 1`
      checks.database = { status: 'ok', latencyMs: Date.now() - start }
    } catch (e: any) {
      checks.database = { status: 'error', error: e.message }
    }
    
    // Redis
    try {
      if (env.UPSTASH_REDIS_REST_URL) {
        const start = Date.now()
        const res = await fetch(env.UPSTASH_REDIS_REST_URL, {
          headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` },
        })
        checks.redis = { status: res.ok ? 'ok' : 'error', latencyMs: Date.now() - start }
      }
    } catch (e: any) {
      checks.redis = { status: 'error', error: e.message }
    }
    
    // Background jobs
    try {
      const { getDb } = await import('@/lib/db/drizzle')
      const { backgroundJobs } = await import('@/lib/db/schema')
      const { eq, sql } = await import('drizzle-orm')
      const db = getDb()
      const pending = await db.select({ count: sql`count(*)::int` }).from(backgroundJobs).where(eq(backgroundJobs.status, 'pending'))
      const failed = await db.select({ count: sql`count(*)::int` }).from(backgroundJobs).where(eq(backgroundJobs.status, 'dead'))
      checks.backgroundJobs = {
        pending: pending[0]?.count ?? 0,
        deadLetters: failed[0]?.count ?? 0,
      }
    } catch (e: any) {
      checks.backgroundJobs = { status: 'error', error: e.message }
    }
    
    // Feature flags
    try {
      const { getDb } = await import('@/lib/db/drizzle')
      const { featureFlags } = await import('@/lib/db/schema')
      const { sql } = await import('drizzle-orm')
      const db = getDb()
      const flags = await db.select({ count: sql`count(*)::int` }).from(featureFlags)
      checks.featureFlags = { count: flags[0]?.count ?? 0 }
    } catch (e: any) {
      checks.featureFlags = { status: 'error' }
    }
    
    return NextResponse.json({
      status: 'ok',
      environment: env.APP_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    })
  } catch (e: any) {
    return NextResponse.json({ status: 'error', error: e.message }, { status: 500 })
  }
}
