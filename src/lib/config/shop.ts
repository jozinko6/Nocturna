// ---------------------------------------------------------------------------
// Nocturna — Shop / Merchant Configuration
//
// The shop rotates its stock every 6 hours. Players can also manually
// refresh (costs crystals). Stock is drawn from a pool weighted by rarity.
// ---------------------------------------------------------------------------

import type { Rarity, ItemSlot, ItemTemplate } from './items'
import { allItems } from './items'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShopRotation {
  /** UTC timestamp of when this rotation was generated */
  generatedAt: number
  /** UTC timestamp of when the next rotation begins */
  expiresAt: number
  /** Items currently on sale */
  items: ShopItem[]
}

export interface ShopItem {
  item: ItemTemplate
  /** Discount or markup vs base buyPrice (1.0 = no change) */
  priceMultiplier: number
  /** Stock remaining (-1 = unlimited) */
  stock: number
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export const shopConfig = {
  /** Hours between automatic stock rotations */
  refreshIntervalHours: 6,
  /** Items shown per rotation */
  itemsPerRotation: 6,
  /** Maximum items a player can buy per rotation */
  maxBuysPerRotation: 3,
  /** Crystal cost for a manual refresh */
  manualRefreshCost: 10,
  /** Minimum level before shop unlocks */
  minLevel: 3,

  /** Rarity weights for stock selection (higher = more likely) */
  rarityWeights: {
    common: 40,
    uncommon: 30,
    rare: 18,
    epic: 8,
    legendary: 3,
    cursed: 1,
  } satisfies Record<Rarity, number>,

  /** Price multiplier range by rarity */
  priceMultiplierRange: {
    common: [0.8, 1.2],
    uncommon: [0.85, 1.3],
    rare: [0.9, 1.4],
    epic: [1.0, 1.5],
    legendary: [1.2, 2.0],
    cursed: [0.0, 0.0], // cursed items are not sold
  } satisfies Record<Rarity, [number, number]>,

  /** Slots allowed in the shop (consumables always appear) */
  allowedSlots: [
    'weapon', 'offhand', 'helmet', 'armor', 'gloves',
    'boots', 'amulet', 'ring', 'relic', 'consumable',
  ] as ItemSlot[],
}

// ---------------------------------------------------------------------------
// Rotation generation
// ---------------------------------------------------------------------------

/**
 * Generate a new shop rotation. Uses weighted random selection to pick
 * items from the global item pool.
 */
export function generateShopRotation(): ShopRotation {
  const now = Date.now()
  const durationMs = shopConfig.refreshIntervalHours * 60 * 60 * 1000

  const items: ShopItem[] = []
  const usedIds = new Set<string>()

  // Always include 1-2 consumables
  const consumables = allItems.filter((i) => i.slot === 'consumable')
  for (let i = 0; i < 2 && consumables.length > 0; i++) {
    const idx = Math.floor(Math.random() * consumables.length)
    const item = consumables[idx]
    if (!usedIds.has(item.id)) {
      usedIds.add(item.id)
      items.push({
        item,
        priceMultiplier: 1.0,
        stock: 3,
      })
    }
  }

  // Fill remaining slots from weighted pool
  const pool = allItems.filter(
    (i) => !usedIds.has(i.id) && !i.cursed && i.buyPrice > 0
  )

  while (items.length < shopConfig.itemsPerRotation && pool.length > 0) {
    // Pick rarity first
    const rarityRoll = Math.random() * Object.values(shopConfig.rarityWeights).reduce((a, b) => a + b, 0)
    let cumulative = 0
    let selectedRarity: Rarity = 'common'

    for (const [rarity, weight] of Object.entries(shopConfig.rarityWeights)) {
      cumulative += weight
      if (rarityRoll <= cumulative) {
        selectedRarity = rarity as Rarity
        break
      }
    }

    const candidates = pool.filter((i) => i.rarity === selectedRarity)
    if (candidates.length === 0) continue

    const item = candidates[Math.floor(Math.random() * candidates.length)]
    usedIds.add(item.id)

    // Remove from pool
    const poolIdx = pool.indexOf(item)
    if (poolIdx >= 0) pool.splice(poolIdx, 1)

    // Price multiplier
    const [minMult, maxMult] = shopConfig.priceMultiplierRange[selectedRarity]
    const priceMultiplier = minMult + Math.random() * (maxMult - minMult)

    items.push({
      item,
      priceMultiplier: Math.round(priceMultiplier * 100) / 100,
      stock: selectedRarity === 'legendary' ? 1 : -1,
    })
  }

  return {
    generatedAt: now,
    expiresAt: now + durationMs,
    items,
  }
}

/**
 * Calculate the actual gold cost of a shop item.
 */
export function getShopItemCost(shopItem: ShopItem): number {
  return Math.round(shopItem.item.buyPrice * shopItem.priceMultiplier)
}
