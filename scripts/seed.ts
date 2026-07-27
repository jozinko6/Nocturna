/**
 * Nocturna — Database Seed Script
 *
 * Populates the local database with game data from the config files.
 * Creates: factions, regions, enemies, item templates, daily quest
 * templates, hideout buildings, economy config, feature flags, and
 * (in development) two demo accounts.
 *
 * Usage:  npx tsx scripts/seed.ts
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

import * as schema from '../src/lib/db/schema'
import { factions as factionConfigs } from '../src/lib/config/factions'
import { regions as regionConfigs } from '../src/lib/config/regions'
import { allEnemies } from '../src/lib/config/enemies'
import { allItems } from '../src/lib/config/items'
import { dailyQuestTemplates } from '../src/lib/config/daily-quests'
import { buildings } from '../src/lib/config/hideout'
import {
  TRAINING_BASE_COST, TRAINING_COST_EXPONENT,
  XP_BASE, XP_LINEAR,
  ENERGY_REGEN_RATE, ENERGY_REGEN_INTERVAL_MINUTES, BASE_MAX_ENERGY,
  PVP_MIN_LEVEL, PVP_COOLDOWN_SECONDS, PVP_XP_REWARD, PVP_GOLD_REWARD,
} from '../src/game/config'

// ---------------------------------------------------------------------------
// Database connection
// ---------------------------------------------------------------------------

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL is not set. Aborting seed.')
  process.exit(1)
}

const db = drizzle(dbUrl, { schema })

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
// Seed data
// ---------------------------------------------------------------------------

async function main() {
  console.log('╔══════════════════════════════════════╗')
  console.log('║   Nocturna — Database Seed Script   ║')
  console.log('╚══════════════════════════════════════╝')
  console.log()

  // ── Factions ──────────────────────────────────────────────────────────
  console.log('▸ Seeding factions...')
  const factionIds: Record<string, string> = {}

  for (const cfg of Object.values(factionConfigs)) {
    const id = stableId(`faction:${cfg.id}`)
    factionIds[cfg.id] = id

    await db
      .insert(schema.factions)
      .values({
        id,
        name: cfg.name,
        slug: cfg.id,
        description: cfg.lore,
        passiveBonuses: jsonb(cfg.passives),
        iconUrl: null,
      })
      .onConflictDoNothing({ target: schema.factions.slug })
  }
  console.log(`  ✓ ${Object.keys(factionIds).length} factions`)

  // ── Regions ───────────────────────────────────────────────────────────
  console.log('▸ Seeding regions...')
  const regionIds: Record<string, string> = {}

  for (const cfg of regionConfigs) {
    const id = stableId(`region:${cfg.id}`)
    regionIds[cfg.id] = id

    await db
      .insert(schema.regions)
      .values({
        id,
        name: cfg.name,
        slug: cfg.id,
        description: cfg.description,
        recommendedLevel: cfg.recommendedLevel[0],
        iconUrl: null,
      })
      .onConflictDoNothing({ target: schema.regions.slug })
  }
  console.log(`  ✓ ${Object.keys(regionIds).length} regions`)

  // ── Enemies ───────────────────────────────────────────────────────────
  console.log('▸ Seeding enemies...')

  for (const enemy of allEnemies) {
    const id = stableId(`enemy:${enemy.id}`)
    const regionId = regionIds[enemy.regionId]

    if (!regionId) {
      console.warn(`  ⚠ Skipping enemy ${enemy.id}: region ${enemy.regionId} not found`)
      continue
    }

    const avgLevel = Math.round((enemy.levelRange[0] + enemy.levelRange[1]) / 2)
    const avgHp = 100 + enemy.baseStats.endurance * 18 + avgLevel * 12
    const avgAtk = enemy.weaponDamage + enemy.baseStats.strength * 2.2 + avgLevel * 1.5
    const avgDef = enemy.armor + enemy.baseStats.endurance * 1.7

    await db
      .insert(schema.enemies)
      .values({
        id,
        regionId,
        name: enemy.name,
        level: avgLevel,
        baseHp: Math.round(avgHp),
        baseAttack: Math.round(avgAtk),
        baseDefense: Math.round(avgDef),
        baseXp: Math.round((enemy.xpReward[0] + enemy.xpReward[1]) / 2),
        baseGold: Math.round((enemy.goldReward[0] + enemy.goldReward[1]) / 2),
        lootTable: jsonb(enemy.lootTable),
        portraitUrl: null,
      })
      .onConflictDoNothing()
  }
  console.log(`  ✓ ${allEnemies.length} enemies`)

  // ── Item Templates ────────────────────────────────────────────────────
  console.log('▸ Seeding item templates...')

  for (const item of allItems) {
    const id = stableId(`item:${item.id}`)

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

    const requiredLevel = item.rarity === 'common' ? 1
      : item.rarity === 'uncommon' ? 5
      : item.rarity === 'rare' ? 10
      : item.rarity === 'epic' ? 18
      : item.rarity === 'legendary' ? 25
      : item.rarity === 'cursed' ? 15
      : 1

    await db
      .insert(schema.itemTemplates)
      .values({
        id,
        name: item.name,
        slug: item.id,
        description: item.description,
        type: slotToType[item.slot] as any,
        rarity: item.rarity,
        requiredLevel,
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
        iconUrl: null,
        loreText: item.lore,
        isTradeable: !item.cursed,
      })
      .onConflictDoNothing({ target: schema.itemTemplates.slug })
  }
  console.log(`  ✓ ${allItems.length} item templates`)

  // ── Daily Quest Templates (stored as economy config entries) ──────────
  console.log('▸ Seeding daily quest templates...')

  await db
    .insert(schema.economyConfig)
    .values({
      id: stableId('econfig:daily_quests'),
      key: 'daily_quest_templates',
      value: jsonb(dailyQuestTemplates),
      version: 1,
    })
    .onConflictDoNothing({ target: schema.economyConfig.key })

  console.log(`  ✓ ${dailyQuestTemplates.length} daily quest templates`)

  // ── Hideout Building Configs (stored as economy config) ───────────────
  console.log('▸ Seeding hideout building configs...')

  await db
    .insert(schema.economyConfig)
    .values({
      id: stableId('econfig:hideout_buildings'),
      key: 'hideout_building_configs',
      value: jsonb(buildings),
      version: 1,
    })
    .onConflictDoNothing({ target: schema.economyConfig.key })

  console.log(`  ✓ ${buildings.length} hideout buildings`)

  // ── Economy Config ────────────────────────────────────────────────────
  console.log('▸ Seeding economy config...')

  const economyEntries: { key: string; value: unknown }[] = [
    { key: 'training_costs', value: {
      baseCost: TRAINING_BASE_COST,
      exponent: TRAINING_COST_EXPONENT,
    }},
    { key: 'xp_curve', value: {
      base: XP_BASE,
      linear: XP_LINEAR,
    }},
    { key: 'energy_config', value: {
      regenRate: ENERGY_REGEN_RATE,
      regenIntervalMinutes: ENERGY_REGEN_INTERVAL_MINUTES,
      baseMaxEnergy: BASE_MAX_ENERGY,
    }},
    { key: 'pvp_config', value: {
      minLevel: PVP_MIN_LEVEL,
      cooldownSeconds: PVP_COOLDOWN_SECONDS,
      xpReward: PVP_XP_REWARD,
      goldReward: PVP_GOLD_REWARD,
    }},
  ]

  for (const entry of economyEntries) {
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
  console.log(`  ✓ ${economyEntries.length} economy config entries`)

  // ── Feature Flags ─────────────────────────────────────────────────────
  console.log('▸ Seeding feature flags...')

  const mvpFlags = [
    'pve_expeditions',
    'pvp_arena',
    'daily_quests',
    'daily_rewards',
    'hideout',
    'training',
    'shop',
    'inventory',
    'equipment',
    'leaderboard',
    'notifications',
    'premium_shop',
    'membership',
    'email_notifications',
    'admin_panel',
  ]

  for (const flag of mvpFlags) {
    await db
      .insert(schema.featureFlags)
      .values({
        id: stableId(`flag:${flag}`),
        key: flag,
        enabled: true,
        config: jsonb({ description: `MVP flag: ${flag}` }),
      })
      .onConflictDoNothing({ target: schema.featureFlags.key })
  }
  console.log(`  ✓ ${mvpFlags.length} feature flags (all enabled)`)

  // ── Demo Accounts (development only) ──────────────────────────────────
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    console.log('▸ Creating demo accounts (development mode)...')

    // Demo user 1 — Sangvari warrior
    const userId1 = stableId('demo:user:valeria')
    const characterId1 = stableId('demo:char:valeria')

    await db
      .insert(schema.users)
      .values({
        id: userId1,
        email: 'valeria@nocturna.dev',
        emailVerified: true,
        role: 'administrator',
      })
      .onConflictDoNothing({ target: schema.users.email })

    await db
      .insert(schema.profiles)
      .values({
        id: stableId('demo:profile:valeria'),
        userId: userId1,
        displayName: 'Valeria Krvavá',
        language: 'sk',
      })
      .onConflictDoNothing()

    await db
      .insert(schema.characters)
      .values({
        id: characterId1,
        userId: userId1,
        factionId: factionIds['sangvari'],
        name: 'Valeria Krvavá',
        level: 15,
        experience: 38000,
        gold: 12500,
        premiumCurrency: 150,
        pvpRating: 1350,
        pvpWins: 42,
        pvpLosses: 18,
        title: 'Krvavá princezná',
      })
      .onConflictDoNothing()

    await db
      .insert(schema.characterStats)
      .values({
        id: stableId('demo:stats:valeria'),
        characterId: characterId1,
        strength: 18,
        dexterity: 12,
        endurance: 14,
        perception: 10,
        willpower: 8,
        luck: 6,
      })
      .onConflictDoNothing()

    await db
      .insert(schema.characterResources)
      .values({
        id: stableId('demo:resources:valeria'),
        characterId: characterId1,
        currentEnergy: 85,
        maxEnergy: 100,
        hitPoints: 200,
        maxHitPoints: 200,
      })
      .onConflictDoNothing()

    console.log('  ✓ Valeria Krvavá (Sangvari, Lvl 15)')

    // Demo user 2 — Lunari ranger
    const userId2 = stableId('demo:user:lunaris')
    const characterId2 = stableId('demo:char:lunaris')

    await db
      .insert(schema.users)
      .values({
        id: userId2,
        email: 'lunaris@nocturna.dev',
        emailVerified: true,
        role: 'support',
      })
      .onConflictDoNothing({ target: schema.users.email })

    await db
      .insert(schema.profiles)
      .values({
        id: stableId('demo:profile:lunaris'),
        userId: userId2,
        displayName: 'Lunaris Mesáčny',
        language: 'sk',
      })
      .onConflictDoNothing()

    await db
      .insert(schema.characters)
      .values({
        id: characterId2,
        userId: userId2,
        factionId: factionIds['lunari'],
        name: 'Lunaris Mesáčny',
        level: 12,
        experience: 22000,
        gold: 8200,
        premiumCurrency: 50,
        pvpRating: 1180,
        pvpWins: 28,
        pvpLosses: 22,
        title: 'Strážca vrchov',
      })
      .onConflictDoNothing()

    await db
      .insert(schema.characterStats)
      .values({
        id: stableId('demo:stats:lunaris'),
        characterId: characterId2,
        strength: 10,
        dexterity: 16,
        endurance: 12,
        perception: 14,
        willpower: 6,
        luck: 8,
      })
      .onConflictDoNothing()

    await db
      .insert(schema.characterResources)
      .values({
        id: stableId('demo:resources:lunaris'),
        characterId: characterId2,
        currentEnergy: 100,
        maxEnergy: 100,
        hitPoints: 180,
        maxHitPoints: 180,
      })
      .onConflictDoNothing()

    console.log('  ✓ Lunaris Mesáčny (Lunari, Lvl 12)')
  }

  console.log()
  console.log('╔══════════════════════════════════════╗')
  console.log('║         Seed complete! ✓             ║')
  console.log('╚══════════════════════════════════════╝')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
