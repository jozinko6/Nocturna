// ---------------------------------------------------------------------------
// Nocturna — Enemy Configuration
//
// 4 regions × 3 enemies each = 12 base enemies. Each enemy has a level
// range, stat template, and a loot table referencing item IDs from items.ts.
// ---------------------------------------------------------------------------

export type EnemyRarity = 'normal' | 'elite' | 'boss'

export interface LootEntry {
  itemId: string
  dropChance: number // 0–1
  minQuantity: number
  maxQuantity: number
}

export interface EnemyTemplate {
  id: string
  name: string
  /** Slovak description */
  description: string
  regionId: string
  rarity: EnemyRarity
  /** Level range [min, max] */
  levelRange: [number, number]
  /** Base stats (at level 1; scaled by level) */
  baseStats: {
    strength: number
    endurance: number
    dexterity: number
    perception: number
    luck: number
  }
  /** Weapon damage (base) */
  weaponDamage: number
  /** Armor (base) */
  armor: number
  /** Gold reward range */
  goldReward: [number, number]
  /** XP reward range */
  xpReward: [number, number]
  /** Loot table */
  lootTable: LootEntry[]
}

// ---------------------------------------------------------------------------
// Region: Mesto bez svitania
// ---------------------------------------------------------------------------

const mestoEnemies: EnemyTemplate[] = [
  {
    id: 'e_zombie',
    name: 'Mŕtvy chodec',
    description: 'Rozkladajúce sa telo, ktoré sa plazí ulicami. Jeho pohľad je prázdny, no jeho chuť po mäse nie.',
    regionId: 'r_mesto',
    rarity: 'normal',
    levelRange: [1, 5],
    baseStats: { strength: 4, endurance: 6, dexterity: 2, perception: 1, luck: 1 },
    weaponDamage: 5,
    armor: 2,
    goldReward: [10, 25],
    xpReward: [15, 30],
    lootTable: [
      { itemId: 'c_health_potion', dropChance: 0.3, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  {
    id: 'e_ghoul',
    name: 'Ghúl',
    description: 'Vyhladovaná príšera, ktorá sa živí mŕtvymi. Jej pazúry sú ostré ako britvy.',
    regionId: 'r_mesto',
    rarity: 'normal',
    levelRange: [3, 8],
    baseStats: { strength: 6, endurance: 5, dexterity: 5, perception: 3, luck: 2 },
    weaponDamage: 8,
    armor: 4,
    goldReward: [20, 45],
    xpReward: [30, 60],
    lootTable: [
      { itemId: 'c_health_potion', dropChance: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'w_dagger_of_shadows', dropChance: 0.05, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  {
    id: 'e_gravekeeper',
    name: 'Hrobník',
    description: 'Strážca cintorína, ktorý sa zbláznil. Nosí kľúče od hrobov a jeho lampáš svetluje zeleným plameňom.',
    regionId: 'r_mesto',
    rarity: 'elite',
    levelRange: [6, 10],
    baseStats: { strength: 8, endurance: 8, dexterity: 4, perception: 5, luck: 3 },
    weaponDamage: 12,
    armor: 8,
    goldReward: [50, 100],
    xpReward: [70, 120],
    lootTable: [
      { itemId: 'c_greater_health_potion', dropChance: 0.4, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'h_iron_helm', dropChance: 0.1, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'am_bone_pendant', dropChance: 0.08, minQuantity: 1, maxQuantity: 1 },
    ],
  },
]

// ---------------------------------------------------------------------------
// Region: Čierny les
// ---------------------------------------------------------------------------

const ciernyLesEnemies: EnemyTemplate[] = [
  {
    id: 'e_wolf',
    name: 'Tieňový vlk',
    description: 'Vlk, ktorého oči žiaria v tme. Jeho srsť je čierna ako noc a jeho zuby sú ako nože.',
    regionId: 'r_cierny_les',
    rarity: 'normal',
    levelRange: [5, 10],
    baseStats: { strength: 7, endurance: 5, dexterity: 9, perception: 6, luck: 2 },
    weaponDamage: 9,
    armor: 3,
    goldReward: [25, 55],
    xpReward: [40, 75],
    lootTable: [
      { itemId: 'b_leather_boots', dropChance: 0.15, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  {
    id: 'e_spider',
    name: 'Pavúčia kráľovná',
    description: 'Obrovský pavúk, ktorý tká siete medzi stromami. Jeho jed paralyzuje.',
    regionId: 'r_cierny_les',
    rarity: 'normal',
    levelRange: [8, 13],
    baseStats: { strength: 6, endurance: 7, dexterity: 10, perception: 7, luck: 3 },
    weaponDamage: 11,
    armor: 5,
    goldReward: [35, 70],
    xpReward: [55, 100],
    lootTable: [
      { itemId: 'c_shadow_vial', dropChance: 0.2, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'g_leather_gloves', dropChance: 0.12, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  {
    id: 'e_treant',
    name: 'Starý strážca',
    description: 'Obrovský strom, ktorý sa prebudil. Jeho korene sa plazia po zemi a jeho konáre sú ako ruky.',
    regionId: 'r_cierny_les',
    rarity: 'boss',
    levelRange: [11, 15],
    baseStats: { strength: 12, endurance: 14, dexterity: 3, perception: 4, luck: 2 },
    weaponDamage: 16,
    armor: 14,
    goldReward: [80, 160],
    xpReward: [120, 200],
    lootTable: [
      { itemId: 'a_chainmail', dropChance: 0.15, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'g_gauntlets_of_power', dropChance: 0.08, minQuantity: 1, maxQuantity: 1 },
      { itemId: 're_moonshard', dropChance: 0.05, minQuantity: 1, maxQuantity: 1 },
    ],
  },
]

// ---------------------------------------------------------------------------
// Region: Krypty Prvých
// ---------------------------------------------------------------------------

const kryptyEnemies: EnemyTemplate[] = [
  {
    id: 'e_skeleton',
    name: 'Kostlivec',
    description: 'Kosti spojené temnou mágiou. Jeho oči žiaria modrým plameňom.',
    regionId: 'r_krypty',
    rarity: 'normal',
    levelRange: [10, 15],
    baseStats: { strength: 7, endurance: 6, dexterity: 8, perception: 5, luck: 2 },
    weaponDamage: 13,
    armor: 7,
    goldReward: [40, 85],
    xpReward: [65, 110],
    lootTable: [
      { itemId: 'c_health_potion', dropChance: 0.2, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'w_iron_mace', dropChance: 0.1, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  {
    id: 'e_wraith',
    name: 'Prízrak',
    description: 'Duch mŕtveho bojovníka, ktorý nemohol nájsť pokoj. Jeho dotyk ochladzuje krv.',
    regionId: 'r_krypty',
    rarity: 'normal',
    levelRange: [13, 18],
    baseStats: { strength: 9, endurance: 8, dexterity: 7, perception: 8, luck: 4 },
    weaponDamage: 15,
    armor: 6,
    goldReward: [55, 110],
    xpReward: [85, 150],
    lootTable: [
      { itemId: 'c_berserker_potion', dropChance: 0.15, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'r_ring_of_fortitude', dropChance: 0.08, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  {
    id: 'e_lich',
    name: 'Lich',
    description: 'Nekromant, ktorý porazil smrť. Jeho moc je takmer neobmedzená.',
    regionId: 'r_krypty',
    rarity: 'boss',
    levelRange: [16, 20],
    baseStats: { strength: 10, endurance: 12, dexterity: 8, perception: 12, luck: 6 },
    weaponDamage: 20,
    armor: 12,
    goldReward: [120, 250],
    xpReward: [180, 300],
    lootTable: [
      { itemId: 'w_bloodthorn', dropChance: 0.06, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'h_crown_of_blood', dropChance: 0.05, minQuantity: 1, maxQuantity: 1 },
      { itemId: 're_heart_of_darkness', dropChance: 0.03, minQuantity: 1, maxQuantity: 1 },
    ],
  },
]

// ---------------------------------------------------------------------------
// Region: Mesačné vrchy
// ---------------------------------------------------------------------------

const mesacneVrchyEnemies: EnemyTemplate[] = [
  {
    id: 'e_harpy',
    name: 'Siréna',
    description: 'Bytosť s krídlami a ženskou tvárou. Jej spev privádza do šialenstva.',
    regionId: 'r_mesacne_vrchy',
    rarity: 'normal',
    levelRange: [15, 20],
    baseStats: { strength: 8, endurance: 7, dexterity: 12, perception: 10, luck: 5 },
    weaponDamage: 17,
    armor: 8,
    goldReward: [65, 130],
    xpReward: [100, 175],
    lootTable: [
      { itemId: 'b_boots_of_haste', dropChance: 0.12, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'c_energy_drink', dropChance: 0.25, minQuantity: 1, maxQuantity: 2 },
    ],
  },
  {
    id: 'e_golem',
    name: 'Mesačný golem',
    description: 'Obrovská bytosť z mesačného kameňa. Každý krok zem trasie.',
    regionId: 'r_mesacne_vrchy',
    rarity: 'normal',
    levelRange: [18, 23],
    baseStats: { strength: 14, endurance: 16, dexterity: 3, perception: 4, luck: 2 },
    weaponDamage: 22,
    armor: 18,
    goldReward: [80, 160],
    xpReward: [130, 220],
    lootTable: [
      { itemId: 'a_plate_of_void', dropChance: 0.08, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'o_iron_buckler', dropChance: 0.12, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  {
    id: 'e_moon_god',
    name: 'Mesačný boh',
    description: 'Prastará bytosť, ktorá ovláda mesačné sily. Jeho prítomnosť mení realitu.',
    regionId: 'r_mesacne_vrchy',
    rarity: 'boss',
    levelRange: [22, 28],
    baseStats: { strength: 16, endurance: 14, dexterity: 12, perception: 14, luck: 8 },
    weaponDamage: 28,
    armor: 16,
    goldReward: [200, 400],
    xpReward: [300, 500],
    lootTable: [
      { itemId: 'w_worldender', dropChance: 0.02, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'a_plate_of_void', dropChance: 0.1, minQuantity: 1, maxQuantity: 1 },
      { itemId: 're_heart_of_darkness', dropChance: 0.05, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'b_shadowstriders', dropChance: 0.06, minQuantity: 1, maxQuantity: 1 },
    ],
  },
]

// ---------------------------------------------------------------------------
// All enemies registry
// ---------------------------------------------------------------------------

export const allEnemies: EnemyTemplate[] = [
  ...mestoEnemies,
  ...ciernyLesEnemies,
  ...kryptyEnemies,
  ...mesacneVrchyEnemies,
]

/**
 * Get all enemies in a specific region.
 */
export function getEnemiesByRegion(regionId: string): EnemyTemplate[] {
  return allEnemies.filter((e) => e.regionId === regionId)
}

/**
 * Get enemies appropriate for a given character level in a region.
 */
export function getEnemiesForLevel(
  regionId: string,
  level: number
): EnemyTemplate[] {
  return getEnemiesByRegion(regionId).filter(
    (e) => level >= e.levelRange[0] - 2 && level <= e.levelRange[1] + 2
  )
}

/**
 * Retrieve an enemy template by ID.
 */
export function getEnemyById(id: string): EnemyTemplate | undefined {
  return allEnemies.find((e) => e.id === id)
}
