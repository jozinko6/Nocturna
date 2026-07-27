'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { shopConfig, getShopItemCost, type ShopItem } from '@/lib/config/shop'
import { allItems } from '@/lib/config/items'
import type { Rarity } from '@/lib/config/items'

const buyItemSchema = z.object({
  shopItemId: z.string().min(1, 'Invalid shop item ID'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
})

const sellItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
})

const REFRESH_MS = shopConfig.refreshIntervalHours * 60 * 60 * 1000

function getTimeWindow(): { start: Date; end: Date; seed: number } {
  const now = Date.now()
  const windowIndex = Math.floor(now / REFRESH_MS)
  const start = new Date(windowIndex * REFRESH_MS)
  const end = new Date((windowIndex + 1) * REFRESH_MS)
  return { start, end, seed: windowIndex }
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function generateShopRotation(seed: number): ShopItem[] {
  const rand = seededRandom(seed)
  const eligible = allItems.filter(
    i => !i.cursed && i.buyPrice > 0,
  )

  const pool: ShopItem[] = []
  const usedIds = new Set<string>()

  const consumables = eligible.filter(i => i.slot === 'consumable')
  for (let i = 0; i < 2 && consumables.length > 0; i++) {
    const idx = Math.floor(rand() * consumables.length)
    const item = consumables[idx]
    if (!usedIds.has(item.id)) {
      usedIds.add(item.id)
      pool.push({ item, priceMultiplier: 1.0, stock: 3 })
    }
  }

  while (pool.length < shopConfig.itemsPerRotation && eligible.length > usedIds.size) {
    const rarityRoll = rand() * Object.values(shopConfig.rarityWeights).reduce((a, b) => a + b, 0)
    let cumulative = 0
    let selectedRarity: Rarity = 'common'

    for (const [rarity, weight] of Object.entries(shopConfig.rarityWeights)) {
      cumulative += weight
      if (rarityRoll <= cumulative) {
        selectedRarity = rarity as Rarity
        break
      }
    }

    const candidates = eligible.filter(i => i.rarity === selectedRarity && !usedIds.has(i.id))
    if (candidates.length === 0) continue

    const item = candidates[Math.floor(rand() * candidates.length)]
    usedIds.add(item.id)

    const [minMult, maxMult] = shopConfig.priceMultiplierRange[selectedRarity]
    const priceMultiplier = minMult + rand() * (maxMult - minMult)

    pool.push({
      item,
      priceMultiplier: Math.round(priceMultiplier * 100) / 100,
      stock: selectedRarity === 'legendary' ? 1 : -1,
    })
  }

  return pool
}

export async function getShopStock() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, level')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    if (character.level < shopConfig.minLevel) {
      return { success: false, error: `Shop unlocks at level ${shopConfig.minLevel}` }
    }

    const timeWindow = getTimeWindow()
    const stock = generateShopRotation(timeWindow.seed)

    return {
      success: true,
      data: {
        stock: stock.map(s => ({
          id: s.item.id,
          name: s.item.name,
          slot: s.item.slot,
          rarity: s.item.rarity,
          buyPrice: getShopItemCost(s),
          priceMultiplier: s.priceMultiplier,
          stock: s.stock,
        })),
        refreshTime: timeWindow.end.toISOString(),
        timeRemaining: timeWindow.end.getTime() - Date.now(),
        maxBuysPerRotation: shopConfig.maxBuysPerRotation,
      },
    }
  } catch (error) {
    console.error('Get shop stock error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function buyItem(shopItemId: string, idempotencyKey: string) {
  try {
    const validated = buyItemSchema.safeParse({ shopItemId, idempotencyKey })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, gold')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const { data: existingLedger } = await supabase
      .from('currency_ledger')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()
    if (existingLedger) return { success: false, error: 'Request already processed' }

    const template = allItems.find(i => i.id === shopItemId)
    if (!template) return { success: false, error: 'Item not found in shop' }

    const timeWindow = getTimeWindow()
    const stock = generateShopRotation(timeWindow.seed)
    const shopItem = stock.find(s => s.item.id === shopItemId)
    if (!shopItem) return { success: false, error: 'Item not in current shop rotation' }

    if (shopItem.stock === 0) return { success: false, error: 'Item out of stock' }

    const finalPrice = getShopItemCost(shopItem)

    if (character.gold < finalPrice) {
      return { success: false, error: `Insufficient gold. Required: ${finalPrice}, Available: ${character.gold}` }
    }

    if (template.factionRestricted) {
      const { data: charFaction } = await supabase
        .from('characters')
        .select('faction_id')
        .eq('id', character.id)
        .single()
      if (charFaction?.faction_id !== template.factionRestricted) {
        return { success: false, error: 'Faction restriction' }
      }
    }

    const now = new Date().toISOString()
    const newGold = character.gold - finalPrice

    await supabase
      .from('character_items')
      .insert({
        character_id: character.id,
        template_id: template.id,
        quantity: 1,
        created_at: now,
      })

    await supabase
      .from('characters')
      .update({ gold: newGold, updated_at: now })
      .eq('id', character.id)

    await supabase
      .from('currency_ledger')
      .insert({
        character_id: character.id,
        currency_type: 'gold',
        balance_before: character.gold,
        change_amount: -finalPrice,
        balance_after: newGold,
        reason: `Purchased ${template.name} from shop`,
        source_type: 'shop_purchase',
        idempotency_key: idempotencyKey,
        created_at: now,
      })

    return {
      success: true,
      data: {
        message: `Purchased ${template.name} for ${finalPrice} gold`,
        itemId: template.id,
        name: template.name,
        price: finalPrice,
        remainingGold: newGold,
      },
    }
  } catch (error) {
    console.error('Buy item error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function sellItemToShop(itemId: string, idempotencyKey: string) {
  try {
    const validated = sellItemSchema.safeParse({ itemId, idempotencyKey })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, gold')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const { data: existingLedger } = await supabase
      .from('currency_ledger')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()
    if (existingLedger) return { success: false, error: 'Request already processed' }

    const { data: inventoryItem, error: invError } = await supabase
      .from('character_items')
      .select('id, template_id, quantity')
      .eq('id', itemId)
      .eq('character_id', character.id)
      .single()
    if (invError || !inventoryItem) return { success: false, error: 'Item not found in inventory' }

    const template = allItems.find(i => i.id === inventoryItem.template_id)
    if (!template) return { success: false, error: 'Item template not found' }

    const sellPrice = template.sellPrice

    const now = new Date().toISOString()
    const newGold = character.gold + sellPrice

    if (inventoryItem.quantity > 1) {
      await supabase
        .from('character_items')
        .update({ quantity: inventoryItem.quantity - 1 })
        .eq('id', itemId)
    } else {
      await supabase
        .from('character_items')
        .delete()
        .eq('id', itemId)
    }

    await supabase
      .from('characters')
      .update({ gold: newGold, updated_at: now })
      .eq('id', character.id)

    await supabase
      .from('currency_ledger')
      .insert({
        character_id: character.id,
        currency_type: 'gold',
        balance_before: character.gold,
        change_amount: sellPrice,
        balance_after: newGold,
        reason: `Sold ${template.name} to shop`,
        source_type: 'shop_sale',
        idempotency_key: idempotencyKey,
        created_at: now,
      })

    return {
      success: true,
      data: {
        message: `Sold ${template.name} for ${sellPrice} gold`,
        sellPrice,
        remainingGold: newGold,
      },
    }
  } catch (error) {
    console.error('Sell item to shop error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
