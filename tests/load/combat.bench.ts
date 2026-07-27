import { describe, it, expect } from 'vitest'
import { calculateCombatStats, resolveBattle } from '@/game/combat'
import { createMockCharacter, createMockEnemy } from '../setup'
import type { CombatStats, Character } from '@/lib/db/schema'

function createCombatCharacter(overrides: Partial<CombatStats> = {}): CombatStats {
  return {
    id: crypto.randomUUID(),
    name: 'Test',
    level: 10,
    maxHp: 200,
    attack: 25,
    defense: 15,
    speed: 18,
    criticalChance: 0.15,
    criticalDamage: 1.5,
    accuracy: 0.9,
    evasion: 0.1,
    lifesteal: 0,
    ...overrides,
  }
}

function createCombatEnemy(overrides: Partial<CombatStats> = {}): CombatStats {
  return {
    id: crypto.randomUUID(),
    name: 'Enemy',
    level: 10,
    maxHp: 180,
    attack: 22,
    defense: 12,
    speed: 16,
    criticalChance: 0.1,
    criticalDamage: 1.5,
    accuracy: 0.85,
    evasion: 0.08,
    lifesteal: 0,
    ...overrides,
  }
}

describe('Combat Engine Load Tests', () => {
  it('resolves 1000 battles within 2 seconds', () => {
    const start = Date.now()
    
    for (let i = 0; i < 1000; i++) {
      const hero = createCombatCharacter()
      const enemy = createCombatEnemy()
      resolveBattle(hero, enemy, `seed_${i}`)
    }
    
    const elapsed = Date.now() - start
    console.log(`1000 battles resolved in ${elapsed}ms`)
    expect(elapsed).toBeLessThan(2000)
  })

  it('resolves 100 dungeon encounters within 1 second', () => {
    const start = Date.now()
    
    for (let i = 0; i < 100; i++) {
      const hero = createCombatCharacter({ maxHp: 500, attack: 40, defense: 25 })
      const enemy = createCombatEnemy({ maxHp: 300, attack: 30, defense: 18 })
      const result = resolveBattle(hero, enemy, `dungeon_${i}`)
      
      expect(result).toHaveProperty('victory')
      expect(result).toHaveProperty('rounds')
      expect(result).toHaveProperty('damageDealt')
      expect(result).toHaveProperty('damageTaken')
      expect(result).toHaveProperty('goldEarned')
    }
    
    const elapsed = Date.now() - start
    console.log(`100 dungeon encounters resolved in ${elapsed}ms`)
    expect(elapsed).toBeLessThan(1000)
  })

  it('handles extreme stat differences without errors', () => {
    for (let i = 0; i < 100; i++) {
      const hero = createCombatCharacter({ attack: 100, defense: 100 })
      const enemy = createCombatEnemy({ attack: 1, defense: 1 })
      const result = resolveBattle(hero, enemy, `extreme_high_${i}`)
      expect(result.victory).toBe(true)
      
      const hero2 = createCombatCharacter({ attack: 1, defense: 1 })
      const enemy2 = createCombatEnemy({ attack: 100, defense: 100 })
      const result2 = resolveBattle(hero2, enemy2, `extreme_low_${i}`)
      expect(result2.victory).toBe(false)
    }
  })

  it('produces deterministic results for same seed', () => {
    const seed = 'deterministic_test_seed'
    const hero = createCombatCharacter()
    const enemy = createCombatEnemy()
    
    const r1 = resolveBattle(hero, enemy, seed)
    const r2 = resolveBattle(hero, enemy, seed)
    
    expect(r1.victory).toBe(r2.victory)
    expect(r1.rounds).toBe(r2.rounds)
    expect(r1.damageDealt).toBe(r2.damageDealt)
    expect(r1.damageTaken).toBe(r2.damageTaken)
    expect(r1.goldEarned).toBe(r2.goldEarned)
  })

  it('stats calculation performs 10000 calculations within 500ms', () => {
    const start = Date.now()
    
    for (let i = 0; i < 10000; i++) {
      const stats = createCombatCharacter()
      calculateCombatStats(stats)
    }
    
    const elapsed = Date.now() - start
    console.log(`10000 stat calculations in ${elapsed}ms`)
    expect(elapsed).toBeLessThan(500)
  })
})
