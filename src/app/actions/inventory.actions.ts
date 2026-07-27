'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { EQUIPMENT_SLOT_TYPES, SlotType } from '@/game/config'

const equipItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  slotType: z.enum(EQUIPMENT_SLOT_TYPES as unknown as [string, ...string[]]),
})

const unequipItemSchema = z.object({
  slotType: z.enum(EQUIPMENT_SLOT_TYPES as unknown as [string, ...string[]]),
})

const sellItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
})

export async function getInventory() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (characterError || !character) return { success: false, error: 'Character not found' }

    const { data: inventory, error: inventoryError } = await supabase
      .from('character_items')
      .select(`
        *,
        item_templates (*)
      `)
      .eq('character_id', character.id)
      .order('created_at', { ascending: false })

    if (inventoryError) return { success: false, error: 'Failed to fetch inventory' }

    return { success: true, data: { inventory: inventory || [] } }
  } catch (error) {
    console.error('Get inventory error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function equipItem(itemId: string, slotType: SlotType) {
  try {
    const validated = equipItemSchema.safeParse({ itemId, slotType })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id, level, faction_id')
      .eq('user_id', user.id)
      .single()
    if (characterError || !character) return { success: false, error: 'Character not found' }

    // Validate the character owns this item
    const { data: inventoryItem, error: itemError } = await supabase
      .from('character_items')
      .select('id, template_id, item_templates (*)')
      .eq('id', itemId)
      .eq('character_id', character.id)
      .single()
    if (itemError || !inventoryItem) return { success: false, error: 'Item not found in inventory' }

    const template = inventoryItem.item_templates as any
    if (!template) return { success: false, error: 'Item template not found' }

    // Validate slot type matches item type
    if (template.type !== slotType) {
      return { success: false, error: `This item cannot be equipped in the ${slotType} slot` }
    }

    // Validate level requirement
    if (template.required_level > character.level) {
      return { success: false, error: `Level ${template.required_level} required to equip this item` }
    }

    // Validate faction restriction
    if (template.faction_restriction && template.faction_restriction !== character.faction_id) {
      return { success: false, error: 'This item is restricted to a different faction' }
    }

    // If slot already has an item, unequip it first
    const { data: existingSlot } = await supabase
      .from('equipment_slots')
      .select('id, item_id')
      .eq('character_id', character.id)
      .eq('slot_type', slotType)
      .single()

    if (existingSlot?.item_id) {
      await supabase
        .from('equipment_slots')
        .update({ item_id: null, updated_at: new Date().toISOString() })
        .eq('id', existingSlot.id)
    }

    // Set item in slot
    const { error: equipError } = await supabase
      .from('equipment_slots')
      .update({ item_id: itemId, updated_at: new Date().toISOString() })
      .eq('character_id', character.id)
      .eq('slot_type', slotType)

    if (equipError) {
      console.error('Equip error:', equipError)
      return { success: false, error: 'Failed to equip item' }
    }

    return {
      success: true,
      data: {
        message: `Equipped ${template.name} in ${slotType} slot`,
        item: template,
        slotType,
      },
    }
  } catch (error) {
    console.error('Equip item error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function unequipItem(slotType: SlotType) {
  try {
    const validated = unequipItemSchema.safeParse({ slotType })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (characterError || !character) return { success: false, error: 'Character not found' }

    const { data: slot, error: slotError } = await supabase
      .from('equipment_slots')
      .select('id, item_id')
      .eq('character_id', character.id)
      .eq('slot_type', slotType)
      .single()

    if (slotError || !slot) return { success: false, error: 'Equipment slot not found' }
    if (!slot.item_id) return { success: false, error: `No item equipped in the ${slotType} slot` }

    const { error: unequipError } = await supabase
      .from('equipment_slots')
      .update({ item_id: null, updated_at: new Date().toISOString() })
      .eq('id', slot.id)

    if (unequipError) {
      console.error('Unequip error:', unequipError)
      return { success: false, error: 'Failed to unequip item' }
    }

    return { success: true, data: { message: `Unequipped item from ${slotType} slot` } }
  } catch (error) {
    console.error('Unequip item error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function sellItem(itemId: string, idempotencyKey: string) {
  try {
    const validated = sellItemSchema.safeParse({ itemId, idempotencyKey })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id, gold')
      .eq('user_id', user.id)
      .single()
    if (characterError || !character) return { success: false, error: 'Character not found' }

    // Check idempotency
    const { data: existing } = await supabase
      .from('currency_ledger')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()
    if (existing) return { success: false, error: 'Request already processed' }

    // Validate item ownership
    const { data: inventoryItem } = await supabase
      .from('character_items')
      .select('id, template_id, item_templates (name, sell_price, type)')
      .eq('id', itemId)
      .eq('character_id', character.id)
      .single()
    if (!inventoryItem) return { success: false, error: 'Item not found in inventory' }

    const template = inventoryItem.item_templates as any
    const sellPrice = template?.sell_price || 0

    // Ensure item is not equipped
    const { data: equippedSlot } = await supabase
      .from('equipment_slots')
      .select('id')
      .eq('item_id', itemId)
      .maybeSingle()
    if (equippedSlot) return { success: false, error: 'Cannot sell an equipped item. Unequip it first.' }

    // Delete item
    const { error: deleteError } = await supabase
      .from('character_items')
      .delete()
      .eq('id', itemId)
    if (deleteError) return { success: false, error: 'Failed to remove item' }

    // Add gold
    const newGold = character.gold + sellPrice
    await supabase
      .from('characters')
      .update({ gold: newGold, updated_at: new Date().toISOString() })
      .eq('id', character.id)

    // Ledger entry
    await supabase.from('currency_ledger').insert({
      character_id: character.id,
      currency_type: 'gold',
      balance_before: character.gold,
      change_amount: sellPrice,
      balance_after: newGold,
      reason: `Sold ${template?.name || 'item'}`,
      source_type: 'item_sale',
      source_id: itemId,
      idempotency_key: idempotencyKey,
    })

    return {
      success: true,
      data: {
        message: `Sold ${template?.name || 'item'} for ${sellPrice} gold`,
        sellPrice,
      },
    }
  } catch (error) {
    console.error('Sell item error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getEquipment() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (characterError || !character) return { success: false, error: 'Character not found' }

    const { data: slots, error: slotsError } = await supabase
      .from('equipment_slots')
      .select(`
        id, slot_type, item_id,
        character_items (
          id, template_id, quantity,
          item_templates (*)
        )
      `)
      .eq('character_id', character.id)

    if (slotsError) return { success: false, error: 'Failed to fetch equipment' }

    const totalStats: Record<string, number> = {
      strength: 0, dexterity: 0, endurance: 0, perception: 0, willpower: 0, luck: 0,
    }

    const equipped: Record<string, any> = {}

    for (const slot of slots || []) {
      const items = slot.character_items as any
      const template = items?.item_templates
      equipped[slot.slot_type] = template || null

      if (template?.stat_bonus && typeof template.stat_bonus === 'object') {
        for (const [stat, value] of Object.entries(template.stat_bonus)) {
          if (stat in totalStats && typeof value === 'number') {
            totalStats[stat] += value
          }
        }
      }
    }

    return { success: true, data: { equipment: equipped, totalStats, slots } }
  } catch (error) {
    console.error('Get equipment error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
