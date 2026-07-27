'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { crystalPackages, membershipTiers } from '@/lib/config/monetization'
import { nanoid } from 'nanoid'

const createCheckoutSchema = z.object({
  packageId: z.string().uuid('Invalid package ID'),
})

const purchaseCosmeticSchema = z.object({
  cosmeticId: z.string().min(1, 'Invalid cosmetic ID'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
})

export async function getCrystalPackages() {
  try {
    return {
      success: true,
      data: {
        packages: crystalPackages,
      },
    }
  } catch (error) {
    console.error('Get crystal packages error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function createCheckout(packageId: string) {
  try {
    const validated = createCheckoutSchema.safeParse({ packageId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const pkg = crystalPackages.find(p => p.id === packageId)
    if (!pkg) return { success: false, error: 'Package not found' }

    const sessionId = nanoid()

    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        item_name: pkg.name,
        crystal_amount: pkg.crystals + pkg.bonusCrystals,
        price_eur: Math.round(pkg.priceEur * 100),
        stripe_session_id: sessionId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (purchaseError) {
      console.error('Purchase insert error:', purchaseError)
      return { success: false, error: 'Failed to create checkout' }
    }

    return {
      success: true,
      data: {
        sessionId,
        checkoutUrl: `https://checkout.stripe.com/pay/${sessionId}`,
        package: pkg,
      },
    }
  } catch (error) {
    console.error('Create checkout error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getMembershipStatus() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('current_period_end', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subError || !subscription) {
      return {
        success: true,
        data: {
          isMember: false,
          membership: null,
        },
      }
    }

    const endDate = new Date(subscription.current_period_end)
    const now = new Date()
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const tier = membershipTiers.find(t => t.id === subscription.plan)

    return {
      success: true,
      data: {
        isMember: true,
        membership: {
          id: subscription.id,
          plan: subscription.plan,
          planName: tier?.name ?? subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          daysRemaining,
          bonuses: tier?.bonuses ?? null,
        },
      },
    }
  } catch (error) {
    console.error('Get membership status error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function purchaseCosmetic(cosmeticId: string, idempotencyKey: string) {
  try {
    const validated = purchaseCosmeticSchema.safeParse({ cosmeticId, idempotencyKey })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, premium_currency')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const { data: existingLedger } = await supabase
      .from('currency_ledger')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()
    if (existingLedger) return { success: false, error: 'Request already processed' }

    const COSMETIC_COST = 200
    if (character.premium_currency < COSMETIC_COST) {
      return { success: false, error: `Insufficient crystals. Required: ${COSMETIC_COST}, Available: ${character.premium_currency}` }
    }

    const now = new Date().toISOString()
    const newCrystals = character.premium_currency - COSMETIC_COST

    const { error: updateError } = await supabase
      .from('characters')
      .update({ premium_currency: newCrystals, updated_at: now })
      .eq('id', character.id)

    if (updateError) {
      console.error('Crystal deduction error:', updateError)
      return { success: false, error: 'Failed to deduct crystals' }
    }

    await supabase
      .from('currency_ledger')
      .insert({
        character_id: character.id,
        currency_type: 'premium_crystals',
        balance_before: character.premium_currency,
        change_amount: -COSMETIC_COST,
        balance_after: newCrystals,
        reason: `Cosmetic purchase: ${cosmeticId}`,
        source_type: 'cosmetic_purchase',
        idempotency_key: idempotencyKey,
        created_at: now,
      })

    return {
      success: true,
      data: {
        cosmeticId,
        cost: COSMETIC_COST,
        remainingCrystals: newCrystals,
      },
    }
  } catch (error) {
    console.error('Purchase cosmetic error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
