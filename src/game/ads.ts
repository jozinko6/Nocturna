import { eq, and, sql, gte, count } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import {
  rewardedAdClaims,
  characters,
  characterResources,
} from '@/lib/db/schema'

export const AD_REWARD_GOLD = 50
export const AD_REWARD_ENERGY = 25
export const AD_REWARD_CRYSTALS = 5
export const MAX_AD_CLAIMS_PER_DAY = 5
export const AD_COOLDOWN_SECONDS = 30
export const AD_PROVIDER = 'nocturna_internal'

export type RewardType = 'gold' | 'energy' | 'crystals'

type DB = PostgresJsDatabase

function startOfToday(): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

export function getAdRewards(): { type: RewardType; amount: number; label: string }[] {
  return [
    { type: 'gold', amount: AD_REWARD_GOLD, label: 'Zlato' },
    { type: 'energy', amount: AD_REWARD_ENERGY, label: 'Energia' },
    { type: 'crystals', amount: AD_REWARD_CRYSTALS, label: 'Kryštály' },
  ]
}

export async function canClaimAd(
  db: DB,
  characterId: string,
): Promise<{ canClaim: boolean; reason?: string; nextAvailableAt?: Date }> {
  const today = startOfToday()

  const [row] = await db
    .select({ cnt: count() })
    .from(rewardedAdClaims)
    .where(
      and(
        eq(rewardedAdClaims.characterId, characterId),
        gte(rewardedAdClaims.createdAt, today),
      ),
    )

  const claimsToday = row?.cnt ?? 0

  if (claimsToday >= MAX_AD_CLAIMS_PER_DAY) {
    return {
      canClaim: false,
      reason: 'Dnes už máš všetky odmeny za reklamy vyčerpané.',
    }
  }

  const [last] = await db
    .select({ createdAt: rewardedAdClaims.createdAt })
    .from(rewardedAdClaims)
    .where(eq(rewardedAdClaims.characterId, characterId))
    .orderBy(sql`${rewardedAdClaims.createdAt} DESC`)
    .limit(1)

  if (last) {
    const elapsed = (Date.now() - last.createdAt.getTime()) / 1000
    if (elapsed < AD_COOLDOWN_SECONDS) {
      const nextAt = new Date(last.createdAt.getTime() + AD_COOLDOWN_SECONDS * 1000)
      return {
        canClaim: false,
        reason: `Počkaj ešte ${Math.ceil(AD_COOLDOWN_SECONDS - elapsed)} sekúnd.`,
        nextAvailableAt: nextAt,
      }
    }
  }

  return { canClaim: true }
}

export async function claimAdReward(
  db: DB,
  characterId: string,
  rewardType: RewardType,
  idempotencyKey: string,
): Promise<{ rewardType: RewardType; amount: number; newBalance: number }> {
  const rewards = getAdRewards()
  const reward = rewards.find((r) => r.type === rewardType)
  if (!reward) {
    throw new Error('Neplatný typ odmeny.')
  }

  const eligibility = await canClaimAd(db, characterId)
  if (!eligibility.canClaim) {
    throw new Error(eligibility.reason ?? 'Nie je možné prevziať odmenu.')
  }

  const result = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: rewardedAdClaims.id })
      .from(rewardedAdClaims)
      .where(eq(rewardedAdClaims.idempotencyKey, idempotencyKey))
      .limit(1)

    if (existing) {
      throw new Error('Táto požiadavka už bola spracovaná.')
    }

    await tx.insert(rewardedAdClaims).values({
      characterId,
      adProvider: AD_PROVIDER,
      rewardType,
      rewardAmount: reward.amount,
      claimed: true,
      idempotencyKey,
    })

    let newBalance = 0

    if (rewardType === 'gold') {
      const [row] = await tx
        .update(characters)
        .set({ gold: sql`${characters.gold} + ${reward.amount}` })
        .where(eq(characters.id, characterId))
        .returning({ gold: characters.gold })
      newBalance = row!.gold
    } else if (rewardType === 'energy') {
      const [row] = await tx
        .update(characterResources)
        .set({
          currentEnergy: sql`LEAST(${characterResources.currentEnergy} + ${reward.amount}, ${characterResources.maxEnergy})`,
        })
        .where(eq(characterResources.characterId, characterId))
        .returning({ currentEnergy: characterResources.currentEnergy })
      newBalance = row!.currentEnergy
    } else if (rewardType === 'crystals') {
      const [row] = await tx
        .update(characters)
        .set({ premiumCurrency: sql`${characters.premiumCurrency} + ${reward.amount}` })
        .where(eq(characters.id, characterId))
        .returning({ premiumCurrency: characters.premiumCurrency })
      newBalance = row!.premiumCurrency
    }

    return { rewardType, amount: reward.amount, newBalance }
  })

  return result
}

export async function getAdClaimHistory(
  db: DB,
  characterId: string,
  date?: Date,
) {
  const targetDate = date ?? startOfToday()
  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)

  const claims = await db
    .select({
      id: rewardedAdClaims.id,
      rewardType: rewardedAdClaims.rewardType,
      rewardAmount: rewardedAdClaims.rewardAmount,
      adProvider: rewardedAdClaims.adProvider,
      createdAt: rewardedAdClaims.createdAt,
    })
    .from(rewardedAdClaims)
    .where(
      and(
        eq(rewardedAdClaims.characterId, characterId),
        gte(rewardedAdClaims.createdAt, targetDate),
        sql`${rewardedAdClaims.createdAt} < ${nextDay}`,
      ),
    )
    .orderBy(sql`${rewardedAdClaims.createdAt} DESC`)

  return { count: claims.length, claims }
}

export async function getTimeSinceLastAd(
  db: DB,
  characterId: string,
): Promise<number> {
  const [last] = await db
    .select({ createdAt: rewardedAdClaims.createdAt })
    .from(rewardedAdClaims)
    .where(eq(rewardedAdClaims.characterId, characterId))
    .orderBy(sql`${rewardedAdClaims.createdAt} DESC`)
    .limit(1)

  if (!last) return 0

  const elapsed = (Date.now() - last.createdAt.getTime()) / 1000
  return Math.max(0, Math.floor(elapsed))
}
