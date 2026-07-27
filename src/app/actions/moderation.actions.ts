'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/drizzle'
import {
  submitReport,
  getPendingReports,
  reviewReport,
  dismissReport,
  getModerationHistory,
  getReportStats,
  getCharacterModerationSummary,
  REPORT_REASONS,
  MODERATION_ACTION_TYPES,
} from '@/game/moderation'

const submitReportSchema = z.object({
  reportedId: z.string().uuid('Invalid character ID'),
  reason: z.enum(REPORT_REASONS),
  description: z.string().max(2000).optional(),
  battleReportId: z.string().uuid().optional(),
})

const reviewReportSchema = z.object({
  reportId: z.string().uuid('Invalid report ID'),
  action: z.enum(MODERATION_ACTION_TYPES),
  resolution: z.string().max(500).optional(),
})

const dismissReportSchema = z.object({
  reportId: z.string().uuid('Invalid report ID'),
  reason: z.string().max(500).optional(),
})

const moderationHistorySchema = z.object({
  targetCharacterId: z.string().uuid('Invalid character ID'),
})

const characterModerationSummarySchema = z.object({
  characterId: z.string().uuid('Invalid character ID'),
})

async function verifyAdmin(userId: string) {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !profile || profile.role !== 'administrator') return false
  return true
}

export async function submitReportAction(
  reportedId: string,
  reason: string,
  description?: string,
  battleReportId?: string,
) {
  try {
    const validated = submitReportSchema.safeParse({ reportedId, reason, description, battleReportId })
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
    const report = await submitReport(
      db,
      character.id,
      reportedId,
      validated.data.reason,
      description,
      battleReportId,
    )

    return { success: true, data: report }
  } catch (error) {
    console.error('Submit report error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function getPendingReportsAction(limit?: number) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin role required' }

    const db = getDb()
    const reports = await getPendingReports(db, limit)

    return { success: true, data: reports }
  } catch (error) {
    console.error('Get pending reports error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function reviewReportAction(reportId: string, action: string, resolution?: string) {
  try {
    const validated = reviewReportSchema.safeParse({ reportId, action, resolution })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin role required' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await reviewReport(
      db,
      character.id,
      validated.data.reportId,
      validated.data.action,
      resolution,
    )

    return { success: true, data: result }
  } catch (error) {
    console.error('Review report error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function dismissReportAction(reportId: string, reason?: string) {
  try {
    const validated = dismissReportSchema.safeParse({ reportId, reason })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin role required' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const db = getDb()
    const result = await dismissReport(db, character.id, validated.data.reportId, reason)

    return { success: true, data: result }
  } catch (error) {
    console.error('Dismiss report error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function getModerationHistoryAction(targetCharacterId: string) {
  try {
    const validated = moderationHistorySchema.safeParse({ targetCharacterId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin role required' }

    const db = getDb()
    const history = await getModerationHistory(db, validated.data.targetCharacterId)

    return { success: true, data: history }
  } catch (error) {
    console.error('Get moderation history error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getReportStatsAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin role required' }

    const db = getDb()
    const stats = await getReportStats(db)

    return { success: true, data: stats }
  } catch (error) {
    console.error('Get report stats error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getCharacterModerationSummaryAction(characterId: string) {
  try {
    const validated = characterModerationSummarySchema.safeParse({ characterId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin role required' }

    const db = getDb()
    const summary = await getCharacterModerationSummary(db, validated.data.characterId)

    return { success: true, data: summary }
  } catch (error) {
    console.error('Get character moderation summary error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
