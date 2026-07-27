import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, sql, desc } from 'drizzle-orm';
import { liveEvents, liveEventParticipants, characters } from '../lib/db/schema';

const EVENT_TYPES = ['boss_rush', 'double_xp', 'double_gold', 'festival', 'invasion', 'challenge'] as const;
type EventType = (typeof EVENT_TYPES)[number];

const MAX_CONCURRENT_EVENTS = 2;
const EVENT_MIN_DURATION_HOURS = 2;
const EVENT_MAX_DURATION_HOURS = 72;

const EVENT_CONFIGS: Record<EventType, { name: string; description: string; defaultDurationHours: number; rewards: { gold: number; crystals: number } }> = {
  boss_rush: { name: 'Pán príšer', description: 'Poraz príšery a nazbieraj body', defaultDurationHours: 24, rewards: { gold: 5000, crystals: 100 } },
  double_xp: { name: 'Dvojitá XP', description: 'Získaj dvojnásobné skúsenosti', defaultDurationHours: 12, rewards: { gold: 0, crystals: 0 } },
  double_gold: { name: 'Dvojité zlato', description: 'Získaj dvojnásobné zlato', defaultDurationHours: 12, rewards: { gold: 0, crystals: 0 } },
  festival: { name: 'Festival temnôt', description: 'Špeciálne odmeny a výzvy', defaultDurationHours: 48, rewards: { gold: 3000, crystals: 50 } },
  invasion: { name: 'Invázia', description: 'Odrob inváziu a získaj odmeny', defaultDurationHours: 24, rewards: { gold: 4000, crystals: 75 } },
  challenge: { name: 'Výzva', description: 'Splň špeciálne úlohy', defaultDurationHours: 36, rewards: { gold: 2000, crystals: 30 } },
};

export function getEventConfig(eventType: EventType) {
  const config = EVENT_CONFIGS[eventType];
  if (!config) throw new Error(`Neplatný typ eventu: ${eventType}`);
  return config;
}

export async function createEvent(
  db: ReturnType<typeof drizzle>,
  eventType: EventType,
  startsAt?: Date,
  durationHours?: number,
) {
  if (!EVENT_TYPES.includes(eventType)) {
    throw new Error(`Neplatný typ eventu: ${eventType}`);
  }

  const hours = durationHours ?? EVENT_CONFIGS[eventType].defaultDurationHours;
  if (hours < EVENT_MIN_DURATION_HOURS || hours > EVENT_MAX_DURATION_HOURS) {
    throw new Error(`Trvanie musí byť medzi ${EVENT_MIN_DURATION_HOURS} a ${EVENT_MAX_DURATION_HOURS} hodinami`);
  }

  const now = new Date();
  const start = startsAt ?? now;
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);

  const activeCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(liveEvents)
    .where(eq(liveEvents.status, 'active'))
    .then((rows) => rows[0]?.count ?? 0);

  if (activeCount >= MAX_CONCURRENT_EVENTS) {
    throw new Error(`Maximum ${MAX_CONCURRENT_EVENTS} súčasných eventov`);
  }

  const config = EVENT_CONFIGS[eventType];

  const [event] = await db
    .insert(liveEvents)
    .values({
      name: config.name,
      description: config.description,
      eventType,
      config: { gold: config.rewards.gold, crystals: config.rewards.crystals },
      startsAt: start,
      endsAt: end,
      status: 'upcoming',
    })
    .returning();

  return event;
}

export async function startEvent(db: ReturnType<typeof drizzle>, eventId: string) {
  const [event] = await db
    .update(liveEvents)
    .set({ status: 'active' })
    .where(and(eq(liveEvents.id, eventId), eq(liveEvents.status, 'upcoming')))
    .returning();

  if (!event) throw new Error('Event nenájdený alebo už bol spustený');
  return event;
}

export async function endEvent(db: ReturnType<typeof drizzle>, eventId: string) {
  const event = await db.query.liveEvents.findFirst({ where: eq(liveEvents.id, eventId) });
  if (!event) throw new Error('Event nenájdený');

  const rankings = await getEventRankings(db, eventId, Infinity);

  const [ended] = await db
    .update(liveEvents)
    .set({ status: 'ended' })
    .where(and(eq(liveEvents.id, eventId), eq(liveEvents.status, 'active')))
    .returning();

  if (!ended) throw new Error('Event nie je aktívny');
  return { ...ended, rankings };
}

export async function joinEvent(db: ReturnType<typeof drizzle>, eventId: string, characterId: string) {
  const event = await db.query.liveEvents.findFirst({ where: eq(liveEvents.id, eventId) });
  if (!event || event.status !== 'active') throw new Error('Event nie je aktívny');

  const existing = await db.query.liveEventParticipants.findFirst({
    where: and(eq(liveEventParticipants.eventId, eventId), eq(liveEventParticipants.characterId, characterId)),
  });
  if (existing) throw new Error('Postava sa už zúčastňuje tohto eventu');

  const [participant] = await db
    .insert(liveEventParticipants)
    .values({ eventId, characterId, score: 0 })
    .returning();

  return participant;
}

export async function leaveEvent(db: ReturnType<typeof drizzle>, eventId: string, characterId: string) {
  const event = await db.query.liveEvents.findFirst({ where: eq(liveEvents.id, eventId) });
  if (!event || event.status !== 'active') throw new Error('Event nie je aktívny');

  const deleted = await db
    .delete(liveEventParticipants)
    .where(and(eq(liveEventParticipants.eventId, eventId), eq(liveEventParticipants.characterId, characterId)))
    .returning();

  if (deleted.length === 0) throw new Error('Postava sa nezúčastňuje tohto eventu');
  return deleted[0];
}

export async function addEventScore(db: ReturnType<typeof drizzle>, eventId: string, characterId: string, points: number) {
  if (points <= 0) throw new Error('Body musia byť kladné');

  const event = await db.query.liveEvents.findFirst({ where: eq(liveEvents.id, eventId) });
  if (!event || event.status !== 'active') throw new Error('Event nie je aktívny');

  const participant = await db.query.liveEventParticipants.findFirst({
    where: and(eq(liveEventParticipants.eventId, eventId), eq(liveEventParticipants.characterId, characterId)),
  });
  if (!participant) throw new Error('Postava nie je účastníkom eventu');

  const [updated] = await db
    .update(liveEventParticipants)
    .set({ score: sql`${liveEventParticipants.score} + ${points}` })
    .where(eq(liveEventParticipants.id, participant.id))
    .returning();

  return updated.score;
}

export async function claimEventReward(db: ReturnType<typeof drizzle>, eventId: string, characterId: string) {
  const event = await db.query.liveEvents.findFirst({ where: eq(liveEvents.id, eventId) });
  if (!event) throw new Error('Event nenájdený');
  if (event.status !== 'ended') throw new Error('Event ešte neskončil');

  const participant = await db.query.liveEventParticipants.findFirst({
    where: and(eq(liveEventParticipants.eventId, eventId), eq(liveEventParticipants.characterId, characterId)),
  });
  if (!participant) throw new Error('Postava nie je účastníkom eventu');
  if (participant.rewardClaimed) throw new Error('Odmena už bola prevzatá');

  const allParticipants = await db
    .select({ characterId: liveEventParticipants.characterId, score: liveEventParticipants.score })
    .from(liveEventParticipants)
    .where(eq(liveEventParticipants.eventId, eventId))
    .orderBy(desc(liveEventParticipants.score));

  const rank = allParticipants.findIndex((p) => p.characterId === characterId) + 1;

  const config = EVENT_CONFIGS[event.eventType as EventType];
  let multiplier = 1;
  if (rank === 1) multiplier = 3;
  else if (rank <= 10) multiplier = 2;
  else if (rank <= 50) multiplier = 1.5;

  const goldReward = Math.floor(config.rewards.gold * multiplier);
  const crystalReward = Math.floor(config.rewards.crystals * multiplier);

  await db.transaction(async (tx) => {
    await tx
      .update(liveEventParticipants)
      .set({ rewardClaimed: true })
      .where(eq(liveEventParticipants.id, participant.id));

    await tx
      .update(characters)
      .set({
        gold: sql`${characters.gold} + ${goldReward}`,
        premiumCurrency: sql`${characters.premiumCurrency} + ${crystalReward}`,
      })
      .where(eq(characters.id, characterId));
  });

  return { gold: goldReward, crystals: crystalReward, rank };
}

export async function getActiveEvents(db: ReturnType<typeof drizzle>) {
  return db.query.liveEvents.findMany({ where: eq(liveEvents.status, 'active') });
}

export async function getEventRankings(db: ReturnType<typeof drizzle>, eventId: string, limit = 100) {
  const rows = await db
    .select({
      characterId: liveEventParticipants.characterId,
      score: liveEventParticipants.score,
      joinedAt: liveEventParticipants.joinedAt,
    })
    .from(liveEventParticipants)
    .where(eq(liveEventParticipants.eventId, eventId))
    .orderBy(desc(liveEventParticipants.score))
    .limit(limit);

  return rows.map((row, index) => ({
    rank: index + 1,
    ...row,
  }));
}

export async function getCharacterEventStatus(db: ReturnType<typeof drizzle>, eventId: string, characterId: string) {
  const participant = await db.query.liveEventParticipants.findFirst({
    where: and(eq(liveEventParticipants.eventId, eventId), eq(liveEventParticipants.characterId, characterId)),
  });

  if (!participant) return null;

  const allParticipants = await db
    .select({ characterId: liveEventParticipants.characterId, score: liveEventParticipants.score })
    .from(liveEventParticipants)
    .where(eq(liveEventParticipants.eventId, eventId))
    .orderBy(desc(liveEventParticipants.score));

  const rank = allParticipants.findIndex((p) => p.characterId === characterId) + 1;

  return {
    ...participant,
    rank,
    totalParticipants: allParticipants.length,
  };
}

export async function cleanupExpiredEvents(db: ReturnType<typeof drizzle>) {
  const now = new Date();

  const expired = await db
    .select()
    .from(liveEvents)
    .where(and(eq(liveEvents.status, 'active'), sql`${liveEvents.endsAt} < ${now}`));

  if (expired.length === 0) return [];

  const ended = await db
    .update(liveEvents)
    .set({ status: 'ended' })
    .where(and(eq(liveEvents.status, 'active'), sql`${liveEvents.endsAt} < ${now}`))
    .returning();

  return ended;
}
