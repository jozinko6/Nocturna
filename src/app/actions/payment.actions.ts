'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/drizzle'
import {
  getAllCrystalPackages,
  getAllMembershipTiers,
  createPurchaseIntent,
  completePurchase,
  subscribeMembership,
  cancelSubscription,
  isSubscriptionActive,
  spendCrystals as spendCrystalsFn,
  refundEnergy as refundEnergyFn,
} from '@/game/payments'

const purchaseSchema = z.object({ packId: z.string().min(1, 'Pack ID is required') })
const completePurchaseSchema = z.object({
  purchaseId: z.string().uuid('Invalid purchase ID'),
  stripeSessionId: z.string().min(1, 'Stripe session ID is required'),
})
const membershipSchema = z.object({ membershipId: z.string().min(1, 'Membership ID is required') })
const cancelSchema = z.object({ subscriptionId: z.string().uuid('Invalid subscription ID') })
const spendSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  reason: z.string().min(1, 'Reason is required'),
})

export async function getCrystalPackagesAction() {
  try {
    const packages = getAllCrystalPackages()
    return { success: true, data: { packages } }
  } catch (error) {
    console.error('Get crystal packages error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getMembershipTiersAction() {
  try {
    const tiers = getAllMembershipTiers()
    return { success: true, data: { tiers } }
  } catch (error) {
    console.error('Get membership tiers error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function purchaseCrystalsAction(packId: string) {
  try {
    const validated = purchaseSchema.safeParse({ packId })
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
    const result = await createPurchaseIntent(db, user.id, packId)
    return { success: true, data: result }
  } catch (error) {
    console.error('Purchase crystals error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function completePurchaseAction(purchaseId: string, stripeSessionId: string) {
  try {
    const validated = completePurchaseSchema.safeParse({ purchaseId, stripeSessionId })
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
    const result = await completePurchase(db, user.id, purchaseId, stripeSessionId, null)
    return { success: true, data: result }
  } catch (error) {
    console.error('Complete purchase error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function subscribeToMembershipAction(membershipId: string) {
  try {
    const validated = membershipSchema.safeParse({ membershipId })
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
    const result = await subscribeMembership(db, user.id, membershipId)
    return { success: true, data: result }
  } catch (error) {
    console.error('Subscribe to membership error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function cancelSubscriptionAction(subscriptionId: string) {
  try {
    const validated = cancelSchema.safeParse({ subscriptionId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    await cancelSubscription(db, subscriptionId)
    return { success: true, data: { canceled: true } }
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function getSubscriptionStatusAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const active = await isSubscriptionActive(db, user.id)
    return { success: true, data: { active } }
  } catch (error) {
    console.error('Get subscription status error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function spendCrystalsAction(amount: number, reason: string) {
  try {
    const validated = spendSchema.safeParse({ amount, reason })
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
    const newBalance = await spendCrystalsFn(db, character.id, amount, reason)
    return { success: true, data: { newBalance } }
  } catch (error) {
    console.error('Spend crystals error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function getCrystalBalanceAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('premium_currency')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    return { success: true, data: { balance: character.premium_currency } }
  } catch (error) {
    console.error('Get crystal balance error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function refundEnergyAction() {
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
    const result = await refundEnergyFn(db, character.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Refund energy error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}
