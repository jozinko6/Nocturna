import { eq, and, or, desc } from 'drizzle-orm'
import type { DB } from '@/lib/db/drizzle'
import {
  users,
  profiles,
  gdprRequests,
  characters,
  characterStats,
  characterItems,
  equipmentSlots,
  activities,
  battleReports,
  missions,
  pvpMatches,
  pvpRatings,
  notifications,
  currencyLedger,
  purchases,
  referralCodes,
  referralRewards,
  loginStreaks,
} from '@/lib/db/schema'

export const GDPR_REQUEST_TYPES = ['data_export', 'data_deletion', 'data_correction'] as const
export const DATA_RETENTION_DAYS = 365
export const EXPORT_FORMAT = 'json'

export async function requestDataExport(db: DB, userId: string) {
  const existing = await db
    .select()
    .from(gdprRequests)
    .where(and(eq(gdprRequests.userId, userId), eq(gdprRequests.requestType, 'data_export'), eq(gdprRequests.status, 'pending')))
    .limit(1)

  if (existing.length > 0) {
    throw new Error('Prebieha existujúca požiadavka na export dát.')
  }

  const [request] = await db
    .insert(gdprRequests)
    .values({ userId, requestType: 'data_export', status: 'pending' })
    .returning()

  return { requestId: request.id, estimatedTime: '24 hodín' }
}

export async function requestDataDeletion(db: DB, userId: string) {
  const existing = await db
    .select()
    .from(gdprRequests)
    .where(and(eq(gdprRequests.userId, userId), eq(gdprRequests.requestType, 'data_deletion'), eq(gdprRequests.status, 'pending')))
    .limit(1)

  if (existing.length > 0) {
    throw new Error('Prebieha existujúca požiadavka na vymazanie dát.')
  }

  const [request] = await db
    .insert(gdprRequests)
    .values({ userId, requestType: 'data_deletion', status: 'pending' })
    .returning()

  return { requestId: request.id, estimatedTime: '30 dní', warning: 'Táto akcia je nevratná.' }
}

export async function requestDataCorrection(db: DB, userId: string, notes?: string) {
  const [request] = await db
    .insert(gdprRequests)
    .values({ userId, requestType: 'data_correction', status: 'pending', notes })
    .returning()

  return { requestId: request.id }
}

export async function exportUserData(db: DB, userId: string) {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (user.length === 0) throw new Error('Používateľ nebol nájdený.')

  const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
  const character = await db.select().from(characters).where(eq(characters.userId, userId)).limit(1)

  let stats = null
  let items: typeof characterItems.$inferSelect[] = []
  let equipment: typeof equipmentSlots.$inferSelect[] = []
  let activitiesList: typeof activities.$inferSelect[] = []
  let battleReportsList: typeof battleReports.$inferSelect[] = []
  let missionsList: typeof missions.$inferSelect[] = []
  let pvpAttacks: typeof pvpMatches.$inferSelect[] = []
  let pvpDefenses: typeof pvpMatches.$inferSelect[] = []
  let pvpRating = null
  let notificationsList: typeof notifications.$inferSelect[] = []
  let ledgerEntries: typeof currencyLedger.$inferSelect[] = []
  let purchasesList: typeof purchases.$inferSelect[] = []
  let referralCodesList: typeof referralCodes.$inferSelect[] = []
  let referralRewardsAsReferrer: typeof referralRewards.$inferSelect[] = []
  let referralRewardsAsReferred: typeof referralRewards.$inferSelect[] = []
  let loginStreak = null

  if (character.length > 0) {
    const charId = character[0].id
    const statResult = await db.select().from(characterStats).where(eq(characterStats.characterId, charId)).limit(1)
    stats = statResult.length > 0 ? statResult[0] : null

    items = await db.select().from(characterItems).where(eq(characterItems.characterId, charId))
    equipment = await db.select().from(equipmentSlots).where(eq(equipmentSlots.characterId, charId))
    activitiesList = await db.select().from(activities).where(eq(activities.characterId, charId))
    battleReportsList = await db
      .select()
      .from(battleReports)
      .where(or(eq(battleReports.attackerId, charId), eq(battleReports.defenderId, charId)))
    missionsList = await db.select().from(missions).where(eq(missions.characterId, charId))
    pvpAttacks = await db.select().from(pvpMatches).where(eq(pvpMatches.attackerId, charId))
    pvpDefenses = await db.select().from(pvpMatches).where(eq(pvpMatches.defenderId, charId))

    const pvpRatingResult = await db.select().from(pvpRatings).where(eq(pvpRatings.characterId, charId)).limit(1)
    pvpRating = pvpRatingResult.length > 0 ? pvpRatingResult[0] : null

    notificationsList = await db.select().from(notifications).where(eq(notifications.characterId, charId))
    ledgerEntries = await db.select().from(currencyLedger).where(eq(currencyLedger.characterId, charId))

    referralCodesList = await db.select().from(referralCodes).where(eq(referralCodes.characterId, charId))
    referralRewardsAsReferrer = await db.select().from(referralRewards).where(eq(referralRewards.referrerId, charId))
    referralRewardsAsReferred = await db.select().from(referralRewards).where(eq(referralRewards.referredId, charId))

    const loginStreakResult = await db.select().from(loginStreaks).where(eq(loginStreaks.characterId, charId)).limit(1)
    loginStreak = loginStreakResult.length > 0 ? loginStreakResult[0] : null
  }

  purchasesList = await db.select().from(purchases).where(eq(purchases.userId, userId))

  return {
    exportDate: new Date().toISOString(),
    format: EXPORT_FORMAT,
    dataRetentionDays: DATA_RETENTION_DAYS,
    data: {
      user: user[0],
      profile: profile.length > 0 ? profile[0] : null,
      character: character.length > 0 ? character[0] : null,
      stats,
      items,
      equipment,
      activities: activitiesList,
      battleReports: battleReportsList,
      missions: missionsList,
      pvpMatches: [...pvpAttacks, ...pvpDefenses],
      pvpRating,
      notifications: notificationsList,
      currencyLedger: ledgerEntries,
      purchases: purchasesList,
      referrals: {
        codes: referralCodesList,
        rewardsAsReferrer: referralRewardsAsReferrer,
        rewardsAsReferred: referralRewardsAsReferred,
      },
      loginStreak,
    },
  }
}

export async function deleteUserData(db: DB, userId: string) {
  return await db.transaction(async (tx) => {
    const character = await tx.select().from(characters).where(eq(characters.userId, userId)).limit(1)

    if (character.length > 0) {
      const charId = character[0].id

      await tx.delete(characterStats).where(eq(characterStats.characterId, charId))
      await tx.delete(characterItems).where(eq(characterItems.characterId, charId))
      await tx.delete(equipmentSlots).where(eq(equipmentSlots.characterId, charId))
      await tx.delete(activities).where(eq(activities.characterId, charId))
      await tx.delete(missions).where(eq(missions.characterId, charId))
      await tx.delete(notifications).where(eq(notifications.characterId, charId))
      await tx.delete(loginStreaks).where(eq(loginStreaks.characterId, charId))

      await tx.delete(battleReports).where(eq(battleReports.attackerId, charId))
      await tx.delete(battleReports).where(eq(battleReports.defenderId, charId))

      await tx.delete(pvpMatches).where(eq(pvpMatches.attackerId, charId))
      await tx.delete(pvpMatches).where(eq(pvpMatches.defenderId, charId))
      await tx.delete(pvpRatings).where(eq(pvpRatings.characterId, charId))

      await tx.delete(currencyLedger).where(eq(currencyLedger.characterId, charId))
      await tx.delete(referralCodes).where(eq(referralCodes.characterId, charId))
      await tx.delete(referralRewards).where(eq(referralRewards.referrerId, charId))
      await tx.delete(referralRewards).where(eq(referralRewards.referredId, charId))
    }

    await tx.update(users).set({ email: `deleted_${userId}@nocturna.game` }).where(eq(users.id, userId))
    await tx.update(profiles).set({ displayName: 'Vymazaný hráč' }).where(eq(profiles.userId, userId))

    return { deleted: true }
  })
}

export async function getGdprRequests(db: DB, limit = 50, offset = 0) {
  return db
    .select({
      id: gdprRequests.id,
      userId: gdprRequests.userId,
      requestType: gdprRequests.requestType,
      status: gdprRequests.status,
      processedBy: gdprRequests.processedBy,
      downloadUrl: gdprRequests.downloadUrl,
      notes: gdprRequests.notes,
      createdAt: gdprRequests.createdAt,
      completedAt: gdprRequests.completedAt,
      userEmail: users.email,
    })
    .from(gdprRequests)
    .innerJoin(users, eq(gdprRequests.userId, users.id))
    .orderBy(desc(gdprRequests.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function getPendingGdprRequests(db: DB) {
  return db
    .select()
    .from(gdprRequests)
    .where(eq(gdprRequests.status, 'pending'))
    .orderBy(desc(gdprRequests.createdAt))
}

export async function processGdprRequest(db: DB, requestId: string, adminId: string) {
  const request = await db.select().from(gdprRequests).where(eq(gdprRequests.id, requestId)).limit(1)
  if (request.length === 0) throw new Error('Požiadavka nebola nájdená.')
  if (request[0].status !== 'pending') throw new Error('Požiadavka nie je v stave pending.')

  await db
    .update(gdprRequests)
    .set({ status: 'processing', processedBy: adminId })
    .where(eq(gdprRequests.id, requestId))

  if (request[0].requestType === 'data_export') {
    const exportData = await exportUserData(db, request[0].userId)
    await db
      .update(gdprRequests)
      .set({ status: 'completed', completedAt: new Date(), downloadUrl: `/api/gdpr/export/${requestId}` })
      .where(eq(gdprRequests.id, requestId))
    return { processed: true, exportData }
  }

  if (request[0].requestType === 'data_deletion') {
    await deleteUserData(db, request[0].userId)
  }

  await db
    .update(gdprRequests)
    .set({ status: 'completed', completedAt: new Date() })
    .where(eq(gdprRequests.id, requestId))

  return { processed: true }
}
