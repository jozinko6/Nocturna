import { Rng, randomInt } from './rng'
import { difficultyMultipliers, DifficultyModifier } from '@/lib/config/expeditions'

export interface ExpeditionReward {
  gold: number
  experience: number
  crystals: number
  itemDropChance: number
  itemDropId: string | null
}

export function calculateExpeditionReward(
  difficulty: DifficultyModifier,
  victory: boolean,
  rng: Rng,
  lootTable?: { itemId: string; dropChance: number }[],
): ExpeditionReward {
  const mult = difficultyMultipliers[difficulty]

  const baseGold = victory ? randomInt(rng, 30, 80) : randomInt(rng, 5, 15)
  const baseXp = victory ? randomInt(rng, 20, 60) : randomInt(rng, 5, 10)
  const baseCrystals = victory ? randomInt(rng, 0, 2) : 0

  const itemDropChance = victory ? 0.15 * mult.rewardMultiplier : 0.02
  let itemDropId: string | null = null

  if (lootTable && lootTable.length > 0 && rng() < itemDropChance) {
    for (const entry of lootTable) {
      if (rng() < entry.dropChance) {
        itemDropId = entry.itemId
        break
      }
    }
  }

  return {
    gold: Math.floor(baseGold * mult.rewardMultiplier),
    experience: Math.floor(baseXp * mult.xpMultiplier),
    crystals: Math.floor(baseCrystals * mult.rewardMultiplier),
    itemDropChance,
    itemDropId,
  }
}
