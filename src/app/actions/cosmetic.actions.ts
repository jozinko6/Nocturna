'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/drizzle'
import {
  getShopCosmetics,
  purchaseCosmetic,
  equipCosmetic,
  unequipCosmetic,
  getCharacterCosmetics,
  getEquippedCosmetics,
  COSMETIC_CATEGORIES,
  COSMETIC_RARITIES,
} from '@/game/cosmetics'

const cosmeticItemIdSchema = z.object({
  cosmeticItemId: z.string().uuid('Invalid cosmetic item ID'),
})

const shopFiltersSchema = z.object({
  category: z.enum(COSMETIC_CATEGORIES).optional(),
  rarity: z.enum(COSMETIC_RARITIES).optional(),
})

export async function getShopCosmeticsAction(category?: string, rarity?: string) {
  try {
    const validated = shopFiltersSchema.safeParse({ category, rarity })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await getShopCosmetics(db, {
      category: validated.data.category,
      rarity: validated.data.rarity,
      characterId: character.id,
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Get shop cosmetics error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function purchaseCosmeticAction(cosmeticItemId: string) {
  try {
    const validated = cosmeticItemIdSchema.safeParse({ cosmeticItemId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await purchaseCosmetic(db, character.id, validated.data.cosmeticItemId)
    if ('error' in result) return { success: false, error: result.error }
    return { success: true, data: result }
  } catch (error) {
    console.error('Purchase cosmetic error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function equipCosmeticAction(cosmeticItemId: string) {
  try {
    const validated = cosmeticItemIdSchema.safeParse({ cosmeticItemId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await equipCosmetic(db, character.id, validated.data.cosmeticItemId)
    if ('error' in result) return { success: false, error: result.error }
    return { success: true, data: result }
  } catch (error) {
    console.error('Equip cosmetic error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function unequipCosmeticAction(cosmeticItemId: string) {
  try {
    const validated = cosmeticItemIdSchema.safeParse({ cosmeticItemId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await unequipCosmetic(db, character.id, validated.data.cosmeticItemId)
    if ('error' in result) return { success: false, error: result.error }
    return { success: true, data: result }
  } catch (error) {
    console.error('Unequip cosmetic error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getCharacterCosmeticsAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await getCharacterCosmetics(db, character.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Get character cosmetics error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getEquippedCosmeticsAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await getEquippedCosmetics(db, character.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Get equipped cosmetics error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
