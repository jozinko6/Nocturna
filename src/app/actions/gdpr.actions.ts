'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/drizzle'
import {
  requestDataExport,
  requestDataDeletion,
  requestDataCorrection,
  exportUserData,
  getGdprRequests,
  processGdprRequest,
} from '@/game/gdpr'

const requestDataCorrectionSchema = z.object({
  notes: z.string().optional(),
})

const getGdprRequestsSchema = z.object({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
})

const processGdprRequestSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
})

async function verifyAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('users').select('role').eq('id', userId).single()
  if (data?.role !== 'administrator') throw new Error('Unauthorized')
}

export async function requestDataExportAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const result = await requestDataExport(db, user.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Request data export error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function requestDataDeletionAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const result = await requestDataDeletion(db, user.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Request data deletion error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function requestDataCorrectionAction(notes?: string) {
  try {
    const validated = requestDataCorrectionSchema.safeParse({ notes })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const result = await requestDataCorrection(db, user.id, validated.data.notes)
    return { success: true, data: result }
  } catch (error) {
    console.error('Request data correction error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function exportUserDataAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const db = getDb()
    const result = await exportUserData(db, user.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Export user data error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getGdprRequestsAction(limit?: number, offset?: number) {
  try {
    const validated = getGdprRequestsSchema.safeParse({ limit, offset })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    await verifyAdmin(supabase, user.id)

    const db = getDb()
    const result = await getGdprRequests(db, validated.data.limit, validated.data.offset)
    return { success: true, data: result }
  } catch (error) {
    console.error('Get GDPR requests error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function processGdprRequestAction(requestId: string) {
  try {
    const validated = processGdprRequestSchema.safeParse({ requestId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    await verifyAdmin(supabase, user.id)

    const db = getDb()
    const result = await processGdprRequest(db, validated.data.requestId, user.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Process GDPR request error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
