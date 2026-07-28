'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { calculateCurrentEnergy, levelFromExperience } from '@/game/formulas'
import { ENERGY_REGEN_RATE, ENERGY_REGEN_INTERVAL_MINUTES } from '@/game/config'
import { DIFFICULTY_MAP } from '@/game/config'
import { generateSeed, createRng } from '@/game/rng'
import { createPlayerSnapshot, createEnemySnapshot } from '@/game/snapshot'
import { simulateBattle } from '@/game/combat'
import { calculateExpeditionReward } from '@/game/rewards'
import { difficultyMultipliers, DifficultyModifier, getEventsForLevel } from '@/lib/config/expeditions'
import { getEnemyById } from '@/lib/config/enemies'
import { getRegionById } from '@/lib/config/regions'

const ENERGY_COSTS: Record<string, number> = {
  safe: 10,
  uncertain: 15,
  dangerous: 20,
  lethal: 30,
}

const DURATION_SECONDS: Record<string, number> = {
  safe: 30,
  uncertain: 120,
  dangerous: 300,
  lethal: 600,
}

const startExpeditionSchema = z.object({
  regionId: z.string().refine((regionId) => Boolean(getRegionById(regionId)), 'Invalid region ID'),
  difficulty: z.enum(['safe', 'uncertain', 'dangerous', 'lethal']),
})

const completeExpeditionSchema = z.object({
  expeditionId: z.string().uuid('Invalid expedition ID'),
})

const claimRewardSchema = z.object({
  expeditionId: z.string().uuid('Invalid expedition ID'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
})

export async function startExpedition(regionId: string, difficulty: 'safe' | 'uncertain' | 'dangerous' | 'lethal') {
  try {
    const validated = startExpeditionSchema.safeParse({ regionId, difficulty })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id, level, experience')
      .eq('user_id', user.id)
      .single()
    if (characterError || !character) return { success: false, error: 'Character not found' }

    const { data: resources } = await supabase
      .from('character_resources')
      .select('current_energy, max_energy, last_energy_update')
      .eq('character_id', character.id)
      .single()
    if (!resources) return { success: false, error: 'Character resources not found' }

    const currentEnergy = calculateCurrentEnergy(
      resources.current_energy,
      resources.max_energy,
      resources.last_energy_update,
      ENERGY_REGEN_RATE,
      ENERGY_REGEN_INTERVAL_MINUTES,
    )

    const energyCost = ENERGY_COSTS[difficulty]
    if (currentEnergy < energyCost) {
      return { success: false, error: `Insufficient energy. Required: ${energyCost}, Available: ${currentEnergy}` }
    }

    const { data: activeActivity } = await supabase
      .from('activities')
      .select('id')
      .eq('character_id', character.id)
      .eq('activity_type', 'expedition')
      .eq('status', 'in_progress')
      .maybeSingle()
    if (activeActivity) return { success: false, error: 'Already in an active expedition' }

    const now = new Date()
    const duration = DURATION_SECONDS[difficulty]
    const endsAt = new Date(now.getTime() + duration * 1000)

    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .insert({
        character_id: character.id,
        activity_type: 'expedition',
        status: 'in_progress',
        started_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
        config: { regionId, difficulty },
      })
      .select()
      .single()

    if (activityError || !activity) {
      console.error('Activity creation error:', activityError)
      return { success: false, error: 'Failed to start expedition' }
    }

    const { error: energyError } = await supabase
      .from('character_resources')
      .update({
        current_energy: Math.floor(currentEnergy - energyCost),
        last_energy_update: now.toISOString(),
      })
      .eq('character_id', character.id)

    if (energyError) {
      console.error('Energy deduction error:', energyError)
      return { success: false, error: 'Failed to deduct energy' }
    }

    return {
      success: true,
      data: {
        activity,
        energyCost,
        duration,
        endsAt: endsAt.toISOString(),
      },
    }
  } catch (error) {
    console.error('Start expedition error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function completeExpedition(expeditionId: string) {
  try {
    const validated = completeExpeditionSchema.safeParse({ expeditionId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id, level, experience')
      .eq('user_id', user.id)
      .single()
    if (characterError || !character) return { success: false, error: 'Character not found' }

    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', expeditionId)
      .eq('character_id', character.id)
      .eq('activity_type', 'expedition')
      .single()
    if (activityError || !activity) return { success: false, error: 'Expedition not found' }
    if (activity.status !== 'in_progress') return { success: false, error: 'Expedition is not in progress' }

    const endsAt = new Date(activity.ends_at)
    if (endsAt > new Date()) return { success: false, error: 'Expedition has not ended yet' }

    const config = activity.config as { regionId: string; difficulty: string }
    const difficultyMod = (DIFFICULTY_MAP[config.difficulty] || 'normal') as DifficultyModifier
    const mult = difficultyMultipliers[difficultyMod]

    const { data: stats } = await supabase
      .from('character_stats')
      .select('*')
      .eq('character_id', character.id)
      .single()

    const { data: resources } = await supabase
      .from('character_resources')
      .select('hit_points, max_hit_points')
      .eq('character_id', character.id)
      .single()

    const { data: equipmentSlots } = await supabase
      .from('equipment_slots')
      .select('slot_type, item_id, character_items (id, template_id, item_templates (*))')
      .eq('character_id', character.id)

    const equipment: Record<string, any> = {}
    if (equipmentSlots) {
      for (const slot of equipmentSlots) {
        const items = slot.character_items as any
        if (items?.item_templates) {
          equipment[slot.slot_type] = items.item_templates
        }
      }
    }

    const seed = generateSeed()
    const rng = createRng(seed)

    const events = getEventsForLevel(config.regionId, character.level)
    const event = events.length > 0 ? events[Math.floor(rng() * events.length)] : null

    const enemyId = event?.enemyId
    const enemyTemplate = enemyId ? getEnemyById(enemyId) : null

    let attackerSnapshot, defenderSnapshot
    if (stats && resources) {
      attackerSnapshot = createPlayerSnapshot(
        character.id,
        'Player',
        character.level,
        { strength: stats.strength, dexterity: stats.dexterity, endurance: stats.endurance,
          perception: stats.perception, willpower: stats.willpower, luck: stats.luck },
        equipment,
        resources.hit_points,
        resources.max_hit_points,
      )
    }

    if (enemyTemplate) {
      const enemyLevel = Math.max(enemyTemplate.levelRange[0], Math.min(character.level, enemyTemplate.levelRange[1]))
      const levelScale = 1 + (enemyLevel - enemyTemplate.levelRange[0]) * 0.1
      defenderSnapshot = createEnemySnapshot(
        enemyTemplate.name,
        enemyLevel,
        Math.floor(enemyTemplate.baseStats.endurance * 8 * mult.enemyHpMultiplier * levelScale),
        Math.floor(enemyTemplate.weaponDamage * mult.enemyDamageMultiplier * levelScale),
        Math.floor(enemyTemplate.armor * levelScale),
      )
    } else {
      defenderSnapshot = createEnemySnapshot('Neznámy nepriateľ', character.level, 50, 8, 3)
    }

    const battleResult = simulateBattle(attackerSnapshot!, defenderSnapshot, rng)
    const victory = battleResult.winner === 'attacker'

    const lootTable = enemyTemplate?.lootTable?.map(l => ({ itemId: l.itemId, dropChance: l.dropChance })) || []
    const rewards = calculateExpeditionReward(difficultyMod, victory, rng, lootTable)

    const { data: battleReport, error: brError } = await supabase
      .from('battle_reports')
      .insert({
        attacker_id: character.id,
        defender_id: null,
        battle_type: 'pve',
        seed,
        rounds: battleResult.rounds,
        result: { winner: battleResult.winner, totalAttackerDamage: battleResult.totalAttackerDamage, totalDefenderDamage: battleResult.totalDefenderDamage },
        winner_id: victory ? character.id : null,
        attacker_snapshot: attackerSnapshot,
        defender_snapshot: defenderSnapshot,
        engine_version: '0.1.0',
      })
      .select()
      .single()

    if (brError || !battleReport) {
      console.error('Battle report error:', brError)
      return { success: false, error: 'Failed to create battle report' }
    }

    const idempotencyKey = `exp_reward_${expeditionId}_${Date.now()}`
    const { error: rewardError } = await supabase.from('activity_rewards').insert({
      activity_id: expeditionId,
      character_id: character.id,
      gold_amount: rewards.gold,
      experience_amount: rewards.experience,
      item_id: rewards.itemDropId,
      reward_type: 'expedition',
      claimed: false,
      idempotency_key: idempotencyKey,
    })

    if (rewardError) {
      console.error('Reward creation error:', rewardError)
    }

    const { error: updateError } = await supabase
      .from('activities')
      .update({
        status: 'completed',
        claimed_at: null,
        config: { ...config, battleReportId: battleReport.id },
      })
      .eq('id', expeditionId)

    if (updateError) {
      console.error('Activity update error:', updateError)
      return { success: false, error: 'Failed to complete expedition' }
    }

    // Update missions progress
    const today = new Date().toISOString().split('T')[0]
    const { data: mission } = await supabase
      .from('missions')
      .select('id, current_count, target_count')
      .eq('character_id', character.id)
      .eq('mission_type', 'complete_expedition')
      .eq('reset_date', today)
      .maybeSingle()

    if (mission && mission.current_count < mission.target_count) {
      await supabase
        .from('missions')
        .update({ current_count: mission.current_count + 1, updated_at: new Date().toISOString() })
        .eq('id', mission.id)
    }

    return {
      success: true,
      data: {
        expeditionId,
        victory,
        rewards,
        battleReport: {
          id: battleReport.id,
          rounds: battleResult.rounds,
          winner: battleResult.winner,
        },
      },
    }
  } catch (error) {
    console.error('Complete expedition error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function claimExpeditionReward(expeditionId: string, idempotencyKey: string) {
  try {
    const validated = claimRewardSchema.safeParse({ expeditionId, idempotencyKey })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id, gold, experience, level')
      .eq('user_id', user.id)
      .single()
    if (characterError || !character) return { success: false, error: 'Character not found' }

    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', expeditionId)
      .eq('character_id', character.id)
      .eq('activity_type', 'expedition')
      .single()
    if (activityError || !activity) return { success: false, error: 'Expedition not found' }
    if (activity.status !== 'completed') return { success: false, error: 'Expedition not completed' }

    const { data: reward, error: rewardError } = await supabase
      .from('activity_rewards')
      .select('*')
      .eq('activity_id', expeditionId)
      .eq('claimed', false)
      .maybeSingle()

    if (rewardError || !reward) return { success: false, error: 'No reward to claim' }

    // Check idempotency via currency_ledger
    const { data: existingLedger } = await supabase
      .from('currency_ledger')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()
    if (existingLedger) return { success: false, error: 'Reward already claimed' }

    const newGold = character.gold + reward.gold_amount
    const newExp = character.experience + reward.experience_amount

    const { error: goldError } = await supabase
      .from('characters')
      .update({ gold: newGold, experience: newExp, updated_at: new Date().toISOString() })
      .eq('id', character.id)
    if (goldError) {
      console.error('Gold update error:', goldError)
      return { success: false, error: 'Failed to add rewards' }
    }

    if (reward.gold_amount > 0) {
      await supabase.from('currency_ledger').insert({
        character_id: character.id,
        currency_type: 'gold',
        balance_before: character.gold,
        change_amount: reward.gold_amount,
        balance_after: newGold,
        reason: `Expedition reward`,
        source_type: 'expedition_reward',
        source_id: expeditionId,
        idempotency_key: idempotencyKey,
      })
    }

    if (reward.item_id) {
      await supabase.from('character_items').insert({
        character_id: character.id,
        template_id: reward.item_id,
        quantity: 1,
      })
    }

    // Check level up
    const newLevel = levelFromExperience(newExp)
    if (newLevel > character.level) {
      await supabase
        .from('characters')
        .update({ level: newLevel, updated_at: new Date().toISOString() })
        .eq('id', character.id)
    }

    await supabase
      .from('activity_rewards')
      .update({ claimed: true })
      .eq('id', reward.id)

    await supabase
      .from('activities')
      .update({ status: 'claimed', claimed_at: new Date().toISOString() })
      .eq('id', expeditionId)

    return {
      success: true,
      data: {
        expeditionId,
        goldReward: reward.gold_amount,
        experienceReward: reward.experience_amount,
        itemId: reward.item_id,
        newGold,
        newExperience: newExp,
      },
    }
  } catch (error) {
    console.error('Claim expedition reward error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getExpeditions() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (characterError || !character) return { success: false, error: 'Character not found' }

    const { data: expeditions, error } = await supabase
      .from('activities')
      .select(`
        *,
        activity_rewards (*)
      `)
      .eq('character_id', character.id)
      .eq('activity_type', 'expedition')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return { success: false, error: 'Failed to fetch expeditions' }

    return { success: true, data: { expeditions: expeditions || [] } }
  } catch (error) {
    console.error('Get expeditions error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getExpeditionResult(expeditionId: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (characterError || !character) return { success: false, error: 'Character not found' }

    const { data: expedition, error: expError } = await supabase
      .from('activities')
      .select(`
        *,
        activity_rewards (*)
      `)
      .eq('id', expeditionId)
      .eq('character_id', character.id)
      .single()

    if (expError || !expedition) return { success: false, error: 'Expedition not found' }

    const config = expedition.config as { battleReportId?: string } | null
    let battleReports: unknown[] = []

    if (config?.battleReportId) {
      const { data: battleReport } = await supabase
        .from('battle_reports')
        .select('*')
        .eq('id', config.battleReportId)
        .maybeSingle()

      if (battleReport) battleReports = [battleReport]
    }

    return {
      success: true,
      data: {
        expedition: { ...expedition, battle_reports: battleReports },
      },
    }
  } catch (error) {
    console.error('Get expedition result error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
