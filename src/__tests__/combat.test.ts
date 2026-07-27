import { describe, it, expect } from 'vitest'
import { simulateBattle } from '../game/combat'
import { createRng } from '../game/rng'
import { CombatantSnapshot } from '../game/snapshot'
import { COMBAT_MAX_ROUNDS } from '../game/config'

function makeCombatant(overrides: Partial<CombatantSnapshot> & { name: string }): CombatantSnapshot {
  return {
    characterId: overrides.characterId ?? 'test',
    name: overrides.name,
    level: overrides.level ?? 5,
    currentHp: overrides.currentHp ?? 150,
    maxHp: overrides.maxHp ?? 150,
    stats: overrides.stats ?? {
      strength: 10,
      dexterity: 8,
      endurance: 7,
      perception: 6,
      willpower: 5,
      luck: 5,
    },
    equipment: overrides.equipment ?? {},
    minDamage: overrides.minDamage ?? 12,
    maxDamage: overrides.maxDamage ?? 20,
    blockChance: overrides.blockChance ?? 9,
    critChance: overrides.critChance ?? 8.9,
  }
}

describe('simulateBattle', () => {
  it('produces deterministic results with same seed', () => {
    const attacker = makeCombatant({ name: 'Hero' })
    const defender = makeCombatant({ name: 'Goblin', currentHp: 80, maxHp: 80, minDamage: 5, maxDamage: 8, blockChance: 6.5, critChance: 5.4 })

    const rng1 = createRng(777)
    const result1 = simulateBattle(attacker, defender, rng1)

    const rng2 = createRng(777)
    const result2 = simulateBattle(attacker, defender, rng2)

    expect(result1.winner).toBe(result2.winner)
    expect(result1.rounds.length).toBe(result2.rounds.length)
    expect(result1.totalAttackerDamage).toBe(result2.totalAttackerDamage)
    expect(result1.totalDefenderDamage).toBe(result2.totalDefenderDamage)
  })

  it('battle ends within COMBAT_MAX_ROUNDS', () => {
    const attacker = makeCombatant({ name: 'A' })
    const defender = makeCombatant({ name: 'D' })
    const rng = createRng(42)
    const result = simulateBattle(attacker, defender, rng)

    expect(result.rounds.length).toBeLessThanOrEqual(COMBAT_MAX_ROUNDS)
    expect(COMBAT_MAX_ROUNDS).toBe(10)
  })

  it('HP never goes below 0', () => {
    const rng = createRng(999)
    const attacker = makeCombatant({ name: 'A' })
    const defender = makeCombatant({ name: 'D' })
    const result = simulateBattle(attacker, defender, rng)

    for (const round of result.rounds) {
      expect(round.attackerHp).toBeGreaterThanOrEqual(0)
      expect(round.defenderHp).toBeGreaterThanOrEqual(0)
    }
  })

  it('winner is correctly determined', () => {
    const strong = makeCombatant({
      name: 'Strong',
      currentHp: 500,
      maxHp: 500,
      minDamage: 30,
      maxDamage: 40,
      blockChance: 20,
      critChance: 15,
    })
    const weak = makeCombatant({
      name: 'Weak',
      currentHp: 30,
      maxHp: 30,
      minDamage: 1,
      maxDamage: 3,
      blockChance: 0,
      critChance: 0,
    })

    const rng = createRng(42)
    const result = simulateBattle(strong, weak, rng)
    expect(result.winner).toBe('attacker')
  })

  it('critical hits deal more damage than base hits', () => {
    const attacker = makeCombatant({
      name: 'Critster',
      minDamage: 10,
      maxDamage: 10,
      critChance: 100,
    })
    const defender = makeCombatant({
      name: 'Target',
      currentHp: 500,
      maxHp: 500,
      minDamage: 0,
      maxDamage: 0,
      blockChance: 0,
      critChance: 0,
    })

    const critRng = createRng(42)
    const critResult = simulateBattle(attacker, defender, critRng)

    const noCritAttacker = { ...attacker, critChance: 0 }
    const noCritDefender = { ...defender }
    const noCritRng = createRng(42)
    const noCritResult = simulateBattle(noCritAttacker, noCritDefender, noCritRng)

    expect(critResult.totalAttackerDamage).toBeGreaterThan(noCritResult.totalAttackerDamage)
  })

  it('blocks reduce incoming damage', () => {
    const attacker = makeCombatant({
      name: 'Attacker',
      minDamage: 10,
      maxDamage: 10,
      critChance: 0,
      blockChance: 0,
    })
    const defenderBlocking = makeCombatant({
      name: 'Blocker',
      currentHp: 500,
      maxHp: 500,
      minDamage: 0,
      maxDamage: 0,
      blockChance: 100,
      critChance: 0,
    })

    const rng = createRng(42)
    const result = simulateBattle(attacker, defenderBlocking, rng)

    for (const round of result.rounds) {
      expect(round.defenderBlocked).toBe(true)
      expect(round.attackerDamage).toBe(6)
    }
  })

  it('total damage equals sum of round damages', () => {
    const attacker = makeCombatant({ name: 'A' })
    const defender = makeCombatant({ name: 'D' })
    const rng = createRng(123)
    const result = simulateBattle(attacker, defender, rng)

    const sumAttackerDmg = result.rounds.reduce((sum, r) => sum + r.attackerDamage, 0)
    const sumDefenderDmg = result.rounds.reduce((sum, r) => sum + r.defenderDamage, 0)
    expect(result.totalAttackerDamage).toBe(sumAttackerDmg)
    expect(result.totalDefenderDamage).toBe(sumDefenderDmg)
  })

  it('fight stops when someone dies', () => {
    const glassCannon = makeCombatant({
      name: 'Glass',
      currentHp: 1,
      maxHp: 1,
      minDamage: 50,
      maxDamage: 50,
    })
    const tank = makeCombatant({
      name: 'Tank',
      currentHp: 300,
      maxHp: 300,
      minDamage: 1,
      maxDamage: 1,
    })

    const rng = createRng(42)
    const result = simulateBattle(glassCannon, tank, rng)
    const lastRound = result.rounds[result.rounds.length - 1]

    const someoneDied = lastRound.attackerHp === 0 || lastRound.defenderHp === 0
    expect(someoneDied).toBe(true)
  })
})
