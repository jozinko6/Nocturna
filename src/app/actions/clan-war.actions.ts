'use server'

import { getDb } from '@/lib/db/drizzle'
import { clanWars, clanWarParticipants, clanWarBattles, clans, clanMembers, characters } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { canDeclareWar, calculateBattleScore, calculateWarRewards, canAttack } from '@/game/clan-wars'

export async function getActiveClanWars(clanId: string) {
  const db = getDb()
  const wars = await db.select().from(clanWars)
    .where(and(
      eq(clanWars.status, 'active'),
    ))

  return { wars: wars.filter(w => w.attackerClanId === clanId || w.defenderClanId === clanId) }
}

export async function declareWar(
  attackerClanId: string,
  defenderClanId: string,
  warType: 'standard' | 'territory' | 'seasonal',
) {
  const db = getDb()

  const [attackerClan] = await db.select().from(clans).where(eq(clans.id, attackerClanId)).limit(1)
  const [defenderClan] = await db.select().from(clans).where(eq(clans.id, defenderClanId)).limit(1)

  if (!attackerClan || !defenderClan) return { error: 'Klan nenájdený.' }

  const attackerMembers = await db.select().from(clanMembers).where(eq(clanMembers.clanId, attackerClanId))
  const defenderMembers = await db.select().from(clanMembers).where(eq(clanMembers.clanId, defenderClanId))

  const check = canDeclareWar(
    attackerMembers.length,
    defenderMembers.length,
    attackerClan.level,
    defenderClan.level,
    attackerMembers.reduce((sum, m) => sum + m.contributionGold + m.contributionXp, 0),
    defenderMembers.reduce((sum, m) => sum + m.contributionGold + m.contributionXp, 0),
    false,
    false,
  )

  if (!check.allowed) return { error: check.reason }

  const [war] = await db.insert(clanWars).values({
    attackerClanId,
    defenderClanId,
    warType,
    status: 'proposed',
  }).returning()

  return { success: true, warId: war.id }
}

export async function acceptWar(warId: string, defenderClanId: string) {
  const db = getDb()
  const [war] = await db.select().from(clanWars)
    .where(and(eq(clanWars.id, warId), eq(clanWars.defenderClanId, defenderClanId)))
    .limit(1)

  if (!war) return { error: 'Vojna nenájdená.' }
  if (war.status !== 'proposed') return { error: 'Vojna nie je v stave návrhu.' }

  await db.update(clanWars).set({
    status: 'scheduled',
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 48 * 3600000),
  }).where(eq(clanWars.id, warId))

  return { success: true }
}

export async function reportBattleResult(
  clanWarId: string,
  attackerCharacterId: string,
  defenderCharacterId: string,
  result: 'win' | 'loss' | 'draw',
) {
  const db = getDb()

  const score = calculateBattleScore(true, 10, 10, result, 1)

  const [battle] = await db.insert(clanWarBattles).values({
    clanWarId,
    attackerCharacterId,
    defenderCharacterId,
    scoreAwarded: score,
    idempotencyKey: `battle_${clanWarId}_${attackerCharacterId}_${defenderCharacterId}_${Date.now()}`,
  }).returning()

  return { success: true, score, battleId: battle.id }
}

export async function getWarResults(warId: string) {
  const db = getDb()
  const [war] = await db.select().from(clanWars).where(eq(clanWars.id, warId)).limit(1)
  if (!war) return { error: 'Vojna nenájdená.' }

  const battles = await db.select().from(clanWarBattles).where(eq(clanWarBattles.clanWarId, warId))

  return { war, battles, winner: war.winnerClanId }
}
