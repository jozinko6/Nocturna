import { describe, it, expect } from 'vitest'
import { generateRecommendations, type DashboardRecommendation } from '../game/dashboard'

function defaultState() {
  return {
    level: 10,
    gold: 2000,
    premiumCurrency: 50,
    experience: 5000,
    energy: 80,
    maxEnergy: 100,
    pvpRating: 1000,
    pvpWins: 5,
    pvpLosses: 3,
    stats: { strength: 10, dexterity: 10, endurance: 10, perception: 10, willpower: 10, luck: 10 },
    hideoutLevels: { main_hall: 1, training_chamber: 1, vault: 1, workshop: 1, guard_tower: 1 },
    completedQuestsToday: 0,
    totalQuestsToday: 3,
    hasClaimedDailyReward: false,
    daysSinceLastLogin: 1,
  }
}

describe('Dashboard Recommendations', () => {
  it('returns recommendations as array', () => {
    const recs = generateRecommendations(defaultState())
    expect(Array.isArray(recs)).toBe(true)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.length).toBeLessThanOrEqual(8)
  })

  it('recommends daily reward when not claimed', () => {
    const state = defaultState()
    state.hasClaimedDailyReward = false
    const recs = generateRecommendations(state)
    expect(recs.some(r => r.id === 'daily_reward')).toBe(true)
  })

  it('does not recommend daily reward when claimed', () => {
    const state = defaultState()
    state.hasClaimedDailyReward = true
    const recs = generateRecommendations(state)
    expect(recs.some(r => r.id === 'daily_reward')).toBe(false)
  })

  it('recommends expedition when energy is high', () => {
    const state = defaultState()
    state.energy = 50
    const recs = generateRecommendations(state)
    expect(recs.some(r => r.id === 'expedition')).toBe(true)
  })

  it('does not recommend expedition when energy is low', () => {
    const state = defaultState()
    state.energy = 5
    const recs = generateRecommendations(state)
    expect(recs.some(r => r.id === 'expedition')).toBe(false)
  })

  it('recommends training when stats are low relative to level', () => {
    const state = defaultState()
    state.level = 20
    state.stats = { strength: 5, dexterity: 5, endurance: 5, perception: 5, willpower: 5, luck: 5 }
    state.gold = 5000
    const recs = generateRecommendations(state)
    expect(recs.some(r => r.id === 'training')).toBe(true)
  })

  it('recommends PvP for players level 10+ with few matches', () => {
    const state = defaultState()
    state.level = 12
    state.pvpWins = 2
    state.pvpLosses = 1
    const recs = generateRecommendations(state)
    expect(recs.some(r => r.id === 'pvp_intro')).toBe(true)
  })

  it('does not recommend PvP for low-level players', () => {
    const state = defaultState()
    state.level = 5
    const recs = generateRecommendations(state)
    expect(recs.some(r => r.id === 'pvp_intro')).toBe(false)
  })

  it('returns recommendations sorted by priority', () => {
    const recs = generateRecommendations(defaultState())
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i].priority).toBeGreaterThanOrEqual(recs[i - 1].priority)
    }
  })

  it('all recommendations have required fields', () => {
    const recs = generateRecommendations(defaultState())
    for (const rec of recs) {
      expect(rec.id).toBeTruthy()
      expect(rec.title).toBeTruthy()
      expect(rec.description).toBeTruthy()
      expect(['action', 'tip', 'goal']).toContain(rec.type)
      expect(rec.priority).toBeGreaterThan(0)
    }
  })
})
