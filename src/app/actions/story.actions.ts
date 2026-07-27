'use server'

import { getDb } from '@/lib/db/drizzle'
import { characterStoryProgress, characterStoryDecisions, characters } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { canStartCampaign, canUnlockChapter, canStartMission, completeMission, makeDecision, getDecisionConsequence, calculateMissionReward, getCompletionPercentage } from '@/game/story'
import { STORY_CONFIG } from '@/lib/config/story'

export async function getStoryProgress(characterId: string, campaignSlug: string) {
  const db = getDb()
  const [progress] = await db.select().from(characterStoryProgress)
    .where(and(eq(characterStoryProgress.characterId, characterId)))
    .limit(1)
  return progress || null
}

export async function startCampaign(characterId: string, campaignSlug: string) {
  const db = getDb()
  const [character] = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1)
  if (!character) return { error: 'Postava nenájdená.' }

  if (!canStartCampaign(character.level)) {
    return { error: 'Nedostatočná úroveň.' }
  }

  const existing = await db.select().from(characterStoryProgress)
    .where(and(eq(characterStoryProgress.characterId, characterId)))
    .limit(1)

  if (existing.length > 0) {
    return { error: 'Kampaň už bola spustená.' }
  }

  const [progress] = await db.insert(characterStoryProgress).values({
    characterId,
    campaignId: '00000000-0000-0000-0000-000000000000',
    state: 'in_progress',
  }).returning()

  return { success: true, progress }
}

export async function completeStoryMission(characterId: string, missionSlug: string) {
  const db = getDb()
  const [progress] = await db.select().from(characterStoryProgress)
    .where(eq(characterStoryProgress.characterId, characterId))
    .limit(1)

  if (!progress) return { error: 'Žiadny progres v príbehu.' }

  const completed = progress.completedMissions as string[]
  const updated = completeMission(
    { ...progress, completedMissions: completed } as any,
    missionSlug,
  )

  await db.update(characterStoryProgress).set({
    completedMissions: updated.completedMissions,
    updatedAt: new Date(),
  }).where(eq(characterStoryProgress.id, progress.id))

  const mission = STORY_CONFIG.chapters
    .flatMap(ch => ch.missions)
    .find(m => m.slug === missionSlug)

  const [character] = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1)
  const reward = mission ? calculateMissionReward(mission as any, character?.level || 1) : null

  return { success: true, reward, completionPercentage: getCompletionPercentage(updated as any) }
}

export async function makeStoryDecision(characterId: string, decisionKey: string, optionKey: string) {
  const db = getDb()
  const [progress] = await db.select().from(characterStoryProgress)
    .where(eq(characterStoryProgress.characterId, characterId))
    .limit(1)

  if (!progress) return { error: 'Žiadny progres v príbehu.' }

  const decisions = progress.decisions as Record<string, string>
  const updated = makeDecision({ ...progress, decisions: decisions } as any, decisionKey, optionKey)

  await db.update(characterStoryProgress).set({
    decisions: updated.decisions,
    updatedAt: new Date(),
  }).where(eq(characterStoryProgress.id, progress.id))

  const consequences = getDecisionConsequence(decisionKey, optionKey)

  return { success: true, consequences }
}

export async function getAvailableMissions(characterId: string) {
  const db = getDb()
  const [progress] = await db.select().from(characterStoryProgress)
    .where(eq(characterStoryProgress.characterId, characterId))
    .limit(1)

  if (!progress) return { missions: [] }

  const completed = progress.completedMissions as string[]
  const available = STORY_CONFIG.chapters.flatMap((ch, ci) =>
    ch.missions.map((m, mi) => ({
      chapterIndex: ci,
      missionIndex: mi,
      slug: m.slug,
      nameKey: m.nameKey,
      type: m.type,
      completed: completed.includes(m.slug),
      canStart: !completed.includes(m.slug),
    }))
  )

  return { missions: available, completionPercentage: getCompletionPercentage({ completedMissions: completed } as any) }
}
