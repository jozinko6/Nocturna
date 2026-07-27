export type JobType =
  | 'send_email'
  | 'process_webhook'
  | 'generate_leaderboard_snapshots'
  | 'cleanup_expired_training'
  | 'grant_daily_rewards'
  | 'cleanup_old_snapshots'
  | 'process_referral_rewards'
  | 'sync_stripe_subscriptions'
  | 'explore_dungeon_batch'
  | 'update_season_rankings'
  | 'process_outbox_events'
  | 'cleanup_old_messages'
  | 'send_notification_batch'

export interface JobPayloadMap {
  send_email: { to: string; subject: string; templateId: string; data: Record<string, unknown> }
  process_webhook: { provider: string; eventId: string; payload: string }
  generate_leaderboard_snapshots: { seasonId?: string }
  cleanup_expired_training: Record<string, never>
  grant_daily_rewards: Record<string, never>
  cleanup_old_snapshots: { keepDays: number }
  process_referral_rewards: { referralCodeId: string }
  sync_stripe_subscriptions: Record<string, never>
  explore_dungeon_batch: { characterId: string; expeditionType?: string }
  update_season_rankings: { seasonId: string }
  process_outbox_events: { batchSize: number }
  cleanup_old_messages: { keepDays: number }
  send_notification_batch: { notificationIds: string[] }
}

export interface JobDefinition<T extends keyof JobPayloadMap = keyof JobPayloadMap> {
  type: T
  maxAttempts: number
  timeoutMs: number
  handler: (payload: JobPayloadMap[T]) => Promise<void>
}

interface StoredJobDefinition {
  type: keyof JobPayloadMap
  maxAttempts: number
  timeoutMs: number
  handler: (payload: unknown) => Promise<void>
}

const jobHandlers = new Map<string, StoredJobDefinition>()

export function registerJob<T extends keyof JobPayloadMap>(def: JobDefinition<T>) {
  jobHandlers.set(def.type, {
    ...def,
    handler: (payload: unknown) => def.handler(payload as JobPayloadMap[T]),
  })
}

export function getJobHandler(type: string): StoredJobDefinition | undefined {
  return jobHandlers.get(type)
}

export function getAllJobTypes(): string[] {
  return Array.from(jobHandlers.keys())
}
