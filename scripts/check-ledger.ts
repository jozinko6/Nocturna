/**
 * Nocturna — Economy Audit Script (Ledger Check)
 *
 * For each character, sums all currency_ledger entries per currency type
 * and compares with characters.gold / characters.premium_currency.
 * Reports any discrepancies.
 *
 * Usage:  npx tsx scripts/check-ledger.ts
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'

import * as schema from '../src/lib/db/schema'

// ---------------------------------------------------------------------------
// Database connection
// ---------------------------------------------------------------------------

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL is not set. Aborting.')
  process.exit(1)
}

const db = drizzle(dbUrl)

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface Discrepancy {
  characterName: string
  characterId: string
  currencyType: string
  ledgerSum: number
  storedBalance: number
  difference: number
}

async function main() {
  console.log('═══════════════════════════════════════')
  console.log('   Nocturna — Economy Audit (Ledger)  ')
  console.log('═══════════════════════════════════════')
  console.log()

  // Fetch all characters with their stored balances
  const characters = await db
    .select({
      id: schema.characters.id,
      name: schema.characters.name,
      gold: schema.characters.gold,
      premiumCurrency: schema.characters.premiumCurrency,
    })
    .from(schema.characters)

  // Fetch all ledger entries grouped by character + currency
  const ledgerSums = await db
    .select({
      characterId: schema.currencyLedger.characterId,
      currencyType: schema.currencyLedger.currencyType,
      totalDelta: sql<number>`COALESCE(SUM(${schema.currencyLedger.changeAmount}), 0)`,
      entryCount: sql<number>`COUNT(*)`,
    })
    .from(schema.currencyLedger)
    .groupBy(schema.currencyLedger.characterId, schema.currencyLedger.currencyType)

  const ledgerMap = new Map<string, { delta: number; count: number }>()
  for (const l of ledgerSums) {
    ledgerMap.set(`${l.characterId}:${l.currencyType}`, {
      delta: Number(l.totalDelta),
      count: Number(l.entryCount),
    })
  }

  // Check for discrepancies
  const discrepancies: Discrepancy[] = []

  for (const char of characters) {
    // Check gold (ledger tracks gold delta from starting 200)
    const goldLedger = ledgerMap.get(`${char.id}:gold`)
    if (goldLedger) {
      const expectedGold = 200 + goldLedger.delta
      if (expectedGold !== char.gold) {
        discrepancies.push({
          characterName: char.name,
          characterId: char.id,
          currencyType: 'gold',
          ledgerSum: goldLedger.delta,
          storedBalance: char.gold,
          difference: char.gold - expectedGold,
        })
      }
    } else if (char.gold !== 200) {
      discrepancies.push({
        characterName: char.name,
        characterId: char.id,
        currencyType: 'gold',
        ledgerSum: 0,
        storedBalance: char.gold,
        difference: char.gold - 200,
      })
    }

    // Check premium crystals
    const crystalLedger = ledgerMap.get(`${char.id}:premium_crystals`)
    if (crystalLedger) {
      const expectedCrystals = 0 + crystalLedger.delta
      if (expectedCrystals !== char.premiumCurrency) {
        discrepancies.push({
          characterName: char.name,
          characterId: char.id,
          currencyType: 'premium_crystals',
          ledgerSum: crystalLedger.delta,
          storedBalance: char.premiumCurrency,
          difference: char.premiumCurrency - expectedCrystals,
        })
      }
    } else if (char.premiumCurrency !== 0) {
      discrepancies.push({
        characterName: char.name,
        characterId: char.id,
        currencyType: 'premium_crystals',
        ledgerSum: 0,
        storedBalance: char.premiumCurrency,
        difference: char.premiumCurrency,
      })
    }
  }

  // ── Report ──────────────────────────────────────────────────────────
  console.log(`  Characters checked: ${characters.length}`)
  console.log(`  Ledger entries:     ${ledgerSums.reduce((s, l) => s + Number(l.entryCount), 0)}`)
  console.log()

  if (discrepancies.length === 0) {
    console.log('  ✓ No discrepancies found. All balances match ledger sums.')
    console.log()
  } else {
    console.log(`  ✗ ${discrepancies.length} discrepancies found:`)
    console.log()

    for (const d of discrepancies) {
      console.log(`  Character: ${d.characterName} (${d.characterId})`)
      console.log(`  Currency:  ${d.currencyType}`)
      console.log(`  Ledger delta:  ${d.ledgerSum}`)
      console.log(`  Stored balance: ${d.storedBalance}`)
      console.log(`  Difference:     ${d.difference > 0 ? '+' : ''}${d.difference}`)
      console.log()
    }
  }

  // ── Per-character summary ───────────────────────────────────────────
  console.log('── Per-Character Balance Summary ──')
  console.log()

  for (const char of characters) {
    const goldLedger = ledgerMap.get(`${char.id}:gold`)
    const crystalLedger = ledgerMap.get(`${char.id}:premium_crystals`)

    console.log(`  ${char.name}:`)
    console.log(`    gold: balance=${char.gold}, ledger_delta=${goldLedger?.delta ?? 0}, entries=${goldLedger?.count ?? 0}`)
    console.log(`    crystals: balance=${char.premiumCurrency}, ledger_delta=${crystalLedger?.delta ?? 0}, entries=${crystalLedger?.count ?? 0}`)
    console.log()
  }

  console.log('═══════════════════════════════════════')
  console.log(`  Audit complete. ${discrepancies.length} issues found.`)
  console.log('═══════════════════════════════════════')
}

main().catch((err) => {
  console.error('Audit failed:', err)
  process.exit(1)
})
