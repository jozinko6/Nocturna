import { drizzle } from 'drizzle-orm/postgres-js'
import { eq, and, sql, desc, asc, count, gte } from 'drizzle-orm'
import {
  playerReports,
  moderationActions,
  characters,
  characterStats,
  users,
  clanMembers,
  currencyLedger,
} from '../lib/db/schema'

export type ReportReason = 'cheating' | 'offensive_name' | 'harassment' | 'exploit' | 'other'
export type ModerationActionType =
  | 'warning'
  | 'mute'
  | 'kick'
  | 'ban'
  | 'name_change'
  | 'stat_reset'
  | 'gold_revoke'
export type DurationUnit = 'hours' | 'days' | 'permanent'

export const REPORT_REASONS: ReportReason[] = [
  'cheating',
  'offensive_name',
  'harassment',
  'exploit',
  'other',
]

export const MODERATION_ACTION_TYPES: ModerationActionType[] = [
  'warning',
  'mute',
  'kick',
  'ban',
  'name_change',
  'stat_reset',
  'gold_revoke',
]

export const DURATION_UNITS: DurationUnit[] = ['hours', 'days', 'permanent']

export const MAX_REPORTS_PER_DAY = 5
export const MUTED_CHAT_KEYWORD = '[MÚTENÝ]'

type SeverityEntry = {
  modAction: ModerationActionType
  defaultDuration: number
  defaultUnit: DurationUnit
}

const ACTION_SEVERITY: Record<string, SeverityEntry> = {
  first_offense: { modAction: 'warning', defaultDuration: 0, defaultUnit: 'permanent' },
  second_offense: { modAction: 'mute', defaultDuration: 24, defaultUnit: 'hours' },
  third_offense: { modAction: 'kick', defaultDuration: 0, defaultUnit: 'permanent' },
  fourth_offense: { modAction: 'ban', defaultDuration: 0, defaultUnit: 'permanent' },
}

const SEVERITY_ORDER = ['first_offense', 'second_offense', 'third_offense', 'fourth_offense']

type Db = ReturnType<typeof drizzle>

function startOfDay(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export async function getOffenseCount(
  tx: Db,
  targetCharacterId: string,
): Promise<number> {
  const [{ cnt }] = await tx
    .select({ cnt: count() })
    .from(moderationActions)
    .where(
      and(
        eq(moderationActions.targetCharacterId, targetCharacterId),
        sql`${moderationActions.actionType} IN ('warning', 'mute', 'kick', 'ban')`,
      ),
    )
  return Number(cnt)
}

export function getSeverityEntry(offenseCount: number): SeverityEntry {
  const key = SEVERITY_ORDER[Math.min(offenseCount, SEVERITY_ORDER.length - 1)]
  return ACTION_SEVERITY[key]
}

function calculateExpiresAt(duration: number, unit: DurationUnit): Date | null {
  if (unit === 'permanent' || duration <= 0) return null
  const ms = unit === 'hours' ? duration * 3_600_000 : duration * 86_400_000
  return new Date(Date.now() + ms)
}

export async function submitReport(
  db: Db,
  reporterId: string,
  reportedId: string,
  reason: ReportReason,
  description?: string,
  battleReportId?: string,
) {
  if (reporterId === reportedId) {
    throw new Error('Nemôžeš nahlásiť sám seba.')
  }

  const dayStart = startOfDay()
  const [{ cnt }] = await db
    .select({ cnt: count() })
    .from(playerReports)
    .where(
      and(
        eq(playerReports.reporterId, reporterId),
        gte(playerReports.createdAt, dayStart),
      ),
    )

  if (Number(cnt) >= MAX_REPORTS_PER_DAY) {
    throw new Error(`Denný limit ${MAX_REPORTS_PER_DAY} hlásení bol dosiahnutý.`)
  }

  const existing = await db
    .select({ id: playerReports.id })
    .from(playerReports)
    .where(
      and(
        eq(playerReports.reporterId, reporterId),
        eq(playerReports.reportedId, reportedId),
        eq(playerReports.reason, reason),
        eq(playerReports.status, 'pending'),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    throw new Error('Na tohto hráča s týmto dôvodom už máš podané hlásenie.')
  }

  const [report] = await db
    .insert(playerReports)
    .values({
      reporterId,
      reportedId,
      reason,
      description: description ?? null,
      battleReportId: battleReportId ?? null,
      status: 'pending',
    })
    .returning()

  return report
}

export async function getPendingReports(db: Db, limit = 50) {
  return db
    .select({
      id: playerReports.id,
      reporterId: playerReports.reporterId,
      reportedId: playerReports.reportedId,
      reason: playerReports.reason,
      description: playerReports.description,
      battleReportId: playerReports.battleReportId,
      status: playerReports.status,
      createdAt: playerReports.createdAt,
      reporterName: characters.name,
    })
    .from(playerReports)
    .innerJoin(characters, eq(playerReports.reporterId, characters.id))
    .where(eq(playerReports.status, 'pending'))
    .orderBy(asc(playerReports.createdAt))
    .limit(limit)
}

export async function reviewReport(
  db: Db,
  moderatorId: string,
  reportId: string,
  action: ModerationActionType,
  resolution?: string,
) {
  const [report] = await db
    .select()
    .from(playerReports)
    .where(eq(playerReports.id, reportId))
    .limit(1)

  if (!report) {
    throw new Error('Hlásenie nebolo nájdené.')
  }
  if (report.status !== 'pending') {
    throw new Error('Toto hlásenie už bolo spracované.')
  }

  return db.transaction(async (tx) => {
    await tx
      .update(playerReports)
      .set({
        status: 'reviewed',
        reviewedBy: moderatorId,
        resolution: resolution ?? null,
        reviewedAt: new Date(),
      })
      .where(eq(playerReports.id, reportId))

    await performModerationAction(
      tx,
      moderatorId,
      report.reportedId,
      action,
      resolution ?? `Hlásenie #${reportId} vyhodnotené`,
      undefined,
      undefined,
      reportId,
    )

    return report
  })
}

export async function dismissReport(
  db: Db,
  moderatorId: string,
  reportId: string,
  reason?: string,
) {
  const [report] = await db
    .select()
    .from(playerReports)
    .where(eq(playerReports.id, reportId))
    .limit(1)

  if (!report) {
    throw new Error('Hlásenie nebolo nájdené.')
  }
  if (report.status !== 'pending') {
    throw new Error('Toto hlásenie už bolo spracované.')
  }

  await db
    .update(playerReports)
    .set({
      status: 'dismissed',
      reviewedBy: moderatorId,
      resolution: reason ?? 'Hlásenie zamietnuté',
      reviewedAt: new Date(),
    })
    .where(eq(playerReports.id, reportId))

  return report
}

export async function performModerationAction(
  db: Db,
  moderatorId: string,
  targetCharacterId: string,
  actionType: ModerationActionType,
  reason: string,
  duration?: number,
  durationUnit?: DurationUnit,
  reportId?: string,
) {
  return db.transaction(async (tx) => {
    const effectiveDuration = duration ?? 0
    const effectiveUnit = durationUnit ?? 'permanent'
    const expiresAt = calculateExpiresAt(effectiveDuration, effectiveUnit)

    await tx.insert(moderationActions).values({
      moderatorId,
      targetCharacterId,
      actionType,
      reason,
      duration: effectiveDuration,
      durationUnit: effectiveUnit,
      reportId: reportId ?? null,
      expiresAt,
    })

    if (actionType === 'stat_reset') {
      const [char] = await tx
        .select({ id: characters.id })
        .from(characters)
        .where(eq(characters.id, targetCharacterId))
        .limit(1)

      if (char) {
        await tx
          .update(characterStats)
          .set({
            strength: 5,
            dexterity: 5,
            endurance: 5,
            perception: 5,
            willpower: 5,
            luck: 5,
            updatedAt: new Date(),
          })
          .where(eq(characterStats.characterId, targetCharacterId))

        const [charGold] = await tx
          .select({ gold: characters.gold })
          .from(characters)
          .where(eq(characters.id, targetCharacterId))
          .limit(1)

        if (charGold) {
          await tx
            .update(characters)
            .set({ gold: 200, updatedAt: new Date() })
            .where(eq(characters.id, targetCharacterId))

          await tx.insert(currencyLedger).values({
            characterId: targetCharacterId,
            currencyType: 'gold',
            balanceBefore: charGold.gold,
            changeAmount: 200 - charGold.gold,
            balanceAfter: 200,
            reason: 'Moderácia: reset štatistík',
            sourceType: 'moderation',
            sourceId: reportId ?? null,
            adminId: moderatorId,
            idempotencyKey: `mod-stat-reset-${targetCharacterId}-${Date.now()}`,
          })
        }
      }
    }

    if (actionType === 'gold_revoke') {
      const [char] = await tx
        .select({ gold: characters.gold })
        .from(characters)
        .where(eq(characters.id, targetCharacterId))
        .limit(1)

      if (char && char.gold > 0) {
        await tx
          .update(characters)
          .set({ gold: 0, updatedAt: new Date() })
          .where(eq(characters.id, targetCharacterId))

        await tx.insert(currencyLedger).values({
          characterId: targetCharacterId,
          currencyType: 'gold',
          balanceBefore: char.gold,
          changeAmount: -char.gold,
          balanceAfter: 0,
          reason: 'Moderácia: zabavenie zlata',
          sourceType: 'moderation',
          sourceId: reportId ?? null,
          adminId: moderatorId,
          idempotencyKey: `mod-gold-revoke-${targetCharacterId}-${Date.now()}`,
        })
      }
    }

    if (actionType === 'kick') {
      const membership = await tx
        .select()
        .from(clanMembers)
        .where(eq(clanMembers.characterId, targetCharacterId))
        .limit(1)

      if (membership.length > 0) {
        await tx
          .delete(clanMembers)
          .where(eq(clanMembers.characterId, targetCharacterId))
      }
    }

    if (actionType === 'ban') {
      const [char] = await tx
        .select({ userId: characters.userId })
        .from(characters)
        .where(eq(characters.id, targetCharacterId))
        .limit(1)

      if (char) {
        await tx
          .update(users)
          .set({ banned: true, banReason: reason })
          .where(eq(users.id, char.userId))
      }
    }

    return true
  })
}

export async function getModerationHistory(db: Db, targetCharacterId: string) {
  return db
    .select()
    .from(moderationActions)
    .where(eq(moderationActions.targetCharacterId, targetCharacterId))
    .orderBy(desc(moderationActions.createdAt))
}

export async function getActiveMutes(db: Db) {
  const now = new Date()
  return db
    .select()
    .from(moderationActions)
    .where(
      and(
        eq(moderationActions.actionType, 'mute'),
        sql`(${moderationActions.expiresAt} > ${now} OR ${moderationActions.durationUnit} = 'permanent')`,
      ),
    )
}

export async function isCharacterMuted(db: Db, characterId: string) {
  const now = new Date()
  const [result] = await db
    .select({ cnt: count() })
    .from(moderationActions)
    .where(
      and(
        eq(moderationActions.targetCharacterId, characterId),
        eq(moderationActions.actionType, 'mute'),
        sql`(${moderationActions.expiresAt} > ${now} OR ${moderationActions.durationUnit} = 'permanent')`,
      ),
    )
  return Number(result.cnt) > 0
}

export async function getReportStats(db: Db) {
  const all = await db
    .select({ status: playerReports.status, cnt: count() })
    .from(playerReports)
    .groupBy(playerReports.status)

  const stats = { total: 0, pending: 0, reviewed: 0, dismissed: 0 }
  for (const row of all) {
    stats.total += Number(row.cnt)
    if (row.status === 'pending') stats.pending = Number(row.cnt)
    else if (row.status === 'reviewed' || row.status === 'resolved') stats.reviewed += Number(row.cnt)
    else if (row.status === 'dismissed') stats.dismissed = Number(row.cnt)
  }
  return stats
}

export async function getReporterStats(db: Db, reporterId: string) {
  const [{ cnt: totalReports }] = await db
    .select({ cnt: count() })
    .from(playerReports)
    .where(eq(playerReports.reporterId, reporterId))

  const [{ cnt: acceptedReports }] = await db
    .select({ cnt: count() })
    .from(playerReports)
    .where(
      and(
        eq(playerReports.reporterId, reporterId),
        sql`${playerReports.status} IN ('reviewed', 'resolved')`,
      ),
    )

  const dayStart = startOfDay()
  const [{ cnt: reportsThisDay }] = await db
    .select({ cnt: count() })
    .from(playerReports)
    .where(
      and(
        eq(playerReports.reporterId, reporterId),
        gte(playerReports.createdAt, dayStart),
      ),
    )

  return {
    totalReports: Number(totalReports),
    acceptedReports: Number(acceptedReports),
    reportsThisDay: Number(reportsThisDay),
  }
}

export async function expireActions(db: Db) {
  const now = new Date()
  const expired = await db
    .select()
    .from(moderationActions)
    .where(
      and(
        sql`${moderationActions.expiresAt} < ${now}`,
        sql`${moderationActions.durationUnit} != 'permanent'`,
      ),
    )

  return expired
}

export async function getCharacterModerationSummary(db: Db, characterId: string) {
  const rows = await db
    .select({ actionType: moderationActions.actionType, cnt: count() })
    .from(moderationActions)
    .where(eq(moderationActions.targetCharacterId, characterId))
    .groupBy(moderationActions.actionType)

  const summary = { warnings: 0, mutes: 0, kicks: 0, bans: 0, totalActions: 0 }
  for (const row of rows) {
    const n = Number(row.cnt)
    summary.totalActions += n
    if (row.actionType === 'warning') summary.warnings = n
    else if (row.actionType === 'mute') summary.mutes = n
    else if (row.actionType === 'kick') summary.kicks = n
    else if (row.actionType === 'ban') summary.bans = n
  }
  return summary
}

