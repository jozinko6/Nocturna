import { eq } from 'drizzle-orm'
import { featureFlags } from '@/lib/db/schema'
import type { DB } from '@/lib/db/drizzle'

export type FeatureFlagName =
  | 'registrations'
  | 'expeditions'
  | 'pvp'
  | 'training'
  | 'merchant'
  | 'item_sales'
  | 'hideout_upgrades'
  | 'clans'
  | 'private_messages'
  | 'seasons'
  | 'live_events'
  | 'payments'
  | 'subscriptions'
  | 'rewarded_ads'
  | 'referrals'
  | 'premium_store'
  | 'admin_compensations'
  | 'maintenance_mode'

export interface FeatureFlag {
  name: string
  enabled: boolean
  stagingOnly: boolean
  rolloutPercent: number
  allowlist: string[]
  minVersion: string | null
  startsAt: string | null
  endsAt: string | null
}

const flagCache = new Map<string, { flag: FeatureFlag; expiresAt: number }>()
const CACHE_TTL_MS = 30_000

export async function isFeatureEnabled(
  db: DB,
  name: FeatureFlagName,
  context?: { userId?: string; clientVersion?: string },
): Promise<boolean> {
  const flag = await getFlag(db, name)
  if (!flag) return true

  if (!flag.enabled) return false
  if (flag.stagingOnly && process.env.APP_ENV !== 'staging') return false
  if (flag.startsAt && new Date(flag.startsAt) > new Date()) return false
  if (flag.endsAt && new Date(flag.endsAt) < new Date()) return false
  if (flag.minVersion && context?.clientVersion && context.clientVersion < flag.minVersion) return false
  if (flag.allowlist.length > 0 && context?.userId && !flag.allowlist.includes(context.userId)) return false
  if (flag.rolloutPercent < 100 && context?.userId) {
    const hash = simpleHash(context.userId + name)
    if (hash >= flag.rolloutPercent) return false
  }
  return true
}

export async function getFlag(db: DB, name: string): Promise<FeatureFlag | null> {
  const cached = flagCache.get(name)
  if (cached && cached.expiresAt > Date.now()) return cached.flag

  const [row] = await db.select().from(featureFlags).where(eq(featureFlags.key, name)).limit(1)
  if (!row) return null

  const value = row.config as Partial<FeatureFlag> | null
  const flag: FeatureFlag = {
    name,
    enabled: row.enabled,
    stagingOnly: value?.stagingOnly ?? false,
    rolloutPercent: value?.rolloutPercent ?? 100,
    allowlist: value?.allowlist ?? [],
    minVersion: value?.minVersion ?? null,
    startsAt: value?.startsAt ?? null,
    endsAt: value?.endsAt ?? null,
  }

  flagCache.set(name, { flag, expiresAt: Date.now() + CACHE_TTL_MS })
  return flag
}

export async function setFlag(
  db: DB,
  name: string,
  value: Partial<FeatureFlag>,
  adminId?: string,
): Promise<void> {
  void adminId
  const existing = await getFlag(db, name)
  const merged = { ...existing, ...value, name }

  const config = {
    stagingOnly: merged.stagingOnly,
    rolloutPercent: merged.rolloutPercent,
    allowlist: merged.allowlist,
    minVersion: merged.minVersion,
    startsAt: merged.startsAt,
    endsAt: merged.endsAt,
  }

  await db.insert(featureFlags).values({
    key: name,
    enabled: merged.enabled ?? true,
    config,
  }).onConflictDoUpdate({
    target: featureFlags.key,
    set: { enabled: merged.enabled ?? true, config, updatedAt: new Date() },
  })

  flagCache.delete(name)
}

export function invalidateFlagCache(name?: string) {
  if (name) {
    flagCache.delete(name)
  } else {
    flagCache.clear()
  }
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 100
}

export function getAllFlagNames(): FeatureFlagName[] {
  return [
    'registrations', 'expeditions', 'pvp', 'training', 'merchant', 'item_sales',
    'hideout_upgrades', 'clans', 'private_messages', 'seasons', 'live_events',
    'payments', 'subscriptions', 'rewarded_ads', 'referrals', 'premium_store',
    'admin_compensations', 'maintenance_mode',
  ]
}
