import { drizzle } from 'drizzle-orm/postgres-js'
import { and, eq, or, lt, sql } from 'drizzle-orm'
import { backgroundJobs } from '@/lib/db/schema'
import { getJobHandler } from './registry'
import { logger } from '@/lib/logging/logger'

const POLL_INTERVAL_MS = 5_000
const BATCH_SIZE = 10

let isRunning = false
let pollTimer: NodeJS.Timeout | null = null

export async function startJobRunner(db: ReturnType<typeof drizzle>) {
  if (isRunning) return
  isRunning = true
  logger.info('Job runner started')
  
  async function poll() {
    if (!isRunning) return
    
    try {
      const now = new Date()
      
      const jobs = await db
        .select()
        .from(backgroundJobs)
        .where(
          and(
            eq(backgroundJobs.status, 'pending'),
            or(
              lt(backgroundJobs.scheduledAt, now),
              sql`${backgroundJobs.scheduledAt} IS NULL`
            )
          )
        )
        .orderBy(backgroundJobs.priority)
        .limit(BATCH_SIZE)
        .for('UPDATE')
        .execute()
      
      for (const job of jobs) {
        await processJob(db, job)
      }
    } catch (error) {
      logger.error('Job runner poll error', {}, error as Error)
    }
    
    if (isRunning) {
      pollTimer = setTimeout(poll, POLL_INTERVAL_MS)
    }
  }
  
  await poll()
}

export function stopJobRunner() {
  isRunning = false
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
  logger.info('Job runner stopped')
}

async function processJob(db: ReturnType<typeof drizzle>, job: typeof backgroundJobs.$inferSelect) {
  const handler = getJobHandler(job.jobType)
  if (!handler) {
    logger.warn(`Unknown job type: ${job.jobType}`, { requestId: job.id })
    await markFailed(db, job.id, `Unknown job type: ${job.jobType}`)
    return
  }
  
  if (job.attempts >= job.maxAttempts) {
    await markFailed(db, job.id, 'Max attempts exceeded')
    return
  }
  
  try {
    await db
      .update(backgroundJobs)
      .set({
        status: 'processing',
        startedAt: new Date(),
        attempts: job.attempts + 1,
      })
      .where(eq(backgroundJobs.id, job.id))
      .execute()
    
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Job timed out after ${handler.timeoutMs}ms`)), handler.timeoutMs)
    )
    
    await Promise.race([
      handler.handler(job.payload as any),
      timeoutPromise,
    ])
    
    await db
      .update(backgroundJobs)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(backgroundJobs.id, job.id))
      .execute()
    
  } catch (error) {
    logger.error(`Job ${job.jobType} failed`, { requestId: job.id }, error as Error)
    
    if (job.attempts + 1 >= job.maxAttempts) {
      await markFailed(db, job.id, (error as Error).message)
    } else {
      await db
        .update(backgroundJobs)
        .set({
          status: 'pending',
          failedAt: null,
          lastError: (error as Error).message,
          scheduledAt: new Date(Date.now() + Math.pow(2, job.attempts) * 60_000),
        })
        .where(eq(backgroundJobs.id, job.id))
        .execute()
    }
  }
}

async function markFailed(db: ReturnType<typeof drizzle>, id: string, error: string) {
  await db
    .update(backgroundJobs)
    .set({ status: 'dead', failedAt: new Date(), lastError: error })
    .where(eq(backgroundJobs.id, id))
    .execute()
  logger.fatal(`Job ${id} marked dead`, { requestId: id })
}
