// ---------------------------------------------------------------------------
// Nocturna — Daily Quest Templates
//
// Daily quests are assigned at reset (02:00 CET) and refresh every 24 hours.
// Each quest has a type, a target count, and a reward.
// ---------------------------------------------------------------------------

export type DailyQuestType =
  | 'defeat_enemies'
  | 'collect_gold'
  | 'collect_crystals'
  | 'win_pvp'
  | 'complete_expedition'
  | 'upgrade_building'
  | 'train_attribute'
  | 'use_consumable'
  | 'forge_item'
  | 'reach_level'

export interface DailyQuestTemplate {
  id: string
  type: DailyQuestType
  /** Slovak name */
  name: string
  /** Slovak description with {target} placeholder */
  description: string
  /** How many times the action must be performed */
  targetCount: number
  /** Gold reward */
  rewardGold: number
  /** Crystal reward */
  rewardCrystals: number
  /** XP reward */
  rewardXp: number
  /** Weight in the random selection pool (higher = more likely) */
  weight: number
}

// ---------------------------------------------------------------------------
// Quest templates
// ---------------------------------------------------------------------------

export const dailyQuestTemplates: DailyQuestTemplate[] = [
  {
    id: 'dq_defeat_5',
    type: 'defeat_enemies',
    name: 'Nočný lovec',
    description: 'Poraz {target} nepriateľov v akejkoľvek oblasti.',
    targetCount: 5,
    rewardGold: 120,
    rewardCrystals: 0,
    rewardXp: 80,
    weight: 10,
  },
  {
    id: 'dq_defeat_10',
    type: 'defeat_enemies',
    name: 'Krvavá žatva',
    description: 'Poraz {target} nepriateľov v akejkoľvek oblasti.',
    targetCount: 10,
    rewardGold: 250,
    rewardCrystals: 3,
    rewardXp: 160,
    weight: 6,
  },
  {
    id: 'dq_collect_gold',
    type: 'collect_gold',
    name: 'Zhromaždi bohatstvo',
    description: 'Nazbieraj {target} zlatých z akéhokoľvek zdroja.',
    targetCount: 500,
    rewardGold: 0,
    rewardCrystals: 5,
    rewardXp: 60,
    weight: 8,
  },
  {
    id: 'dq_win_pvp',
    type: 'win_pvp',
    name: 'Pán arény',
    description: 'Vyhraj {target} PvP súboje.',
    targetCount: 3,
    rewardGold: 300,
    rewardCrystals: 8,
    rewardXp: 150,
    weight: 5,
  },
  {
    id: 'dq_expedition',
    type: 'complete_expedition',
    name: 'Prieskumník',
    description: 'Dokonči {target} výpravy.',
    targetCount: 2,
    rewardGold: 180,
    rewardCrystals: 4,
    rewardXp: 120,
    weight: 9,
  },
  {
    id: 'dq_upgrade',
    type: 'upgrade_building',
    name: 'Staviteľ',
    description: 'Vylepši budovu v úkryte {target} krát.',
    targetCount: 1,
    rewardGold: 150,
    rewardCrystals: 3,
    rewardXp: 90,
    weight: 7,
  },
  {
    id: 'dq_train',
    type: 'train_attribute',
    name: 'Cvičenie',
    description: 'Natrénuj akúkoľvek atribút {target} krát.',
    targetCount: 3,
    rewardGold: 100,
    rewardCrystals: 2,
    rewardXp: 70,
    weight: 9,
  },
  {
    id: 'dq_consume',
    type: 'use_consumable',
    name: 'Alchymista',
    description: 'Použi {target} spotrebných predmetov.',
    targetCount: 3,
    rewardGold: 80,
    rewardCrystals: 2,
    rewardXp: 60,
    weight: 8,
  },
  {
    id: 'dq_forge',
    type: 'forge_item',
    name: 'Kováč osudu',
    description: 'Vykuj {target} predmetov.',
    targetCount: 1,
    rewardGold: 130,
    rewardCrystals: 3,
    rewardXp: 90,
    weight: 6,
  },
  {
    id: 'dq_reach_level',
    type: 'reach_level',
    name: 'Vzostup',
    description: 'Dosiahni ďalšiu úroveň.',
    targetCount: 1,
    rewardGold: 250,
    rewardCrystals: 6,
    rewardXp: 200,
    weight: 4,
  },
]

/**
 * Get a daily quest template by ID.
 */
export function getDailyQuestById(id: string): DailyQuestTemplate | undefined {
  return dailyQuestTemplates.find((q) => q.id === id)
}

/**
 * Select N random daily quests for today's assignment.
 * Uses weighted random selection without replacement.
 */
export function selectDailyQuests(count: number): DailyQuestTemplate[] {
  const pool = [...dailyQuestTemplates]
  const selected: DailyQuestTemplate[] = []

  for (let i = 0; i < count && pool.length > 0; i++) {
    const totalWeight = pool.reduce((sum, q) => sum + q.weight, 0)
    let roll = Math.random() * totalWeight

    for (let j = 0; j < pool.length; j++) {
      roll -= pool[j].weight
      if (roll <= 0) {
        selected.push(pool[j])
        pool.splice(j, 1)
        break
      }
    }
  }

  return selected
}
