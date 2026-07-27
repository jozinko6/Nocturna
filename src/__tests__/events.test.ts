import { describe, it, expect } from 'vitest'
import { getEventConfig } from '../game/events'

describe('Events', () => {
  describe('getEventConfig', () => {
    it('returns config for all event types', () => {
      const types = ['boss_rush', 'double_xp', 'double_gold', 'festival', 'invasion', 'challenge'] as const
      for (const type of types) {
        const config = getEventConfig(type)
        expect(config.name).toBeTruthy()
        expect(config.description).toBeTruthy()
        expect(config.defaultDurationHours).toBeGreaterThan(0)
        expect(config.rewards).toHaveProperty('gold')
        expect(config.rewards).toHaveProperty('crystals')
      }
    })

    it('has Slovak names', () => {
      const bossConfig = getEventConfig('boss_rush')
      expect(bossConfig.name).toContain('pr')

      const festivalConfig = getEventConfig('festival')
      expect(festivalConfig.name).toContain('Festival')
    })

    it('throws for invalid event type', () => {
      expect(() => getEventConfig('invalid' as any)).toThrow()
    })

    it('boss_rush has higher rewards than challenge', () => {
      const boss = getEventConfig('boss_rush')
      const challenge = getEventConfig('challenge')
      expect(boss.rewards.gold).toBeGreaterThan(challenge.rewards.gold)
    })

    it('double events have no direct rewards', () => {
      const doubleXp = getEventConfig('double_xp')
      const doubleGold = getEventConfig('double_gold')
      expect(doubleXp.rewards.gold).toBe(0)
      expect(doubleXp.rewards.crystals).toBe(0)
      expect(doubleGold.rewards.gold).toBe(0)
      expect(doubleGold.rewards.crystals).toBe(0)
    })
  })
})
