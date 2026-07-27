import { describe, it, expect } from 'vitest'

function calculateTrainingCost(baseCost: number, currentStat: number): number {
  return Math.floor(baseCost * Math.pow(currentStat, 1.65))
}

function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.45))
}

function calculateStatTotal(character: {
  strength: number
  dexterity: number
  stamina: number
  accuracy: number
  dodge: number
  vitality: number
}): number {
  return character.strength + character.dexterity + character.stamina +
    character.accuracy + character.dodge + character.vitality
}

describe('Economy Load Tests', () => {
  it('calculates 10000 training costs within 500ms', () => {
    const start = Date.now()
    
    for (let i = 0; i < 10000; i++) {
      const baseCost = 50
      const currentStat = Math.floor(Math.random() * 100)
      const cost = calculateTrainingCost(baseCost, currentStat)
      expect(cost).toBeGreaterThanOrEqual(0)
    }
    
    const elapsed = Date.now() - start
    console.log(`10000 training cost calculations: ${elapsed}ms`)
    expect(elapsed).toBeLessThan(500)
  })

  it('calculates XP requirements for levels 1-100', () => {
    const start = Date.now()
    
    for (let i = 0; i < 1000; i++) {
      for (let level = 1; level <= 100; level++) {
        const xp = calculateXpForLevel(level)
        expect(xp).toBeGreaterThan(0)
      }
    }
    
    const elapsed = Date.now() - start
    console.log(`100k XP calculations: ${elapsed}ms`)
    expect(elapsed).toBeLessThan(1000)
  })

  it('validates stat totals for 10000 characters', () => {
    const start = Date.now()
    
    for (let i = 0; i < 10000; i++) {
      const character = {
        strength: Math.floor(Math.random() * 50),
        dexterity: Math.floor(Math.random() * 50),
        stamina: Math.floor(Math.random() * 50),
        accuracy: Math.floor(Math.random() * 50),
        dodge: Math.floor(Math.random() * 50),
        vitality: Math.floor(Math.random() * 50),
      }
      const total = calculateStatTotal(character)
      expect(total).toBeGreaterThanOrEqual(0)
      expect(total).toBeLessThanOrEqual(300)
    }
    
    const elapsed = Date.now() - start
    console.log(`10000 stat validations: ${elapsed}ms`)
    expect(elapsed).toBeLessThan(500)
  })
})
