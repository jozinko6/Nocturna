'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 20

const getNotificationsSchema = z.object({
  page: z.number().int().positive().default(1),
})

const markAsReadSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID'),
})

export async function getNotifications(page: number = 1) {
  try {
    const validated = getNotificationsSchema.safeParse({ page })
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

    const offset = (page - 1) * PAGE_SIZE

    const { data: notifications, error: notificationsError, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('character_id', character.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (notificationsError) {
      console.error('Notifications fetch error:', notificationsError)
      return { success: false, error: 'Failed to fetch notifications' }
    }

    return {
      success: true,
      data: {
        notifications: notifications || [],
        pagination: {
          page,
          pageSize: PAGE_SIZE,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / PAGE_SIZE),
        },
      },
    }
  } catch (error) {
    console.error('Get notifications error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const validated = markAsReadSchema.safeParse({ notificationId })
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

    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .select('id')
      .eq('id', notificationId)
      .eq('character_id', character.id)
      .single()
    if (notifError || !notification) return { success: false, error: 'Notification not found' }

    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (updateError) {
      console.error('Notification update error:', updateError)
      return { success: false, error: 'Failed to mark notification as read' }
    }

    return { success: true, data: { message: 'Notification marked as read' } }
  } catch (error) {
    console.error('Mark as read error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function markAllAsRead() {
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

    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('character_id', character.id)
      .eq('read', false)

    if (updateError) {
      console.error('Notifications update error:', updateError)
      return { success: false, error: 'Failed to mark notifications as read' }
    }

    return { success: true, data: { message: 'All notifications marked as read' } }
  } catch (error) {
    console.error('Mark all as read error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getUnreadCount() {
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

    const { count, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('character_id', character.id)
      .eq('read', false)

    if (countError) {
      console.error('Count error:', countError)
      return { success: false, error: 'Failed to get unread count' }
    }

    return { success: true, data: { unreadCount: count || 0 } }
  } catch (error) {
    console.error('Get unread count error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
