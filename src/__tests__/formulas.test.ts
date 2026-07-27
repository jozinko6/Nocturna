import { describe, it, expect } from 'vitest'
import {
  trainingCost,
  experienceForLevel,
  levelFromExperience,
  maxHp,
  attackPower,
  defensePower,
  goldFromKill,
  calculateStatTotal,
} from '../game/formulas'

describe('trainingCost', () => {
  it('returns base cost for level 1', () => {
    expect(trainingCost(1)).toBe(100)
  })

  it('scales superlinearly', () => {
    expect(trainingCost(2)).toBe(313)
    expect(trainingCost(3)).toBe(612)
    expect(trainingCost(5)).toBe(1423)
  })

  it('grows fast at higher levels', () => {
    expect(trainingCost(10)).toBe(4466)
    expect(trainingCost(15)).toBe(8720)
    expect(trainingCost(20)).toBe(14018)
  })

  it('never returns a fractional cost', () => {
    for (let level = 1; level <= 50; level++) {
      expect(trainingCost(level)).toBe(Math.floor(trainingCost(level)))
    }
  })
})

describe('experienceForLevel', () => {
  it('returns 150 XP for level 1', () => {
    expect(experienceForLevel(1)).toBe(150)
  })

  it('scales quadratically', () => {
    expect(experienceForLevel(2)).toBe(500)
    expect(experienceForLevel(3)).toBe(1050)
    expect(experienceForLevel(5)).toBe(2750)
    expect(experienceForLevel(10)).toBe(10500)
  })

  it('higher levels require much more XP', () => {
    expect(experienceForLevel(10)).toBeGreaterThan(experienceForLevel(5) * 3)
    expect(experienceForLevel(20)).toBeGreaterThan(experienceForLevel(10) * 3)
  })

  it('always returns an integer', () => {
    for (let level = 1; level <= 50; level++) {
      expect(experienceForLevel(level)).toBe(Math.floor(experienceForLevel(level)))
    }
  })
})

describe('levelFromExperience', () => {
  it('returns level 1 for 0 XP', () => {
    expect(levelFromExperience(0)).toBe(1)
  })

  it('stays level 1 until threshold', () => {
    expect(levelFromExperience(149)).toBe(1)
  })

  it('advances to level 2 at 150 XP', () => {
    expect(levelFromExperience(150)).toBe(2)
  })

  it('advances to level 3 at 650 XP', () => {
    expect(levelFromExperience(650)).toBe(3)
  })

  it('advances to level 4 at 1700 XP', () => {
    expect(levelFromExperience(1700)).toBe(4)
  })

  it('advances to level 5 at 3500 XP', () => {
    expect(levelFromExperience(3500)).toBe(5)
  })

  it('is the inverse of experienceForLevel at thresholds', () => {
    let cumulativeXp = 0
    for (let level = 1; level <= 10; level++) {
      cumulativeXp += experienceForLevel(level)
      expect(levelFromExperience(cumulativeXp)).toBe(level + 1)
      expect(levelFromExperience(cumulativeXp - 1)).toBe(level)
    }
  })

  it('never returns below 1', () => {
    expect(levelFromExperience(-100)).toBe(1)
  })
})

describe('maxHp', () => {
  it('calculates base HP correctly', () => {
    expect(maxHp(5, 1)).toBe(135)
  })

  it('scales with endurance', () => {
    expect(maxHp(1, 1)).toBe(95)
    expect(maxHp(3, 1)).toBe(115)
    expect(maxHp(10, 1)).toBe(185)
  })

  it('scales with level', () => {
    expect(maxHp(5, 5)).toBe(155)
    expect(maxHp(5, 10)).toBe(180)
  })

  it('always returns an integer', () => {
    for (let e = 1; e <= 30; e++) {
      expect(maxHp(e, 1)).toBe(Math.floor(maxHp(e, 1)))
    }
  })
})

describe('attackPower', () => {
  it('calculates from balanced stats', () => {
    expect(
      attackPower({ strength: 5, dexterity: 5, endurance: 5, perception: 5, luck: 5 }),
    ).toBe(32)
  })

  it('weights strength most heavily', () => {
    const base = attackPower({ strength: 5, dexterity: 5, endurance: 5, perception: 5, luck: 5 })
    const highStr = attackPower({ strength: 15, dexterity: 5, endurance: 5, perception: 5, luck: 5 })
    expect(highStr).toBeGreaterThan(base)
  })

  it('handles empty stats', () => {
    expect(attackPower({})).toBe(0)
  })

  it('handles partial stats', () => {
    expect(attackPower({ strength: 10 })).toBe(20)
    expect(attackPower({ luck: 10 })).toBe(8)
  })

  it('always returns an integer', () => {
    const stats = { strength: 7, dexterity: 3, endurance: 5, perception: 4, luck: 2 }
    expect(attackPower(stats)).toBe(Math.floor(attackPower(stats)))
  })
})

describe('defensePower', () => {
  it('calculates from balanced stats', () => {
    expect(
      defensePower({ strength: 5, dexterity: 5, endurance: 5, perception: 5, luck: 5 }),
    ).toBe(16)
  })

  it('weights endurance most heavily', () => {
    const base = defensePower({ endurance: 5, dexterity: 5, luck: 5 })
    const highEnd = defensePower({ endurance: 15, dexterity: 5, luck: 5 })
    expect(highEnd).toBeGreaterThan(base)
  })

  it('handles empty stats', () => {
    expect(defensePower({})).toBe(0)
  })

  it('always returns an integer', () => {
    const stats = { endurance: 7, dexterity: 3, luck: 4 }
    expect(defensePower(stats)).toBe(Math.floor(defensePower(stats)))
  })
})

describe('goldFromKill', () => {
  it('returns base gold for level 1 enemy', () => {
    expect(goldFromKill(1)).toBe(18)
  })

  it('scales linearly with enemy level', () => {
    expect(goldFromKill(5)).toBe(30)
    expect(goldFromKill(10)).toBe(45)
    expect(goldFromKill(20)).toBe(75)
  })

  it('returns integer', () => {
    for (let l = 1; l <= 50; l++) {
      expect(goldFromKill(l)).toBe(Math.floor(goldFromKill(l)))
    }
  })
})

describe('calculateStatTotal', () => {
  it('sums all 6 stats', () => {
    expect(
      calculateStatTotal({ strength: 5, dexterity: 5, endurance: 5, perception: 5, willpower: 5, luck: 5 }),
    ).toBe(30)
  })

  it('returns 0 for empty object', () => {
    expect(calculateStatTotal({})).toBe(0)
  })

  it('ignores unknown stat keys', () => {
    expect(calculateStatTotal({ strength: 10, unknown: 99 })).toBe(10)
  })

  it('handles missing stats gracefully', () => {
    expect(calculateStatTotal({ strength: 10, luck: 3 })).toBe(13)
  })
})
