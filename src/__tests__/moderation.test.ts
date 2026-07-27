import { describe, it, expect } from 'vitest'
import {
  REPORT_REASONS,
  MODERATION_ACTION_TYPES,
} from '../game/moderation'

describe('Moderation', () => {
  describe('constants', () => {
    it('has 5 report reasons', () => {
      expect(REPORT_REASONS).toHaveLength(5)
      expect(REPORT_REASONS).toContain('cheating')
      expect(REPORT_REASONS).toContain('offensive_name')
      expect(REPORT_REASONS).toContain('harassment')
      expect(REPORT_REASONS).toContain('exploit')
      expect(REPORT_REASONS).toContain('other')
    })

    it('has 7 moderation action types', () => {
      expect(MODERATION_ACTION_TYPES).toHaveLength(7)
      expect(MODERATION_ACTION_TYPES).toContain('warning')
      expect(MODERATION_ACTION_TYPES).toContain('mute')
      expect(MODERATION_ACTION_TYPES).toContain('kick')
      expect(MODERATION_ACTION_TYPES).toContain('ban')
      expect(MODERATION_ACTION_TYPES).toContain('name_change')
      expect(MODERATION_ACTION_TYPES).toContain('stat_reset')
      expect(MODERATION_ACTION_TYPES).toContain('gold_revoke')
    })

    it('report reasons are unique', () => {
      const unique = new Set(REPORT_REASONS)
      expect(unique.size).toBe(REPORT_REASONS.length)
    })

    it('moderation action types are unique', () => {
      const unique = new Set(MODERATION_ACTION_TYPES)
      expect(unique.size).toBe(MODERATION_ACTION_TYPES.length)
    })
  })
})
