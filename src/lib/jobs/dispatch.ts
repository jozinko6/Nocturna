import { drizzle } from 'drizzle-orm/postgres-js'
import { backgroundJobs } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'
import { type JobPayloadMap } from './registry'
import { logger } from '@/lib/logging/logger'

export interface DispatchOptions {
  idempotencyKey?: string
  priority?: number
  delayMs?: number
}

export async function dispatchJob<T extends keyof JobPayloadMap>(
  db: ReturnType<typeof drizzle>,
  jobType: T,
  payload: JobPayloadMap[T],
  options: DispatchOptions = {},
) {
  const idempotencyKey = options.idempotencyKey || `${jobType}_${Date.now()}_${Math.random().toString(36).slice(2)}`
  
  const [existing] = await db
    .select({ id: backgroundJobs.id })
    .from(backgroundJobs)
    .where(sql`${backgroundJobs.idempotencyKey} = ${idempotencyKey}`)
    .limit(1)
    .execute()
  
  if (existing) {
    logger.info(`Job ${jobType} already dispatched`, { requestId: existing.id })
    return existing.id
  }
  
  const [job] = await db
    .insert(backgroundJobs)
    .values({
      jobType,
      payload: payload as any,
      idempotencyKey,
      priority: options.priority ?? 5,
      scheduledAt: options.delayMs ? new Date(Date.now() + options.delayMs) : null,
    })
    .returning({ id: backgroundJobs.id })
    .execute()
  
  logger.info(`Dispatched job ${jobType}`, { requestId: job.id })
  return job.id
}
