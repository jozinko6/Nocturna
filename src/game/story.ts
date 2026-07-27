import { STORY_CONFIG, type StoryChapter, type StoryMission } from '@/lib/config/story'
import { calculateXpForLevel } from './formulas'

export interface StoryProgress {
  campaignSlug: string
  currentChapter: number
  currentMission: number
  completedMissions: string[]
  decisions: Record<string, string>
  flags: Record<string, any>
}

export function canStartCampaign(level: number): boolean {
  return level >= STORY_CONFIG.campaign.minimumLevel
}

export function canUnlockChapter(
  progress: StoryProgress,
  chapterIndex: number,
  characterLevel: number,
): { allowed: boolean; reason?: string } {
  if (chapterIndex < 0 || chapterIndex >= STORY_CONFIG.chapters.length) {
    return { allowed: false, reason: 'Neplatný index kapitoly.' }
  }

  const chapter = STORY_CONFIG.chapters[chapterIndex]
  if (chapterIndex === 0) return { allowed: true }

  if (characterLevel < STORY_CONFIG.campaign.minimumLevel + chapterIndex * 5) {
    return { allowed: false, reason: `Potrebuješ úroveň ${STORY_CONFIG.campaign.minimumLevel + chapterIndex * 5}.` }
  }

  if (chapterIndex > 0) {
    const prevChapter = STORY_CONFIG.chapters[chapterIndex - 1]
    const allPrevComplete = prevChapter.missions.every(m =>
      progress.completedMissions.includes(m.slug)
    )
    if (!allPrevComplete) {
      return { allowed: false, reason: 'Predošlá kapitola nie je dokončená.' }
    }
  }

  return { allowed: true }
}

export function canStartMission(
  progress: StoryProgress,
  chapterIndex: number,
  missionIndex: number,
): { allowed: boolean; reason?: string } {
  if (chapterIndex < 0 || chapterIndex >= STORY_CONFIG.chapters.length) {
    return { allowed: false, reason: 'Neplatná kapitola.' }
  }

  const chapter = STORY_CONFIG.chapters[chapterIndex]
  if (missionIndex < 0 || missionIndex >= chapter.missions.length) {
    return { allowed: false, reason: 'Neplatná misia.' }
  }

  const mission = chapter.missions[missionIndex]

  if (missionIndex > 0) {
    const prevMission = chapter.missions[missionIndex - 1]
    if (!progress.completedMissions.includes(prevMission.slug)) {
      return { allowed: false, reason: 'Predošlá misia nie je dokončená.' }
    }
  }

  if (!mission.repeatable && progress.completedMissions.includes(mission.slug)) {
    return { allowed: false, reason: 'Misia už bola dokončená.' }
  }

  return { allowed: true }
}

export function completeMission(
  progress: StoryProgress,
  missionSlug: string,
): StoryProgress {
  if (progress.completedMissions.includes(missionSlug)) {
    return progress
  }

  return {
    ...progress,
    completedMissions: [...progress.completedMissions, missionSlug],
  }
}

export function makeDecision(
  progress: StoryProgress,
  decisionKey: string,
  optionKey: string,
): StoryProgress {
  return {
    ...progress,
    decisions: { ...progress.decisions, [decisionKey]: optionKey },
  }
}

export function getDecisionConsequence(
  decisionKey: string,
  selectedOption: string,
): { type: string; value: any }[] {
  const decision = STORY_CONFIG.decisions.find(d => d.key === decisionKey)
  if (!decision) return []

  const consequences: { type: string; value: any }[] = []

  if (decisionKey === 'cierny_les_lovit_alebo_chranit') {
    if (selectedOption === 'lovit') {
      consequences.push({ type: 'reputation', value: { org: 'strazcovia-cierneho-lesa', delta: -200 } })
      consequences.push({ type: 'reputation', value: { org: 'rada-mesta', delta: 100 } })
      consequences.push({ type: 'unlock_recipe', value: 'temna-sekera' })
    } else {
      consequences.push({ type: 'reputation', value: { org: 'strazcovia-cierneho-lesa', delta: 200 } })
      consequences.push({ type: 'reputation', value: { org: 'rada-mesta', delta: -100 } })
      consequences.push({ type: 'unlock_recipe', value: 'mesacna-prisada' })
    }
  }

  if (decisionKey === 'zrada_spojenca') {
    if (selectedOption === 'odpustit') {
      consequences.push({ type: 'reputation', value: { org: 'archivari-prvych', delta: 150 } })
      consequences.push({ type: 'set_flag', value: { key: 'ally_spared', val: true } })
    } else {
      consequences.push({ type: 'reputation', value: { org: 'archivari-prvych', delta: -150 } })
      consequences.push({ type: 'reward', value: { gold: 1000, crystals: 50 } })
      consequences.push({ type: 'set_flag', value: { key: 'ally_punished', val: true } })
    }
  }

  if (decisionKey === 'frakcne_volby') {
    if (selectedOption === 'sangvari') {
      consequences.push({ type: 'reputation', value: { org: 'rada-mesta', delta: 200 } })
      consequences.push({ type: 'set_flag', value: { key: 'final_alignment', val: 'sangvari' } })
    } else {
      consequences.push({ type: 'reputation', value: { org: 'mesacna-hliadka', delta: 200 } })
      consequences.push({ type: 'set_flag', value: { key: 'final_alignment', val: 'lunari' } })
    }
  }

  return consequences
}

export function calculateMissionReward(
  mission: StoryMission,
  characterLevel: number,
): { gold: number; xp: number; materials: { slug: string; qty: number }[]; items: string[] } {
  const baseXp = 50 + characterLevel * 10
  const baseGold = 100 + characterLevel * 15

  const reward = { gold: baseGold, xp: baseXp, materials: [] as { slug: string; qty: number }[], items: [] as string[] }

  if (mission.type === 'boss') {
    reward.gold = baseGold * 3
    reward.xp = baseXp * 3
    reward.materials.push({ slug: 'krvava-esencia', qty: 5 })
  }

  if (mission.type === 'combat') {
    reward.materials.push({ slug: 'temne-zelezo', qty: 2 })
  }

  if (mission.type === 'exploration') {
    reward.materials.push({ slug: 'cierne-drevo', qty: 3 })
  }

  return reward
}

export function getReputationTier(reputation: number): string {
  for (const tier of STORY_CONFIG.reputation.tiers.slice().reverse()) {
    if (reputation >= tier.minReputation) return tier.nameKey
  }
  return STORY_CONFIG.reputation.tiers[0].nameKey
}

export function getCompletionPercentage(progress: StoryProgress): number {
  let total = 0
  let completed = 0
  for (const chapter of STORY_CONFIG.chapters) {
    total += chapter.missions.length
    completed += chapter.missions.filter(m => progress.completedMissions.includes(m.slug)).length
  }
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

export function getMissionCount(): number {
  return STORY_CONFIG.chapters.reduce((sum, ch) => sum + ch.missions.length, 0)
}

export function getChapterMissionCount(chapterIndex: number): number {
  if (chapterIndex < 0 || chapterIndex >= STORY_CONFIG.chapters.length) return 0
  return STORY_CONFIG.chapters[chapterIndex].missions.length
}
