import {
  TRAINING_BASE_COST,
  TRAINING_COST_EXPONENT,
  XP_BASE,
  XP_LINEAR,
  GOLD_PER_KILL_BASE,
  GOLD_PER_KILL_SCALE,
  STAT_NAMES,
  StatName,
} from './config'

export function trainingCost(currentLevel: number): number {
  return Math.floor(TRAINING_BASE_COST * Math.pow(currentLevel, TRAINING_COST_EXPONENT))
}

export function experienceForLevel(level: number): number {
  return Math.floor(XP_BASE * level * level + XP_LINEAR * level)
}

export function levelFromExperience(experience: number): number {
  let level = 1
  let totalXp = 0
  while (true) {
    const needed = experienceForLevel(level)
    if (totalXp + needed > experience) break
    totalXp += needed
    level++
  }
  return level
}

export function maxHp(endurance: number, level: number): number {
  return Math.floor(80 + endurance * 10 + level * 5)
}

export function attackPower(stats: Record<string, number>): number {
  return Math.floor(
    (stats.strength || 0) * 2 +
    (stats.dexterity || 0) * 1.5 +
    (stats.endurance || 0) * 1.0 +
    (stats.perception || 0) * 1.2 +
    (stats.luck || 0) * 0.8
  )
}

export function defensePower(stats: Record<string, number>): number {
  return Math.floor(
    (stats.endurance || 0) * 2.5 +
    (stats.dexterity || 0) * 0.5 +
    (stats.luck || 0) * 0.3
  )
}

export function goldFromKill(enemyLevel: number): number {
  return Math.floor(GOLD_PER_KILL_BASE + GOLD_PER_KILL_SCALE * enemyLevel)
}

export function calculateStatTotal(stats: Record<string, number>): number {
  return STAT_NAMES.reduce((sum, name) => sum + (stats[name] || 0), 0)
}

export function calculateCurrentEnergy(
  currentEnergy: number,
  maxEnergy: number,
  lastUpdate: string | null,
  regenRate: number = 1,
  regenIntervalMinutes: number = 6,
): number {
  if (!lastUpdate) return currentEnergy
  const now = Date.now()
  const lastTime = new Date(lastUpdate).getTime()
  const minutesPassed = (now - lastTime) / (1000 * 60)
  const regenTicks = Math.floor(minutesPassed / regenIntervalMinutes)
  const energyRegained = regenTicks * regenRate
  return Math.min(currentEnergy + energyRegained, maxEnergy)
}
