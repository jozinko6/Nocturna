import { describe, it, expect } from 'vitest'
import { findSuitableBots, BOT_OPPONENTS } from '../game/pvp'

describe('BOT_OPPONENTS', () => {
  it('has 6 bot opponents', () => {
    expect(BOT_OPPONENTS.length).toBe(6)
  })

  it('has unique IDs', () => {
    const ids = BOT_OPPONENTS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has ascending ratings', () => {
    const ratings = BOT_OPPONENTS.map((b) => b.rating)
    for (let i = 1; i < ratings.length; i++) {
      expect(ratings[i]).toBeGreaterThan(ratings[i - 1])
    }
  })

  it('each bot has all required stat fields', () => {
    const statKeys = ['strength', 'dexterity', 'endurance', 'perception', 'willpower', 'luck']
    for (const bot of BOT_OPPONENTS) {
      for (const key of statKeys) {
        expect(bot.stats).toHaveProperty(key)
        expect(typeof bot.stats[key as keyof typeof bot.stats]).toBe('number')
      }
    }
  })
})

describe('findSuitableBots', () => {
  it('returns 5 bots by default', () => {
    const bots = findSuitableBots(1000)
    expect(bots.length).toBe(5)
  })

  it('returns requested count', () => {
    const bots = findSuitableBots(1000, 3)
    expect(bots.length).toBe(3)
  })

  it('returns closest bots by rating', () => {
    const bots = findSuitableBots(1000)
    expect(bots[0].id).toBe('bot_wraith')
    expect(bots[0].rating).toBe(1000)
  })

  it('sorts by proximity to player rating', () => {
    const bots = findSuitableBots(1000)
    const distances = bots.map((b) => Math.abs(b.rating - 1000))
    for (let i = 1; i < distances.length; i++) {
      expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1])
    }
  })

  it('handles player rating below all bots', () => {
    const bots = findSuitableBots(100, 3)
    expect(bots[0].rating).toBe(900)
  })

  it('handles player rating above all bots', () => {
    const bots = findSuitableBots(5000, 3)
    expect(bots[0].rating).toBe(1800)
  })

  it('never returns more than available opponents', () => {
    const bots = findSuitableBots(1000, 100)
    expect(bots.length).toBe(BOT_OPPONENTS.length)
  })

  it('returns different opponents for different ratings', () => {
    const low = findSuitableBots(900, 2)
    const high = findSuitableBots(1800, 2)
    expect(low[0].id).not.toBe(high[0].id)
  })
})
