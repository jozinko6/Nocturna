import { eq, and, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { referralCodes, referralRewards, characters, currencyLedger } from '@/lib/db/schema';

export const REFERRAL_CODE_LENGTH = 8;
export const REFERRAL_MAX_USES = 10;
export const REFERRAL_REWARD_GOLD = 100;
export const REFERRAL_REWARD_CRYSTALS = 25;
export const REFERRAL_REWARD_XP = 500;
export const REFERRAL_REFERRED_BONUS_GOLD = 200;
export const REFERRAL_REFERRED_BONUS_CRYSTALS = 10;
export const REFERRAL_REFERRED_BONUS_XP = 250;

export function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function generateReferralCode(
  db: ReturnType<typeof drizzle>,
  characterId: string,
): Promise<{ code: string }> {
  const existing = await db
    .select()
    .from(referralCodes)
    .where(and(
      eq(referralCodes.characterId, characterId),
      eq(referralCodes.active, true),
    ))
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Postava už má aktívny referenčný kód.');
  }

  let code: string;
  let attempts = 0;
  do {
    code = generateUniqueCode();
    const exists = await db
      .select({ id: referralCodes.id })
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);
    if (exists.length === 0) break;
    attempts++;
  } while (attempts < 20);

  if (attempts >= 20) {
    throw new Error('Nepodarilo sa vygenerovať unikátny kód.');
  }

  await db.insert(referralCodes).values({
    characterId,
    code,
    usesCount: 0,
    maxUses: REFERRAL_MAX_USES,
    active: true,
  });

  return { code };
}

export async function validateReferralCode(
  db: ReturnType<typeof drizzle>,
  code: string,
): Promise<{ valid: boolean; codeId?: string; referrerCharacterId?: string }> {
  const rows = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.code, code.toUpperCase()))
    .limit(1);

  if (rows.length === 0) {
    return { valid: false };
  }

  const row = rows[0];

  if (!row.active) {
    return { valid: false };
  }

  if (row.usesCount >= row.maxUses) {
    return { valid: false };
  }

  return {
    valid: true,
    codeId: row.id,
    referrerCharacterId: row.characterId,
  };
}

export async function applyReferral(
  db: ReturnType<typeof drizzle>,
  referredCharacterId: string,
  code: string,
): Promise<{
  referrerReward: { gold: number; crystals: number; xp: number };
  referredBonus: { gold: number; crystals: number; xp: number };
}> {
  const validation = await validateReferralCode(db, code);
  if (!validation.valid || !validation.codeId || !validation.referrerCharacterId) {
    throw new Error('Neplatný alebo vyčerpaný referenčný kód.');
  }

  if (validation.referrerCharacterId === referredCharacterId) {
    throw new Error('Nemôžeš použiť vlastný referenčný kód.');
  }

  const alreadyReferred = await db
    .select({ id: referralRewards.id })
    .from(referralRewards)
    .where(eq(referralRewards.referredId, referredCharacterId))
    .limit(1);

  if (alreadyReferred.length > 0) {
    throw new Error('Táto postava už bola cez niekoho privedená.');
  }

  const referrerRows = await db
    .select()
    .from(characters)
    .where(eq(characters.id, validation.referrerCharacterId))
    .limit(1);

  if (referrerRows.length === 0) {
    throw new Error('Odkazujúca postava nebola nájdená.');
  }

  const referredRows = await db
    .select()
    .from(characters)
    .where(eq(characters.id, referredCharacterId))
    .limit(1);

  if (referredRows.length === 0) {
    throw new Error('Odkazovaná postava nebola nájdená.');
  }

  const referrerChar = referrerRows[0];
  const referredChar = referredRows[0];

  const referrerReward = {
    gold: REFERRAL_REWARD_GOLD,
    crystals: REFERRAL_REWARD_CRYSTALS,
    xp: REFERRAL_REWARD_XP,
  };

  const referredBonus = {
    gold: REFERRAL_REFERRED_BONUS_GOLD,
    crystals: REFERRAL_REFERRED_BONUS_CRYSTALS,
    xp: REFERRAL_REFERRED_BONUS_XP,
  };

  await db.transaction(async (tx) => {
    await tx
      .update(referralCodes)
      .set({ usesCount: sql`${referralCodes.usesCount} + 1` })
      .where(eq(referralCodes.id, validation.codeId!));

    await tx.insert(referralRewards).values({
      referrerId: validation.referrerCharacterId!,
      referredId: referredCharacterId,
      referralCodeId: validation.codeId!,
      rewardGold: referrerReward.gold,
      rewardCrystals: referrerReward.crystals,
      rewardXp: referrerReward.xp,
      claimed: false,
    });

    await tx.insert(referralRewards).values({
      referrerId: referredCharacterId,
      referredId: referredCharacterId,
      referralCodeId: validation.codeId!,
      rewardGold: referredBonus.gold,
      rewardCrystals: referredBonus.crystals,
      rewardXp: referredBonus.xp,
      claimed: true,
    });

    await tx
      .update(characters)
      .set({
        gold: referrerChar.gold + referrerReward.gold,
        premiumCurrency: referrerChar.premiumCurrency + referrerReward.crystals,
        experience: referrerChar.experience + referrerReward.xp,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, validation.referrerCharacterId!));

    await tx
      .update(characters)
      .set({
        gold: referredChar.gold + referredBonus.gold,
        premiumCurrency: referredChar.premiumCurrency + referredBonus.crystals,
        experience: referredChar.experience + referredBonus.xp,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, referredCharacterId));

    await tx.insert(currencyLedger).values({
      characterId: validation.referrerCharacterId!,
      currencyType: 'gold',
      balanceBefore: referrerChar.gold,
      changeAmount: referrerReward.gold,
      balanceAfter: referrerChar.gold + referrerReward.gold,
      reason: 'Odmena za odporúčanie',
      sourceType: 'referral',
      sourceId: validation.codeId!,
      idempotencyKey: `referral_referrer_gold_${validation.codeId!}_${referredCharacterId}`,
    });

    await tx.insert(currencyLedger).values({
      characterId: validation.referrerCharacterId!,
      currencyType: 'premium_crystals',
      balanceBefore: referrerChar.premiumCurrency,
      changeAmount: referrerReward.crystals,
      balanceAfter: referrerChar.premiumCurrency + referrerReward.crystals,
      reason: 'Odmena za odporúčanie',
      sourceType: 'referral',
      sourceId: validation.codeId!,
      idempotencyKey: `referral_referrer_crystals_${validation.codeId!}_${referredCharacterId}`,
    });

    await tx.insert(currencyLedger).values({
      characterId: referredCharacterId,
      currencyType: 'gold',
      balanceBefore: referredChar.gold,
      changeAmount: referredBonus.gold,
      balanceAfter: referredChar.gold + referredBonus.gold,
      reason: 'Bonus za použitie referenčného kódu',
      sourceType: 'referral_bonus',
      sourceId: validation.codeId!,
      idempotencyKey: `referral_referred_gold_${validation.codeId!}_${referredCharacterId}`,
    });

    await tx.insert(currencyLedger).values({
      characterId: referredCharacterId,
      currencyType: 'premium_crystals',
      balanceBefore: referredChar.premiumCurrency,
      changeAmount: referredBonus.crystals,
      balanceAfter: referredChar.premiumCurrency + referredBonus.crystals,
      reason: 'Bonus za použitie referenčného kódu',
      sourceType: 'referral_bonus',
      sourceId: validation.codeId!,
      idempotencyKey: `referral_referred_crystals_${validation.codeId!}_${referredCharacterId}`,
    });
  });

  return { referrerReward, referredBonus };
}

export async function claimReferralReward(
  db: ReturnType<typeof drizzle>,
  characterId: string,
  rewardId: string,
): Promise<{ gold: number; crystals: number }> {
  const reward = await db
    .select()
    .from(referralRewards)
    .where(and(
      eq(referralRewards.id, rewardId),
      eq(referralRewards.referrerId, characterId),
      eq(referralRewards.claimed, false),
    ))
    .limit(1);

  if (reward.length === 0) {
    throw new Error('Odmena nenájdená alebo už bola vybraná.');
  }

  const char = await db
    .select()
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1);

  if (char.length === 0) {
    throw new Error('Postava nebola nájdená.');
  }

  const gold = reward[0].rewardGold;
  const crystals = reward[0].rewardCrystals;

  await db.transaction(async (tx) => {
    await tx
      .update(referralRewards)
      .set({ claimed: true })
      .where(eq(referralRewards.id, rewardId));

    await tx
      .update(characters)
      .set({
        gold: char[0].gold + gold,
        premiumCurrency: char[0].premiumCurrency + crystals,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId));

    await tx.insert(currencyLedger).values({
      characterId,
      currencyType: 'gold',
      balanceBefore: char[0].gold,
      changeAmount: gold,
      balanceAfter: char[0].gold + gold,
      reason: 'Vybratie odmeny za odporúčanie',
      sourceType: 'referral_claim',
      sourceId: rewardId,
      idempotencyKey: `claim_referral_gold_${rewardId}`,
    });

    await tx.insert(currencyLedger).values({
      characterId,
      currencyType: 'premium_crystals',
      balanceBefore: char[0].premiumCurrency,
      changeAmount: crystals,
      balanceAfter: char[0].premiumCurrency + crystals,
      reason: 'Vybratie odmeny za odporúčanie',
      sourceType: 'referral_claim',
      sourceId: rewardId,
      idempotencyKey: `claim_referral_crystals_${rewardId}`,
    });
  });

  return { gold, crystals };
}

export async function getReferralStats(
  db: ReturnType<typeof drizzle>,
  characterId: string,
): Promise<{
  code: string | null;
  totalUses: number;
  maxUses: number;
  pendingRewards: number;
  totalEarnedFromReferrals: number;
}> {
  const codeRows = await db
    .select()
    .from(referralCodes)
    .where(and(
      eq(referralCodes.characterId, characterId),
      eq(referralCodes.active, true),
    ))
    .limit(1);

  if (codeRows.length === 0) {
    return {
      code: null,
      totalUses: 0,
      maxUses: REFERRAL_MAX_USES,
      pendingRewards: 0,
      totalEarnedFromReferrals: 0,
    };
  }

  const codeRow = codeRows[0];

  const pendingRewards = await db
    .select()
    .from(referralRewards)
    .where(and(
      eq(referralRewards.referrerId, characterId),
      eq(referralRewards.claimed, false),
    ));

  const allRewards = await db
    .select()
    .from(referralRewards)
    .where(eq(referralRewards.referrerId, characterId));

  const totalEarned = allRewards.reduce(
    (sum, r) => sum + r.rewardGold + r.rewardCrystals,
    0,
  );

  return {
    code: codeRow.code,
    totalUses: codeRow.usesCount,
    maxUses: codeRow.maxUses,
    pendingRewards: pendingRewards.length,
    totalEarnedFromReferrals: totalEarned,
  };
}

export async function getReferralRewards(
  db: ReturnType<typeof drizzle>,
  characterId: string,
) {
  const asReferrer = await db
    .select()
    .from(referralRewards)
    .where(eq(referralRewards.referrerId, characterId));

  const asReferred = await db
    .select()
    .from(referralRewards)
    .where(eq(referralRewards.referredId, characterId));

  return { asReferrer, asReferred };
}
