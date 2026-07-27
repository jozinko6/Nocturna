import { describe, it, expect } from 'vitest'
import { calculateExpeditionReward } from '../game/rewards'
import { createRng } from '../game/rng'
import { difficultyMultipliers, DifficultyModifier } from '../lib/config/expeditions'

describe('calculateExpeditionReward', () => {
  it('victory on easy gives reduced rewards', () => {
    const rng = createRng(555)
    const reward = calculateExpeditionReward('easy', true, rng)

    expect(reward.gold).toBeGreaterThan(0)
    expect(reward.experience).toBeGreaterThan(0)
    expect(reward.itemDropChance).toBeCloseTo(0.15 * 0.7, 4)
  })

  it('victory on normal gives base rewards', () => {
    const rng = createRng(555)
    const reward = calculateExpeditionReward('normal', true, rng)

    expect(reward.gold).toBeGreaterThan(0)
    expect(reward.experience).toBeGreaterThan(0)
    expect(reward.itemDropChance).toBeCloseTo(0.15, 4)
  })

  it('victory on hard gives multiplied rewards', () => {
    const rng = createRng(555)
    const reward = calculateExpeditionReward('hard', true, rng)

    expect(reward.gold).toBeGreaterThan(0)
    expect(reward.itemDropChance).toBeCloseTo(0.15 * 1.4, 4)
  })

  it('victory on deadly gives highest rewards', () => {
    const rng = createRng(555)
    const reward = calculateExpeditionReward('deadly', true, rng)

    expect(reward.gold).toBeGreaterThan(0)
    expect(reward.itemDropChance).toBeCloseTo(0.15 * 2.0, 4)
  })

  it('defeat gives reduced rewards compared to victory', () => {
    const defeatRng = createRng(555)
    const defeatReward = calculateExpeditionReward('normal', false, defeatRng)

    const victoryRng = createRng(555)
    const victoryReward = calculateExpeditionReward('normal', true, victoryRng)

    expect(defeatReward.gold).toBeLessThan(victoryReward.gold)
    expect(defeatReward.experience).toBeLessThan(victoryReward.experience)
    expect(defeatReward.crystals).toBe(0)
    expect(defeatReward.itemDropChance).toBeCloseTo(0.02, 4)
  })

  it('hard gives more gold than easy for same seed', () => {
    const rngEasy = createRng(555)
    const easyReward = calculateExpeditionReward('easy', true, rngEasy)

    const rngHard = createRng(555)
    const hardReward = calculateExpeditionReward('hard', true, rngHard)

    expect(hardReward.gold).toBeGreaterThanOrEqual(easyReward.gold)
  })

  it('deadly gives more XP than easy for same seed', () => {
    const rngEasy = createRng(555)
    const easyReward = calculateExpeditionReward('easy', true, rngEasy)

    const rngDeadly = createRng(555)
    const deadlyReward = calculateExpeditionReward('deadly', true, rngDeadly)

    expect(deadlyReward.experience).toBeGreaterThanOrEqual(easyReward.experience)
  })

  it('deterministic with same seed', () => {
    const rng1 = createRng(555)
    const r1 = calculateExpeditionReward('normal', true, rng1)

    const rng2 = createRng(555)
    const r2 = calculateExpeditionReward('normal', true, rng2)

    expect(r1.gold).toBe(r2.gold)
    expect(r1.experience).toBe(r2.experience)
    expect(r1.crystals).toBe(r2.crystals)
  })

  it('can drop items from loot table', () => {
    const lootTable = [{ itemId: 'test_sword', dropChance: 1.0 }]
    const rng = createRng(1)
    const reward = calculateExpeditionReward('deadly', true, rng, lootTable)

    expect(reward.itemDropId).toBe('test_sword')
  })

  it('no item drop when loot table is empty', () => {
    const rng = createRng(555)
    const reward = calculateExpeditionReward('deadly', true, rng, [])

    expect(reward.itemDropId).toBeNull()
  })

  it('no item drop when loot table is undefined', () => {
    const rng = createRng(555)
    const reward = calculateExpeditionReward('deadly', true, rng)

    expect(reward.itemDropId).toBeNull()
  })

  it('item drop respects chance threshold', () => {
    let dropped = 0
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed)
      const reward = calculateExpeditionReward('normal', true, rng, [
        { itemId: 'test', dropChance: 1.0 },
      ])
      if (reward.itemDropId) dropped++
    }

    const expectedChance = 0.15 * difficultyMultipliers.normal.rewardMultiplier
    const ratio = dropped / 100
    expect(ratio).toBeGreaterThan(expectedChance * 0.5)
    expect(ratio).toBeLessThan(Math.min(expectedChance * 2, 1))
  })

  it('always returns integer gold, experience, and crystals', () => {
    for (const diff of ['easy', 'normal', 'hard', 'deadly'] as DifficultyModifier[]) {
      const rng = createRng(42)
      const reward = calculateExpeditionReward(diff, true, rng)
      expect(Number.isInteger(reward.gold)).toBe(true)
      expect(Number.isInteger(reward.experience)).toBe(true)
      expect(Number.isInteger(reward.crystals)).toBe(true)
    }
  })
})
