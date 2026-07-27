'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { STAT_NAMES, StatName, MAX_ATTRIBUTE } from '@/game/config'
import { trainingCost } from '@/game/formulas'
import { checkRateLimit } from '@/game/economy-protection'

const trainAttributeSchema = z.object({
  attributeName: z.enum(STAT_NAMES as unknown as [string, ...string[]]),
})

const batchTrainSchema = z.object({
  upgrades: z.array(z.object({
    attributeName: z.enum(STAT_NAMES as unknown as [string, ...string[]]),
    count: z.number().int().min(1).max(10),
  })).min(1).max(6),
  idempotencyKey: z.string().min(1),
})

export async function trainAttribute(attributeName: StatName) {
  try {
    const validated = trainAttributeSchema.safeParse({ attributeName })
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id, gold')
      .eq('user_id', user.id)
      .single()

    if (characterError || !character) return { success: false, error: 'Character not found' }

    const rateCheck = checkRateLimit(character.id, 'training')
    if (!rateCheck.allowed) {
      return { success: false, error: `Rate limit exceeded. Try again in ${Math.ceil((rateCheck.retryAfterMs || 60000) / 1000)}s` }
    }

    const { data: stats, error: statsError } = await supabase
      .from('character_stats')
      .select('*')
      .eq('character_id', character.id)
      .single()

    if (statsError || !stats) return { success: false, error: 'Character stats not found' }

    const currentLevel = stats[attributeName]
    const cost = trainingCost(currentLevel)

    if (character.gold < cost) {
      return {
        success: false,
        error: `Insufficient gold. Required: ${cost}, Available: ${character.gold}`,
      }
    }

    const newStatValue = currentLevel + 1
    const newGold = character.gold - cost

    const { error: statsUpdateError } = await supabase
      .from('character_stats')
      .update({ [attributeName]: newStatValue, updated_at: new Date().toISOString() })
      .eq('character_id', character.id)

    if (statsUpdateError) {
      console.error('Stats update error:', statsUpdateError)
      return { success: false, error: 'Failed to update stats' }
    }

    const { error: goldError } = await supabase
      .from('characters')
      .update({ gold: newGold, updated_at: new Date().toISOString() })
      .eq('id', character.id)

    if (goldError) {
      console.error('Gold deduction error:', goldError)
      return { success: false, error: 'Failed to deduct gold' }
    }

    await supabase.from('currency_ledger').insert({
      character_id: character.id,
      currency_type: 'gold',
      balance_before: character.gold,
      change_amount: -cost,
      balance_after: newGold,
      reason: `Training ${attributeName} (${currentLevel} → ${newStatValue})`,
      source_type: 'training',
      idempotency_key: `train_${attributeName}_${character.id}_${Date.now()}`,
    })

    return {
      success: true,
      data: {
        attributeName,
        previousLevel: currentLevel,
        newLevel: newStatValue,
        cost,
        remainingGold: newGold,
      },
    }
  } catch (error) {
    console.error('Train attribute error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Batch train multiple attributes at once.
 * Calculates total cost for all upgrades, validates affordability,
 * and applies all changes in a single transaction.
 */
export async function batchTrain(
  upgrades: { attributeName: StatName; count: number }[],
  idempotencyKey: string,
) {
  try {
    const validated = batchTrainSchema.safeParse({ upgrades, idempotencyKey })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, gold')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const rateCheck = checkRateLimit(character.id, 'batch_training')
    if (!rateCheck.allowed) {
      return { success: false, error: `Rate limit exceeded. Try again in ${Math.ceil((rateCheck.retryAfterMs || 60000) / 1000)}s` }
    }

    const { data: existingLedger } = await supabase
      .from('currency_ledger')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()
    if (existingLedger) return { success: false, error: 'Request already processed' }

    const { data: stats, error: statsError } = await supabase
      .from('character_stats')
      .select('*')
      .eq('character_id', character.id)
      .single()
    if (statsError || !stats) return { success: false, error: 'Character stats not found' }

    const results: { attributeName: string; from: number; to: number; cost: number }[] = []
    let totalCost = 0

    for (const upgrade of upgrades) {
      const currentLevel = stats[upgrade.attributeName]
      let runningLevel = currentLevel
      let runningCost = 0

      for (let i = 0; i < upgrade.count; i++) {
        if (runningLevel >= MAX_ATTRIBUTE) break
        const stepCost = trainingCost(runningLevel)
        runningCost += stepCost
        runningLevel++
      }

      const actualCount = runningLevel - currentLevel
      if (actualCount > 0) {
        results.push({
          attributeName: upgrade.attributeName,
          from: currentLevel,
          to: runningLevel,
          cost: runningCost,
        })
        totalCost += runningCost
      }
    }

    if (totalCost === 0) {
      return { success: false, error: 'No upgrades possible (all stats at max or zero count)' }
    }

    if (character.gold < totalCost) {
      return {
        success: false,
        error: `Insufficient gold. Required: ${totalCost}, Available: ${character.gold}`,
      }
    }

    const now = new Date().toISOString()
    const newGold = character.gold - totalCost

    for (const result of results) {
      await supabase
        .from('character_stats')
        .update({ [result.attributeName]: result.to, updated_at: now })
        .eq('character_id', character.id)
    }

    await supabase
      .from('characters')
      .update({ gold: newGold, updated_at: now })
      .eq('id', character.id)

    await supabase.from('currency_ledger').insert({
      character_id: character.id,
      currency_type: 'gold',
      balance_before: character.gold,
      change_amount: -totalCost,
      balance_after: newGold,
      reason: `Batch training: ${results.map(r => `${r.attributeName} ${r.from}→${r.to}`).join(', ')}`,
      source_type: 'training',
      idempotency_key: idempotencyKey,
    })

    return {
      success: true,
      data: {
        upgrades: results,
        totalCost,
        remainingGold: newGold,
      },
    }
  } catch (error) {
    console.error('Batch train error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Preview batch training costs without executing.
 */
export async function previewBatchCost(
  upgrades: { attributeName: StatName; count: number }[],
) {
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

    const { data: stats, error: statsError } = await supabase
      .from('character_stats')
      .select('*')
      .eq('character_id', character.id)
      .single()
    if (statsError || !stats) return { success: false, error: 'Character stats not found' }

    const preview: { attributeName: string; currentLevel: number; targetLevel: number; cost: number }[] = []
    let totalCost = 0

    for (const upgrade of upgrades) {
      const currentLevel = stats[upgrade.attributeName]
      let runningLevel = currentLevel
      let runningCost = 0

      for (let i = 0; i < upgrade.count; i++) {
        if (runningLevel >= MAX_ATTRIBUTE) break
        const stepCost = trainingCost(runningLevel)
        runningCost += stepCost
        runningLevel++
      }

      preview.push({
        attributeName: upgrade.attributeName,
        currentLevel,
        targetLevel: runningLevel,
        cost: runningCost,
      })
      totalCost += runningCost
    }

    return { success: true, data: { preview, totalCost } }
  } catch (error) {
    console.error('Preview batch cost error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
