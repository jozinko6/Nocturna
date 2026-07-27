'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 20

const searchPlayersSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  page: z.number().int().positive().default(1),
})

const getPlayerDetailsSchema = z.object({
  playerId: z.string().uuid('Invalid player ID'),
})

const getPlayerEconomySchema = z.object({
  playerId: z.string().uuid('Invalid player ID'),
})

const banPlayerSchema = z.object({
  playerId: z.string().uuid('Invalid player ID'),
  reason: z.string().min(1, 'Ban reason is required').max(500),
})

const adjustCurrencySchema = z.object({
  playerId: z.string().uuid('Invalid player ID'),
  currencyType: z.enum(['gold', 'premium_crystals']),
  amount: z.number().int(),
  reason: z.string().min(1, 'Adjustment reason is required').max(500),
})

const toggleFeatureFlagSchema = z.object({
  flagKey: z.string().min(1, 'Flag key is required'),
  enabled: z.boolean(),
})

const getSecurityEventsSchema = z.object({
  page: z.number().int().positive().default(1),
})

const getPaymentEventsSchema = z.object({
  page: z.number().int().positive().default(1),
})

const ADMIN_ROLES = ['economy_manager', 'administrator'] as const

async function verifyAdminRole(supabase: any, userId: string): Promise<{ authorized: boolean; role?: string }> {
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (!user) return { authorized: false }
  if (!ADMIN_ROLES.includes(user.role)) return { authorized: false, role: user.role }
  return { authorized: true, role: user.role }
}

export async function searchPlayers(query: string, page: number = 1) {
  try {
    const validated = searchPlayersSchema.safeParse({ query, page })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { authorized } = await verifyAdminRole(supabase, user.id)
    if (!authorized) return { success: false, error: 'Unauthorized: Admin role required' }

    const offset = (page - 1) * PAGE_SIZE

    const { data: players, error: playersError, count } = await supabase
      .from('characters')
      .select(`
        *,
        profiles!inner ( display_name ),
        users!inner ( email, banned, role ),
        factions ( name )
      `, { count: 'exact' })
      .or(`name.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (playersError) {
      console.error('Players search error:', playersError)
      return { success: false, error: 'Failed to search players' }
    }

    return {
      success: true,
      data: {
        players: players || [],
        pagination: {
          page,
          pageSize: PAGE_SIZE,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / PAGE_SIZE),
        },
      },
    }
  } catch (error) {
    console.error('Search players error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getPlayerDetails(playerId: string) {
  try {
    const validated = getPlayerDetailsSchema.safeParse({ playerId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { authorized } = await verifyAdminRole(supabase, user.id)
    if (!authorized) return { success: false, error: 'Unauthorized: Admin role required' }

    const { data: player, error: playerError } = await supabase
      .from('characters')
      .select(`
        *,
        profiles ( display_name, avatar_url ),
        factions ( name, description ),
        character_stats ( strength, dexterity, endurance, perception, willpower, luck ),
        equipment_slots ( slot_type, item_id, character_items ( id, template_id, item_templates ( name, rarity, type ) ) )
      `)
      .eq('id', playerId)
      .single()
    if (playerError || !player) return { success: false, error: 'Player not found' }

    const { data: inventory } = await supabase
      .from('character_items')
      .select(`
        id, quantity,
        item_templates ( name, type, rarity, buy_price )
      `)
      .eq('character_id', playerId)

    const { data: recentBattles } = await supabase
      .from('battle_reports')
      .select('id, battle_type, result, winner_id, created_at')
      .or(`attacker_id.eq.${playerId},defender_id.eq.${playerId}`)
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: activeExpedition } = await supabase
      .from('expeditions')
      .select('id, region_id, difficulty, status, started_at, ends_at')
      .eq('character_id', playerId)
      .eq('status', 'in_progress')
      .maybeSingle()

    return {
      success: true,
      data: {
        player,
        inventory: inventory || [],
        recentBattles: recentBattles || [],
        activeExpedition,
      },
    }
  } catch (error) {
    console.error('Get player details error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getPlayerEconomy(playerId: string) {
  try {
    const validated = getPlayerEconomySchema.safeParse({ playerId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { authorized } = await verifyAdminRole(supabase, user.id)
    if (!authorized) return { success: false, error: 'Unauthorized: Admin role required' }

    const { data: character } = await supabase
      .from('characters')
      .select('gold, premium_currency')
      .eq('id', playerId)
      .single()

    const { data: ledger, error: ledgerError } = await supabase
      .from('currency_ledger')
      .select('*')
      .eq('character_id', playerId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (ledgerError) {
      console.error('Currency ledger fetch error:', ledgerError)
      return { success: false, error: 'Failed to fetch currency ledger' }
    }

    const totalGoldIn = (ledger || [])
      .filter(e => e.currency_type === 'gold' && e.change_amount > 0)
      .reduce((sum, e) => sum + e.change_amount, 0)

    const totalGoldOut = (ledger || [])
      .filter(e => e.currency_type === 'gold' && e.change_amount < 0)
      .reduce((sum, e) => sum + Math.abs(e.change_amount), 0)

    const totalCrystalsIn = (ledger || [])
      .filter(e => e.currency_type === 'premium_crystals' && e.change_amount > 0)
      .reduce((sum, e) => sum + e.change_amount, 0)

    return {
      success: true,
      data: {
        currentGold: character?.gold ?? 0,
        currentCrystals: character?.premium_currency ?? 0,
        ledger: ledger || [],
        summary: {
          totalGoldIn,
          totalGoldOut,
          goldNetFlow: totalGoldIn - totalGoldOut,
          totalCrystalsIn,
        },
      },
    }
  } catch (error) {
    console.error('Get player economy error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function banPlayer(playerId: string, reason: string) {
  try {
    const validated = banPlayerSchema.safeParse({ playerId, reason })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { authorized } = await verifyAdminRole(supabase, user.id)
    if (!authorized) return { success: false, error: 'Unauthorized: Admin role required' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, user_id')
      .eq('id', playerId)
      .single()
    if (charError || !character) return { success: false, error: 'Player not found' }

    const { error: banError } = await supabase
      .from('users')
      .update({
        banned: true,
        ban_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', character.user_id)

    if (banError) {
      console.error('Ban error:', banError)
      return { success: false, error: 'Failed to ban player' }
    }

    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: user.id,
        action: 'ban_player',
        target_type: 'user',
        target_id: character.user_id,
        details: { reason, characterId: playerId },
        created_at: new Date().toISOString(),
      })

    return { success: true, data: { message: 'Player banned successfully' } }
  } catch (error) {
    console.error('Ban player error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function adjustCurrency(
  playerId: string,
  currencyType: 'gold' | 'premium_crystals',
  amount: number,
  reason: string,
) {
  try {
    const validated = adjustCurrencySchema.safeParse({ playerId, currencyType, amount, reason })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { authorized } = await verifyAdminRole(supabase, user.id)
    if (!authorized) return { success: false, error: 'Unauthorized: Admin role required' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, gold, premium_currency')
      .eq('id', playerId)
      .single()
    if (charError || !character) return { success: false, error: 'Player not found' }

    const field = currencyType === 'gold' ? 'gold' : 'premium_currency'
    const currentValue = character[field]
    const newValue = currentValue + amount

    if (newValue < 0) {
      return { success: false, error: `Insufficient ${currencyType}. Current: ${currentValue}, Adjustment: ${amount}` }
    }

    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('characters')
      .update({ [field]: newValue, updated_at: now })
      .eq('id', playerId)

    if (updateError) {
      console.error('Currency update error:', updateError)
      return { success: false, error: 'Failed to adjust currency' }
    }

    await supabase
      .from('currency_ledger')
      .insert({
        character_id: playerId,
        currency_type: currencyType,
        balance_before: currentValue,
        change_amount: amount,
        balance_after: newValue,
        reason,
        source_type: 'admin_adjustment',
        admin_id: user.id,
        created_at: now,
      })

    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: user.id,
        action: 'adjust_currency',
        target_type: 'character',
        target_id: playerId,
        details: { currencyType, amount, reason, previousValue: currentValue, newValue },
        created_at: now,
      })

    return {
      success: true,
      data: {
        currencyType,
        previousValue: currentValue,
        newValue,
        adjustment: amount,
      },
    }
  } catch (error) {
    console.error('Adjust currency error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getFeatureFlags() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { authorized } = await verifyAdminRole(supabase, user.id)
    if (!authorized) return { success: false, error: 'Unauthorized: Admin role required' }

    const { data: flags, error: flagsError } = await supabase
      .from('feature_flags')
      .select('*')
      .order('key', { ascending: true })

    if (flagsError) {
      console.error('Feature flags fetch error:', flagsError)
      return { success: false, error: 'Failed to fetch feature flags' }
    }

    return { success: true, data: { flags: flags || [] } }
  } catch (error) {
    console.error('Get feature flags error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function toggleFeatureFlag(flagKey: string, enabled: boolean) {
  try {
    const validated = toggleFeatureFlagSchema.safeParse({ flagKey, enabled })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { authorized } = await verifyAdminRole(supabase, user.id)
    if (!authorized) return { success: false, error: 'Unauthorized: Admin role required' }

    const { data: existingFlag } = await supabase
      .from('feature_flags')
      .select('id')
      .eq('key', flagKey)
      .maybeSingle()

    const now = new Date().toISOString()

    if (existingFlag) {
      const { error: updateError } = await supabase
        .from('feature_flags')
        .update({ enabled, updated_at: now })
        .eq('key', flagKey)

      if (updateError) {
        console.error('Feature flag update error:', updateError)
        return { success: false, error: 'Failed to update feature flag' }
      }
    } else {
      const { error: insertError } = await supabase
        .from('feature_flags')
        .insert({ key: flagKey, enabled, updated_at: now })

      if (insertError) {
        console.error('Feature flag insert error:', insertError)
        return { success: false, error: 'Failed to create feature flag' }
      }
    }

    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: user.id,
        action: 'toggle_feature_flag',
        target_type: 'feature_flag',
        target_id: null,
        details: { flagKey, enabled },
        created_at: now,
      })

    return { success: true, data: { flagKey, enabled } }
  } catch (error) {
    console.error('Toggle feature flag error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getSecurityEvents(page: number = 1) {
  try {
    const validated = getSecurityEventsSchema.safeParse({ page })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { authorized } = await verifyAdminRole(supabase, user.id)
    if (!authorized) return { success: false, error: 'Unauthorized: Admin role required' }

    const pageSize = 50
    const offset = (page - 1) * pageSize

    const { data: events, error: eventsError, count } = await supabase
      .from('security_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (eventsError) {
      console.error('Security events fetch error:', eventsError)
      return { success: false, error: 'Failed to fetch security events' }
    }

    return {
      success: true,
      data: {
        events: events || [],
        pagination: {
          page,
          pageSize,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      },
    }
  } catch (error) {
    console.error('Get security events error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getPaymentEvents(page: number = 1) {
  try {
    const validated = getPaymentEventsSchema.safeParse({ page })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { authorized } = await verifyAdminRole(supabase, user.id)
    if (!authorized) return { success: false, error: 'Unauthorized: Admin role required' }

    const pageSize = 50
    const offset = (page - 1) * pageSize

    const { data: events, error: eventsError, count } = await supabase
      .from('payment_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (eventsError) {
      console.error('Payment events fetch error:', eventsError)
      return { success: false, error: 'Failed to fetch payment events' }
    }

    return {
      success: true,
      data: {
        events: events || [],
        pagination: {
          page,
          pageSize,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      },
    }
  } catch (error) {
    console.error('Get payment events error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getEconomyStats() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { authorized } = await verifyAdminRole(supabase, user.id)
    if (!authorized) return { success: false, error: 'Unauthorized: Admin role required' }

    const { count: totalPlayers } = await supabase
      .from('characters')
      .select('id', { count: 'exact', head: true })

    const { data: allGold } = await supabase
      .from('characters')
      .select('gold, premium_currency')

    const totalGold = (allGold || []).reduce((sum, r) => sum + r.gold, 0)
    const totalCrystals = (allGold || []).reduce((sum, r) => sum + r.premium_currency, 0)

    const today = new Date().toISOString().split('T')[0]

    const { data: todayLedger } = await supabase
      .from('currency_ledger')
      .select('currency_type, change_amount')
      .gte('created_at', today)

    const todayGoldIn = (todayLedger || [])
      .filter(e => e.currency_type === 'gold' && e.change_amount > 0)
      .reduce((sum, e) => sum + e.change_amount, 0)
    const todayGoldOut = (todayLedger || [])
      .filter(e => e.currency_type === 'gold' && e.change_amount < 0)
      .reduce((sum, e) => sum + Math.abs(e.change_amount), 0)

    return {
      success: true,
      data: {
        totalPlayers: totalPlayers || 0,
        totalGold,
        totalCrystals,
        todayStats: {
          goldIn: todayGoldIn,
          goldOut: todayGoldOut,
          goldNetFlow: todayGoldIn - todayGoldOut,
        },
      },
    }
  } catch (error) {
    console.error('Get economy stats error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
