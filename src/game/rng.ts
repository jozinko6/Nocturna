export type Rng = () => number

export function createRng(seed: number): Rng {
  let s = seed | 0
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

export function randomInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

export function randomFloat(rng: Rng, min: number, max: number): number {
  return rng() * (max - min) + min
}

export function generateSeed(): number {
  return Math.floor(Math.random() * 2147483647)
}
