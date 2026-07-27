'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/drizzle'
import {
  sendPrivateMessage,
  getConversationMessages,
  getConversations,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  blockPlayer,
  unblockPlayer,
  getBlockedList,
  getFriendList,
  getPendingFriendRequests,
} from '@/game/social'

const sendPrivateMessageSchema = z.object({
  recipientCharacterId: z.string().uuid('Invalid recipient character ID'),
  content: z.string().min(1, 'Message cannot be empty').max(500, 'Message exceeds 500 characters'),
})

const conversationMessagesSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
})

const friendshipIdSchema = z.object({
  friendshipId: z.string().uuid('Invalid friendship ID'),
})

const targetCharacterIdSchema = z.object({
  targetCharacterId: z.string().uuid('Invalid character ID'),
})

export async function sendPrivateMessageAction(recipientCharacterId: string, content: string) {
  try {
    const validated = sendPrivateMessageSchema.safeParse({ recipientCharacterId, content })
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
    const message = await sendPrivateMessage(db, character.id, recipientCharacterId, content)
    return { success: true, data: message }
  } catch (error) {
    console.error('Send private message error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getConversationMessagesAction(
  conversationId: string,
  limit?: number,
  offset?: number,
) {
  try {
    const validated = conversationMessagesSchema.safeParse({ conversationId, limit, offset })
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
    const messages = await getConversationMessages(
      db,
      conversationId,
      character.id,
      validated.data.limit,
      validated.data.offset,
    )
    return { success: true, data: messages }
  } catch (error) {
    console.error('Get conversation messages error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getConversationsAction() {
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

    const db = getDb()
    const conversations = await getConversations(db, character.id)
    return { success: true, data: conversations }
  } catch (error) {
    console.error('Get conversations error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function sendFriendRequestAction(targetCharacterId: string) {
  try {
    const validated = targetCharacterIdSchema.safeParse({ targetCharacterId })
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

    if (character.id === targetCharacterId) {
      return { success: false, error: 'You cannot add yourself as a friend' }
    }

    const db = getDb()
    const friendship = await sendFriendRequest(db, character.id, targetCharacterId)
    return { success: true, data: friendship }
  } catch (error) {
    console.error('Send friend request error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function acceptFriendRequestAction(friendshipId: string) {
  try {
    const validated = friendshipIdSchema.safeParse({ friendshipId })
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
    const friendship = await acceptFriendRequest(db, character.id, friendshipId)
    return { success: true, data: friendship }
  } catch (error) {
    console.error('Accept friend request error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function rejectFriendRequestAction(friendshipId: string) {
  try {
    const validated = friendshipIdSchema.safeParse({ friendshipId })
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
    const result = await rejectFriendRequest(db, character.id, friendshipId)
    return { success: true, data: result }
  } catch (error) {
    console.error('Reject friend request error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function removeFriendAction(friendId: string) {
  try {
    const validated = z.object({ friendId: z.string().uuid('Invalid friend ID') }).safeParse({ friendId })
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
    const result = await removeFriend(db, character.id, friendId)
    return { success: true, data: result }
  } catch (error) {
    console.error('Remove friend error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function blockPlayerAction(targetCharacterId: string) {
  try {
    const validated = targetCharacterIdSchema.safeParse({ targetCharacterId })
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

    if (character.id === targetCharacterId) {
      return { success: false, error: 'You cannot block yourself' }
    }

    const db = getDb()
    const block = await blockPlayer(db, character.id, targetCharacterId)
    return { success: true, data: block }
  } catch (error) {
    console.error('Block player error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function unblockPlayerAction(targetCharacterId: string) {
  try {
    const validated = targetCharacterIdSchema.safeParse({ targetCharacterId })
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
    const result = await unblockPlayer(db, character.id, targetCharacterId)
    return { success: true, data: result }
  } catch (error) {
    console.error('Unblock player error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getBlockedListAction() {
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

    const db = getDb()
    const blocked = await getBlockedList(db, character.id)
    return { success: true, data: blocked }
  } catch (error) {
    console.error('Get blocked list error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getFriendListAction() {
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

    const db = getDb()
    const friends = await getFriendList(db, character.id)
    return { success: true, data: friends }
  } catch (error) {
    console.error('Get friend list error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getPendingFriendRequestsAction() {
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

    const db = getDb()
    const requests = await getPendingFriendRequests(db, character.id)
    return { success: true, data: requests }
  } catch (error) {
    console.error('Get pending friend requests error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
