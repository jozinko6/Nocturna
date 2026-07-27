'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { STARTING_GOLD, STARTING_STATS, EQUIPMENT_SLOT_TYPES, STAT_NAMES } from '@/game/config'
import { maxHp, levelFromExperience, calculateStatTotal, attackPower } from '@/game/formulas'

const createCharacterSchema = z.object({
  name: z.string().min(2, 'Character name must be at least 2 characters').max(30, 'Character name must be 30 characters or less'),
  factionId: z.string().uuid('Invalid faction ID'),
  portraitUrl: z.string().url('Invalid portrait URL').optional(),
})

export async function createCharacter(name: string, factionId: string, portraitUrl?: string) {
  try {
    const validated = createCharacterSchema.safeParse({ name, factionId, portraitUrl })
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: existing } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (existing) return { success: false, error: 'Character already exists' }

    const { data: nameTaken } = await supabase
      .from('characters')
      .select('id')
      .ilike('name', name)
      .maybeSingle()
    if (nameTaken) return { success: false, error: 'Character name already taken' }

    const { data: faction } = await supabase
      .from('factions')
      .select('id')
      .eq('id', factionId)
      .maybeSingle()
    if (!faction) return { success: false, error: 'Invalid faction' }

    const startingHp = maxHp(STARTING_STATS, 1)

    const charInsert: Record<string, any> = {
      user_id: user.id,
      faction_id: factionId,
      name,
      level: 1,
      experience: 0,
      gold: STARTING_GOLD,
      premium_currency: 0,
      pvp_rating: 1000,
      pvp_wins: 0,
      pvp_losses: 0,
    }
    if (portraitUrl) charInsert.portrait_url = portraitUrl

    const { data: character, error: charError } = await supabase
      .from('characters')
      .insert(charInsert)
      .select()
      .single()

    if (charError || !character) {
      console.error('Character creation error:', charError)
      return { success: false, error: 'Failed to create character' }
    }

    const statsInsert: Record<string, any> = { character_id: character.id }
    for (const stat of STAT_NAMES) {
      statsInsert[stat] = STARTING_STATS
    }
    const { error: statsError } = await supabase.from('character_stats').insert(statsInsert)
    if (statsError) {
      console.error('Stats creation error:', statsError)
      return { success: false, error: 'Failed to create character stats' }
    }

    const { error: resError } = await supabase.from('character_resources').insert({
      character_id: character.id,
      current_energy: 100,
      max_energy: 100,
      last_energy_update: new Date().toISOString(),
      hit_points: startingHp,
      max_hit_points: startingHp,
    })
    if (resError) {
      console.error('Resources creation error:', resError)
      return { success: false, error: 'Failed to create character resources' }
    }

    const slots = EQUIPMENT_SLOT_TYPES.map((slotType) => ({
      character_id: character.id,
      slot_type: slotType,
    }))
    const { error: slotsError } = await supabase.from('equipment_slots').insert(slots)
    if (slotsError) {
      console.error('Equipment slots error:', slotsError)
      return { success: false, error: 'Failed to create equipment slots' }
    }

    const { data: starterTemplate } = await supabase
      .from('item_templates')
      .select('id')
      .eq('slug', 'w_rusty_sword')
      .maybeSingle()

    if (starterTemplate) {
      await supabase.from('character_items').insert({
        character_id: character.id,
        template_id: starterTemplate.id,
        quantity: 1,
      })
    }

    await supabase.from('currency_ledger').insert({
      character_id: character.id,
      currency_type: 'gold',
      balance_before: 0,
      change_amount: STARTING_GOLD,
      balance_after: STARTING_GOLD,
      reason: 'Starting gold',
      source_type: 'onboarding',
      idempotency_key: `onboarding_gold_${character.id}`,
    })

    await supabase.from('notifications').insert({
      character_id: character.id,
      type: 'system',
      title: 'Vitaj v Nocturne!',
      message: 'Temný svet na teba čaká. Začni svoju cestu výpravou do Mesta bez svitania.',
      data: {},
    })

    return { success: true, data: { character } }
  } catch (error) {
    console.error('Create character error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getFactions() {
  try {
    const supabase = await createClient()
    const { data: factions, error } = await supabase
      .from('factions')
      .select('id, slug, name, lore, color, passives')
    if (error) return { success: false, error: 'Failed to fetch factions' }
    return { success: true, data: { factions: factions || [] } }
  } catch (error) {
    console.error('Get factions error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getCharacter() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select(`
        *,
        character_stats (*),
        character_resources (*),
        factions (*),
        equipment_slots (
          id, slot_type, item_id, created_at, updated_at,
          character_items (id, template_id, quantity, item_templates (*))
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (characterError || !character) {
      return { success: false, error: 'Character not found' }
    }

    return { success: true, data: { character } }
  } catch (error) {
    console.error('Get character error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getCharacterStats() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id, level, experience')
      .eq('user_id', user.id)
      .single()

    if (characterError || !character) return { success: false, error: 'Character not found' }

    const { data: stats, error: statsError } = await supabase
      .from('character_stats')
      .select('*')
      .eq('character_id', character.id)
      .single()

    if (statsError || !stats) return { success: false, error: 'Stats not found' }

    const totalStats = calculateStatTotal(stats)
    const power = attackPower(stats)
    const currentLevel = levelFromExperience(character.experience)

    return {
      success: true,
      data: {
        stats,
        totalStats,
        powerLevel: power,
        level: currentLevel,
        experience: character.experience,
        experienceForNextLevel: Math.floor(100 * (currentLevel + 1) * (currentLevel + 1) + 50 * (currentLevel + 1)),
      },
    }
  } catch (error) {
    console.error('Get character stats error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
