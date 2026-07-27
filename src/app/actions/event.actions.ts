'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/drizzle'
import {
  createEvent,
  startEvent,
  endEvent,
  joinEvent,
  leaveEvent,
  addEventScore,
  claimEventReward,
  getActiveEvents,
  getEventRankings,
  getCharacterEventStatus,
} from '@/game/events'

const createEventSchema = z.object({
  eventType: z.enum(['boss_rush', 'double_xp', 'double_gold', 'festival', 'invasion', 'challenge']),
  durationHours: z.number().int().positive().optional(),
})

const startEventSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
})

const endEventSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
})

const joinEventSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
})

const leaveEventSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
})

const addEventScoreSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  points: z.number().positive('Points must be positive'),
})

const claimEventRewardSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
})

const getEventRankingsSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  limit: z.number().int().positive().max(100).optional(),
})

const getCharacterEventStatusSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
})

export async function createEventAction(eventType: string, durationHours?: number) {
  try {
    const validated = createEventSchema.safeParse({ eventType, durationHours })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'admin') return { success: false, error: 'Unauthorized' }

    const db = getDb()
    const event = await createEvent(db, validated.data.eventType, undefined, durationHours)

    return { success: true, data: event }
  } catch (error) {
    console.error('Create event error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function startEventAction(eventId: string) {
  try {
    const validated = startEventSchema.safeParse({ eventId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'admin') return { success: false, error: 'Unauthorized' }

    const db = getDb()
    const event = await startEvent(db, eventId)

    return { success: true, data: event }
  } catch (error) {
    console.error('Start event error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function endEventAction(eventId: string) {
  try {
    const validated = endEventSchema.safeParse({ eventId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'admin') return { success: false, error: 'Unauthorized' }

    const db = getDb()
    const result = await endEvent(db, eventId)

    return { success: true, data: result }
  } catch (error) {
    console.error('End event error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function joinEventAction(eventId: string) {
  try {
    const validated = joinEventSchema.safeParse({ eventId })
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
    const participant = await joinEvent(db, eventId, character.id)

    return { success: true, data: participant }
  } catch (error) {
    console.error('Join event error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function leaveEventAction(eventId: string) {
  try {
    const validated = leaveEventSchema.safeParse({ eventId })
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
    const result = await leaveEvent(db, eventId, character.id)

    return { success: true, data: result }
  } catch (error) {
    console.error('Leave event error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function addEventScoreAction(eventId: string, points: number) {
  try {
    const validated = addEventScoreSchema.safeParse({ eventId, points })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'admin') return { success: false, error: 'Unauthorized' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const newScore = await addEventScore(db, eventId, character.id, points)

    return { success: true, data: { newScore } }
  } catch (error) {
    console.error('Add event score error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function claimEventRewardAction(eventId: string) {
  try {
    const validated = claimEventRewardSchema.safeParse({ eventId })
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
    const reward = await claimEventReward(db, eventId, character.id)

    return { success: true, data: reward }
  } catch (error) {
    console.error('Claim event reward error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getActiveEventsAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const events = await getActiveEvents(db)

    return { success: true, data: events }
  } catch (error) {
    console.error('Get active events error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getEventRankingsAction(eventId: string, limit?: number) {
  try {
    const validated = getEventRankingsSchema.safeParse({ eventId, limit })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const rankings = await getEventRankings(db, eventId, limit)

    return { success: true, data: rankings }
  } catch (error) {
    console.error('Get event rankings error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getCharacterEventStatusAction(eventId: string) {
  try {
    const validated = getCharacterEventStatusSchema.safeParse({ eventId })
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
    const status = await getCharacterEventStatus(db, eventId, character.id)

    return { success: true, data: status }
  } catch (error) {
    console.error('Get character event status error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
