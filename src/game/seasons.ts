import { drizzle } from 'drizzle-orm/postgres-js'
import { eq, and, sql, desc } from 'drizzle-orm'
import { seasons, seasonRewards, characters, leaderboards } from '@/lib/db/schema'
import type { BoardType } from './leaderboards'

export const SEASON_DURATION_DAYS = 30
export const SEASON_REWARD_TIERS = [1, 2, 3, 5, 10, 25, 50, 100] as const
export const BOARD_TYPES: BoardType[] = ['level', 'pvp_rating', 'gold', 'power']

interface SeasonRewardEntry {
  characterId: string
  value: number
  rank: number
}

interface ResetOptions {
  resetPvpRating: boolean
  resetPvpWins: boolean
  resetLeaderboards: boolean
}

function lookupReward(rank: number): { gold: number; crystals: number; title: string | null } {
  if (rank === 1) return { gold: 10000, crystals: 500, title: 'Season Champion' }
  if (rank === 2) return { gold: 5000, crystals: 250, title: null }
  if (rank === 3) return { gold: 2500, crystals: 100, title: null }
  if (rank === 5 || rank === 10) return { gold: 1000, crystals: 50, title: null }
  if (rank === 25 || rank === 50) return { gold: 500, crystals: 25, title: null }
  if (rank === 100) return { gold: 200, crystals: 0, title: null }
  return { gold: 0, crystals: 0, title: null }
}

export function generateSeasonRewards(
  seasonId: string,
  boardType: BoardType,
  entries: SeasonRewardEntry[],
) {
  return entries
    .filter((e) => SEASON_REWARD_TIERS.includes(e.rank as typeof SEASON_REWARD_TIERS[number]))
    .map((e) => {
      const reward = lookupReward(e.rank)
      return {
        seasonId,
        characterId: e.characterId,
        boardType,
        finalRank: e.rank,
        finalValue: e.value,
        rewardGold: reward.gold,
        rewardCrystals: reward.crystals,
        rewardTitle: reward.title,
        claimed: false,
      }
    })
}

export async function createSeason(
  db: ReturnType<typeof drizzle>,
  name: string,
  description: string,
  durationDays: number = SEASON_DURATION_DAYS,
) {
  const seasonNumber = await getNextSeasonNumber(db)
  const now = new Date()
  const endsAt = new Date(now.getTime() + durationDays * 86400000)

  const [season] = await db
    .insert(seasons)
    .values({
      name,
      description,
      seasonNumber,
      startedAt: now,
      endsAt,
      status: 'upcoming',
    })
    .returning()

  return season
}

export async function startSeason(db: ReturnType<typeof drizzle>, seasonId: string) {
  const [season] = await db
    .update(seasons)
    .set({ status: 'active' })
    .where(eq(seasons.id, seasonId))
    .returning()

  if (!season) throw new Error('Sezóna nebola nájdená.')
  return season
}

export async function endSeason(db: ReturnType<typeof drizzle>, seasonId: string) {
  const [season] = await db
    .update(seasons)
    .set({ status: 'ended' })
    .where(eq(seasons.id, seasonId))
    .returning()

  if (!season) throw new Error('Sezóna nebola nájdená.')

  const allRewards: typeof seasonRewards.$inferSelect[] = []

  await db.transaction(async (tx) => {
    for (const boardType of BOARD_TYPES) {
      const entries = await tx
        .select({
          characterId: leaderboards.characterId,
          value: leaderboards.value,
        })
        .from(leaderboards)
        .where(eq(leaderboards.boardType, boardType))
        .orderBy(desc(leaderboards.value))
        .limit(100)

      const ranked = entries.map((e, i) => ({
        characterId: e.characterId,
        value: e.value,
        rank: i + 1,
      }))

      const rewardRows = generateSeasonRewards(seasonId, boardType, ranked)

      if (rewardRows.length > 0) {
        const inserted = await tx
          .insert(seasonRewards)
          .values(rewardRows)
          .returning()
        allRewards.push(...inserted)
      }
    }
  })

  return allRewards
}

export async function claimSeasonReward(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  seasonId: string,
) {
  const [reward] = await db
    .select()
    .from(seasonRewards)
    .where(
      and(
        eq(seasonRewards.characterId, characterId),
        eq(seasonRewards.seasonId, seasonId),
        eq(seasonRewards.claimed, false),
      ),
    )
    .limit(1)

  if (!reward) throw new Error('Žiadna neprevzatá odmena pre túto sezónu.')

  await db.transaction(async (tx) => {
    await tx
      .update(seasonRewards)
      .set({ claimed: true })
      .where(eq(seasonRewards.id, reward.id))

    await tx
      .update(characters)
      .set({
        gold: sql`${characters.gold} + ${reward.rewardGold}`,
        premiumCurrency: sql`${characters.premiumCurrency} + ${reward.rewardCrystals}`,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
  })

  return { ...reward, claimed: true }
}

export async function getActiveSeason(db: ReturnType<typeof drizzle>) {
  const [season] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.status, 'active'))
    .limit(1)

  return season ?? null
}

export async function getSeasonLeaderboard(
  db: ReturnType<typeof drizzle>,
  seasonId: string,
  boardType: BoardType,
  limit: number = 100,
) {
  return db
    .select()
    .from(seasonRewards)
    .where(
      and(
        eq(seasonRewards.seasonId, seasonId),
        eq(seasonRewards.boardType, boardType),
      ),
    )
    .orderBy(seasonRewards.finalRank)
    .limit(limit)
}

export async function getCharacterSeasonResult(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  seasonId: string,
) {
  return db
    .select()
    .from(seasonRewards)
    .where(
      and(
        eq(seasonRewards.seasonId, seasonId),
        eq(seasonRewards.characterId, characterId),
      ),
    )
}

export async function resetSeasonData(
  db: ReturnType<typeof drizzle>,
  seasonId: string,
  options: ResetOptions,
) {
  const [season] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.id, seasonId))
    .limit(1)

  if (!season) throw new Error('Sezóna nebola nájdená.')

  await db.transaction(async (tx) => {
    if (options.resetPvpRating) {
      await tx
        .update(characters)
        .set({ pvpRating: 1000 })
    }

    if (options.resetPvpWins) {
      await tx
        .update(characters)
        .set({ pvpWins: 0, pvpLosses: 0 })
    }

    if (options.resetLeaderboards) {
      await tx
        .delete(leaderboards)
    }
  })

  return season
}

export async function getNextSeasonNumber(db: ReturnType<typeof drizzle>) {
  const result = await db
    .select({ max: sql<number>`COALESCE(MAX(${seasons.seasonNumber}), 0)` })
    .from(seasons)

  return (result[0]?.max ?? 0) + 1
}

export async function getSeasonHistory(db: ReturnType<typeof drizzle>, limit: number = 10) {
  const pastSeasons = await db
    .select()
    .from(seasons)
    .where(eq(seasons.status, 'ended'))
    .orderBy(desc(seasons.endsAt))
    .limit(limit)

  const stats = await Promise.all(
    pastSeasons.map(async (s) => {
      const [rewardCount] = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(seasonRewards)
        .where(eq(seasonRewards.seasonId, s.id))

      const [claimedCount] = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(seasonRewards)
        .where(
          and(
            eq(seasonRewards.seasonId, s.id),
            eq(seasonRewards.claimed, true),
          ),
        )

      return {
        ...s,
        totalParticipants: rewardCount?.count ?? 0,
        rewardsDistributed: claimedCount?.count ?? 0,
      }
    }),
  )

  return stats
}
