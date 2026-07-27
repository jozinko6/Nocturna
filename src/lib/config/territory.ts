export const TERRITORY_CONFIG = {
  regions: [
    {
      slug: 'mesto-bez-svitania',
      nameKey: 'world.region.mesto.name',
      levelMin: 1,
      levelMax: 20,
      nodes: [
        { slug: 'stara-pevnost', nameKey: 'territory.stara_pevnost.name', nodeType: 'fortress', bonus: 'defense_boost' },
        { slug: 'zelezna-bana', nameKey: 'territory.zelezna_bana.name', nodeType: 'mine', bonus: 'metal_yield' },
        { slug: 'trznica', nameKey: 'territory.trznica.name', nodeType: 'trade_route', bonus: 'merchant_discount' },
      ],
    },
    {
      slug: 'cierny-les',
      nameKey: 'world.region.cierny_les.name',
      levelMin: 15,
      levelMax: 30,
      nodes: [
        { slug: 'svatyna-stromov', nameKey: 'territory.svatyna_stromov.name', nodeType: 'sanctuary', bonus: 'energy_regen' },
        { slug: 'hlboka-bana', nameKey: 'territory.hlboka_bana.name', nodeType: 'mine', bonus: 'essence_yield' },
        { slug: 'lovci-veza', nameKey: 'territory.lovci_veza.name', nodeType: 'watchtower', bonus: 'enemy_intel' },
      ],
    },
    {
      slug: 'krypty-prvych',
      nameKey: 'world.region.krypty.name',
      levelMin: 25,
      levelMax: 40,
      nodes: [
        { slug: 'archiv-ukryty', nameKey: 'territory.archiv.name', nodeType: 'sanctuary', bonus: 'xp_boost' },
        { slug: 'reliktna-comnata', nameKey: 'territory.reliktna_comnata.name', nodeType: 'relic_site', bonus: 'rare_drop_boost' },
        { slug: 'starodavna-skušobna', nameKey: 'territory.skušobna.name', nodeType: 'fortress', bonus: 'defense_boost' },
      ],
    },
    {
      slug: 'mesacne-vrchy',
      nameKey: 'world.region.mesačne_vrchy.name',
      levelMin: 35,
      levelMax: 50,
      nodes: [
        { slug: 'vrchol-luna', nameKey: 'territory.vrchol_luna.name', nodeType: 'sanctuary', bonus: 'energy_regen' },
        { slug: 'mesacna-veza', nameKey: 'territory.mesacna_veza.name', nodeType: 'watchtower', bonus: 'enemy_intel' },
        { slug: 'stara-kužia', nameKey: 'territory.stara_kužia.name', nodeType: 'mine', bonus: 'rune_yield' },
      ],
    },
    {
      slug: 'krvave-mociare',
      nameKey: 'world.region.krvave_mociare.name',
      levelMin: 20,
      levelMax: 35,
      nodes: [
        { slug: 'baňa-rudy', nameKey: 'territory.bana_rudy.name', nodeType: 'mine', bonus: 'metal_yield' },
        { slug: 'mocarne-okuje', nameKey: 'territory.mocarne_okuje.name', nodeType: 'fortress', bonus: 'defense_boost' },
      ],
    },
    {
      slug: 'pobrezie-prazdnych-lodi',
      nameKey: 'world.region.pobrezie.name',
      levelMin: 30,
      levelMax: 45,
      nodes: [
        { slug: 'pristav', nameKey: 'territory.pristav.name', nodeType: 'trade_route', bonus: 'merchant_discount' },
        { slug: 'potopene-zlato', nameKey: 'territory.potopene_zlato.name', nodeType: 'relic_site', bonus: 'gold_boost' },
      ],
    },
    {
      slug: 'koruna-zatmenia',
      nameKey: 'world.region.koruna.name',
      levelMin: 45,
      levelMax: 50,
      nodes: [
        { slug: 'srdce-zatmenia', nameKey: 'territory.srdce_zatmenia.name', nodeType: 'relic_site', bonus: 'legendary_drop_boost' },
        { slug: 'temna-veza', nameKey: 'territory.temna_veza.name', nodeType: 'fortress', bonus: 'defense_boost' },
      ],
    },
  ],

  nodeTypes: {
    fortress: { nameKey: 'territory.type.fortress.name', descriptionKey: 'territory.type.fortress.desc', color: '#8B4513' },
    mine: { nameKey: 'territory.type.mine.name', descriptionKey: 'territory.type.mine.desc', color: '#CD853F' },
    sanctuary: { nameKey: 'territory.type.sanctuary.name', descriptionKey: 'territory.type.sanctuary.desc', color: '#4169E1' },
    trade_route: { nameKey: 'territory.type.trade_route.name', descriptionKey: 'territory.type.trade_route.desc', color: '#DAA520' },
    watchtower: { nameKey: 'territory.type.watchtower.name', descriptionKey: 'territory.type.watchtower.desc', color: '#2F4F4F' },
    relic_site: { nameKey: 'territory.type.relic_site.name', descriptionKey: 'territory.type.relic_site.desc', color: '#9370DB' },
  },

  dominance: {
    maxTerritoriesPerClan: 5,
    defenseFatigueMultiplier: 0.8,
    attackerBonusVsDominant: 0.15,
    decayDaysInactive: 7,
    captureCostBase: 100,
    captureCostPerOwned: 50,
  },

  season: {
    resetOnSeasonEnd: true,
    keepPlayerProgress: true,
    keepClanMembership: true,
    resetTerritoryOwnership: true,
    resetTerritoryScores: true,
  },

  factionGoals: {
    pointsPerPvE: 1,
    pointsPerPvP: 3,
    pointsPerBoss: 10,
    pointsPerTerritory: 5,
    catchUpBonusThreshold: 0.7,
    catchUpBonusMultiplier: 1.25,
  },
} as const

export type TerritoryNodeType = keyof typeof TERRITORY_CONFIG.nodeTypes
export type TerritoryRegion = typeof TERRITORY_CONFIG.regions[number]
export type TerritoryNode = TerritoryRegion['nodes'][number]
