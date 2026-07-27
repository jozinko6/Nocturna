'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/drizzle'
import {
  createClan,
  joinClan,
  leaveClan,
  kickMember,
  depositToTreasury,
  withdrawFromTreasury,
  startClanQuest,
  claimClanQuestReward,
  getClanInfo,
  getClanMembers,
  searchClans,
  transferLeadership,
  promoteMember,
  demoteMember,
  type ClanQuestType,
  CLAN_NAME_MIN,
  CLAN_NAME_MAX,
  CLAN_TAG_MIN,
  CLAN_TAG_MAX,
} from '@/game/clans'

const createClanSchema = z.object({
  name: z.string().min(CLAN_NAME_MIN, `Name must be at least ${CLAN_NAME_MIN} characters.`).max(CLAN_NAME_MAX, `Name must be at most ${CLAN_NAME_MAX} characters.`),
  tag: z.string().min(CLAN_TAG_MIN, `Tag must be at least ${CLAN_TAG_MIN} characters.`).max(CLAN_TAG_MAX, `Tag must be at most ${CLAN_TAG_MAX} characters.`),
  description: z.string().optional(),
})

const targetIdSchema = z.object({
  targetId: z.string().uuid('Invalid target ID'),
})

const amountSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
})

const clanIdSchema = z.object({
  clanId: z.string().uuid('Invalid clan ID'),
})

const questTypeSchema = z.object({
  type: z.enum(['collect_gold', 'collect_xp', 'pvp_wins', 'expeditions', 'training_sessions']),
})

export async function createClanAction(name: string, tag: string, description?: string) {
  try {
    const validated = createClanSchema.safeParse({ name, tag, description })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, name, level')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await createClan(db, character.id, name, tag, description ?? '')
    if ('error' in result) return { success: false, error: result.error }

    return { success: true, data: { clan: result.clan } }
  } catch (error) {
    console.error('Create clan error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function joinClanAction(targetClanId: string) {
  try {
    const validated = clanIdSchema.safeParse({ clanId: targetClanId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, name, level')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await joinClan(db, character.id, targetClanId)
    if ('error' in result) return { success: false, error: result.error }

    return { success: true, data: { joined: true } }
  } catch (error) {
    console.error('Join clan error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function leaveClanAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, name, level')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await leaveClan(db, character.id)
    if ('error' in result) return { success: false, error: result.error }

    return { success: true, data: { left: true } }
  } catch (error) {
    console.error('Leave clan error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function kickMemberAction(targetId: string) {
  try {
    const validated = targetIdSchema.safeParse({ targetId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, name, level')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await kickMember(db, character.id, targetId)
    if ('error' in result) return { success: false, error: result.error }

    return { success: true, data: { kicked: true } }
  } catch (error) {
    console.error('Kick member error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function depositToTreasuryAction(amount: number) {
  try {
    const validated = amountSchema.safeParse({ amount })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, name, level')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await depositToTreasury(db, character.id, amount)
    if ('error' in result) return { success: false, error: result.error }

    return { success: true, data: { xpGain: result.xpGain } }
  } catch (error) {
    console.error('Deposit to treasury error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function withdrawFromTreasuryAction(amount: number) {
  try {
    const validated = amountSchema.safeParse({ amount })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, name, level')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await withdrawFromTreasury(db, character.id, amount)
    if ('error' in result) return { success: false, error: result.error }

    return { success: true, data: { withdrawn: true } }
  } catch (error) {
    console.error('Withdraw from treasury error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function startClanQuestAction(type: string) {
  try {
    const validated = questTypeSchema.safeParse({ type })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, name, level')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()

    const { data: membership, error: memError } = await supabase
      .from('clan_members')
      .select('clan_id')
      .eq('character_id', character.id)
      .single()
    if (memError || !membership) return { success: false, error: 'You are not in a clan' }

    const result = await startClanQuest(db, membership.clan_id, type as ClanQuestType, character.id)
    if ('error' in result) return { success: false, error: result.error }

    return { success: true, data: { quest: result.quest } }
  } catch (error) {
    console.error('Start clan quest error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function claimClanQuestRewardAction(clanId: string) {
  try {
    const validated = clanIdSchema.safeParse({ clanId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, name, level')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await claimClanQuestReward(db, clanId)
    if ('error' in result) return { success: false, error: result.error }

    return { success: true, data: result }
  } catch (error) {
    console.error('Claim clan quest reward error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getClanInfoAction(clanId: string) {
  try {
    const validated = clanIdSchema.safeParse({ clanId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const info = await getClanInfo(db, clanId)
    if (!info) return { success: false, error: 'Clan not found' }

    return { success: true, data: info }
  } catch (error) {
    console.error('Get clan info error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getClanMembersAction(clanId: string) {
  try {
    const validated = clanIdSchema.safeParse({ clanId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const members = await getClanMembers(db, clanId)

    return { success: true, data: { members } }
  } catch (error) {
    console.error('Get clan members error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function searchClansAction(searchTerm: string) {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return { success: false, error: 'Search term is required' }
    }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const clans = await searchClans(db, searchTerm.trim())

    return { success: true, data: { clans } }
  } catch (error) {
    console.error('Search clans error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function transferLeadershipAction(newLeaderId: string) {
  try {
    const validated = targetIdSchema.safeParse({ targetId: newLeaderId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, name, level')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await transferLeadership(db, character.id, newLeaderId)
    if ('error' in result) return { success: false, error: result.error }

    return { success: true, data: { transferred: true } }
  } catch (error) {
    console.error('Transfer leadership error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function promoteMemberAction(targetId: string) {
  try {
    const validated = targetIdSchema.safeParse({ targetId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, name, level')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await promoteMember(db, character.id, targetId)
    if ('error' in result) return { success: false, error: result.error }

    return { success: true, data: { newRank: result.newRank } }
  } catch (error) {
    console.error('Promote member error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function demoteMemberAction(targetId: string) {
  try {
    const validated = targetIdSchema.safeParse({ targetId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, name, level')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await demoteMember(db, character.id, targetId)
    if ('error' in result) return { success: false, error: result.error }

    return { success: true, data: { newRank: result.newRank } }
  } catch (error) {
    console.error('Demote member error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
