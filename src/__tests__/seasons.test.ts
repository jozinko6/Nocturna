import { describe, it, expect } from 'vitest'
import { generateSeasonRewards, SEASON_DURATION_DAYS, SEASON_REWARD_TIERS, BOARD_TYPES } from '../game/seasons'

describe('Seasons', () => {
  describe('generateSeasonRewards', () => {
    it('generates reward rows for tier ranks', () => {
      const entries = [
        { characterId: 'c1', value: 100, rank: 1 },
        { characterId: 'c2', value: 90, rank: 2 },
        { characterId: 'c3', value: 80, rank: 3 },
        { characterId: 'c4', value: 50, rank: 5 },
        { characterId: 'c5', value: 40, rank: 10 },
        { characterId: 'c6', value: 20, rank: 25 },
        { characterId: 'c7', value: 15, rank: 50 },
        { characterId: 'c8', value: 10, rank: 100 },
      ]
      const rewards = generateSeasonRewards('s1', 'level', entries)
      expect(rewards).toHaveLength(8)
    })

    it('gives best rewards to rank 1', () => {
      const rewards = generateSeasonRewards('s1', 'level', [
        { characterId: 'c1', value: 100, rank: 1 },
      ])
      expect(rewards[0].rewardGold).toBe(10000)
      expect(rewards[0].rewardCrystals).toBe(500)
      expect(rewards[0].rewardTitle).toBe('Season Champion')
    })

    it('gives reduced rewards to lower ranks', () => {
      const r1 = generateSeasonRewards('s1', 'level', [{ characterId: 'c1', value: 100, rank: 1 }])
      const r100 = generateSeasonRewards('s1', 'level', [{ characterId: 'c1', value: 10, rank: 100 }])
      expect(r1[0].rewardGold).toBeGreaterThan(r100[0].rewardGold)
    })

    it('filters out non-tier ranks', () => {
      const entries = [
        { characterId: 'c1', value: 50, rank: 4 },
        { characterId: 'c2', value: 40, rank: 7 },
        { characterId: 'c3', value: 30, rank: 99 },
      ]
      const rewards = generateSeasonRewards('s1', 'level', entries)
      expect(rewards).toHaveLength(0)
    })

    it('sets correct seasonId and boardType', () => {
      const rewards = generateSeasonRewards('s42', 'pvp_rating', [
        { characterId: 'c1', value: 100, rank: 1 },
      ])
      expect(rewards[0].seasonId).toBe('s42')
      expect(rewards[0].boardType).toBe('pvp_rating')
    })

    it('returns empty for empty entries', () => {
      expect(generateSeasonRewards('s1', 'level', [])).toHaveLength(0)
    })
  })

  describe('constants', () => {
    it('has 30 day season duration', () => {
      expect(SEASON_DURATION_DAYS).toBe(30)
    })

    it('has correct reward tiers', () => {
      expect(SEASON_REWARD_TIERS).toContain(1)
      expect(SEASON_REWARD_TIERS).toContain(100)
      expect(SEASON_REWARD_TIERS).toHaveLength(8)
    })

    it('has 4 board types', () => {
      expect(BOARD_TYPES).toHaveLength(4)
      expect(BOARD_TYPES).toContain('level')
      expect(BOARD_TYPES).toContain('pvp_rating')
      expect(BOARD_TYPES).toContain('gold')
      expect(BOARD_TYPES).toContain('power')
    })
  })
})
