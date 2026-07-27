import { drizzle } from 'drizzle-orm/postgres-js'
import { randomUUID } from 'crypto'
import { eq, and, gte } from 'drizzle-orm'
import * as schema from '../lib/db/schema'
import { crystalPackages, membershipTiers } from '../lib/config/monetization'
import type { CrystalPackage, MembershipTier } from '../lib/config/monetization'

const { purchases, subscriptions, characters, characterResources, currencyLedger } = schema

type DB = ReturnType<typeof drizzle>

export const CRYSTAL_PACK_IDS = ['crystal_50', 'crystal_150', 'crystal_400', 'crystal_1000', 'crystal_2500'] as const
export const MEMBERSHIP_IDS = ['membership_standard', 'membership_premium'] as const
export const ENERGY_REFILL_COST_CRYSTALS = 50
export const ENERGY_REFILL_AMOUNT = 100
export const SHOP_REFRESH_COST_CRYSTALS = 10
export const INVENTORY_EXPAND_COST_CRYSTALS = 25
export const INVENTORY_EXPAND_AMOUNT = 10

const DEFAULT_BONUSES: MembershipTier['bonuses'] = {
  xpMultiplier: 1.0,
  goldMultiplier: 1.0,
  energyRegenReduction: 0,
  extraDailyMissions: 0,
  pvpPriority: false,
  exclusiveCosmetics: [],
}

const ENERGY_REFILL_COOLDOWN_MS = 5 * 60 * 1000

export function getCrystalPackById(packId: string): CrystalPackage | null {
  return crystalPackages.find((p) => p.id === packId) ?? null
}

export function getMembershipById(membershipId: string): MembershipTier | null {
  return membershipTiers.find((t) => t.id === membershipId) ?? null
}

export function getAllCrystalPackages(): CrystalPackage[] {
  return [...crystalPackages].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getAllMembershipTiers(): MembershipTier[] {
  return [...membershipTiers]
}

export async function createPurchaseIntent(
  db: DB,
  userId: string,
  packId: string,
): Promise<{ purchaseId: string; checkoutUrl: null }> {
  const pack = getCrystalPackById(packId)
  if (!pack) throw new Error('Balíček kryštálov neexistuje')

  const recentPending = await db
    .select()
    .from(purchases)
    .where(
      and(
        eq(purchases.userId, userId),
        eq(purchases.itemName, packId),
        eq(purchases.status, 'pending'),
        gte(purchases.createdAt, new Date(Date.now() - 5 * 60 * 1000)),
      ),
    )
    .limit(1)

  if (recentPending.length > 0) {
    throw new Error('Predošlý nákup ešte nebol spracovaný')
  }

  const [purchase] = await db
    .insert(purchases)
    .values({
      userId,
      itemName: packId,
      crystalAmount: pack.crystals + pack.bonusCrystals,
      priceEur: Math.round(pack.priceEur * 100),
      stripeSessionId: 'pending',
      status: 'pending',
    })
    .returning()

  return { purchaseId: purchase.id, checkoutUrl: null }
}

export async function completePurchase(
  db: DB,
  userId: string,
  purchaseId: string,
  stripeSessionId: string,
  stripePaymentIntentId: string | null,
): Promise<{ crystalsAdded: number; newBalance: number }> {
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.id, purchaseId))
    .limit(1)

  if (!purchase) throw new Error('Nákup nebol nájdený')
  if (purchase.userId !== userId) throw new Error('Nákup nepatrí tomuto používateľovi')
  if (purchase.status !== 'pending') throw new Error('Nákup nie je v stave čakajúci')

  return await db.transaction(async (tx) => {
    await tx
      .update(purchases)
      .set({
        status: 'completed',
        stripeSessionId,
        stripePaymentIntentId: stripePaymentIntentId ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, purchaseId))

    const [character] = await tx
      .select()
      .from(characters)
      .where(eq(characters.userId, userId))
      .limit(1)

    if (!character) throw new Error('Postava nebola nájdená')

    const newBalance = character.premiumCurrency + purchase.crystalAmount

    await tx
      .update(characters)
      .set({ premiumCurrency: newBalance, updatedAt: new Date() })
      .where(eq(characters.id, character.id))

    await tx.insert(currencyLedger).values({
      characterId: character.id,
      currencyType: 'premium_crystals',
      balanceBefore: character.premiumCurrency,
      changeAmount: purchase.crystalAmount,
      balanceAfter: newBalance,
      reason: `Nákup balíčka: ${purchase.itemName}`,
      sourceType: 'purchase',
      sourceId: purchaseId,
      idempotencyKey: `complete_${purchaseId}_${randomUUID()}`,
    })

    return { crystalsAdded: purchase.crystalAmount, newBalance }
  })
}

export async function failPurchase(
  db: DB,
  purchaseId: string,
  _reason: string,
): Promise<void> {
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.id, purchaseId))
    .limit(1)

  if (!purchase) throw new Error('Nákup nebol nájdený')
  if (purchase.status !== 'pending') throw new Error('Nákup nie je v stave čakajúci')

  await db
    .update(purchases)
    .set({ status: 'failed', updatedAt: new Date() })
    .where(eq(purchases.id, purchaseId))
}

export async function refundPurchase(
  db: DB,
  purchaseId: string,
): Promise<void> {
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.id, purchaseId))
    .limit(1)

  if (!purchase) throw new Error('Nákup nebol nájdený')
  if (purchase.status !== 'completed') throw new Error('Nákup nie je dokončený')

  await db.transaction(async (tx) => {
    await tx
      .update(purchases)
      .set({ status: 'refunded', updatedAt: new Date() })
      .where(eq(purchases.id, purchaseId))

    const [character] = await tx
      .select()
      .from(characters)
      .where(eq(characters.userId, purchase.userId))
      .limit(1)

    if (!character) throw new Error('Postava nebola nájdená')

    const newBalance = Math.max(0, character.premiumCurrency - purchase.crystalAmount)

    await tx
      .update(characters)
      .set({ premiumCurrency: newBalance, updatedAt: new Date() })
      .where(eq(characters.id, character.id))

    await tx.insert(currencyLedger).values({
      characterId: character.id,
      currencyType: 'premium_crystals',
      balanceBefore: character.premiumCurrency,
      changeAmount: -purchase.crystalAmount,
      balanceAfter: newBalance,
      reason: `Refund nákupu: ${purchase.itemName}`,
      sourceType: 'refund',
      sourceId: purchaseId,
      idempotencyKey: `refund_${purchaseId}_${randomUUID()}`,
    })
  })
}

export async function subscribeMembership(
  db: DB,
  userId: string,
  membershipId: string,
): Promise<{ subscriptionId: string; expiresAt: Date }> {
  const tier = getMembershipById(membershipId)
  if (!tier) throw new Error('Členstvo neexistuje')

  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const [subscription] = await db
    .insert(subscriptions)
    .values({
      userId,
      stripeSubscriptionId: 'pending',
      plan: membershipId,
      status: 'active',
      currentPeriodEnd: periodEnd,
    })
    .returning()

  await db.insert(purchases).values({
    userId,
    itemName: membershipId,
    crystalAmount: 0,
    priceEur: Math.round(tier.priceEur * 100),
    stripeSessionId: 'sub_pending',
    status: 'completed',
  })

  return { subscriptionId: subscription.id, expiresAt: periodEnd }
}

export async function cancelSubscription(
  db: DB,
  subscriptionId: string,
): Promise<void> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, subscriptionId))
    .limit(1)

  if (!sub) throw new Error('Predplatné nebolo nájdené')
  if (sub.status !== 'active') throw new Error('Predplatné nie je aktívne')

  await db
    .update(subscriptions)
    .set({ status: 'canceled', updatedAt: new Date() })
    .where(eq(subscriptions.id, subscriptionId))
}

export async function isSubscriptionActive(
  db: DB,
  userId: string,
): Promise<boolean> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active'),
        gte(subscriptions.currentPeriodEnd, new Date()),
      ),
    )
    .limit(1)

  return !!sub
}

export async function getMembershipBonuses(
  db: DB,
  userId: string,
): Promise<MembershipTier['bonuses']> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active'),
        gte(subscriptions.currentPeriodEnd, new Date()),
      ),
    )
    .limit(1)

  if (!sub) return DEFAULT_BONUSES

  const tier = getMembershipById(sub.plan)
  return tier?.bonuses ?? DEFAULT_BONUSES
}

export async function applyMembershipBonuses(
  db: DB,
  userId: string,
  baseXp: number,
  baseGold: number,
): Promise<{ finalXp: number; finalGold: number }> {
  const bonuses = await getMembershipBonuses(db, userId)
  return {
    finalXp: Math.floor(baseXp * bonuses.xpMultiplier),
    finalGold: Math.floor(baseGold * bonuses.goldMultiplier),
  }
}

export async function spendCrystals(
  db: DB,
  characterId: string,
  amount: number,
  reason: string,
): Promise<number> {
  if (amount <= 0) throw new Error('Množstvo musí byť kladné')

  return await db.transaction(async (tx) => {
    const [character] = await tx
      .select()
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1)

    if (!character) throw new Error('Postava nebola nájdená')
    if (character.premiumCurrency < amount) throw new Error('Nedostatok kryštálov')

    const newBalance = character.premiumCurrency - amount

    await tx
      .update(characters)
      .set({ premiumCurrency: newBalance, updatedAt: new Date() })
      .where(eq(characters.id, characterId))

    await tx.insert(currencyLedger).values({
      characterId,
      currencyType: 'premium_crystals',
      balanceBefore: character.premiumCurrency,
      changeAmount: -amount,
      balanceAfter: newBalance,
      reason,
      sourceType: 'spend',
      idempotencyKey: `spend_${characterId}_${randomUUID()}`,
    })

    return newBalance
  })
}

export async function getCrystalBalance(
  db: DB,
  characterId: string,
): Promise<number> {
  const [character] = await db
    .select({ premiumCurrency: characters.premiumCurrency })
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1)

  if (!character) throw new Error('Postava nebola nájdená')
  return character.premiumCurrency
}

export async function refundEnergy(
  db: DB,
  characterId: string,
): Promise<{ newEnergy: number; crystalsSpent: number }> {
  return await db.transaction(async (tx) => {
    const [resources] = await tx
      .select()
      .from(characterResources)
      .where(eq(characterResources.characterId, characterId))
      .limit(1)

    if (!resources) throw new Error('Zdroje postavy neboli nájdené')

    if (resources.lastEnergyUpdate) {
      const cooldownEnd = resources.lastEnergyUpdate.getTime() + ENERGY_REFILL_COOLDOWN_MS
      if (Date.now() < cooldownEnd) {
        throw new Error('Odpočinok ešte nie je dostupný')
      }
    }

    if (resources.currentEnergy >= resources.maxEnergy) {
      throw new Error('Energia je plná')
    }

    const [character] = await tx
      .select()
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1)

    if (!character) throw new Error('Postava nebola nájdená')
    if (character.premiumCurrency < ENERGY_REFILL_COST_CRYSTALS) {
      throw new Error('Nedostatok kryštálov')
    }

    const newCrystalBalance = character.premiumCurrency - ENERGY_REFILL_COST_CRYSTALS
    const newEnergy = Math.min(resources.currentEnergy + ENERGY_REFILL_AMOUNT, resources.maxEnergy)

    await tx
      .update(characters)
      .set({ premiumCurrency: newCrystalBalance, updatedAt: new Date() })
      .where(eq(characters.id, characterId))

    await tx
      .update(characterResources)
      .set({ currentEnergy: newEnergy, lastEnergyUpdate: new Date() })
      .where(eq(characterResources.characterId, characterId))

    await tx.insert(currencyLedger).values({
      characterId,
      currencyType: 'premium_crystals',
      balanceBefore: character.premiumCurrency,
      changeAmount: -ENERGY_REFILL_COST_CRYSTALS,
      balanceAfter: newCrystalBalance,
      reason: 'Doplnenie energie',
      sourceType: 'energy_refill',
      idempotencyKey: `energy_refill_${characterId}_${randomUUID()}`,
    })

    return { newEnergy, crystalsSpent: ENERGY_REFILL_COST_CRYSTALS }
  })
}
