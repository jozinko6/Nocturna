import { drizzle } from 'drizzle-orm/postgres-js'
import {
  characters,
  conversations,
  conversationParticipants,
  messages,
  friendships,
} from '@/lib/db/schema'
import { eq, and, or, sql, desc, count } from 'drizzle-orm'

export const MESSAGE_MAX_LENGTH = 500
export const FRIENDS_MAX = 50
export const BLOCK_PREVENTS_FRIEND_REQUEST = true
export const CONVERSATION_MAX_PARTICIPANTS = 10

type Db = ReturnType<typeof drizzle>

function now() {
  return new Date()
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function verifyCharacterExists(db: Db, characterId: string) {
  const [row] = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1)
  if (!row) throw new Error('Postavica neexistuje.')
  return row
}

async function isBlocked(db: Db, blockerId: string, blockedId: string): Promise<boolean> {
  const [row] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.characterId, blockerId),
        eq(friendships.friendId, blockedId),
        eq(friendships.status, 'blocked'),
      ),
    )
    .limit(1)
  return !!row
}

// ─── 1. sendPrivateMessage ──────────────────────────────────────────────────

export async function sendPrivateMessage(
  db: Db,
  senderCharacterId: string,
  recipientCharacterId: string,
  content: string,
) {
  const trimmed = content.trim()
  if (!trimmed) throw new Error('Správa nemôže byť prázdna.')
  if (trimmed.length > MESSAGE_MAX_LENGTH) {
    throw new Error(`Správa presahuje maximálnu dĺžku ${MESSAGE_MAX_LENGTH} znakov.`)
  }

  await verifyCharacterExists(db, senderCharacterId)
  await verifyCharacterExists(db, recipientCharacterId)

  if (senderCharacterId === recipientCharacterId) {
    throw new Error('Nemôžeš posielať správy sám sebe.')
  }

  if (await isBlocked(db, recipientCharacterId, senderCharacterId)) {
    throw new Error('Tento hráč ťa zablokoval.')
  }

  const timestamp = now()

  const existing = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .innerJoin(
      conversations,
      eq(conversations.id, conversationParticipants.conversationId),
    )
    .where(
      and(
        eq(conversations.type, 'direct'),
        sql`${conversationParticipants.conversationId} IN (
          SELECT cp2.conversation_id FROM conversation_participants cp2
          WHERE cp2.character_id = ${senderCharacterId}
        )`,
        sql`${conversationParticipants.conversationId} IN (
          SELECT cp3.conversation_id FROM conversation_participants cp3
          WHERE cp3.character_id = ${recipientCharacterId}
        )`,
      ),
    )
    .limit(1)

  let conversationId: string

  if (existing.length > 0) {
    conversationId = existing[0].conversationId
  } else {
    const [conv] = await db
      .insert(conversations)
      .values({ type: 'direct', lastMessageAt: timestamp })
      .returning()
    conversationId = conv.id

    await db.insert(conversationParticipants).values([
      { conversationId, characterId: senderCharacterId },
      { conversationId, characterId: recipientCharacterId },
    ])
  }

  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: senderCharacterId,
      content: trimmed,
    })
    .returning()

  await db
    .update(conversations)
    .set({ lastMessageAt: timestamp })
    .where(eq(conversations.id, conversationId))

  return message
}

// ─── 2. getConversationMessages ─────────────────────────────────────────────

export async function getConversationMessages(
  db: Db,
  conversationId: string,
  characterId: string,
  limit: number = 50,
  offset: number = 0,
) {
  const [participant] = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.characterId, characterId),
      ),
    )
    .limit(1)

  if (!participant) {
    throw new Error('Nie si účastníkom tejto konverzácie.')
  }

  const rows = await db
    .select({
      id: messages.id,
      conversationId: messages.conversationId,
      senderId: messages.senderId,
      content: messages.content,
      createdAt: messages.createdAt,
      editedAt: messages.editedAt,
      deletedAt: messages.deletedAt,
      senderName: characters.name,
    })
    .from(messages)
    .innerJoin(characters, eq(characters.id, messages.senderId))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset)

  await db
    .update(conversationParticipants)
    .set({ lastReadAt: now() })
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.characterId, characterId),
      ),
    )

  return rows
}

// ─── 3. getConversations ────────────────────────────────────────────────────

export async function getConversations(db: Db, characterId: string) {
  const participations = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.characterId, characterId))

  if (participations.length === 0) return []

  const convIds = participations.map(p => p.conversationId)

  const convs = await db
    .select()
    .from(conversations)
    .where(sql`${conversations.id} IN ${convIds}`)

  const results = await Promise.all(
    convs.map(async (conv) => {
      const otherParticipants = await db
        .select({
          characterId: conversationParticipants.characterId,
          name: characters.name,
          level: characters.level,
          portraitUrl: characters.portraitUrl,
        })
        .from(conversationParticipants)
        .innerJoin(characters, eq(characters.id, conversationParticipants.characterId))
        .where(
          and(
            eq(conversationParticipants.conversationId, conv.id),
            sql`${conversationParticipants.characterId} != ${characterId}`,
          ),
        )

      const [lastMessage] = await db
        .select({
          content: messages.content,
          senderId: messages.senderId,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1)

      const unreadResult = await db
        .select({ unreadCount: count() })
        .from(messages)
        .innerJoin(
          conversationParticipants,
          eq(conversationParticipants.conversationId, messages.conversationId),
        )
        .where(
          and(
            eq(messages.conversationId, conv.id),
            eq(conversationParticipants.characterId, characterId),
            sql`${messages.createdAt} > COALESCE(${conversationParticipants.lastReadAt}, '1970-01-01')`,
            sql`${messages.senderId} != ${characterId}`,
          ),
        )

      return {
        id: conv.id,
        type: conv.type,
        lastMessageAt: conv.lastMessageAt,
        lastMessage: lastMessage ?? null,
        unreadCount: unreadResult[0]?.unreadCount ?? 0,
        otherParticipants,
      }
    }),
  )

  return results
}

// ─── 4. sendFriendRequest ───────────────────────────────────────────────────

export async function sendFriendRequest(
  db: Db,
  characterId: string,
  targetCharacterId: string,
) {
  if (characterId === targetCharacterId) {
    throw new Error('Nemôžeš pridať sám seba ako priateľa.')
  }

  await verifyCharacterExists(db, characterId)
  await verifyCharacterExists(db, targetCharacterId)

  if (await isBlocked(db, targetCharacterId, characterId)) {
    throw new Error('Tento hráč ťa zablokoval.')
  }
  if (await isBlocked(db, characterId, targetCharacterId)) {
    throw new Error('Blokuješ tohto hráča. Najprv ho odblokuj.')
  }

  if (BLOCK_PREVENTS_FRIEND_REQUEST) {
    const [existing] = await db
      .select()
      .from(friendships)
      .where(
        and(
          sql`(${friendships.characterId} = ${characterId} AND ${friendships.friendId} = ${targetCharacterId})
              OR (${friendships.characterId} = ${targetCharacterId} AND ${friendships.friendId} = ${characterId})`,
          eq(friendships.status, 'accepted'),
        ),
      )
      .limit(1)

    if (existing) throw new Error('Už ste priatelia.')
  }

  const [pendingFromEither] = await db
    .select()
    .from(friendships)
    .where(
      and(
        sql`(${friendships.characterId} = ${characterId} AND ${friendships.friendId} = ${targetCharacterId})
            OR (${friendships.characterId} = ${targetCharacterId} AND ${friendships.friendId} = ${characterId})`,
        eq(friendships.status, 'pending'),
      ),
    )
    .limit(1)

  if (pendingFromEither) {
    throw new Error('Žiadosť o priateľstvo už existuje.')
  }

  const [friendCount] = await db
    .select({ cnt: count() })
    .from(friendships)
    .where(
      and(
        eq(friendships.characterId, characterId),
        eq(friendships.status, 'accepted'),
      ),
    )

  if (friendCount.cnt >= FRIENDS_MAX) {
    throw new Error(`Dosiahol si maximálny počet priateľov (${FRIENDS_MAX}).`)
  }

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(friendships)
      .values({
        characterId,
        friendId: targetCharacterId,
        requestedBy: characterId,
        status: 'pending',
      })
      .returning()
    return row
  })
}

// ─── 5. acceptFriendRequest ─────────────────────────────────────────────────

export async function acceptFriendRequest(
  db: Db,
  characterId: string,
  friendshipId: string,
) {
  const [request] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.id, friendshipId),
        eq(friendships.friendId, characterId),
        eq(friendships.status, 'pending'),
      ),
    )
    .limit(1)

  if (!request) {
    throw new Error('Žiadosť o priateľstvo neexistuje alebo nie si jej príjemcom.')
  }

  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(friendships)
      .set({ status: 'accepted', updatedAt: now() })
      .where(eq(friendships.id, friendshipId))
      .returning()
    return row
  })
}

// ─── 6. rejectFriendRequest ─────────────────────────────────────────────────

export async function rejectFriendRequest(
  db: Db,
  characterId: string,
  friendshipId: string,
) {
  const [request] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.id, friendshipId),
        eq(friendships.friendId, characterId),
        eq(friendships.status, 'pending'),
      ),
    )
    .limit(1)

  if (!request) {
    throw new Error('Žiadosť o priateľstvo neexistuje alebo nie si jej príjemcom.')
  }

  await db.delete(friendships).where(eq(friendships.id, friendshipId))
  return { success: true }
}

// ─── 7. removeFriend ────────────────────────────────────────────────────────

export async function removeFriend(
  db: Db,
  characterId: string,
  friendId: string,
) {
  const [friendship] = await db
    .select()
    .from(friendships)
    .where(
      and(
        sql`(${friendships.characterId} = ${characterId} AND ${friendships.friendId} = ${friendId})
            OR (${friendships.characterId} = ${friendId} AND ${friendships.friendId} = ${characterId})`,
        eq(friendships.status, 'accepted'),
      ),
    )
    .limit(1)

  if (!friendship) {
    throw new Error('Priateľstvo neexistuje alebo nie je akceptované.')
  }

  await db.delete(friendships).where(eq(friendships.id, friendship.id))
  return { success: true }
}

// ─── 8. blockPlayer ─────────────────────────────────────────────────────────

export async function blockPlayer(
  db: Db,
  characterId: string,
  targetCharacterId: string,
) {
  if (characterId === targetCharacterId) {
    throw new Error('Nemôžeš zablokovať sám seba.')
  }

  await verifyCharacterExists(db, characterId)
  await verifyCharacterExists(db, targetCharacterId)

  const [alreadyBlocked] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.characterId, characterId),
        eq(friendships.friendId, targetCharacterId),
        eq(friendships.status, 'blocked'),
      ),
    )
    .limit(1)

  if (alreadyBlocked) {
    throw new Error('Tento hráč je už zablokovaný.')
  }

  return db.transaction(async (tx) => {
    await tx
      .delete(friendships)
      .where(
        sql`(${friendships.characterId} = ${characterId} AND ${friendships.friendId} = ${targetCharacterId})
            OR (${friendships.characterId} = ${targetCharacterId} AND ${friendships.friendId} = ${characterId})`,
      )

    const [row] = await tx
      .insert(friendships)
      .values({
        characterId,
        friendId: targetCharacterId,
        requestedBy: characterId,
        status: 'blocked',
      })
      .returning()
    return row
  })
}

// ─── 9. unblockPlayer ───────────────────────────────────────────────────────

export async function unblockPlayer(
  db: Db,
  characterId: string,
  targetCharacterId: string,
) {
  const [block] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.characterId, characterId),
        eq(friendships.friendId, targetCharacterId),
        eq(friendships.status, 'blocked'),
      ),
    )
    .limit(1)

  if (!block) {
    throw new Error('Tento hráč nie je zablokovaný.')
  }

  await db.delete(friendships).where(eq(friendships.id, block.id))
  return { success: true }
}

// ─── 10. getBlockedList ─────────────────────────────────────────────────────

export async function getBlockedList(db: Db, characterId: string) {
  return db
    .select({
      id: characters.id,
      name: characters.name,
      level: characters.level,
      portraitUrl: characters.portraitUrl,
      blockedAt: friendships.createdAt,
    })
    .from(friendships)
    .innerJoin(characters, eq(characters.id, friendships.friendId))
    .where(
      and(
        eq(friendships.characterId, characterId),
        eq(friendships.status, 'blocked'),
      ),
    )
}

// ─── 11. getFriendList ──────────────────────────────────────────────────────

export async function getFriendList(db: Db, characterId: string) {
  return db
    .select({
      id: characters.id,
      name: characters.name,
      level: characters.level,
      portraitUrl: characters.portraitUrl,
      title: characters.title,
      factionId: characters.factionId,
      pvpRating: characters.pvpRating,
      online: sql<boolean>`${characters.updatedAt} > NOW() - INTERVAL '15 minutes'`,
      friendsSince: friendships.createdAt,
    })
    .from(friendships)
    .innerJoin(
      characters,
      eq(
        characters.id,
        sql`CASE WHEN ${friendships.characterId} = ${characterId} THEN ${friendships.friendId} ELSE ${friendships.characterId} END`,
      ),
    )
    .where(
      and(
        sql`(${friendships.characterId} = ${characterId} OR ${friendships.friendId} = ${characterId})`,
        eq(friendships.status, 'accepted'),
      ),
    )
}

// ─── 12. getPendingFriendRequests ───────────────────────────────────────────

export async function getPendingFriendRequests(db: Db, characterId: string) {
  return db
    .select({
      id: friendships.id,
      requestedBy: friendships.requestedBy,
      createdAt: friendships.createdAt,
      requesterName: characters.name,
      requesterLevel: characters.level,
      requesterPortraitUrl: characters.portraitUrl,
      requesterTitle: characters.title,
    })
    .from(friendships)
    .innerJoin(characters, eq(characters.id, friendships.requestedBy))
    .where(
      and(
        eq(friendships.friendId, characterId),
        eq(friendships.status, 'pending'),
      ),
    )
    .orderBy(desc(friendships.createdAt))
}

// ─── 13. isBlocked (exported) ───────────────────────────────────────────────

export { isBlocked }

// ─── 14. getOnlineFriends ───────────────────────────────────────────────────

export async function getOnlineFriends(db: Db, characterId: string) {
  return db
    .select({
      id: characters.id,
      name: characters.name,
      level: characters.level,
      portraitUrl: characters.portraitUrl,
      title: characters.title,
      lastActiveAt: characters.updatedAt,
    })
    .from(friendships)
    .innerJoin(
      characters,
      eq(
        characters.id,
        sql`CASE WHEN ${friendships.characterId} = ${characterId} THEN ${friendships.friendId} ELSE ${friendships.characterId} END`,
      ),
    )
    .where(
      and(
        sql`(${friendships.characterId} = ${characterId} OR ${friendships.friendId} = ${characterId})`,
        eq(friendships.status, 'accepted'),
        sql`${characters.updatedAt} > NOW() - INTERVAL '15 minutes'`,
      ),
    )
}
