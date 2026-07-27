import { drizzle } from 'drizzle-orm/postgres-js'
import { eq, and, sql, asc } from 'drizzle-orm'
import {
  seasonPassTiers,
  seasonPassProgress,
  characters,
  currencyLedger,
  cosmeticItems,
} from '@/lib/db/schema'

export const SEASON_PASS_XP_PER_TIER = 1000
export const SEASON_PASS_MAX_TIER = 50
export const PREMIUM_PASS_COST_CRYSTALS = 500

type Db = ReturnType<typeof drizzle>

export async function createSeasonPassTiers(
  db: Db,
  seasonId: string,
  tierCount: number = 50,
) {
  const seasonCosmetics = await db
    .select()
    .from(cosmeticItems)
    .where(eq(cosmeticItems.seasonId, seasonId))

  const cosmeticTier25 = seasonCosmetics[0]?.id ?? null
  const cosmeticTier50 = seasonCosmetics[1]?.id ?? null

  const tiers = Array.from({ length: tierCount }, (_, i) => {
    const tier = i + 1
    const xp = tier * SEASON_PASS_XP_PER_TIER

    return {
      seasonId,
      tier,
      requiredXp: xp,
      freeRewardGold: 100 * tier,
      freeRewardCrystals: 5 * tier,
      freeRewardItemId: null as string | null,
      premiumRewardGold: 2 * 100 * tier,
      premiumRewardCrystals: 3 * 5 * tier,
      premiumRewardItemId: null as string | null,
      premiumRewardCosmeticId:
        tier === 25 ? cosmeticTier25 : tier === 50 ? cosmeticTier50 : null,
    }
  })

  await db.transaction(async (tx) => {
    for (const tier of tiers) {
      await tx.insert(seasonPassTiers).values(tier)
    }
  })

  return tiers
}

export async function addSeasonPassXp(
  db: Db,
  seasonId: string,
  characterId: string,
  xp: number,
) {
  if (xp <= 0) throw new Error('XP musí byť kladné číslo.')

  let result: { newTier: number; tierAdvanced: boolean } = { newTier: 0, tierAdvanced: false }

  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(seasonPassProgress)
      .where(
        and(
          eq(seasonPassProgress.seasonId, seasonId),
          eq(seasonPassProgress.characterId, characterId),
        ),
      )
      .limit(1)

    const newXp = (existing?.xp ?? 0) + xp
    const newTier = Math.min(
      Math.floor(newXp / SEASON_PASS_XP_PER_TIER),
      SEASON_PASS_MAX_TIER,
    )
    const tierAdvanced = newTier > (existing?.currentTier ?? 0)

    if (existing) {
      await tx
        .update(seasonPassProgress)
        .set({
          xp: newXp,
          currentTier: newTier,
          updatedAt: new Date(),
        })
        .where(eq(seasonPassProgress.id, existing.id))
    } else {
      await tx.insert(seasonPassProgress).values({
        seasonId,
        characterId,
        xp: newXp,
        currentTier: newTier,
      })
    }

    result = { newTier, tierAdvanced }
  })

  return result
}

export async function claimTierReward(
  db: Db,
  seasonId: string,
  characterId: string,
  tier: number,
  isPremium: boolean,
) {
  if (tier < 1 || tier > SEASON_PASS_MAX_TIER) {
    throw new Error('Neplatné číslo tieru.')
  }

  let reward: { gold: number; crystals: number; itemId: string | null } = {
    gold: 0,
    crystals: 0,
    itemId: null,
  }

  await db.transaction(async (tx) => {
    const [progress] = await tx
      .select()
      .from(seasonPassProgress)
      .where(
        and(
          eq(seasonPassProgress.seasonId, seasonId),
          eq(seasonPassProgress.characterId, characterId),
        ),
      )
      .limit(1)

    if (!progress) {
      throw new Error('Pre tento season pass nemáš žiadny progres.')
    }

    if (tier > progress.currentTier) {
      throw new Error(`Ešte si nedosiahol tier ${tier}.`)
    }

    const claimed: number[] = Array.isArray(progress.claimedTiers)
      ? (progress.claimedTiers as number[])
      : []

    const claimKey = isPremium ? -tier : tier

    if (claimed.includes(claimKey)) {
      throw new Error('Tento tier si už prevzal.')
    }

    if (isPremium && !progress.premiumUnlocked) {
      throw new Error('Premium pass nie je odomknutý.')
    }

    const [tierConfig] = await tx
      .select()
      .from(seasonPassTiers)
      .where(
        and(
          eq(seasonPassTiers.seasonId, seasonId),
          eq(seasonPassTiers.tier, tier),
        ),
      )
      .limit(1)

    if (!tierConfig) {
      throw new Error(`Tier ${tier} neexistuje pre túto sezónu.`)
    }

    const gold = isPremium ? tierConfig.premiumRewardGold : tierConfig.freeRewardGold
    const crystals = isPremium
      ? tierConfig.premiumRewardCrystals
      : tierConfig.freeRewardCrystals
    const itemId = isPremium
      ? tierConfig.premiumRewardCosmeticId ?? tierConfig.premiumRewardItemId
      : tierConfig.freeRewardItemId

    const [char] = await tx
      .select({ gold: characters.gold, crystals: characters.premiumCurrency })
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1)

    if (!char) throw new Error('Postava nebola nájdená.')

    const newGold = char.gold + gold
    const newCrystals = char.crystals + crystals

    await tx
      .update(characters)
      .set({
        gold: newGold,
        premiumCurrency: newCrystals,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))

    if (gold > 0) {
      await tx.insert(currencyLedger).values({
        characterId,
        currencyType: 'gold',
        balanceBefore: char.gold,
        changeAmount: gold,
        balanceAfter: newGold,
        reason: `Season pass: prevzatie tieru ${tier}${isPremium ? ' (premium)' : ''}`,
        sourceType: 'season_pass',
        sourceId: tierConfig.id,
        idempotencyKey: `sp-claim-${seasonId}-${characterId}-${tier}-${isPremium ? 'p' : 'f'}`,
      })
    }

    if (crystals > 0) {
      await tx.insert(currencyLedger).values({
        characterId,
        currencyType: 'premium_crystals',
        balanceBefore: char.crystals,
        changeAmount: crystals,
        balanceAfter: newCrystals,
        reason: `Season pass: prevzatie tieru ${tier}${isPremium ? ' (premium)' : ''}`,
        sourceType: 'season_pass',
        sourceId: tierConfig.id,
        idempotencyKey: `sp-claim-cryst-${seasonId}-${characterId}-${tier}-${isPremium ? 'p' : 'f'}`,
      })
    }

    const updatedClaimed = [...claimed, claimKey]

    await tx
      .update(seasonPassProgress)
      .set({ claimedTiers: updatedClaimed, updatedAt: new Date() })
      .where(eq(seasonPassProgress.id, progress.id))

    reward = { gold, crystals, itemId }
  })

  return reward
}

export async function unlockPremiumPass(
  db: Db,
  seasonId: string,
  characterId: string,
) {
  let unlocked = false

  await db.transaction(async (tx) => {
    const [progress] = await tx
      .select()
      .from(seasonPassProgress)
      .where(
        and(
          eq(seasonPassProgress.seasonId, seasonId),
          eq(seasonPassProgress.characterId, characterId),
        ),
      )
      .limit(1)

    if (!progress) {
      throw new Error('Pre tento season pass nemáš žiadny progres.')
    }

    if (progress.premiumUnlocked) {
      throw new Error('Premium pass je už odomknutý.')
    }

    const [char] = await tx
      .select({ crystals: characters.premiumCurrency })
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1)

    if (!char) throw new Error('Postava nebola nájdená.')

    if (char.crystals < PREMIUM_PASS_COST_CRYSTALS) {
      throw new Error(
        `Nedostatok kryštálov. Potrebuješ ${PREMIUM_PASS_COST_CRYSTALS}, máš ${char.crystals}.`,
      )
    }

    const newCrystals = char.crystals - PREMIUM_PASS_COST_CRYSTALS

    await tx
      .update(characters)
      .set({ premiumCurrency: newCrystals, updatedAt: new Date() })
      .where(eq(characters.id, characterId))

    await tx.insert(currencyLedger).values({
      characterId,
      currencyType: 'premium_crystals',
      balanceBefore: char.crystals,
      changeAmount: -PREMIUM_PASS_COST_CRYSTALS,
      balanceAfter: newCrystals,
      reason: `Season pass: odomknutie premium passu`,
      sourceType: 'season_pass_purchase',
      sourceId: progress.id,
      idempotencyKey: `sp-unlock-${seasonId}-${characterId}`,
    })

    await tx
      .update(seasonPassProgress)
      .set({ premiumUnlocked: true, updatedAt: new Date() })
      .where(eq(seasonPassProgress.id, progress.id))

    unlocked = true
  })

  return { unlocked }
}

export async function getSeasonPassProgress(
  db: Db,
  seasonId: string,
  characterId: string,
) {
  const [existing] = await db
    .select()
    .from(seasonPassProgress)
    .where(
      and(
        eq(seasonPassProgress.seasonId, seasonId),
        eq(seasonPassProgress.characterId, characterId),
      ),
    )
    .limit(1)

  if (existing) return existing

  const [created] = await db
    .insert(seasonPassProgress)
    .values({ seasonId, characterId })
    .returning()

  return created
}

export async function getSeasonPassTiers(db: Db, seasonId: string) {
  return db
    .select()
    .from(seasonPassTiers)
    .where(eq(seasonPassTiers.seasonId, seasonId))
    .orderBy(asc(seasonPassTiers.tier))
}

export function getCurrentTierXpProgress(
  characterXp: number,
  currentTier: number,
) {
  const currentTierXp = currentTier * SEASON_PASS_XP_PER_TIER
  const nextTierXp = (currentTier + 1) * SEASON_PASS_XP_PER_TIER
  const xpIntoTier = characterXp - currentTierXp
  const progress = Math.min(xpIntoTier / SEASON_PASS_XP_PER_TIER, 1)

  return { currentTierXp, nextTierXp, progress }
}
