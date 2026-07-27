import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/db/drizzle', () => ({
  getDb() {
    throw new Error('DATABASE_URL is not set')
  },
}))

vi.mock('@/config/env.server', () => ({
  getServerEnv() {
    throw new Error('Supabase environment variables are not configured')
  },
}))

import { GET } from '@/app/api/health/readiness/route'

describe('readiness health check', () => {
  it('returns a structured 503 response when dependencies are not configured', async () => {
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.status).toBe('not_ready')
    expect(body.checks.database.status).toBe('error')
    expect(body.checks.config.status).toBe('error')
  })
})
