import { describe, it, expect } from 'vitest'
import { calculateCurrentEnergy } from '../game/formulas'

describe('calculateCurrentEnergy', () => {
  it('returns current energy if lastUpdate is null', () => {
    expect(calculateCurrentEnergy(80, 100, null)).toBe(80)
  })

  it('returns current energy if just updated (no time passed)', () => {
    const now = new Date().toISOString()
    expect(calculateCurrentEnergy(80, 100, now)).toBe(80)
  })

  it('does not regen before the interval elapses', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(calculateCurrentEnergy(80, 100, fiveMinAgo, 1, 6)).toBe(80)
  })

  it('regens 1 energy after exactly 6 minutes', () => {
    const sixMinAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString()
    expect(calculateCurrentEnergy(80, 100, sixMinAgo, 1, 6)).toBe(81)
  })

  it('regens correctly after multiple intervals', () => {
    const twelveMinAgo = new Date(Date.now() - 12 * 60 * 1000).toISOString()
    expect(calculateCurrentEnergy(80, 100, twelveMinAgo, 1, 6)).toBe(82)
  })

  it('caps at max energy', () => {
    const twelveMinAgo = new Date(Date.now() - 12 * 60 * 1000).toISOString()
    expect(calculateCurrentEnergy(99, 100, twelveMinAgo, 1, 6)).toBe(100)
  })

  it('does not exceed max even with large time gaps', () => {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    expect(calculateCurrentEnergy(90, 100, hourAgo, 1, 6)).toBe(100)
  })

  it('respects custom regen rate', () => {
    const sixMinAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString()
    expect(calculateCurrentEnergy(50, 200, sixMinAgo, 3, 6)).toBe(53)
  })

  it('respects custom regen interval', () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    expect(calculateCurrentEnergy(50, 200, tenMinAgo, 1, 5)).toBe(52)
  })

  it('handles zero current energy', () => {
    const sixMinAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString()
    expect(calculateCurrentEnergy(0, 100, sixMinAgo, 1, 6)).toBe(1)
  })
})
