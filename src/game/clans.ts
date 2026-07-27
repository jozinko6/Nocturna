import { drizzle } from 'drizzle-orm/postgres-js'
import { eq, and, sql, count, desc, ilike, or } from 'drizzle-orm'
import {
  clans,
  clanMembers,
  clanRanks,
  clanTreasury,
  clanQuests,
  characters,
} from '@/lib/db/schema'

// ─── Constants ─────────────────────────────────────────────────────────────

export const CLAN_NAME_MIN = 3
export const CLAN_NAME_MAX = 24
export const CLAN_TAG_MIN = 2
export const CLAN_TAG_MAX = 6

export const CLAN_MAX_MEMBERS_BASE = 30
export const CLAN_CREATE_COST_GOLD = 5000
export const CLAN_CREATE_MIN_LEVEL = 15

export const CLAN_QUEST_DURATION_HOURS = 24
export const CLAN_XP_PER_GOLD = 0.5

// ─── Types ─────────────────────────────────────────────────────────────────

export type ClanRank = 'leader' | 'officer' | 'member' | 'recruit'

export type ClanQuestType =
  | 'collect_gold'
  | 'collect_xp'
  | 'pvp_wins'
  | 'expeditions'
  | 'training_sessions'

// ─── Default Ranks ─────────────────────────────────────────────────────────

const RANK_ORDER: ClanRank[] = ['leader', 'officer', 'member', 'recruit']

interface DefaultRankConfig {
  name: string
  level: number
  rank: ClanRank
  canInvite: boolean
  canKick: boolean
  canDepositTreasury: boolean
  canWithdrawTreasury: boolean
  canStartQuest: boolean
}

const DEFAULT_RANKS: DefaultRankConfig[] = [
  { name: 'Vodca', level: 0, rank: 'leader', canInvite: true, canKick: true, canDepositTreasury: true, canWithdrawTreasury: true, canStartQuest: true },
  { name: 'Dôstojník', level: 1, rank: 'officer', canInvite: true, canKick: true, canDepositTreasury: true, canWithdrawTreasury: false, canStartQuest: true },
  { name: 'Člen', level: 2, rank: 'member', canInvite: false, canKick: false, canDepositTreasury: true, canWithdrawTreasury: false, canStartQuest: false },
  { name: 'Nováčik', level: 3, rank: 'recruit', canInvite: false, canKick: false, canDepositTreasury: true, canWithdrawTreasury: false, canStartQuest: false },
]

function getRankName(rank: ClanRank): string {
  return DEFAULT_RANKS.find((r) => r.rank === rank)?.name ?? 'Nováčik'
}

// ─── Validation ────────────────────────────────────────────────────────────

export function validateClanName(name: string): string | null {
  if (name.length < CLAN_NAME_MIN) return `Názov klanu musí mať aspoň ${CLAN_NAME_MIN} znaky.`
  if (name.length > CLAN_NAME_MAX) return `Názov klanu môže mať najviac ${CLAN_NAME_MAX} znakov.`
  if (!/^[a-zA-ZÀ-ž0-9 ]+$/.test(name)) return 'Názov klanu obsahuje nepovolené znaky.'
  return null
}

export function validateClanTag(tag: string): string | null {
  if (tag.length < CLAN_TAG_MIN) return `Tag klanu musí mať aspoň ${CLAN_TAG_MIN} znaky.`
  if (tag.length > CLAN_TAG_MAX) return `Tag klanu môže mať najviac ${CLAN_TAG_MAX} znakov.`
  if (!/^[a-zA-ZÀ-ž0-9]+$/.test(tag)) return 'Tag klanu obsahuje nepovolené znaky.'
  return null
}

// ─── Clan Creation ─────────────────────────────────────────────────────────

export async function createClan(
  db: ReturnType<typeof drizzle>,
  leaderCharacterId: string,
  name: string,
  tag: string,
  description: string,
) {
  const nameError = validateClanName(name)
  if (nameError) return { error: nameError }

  const tagError = validateClanTag(tag)
  if (tagError) return { error: tagError }

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.id, leaderCharacterId))
    .limit(1)

  if (!character) return { error: 'Postava nebola nájdená.' }
  if (character.level < CLAN_CREATE_MIN_LEVEL) {
    return { error: `Na vytvorenie klanu potrebuješ aspoň úroveň ${CLAN_CREATE_MIN_LEVEL}.` }
  }
  if (character.gold < CLAN_CREATE_COST_GOLD) {
    return { error: `Na vytvorenie klanu potrebuješ ${CLAN_CREATE_COST_GOLD} zlata.` }
  }

  const [existingMembership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, leaderCharacterId))
    .limit(1)

  if (existingMembership) return { error: 'Už si členom klanu.' }

  const [existingName] = await db
    .select({ id: clans.id })
    .from(clans)
    .where(sql`LOWER(${clans.name}) = LOWER(${name})`)
    .limit(1)

  if (existingName) return { error: 'Klan s týmto názvom už existuje.' }

  const [existingTag] = await db
    .select({ id: clans.id })
    .from(clans)
    .where(sql`LOWER(${clans.tag}) = LOWER(${tag})`)
    .limit(1)

  if (existingTag) return { error: 'Klan s týmto tagom už existuje.' }

  const result = await db.transaction(async (tx) => {
    const newGold = character.gold - CLAN_CREATE_COST_GOLD

    await tx
      .update(characters)
      .set({ gold: newGold })
      .where(eq(characters.id, leaderCharacterId))

    const [newClan] = await tx
      .insert(clans)
      .values({
        name,
        tag,
        description,
        leaderId: leaderCharacterId,
        gold: 0,
        maxMembers: CLAN_MAX_MEMBERS_BASE,
      })
      .returning()

    await tx.insert(clanMembers).values({
      clanId: newClan.id,
      characterId: leaderCharacterId,
      rank: 'leader',
    })

    await tx.insert(clanRanks).values(
      DEFAULT_RANKS.map((r) => ({
        clanId: newClan.id,
        rankName: r.name,
        rankLevel: r.level,
        canInvite: r.canInvite,
        canKick: r.canKick,
        canDepositTreasury: r.canDepositTreasury,
        canWithdrawTreasury: r.canWithdrawTreasury,
        canStartQuest: r.canStartQuest,
      })),
    )

    return newClan
  })

  return { clan: result }
}

// ─── Join / Leave ──────────────────────────────────────────────────────────

export async function joinClan(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  targetClanId: string,
) {
  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1)

  if (!character) return { error: 'Postava nebola nájdená.' }

  const [existingMembership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, characterId))
    .limit(1)

  if (existingMembership) return { error: 'Už si členom klanu.' }

  const [clan] = await db
    .select()
    .from(clans)
    .where(eq(clans.id, targetClanId))
    .limit(1)

  if (!clan) return { error: 'Klan nebol nájdený.' }
  if (clan.joinPolicy === 'closed') return { error: 'Tento klan neprijíma nových členov.' }

  const [{ value: memberCount }] = await db
    .select({ value: count() })
    .from(clanMembers)
    .where(eq(clanMembers.clanId, targetClanId))

  if (memberCount >= clan.maxMembers) return { error: 'Klan je plný.' }

  await db.insert(clanMembers).values({
    clanId: targetClanId,
    characterId,
    rank: 'recruit',
  })

  return { success: true }
}

export async function leaveClan(
  db: ReturnType<typeof drizzle>,
  characterId: string,
) {
  const [membership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, characterId))
    .limit(1)

  if (!membership) return { error: 'Nie si členom žiadneho klanu.' }
  if (membership.rank === 'leader') {
    return { error: 'Vodca nemôže opustiť klan. Prevez vedenie inému členovi.' }
  }

  await db.delete(clanMembers).where(eq(clanMembers.id, membership.id))

  return { success: true }
}

// ─── Kick ──────────────────────────────────────────────────────────────────

export async function kickMember(
  db: ReturnType<typeof drizzle>,
  kickerId: string,
  targetId: string,
) {
  const [kickerMembership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, kickerId))
    .limit(1)

  if (!kickerMembership) return { error: 'Nie si členom žiadneho klanu.' }
  if (kickerMembership.rank !== 'leader' && kickerMembership.rank !== 'officer') {
    return { error: 'Len vodca a dôstojníci môžu vyhadzovať členov.' }
  }

  const [targetMembership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, targetId))
    .limit(1)

  if (!targetMembership) return { error: 'Cieľový hráč nie je členom klanu.' }
  if (targetMembership.clanId !== kickerMembership.clanId) {
    return { error: 'Cieľový hráč nie je vo vašom klane.' }
  }
  if (targetMembership.rank === 'leader') return { error: 'Nemôžeš vyhodiť vodcu klanu.' }
  if (kickerMembership.rank === 'officer' && targetMembership.rank === 'officer') {
    return { error: 'Dôstojník nemôže vyhodiť iného dôstojníka.' }
  }

  await db.delete(clanMembers).where(eq(clanMembers.id, targetMembership.id))

  return { success: true }
}

// ─── Treasury ──────────────────────────────────────────────────────────────

export async function depositToTreasury(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  amount: number,
) {
  if (amount <= 0) return { error: 'Suma musí byť väčšia ako 0.' }

  const [membership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, characterId))
    .limit(1)

  if (!membership) return { error: 'Nie si členom žiadneho klanu.' }

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1)

  if (!character) return { error: 'Postava nebola nájdená.' }
  if (character.gold < amount) return { error: 'Nedostatok zlata.' }

  const xpGain = Math.floor(amount * CLAN_XP_PER_GOLD)

  await db.transaction(async (tx) => {
    await tx
      .update(characters)
      .set({ gold: character.gold - amount })
      .where(eq(characters.id, characterId))

    await tx
      .update(clans)
      .set({ gold: sql`${clans.gold} + ${amount}` })
      .where(eq(clans.id, membership.clanId))

    await tx.insert(clanTreasury).values({
      clanId: membership.clanId,
      characterId,
      amount,
      reason: 'Vklad do pokladnice',
    })

    await tx
      .update(clans)
      .set({ experience: sql`${clans.experience} + ${xpGain}` })
      .where(eq(clans.id, membership.clanId))

    await tx
      .update(clanMembers)
      .set({ contributionGold: sql`${clanMembers.contributionGold} + ${amount}` })
      .where(eq(clanMembers.id, membership.id))
  })

  return { success: true, xpGain }
}

export async function withdrawFromTreasury(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  amount: number,
) {
  if (amount <= 0) return { error: 'Suma musí byť väčšia ako 0.' }

  const [membership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, characterId))
    .limit(1)

  if (!membership) return { error: 'Nie si členom žiadneho klanu.' }
  if (membership.rank !== 'leader') return { error: 'Len vodca môže vyberať z pokladnice.' }

  const [clan] = await db
    .select()
    .from(clans)
    .where(eq(clans.id, membership.clanId))
    .limit(1)

  if (!clan) return { error: 'Klan nebol nájdený.' }
  if (clan.gold < amount) return { error: 'V pokladnici nie je dostatok zlata.' }

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1)

  if (!character) return { error: 'Postava nebola nájdená.' }

  await db.transaction(async (tx) => {
    await tx
      .update(clans)
      .set({ gold: sql`${clans.gold} - ${amount}` })
      .where(eq(clans.id, membership.clanId))

    await tx
      .update(characters)
      .set({ gold: character.gold + amount })
      .where(eq(characters.id, characterId))

    await tx.insert(clanTreasury).values({
      clanId: membership.clanId,
      characterId,
      amount: -amount,
      reason: 'Výber z pokladnice',
    })
  })

  return { success: true }
}

// ─── Clan Quests ───────────────────────────────────────────────────────────

interface ClanQuestTemplate {
  type: ClanQuestType
  title: string
  description: string
  baseTarget: number
  baseRewardGold: number
  baseRewardXp: number
  baseRewardClanXp: number
}

const CLAN_QUEST_TEMPLATES: ClanQuestTemplate[] = [
  {
    type: 'collect_gold',
    title: 'Zlatá daň',
    description: 'Členovia klanu musia nazbierať spolu zlatú daň pre vodcu.',
    baseTarget: 5000,
    baseRewardGold: 1000,
    baseRewardXp: 500,
    baseRewardClanXp: 200,
  },
  {
    type: 'collect_xp',
    title: 'Skúsenosti starej školy',
    description: 'Klan musí spolu nazbierať skúsenosti z boja.',
    baseTarget: 10000,
    baseRewardGold: 800,
    baseRewardXp: 1000,
    baseRewardClanXp: 300,
  },
  {
    type: 'pvp_wins',
    title: 'Krvavá aréna',
    description: 'Členovia klanu musia získať víťazstvá v PvP súbojoch.',
    baseTarget: 10,
    baseRewardGold: 1500,
    baseRewardXp: 750,
    baseRewardClanXp: 400,
  },
  {
    type: 'expeditions',
    title: 'Hlboká výprava',
    description: 'Klan musí úspešne dokončiť výpravy do temných krajín.',
    baseTarget: 15,
    baseRewardGold: 1200,
    baseRewardXp: 600,
    baseRewardClanXp: 350,
  },
  {
    type: 'training_sessions',
    title: 'Tvrdý výcvik',
    description: 'Členovia klanu musia spolu absolvovať tréningové sessiony.',
    baseTarget: 20,
    baseRewardGold: 700,
    baseRewardXp: 400,
    baseRewardClanXp: 250,
  },
]

export function generateClanQuest(type: ClanQuestType, clanLevel: number) {
  const template = CLAN_QUEST_TEMPLATES.find((t) => t.type === type)
  if (!template) return null

  const scale = 1 + clanLevel * 0.1

  return {
    type: template.type,
    title: template.title,
    description: template.description,
    targetCount: Math.floor(template.baseTarget * scale),
    rewardGold: Math.floor(template.baseRewardGold * scale),
    rewardXp: Math.floor(template.baseRewardXp * scale),
    rewardClanXp: Math.floor(template.baseRewardClanXp * scale),
  }
}

export async function startClanQuest(
  db: ReturnType<typeof drizzle>,
  clanId: string,
  type: ClanQuestType,
  characterId: string,
) {
  const [membership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, characterId))
    .limit(1)

  if (!membership) return { error: 'Nie si členom žiadneho klanu.' }
  if (membership.clanId !== clanId) return { error: 'Nie si členom tohto klanu.' }

  const [rankConfig] = await db
    .select()
    .from(clanRanks)
    .where(and(
      eq(clanRanks.clanId, clanId),
      eq(clanRanks.rankName, getRankName(membership.rank as ClanRank)),
    ))
    .limit(1)

  if (!rankConfig || !rankConfig.canStartQuest) {
    return { error: 'Nemáš oprávnenie spustiť úlohu klanu.' }
  }

  const [activeQuest] = await db
    .select()
    .from(clanQuests)
    .where(and(
      eq(clanQuests.clanId, clanId),
      eq(clanQuests.status, 'active'),
    ))
    .limit(1)

  if (activeQuest) return { error: 'Klan už má aktívnu úlohu.' }

  const [clan] = await db
    .select()
    .from(clans)
    .where(eq(clans.id, clanId))
    .limit(1)

  if (!clan) return { error: 'Klan nebol nájdený.' }

  const questConfig = generateClanQuest(type, clan.level)
  if (!questConfig) return { error: 'Neplatný typ úlohy.' }

  const now = new Date()
  const endsAt = new Date(now.getTime() + CLAN_QUEST_DURATION_HOURS * 60 * 60 * 1000)

  const [quest] = await db
    .insert(clanQuests)
    .values({
      clanId,
      questType: questConfig.type,
      title: questConfig.title,
      description: questConfig.description,
      targetCount: questConfig.targetCount,
      currentCount: 0,
      rewardGold: questConfig.rewardGold,
      rewardXp: questConfig.rewardXp,
      rewardClanXp: questConfig.rewardClanXp,
      status: 'active',
      startsAt: now,
      endsAt,
    })
    .returning()

  return { quest }
}

export async function updateClanQuestProgress(
  db: ReturnType<typeof drizzle>,
  clanId: string,
  questType: ClanQuestType,
  incrementAmount: number,
) {
  const [activeQuest] = await db
    .select()
    .from(clanQuests)
    .where(and(
      eq(clanQuests.clanId, clanId),
      eq(clanQuests.status, 'active'),
      eq(clanQuests.questType, questType),
    ))
    .limit(1)

  if (!activeQuest) return { error: 'Žiadna aktívna úloha tohto typu.' }

  const newCount = activeQuest.currentCount + incrementAmount
  const completed = newCount >= activeQuest.targetCount

  await db
    .update(clanQuests)
    .set({
      currentCount: newCount,
      ...(completed ? { status: 'completed' as const } : {}),
    })
    .where(eq(clanQuests.id, activeQuest.id))

  return { completed }
}

export async function claimClanQuestReward(
  db: ReturnType<typeof drizzle>,
  clanId: string,
) {
  const [quest] = await db
    .select()
    .from(clanQuests)
    .where(and(
      eq(clanQuests.clanId, clanId),
      eq(clanQuests.status, 'completed'),
    ))
    .limit(1)

  if (!quest) return { error: 'Žiadna dokončená úloha na prevzatie.' }

  await db.transaction(async (tx) => {
    await tx
      .update(clanQuests)
      .set({ status: 'claimed' })
      .where(eq(clanQuests.id, quest.id))

    await tx
      .update(clans)
      .set({
        gold: sql`${clans.gold} + ${quest.rewardGold}`,
        experience: sql`${clans.experience} + ${quest.rewardClanXp}`,
      })
      .where(eq(clans.id, clanId))
  })

  return {
    gold: quest.rewardGold,
    xp: quest.rewardXp,
    clanXp: quest.rewardClanXp,
  }
}

// ─── Clan Info ─────────────────────────────────────────────────────────────

export async function getClanInfo(db: ReturnType<typeof drizzle>, clanId: string) {
  const [clan] = await db
    .select()
    .from(clans)
    .where(eq(clans.id, clanId))
    .limit(1)

  if (!clan) return null

  const members = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.clanId, clanId))

  const ranks = await db
    .select()
    .from(clanRanks)
    .where(eq(clanRanks.clanId, clanId))

  return { ...clan, members, ranks }
}

export async function getClanMembers(db: ReturnType<typeof drizzle>, clanId: string) {
  return db
    .select({
      id: clanMembers.id,
      characterId: clanMembers.characterId,
      rank: clanMembers.rank,
      joinedAt: clanMembers.joinedAt,
      contributionGold: clanMembers.contributionGold,
      contributionXp: clanMembers.contributionXp,
      name: characters.name,
      level: characters.level,
      factionId: characters.factionId,
    })
    .from(clanMembers)
    .innerJoin(characters, eq(clanMembers.characterId, characters.id))
    .where(eq(clanMembers.clanId, clanId))
}

export async function searchClans(db: ReturnType<typeof drizzle>, searchTerm: string) {
  return db
    .select({
      id: clans.id,
      name: clans.name,
      tag: clans.tag,
      level: clans.level,
      memberCount: count(clanMembers.id),
    })
    .from(clans)
    .leftJoin(clanMembers, eq(clans.id, clanMembers.clanId))
    .where(or(
      ilike(clans.name, `%${searchTerm}%`),
      ilike(clans.tag, `%${searchTerm}%`),
    ))
    .groupBy(clans.id)
    .orderBy(desc(clans.level))
}

// ─── Leadership ────────────────────────────────────────────────────────────

export async function transferLeadership(
  db: ReturnType<typeof drizzle>,
  currentLeaderId: string,
  newLeaderId: string,
) {
  const [currentMembership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, currentLeaderId))
    .limit(1)

  if (!currentMembership) return { error: 'Nie si členom žiadneho klanu.' }
  if (currentMembership.rank !== 'leader') return { error: 'Len vodca môže previesť vedenie.' }

  const [newMembership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, newLeaderId))
    .limit(1)

  if (!newMembership) return { error: 'Cieľový hráč nie je členom klanu.' }
  if (newMembership.clanId !== currentMembership.clanId) {
    return { error: 'Cieľový hráč nie je vo vašom klane.' }
  }
  if (newMembership.rank === 'leader') return { error: 'Cieľový hráč je už vodcom.' }

  await db.transaction(async (tx) => {
    await tx
      .update(clanMembers)
      .set({ rank: 'officer' })
      .where(eq(clanMembers.id, currentMembership.id))

    await tx
      .update(clanMembers)
      .set({ rank: 'leader' })
      .where(eq(clanMembers.id, newMembership.id))

    await tx
      .update(clans)
      .set({ leaderId: newLeaderId })
      .where(eq(clans.id, currentMembership.clanId))
  })

  return { success: true }
}

// ─── Promote / Demote ──────────────────────────────────────────────────────

export async function promoteMember(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  targetId: string,
) {
  const [membership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, characterId))
    .limit(1)

  if (!membership) return { error: 'Nie si členom žiadneho klanu.' }
  if (membership.rank !== 'leader') return { error: 'Len vodca môže povýšiť členov.' }

  const [targetMembership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, targetId))
    .limit(1)

  if (!targetMembership) return { error: 'Cieľový hráč nie je členom klanu.' }
  if (targetMembership.clanId !== membership.clanId) {
    return { error: 'Cieľový hráč nie je vo vašom klane.' }
  }

  const currentIndex = RANK_ORDER.indexOf(targetMembership.rank as ClanRank)
  if (currentIndex <= 0) return { error: 'Tento hráč už má najvyššiu hodnosť.' }

  const newRank = RANK_ORDER[currentIndex - 1]

  await db
    .update(clanMembers)
    .set({ rank: newRank })
    .where(eq(clanMembers.id, targetMembership.id))

  return { success: true, newRank }
}

export async function demoteMember(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  targetId: string,
) {
  const [membership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, characterId))
    .limit(1)

  if (!membership) return { error: 'Nie si členom žiadneho klanu.' }
  if (membership.rank !== 'leader') return { error: 'Len vodca môže znížiť hodnosť.' }

  const [targetMembership] = await db
    .select()
    .from(clanMembers)
    .where(eq(clanMembers.characterId, targetId))
    .limit(1)

  if (!targetMembership) return { error: 'Cieľový hráč nie je členom klanu.' }
  if (targetMembership.clanId !== membership.clanId) {
    return { error: 'Cieľový hráč nie je vo vašom klane.' }
  }

  const currentIndex = RANK_ORDER.indexOf(targetMembership.rank as ClanRank)
  if (currentIndex >= RANK_ORDER.length - 1) {
    return { error: 'Tento hráč už má najnižšiu hodnosť.' }
  }

  const newRank = RANK_ORDER[currentIndex + 1]

  await db
    .update(clanMembers)
    .set({ rank: newRank })
    .where(eq(clanMembers.id, targetMembership.id))

  return { success: true, newRank }
}
