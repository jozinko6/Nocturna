/**
 * Nocturna — Leaderboard Snapshot Generator
 *
 * Periodically snapshots character metrics into the leaderboards table.
 * Should be called by a cron job or admin action.
 *
 * Board types: level, pvp_rating, gold, power
 * Period format: 'YYYY-MM-DD' for daily, 'YYYY-Www' for weekly
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import { characters, leaderboards } from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'

export type BoardType = 'level' | 'pvp_rating' | 'gold' | 'power'

/**
 * Compute a character's power score from stats and equipment.
 * Power = stat_total * 2 + level * 10
 */
function computePowerScore(
  stats: { strength: number; dexterity: number; endurance: number; perception: number; willpower: number; luck: number },
  level: number,
): number {
  const statTotal = stats.strength + stats.dexterity + stats.endurance + stats.perception + stats.willpower + stats.luck
  return statTotal * 2 + level * 10
}

/**
 * Get the current daily period string (UTC).
 */
export function getDailyPeriod(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get the current ISO week period string.
 */
export function getWeeklyPeriod(date: Date = new Date()): string {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

/**
 * Refresh leaderboard snapshots for all board types.
 * Deletes existing entries for the period and re-inserts fresh data.
 */
export async function refreshLeaderboards(db: ReturnType<typeof drizzle>) {
  const now = new Date()
  const dailyPeriod = getDailyPeriod(now)
  const weeklyPeriod = getWeeklyPeriod(now)

  // Fetch all characters with stats
  const allCharacters = await db
    .select({
      id: characters.id,
      level: characters.level,
      gold: characters.gold,
      pvpRating: characters.pvpRating,
      statStrength: sql<number>`COALESCE((SELECT strength FROM character_stats WHERE character_id = ${characters.id}), 5)`,
      statDexterity: sql<number>`COALESCE((SELECT dexterity FROM character_stats WHERE character_id = ${characters.id}), 5)`,
      statEndurance: sql<number>`COALESCE((SELECT endurance FROM character_stats WHERE character_id = ${characters.id}), 5)`,
      statPerception: sql<number>`COALESCE((SELECT perception FROM character_stats WHERE character_id = ${characters.id}), 5)`,
      statWillpower: sql<number>`COALESCE((SELECT willpower FROM character_stats WHERE character_id = ${characters.id}), 5)`,
      statLuck: sql<number>`COALESCE((SELECT luck FROM character_stats WHERE character_id = ${characters.id}), 5)`,
    })
    .from(characters)

  const boardConfigs: { type: BoardType; period: string; getValue: (c: typeof allCharacters[0]) => number }[] = [
    { type: 'level', period: dailyPeriod, getValue: c => c.level },
    { type: 'pvp_rating', period: dailyPeriod, getValue: c => c.pvpRating },
    { type: 'gold', period: dailyPeriod, getValue: c => c.gold },
    {
      type: 'power',
      period: dailyPeriod,
      getValue: c => computePowerScore(
        {
          strength: c.statStrength,
          dexterity: c.statDexterity,
          endurance: c.statEndurance,
          perception: c.statPerception,
          willpower: c.statWillpower,
          luck: c.statLuck,
        },
        c.level,
      ),
    },
  ]

  for (const config of boardConfigs) {
    // Delete existing entries for this period
    await db
      .delete(leaderboards)
      .where(and(
        eq(leaderboards.boardType, config.type),
        eq(leaderboards.period, config.period),
      ))

    // Insert new snapshots
    const entries = allCharacters.map(c => ({
      characterId: c.id,
      boardType: config.type,
      value: config.getValue(c),
      period: config.period,
    }))

    // Batch insert (up to 1000 at a time)
    const BATCH_SIZE = 500
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE)
      await db.insert(leaderboards).values(batch)
    }
  }

  return {
    dailyPeriod,
    weeklyPeriod,
    characterCount: allCharacters.length,
    boardsRefreshed: boardConfigs.length,
  }
}

/**
 * Get top N entries for a board type in a period.
 */
export async function getLeaderboardTop(
  db: ReturnType<typeof drizzle>,
  boardType: BoardType,
  period: string,
  limit: number = 100,
) {
  return db
    .select({
      rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${leaderboards.value} DESC)`,
      characterId: leaderboards.characterId,
      value: leaderboards.value,
    })
    .from(leaderboards)
    .where(and(
      eq(leaderboards.boardType, boardType),
      eq(leaderboards.period, period),
    ))
    .orderBy(desc(leaderboards.value))
    .limit(limit)
}

/**
 * Get a character's rank on a specific board.
 */
export async function getCharacterRank(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  boardType: BoardType,
  period: string,
) {
  const result = await db
    .select({
      rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${leaderboards.value} DESC)`,
      characterId: leaderboards.characterId,
      value: leaderboards.value,
    })
    .from(leaderboards)
    .where(and(
      eq(leaderboards.boardType, boardType),
      eq(leaderboards.period, period),
    ))
    .orderBy(desc(leaderboards.value))

  const entry = result.find(r => r.characterId === characterId)
  return entry ?? { rank: result.length + 1, value: 0 }
}
