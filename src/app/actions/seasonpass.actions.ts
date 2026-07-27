'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/drizzle'
import {
  getSeasonPassTiers as getSeasonPassTiersFn,
  getSeasonPassProgress as getSeasonPassProgressFn,
  claimTierReward as claimTierRewardFn,
  unlockPremiumPass as unlockPremiumPassFn,
  getCurrentTierXpProgress,
} from '@/game/seasonpass'
import { getActiveSeason } from '@/game/seasons'

const seasonIdSchema = z.object({ seasonId: z.string().min(1, 'Season ID is required') })
const claimSchema = z.object({
  seasonId: z.string().min(1, 'Season ID is required'),
  tier: z.number().int().min(1).max(50, 'Invalid tier'),
  isPremium: z.boolean(),
})
const unlockSchema = z.object({ seasonId: z.string().min(1, 'Season ID is required') })
const progressSchema = z.object({
  currentXp: z.number().min(0),
  currentTier: z.number().int().min(0),
})

async function resolveSeasonId(seasonId?: string): Promise<string | null> {
  if (seasonId) return seasonId
  try {
    const db = getDb()
    const season = await getActiveSeason(db)
    return season?.id ?? null
  } catch {
    return null
  }
}

export async function getSeasonPassTiersAction(seasonId?: string) {
  try {
    const resolved = await resolveSeasonId(seasonId)
    if (!resolved) return { success: false, error: 'No active season found' }
    const db = getDb()
    const tiers = await getSeasonPassTiersFn(db, resolved)
    return { success: true, data: { tiers } }
  } catch (error) {
    console.error('Get season pass tiers error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getSeasonPassProgressAction(seasonId?: string) {
  try {
    const resolved = await resolveSeasonId(seasonId)
    if (!resolved) return { success: false, error: 'No active season found' }

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
    const progress = await getSeasonPassProgressFn(db, resolved, character.id)
    return { success: true, data: { progress } }
  } catch (error) {
    console.error('Get season pass progress error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function claimTierRewardAction(tier: number, isPremium: boolean, seasonId?: string) {
  try {
    const resolved = await resolveSeasonId(seasonId)
    if (!resolved) return { success: false, error: 'No active season found' }

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
    const reward = await claimTierRewardFn(db, resolved, character.id, tier, isPremium)
    return { success: true, data: { reward } }
  } catch (error) {
    console.error('Claim tier reward error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function unlockPremiumPassAction(seasonId?: string) {
  try {
    const resolved = await resolveSeasonId(seasonId)
    if (!resolved) return { success: false, error: 'No active season found' }

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
    const result = await unlockPremiumPassFn(db, resolved, character.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Unlock premium pass error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function getCurrentTierProgressAction(currentXp: number, currentTier: number) {
  try {
    const validated = progressSchema.safeParse({ currentXp, currentTier })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const result = getCurrentTierXpProgress(currentXp, currentTier)
    return { success: true, data: result }
  } catch (error) {
    console.error('Get current tier progress error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
