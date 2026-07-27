import { describe, it, expect } from 'vitest'
import {
  validateClanName,
  validateClanTag,
  CLAN_NAME_MIN,
  CLAN_NAME_MAX,
  CLAN_TAG_MIN,
  CLAN_TAG_MAX,
  CLAN_CREATE_COST_GOLD,
  CLAN_CREATE_MIN_LEVEL,
  CLAN_XP_PER_GOLD,
  generateClanQuest,
} from '../game/clans'

describe('Clans', () => {
  describe('validateClanName', () => {
    it('accepts valid names', () => {
      expect(validateClanName('Temní Rytieri')).toBeNull()
      expect(validateClanName('ABC')).toBeNull()
      expect(validateClanName('Clan 123')).toBeNull()
    })

    it('rejects names too short', () => {
      const err = validateClanName('AB')
      expect(err).toContain(`${CLAN_NAME_MIN}`)
    })

    it('rejects names too long', () => {
      const err = validateClanName('A'.repeat(CLAN_NAME_MAX + 1))
      expect(err).toContain(`${CLAN_NAME_MAX}`)
    })

    it('rejects empty names', () => {
      expect(validateClanName('')).not.toBeNull()
    })

    it('rejects names with special characters', () => {
      expect(validateClanName('Clan@#$')).not.toBeNull()
      expect(validateClanName('Test!')).not.toBeNull()
      expect(validateClanName('Name-123')).not.toBeNull()
    })
  })

  describe('validateClanTag', () => {
    it('accepts valid tags', () => {
      expect(validateClanTag('TR')).toBeNull()
      expect(validateClanTag('DARK')).toBeNull()
      expect(validateClanTag('X1')).toBeNull()
    })

    it('rejects tags too short', () => {
      expect(validateClanTag('A')).toContain(`${CLAN_TAG_MIN}`)
    })

    it('rejects tags too long', () => {
      expect(validateClanTag('A'.repeat(CLAN_TAG_MAX + 1))).toContain(`${CLAN_TAG_MAX}`)
    })
  })

  describe('generateClanQuest', () => {
    it('generates quest with correct structure', () => {
      const quest = generateClanQuest('collect_gold', 1)
      expect(quest).toHaveProperty('type')
      expect(quest).toHaveProperty('title')
      expect(quest).toHaveProperty('description')
      expect(quest).toHaveProperty('targetCount')
      expect(quest).toHaveProperty('rewardGold')
      expect(quest).toHaveProperty('rewardXp')
      expect(quest).toHaveProperty('rewardClanXp')
      expect(quest!.targetCount).toBeGreaterThan(0)
      expect(quest!.rewardGold).toBeGreaterThan(0)
    })

    it('scales targets with clan level', () => {
      const questLvl1 = generateClanQuest('collect_gold', 1)
      const questLvl5 = generateClanQuest('collect_gold', 5)
      expect(questLvl5!.targetCount).toBeGreaterThan(questLvl1!.targetCount)
    })

    it('generates different quest types', () => {
      const types = ['collect_gold', 'collect_xp', 'pvp_wins', 'expeditions', 'training_sessions'] as const
      for (const type of types) {
        const quest = generateClanQuest(type, 1)
        expect(quest!.type).toBe(type)
        expect(quest!.title).toBeTruthy()
        expect(quest!.description).toBeTruthy()
      }
    })
  })

  describe('constants', () => {
    it('has reasonable defaults', () => {
      expect(CLAN_CREATE_COST_GOLD).toBeGreaterThan(0)
      expect(CLAN_CREATE_MIN_LEVEL).toBeGreaterThan(0)
      expect(CLAN_XP_PER_GOLD).toBeGreaterThan(0)
      expect(CLAN_NAME_MIN).toBeGreaterThan(0)
      expect(CLAN_NAME_MAX).toBeGreaterThan(CLAN_NAME_MIN)
      expect(CLAN_TAG_MIN).toBeGreaterThan(0)
      expect(CLAN_TAG_MAX).toBeGreaterThan(CLAN_TAG_MIN)
    })
  })
})
