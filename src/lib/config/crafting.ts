export const CRAFTING_CONFIG = {
  materials: {
    categories: ['metal', 'leather', 'wood', 'essence', 'rune', 'relic_fragment', 'boss_material', 'event_material'],

    templates: [
      // Metal
      { slug: 'temne-zelezo', nameKey: 'material.temne_zelezo.name', descriptionKey: 'material.temne_zelezo.desc', rarity: 'common' as const, stackLimit: 999, tradable: true },
      { slug: 'stieborna-ruda', nameKey: 'material.stieborna_ruda.name', descriptionKey: 'material.stieborna_ruda.desc', rarity: 'uncommon' as const, stackLimit: 999, tradable: true },
      { slug: 'runova-ocel', nameKey: 'material.runova_ocel.name', descriptionKey: 'material.runova_ocel.desc', rarity: 'rare' as const, stackLimit: 500, tradable: true },
      { slug: 'meteoriticke-zelezo', nameKey: 'material.meteoriticke.name', descriptionKey: 'material.meteoriticke.desc', rarity: 'epic' as const, stackLimit: 200, tradable: true },

      // Leather
      { slug: 'koza-nočneho-lovca', nameKey: 'material.koza_lovca.name', descriptionKey: 'material.koza_lovca.desc', rarity: 'common' as const, stackLimit: 999, tradable: true },
      { slug: 'koza-temneho-jeleňa', nameKey: 'material.koza_jeleňa.name', descriptionKey: 'material.koza_jeleňa.desc', rarity: 'uncommon' as const, stackLimit: 999, tradable: true },
      { slug: 'dracia-koza', nameKey: 'material.dracia_koza.name', descriptionKey: 'material.dracia_koza.desc', rarity: 'rare' as const, stackLimit: 500, tradable: true },

      // Wood
      { slug: 'cierne-drevo', nameKey: 'material.cierne_drevo.name', descriptionKey: 'material.cierne_drevo.desc', rarity: 'common' as const, stackLimit: 999, tradable: true },
      { slug: 'mesacna-kôra', nameKey: 'material.mesacna_kora.name', descriptionKey: 'material.mesacna_kora.desc', rarity: 'uncommon' as const, stackLimit: 999, tradable: true },
      { slug: 'stara-korienka', nameKey: 'material.stara_korienka.name', descriptionKey: 'material.stara_korienka.desc', rarity: 'rare' as const, stackLimit: 500, tradable: true },

      // Essence
      { slug: 'krvava-esencia', nameKey: 'material.krvava_esencia.name', descriptionKey: 'material.krvava_esencia.desc', rarity: 'uncommon' as const, stackLimit: 500, tradable: true },
      { slug: 'mesacny-prach', nameKey: 'material.mesacny_prach.name', descriptionKey: 'material.mesacny_prach.desc', rarity: 'rare' as const, stackLimit: 300, tradable: true },
      { slug: 'esencia-zatmenia', nameKey: 'material.esencia_zatmenia.name', descriptionKey: 'material.esencia_zatmenia.desc', rarity: 'epic' as const, stackLimit: 100, tradable: false },

      // Rune
      { slug: 'rana-znicenia', nameKey: 'material.rana_znicenia.name', descriptionKey: 'material.rana_znicenia.desc', rarity: 'rare' as const, stackLimit: 200, tradable: true },
      { slug: 'rana-ochrany', nameKey: 'material.rana_ochrany.name', descriptionKey: 'material.rana_ochrany.desc', rarity: 'rare' as const, stackLimit: 200, tradable: true },
      { slug: 'rana-krvaveho-luna', nameKey: 'material.rana_krv_luna.name', descriptionKey: 'material.rana_krv_luna.desc', rarity: 'epic' as const, stackLimit: 100, tradable: true },

      // Relic fragments
      { slug: 'ulomok-prvych', nameKey: 'material.ulomok_prvych.name', descriptionKey: 'material.ulomok_prvych.desc', rarity: 'rare' as const, stackLimit: 200, tradable: false },
      { slug: 'fragment-korony', nameKey: 'material.fragment_korony.name', descriptionKey: 'material.fragment_korony.desc', rarity: 'legendary' as const, stackLimit: 50, tradable: false },

      // Boss materials
      { slug: 'konzerva-stoku', nameKey: 'material.konzerva_stoku.name', descriptionKey: 'material.konzerva_stoku.desc', rarity: 'rare' as const, stackLimit: 50, tradable: false },
      { slug: 'srdce-matky', nameKey: 'material.srdce_matky.name', descriptionKey: 'material.srdce_matky.desc', rarity: 'rare' as const, stackLimit: 50, tradable: false },
      { slug: 'pamat-archivara', nameKey: 'material.pamat_archivara.name', descriptionKey: 'material.pamat_archivara.desc', rarity: 'epic' as const, stackLimit: 50, tradable: false },
      { slug: 'jadro-strazcu', nameKey: 'material.jadro_strazcu.name', descriptionKey: 'material.jadro_strazcu.desc', rarity: 'epic' as const, stackLimit: 50, tradable: false },

      // Event
      { slug: 'fragment-zatmenia', nameKey: 'material.fragment_zatmenia.name', descriptionKey: 'material.fragment_zatmenia.desc', rarity: 'legendary' as const, stackLimit: 100, tradable: false },
    ],
  },

  recipes: [
    // Weapons
    { slug: 'temna-sekera', nameKey: 'recipe.temna_sekera.name', outputType: 'item' as const, outputTemplateId: 'weapon_temna_sekera', outputQuantity: 1, materials: [{ slug: 'temne-zelezo', qty: 10 }, { slug: 'koza-nočneho-lovca', qty: 5 }], goldCost: 500, durationSeconds: 300, successRate: 1.0 },
    { slug: 'mesacny-mec', nameKey: 'recipe.mesacny_mec.name', outputType: 'item' as const, outputTemplateId: 'weapon_mesacny_mec', outputQuantity: 1, materials: [{ slug: 'runova-ocel', qty: 8 }, { slug: 'mesacny-prach', qty: 3 }], goldCost: 2000, durationSeconds: 600, successRate: 1.0 },
    { slug: 'hrdy-luk', nameKey: 'recipe.hrdy_luk.name', outputType: 'item' as const, outputTemplateId: 'weapon_hrdy_luk', outputQuantity: 1, materials: [{ slug: 'mesacna-kôra', qty: 12 }, { slug: 'stara-korienka', qty: 4 }], goldCost: 1500, durationSeconds: 480, successRate: 1.0 },

    // Armor
    { slug: 'temna-brnenie', nameKey: 'recipe.temna_brnenie.name', outputType: 'item' as const, outputTemplateId: 'armor_temna_brnenie', outputQuantity: 1, materials: [{ slug: 'temne-zelezo', qty: 15 }, { slug: 'koza-nočneho-lovca', qty: 10 }], goldCost: 800, durationSeconds: 480, successRate: 1.0 },
    { slug: 'mesacny-stit', nameKey: 'recipe.mesacny_stit.name', outputType: 'item' as const, outputTemplateId: 'armor_mesacny_stit', outputQuantity: 1, materials: [{ slug: 'runova-ocel', qty: 6 }, { slug: 'cierne-drevo', qty: 8 }], goldCost: 1800, durationSeconds: 600, successRate: 1.0 },

    // Consumables
    { slug: 'lektvar-sily', nameKey: 'recipe.lektvar_sily.name', outputType: 'material' as const, outputTemplateId: 'lektvar_sily', outputQuantity: 3, materials: [{ slug: 'krvava-esencia', qty: 2 }, { slug: 'cierne-drevo', qty: 1 }], goldCost: 100, durationSeconds: 60, successRate: 1.0 },
    { slug: 'lecivy-eliksir', nameKey: 'recipe.lecivy_eliksir.name', outputType: 'material' as const, outputTemplateId: 'lecivy_eliksir', outputQuantity: 3, materials: [{ slug: 'koza-temneho-jeleňa', qty: 2 }, { slug: 'krvava-esencia', qty: 1 }], goldCost: 100, durationSeconds: 60, successRate: 1.0 },

    // Upgrade materials
    { slug: 'mesacna-prisada', nameKey: 'recipe.mesacna_prisada.name', outputType: 'material' as const, outputTemplateId: 'mesacna-prisada', outputQuantity: 1, materials: [{ slug: 'mesacny-prach', qty: 5 }, { slug: 'runova-ocel', qty: 2 }], goldCost: 800, durationSeconds: 300, successRate: 1.0 },
  ],

  upgrade: {
    maxLevel: 10,
    baseMultiplier: 1.0,
    perLevelMultiplier: 0.035,
    tiers: [
      { minLevel: 1, maxLevel: 5, successRate: 1.0, description: 'Guaranteed success' },
      { minLevel: 6, maxLevel: 8, successRate: 0.8, description: 'May fail, no item loss' },
      { minLevel: 9, maxLevel: 10, successRate: 0.5, description: 'High cost, special materials' },
    ],
    costs: {
      goldBase: 200,
      goldPerLevel: 150,
      materialCosts: [
        { level: 1, materials: [{ slug: 'temne-zelezo', qty: 5 }] },
        { level: 3, materials: [{ slug: 'temne-zelezo', qty: 10 }, { slug: 'mesacny-prach', qty: 2 }] },
        { level: 5, materials: [{ slug: 'runova-ocel', qty: 5 }, { slug: 'mesacny-prach', qty: 5 }] },
        { level: 7, materials: [{ slug: 'runova-ocel', qty: 10 }, { slug: 'mesacny-prach', qty: 10 }, { slug: 'rana-znicenia', qty: 3 }] },
        { level: 9, materials: [{ slug: 'meteoriticke-zelezo', qty: 5 }, { slug: 'esencia-zatmenia', qty: 3 }, { slug: 'rana-krvaveho-luna', qty: 5 }] },
      ],
    },
  },

  dismantle: {
    yieldMultiplier: 0.6,
    rarityMultipliers: {
      common: 0.5,
      uncommon: 0.6,
      rare: 0.7,
      epic: 0.8,
      legendary: 0.9,
    },
    levelBonusPerLevel: 0.01,
    upgradeBonusPerLevel: 0.05,
    confirmationRequired: ['rare', 'epic', 'legendary', 'cursed'],
  },
} as const

export type MaterialTemplate = typeof CRAFTING_CONFIG.materials.templates[number]
export type CraftingRecipe = typeof CRAFTING_CONFIG.recipes[number]
