/**
 * Nocturna — Combat Simulation Script
 *
 * Simulates 10,000 battles between two characters with different builds
 * to test the combat engine balance. Tracks win rates, average rounds,
 * critical hit rates, and block rates.
 *
 * Usage:  npx tsx scripts/simulate-combat.ts
 */

import { simulateBattle, type CombatRound } from '../src/game/combat'
import { createRng, generateSeed } from '../src/game/rng'
import { createPlayerSnapshot, createEnemySnapshot, type CombatantSnapshot } from '../src/game/snapshot'

// ---------------------------------------------------------------------------
// Character Builds
// ---------------------------------------------------------------------------

interface Build {
  name: string
  snapshot: () => CombatantSnapshot
}

const builds: Build[] = [
  {
    name: 'Valeria — Sangvari Warrior (STR/END)',
    snapshot: () => createPlayerSnapshot(
      'valeria', 'Valeria', 15,
      { strength: 18, dexterity: 12, endurance: 14, perception: 10, willpower: 8, luck: 6 },
      { weapon: { base_damage: 22 }, armor: { base_defense: 14 } },
      280, 280,
    ),
  },
  {
    name: 'Lunaris — Lunari Ranger (DEX/PER)',
    snapshot: () => createPlayerSnapshot(
      'lunaris', 'Lunaris', 15,
      { strength: 10, dexterity: 16, endurance: 12, perception: 14, willpower: 6, luck: 8 },
      { weapon: { base_damage: 18 }, armor: { base_defense: 10 } },
      230, 230,
    ),
  },
  {
    name: 'Kováč — Balanced Build',
    snapshot: () => createPlayerSnapshot(
      'kovac', 'Kováč', 15,
      { strength: 13, dexterity: 13, endurance: 13, perception: 13, willpower: 13, luck: 13 },
      { weapon: { base_damage: 20 }, armor: { base_defense: 12 } },
      250, 250,
    ),
  },
  {
    name: 'Assassin — Glass Cannon (DEX/LCK)',
    snapshot: () => createPlayerSnapshot(
      'assassin', 'Assassin', 15,
      { strength: 8, dexterity: 20, endurance: 8, perception: 12, willpower: 5, luck: 18 },
      { weapon: { base_damage: 26 }, armor: { base_defense: 6 } },
      160, 160,
    ),
  },
  {
    name: 'Tank — HP Stack (END/STR)',
    snapshot: () => createPlayerSnapshot(
      'tank', 'Tank', 15,
      { strength: 14, dexterity: 6, endurance: 22, perception: 6, willpower: 5, luck: 8 },
      { weapon: { base_damage: 16 }, armor: { base_defense: 20 } },
      480, 480,
    ),
  },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SimResult {
  wins: number
  losses: number
  draws: number
  totalRounds: number
  critHitsAttacker: number
  critHitsDefender: number
  blocksAttacker: number
  blocksDefender: number
  totalAttackerDamage: number
  totalDefenderDamage: number
}

function emptyResult(): SimResult {
  return {
    wins: 0, losses: 0, draws: 0,
    totalRounds: 0,
    critHitsAttacker: 0, critHitsDefender: 0,
    blocksAttacker: 0, blocksDefender: 0,
    totalAttackerDamage: 0, totalDefenderDamage: 0,
  }
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

function simulatePair(a: Build, b: Build, rounds: number): { aResult: SimResult; bResult: SimResult } {
  const aResult = emptyResult()
  const bResult = emptyResult()

  for (let i = 0; i < rounds; i++) {
    const seed = i * 1000 + 1
    const rng = createRng(seed)
    const snapshotA = a.snapshot()
    const snapshotB = b.snapshot()
    const report = simulateBattle(snapshotA, snapshotB, rng)

    if (report.winner === 'attacker') {
      aResult.wins++
      bResult.losses++
    } else {
      aResult.losses++
      bResult.wins++
    }

    aResult.totalRounds += report.rounds.length
    bResult.totalRounds += report.rounds.length
    aResult.totalAttackerDamage += report.totalAttackerDamage
    bResult.totalDefenderDamage += report.totalDefenderDamage

    for (const round of report.rounds) {
      if (round.attackerCrit) aResult.critHitsAttacker++
      if (round.defenderCrit) bResult.critHitsDefender++
      if (round.attackerBlocked) bResult.blocksDefender++
      if (round.defenderBlocked) aResult.blocksAttacker++
    }
  }

  return { aResult, bResult }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const SIMULATION_COUNT = 10_000

console.log('═══════════════════════════════════════════════')
console.log('   Nocturna — Combat Simulation Engine       ')
console.log('═══════════════════════════════════════════════')
console.log(`  Simulations per matchup: ${SIMULATION_COUNT.toLocaleString()}`)
console.log()

// ── Derived stats preview ──────────────────────────────────────────────
console.log('── Snapshot Preview ──')
for (const build of builds) {
  const s = build.snapshot()
  console.log(`  ${build.name}`)
  console.log(`    HP: ${s.maxHp}  ATK: ${s.minDamage}-${s.maxDamage}  BLK: ${s.blockChance.toFixed(1)}%  CRIT: ${s.critChance.toFixed(1)}%`)
}
console.log()

// ── Head-to-head matchups ──────────────────────────────────────────────
console.log('── Head-to-Head Matchups ──')
console.log()

const results: Record<string, Record<string, { winsA: number; winsB: number }>> = {}

for (let i = 0; i < builds.length; i++) {
  for (let j = i + 1; j < builds.length; j++) {
    const a = builds[i]
    const b = builds[j]

    const { aResult, bResult } = simulatePair(a, b, SIMULATION_COUNT)

    const aWinRate = (aResult.wins / SIMULATION_COUNT * 100).toFixed(1)
    const bWinRate = (bResult.wins / SIMULATION_COUNT * 100).toFixed(1)
    const avgRounds = ((aResult.totalRounds + bResult.totalRounds) / SIMULATION_COUNT).toFixed(1)

    console.log(`  ${a.name}  vs  ${b.name}`)
    console.log(`    Win rate:  ${aWinRate}%  /  ${bWinRate}%`)
    console.log(`    Avg rounds: ${avgRounds}`)

    if (!results[a.name]) results[a.name] = {}
    if (!results[b.name]) results[b.name] = {}
    results[a.name][b.name] = { winsA: aResult.wins, winsB: bResult.wins }
    results[b.name][a.name] = { winsA: bResult.wins, winsB: aResult.wins }

    console.log()
  }
}

// ── Overall Build Rankings ─────────────────────────────────────────────
console.log('── Overall Build Rankings ──')
console.log()

interface BuildStats {
  name: string
  totalWins: number
  totalLosses: number
  winRate: number
}

const rankings: BuildStats[] = builds.map((build) => {
  let totalWins = 0
  let totalLosses = 0

  for (const other of builds) {
    if (other.name === build.name) continue
    const match = results[build.name]?.[other.name]
    if (match) {
      totalWins += match.winsA
      totalLosses += match.winsB
    }
  }

  const total = totalWins + totalLosses
  return {
    name: build.name,
    totalWins,
    totalLosses,
    winRate: total > 0 ? (totalWins / total * 100) : 0,
  }
})

rankings.sort((a, b) => b.winRate - a.winRate)

for (const rank of rankings) {
  const bar = '█'.repeat(Math.round(rank.winRate / 5))
  console.log(`  ${rank.winRate.toFixed(1).padStart(5)}%  ${bar}  ${rank.name}`)
}

console.log()

// ── Summary ────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════')
console.log('  Simulation complete. All builds tested.')
console.log('  If win rates cluster near 50%, the combat')
console.log('  engine is balanced for current stat weights.')
console.log('═══════════════════════════════════════════════')
