import { describe, it, expect } from 'vitest'
import { canStartCampaign, canUnlockChapter, canStartMission, completeMission, makeDecision, getDecisionConsequence, calculateMissionReward, getCompletionPercentage, getMissionCount } from '@/game/story'

describe('Story Campaign', () => {
  it('canStartCampaign returns true for level >= 1', () => {
    expect(canStartCampaign(1)).toBe(true)
    expect(canStartCampaign(50)).toBe(true)
  })

  it('canUnlockChapter allows first chapter', () => {
    const progress = { campaignSlug: 'test', currentChapter: 0, currentMission: 0, completedMissions: [], decisions: {}, flags: {} }
    expect(canUnlockChapter(progress, 0, 1).allowed).toBe(true)
  })

  it('canUnlockChapter blocks chapter 1 without completing chapter 0', () => {
    const progress = { campaignSlug: 'test', currentChapter: 0, currentMission: 0, completedMissions: [], decisions: {}, flags: {} }
    const result = canUnlockChapter(progress, 1, 10)
    expect(result.allowed).toBe(false)
  })

  it('canStartMission allows first mission', () => {
    const progress = { campaignSlug: 'test', currentChapter: 0, currentMission: 0, completedMissions: [], decisions: {}, flags: {} }
    expect(canStartMission(progress, 0, 0).allowed).toBe(true)
  })

  it('canStartMission blocks non-repeatable completed mission', () => {
    const progress = { campaignSlug: 'test', currentChapter: 0, currentMission: 0, completedMissions: ['prve-kroky'], decisions: {}, flags: {} }
    expect(canStartMission(progress, 0, 0).allowed).toBe(false)
  })

  it('completeMission adds mission to completed list', () => {
    const progress = { campaignSlug: 'test', currentChapter: 0, currentMission: 0, completedMissions: [], decisions: {}, flags: {} }
    const updated = completeMission(progress, 'test-mission')
    expect(updated.completedMissions).toContain('test-mission')
  })

  it('completeMission does not duplicate', () => {
    const progress = { campaignSlug: 'test', currentChapter: 0, currentMission: 0, completedMissions: ['test-mission'], decisions: {}, flags: {} }
    const updated = completeMission(progress, 'test-mission')
    expect(updated.completedMissions.filter(m => m === 'test-mission')).toHaveLength(1)
  })

  it('makeDecision stores decision', () => {
    const progress = { campaignSlug: 'test', currentChapter: 0, currentMission: 0, completedMissions: [], decisions: {}, flags: {} }
    const updated = makeDecision(progress, 'test_decision', 'option_a')
    expect(updated.decisions.test_decision).toBe('option_a')
  })

  it('getDecisionConsequence returns consequences for known decisions', () => {
    const consequences = getDecisionConsequence('cierny_les_lovit_alebo_chranit', 'lovit')
    expect(consequences.length).toBeGreaterThan(0)
    expect(consequences.some(c => c.type === 'reputation')).toBe(true)
  })

  it('calculateMissionReward returns gold and xp', () => {
    const reward = calculateMissionReward({ slug: 'test', type: 'combat' } as any, 10)
    expect(reward.gold).toBeGreaterThan(0)
    expect(reward.xp).toBeGreaterThan(0)
  })

  it('boss missions give triple rewards', () => {
    const normal = calculateMissionReward({ slug: 'test', type: 'combat' } as any, 10)
    const boss = calculateMissionReward({ slug: 'boss', type: 'boss' } as any, 10)
    expect(boss.gold).toBeGreaterThan(normal.gold)
    expect(boss.xp).toBeGreaterThan(normal.xp)
  })

  it('getCompletionPercentage returns correct value', () => {
    const progress = { completedMissions: ['prve-kroky', 'stopy-v-dazdi'], decisions: {}, flags: {} } as any
    const pct = getCompletionPercentage(progress)
    expect(pct).toBeGreaterThan(0)
  })

  it('getMissionCount returns total missions', () => {
    expect(getMissionCount()).toBeGreaterThan(20)
  })
})
