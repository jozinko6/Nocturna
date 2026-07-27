'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/drizzle'
import {
  generateReferralCode,
  validateReferralCode,
  applyReferral,
  claimReferralReward,
  getReferralStats,
  getReferralRewards,
} from '@/game/referrals'

const validateCodeSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{8}$/, 'Invalid code format'),
})

const applyReferralSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{8}$/, 'Invalid code format'),
})

const claimRewardSchema = z.object({
  rewardId: z.string().uuid('Invalid reward ID'),
})

export async function generateReferralCodeAction() {
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
    const result = await generateReferralCode(db, character.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Generate referral code error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function validateReferralCodeAction(code: string) {
  try {
    const validated = validateCodeSchema.safeParse({ code: code.toUpperCase() })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const db = getDb()
    const result = await validateReferralCode(db, validated.data.code)
    return { success: true, data: result }
  } catch (error) {
    console.error('Validate referral code error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function applyReferralAction(code: string) {
  try {
    const validated = applyReferralSchema.safeParse({ code: code.toUpperCase() })
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
    const result = await applyReferral(db, character.id, validated.data.code)
    return { success: true, data: result }
  } catch (error) {
    console.error('Apply referral error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function claimReferralRewardAction(rewardId: string) {
  try {
    const validated = claimRewardSchema.safeParse({ rewardId })
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
    const result = await claimReferralReward(db, character.id, validated.data.rewardId)
    return { success: true, data: result }
  } catch (error) {
    console.error('Claim referral reward error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function getReferralStatsAction() {
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
    const result = await getReferralStats(db, character.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Get referral stats error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getReferralRewardsAction() {
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
    const result = await getReferralRewards(db, character.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Get referral rewards error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
