import { drizzle } from 'drizzle-orm/postgres-js'
import { eq, and } from 'drizzle-orm'
import {
  cosmeticItems,
  characterCosmetics,
  characters,
  currencyLedger,
} from '@/lib/db/schema'

export const COSMETIC_CATEGORIES = ['aura', 'mount', 'frame', 'background', 'title', 'pet'] as const
export const COSMETIC_RARITIES = ['common', 'rare', 'epic', 'legendary'] as const
export const COSMETIC_EQUIP_SLOTS = ['aura', 'mount', 'frame', 'background', 'title', 'pet'] as const

export type CosmeticCategory = (typeof COSMETIC_CATEGORIES)[number]
export type CosmeticRarity = (typeof COSMETIC_RARITIES)[number]
export type CosmeticEquipSlot = (typeof COSMETIC_EQUIP_SLOTS)[number]

export interface ShopFilters {
  category?: CosmeticCategory
  rarity?: CosmeticRarity
  membershipOnly?: boolean
  characterId?: string
}

export async function getShopCosmetics(
  db: ReturnType<typeof drizzle>,
  filters?: ShopFilters,
) {
  const where = and(
    eq(cosmeticItems.active, true),
    filters?.category ? eq(cosmeticItems.category, filters.category) : undefined,
    filters?.rarity ? eq(cosmeticItems.rarity, filters.rarity) : undefined,
    filters?.membershipOnly !== undefined
      ? eq(cosmeticItems.membershipOnly, filters.membershipOnly)
      : undefined,
  )

  const items = await db
    .select()
    .from(cosmeticItems)
    .where(where)

  if (!filters?.characterId) return items

  const owned = await db
    .select({ cosmeticItemId: characterCosmetics.cosmeticItemId })
    .from(characterCosmetics)
    .where(eq(characterCosmetics.characterId, filters.characterId))

  const ownedSet = new Set(owned.map((o) => o.cosmeticItemId))

  return items.map((item) => ({
    ...item,
    owned: ownedSet.has(item.id),
  }))
}

export async function purchaseCosmetic(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  cosmeticItemId: string,
) {
  const [item] = await db
    .select()
    .from(cosmeticItems)
    .where(and(eq(cosmeticItems.id, cosmeticItemId), eq(cosmeticItems.active, true)))
    .limit(1)

  if (!item) return { error: 'Kozmetický predmet nebol nájdený alebo nie je dostupný.' }

  const [existing] = await db
    .select()
    .from(characterCosmetics)
    .where(
      and(
        eq(characterCosmetics.characterId, characterId),
        eq(characterCosmetics.cosmeticItemId, cosmeticItemId),
      ),
    )
    .limit(1)

  if (existing) return { error: 'Tento kozmetický predmet už vlastníš.' }

  const [character] = await db
    .select({ premiumCurrency: characters.premiumCurrency })
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1)

  if (!character) return { error: 'Postava nebola nájdená.' }

  if (item.membershipOnly) {
    return { error: 'Tento predmet je dostupný len pre členov.' }
  }

  const price = item.priceCrystals ?? 0

  if (price > 0 && character.premiumCurrency < price) {
    return { error: `Nedostatok kryštálov. Potrebuješ ${price}, máš ${character.premiumCurrency}.` }
  }

  const result = await db.transaction(async (tx) => {
    const [newCosmetic] = await tx
      .insert(characterCosmetics)
      .values({
        characterId,
        cosmeticItemId,
        slot: item.category,
        equipped: false,
      })
      .returning({ id: characterCosmetics.id })

    if (price > 0) {
      const newBalance = character.premiumCurrency - price

      await tx
        .update(characters)
        .set({ premiumCurrency: newBalance })
        .where(eq(characters.id, characterId))

      await tx.insert(currencyLedger).values({
        characterId,
        currencyType: 'premium_crystals',
        balanceBefore: character.premiumCurrency,
        changeAmount: -price,
        balanceAfter: newBalance,
        reason: `Nákup kozmetiky: ${item.name}`,
        sourceType: 'cosmetic_purchase',
        sourceId: cosmeticItemId,
        idempotencyKey: `cosmetic-purchase-${characterId}-${cosmeticItemId}-${Date.now()}`,
      })
    }

    return { cosmeticId: newCosmetic.id, name: item.name }
  })

  return result
}

export async function equipCosmetic(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  cosmeticItemId: string,
) {
  const [ownership] = await db
    .select()
    .from(characterCosmetics)
    .where(
      and(
        eq(characterCosmetics.characterId, characterId),
        eq(characterCosmetics.cosmeticItemId, cosmeticItemId),
      ),
    )
    .limit(1)

  if (!ownership) return { error: 'Tento kozmetický predmet nevlastníš.' }

  const slot = ownership.slot as CosmeticEquipSlot

  return db.transaction(async (tx) => {
    await tx
      .update(characterCosmetics)
      .set({ equipped: false })
      .where(
        and(
          eq(characterCosmetics.characterId, characterId),
          eq(characterCosmetics.slot, slot),
        ),
      )

    await tx
      .update(characterCosmetics)
      .set({ equipped: true })
      .where(eq(characterCosmetics.id, ownership.id))

    return { slot, equipped: true }
  })
}

export async function unequipCosmetic(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  cosmeticItemId: string,
) {
  const [ownership] = await db
    .select()
    .from(characterCosmetics)
    .where(
      and(
        eq(characterCosmetics.characterId, characterId),
        eq(characterCosmetics.cosmeticItemId, cosmeticItemId),
      ),
    )
    .limit(1)

  if (!ownership) return { error: 'Tento kozmetický predmet nevlastníš.' }
  if (!ownership.equipped) return { error: 'Tento predmet nie je aktívne vybavený.' }

  const slot = ownership.slot as CosmeticEquipSlot

  return db.transaction(async (tx) => {
    await tx
      .update(characterCosmetics)
      .set({ equipped: false })
      .where(eq(characterCosmetics.id, ownership.id))

    return { slot }
  })
}

export async function getCharacterCosmetics(
  db: ReturnType<typeof drizzle>,
  characterId: string,
) {
  const rows = await db
    .select({
      id: characterCosmetics.id,
      cosmeticItemId: characterCosmetics.cosmeticItemId,
      equipped: characterCosmetics.equipped,
      slot: characterCosmetics.slot,
      purchasedAt: characterCosmetics.purchasedAt,
      name: cosmeticItems.name,
      category: cosmeticItems.category,
      rarity: cosmeticItems.rarity,
      description: cosmeticItems.description,
    })
    .from(characterCosmetics)
    .innerJoin(cosmeticItems, eq(characterCosmetics.cosmeticItemId, cosmeticItems.id))
    .where(eq(characterCosmetics.characterId, characterId))

  return rows
}

export async function getEquippedCosmetics(
  db: ReturnType<typeof drizzle>,
  characterId: string,
) {
  const rows = await db
    .select({
      id: characterCosmetics.id,
      cosmeticItemId: characterCosmetics.cosmeticItemId,
      slot: characterCosmetics.slot,
      name: cosmeticItems.name,
      category: cosmeticItems.category,
      rarity: cosmeticItems.rarity,
      description: cosmeticItems.description,
    })
    .from(characterCosmetics)
    .innerJoin(cosmeticItems, eq(characterCosmetics.cosmeticItemId, cosmeticItems.id))
    .where(
      and(
        eq(characterCosmetics.characterId, characterId),
        eq(characterCosmetics.equipped, true),
      ),
    )

  const equipped: Record<string, typeof rows[number]> = {}
  for (const row of rows) {
    equipped[row.slot] = row
  }

  return equipped
}

export async function deleteCosmetic(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  cosmeticItemId: string,
) {
  const [ownership] = await db
    .select()
    .from(characterCosmetics)
    .where(
      and(
        eq(characterCosmetics.characterId, characterId),
        eq(characterCosmetics.cosmeticItemId, cosmeticItemId),
      ),
    )
    .limit(1)

  if (!ownership) return { error: 'Tento kozmetický predmet nevlastníš.' }

  await db
    .delete(characterCosmetics)
    .where(eq(characterCosmetics.id, ownership.id))

  return { deleted: true }
}
