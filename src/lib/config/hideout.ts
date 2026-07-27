// ---------------------------------------------------------------------------
// Nocturna — Hideout Building Configuration
//
// 5 buildings, each with 5 levels. Buildings provide passive bonuses.
// Build time scales exponentially with level.
// ---------------------------------------------------------------------------

export interface BuildingLevel {
  level: number
  /** Gold cost to upgrade to this level */
  goldCost: number
  /** Build time in seconds */
  buildTimeSeconds: number
  /** Bonus description (Slovak) */
  bonusDescription: string
  /** Numeric bonus values used by the game engine */
  bonuses: Partial<{
    maxEnergy: number
    energyRegenReduction: number // percentage reduction in regen interval
    trainingCostReduction: number // percentage
    storageCapacity: number
    criticalChance: number
    defensePower: number
    goldMultiplier: number
    xpMultiplier: number
  }>
}

export interface Building {
  id: string
  name: string
  /** Slovak description */
  description: string
  /** Slovak flavour text */
  lore: string
  /** Icon key for the UI */
  icon: string
  /** Maximum level */
  maxLevel: number
  /** Levels array (index = level - 1) */
  levels: BuildingLevel[]
}

// ---------------------------------------------------------------------------
// Buildings
// ---------------------------------------------------------------------------

export const buildings: Building[] = [
  {
    id: 'b_main_hall',
    name: 'Hlavná sieň',
    description: 'Srdce tvojho úkrytu. Vylepšenie odomkne ďalšie budovy a zvyšuje kapacitu.',
    lore: 'Tu sa rodia plány. Tu sa rodia legendy.',
    icon: 'castle',
    maxLevel: 5,
    levels: [
      { level: 1, goldCost: 0, buildTimeSeconds: 0, bonusDescription: 'Základná sieň', bonuses: {} },
      { level: 2, goldCost: 500, buildTimeSeconds: 3600, bonusDescription: '+10 miest v úkryte', bonuses: { storageCapacity: 10 } },
      { level: 3, goldCost: 1500, buildTimeSeconds: 7200, bonusDescription: '+5% XP zo všetkých zdrojov', bonuses: { xpMultiplier: 0.05 } },
      { level: 4, goldCost: 4000, buildTimeSeconds: 14400, bonusDescription: '+20 miest v úkryte', bonuses: { storageCapacity: 20 } },
      { level: 5, goldCost: 10000, buildTimeSeconds: 28800, bonusDescription: '+10% XP, +5% zlata', bonuses: { xpMultiplier: 0.10, goldMultiplier: 0.05 } },
    ],
  },
  {
    id: 'b_training',
    name: 'Tréningová komnata',
    description: 'Komnata, kde sa zdokonaľuješ v boji. Znižuje náklady na tréning.',
    lore: 'Pot a krv sú cena za moc.',
    icon: 'swords',
    maxLevel: 5,
    levels: [
      { level: 1, goldCost: 0, buildTimeSeconds: 0, bonusDescription: 'Základná komnata', bonuses: {} },
      { level: 2, goldCost: 800, buildTimeSeconds: 5400, bonusDescription: '-5% nákladov na tréning', bonuses: { trainingCostReduction: 0.05 } },
      { level: 3, goldCost: 2200, buildTimeSeconds: 10800, bonusDescription: '-10% nákladov na tréning', bonuses: { trainingCostReduction: 0.10 } },
      { level: 4, goldCost: 5500, buildTimeSeconds: 21600, bonusDescription: '-15% nákladov na tréning', bonuses: { trainingCostReduction: 0.15 } },
      { level: 5, goldCost: 13000, buildTimeSeconds: 43200, bonusDescription: '-20% nákladov, +2% krit', bonuses: { trainingCostReduction: 0.20, criticalChance: 2 } },
    ],
  },
  {
    id: 'b_vault',
    name: 'Trezor',
    description: 'Bezpečné miesto na ukladanie zlatých a kryštálov.',
    lore: 'Bohatstvo ukryté v tme prežije každú búrku.',
    icon: 'lock',
    maxLevel: 5,
    levels: [
      { level: 1, goldCost: 0, buildTimeSeconds: 0, bonusDescription: 'Základný trezor', bonuses: { storageCapacity: 5 } },
      { level: 2, goldCost: 600, buildTimeSeconds: 3600, bonusDescription: '+5% zlata z výprav', bonuses: { goldMultiplier: 0.05 } },
      { level: 3, goldCost: 1800, buildTimeSeconds: 7200, bonusDescription: '+10% zlata z výprav', bonuses: { goldMultiplier: 0.10 } },
      { level: 4, goldCost: 4500, buildTimeSeconds: 14400, bonusDescription: '+15% zlata z výprav', bonuses: { goldMultiplier: 0.15 } },
      { level: 5, goldCost: 11000, buildTimeSeconds: 28800, bonusDescription: '+25% zlata, +50 miest', bonuses: { goldMultiplier: 0.25, storageCapacity: 50 } },
    ],
  },
  {
    id: 'b_forge',
    name: 'Dielňa',
    description: 'Kováčska dielňa, kde vyrábaš a vylepšuješ predmety.',
    lore: 'Oheň a kov. Základ všetkého.',
    icon: 'anvil',
    maxLevel: 5,
    levels: [
      { level: 1, goldCost: 0, buildTimeSeconds: 0, bonusDescription: 'Základná dielňa', bonuses: {} },
      { level: 2, goldCost: 700, buildTimeSeconds: 4500, bonusDescription: '-5% nákladov na výrobu', bonuses: { trainingCostReduction: 0.03 } },
      { level: 3, goldCost: 2000, buildTimeSeconds: 9000, bonusDescription: '-10% nákladov na výrobu', bonuses: { trainingCostReduction: 0.06 } },
      { level: 4, goldCost: 5000, buildTimeSeconds: 18000, bonusDescription: '-15% nákladov, šanca na bonus loot', bonuses: { trainingCostReduction: 0.09 } },
      { level: 5, goldCost: 12000, buildTimeSeconds: 36000, bonusDescription: '-20% nákladov, +3% obrana', bonuses: { trainingCostReduction: 0.12, defensePower: 3 } },
    ],
  },
  {
    id: 'b_watchtower',
    name: 'Strážna veža',
    description: 'Veža, z ktorej sleduješ okolie. Zvyšuje presnosť a obranu.',
    lore: 'Ten, kto vidí prvý, vyhráva.',
    icon: 'eye',
    maxLevel: 5,
    levels: [
      { level: 1, goldCost: 0, buildTimeSeconds: 0, bonusDescription: 'Základná veža', bonuses: {} },
      { level: 2, goldCost: 900, buildTimeSeconds: 5400, bonusDescription: '+2% presnosť', bonuses: { criticalChance: 1 } },
      { level: 3, goldCost: 2500, buildTimeSeconds: 10800, bonusDescription: '+4% presnosť, +2 obrana', bonuses: { criticalChance: 2, defensePower: 2 } },
      { level: 4, goldCost: 6000, buildTimeSeconds: 21600, bonusDescription: '+6% presnosť, +4 obrana', bonuses: { criticalChance: 3, defensePower: 4 } },
      { level: 5, goldCost: 14000, buildTimeSeconds: 43200, bonusDescription: '+10% presnosť, +6 obrana', bonuses: { criticalChance: 5, defensePower: 6 } },
    ],
  },
]

/**
 * Get a building by ID.
 */
export function getBuildingById(id: string): Building | undefined {
  return buildings.find((b) => b.id === id)
}

/**
 * Get the total build time for upgrading a building from level 1 to level N.
 */
export function getTotalBuildTime(buildingId: string, toLevel: number): number {
  const building = getBuildingById(buildingId)
  if (!building) return 0

  let total = 0
  for (let i = 1; i < toLevel && i <= building.maxLevel; i++) {
    total += building.levels[i]?.buildTimeSeconds ?? 0
  }
  return total
}

/**
 * Get the total gold cost for upgrading a building from level 1 to level N.
 */
export function getTotalGoldCost(buildingId: string, toLevel: number): number {
  const building = getBuildingById(buildingId)
  if (!building) return 0

  let total = 0
  for (let i = 1; i < toLevel && i <= building.maxLevel; i++) {
    total += building.levels[i]?.goldCost ?? 0
  }
  return total
}
