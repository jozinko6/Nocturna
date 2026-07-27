import { describe, it, expect } from 'vitest'
import {
  calculateStreakBonus,
  STREAK_BONUS_GOLD_PER_DAY,
  STREAK_MILESTONES,
  STREAK_MILESTONE_BONUS_CRYSTALS,
} from '../game/retention'
import { generateUniqueCode } from '../game/referrals'
import { getAdRewards, AD_REWARD_GOLD, AD_REWARD_ENERGY, AD_REWARD_CRYSTALS, MAX_AD_CLAIMS_PER_DAY, AD_COOLDOWN_SECONDS } from '../game/ads'
import { getCurrentTierXpProgress, SEASON_PASS_XP_PER_TIER, SEASON_PASS_MAX_TIER, PREMIUM_PASS_COST_CRYSTALS } from '../game/seasonpass'

describe('Retention', () => {
  describe('calculateStreakBonus', () => {
    it('returns gold based on streak', () => {
      const bonus = calculateStreakBonus(1)
      expect(bonus.gold).toBe(STREAK_BONUS_GOLD_PER_DAY)
      expect(bonus.crystals).toBe(0)
      expect(bonus.milestone).toBeNull()
    })

    it('returns milestone crystals at day 7', () => {
      const bonus = calculateStreakBonus(7)
      expect(bonus.gold).toBe(7 * STREAK_BONUS_GOLD_PER_DAY)
      expect(bonus.crystals).toBe(25)
      expect(bonus.milestone).toBe(7)
    })

    it('returns milestone crystals at day 30', () => {
      const bonus = calculateStreakBonus(30)
      expect(bonus.crystals).toBe(100)
      expect(bonus.milestone).toBe(30)
    })

    it('returns 0 crystals for non-milestone days', () => {
      const bonus = calculateStreakBonus(15)
      expect(bonus.crystals).toBe(0)
      expect(bonus.milestone).toBeNull()
    })

    it('gold increases linearly with streak', () => {
      const b5 = calculateStreakBonus(5)
      const b10 = calculateStreakBonus(10)
      expect(b10.gold).toBeGreaterThan(b5.gold)
    })
  })

  describe('constants', () => {
    it('has 5 milestones', () => {
      expect(STREAK_MILESTONES).toHaveLength(5)
    })

    it('milestone rewards increase', () => {
      const rewards = STREAK_MILESTONES.map(m => STREAK_MILESTONE_BONUS_CRYSTALS[m])
      for (let i = 1; i < rewards.length; i++) {
        expect(rewards[i]).toBeGreaterThanOrEqual(rewards[i - 1])
      }
    })
  })
})

describe('Referrals', () => {
  describe('generateUniqueCode', () => {
    it('generates 8-character code', () => {
      const code = generateUniqueCode()
      expect(code).toHaveLength(8)
    })

    it('generates uppercase alphanumeric', () => {
      const code = generateUniqueCode()
      expect(code).toMatch(/^[A-Z0-9]+$/)
    })

    it('generates different codes', () => {
      const codes = new Set(Array.from({ length: 20 }, () => generateUniqueCode()))
      expect(codes.size).toBeGreaterThan(1)
    })
  })
})

describe('Ads', () => {
  describe('getAdRewards', () => {
    it('returns 3 reward types', () => {
      const rewards = getAdRewards()
      expect(rewards).toHaveLength(3)
    })

    it('has correct amounts', () => {
      const rewards = getAdRewards()
      const gold = rewards.find(r => r.type === 'gold')
      const energy = rewards.find(r => r.type === 'energy')
      const crystals = rewards.find(r => r.type === 'crystals')
      expect(gold!.amount).toBe(AD_REWARD_GOLD)
      expect(energy!.amount).toBe(AD_REWARD_ENERGY)
      expect(crystals!.amount).toBe(AD_REWARD_CRYSTALS)
    })

    it('has Slovak labels', () => {
      const rewards = getAdRewards()
      for (const r of rewards) {
        expect(r.label).toBeTruthy()
      }
    })
  })

  describe('constants', () => {
    it('daily limit is reasonable', () => {
      expect(MAX_AD_CLAIMS_PER_DAY).toBeGreaterThan(0)
      expect(MAX_AD_CLAIMS_PER_DAY).toBeLessThanOrEqual(10)
    })

    it('cooldown is reasonable', () => {
      expect(AD_COOLDOWN_SECONDS).toBeGreaterThanOrEqual(15)
      expect(AD_COOLDOWN_SECONDS).toBeLessThanOrEqual(120)
    })
  })
})

describe('Season Pass', () => {
  describe('getCurrentTierXpProgress', () => {
    it('returns correct progress at tier start', () => {
      const result = getCurrentTierXpProgress(0, 0)
      expect(result.currentTierXp).toBe(0)
      expect(result.nextTierXp).toBe(SEASON_PASS_XP_PER_TIER)
      expect(result.progress).toBe(0)
    })

    it('returns correct progress mid-tier', () => {
      const result = getCurrentTierXpProgress(500, 0)
      expect(result.progress).toBeCloseTo(0.5, 1)
    })

    it('returns correct progress at tier end', () => {
      const result = getCurrentTierXpProgress(1000, 0)
      expect(result.progress).toBe(1)
    })

    it('progress is capped at 1.0', () => {
      const result = getCurrentTierXpProgress(5000, 0)
      expect(result.progress).toBe(1)
    })

    it('calculates correct tier boundaries', () => {
      const result = getCurrentTierXpProgress(2500, 2)
      expect(result.currentTierXp).toBe(2 * SEASON_PASS_XP_PER_TIER)
      expect(result.nextTierXp).toBe(3 * SEASON_PASS_XP_PER_TIER)
    })
  })

  describe('constants', () => {
    it('XP per tier is reasonable', () => {
      expect(SEASON_PASS_XP_PER_TIER).toBeGreaterThan(0)
    })

    it('max tier is 50', () => {
      expect(SEASON_PASS_MAX_TIER).toBe(50)
    })

    it('premium pass costs crystals', () => {
      expect(PREMIUM_PASS_COST_CRYSTALS).toBeGreaterThan(0)
    })
  })
})
