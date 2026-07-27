/**
 * Nocturna — Vertical Slice Seed Script
 *
 * Populates the database with ALL data required for the full vertical slice.
 * Clears existing data first, then inserts in FK-safe order.
 *
 * Usage:  npx tsx scripts/seed-vertical-slice.ts
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { v4 as uuidv4 } from 'uuid'

import * as schema from '../src/lib/db/schema'
import { allItems } from '../src/lib/config/items'

// ---------------------------------------------------------------------------
// Database connection
// ---------------------------------------------------------------------------

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL is not set. Aborting seed.')
  process.exit(1)
}

const client = postgres(dbUrl)
const db = drizzle(client, { schema })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stableId(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0
  }
  const abs = Math.abs(hash)
  return (
    '00000000-0000-4000-8' +
    abs.toString(16).padStart(8, '0').slice(0, 8) +
    '-' +
    uuidv4().slice(13)
  )
}

function jsonb(value: unknown): string {
  return JSON.stringify(value)
}

// ---------------------------------------------------------------------------
// Seed data definitions
// ---------------------------------------------------------------------------

interface FactionSeed {
  id: string
  name: string
  slug: string
  description: string
  passiveEffects: Record<string, number>
  color: string
}

const FACTIONS: FactionSeed[] = [
  {
    id: 'sangvari',
    name: 'Sangvari',
    slug: 'sangvari',
    description:
      'Starobylý krvavý rád, ktorý ovláda umenie manipulácie životnou energiou. ' +
      'Ich precíznosť v boji je legendárna, no ich moc prichádza s cenou — ' +
      'každá kliatba, ktorú uvalia, sa im vráti späť.',
    passiveEffects: { accuracyBonus: 0.05, lifesteal: 0.05, maxHpMultiplier: 0.97 },
    color: '#8B0000',
  },
  {
    id: 'lunari',
    name: 'Lunari',
    slug: 'lunari',
    description:
      'Divoký kmeň viazaný na mesačné sily. Lunari veria v regeneráciu a ' +
      'odolnosť — ich bojovníci sa zotavia z každej rany a v noci sú takmer ' +
      'neporaziteľní. Každá zbraň sa im v rukách mení na osud.',
    passiveEffects: { maxHpMultiplier: 1.05, hpRegenBonus: 0.05, accuracyPenalty: -0.03 },
    color: '#1E3A5F',
  },
]

interface RegionSeed {
  id: string
  name: string
  slug: string
  description: string
  recommendedLevel: number
}

const REGIONS: RegionSeed[] = [
  {
    id: 'r_mesto',
    name: 'Mesto bez svitania',
    slug: 'mesto_bez_svitania',
    description:
      'Mesto, kde slnko nikdy nevychádza. Ulice sú prázdne, okná zatvorené a ' +
      'v každom rohu číha nebezpečenstvo. Páni mesta zmizli pred rokmi a teraz ' +
      'tu vládnu mŕtvi.',
    recommendedLevel: 1,
  },
]

interface EnemySeed {
  id: string
  regionSlug: string
  name: string
  level: number
  hp: number
  atk: number
  def: number
  xp: number
  gold: number
}

const ENEMIES: EnemySeed[] = [
  {
    id: 'e_nocny_zlodej',
    regionSlug: 'mesto_bez_svitania',
    name: 'Nočný zlodej',
    level: 1,
    hp: 80,
    atk: 10,
    def: 3,
    xp: 25,
    gold: 50,
  },
  {
    id: 'e_krvavy_posol',
    regionSlug: 'mesto_bez_svitania',
    name: 'Krvavý posol',
    level: 2,
    hp: 120,
    atk: 14,
    def: 5,
    xp: 35,
    gold: 70,
  },
  {
    id: 'e_tienovy_strazca',
    regionSlug: 'mesto_bez_svitania',
    name: 'Tieňový strážca',
    level: 3,
    hp: 160,
    atk: 18,
    def: 8,
    xp: 50,
    gold: 100,
  },
]

const FACTION_STARTER_ITEMS = [
  {
    id: 'w_sangvari_starter',
    name: 'Ihla červeného úsvitu',
    slug: 'w_sangvari_starter',
    description:
      'Tenká, smrteľne ostrá čepeľ z kalenej ocele. Jej červený lesk pripomína prvý úsvit, ' +
      'ktorý Sangvari nikdy nevidia.',
    type: 'weapon' as const,
    rarity: 'uncommon' as const,
    baseDamage: 8,
    baseDefense: 0,
    statBonus: { weaponDamage: 8, perception: 1 },
    buyPrice: 0,
    sellPrice: 0,
    loreText: 'Každý Sangvari ju dostane pri iniciácii. Čepeľ si vyberá svojho nositeľa.',
    factionSlug: 'sangvari',
  },
  {
    id: 'w_lunari_starter',
    name: 'Tesák mesačnej hliadky',
    slug: 'w_lunari_starter',
    description:
      'Zakrivený tesák z mesačného kameňa, ktorý žiari v tme. Lunari ho nosia pri strážení.',
    type: 'weapon' as const,
    rarity: 'uncommon' as const,
    baseDamage: 8,
    baseDefense: 0,
    statBonus: { weaponDamage: 8, endurance: 1 },
    buyPrice: 0,
    sellPrice: 0,
    loreText: 'Keď mesiac svieti, tesák nikdy neminie. Tak hovoria Lunari.',
    factionSlug: 'lunari',
  },
]

const FEATURE_FLAGS = [
  { key: 'payments', enabled: false },
  { key: 'subscriptions', enabled: false },
  { key: 'rewarded_ads', enabled: false },
  { key: 'clans', enabled: false },
  { key: 'seasons', enabled: false },
  { key: 'auction', enabled: false },
  { key: 'global_chat', enabled: false },
  { key: 'referrals', enabled: false },
  { key: 'experimental_combat', enabled: false },
]

const ECONOMY_CONFIG: { key: string; value: unknown }[] = [
  { key: 'training_base_cost', value: 50 },
  { key: 'training_cost_exponent', value: 1.65 },
  { key: 'xp_base', value: 100 },
  { key: 'xp_exponent', value: 1.45 },
  { key: 'max_energy', value: 100 },
  { key: 'energy_regen_rate', value: 1 },
  { key: 'energy_regen_interval_minutes', value: 6 },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('╔═══════════════════════════════════════════╗')
  console.log('║  Nocturna — Vertical Slice Seed Script   ║')
  console.log('╚═══════════════════════════════════════════╝')
  console.log()

  // ── Clear existing data (FK-safe order) ────────────────────────────────
  console.log('▸ Clearing existing data...')

  const tablesInOrder = [
    'currency_ledger',
    'currencies',
    'rewarded_ad_claims',
    'leaderboards',
    'notifications',
    'daily_rewards',
    'activity_rewards',
    'activities',
    'expeditions',
    'battle_reports',
    'pvp_matches',
    'pvp_ratings',
    'missions',
    'equipment_slots',
    'character_items',
    'character_resources',
    'character_stats',
    'hideout_buildings',
    'hideouts',
    'characters',
    'profiles',
    'admin_audit_logs',
    'security_events',
    'purchases',
    'subscriptions',
    'payment_events',
    'enemies',
    'item_templates',
    'regions',
    'factions',
    'feature_flags',
    'economy_config',
    'users',
  ]

  for (const table of tablesInOrder) {
    await client.unsafe(`DELETE FROM "${table}"`)
  }
  console.log(`  ✓ Cleared ${tablesInOrder.length} tables`)

  // ── Factions ───────────────────────────────────────────────────────────
  console.log('▸ Seeding factions...')
  const factionIds: Record<string, string> = {}

  for (const faction of FACTIONS) {
    const id = stableId(`faction:${faction.id}`)
    factionIds[faction.slug] = id

    await db
      .insert(schema.factions)
      .values({
        id,
        name: faction.name,
        slug: faction.slug,
        description: faction.description,
        passiveBonuses: jsonb({
          ...faction.passiveEffects,
          color: faction.color,
        }),
      })
      .onConflictDoNothing({ target: schema.factions.slug })
  }
  console.log(`  ✓ ${FACTIONS.length} factions (${Object.keys(factionIds).join(', ')})`)

  // ── Regions ────────────────────────────────────────────────────────────
  console.log('▸ Seeding regions...')
  const regionIds: Record<string, string> = {}

  for (const region of REGIONS) {
    const id = stableId(`region:${region.id}`)
    regionIds[region.slug] = id

    await db
      .insert(schema.regions)
      .values({
        id,
        name: region.name,
        slug: region.slug,
        description: region.description,
        recommendedLevel: region.recommendedLevel,
      })
      .onConflictDoNothing({ target: schema.regions.slug })
  }
  console.log(`  ✓ ${REGIONS.length} regions (${Object.keys(regionIds).join(', ')})`)

  // ── Enemies ────────────────────────────────────────────────────────────
  console.log('▸ Seeding enemies...')

  for (const enemy of ENEMIES) {
    const id = stableId(`enemy:${enemy.id}`)
    const regionId = regionIds[enemy.regionSlug]

    if (!regionId) {
      console.warn(`  ⚠ Skipping enemy ${enemy.id}: region ${enemy.regionSlug} not found`)
      continue
    }

    await db
      .insert(schema.enemies)
      .values({
        id,
        regionId,
        name: enemy.name,
        level: enemy.level,
        baseHp: enemy.hp,
        baseAttack: enemy.atk,
        baseDefense: enemy.def,
        baseXp: enemy.xp,
        baseGold: enemy.gold,
        lootTable: jsonb([]),
      })
      .onConflictDoNothing()
  }
  console.log(`  ✓ ${ENEMIES.length} enemies`)

  // ── Item Templates (from config) ──────────────────────────────────────
  console.log('▸ Seeding item templates from config...')

  const slotToType: Record<string, string> = {
    weapon: 'weapon',
    offhand: 'offhand',
    helmet: 'helmet',
    armor: 'armor',
    gloves: 'gloves',
    boots: 'boots',
    amulet: 'amulet',
    ring: 'ring',
    relic: 'relic',
    consumable: 'consumable',
  }

  for (const item of allItems) {
    const id = stableId(`item:${item.id}`)

    await db
      .insert(schema.itemTemplates)
      .values({
        id,
        name: item.name,
        slug: item.id,
        description: item.description,
        type: slotToType[item.slot] as any,
        rarity: item.rarity,
        requiredLevel: 1,
        baseDamage: item.stats.weaponDamage ?? 0,
        baseDefense: item.stats.armor ?? 0,
        statBonus: jsonb(item.stats),
        secondaryEffect: item.cursed
          ? jsonb({ pro: item.cursedPro, con: item.cursedCon })
          : null,
        factionRestriction: item.factionRestricted
          ? factionIds[item.factionRestricted] ?? null
          : null,
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
        loreText: item.lore,
        isTradeable: !item.cursed,
      })
      .onConflictDoNothing({ target: schema.itemTemplates.slug })
  }
  console.log(`  ✓ ${allItems.length} config item templates`)

  // ── Faction Starter Items ──────────────────────────────────────────────
  console.log('▸ Seeding faction starter items...')

  for (const item of FACTION_STARTER_ITEMS) {
    const id = stableId(`item:${item.id}`)
    const factionId = factionIds[item.factionSlug] ?? null

    await db
      .insert(schema.itemTemplates)
      .values({
        id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        type: item.type,
        rarity: item.rarity,
        requiredLevel: 1,
        baseDamage: item.baseDamage,
        baseDefense: item.baseDefense,
        statBonus: jsonb(item.statBonus),
        secondaryEffect: null,
        factionRestriction: factionId,
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
        loreText: item.loreText,
        isTradeable: true,
      })
      .onConflictDoNothing({ target: schema.itemTemplates.slug })
  }
  console.log(`  ✓ ${FACTION_STARTER_ITEMS.length} faction starter items`)

  // ── Feature Flags ──────────────────────────────────────────────────────
  console.log('▸ Seeding feature flags...')

  for (const flag of FEATURE_FLAGS) {
    await db
      .insert(schema.featureFlags)
      .values({
        id: stableId(`flag:${flag.key}`),
        key: flag.key,
        enabled: flag.enabled,
        config: jsonb({ description: `Vertical slice flag: ${flag.key}` }),
      })
      .onConflictDoNothing({ target: schema.featureFlags.key })
  }
  console.log(`  ✓ ${FEATURE_FLAGS.length} feature flags (all disabled)`)

  // ── Economy Config ─────────────────────────────────────────────────────
  console.log('▸ Seeding economy config...')

  for (const entry of ECONOMY_CONFIG) {
    await db
      .insert(schema.economyConfig)
      .values({
        id: stableId(`econfig:${entry.key}`),
        key: entry.key,
        value: jsonb(entry.value),
        version: 1,
      })
      .onConflictDoNothing({ target: schema.economyConfig.key })
  }
  console.log(`  ✓ ${ECONOMY_CONFIG.length} economy config entries`)

  // ── Summary ────────────────────────────────────────────────────────────
  console.log()
  console.log('╔═══════════════════════════════════════════╗')
  console.log('║       Vertical slice seed complete! ✓     ║')
  console.log('╠═══════════════════════════════════════════╣')
  console.log(`║  Factions:    ${FACTIONS.length}                            ║`)
  console.log(`║  Regions:     ${REGIONS.length}                              ║`)
  console.log(`║  Enemies:     ${ENEMIES.length}                              ║`)
  console.log(`║  Items:       ${allItems.length + FACTION_STARTER_ITEMS.length} (config + faction)       ║`)
  console.log(`║  Flags:       ${FEATURE_FLAGS.length} (disabled)                 ║`)
  console.log(`║  Economy:     ${ECONOMY_CONFIG.length} entries                    ║`)
  console.log('╚═══════════════════════════════════════════╝')

  await client.end()
}

main().catch((err) => {
  console.error('Seed failed:', err)
  client.end().catch(() => {})
  process.exit(1)
})
