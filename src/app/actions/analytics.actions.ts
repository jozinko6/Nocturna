'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { track, getAnalyticsStatus, flush } from '@/game/analytics'
import type { AnalyticsEvent } from '@/game/analytics'

const trackEventSchema = z.object({
  event: z.string().min(1, 'Event name is required'),
  properties: z.record(z.string(), z.unknown()),
})

async function verifyAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('users').select('role').eq('id', userId).single()
  if (data?.role !== 'administrator') throw new Error('Unauthorized')
}

export async function trackEventAction(event: string, properties: Record<string, unknown>) {
  try {
    const validated = trackEventSchema.safeParse({ event, properties })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    let userId: string | undefined
    let characterId: string | undefined

    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
        const { data: character } = await supabase
          .from('characters')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (character) characterId = character.id
      }
    } catch {}

    track({ event, properties } as AnalyticsEvent, userId, characterId)
    return { success: true }
  } catch (error) {
    console.error('Track event error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getAnalyticsStatusAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    await verifyAdmin(supabase, user.id)

    const result = getAnalyticsStatus()
    return { success: true, data: result }
  } catch (error) {
    console.error('Get analytics status error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function flushAnalyticsAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    await verifyAdmin(supabase, user.id)

    const flushedCount = flush()
    return { success: true, data: { flushedCount } }
  } catch (error) {
    console.error('Flush analytics error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
