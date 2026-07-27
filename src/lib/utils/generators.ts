import { v4 as uuidv4 } from 'uuid'

/** Generate a UUID v4 */
export function generateId(): string {
  return uuidv4()
}

/** Generate an idempotency key (UUID v4, no dashes) */
export function generateIdempotencyKey(): string {
  return uuidv4().replace(/-/g, '')
}

/**
 * Create a seeded PRNG using the mulberry32 algorithm.
 * Returns a function that produces pseudo-random floats in [0, 1).
 * Each call advances the internal state deterministically.
 */
export function seededRandom(seed: number): () => number {
  let state = seed | 0

  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Return a seeded random integer in [min, max] inclusive.
 */
export function seededInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

/**
 * Return a seeded random float in [min, max].
 */
export function seededFloat(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min
}
