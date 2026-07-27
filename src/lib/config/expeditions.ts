// ---------------------------------------------------------------------------
// Nocturna — Expedition Event Templates
//
// Expeditions are the core PvE activity. Each region has a pool of events.
// The player picks an expedition, and the server picks a random event from
// that region's pool based on the character's level.
// ---------------------------------------------------------------------------

export type DifficultyModifier = 'easy' | 'normal' | 'hard' | 'deadly'

export interface ExpeditionEvent {
  id: string
  name: string
  /** Slovak description */
  description: string
  regionId: string
  /** Difficulty determines stat scaling and reward multipliers */
  difficulty: DifficultyModifier
  /** Recommended character level */
  recommendedLevel: [number, number]
  /** Enemy to fight (null = no combat, just a choice event) */
  enemyId: string | null
  /** Gold reward range */
  goldReward: [number, number]
  /** XP reward range */
  xpReward: [number, number]
  /** Crystal reward range */
  crystalReward: [number, number]
  /** Bonus loot item IDs */
  bonusLootIds: string[]
  /** Chance for bonus loot (0–1) */
  bonusLootChance: number
  /** Slovak success report text template (%s = enemy name or event name) */
  successText: string
  /** Slovak failure report text template */
  failureText: string
  /** Energy cost (base, before region multiplier) */
  energyCost: number
}

// ---------------------------------------------------------------------------
// Difficulty multipliers
// ---------------------------------------------------------------------------

export const difficultyMultipliers: Record<DifficultyModifier, {
  enemyHpMultiplier: number
  enemyDamageMultiplier: number
  rewardMultiplier: number
  xpMultiplier: number
}> = {
  easy: { enemyHpMultiplier: 0.8, enemyDamageMultiplier: 0.8, rewardMultiplier: 0.7, xpMultiplier: 0.6 },
  normal: { enemyHpMultiplier: 1.0, enemyDamageMultiplier: 1.0, rewardMultiplier: 1.0, xpMultiplier: 1.0 },
  hard: { enemyHpMultiplier: 1.3, enemyDamageMultiplier: 1.2, rewardMultiplier: 1.4, xpMultiplier: 1.3 },
  deadly: { enemyHpMultiplier: 1.6, enemyDamageMultiplier: 1.5, rewardMultiplier: 2.0, xpMultiplier: 1.8 },
}

// ---------------------------------------------------------------------------
// Mesto bez svitania — Events
// ---------------------------------------------------------------------------

const mestoEvents: ExpeditionEvent[] = [
  {
    id: 'exp_mesto_patrol',
    name: 'Nočná patrola',
    description: 'Prejdi temnými ulicami a odhoď všetkých, ktorí sa ti postavia do cesty.',
    regionId: 'r_mesto',
    difficulty: 'easy',
    recommendedLevel: [1, 5],
    enemyId: 'e_zombie',
    goldReward: [15, 35],
    xpReward: [20, 40],
    crystalReward: [0, 0],
    bonusLootIds: [],
    bonusLootChance: 0,
    successText: 'Patrola úspešná. Ulice sú dočasne bezpečné.',
    failureText: 'Príšery boli silnejšie, než si čakal. Musel si utiecť.',
    energyCost: 10,
  },
  {
    id: 'exp_mesto_crypt',
    name: 'Výprava do kryptu',
    description: 'Pod mestom sa skrývajú starobylé krypty. Ich strážcovia nie sú mŕtvi — sú horší.',
    regionId: 'r_mesto',
    difficulty: 'normal',
    recommendedLevel: [4, 8],
    enemyId: 'e_ghoul',
    goldReward: [30, 65],
    xpReward: [45, 85],
    crystalReward: [0, 2],
    bonusLootIds: ['w_dagger_of_shadows', 'c_health_potion'],
    bonusLootChance: 0.15,
    successText: 'Krypty sú vyčistené. Našiel si poklad v hrobe neznámeho bojovníka.',
    failureText: 'Ghúli boli rýchlejší. Tvoja zbraň nestačila.',
    energyCost: 15,
  },
  {
    id: 'exp_mesto_boss',
    name: 'Hrobníkova odplata',
    description: 'Hrobník zhromaždil svoju armádu. Je čas ukončiť jeho vládu.',
    regionId: 'r_mesto',
    difficulty: 'hard',
    recommendedLevel: [7, 10],
    enemyId: 'e_gravekeeper',
    goldReward: [60, 120],
    xpReward: [80, 140],
    crystalReward: [1, 3],
    bonusLootIds: ['h_iron_helm', 'am_bone_pendant'],
    bonusLootChance: 0.2,
    successText: 'Hrobník padol! Mesto bez svitania je opäť o krok bližšie k slobode.',
    failureText: 'Hrobník ťa porazil. Tvoja moc nestačila na jeho temnú silu.',
    energyCost: 20,
  },
]

// ---------------------------------------------------------------------------
// Čierny les — Events
// ---------------------------------------------------------------------------

const ciernyLesEvents: ExpeditionEvent[] = [
  {
    id: 'exp_les_hunt',
    name: 'Nočný lov',
    description: 'Tieňové vlky sa zhromaždili v svorke. Ich lovec je rýchly a krutý.',
    regionId: 'r_cierny_les',
    difficulty: 'easy',
    recommendedLevel: [5, 9],
    enemyId: 'e_wolf',
    goldReward: [30, 60],
    xpReward: [50, 90],
    crystalReward: [0, 1],
    bonusLootIds: ['b_leather_boots'],
    bonusLootChance: 0.1,
    successText: 'Vlk padol. Jeho koža bude užitočná.',
    failureText: 'Svorka bola príliš silná. Musel si sa vzdať.',
    energyCost: 12,
  },
  {
    id: 'exp_les_spider',
    name: 'Pavúčia sieť',
    description: 'Medzi stromami sa tiahnu obrovské siete. Pavúčia kráľovná čaká na svoju korisť.',
    regionId: 'r_cierny_les',
    difficulty: 'normal',
    recommendedLevel: [8, 13],
    enemyId: 'e_spider',
    goldReward: [45, 85],
    xpReward: [65, 120],
    crystalReward: [0, 2],
    bonusLootIds: ['c_shadow_vial', 'g_leather_gloves'],
    bonusLootChance: 0.15,
    successText: 'Kráľovná padla. Jej sieť sa rozpadla a les je bezpečnejší.',
    failureText: 'Jed ťa paralyzoval. Pavúčia kráľovná ťa nechala žiť — zatiaľ.',
    energyCost: 18,
  },
  {
    id: 'exp_les_boss',
    name: 'Starý strážca',
    description: 'Najstarší strom lesa sa prebudil. Jeho hnev je nekonečný.',
    regionId: 'r_cierny_les',
    difficulty: 'deadly',
    recommendedLevel: [12, 15],
    enemyId: 'e_treant',
    goldReward: [100, 180],
    xpReward: [140, 230],
    crystalReward: [2, 5],
    bonusLootIds: ['a_chainmail', 'g_gauntlets_of_power', 're_moonshard'],
    bonusLootChance: 0.25,
    successText: 'Strážca padol. Les sa utíšil, akoby smútil.',
    failureText: 'Strom bol príliš silný. Jeho korene ťa premohli.',
    energyCost: 25,
  },
]

// ---------------------------------------------------------------------------
// Krypty Prvých — Events
// ---------------------------------------------------------------------------

const kryptyEvents: ExpeditionEvent[] = [
  {
    id: 'exp_krypty_skeleton',
    name: 'Kostnatá hala',
    description: 'Vstúpil si do haly plnej kostí. Niektoré z nich sa začali hýbať.',
    regionId: 'r_krypty',
    difficulty: 'easy',
    recommendedLevel: [10, 14],
    enemyId: 'e_skeleton',
    goldReward: [50, 100],
    xpReward: [75, 130],
    crystalReward: [0, 2],
    bonusLootIds: ['w_iron_mace', 'c_health_potion'],
    bonusLootChance: 0.15,
    successText: 'Kostlivci sú späť na zemi. Krypty sú dočasne tiché.',
    failureText: 'Kosti sa znovu poskladali. Tvoja energia nestačila.',
    energyCost: 15,
  },
  {
    id: 'exp_krypty_wraith',
    name: 'Prízrak v tme',
    description: 'V temnote ťa sleduje niečo chladné. Prízrak mŕtveho bojovníka sa ťa snaží dostať.',
    regionId: 'r_krypty',
    difficulty: 'hard',
    recommendedLevel: [14, 18],
    enemyId: 'e_wraith',
    goldReward: [70, 140],
    xpReward: [100, 180],
    crystalReward: [1, 3],
    bonusLootIds: ['c_berserker_potion', 'r_ring_of_fortitude'],
    bonusLootChance: 0.18,
    successText: 'Prízrak našiel pokoj. Tvoja sila ho prepustila z väzenia.',
    failureText: 'Chlad ťa pohltil. Prízrak ťa nechal na pokoji — zatiaľ.',
    energyCost: 20,
  },
  {
    id: 'exp_krypty_lich',
    name: 'Trón Licha',
    description: 'V najhlbšej časti krypt sa nachádza trón. Na ňom sedí prastará bytosť.',
    regionId: 'r_krypty',
    difficulty: 'deadly',
    recommendedLevel: [17, 20],
    enemyId: 'e_lich',
    goldReward: [150, 300],
    xpReward: [200, 350],
    crystalReward: [3, 7],
    bonusLootIds: ['w_bloodthorn', 'h_crown_of_blood', 're_heart_of_darkness'],
    bonusLootChance: 0.3,
    successText: 'Lich padol! Jeho moc sa rozpadla a krypty sa otvorili.',
    failureText: 'Lichova moc bola nekonečná. Tvoja duša takmer ušla.',
    energyCost: 30,
  },
]

// ---------------------------------------------------------------------------
// Mesačné vrchy — Events
// ---------------------------------------------------------------------------

const mesacneVrchyEvents: ExpeditionEvent[] = [
  {
    id: 'exp_mesa_harpy',
    name: 'Spev sirén',
    description: 'Z vrcholov kopcov sa šíri hypnotizujúci spev. Siréna ťa láka do pasce.',
    regionId: 'r_mesacne_vrchy',
    difficulty: 'normal',
    recommendedLevel: [15, 19],
    enemyId: 'e_harpy',
    goldReward: [80, 150],
    xpReward: [110, 200],
    crystalReward: [1, 3],
    bonusLootIds: ['b_boots_of_haste', 'c_energy_drink'],
    bonusLootChance: 0.15,
    successText: 'Siréna padla. Jej spev sa odmlčal a vzduch sa vyčistil.',
    failureText: 'Jej spev ťa omámil. Prebral si sa až hodiny neskôr.',
    energyCost: 20,
  },
  {
    id: 'exp_mesa_golem',
    name: 'Mesačný kameň',
    description: 'Obrovský golem z mesačného kameňa stráži vstup do svätyne.',
    regionId: 'r_mesacne_vrchy',
    difficulty: 'hard',
    recommendedLevel: [19, 23],
    enemyId: 'e_golem',
    goldReward: [100, 200],
    xpReward: [150, 260],
    crystalReward: [2, 5],
    bonusLootIds: ['a_plate_of_void', 'o_iron_buckler'],
    bonusLootChance: 0.2,
    successText: 'Golem sa rozpadol. Mesačný kameň žiari pred tebou.',
    failureText: 'Golemova sila bola obrovská. Tvoja zbraň sa rozlomila.',
    energyCost: 25,
  },
  {
    id: 'exp_mesa_boss',
    name: 'Mesačný boh',
    description: 'Na vrchole hôr sa nachádza svätyňa. V nej drieme bytosť, ktorá ovláda samotný mesiac.',
    regionId: 'r_mesacne_vrchy',
    difficulty: 'deadly',
    recommendedLevel: [23, 28],
    enemyId: 'e_moon_god',
    goldReward: [250, 500],
    xpReward: [350, 550],
    crystalReward: [5, 12],
    bonusLootIds: ['w_worldender', 'a_plate_of_void', 're_heart_of_darkness', 'b_shadowstriders'],
    bonusLootChance: 0.35,
    successText: 'Mesačný boh padol! Jeho moc sa vrátila späť k mesiacu. Si legenda.',
    failureText: 'Mesačný boh ťa porazil. Jeho moc bola nad ľudské chápanie.',
    energyCost: 35,
  },
]

// ---------------------------------------------------------------------------
// All events registry
// ---------------------------------------------------------------------------

export const allExpeditionEvents: ExpeditionEvent[] = [
  ...mestoEvents,
  ...ciernyLesEvents,
  ...kryptyEvents,
  ...mesacneVrchyEvents,
]

/**
 * Get expedition events for a specific region.
 */
export function getEventsByRegion(regionId: string): ExpeditionEvent[] {
  return allExpeditionEvents.filter((e) => e.regionId === regionId)
}

/**
 * Get expedition events appropriate for a character's level in a region.
 */
export function getEventsForLevel(
  regionId: string,
  level: number
): ExpeditionEvent[] {
  return getEventsByRegion(regionId).filter(
    (e) => level >= e.recommendedLevel[0] - 2 && level <= e.recommendedLevel[1] + 2
  )
}

/**
 * Pick a random event for a region based on character level.
 */
export function pickRandomEvent(
  regionId: string,
  level: number
): ExpeditionEvent | null {
  const candidates = getEventsForLevel(regionId, level)
  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}
