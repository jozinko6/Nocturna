'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/drizzle'
import {
  canClaimAd,
  claimAdReward,
  getAdClaimHistory,
  getAdRewards,
  type RewardType,
} from '@/game/ads'

const claimAdRewardSchema = z.object({
  rewardType: z.enum(['gold', 'energy', 'crystals']),
  idempotencyKey: z.string().min(1, 'Idempotency key is required').optional(),
})

export async function canClaimAdAction() {
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
    const result = await canClaimAd(db, character.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Can claim ad error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function claimAdRewardAction(rewardType: string, idempotencyKey?: string) {
  try {
    const validated = claimAdRewardSchema.safeParse({ rewardType, idempotencyKey })
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
    const key = idempotencyKey ?? `${character.id}_${Date.now()}`
    const result = await claimAdReward(db, character.id, validated.data.rewardType as RewardType, key)
    return { success: true, data: result }
  } catch (error) {
    console.error('Claim ad reward error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function getAdClaimHistoryAction() {
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
    const result = await getAdClaimHistory(db, character.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Get ad claim history error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getAdRewardsAction() {
  try {
    const result = getAdRewards()
    return { success: true, data: result }
  } catch (error) {
    console.error('Get ad rewards error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
