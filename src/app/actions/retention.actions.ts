'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/drizzle'
import {
  recordLogin,
  getStreakInfo,
  claimStreakBonus,
  getStreakLeaderboard,
} from '@/game/retention'

const getStreakLeaderboardSchema = z.object({
  limit: z.number().int().positive().optional(),
})

export async function recordLoginAction() {
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
    const result = await recordLogin(db, character.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Record login error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getStreakInfoAction() {
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
    const result = await getStreakInfo(db, character.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Get streak info error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function claimStreakBonusAction() {
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
    const result = await claimStreakBonus(db, character.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Claim streak bonus error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getStreakLeaderboardAction(limit?: number) {
  try {
    const validated = getStreakLeaderboardSchema.safeParse({ limit })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const db = getDb()
    const result = await getStreakLeaderboard(db, validated.data.limit)
    return { success: true, data: result }
  } catch (error) {
    console.error('Get streak leaderboard error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
