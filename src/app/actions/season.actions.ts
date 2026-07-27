'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/drizzle'
import {
  createSeason,
  startSeason,
  endSeason,
  getActiveSeason,
  getSeasonLeaderboard,
  claimSeasonReward,
  getSeasonHistory,
} from '@/game/seasons'

const createSeasonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  durationDays: z.number().int().positive().optional(),
})

const startSeasonSchema = z.object({
  seasonId: z.string().uuid('Invalid season ID'),
})

const endSeasonSchema = z.object({
  seasonId: z.string().uuid('Invalid season ID'),
})

const getSeasonLeaderboardSchema = z.object({
  seasonId: z.string().uuid('Invalid season ID'),
  boardType: z.enum(['level', 'pvp_rating', 'gold', 'power']),
  limit: z.number().int().positive().max(100).optional(),
})

const claimSeasonRewardSchema = z.object({
  seasonId: z.string().uuid('Invalid season ID'),
})

const getSeasonHistorySchema = z.object({
  limit: z.number().int().positive().max(50).optional(),
})

export async function createSeasonAction(name: string, description?: string, durationDays?: number) {
  try {
    const validated = createSeasonSchema.safeParse({ name, description, durationDays })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'administrator') return { success: false, error: 'Unauthorized' }

    const db = getDb()
    const season = await createSeason(db, name, description ?? '', durationDays ?? 30)

    return { success: true, data: season }
  } catch (error) {
    console.error('Create season error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function startSeasonAction(seasonId: string) {
  try {
    const validated = startSeasonSchema.safeParse({ seasonId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'administrator') return { success: false, error: 'Unauthorized' }

    const db = getDb()
    const season = await startSeason(db, seasonId)

    return { success: true, data: season }
  } catch (error) {
    console.error('Start season error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function endSeasonAction(seasonId: string) {
  try {
    const validated = endSeasonSchema.safeParse({ seasonId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'administrator') return { success: false, error: 'Unauthorized' }

    const db = getDb()
    const rewards = await endSeason(db, seasonId)

    return { success: true, data: rewards }
  } catch (error) {
    console.error('End season error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getActiveSeasonAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const season = await getActiveSeason(db)

    return { success: true, data: season }
  } catch (error) {
    console.error('Get active season error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getSeasonLeaderboardAction(seasonId: string, boardType: string, limit?: number) {
  try {
    const validated = getSeasonLeaderboardSchema.safeParse({ seasonId, boardType, limit })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const leaderboard = await getSeasonLeaderboard(db, seasonId, validated.data.boardType, limit)

    return { success: true, data: leaderboard }
  } catch (error) {
    console.error('Get season leaderboard error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function claimSeasonRewardAction(seasonId: string) {
  try {
    const validated = claimSeasonRewardSchema.safeParse({ seasonId })
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
    const reward = await claimSeasonReward(db, character.id, seasonId)

    return { success: true, data: reward }
  } catch (error) {
    console.error('Claim season reward error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getSeasonHistoryAction(limit?: number) {
  try {
    const validated = getSeasonHistorySchema.safeParse({ limit })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const history = await getSeasonHistory(db, limit)

    return { success: true, data: history }
  } catch (error) {
    console.error('Get season history error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
