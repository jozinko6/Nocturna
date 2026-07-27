import { describe, it, expect } from 'vitest'
import { createRng, randomInt, randomFloat, generateSeed } from '../game/rng'

describe('createRng', () => {
  it('same seed produces identical sequence', () => {
    const rng1 = createRng(42)
    const rng2 = createRng(42)
    const seq1 = Array.from({ length: 20 }, () => rng1())
    const seq2 = Array.from({ length: 20 }, () => rng2())
    expect(seq1).toEqual(seq2)
  })

  it('different seeds produce different first values', () => {
    const rng1 = createRng(42)
    const rng2 = createRng(99)
    expect(rng1()).not.toBe(rng2())
  })

  it('output is always in [0, 1)', () => {
    const rng = createRng(123)
    for (let i = 0; i < 1000; i++) {
      const val = rng()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })

  it('handles seed 0', () => {
    const rng = createRng(0)
    const val = rng()
    expect(val).toBeGreaterThanOrEqual(0)
    expect(val).toBeLessThan(1)
  })

  it('handles negative seeds', () => {
    const rng = createRng(-500)
    const val = rng()
    expect(val).toBeGreaterThanOrEqual(0)
    expect(val).toBeLessThan(1)
  })

  it('produces values across the full range', () => {
    const rng = createRng(777)
    const values = Array.from({ length: 200 }, () => rng())
    expect(Math.min(...values)).toBeLessThan(0.1)
    expect(Math.max(...values)).toBeGreaterThan(0.9)
  })
})

describe('randomInt', () => {
  it('returns integers within [min, max]', () => {
    const rng = createRng(42)
    for (let i = 0; i < 200; i++) {
      const val = randomInt(rng, 5, 15)
      expect(val).toBeGreaterThanOrEqual(5)
      expect(val).toBeLessThanOrEqual(15)
      expect(Number.isInteger(val)).toBe(true)
    }
  })

  it('returns min when range is [min, min]', () => {
    const rng = createRng(42)
    expect(randomInt(rng, 7, 7)).toBe(7)
  })
})

describe('randomFloat', () => {
  it('returns floats within [min, max)', () => {
    const rng = createRng(42)
    for (let i = 0; i < 200; i++) {
      const val = randomFloat(rng, 2.5, 7.5)
      expect(val).toBeGreaterThanOrEqual(2.5)
      expect(val).toBeLessThan(7.5)
    }
  })
})

describe('generateSeed', () => {
  it('returns a positive integer', () => {
    const seed = generateSeed()
    expect(seed).toBeGreaterThan(0)
    expect(Number.isInteger(seed)).toBe(true)
  })

  it('produces different values on successive calls', () => {
    const seeds = Array.from({ length: 10 }, () => generateSeed())
    const unique = new Set(seeds)
    expect(unique.size).toBeGreaterThan(1)
  })
})
