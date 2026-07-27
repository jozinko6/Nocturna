import { eq, desc, lt } from 'drizzle-orm';
import type { DB } from '../lib/db/drizzle';
import { loginStreaks, characters } from '../lib/db/schema';

export const STREAK_BONUS_GOLD_PER_DAY = 25;
export const STREAK_MILESTONES = [7, 14, 30, 60, 90] as const;
export const STREAK_MILESTONE_BONUS_CRYSTALS: Record<number, number> = {
  7: 25,
  14: 50,
  30: 100,
  60: 200,
  90: 500,
};

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.floor((d2.getTime() - d1.getTime()) / 86_400_000);
}

function findMilestone(streak: number): number | null {
  for (const m of STREAK_MILESTONES) {
    if (streak === m) return m;
  }
  return null;
}

function nextMilestone(streak: number): {
  next: number;
  daysTo: number;
  reward: number;
} | null {
  for (const m of STREAK_MILESTONES) {
    if (m > streak) {
      return {
        next: m,
        daysTo: m - streak,
        reward: STREAK_MILESTONE_BONUS_CRYSTALS[m],
      };
    }
  }
  return null;
}

export function calculateStreakBonus(streak: number): {
  gold: number;
  crystals: number;
  milestone: number | null;
} {
  const milestone = findMilestone(streak);
  return {
    gold: streak * STREAK_BONUS_GOLD_PER_DAY,
    crystals: milestone ? STREAK_MILESTONE_BONUS_CRYSTALS[milestone] : 0,
    milestone,
  };
}

export async function recordLogin(
  db: DB,
  characterId: string,
): Promise<{
  streak: number;
  isNewDay: boolean;
  alreadyLoggedIn: boolean;
  milestone: number | null;
}> {
  const today = todayDate();

  const existing = await db.query.loginStreaks.findFirst({
    where: eq(loginStreaks.characterId, characterId),
  });

  if (existing && existing.lastLoginDate === today) {
    return {
      streak: existing.currentStreak,
      isNewDay: false,
      alreadyLoggedIn: true,
      milestone: findMilestone(existing.currentStreak),
    };
  }

  let newStreak: number;
  let bonusLogins: number;

  if (!existing) {
    newStreak = 1;
    bonusLogins = 1;
  } else {
    const gap = daysBetween(existing.lastLoginDate, today);
    if (gap === 1) {
      newStreak = existing.currentStreak + 1;
    } else {
      newStreak = 1;
    }
    bonusLogins = 1;
  }

  const newLongest = existing
    ? Math.max(existing.longestStreak, newStreak)
    : 1;
  const newTotal = existing ? existing.totalLogins + bonusLogins : 1;
  const milestone = findMilestone(newStreak);

  if (existing) {
    await db
      .update(loginStreaks)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongest,
        totalLogins: newTotal,
        lastLoginDate: today,
        updatedAt: new Date(),
      })
      .where(eq(loginStreaks.id, existing.id));
  } else {
    await db.insert(loginStreaks).values({
      characterId,
      currentStreak: newStreak,
      longestStreak: newLongest,
      totalLogins: newTotal,
      lastLoginDate: today,
    });
  }

  return {
    streak: newStreak,
    isNewDay: true,
    alreadyLoggedIn: false,
    milestone,
  };
}

export async function getStreakInfo(
  db: DB,
  characterId: string,
): Promise<{
  currentStreak: number;
  longestStreak: number;
  totalLogins: number;
  nextMilestone: number | null;
  daysToMilestone: number;
  milestoneReward: number;
}> {
  const row = await db.query.loginStreaks.findFirst({
    where: eq(loginStreaks.characterId, characterId),
  });

  if (!row) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalLogins: 0,
      nextMilestone: STREAK_MILESTONES[0],
      daysToMilestone: STREAK_MILESTONES[0],
      milestoneReward: STREAK_MILESTONE_BONUS_CRYSTALS[STREAK_MILESTONES[0]],
    };
  }

  const next = nextMilestone(row.currentStreak);
  return {
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    totalLogins: row.totalLogins,
    nextMilestone: next?.next ?? null,
    daysToMilestone: next?.daysTo ?? 0,
    milestoneReward: next?.reward ?? 0,
  };
}

export async function claimStreakBonus(
  db: DB,
  characterId: string,
): Promise<{
  gold: number;
  crystals: number;
  streak: number;
  claimed: boolean;
}> {
  const streakRow = await db.query.loginStreaks.findFirst({
    where: eq(loginStreaks.characterId, characterId),
  });

  if (!streakRow) {
    return { gold: 0, crystals: 0, streak: 0, claimed: false };
  }

  const today = todayDate();
  if (streakRow.lastLoginDate !== today) {
    return {
      gold: 0,
      crystals: 0,
      streak: streakRow.currentStreak,
      claimed: false,
    };
  }

  const bonus = calculateStreakBonus(streakRow.currentStreak);

  const charRow = await db.query.characters.findFirst({
    where: eq(characters.id, characterId),
  });

  if (!charRow) {
    return { gold: 0, crystals: 0, streak: streakRow.currentStreak, claimed: false };
  }

  const newGold = charRow.gold + bonus.gold;
  const newCrystals = charRow.premiumCurrency + bonus.crystals;

  await db
    .update(characters)
    .set({
      gold: newGold,
      premiumCurrency: newCrystals,
      updatedAt: new Date(),
    })
    .where(eq(characters.id, characterId));

  return {
    gold: bonus.gold,
    crystals: bonus.crystals,
    streak: streakRow.currentStreak,
    claimed: true,
  };
}

export async function getStreakLeaderboard(
  db: DB,
  limit: number = 50,
): Promise<
  Array<{
    characterId: string;
    name: string;
    currentStreak: number;
    longestStreak: number;
  }>
> {
  const rows = await db
    .select({
      characterId: loginStreaks.characterId,
      currentStreak: loginStreaks.currentStreak,
      longestStreak: loginStreaks.longestStreak,
      name: characters.name,
    })
    .from(loginStreaks)
    .innerJoin(characters, eq(loginStreaks.characterId, characters.id))
    .orderBy(desc(loginStreaks.currentStreak))
    .limit(limit);

  return rows.map((r) => ({
    characterId: r.characterId,
    name: r.name,
    currentStreak: r.currentStreak,
    longestStreak: r.longestStreak,
  }));
}

export async function resetStaleStreaks(
  db: DB,
): Promise<{ resetCount: number }> {
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  const stale = await db
    .select({ id: loginStreaks.id })
    .from(loginStreaks)
    .where(lt(loginStreaks.lastLoginDate, yesterday));

  if (stale.length === 0) {
    return { resetCount: 0 };
  }

  for (const row of stale) {
    await db
      .update(loginStreaks)
      .set({ currentStreak: 0, updatedAt: new Date() })
      .where(eq(loginStreaks.id, row.id));
  }

  return { resetCount: stale.length };
}
