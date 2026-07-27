// ---------------------------------------------------------------------------
// Nocturna — Region Configuration
//
// 4 regions with recommended levels, descriptions, and visual settings.
// Regions are ordered by difficulty from easiest to hardest.
// ---------------------------------------------------------------------------

export interface Region {
  id: string
  name: string
  /** Slovak description */
  description: string
  /** Recommended character level range */
  recommendedLevel: [number, number]
  /** Background colour or gradient for the UI */
  backgroundColor: string
  /** Accent colour for highlights */
  accentColor: string
  /** Ambient music track key (for future audio) */
  musicTrack: string
  /** Whether PvP is allowed in this region */
  pvpEnabled: boolean
  /** Energy cost multiplier (some regions cost more energy) */
  energyCostMultiplier: number
  /** Enemy level range for spawns */
  enemyLevelRange: [number, number]
}

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------

export const regions: Region[] = [
  {
    id: 'r_mesto',
    name: 'Mesto bez svitania',
    description:
      'Mesto, kde slnko nikdy nevychádza. Ulice sú prázdne, okná zatvorené a ' +
      'v každom rohu číha nebezpečenstvo. Páni mesta zmizli pred rokmi a teraz ' +
      'tu vládnu mŕtvi.',
    recommendedLevel: [1, 10],
    backgroundColor: '#1a0a0a',
    accentColor: '#8B0000',
    musicTrack: 'ambient_city',
    pvpEnabled: true,
    energyCostMultiplier: 1.0,
    enemyLevelRange: [1, 10],
  },
  {
    id: 'r_cierny_les',
    name: 'Čierny les',
    description:
      'Hustý, temný les, kde sa svetlo neodráža. Stromy sú také staré, že ' +
      'pamätajú časy pred ľuďmi. V ich tieni sa skrývajú bytosti, ktoré ' +
      'ľudia nazývajú príšerami.',
    recommendedLevel: [5, 15],
    backgroundColor: '#0a1a0a',
    accentColor: '#2d5a1e',
    musicTrack: 'ambient_forest',
    pvpEnabled: false,
    energyCostMultiplier: 1.2,
    enemyLevelRange: [5, 15],
  },
  {
    id: 'r_krypty',
    name: 'Krypty Prvých',
    description:
      'Podzemné hrobky prastarej rasy, ktorá tu žila pred tisícročiami. ' +
      'Ich technológia a mágia sú stále aktívne a chránia ich poklady. ' +
      'Len blázni sem vstupujú.',
    recommendedLevel: [10, 20],
    backgroundColor: '#0a0a1a',
    accentColor: '#4a3a6a',
    musicTrack: 'ambient_crypts',
    pvpEnabled: true,
    energyCostMultiplier: 1.5,
    enemyLevelRange: [10, 20],
  },
  {
    id: 'r_mesacne_vrchy',
    name: 'Mesačné vrchy',
    description:
      'Pohoria, ktoré sú najvyššie na kontinente. V noci ich osvetľuje ' +
      'mesiac a ich vrcholy sa dotýkajú hviezd. Hovorí sa, že tu žijú ' +
      'prastaré bytosti, ktoré ovládajú samotnú realitu.',
    recommendedLevel: [15, 28],
    backgroundColor: '#0a0a2a',
    accentColor: '#6a8aaa',
    musicTrack: 'ambient_mountains',
    pvpEnabled: true,
    energyCostMultiplier: 2.0,
    enemyLevelRange: [15, 28],
  },
]

/**
 * Get a region by ID.
 */
export function getRegionById(id: string): Region | undefined {
  return regions.find((r) => r.id === id)
}

/**
 * Get regions appropriate for a character's level.
 */
export function getRegionsForLevel(level: number): Region[] {
  return regions.filter(
    (r) => level >= r.recommendedLevel[0] - 2 && level <= r.recommendedLevel[1] + 2
  )
}
