import { describe, it, expect } from 'vitest'
import {
  checkRateLimit,
  detectFraud,
  cleanupRateLimits,
  RATE_LIMITS,
} from '../game/economy-protection'

describe('Economy Protection', () => {
  describe('checkRateLimit', () => {
    it('allows first operation', () => {
      const result = checkRateLimit('char1', 'training')
      expect(result.allowed).toBe(true)
    })

    it('allows operations within limit', () => {
      const charId = 'char_ratelimit_1'
      for (let i = 0; i < 10; i++) {
        const result = checkRateLimit(charId, 'training')
        expect(result.allowed).toBe(true)
      }
    })

    it('blocks when limit exceeded', () => {
      const charId = 'char_ratelimit_block'
      const limit = RATE_LIMITS['training']
      if (!limit) return

      for (let i = 0; i < limit.maxOps + 1; i++) {
        checkRateLimit(charId, 'training')
      }
      const result = checkRateLimit(charId, 'training')
      expect(result.allowed).toBe(false)
      expect(result.retryAfterMs).toBeGreaterThan(0)
    })

    it('allows different operation types independently', () => {
      const charId = 'char_ratelimit_independent'
      const result1 = checkRateLimit(charId, 'training')
      const result2 = checkRateLimit(charId, 'shop_buy')
      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
    })

    it('allows unknown operation types', () => {
      const result = checkRateLimit('char1', 'unknown_op')
      expect(result.allowed).toBe(true)
    })
  })

  describe('detectFraud', () => {
    it('returns empty flags for normal activity', () => {
      const flags = detectFraud('char1', 'training', 100, 5000, [
        { changeAmount: -100, createdAt: new Date().toISOString(), sourceType: 'training' },
      ])
      expect(flags).toHaveLength(0)
    })

    it('detects rapid gold gain', () => {
      const recentEntries = Array.from({ length: 20 }, () => ({
        changeAmount: 800,
        createdAt: new Date().toISOString(),
        sourceType: 'expedition',
      }))
      const flags = detectFraud('char1', 'training', 100, 20000, recentEntries)
      expect(flags.some(f => f.type === 'rapid_gold_gain')).toBe(true)
    })

    it('detects negative balance', () => {
      const flags = detectFraud('char1', 'training', 100, -500, [])
      expect(flags.some(f => f.type === 'suspicious_pattern')).toBe(true)
    })
  })

  describe('cleanupRateLimits', () => {
    it('does not throw', () => {
      expect(() => cleanupRateLimits()).not.toThrow()
    })
  })
})
