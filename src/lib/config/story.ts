export const STORY_CONFIG = {
  campaign: {
    slug: 'kronika-zatmenia',
    nameKey: 'story.campaign.kronika_zatmenia.name',
    descriptionKey: 'story.campaign.kronika_zatmenia.description',
    minimumLevel: 1,
    maximumLevel: 50,
  },

  chapters: [
    {
      slug: 'prolog-stopy-v-dazdi',
      nameKey: 'story.chapter.prolog.name',
      descriptionKey: 'story.chapter.prolog.description',
      chapterOrder: 1,
      missions: [
        { slug: 'prve-kroky', nameKey: 'story.mission.prve_kroky.name', type: 'tutorial' as const },
        { slug: 'stopy-v-dazdi', nameKey: 'story.mission.stopy_v_dazdi.name', type: 'combat' as const },
        { slug: 'prve-poznanie', nameKey: 'story.mission.prve_poznanie.name', type: 'exploration' as const },
      ],
    },
    {
      slug: 'kapitola-1-mesto-bez-svitania',
      nameKey: 'story.chapter.k1.name',
      descriptionKey: 'story.chapter.k1.description',
      chapterOrder: 2,
      missions: [
        { slug: 'zmiznutia', nameKey: 'story.mission.zmiznutia.name', type: 'investigation' as const },
        { slug: 'paseraci-relikvii', nameKey: 'story.mission.paseraci.name', type: 'combat' as const },
        { slug: 'mestska-rada', nameKey: 'story.mission.mestska_rada.name', type: 'dialogue' as const },
        { slug: 'prve-dokazy', nameKey: 'story.mission.prve_dokazy.name', type: 'investigation' as const },
        { slug: 'boss_pan_stok', nameKey: 'story.mission.boss_pan_stok.name', type: 'boss' as const },
      ],
    },
    {
      slug: 'kapitola-2-cierny-les',
      nameKey: 'story.chapter.k2.name',
      descriptionKey: 'story.chapter.k2.description',
      chapterOrder: 3,
      missions: [
        { slug: 'poskodena-priroda', nameKey: 'story.mission.poskodena_priroda.name', type: 'exploration' as const },
        { slug: 'lunari-lovci', nameKey: 'story.mission.lunari_lovci.name', type: 'combat' as const },
        { slug: 'stare-svatyne', nameKey: 'story.mission.stare_svatyne.name', type: 'exploration' as const },
        { slug: 'moralne-rozhodnutie', nameKey: 'story.mission.moralne_rozhodnutie.name', type: 'decision' as const },
        { slug: 'boss_matka_koreňov', nameKey: 'story.mission.boss_matka_koreňov.name', type: 'boss' as const },
      ],
    },
    {
      slug: 'kapitola-3-krypty-prvych',
      nameKey: 'story.chapter.k3.name',
      descriptionKey: 'story.chapter.k3.description',
      chapterOrder: 4,
      missions: [
        { slug: 'povod-frakcii', nameKey: 'story.mission.povod_frakcii.name', type: 'exploration' as const },
        { slug: 'zakazane-experimenty', nameKey: 'story.mission.zakazane_experimenty.name', type: 'combat' as const },
        { slug: 'relikvie', nameKey: 'story.mission.relikvie.name', type: 'exploration' as const },
        { slug: 'zrada-spojenca', nameKey: 'story.mission.zrada_spojenca.name', type: 'decision' as const },
        { slug: 'boss_archivar', nameKey: 'story.mission.boss_archivar.name', type: 'boss' as const },
      ],
    },
    {
      slug: 'kapitola-4-mesačne-vrchy',
      nameKey: 'story.chapter.k4.name',
      descriptionKey: 'story.chapter.k4.description',
      chapterOrder: 5,
      missions: [
        { slug: 'obciansky-konflikt', nameKey: 'story.mission.obciansky_konflikt.name', type: 'combat' as const },
        { slug: 'klanske-zaujmy', nameKey: 'story.mission.klanske_zaujmy.name', type: 'dialogue' as const },
        { slug: 'cesta-k-zariadeniu', nameKey: 'story.mission.cesta_k_zariadeniu.name', type: 'exploration' as const },
        { slug: 'boss_strazca_korony', nameKey: 'story.mission.boss_strazca_korony.name', type: 'boss' as const },
      ],
    },
    {
      slug: 'kapitola-5-koruna-zatmenia',
      nameKey: 'story.chapter.k5.name',
      descriptionKey: 'story.chapter.k5.description',
      chapterOrder: 6,
      missions: [
        { slug: 'finalny-utok', nameKey: 'story.mission.finalny_utok.name', type: 'combat' as const },
        { slug: 'frakcne-volby', nameKey: 'story.mission.frakcne_volby.name', type: 'decision' as const },
        { slug: 'zaver-korona', nameKey: 'story.mission.zaver_korona.name', type: 'ending' as const },
      ],
    },
  ],

  bosses: [
    {
      slug: 'pan-stok',
      nameKey: 'boss.pan_stok.name',
      region: 'mesto-bez-svitania',
      titleKey: 'boss.pan_stok.title',
      descriptionKey: 'boss.pan_stok.description',
      level: 15,
      mechanics: ['poison', 'swarm', 'accuracy_reduction'],
    },
    {
      slug: 'matka-koreňov',
      nameKey: 'boss.matka_koreňov.name',
      region: 'cierny-les',
      titleKey: 'boss.matka_koreňov.title',
      descriptionKey: 'boss.matka_koreňov.description',
      level: 25,
      mechanics: ['regeneration', 'roots', 'scaling'],
    },
    {
      slug: 'archivar-bez-tvare',
      nameKey: 'boss.archivar.name',
      region: 'krypty-prvych',
      titleKey: 'boss.archivar.title',
      descriptionKey: 'boss.archivar.description',
      level: 35,
      mechanics: ['skill_copy', 'curses', 'defense_shift'],
    },
    {
      slug: 'strazca-korony',
      nameKey: 'boss.strazca_korony.name',
      region: 'mesacne-vrchy',
      titleKey: 'boss.strazca_korony.title',
      descriptionKey: 'boss.strazca_korony.description',
      level: 45,
      mechanics: ['high_defense', 'phases', 'hp_scaling_attacks'],
    },
  ],

  decisions: [
    {
      key: 'cierny_les_lovit_alebo_chranit',
      missionSlug: 'moralne-rozhodnutie',
      questionKey: 'story.decision.cerny_les.question',
      options: [
        { key: 'lovit', labelKey: 'story.decision.cerny_les.lovit', riskKey: 'story.decision.cerny_les.lovit_risk' },
        { key: 'chranit', labelKey: 'story.decision.cerny_les.chranit', riskKey: 'story.decision.cerny_les.chranit_risk' },
      ],
    },
    {
      key: 'zrada_spojenca',
      missionSlug: 'zrada-spojenca',
      questionKey: 'story.decision.zrada.question',
      options: [
        { key: 'odpustit', labelKey: 'story.decision.zrada.odpustit', riskKey: 'story.decision.zrada.odpustit_risk' },
        { key: 'potrestat', labelKey: 'story.decision.zrada.potrestat', riskKey: 'story.decision.zrada.potrestat_risk' },
      ],
    },
    {
      key: 'frakcne_volby',
      missionSlug: 'frakcne-volby',
      questionKey: 'story.decision.frakcie.question',
      options: [
        { key: 'sangvari', labelKey: 'story.decision.frakcie.sangvari', riskKey: 'story.decision.frakcie.sangvari_risk' },
        { key: 'lunari', labelKey: 'story.decision.frakcie.lunari', riskKey: 'story.decision.frakcie.lunari_risk' },
      ],
    },
  ],

  regions: [
    { slug: 'mesto-bez-svitania', nameKey: 'world.region.mesto.name', levelMin: 1, levelMax: 20 },
    { slug: 'cierny-les', nameKey: 'world.region.cierny_les.name', levelMin: 15, levelMax: 30 },
    { slug: 'krypty-prvych', nameKey: 'world.region.krypty.name', levelMin: 25, levelMax: 40 },
    { slug: 'mesacne-vrchy', nameKey: 'world.region.mesačne_vrchy.name', levelMin: 35, levelMax: 50 },
    { slug: 'krvave-mociare', nameKey: 'world.region.krvave_mociare.name', levelMin: 20, levelMax: 35 },
    { slug: 'pobrezie-prazdnych-lodi', nameKey: 'world.region.pobrezie.name', levelMin: 30, levelMax: 45 },
    { slug: 'koruna-zatmenia', nameKey: 'world.region.koruna.name', levelMin: 45, levelMax: 50 },
  ],

  reputation: {
    organizations: [
      { slug: 'rada-mesta', nameKey: 'reputation.rada.name', descriptionKey: 'reputation.rada.desc' },
      { slug: 'strazcovia-cierneho-lesa', nameKey: 'reputation.strazcovia.name', descriptionKey: 'reputation.strazcovia.desc' },
      { slug: 'archivari-prvych', nameKey: 'reputation.archivari.name', descriptionKey: 'reputation.archivari.desc' },
      { slug: 'mesacna-hliadka', nameKey: 'reputation.mesacna_hliadka.name', descriptionKey: 'reputation.mesacna_hliadka.desc' },
      { slug: 'obchodnici-z-Prítmia', nameKey: 'reputation.obchodnici.name', descriptionKey: 'reputation.obchodnici.desc' },
    ],
    tiers: [
      { nameKey: 'reputation.tier.hostile', minReputation: -1000 },
      { nameKey: 'reputation.tier.unfriendly', minReputation: -500 },
      { nameKey: 'reputation.tier.neutral', minReputation: 0 },
      { nameKey: 'reputation.tier.friendly', minReputation: 500 },
      { nameKey: 'reputation.tier.honored', minReputation: 1000 },
      { nameKey: 'reputation.tier.revered', minReputation: 2500 },
      { nameKey: 'reputation.tier.exalted', minReputation: 5000 },
    ],
  },
} as const

export type StoryChapter = typeof STORY_CONFIG.chapters[number]
export type StoryMission = {
  slug: string
  nameKey: string
  type: string
  repeatable?: boolean
}
export type StoryBoss = typeof STORY_CONFIG.bosses[number]
export type StoryDecision = typeof STORY_CONFIG.decisions[number]
