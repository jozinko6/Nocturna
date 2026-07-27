'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDailyQuestById, selectDailyQuests } from '@/lib/config/daily-quests'

const QUESTS_PER_DAY = 3
const DAILY_REWARDS_STREAK = [
  { day: 1, gold: 50, crystals: 0 },
  { day: 2, gold: 75, crystals: 0 },
  { day: 3, gold: 100, crystals: 0 },
  { day: 4, gold: 150, crystals: 2 },
  { day: 5, gold: 200, crystals: 0 },
  { day: 6, gold: 250, crystals: 5 },
  { day: 7, gold: 500, crystals: 10 },
]

const claimQuestRewardSchema = z.object({
  missionId: z.string().uuid('Invalid mission ID'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
})

const claimDailyRewardSchema = z.object({
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
})

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function isYesterday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  return d.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
}

export async function getDailyQuests() {
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

    const today = getTodayDate()

    const { data: existingMissions } = await supabase
      .from('missions')
      .select('*')
      .eq('character_id', character.id)
      .eq('reset_date', today)

    if (existingMissions && existingMissions.length > 0) {
      const quests = existingMissions.map(m => {
        const template = getDailyQuestById(m.mission_type)
        return {
          missionId: m.id,
          missionType: m.mission_type,
          name: template?.name ?? m.mission_type,
          description: template?.description ?? '',
          targetCount: m.target_count,
          currentCount: m.current_count,
          completed: m.completed,
          claimed: m.claimed,
          rewardGold: template?.rewardGold ?? 0,
          rewardCrystals: template?.rewardCrystals ?? 0,
          rewardXp: template?.rewardXp ?? 0,
        }
      })
      return { success: true, data: { quests } }
    }

    const selected = selectDailyQuests(QUESTS_PER_DAY)
    const now = new Date().toISOString()

    const inserts = selected.map(q => ({
      character_id: character.id,
      mission_type: q.id,
      target_count: q.targetCount,
      current_count: 0,
      completed: false,
      claimed: false,
      reset_date: today,
      idempotency_key: `${character.id}_${q.id}_${today}`,
      created_at: now,
      updated_at: now,
    }))

    const { error: insertError } = await supabase
      .from('missions')
      .insert(inserts)

    if (insertError) {
      console.error('Mission insert error:', insertError)
      return { success: false, error: 'Failed to initialize daily quests' }
    }

    const { data: newMissions } = await supabase
      .from('missions')
      .select('*')
      .eq('character_id', character.id)
      .eq('reset_date', today)

    const quests = (newMissions || []).map(m => {
      const template = getDailyQuestById(m.mission_type)
      return {
        missionId: m.id,
        missionType: m.mission_type,
        name: template?.name ?? m.mission_type,
        description: template?.description ?? '',
        targetCount: m.target_count,
        currentCount: m.current_count,
        completed: m.completed,
        claimed: m.claimed,
        rewardGold: template?.rewardGold ?? 0,
        rewardCrystals: template?.rewardCrystals ?? 0,
        rewardXp: template?.rewardXp ?? 0,
      }
    })

    return { success: true, data: { quests } }
  } catch (error) {
    console.error('Get daily quests error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function claimQuestReward(missionId: string, idempotencyKey: string) {
  try {
    const validated = claimQuestRewardSchema.safeParse({ missionId, idempotencyKey })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, gold, experience')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const { data: mission, error: missionError } = await supabase
      .from('missions')
      .select('*')
      .eq('id', missionId)
      .eq('character_id', character.id)
      .single()
    if (missionError || !mission) return { success: false, error: 'Mission not found' }

    if (mission.claimed) return { success: false, error: 'Reward already claimed' }
    if (!mission.completed) return { success: false, error: 'Mission not completed' }

    const template = getDailyQuestById(mission.mission_type)
    if (!template) return { success: false, error: 'Invalid quest type' }

    const { data: existingLedger } = await supabase
      .from('currency_ledger')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()
    if (existingLedger) return { success: false, error: 'Request already processed' }

    const now = new Date().toISOString()

    const newGold = character.gold + template.rewardGold
    const newExp = character.experience + template.rewardXp

    await supabase
      .from('characters')
      .update({ gold: newGold, experience: newExp, updated_at: now })
      .eq('id', character.id)

    await supabase
      .from('currency_ledger')
      .insert({
        character_id: character.id,
        currency_type: 'gold',
        balance_before: character.gold,
        change_amount: template.rewardGold,
        balance_after: newGold,
        reason: `Daily quest reward: ${template.name}`,
        source_type: 'daily_quest',
        idempotency_key: idempotencyKey,
        created_at: now,
      })

    await supabase
      .from('missions')
      .update({ claimed: true, updated_at: now })
      .eq('id', missionId)

    return {
      success: true,
      data: {
        missionId,
        questName: template.name,
        goldReward: template.rewardGold,
        crystalsReward: template.rewardCrystals,
        experienceReward: template.rewardXp,
      },
    }
  } catch (error) {
    console.error('Claim quest reward error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getDailyReward() {
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

    const today = getTodayDate()

    const { data: todayReward } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('character_id', character.id)
      .eq('reward_date', today)
      .maybeSingle()

    if (todayReward) {
      return {
        success: true,
        data: {
          canClaim: false,
          streakDay: todayReward.streak_day,
          currentReward: DAILY_REWARDS_STREAK.find(r => r.day === todayReward.streak_day) || DAILY_REWARDS_STREAK[0],
          lastClaimDate: todayReward.reward_date,
          nextReward: null,
        },
      }
    }

    const { data: lastReward } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('character_id', character.id)
      .order('reward_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    let streakDay = 1
    let canClaim = true

    if (lastReward) {
      if (isYesterday(lastReward.reward_date)) {
        streakDay = lastReward.streak_day >= 7 ? 1 : lastReward.streak_day + 1
      } else {
        streakDay = 1
      }
    }

    const currentReward = DAILY_REWARDS_STREAK.find(r => r.day === streakDay) || DAILY_REWARDS_STREAK[0]

    return {
      success: true,
      data: {
        canClaim,
        streakDay,
        currentReward,
        lastClaimDate: lastReward?.reward_date || null,
        nextReward: streakDay < 7 ? DAILY_REWARDS_STREAK.find(r => r.day === streakDay + 1) : null,
      },
    }
  } catch (error) {
    console.error('Get daily reward error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function claimDailyReward(idempotencyKey: string) {
  try {
    const validated = claimDailyRewardSchema.safeParse({ idempotencyKey })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, gold, premium_currency')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const today = getTodayDate()

    const { data: todayReward } = await supabase
      .from('daily_rewards')
      .select('id')
      .eq('character_id', character.id)
      .eq('reward_date', today)
      .maybeSingle()
    if (todayReward) return { success: false, error: 'Daily reward already claimed today' }

    const { data: existingLedger } = await supabase
      .from('currency_ledger')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()
    if (existingLedger) return { success: false, error: 'Request already processed' }

    const { data: lastReward } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('character_id', character.id)
      .order('reward_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    let streakDay = 1
    if (lastReward && isYesterday(lastReward.reward_date)) {
      streakDay = lastReward.streak_day >= 7 ? 1 : lastReward.streak_day + 1
    }

    const currentReward = DAILY_REWARDS_STREAK.find(r => r.day === streakDay) || DAILY_REWARDS_STREAK[0]

    const now = new Date().toISOString()

    await supabase
      .from('daily_rewards')
      .insert({
        character_id: character.id,
        reward_date: today,
        streak_day: streakDay,
        claimed: true,
        idempotency_key: idempotencyKey,
        created_at: now,
      })

    const newGold = character.gold + currentReward.gold
    const newCrystals = character.premium_currency + currentReward.crystals

    await supabase
      .from('characters')
      .update({ gold: newGold, premium_currency: newCrystals, updated_at: now })
      .eq('id', character.id)

    if (currentReward.gold > 0) {
      await supabase
        .from('currency_ledger')
        .insert({
          character_id: character.id,
          currency_type: 'gold',
          balance_before: character.gold,
          change_amount: currentReward.gold,
          balance_after: newGold,
          reason: `Daily reward (Day ${streakDay})`,
          source_type: 'daily_reward',
          idempotency_key: `${idempotencyKey}_gold`,
          created_at: now,
        })
    }

    if (currentReward.crystals > 0) {
      await supabase
        .from('currency_ledger')
        .insert({
          character_id: character.id,
          currency_type: 'premium_crystals',
          balance_before: character.premium_currency,
          change_amount: currentReward.crystals,
          balance_after: newCrystals,
          reason: `Daily reward (Day ${streakDay})`,
          source_type: 'daily_reward',
          idempotency_key: `${idempotencyKey}_crystals`,
          created_at: now,
        })
    }

    return {
      success: true,
      data: {
        streakDay,
        goldReward: currentReward.gold,
        crystalsReward: currentReward.crystals,
        nextReward: streakDay < 7 ? DAILY_REWARDS_STREAK.find(r => r.day === streakDay + 1) : null,
      },
    }
  } catch (error) {
    console.error('Claim daily reward error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
