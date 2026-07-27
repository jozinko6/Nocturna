export const STARTING_GOLD = 200
export const STARTING_CRYSTALS = 0
export const STARTING_STATS = 5

export const STAT_NAMES = ['strength', 'dexterity', 'endurance', 'perception', 'willpower', 'luck'] as const
export type StatName = typeof STAT_NAMES[number]

export const MAX_ATTRIBUTE = 50

export const TRAINING_BASE_COST = 100
export const TRAINING_COST_EXPONENT = 1.65

export const ENERGY_REGEN_RATE = 1
export const ENERGY_REGEN_INTERVAL_MINUTES = 6
export const BASE_MAX_ENERGY = 100

export const COMBAT_MAX_ROUNDS = 10
export const BLOCK_CHANCE = 15
export const BLOCK_REDUCTION = 0.4
export const CRIT_MULTIPLIER = 1.8

export const PVP_MIN_LEVEL = 10
export const PVP_COOLDOWN_SECONDS = 300
export const PVP_DAILY_LIMIT = 50
export const PVP_XP_REWARD = 200
export const PVP_GOLD_REWARD = 150

export const XP_BASE = 100
export const XP_LINEAR = 50

export const GOLD_PER_KILL_BASE = 15
export const GOLD_PER_KILL_SCALE = 3

export const EQUIPMENT_SLOT_TYPES = [
  'weapon', 'offhand', 'helmet', 'armor', 'gloves', 'boots', 'amulet', 'ring', 'relic',
] as const
export type SlotType = typeof EQUIPMENT_SLOT_TYPES[number]

export const DIFFICULTY_MAP: Record<string, string> = {
  safe: 'easy',
  uncertain: 'normal',
  dangerous: 'hard',
  lethal: 'deadly',
}
