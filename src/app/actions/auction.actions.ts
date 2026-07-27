'use server'

import { getDb } from '@/lib/db/drizzle'
import { auctionListings, auctionTransactions, characters } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { canCreateListing, validateListingPrice, canPurchaseListing, calculateListingFee, calculateSaleFee, calculateNetProceeds, detectFraudulentActivity } from '@/game/auction'

export async function getActiveListings(filters?: { listingType?: string; maxPrice?: number }) {
  const db = getDb()
  let query = db.select().from(auctionListings)
    .where(eq(auctionListings.status, 'active'))
    .orderBy(desc(auctionListings.createdAt))
    .limit(50)

  return { listings: await query }
}

export async function createListing(
  sellerCharacterId: string,
  listingType: 'item' | 'material',
  itemId: string | null,
  materialTemplateId: string | null,
  quantity: number,
  pricePerUnit: number,
  durationHours: number,
) {
  const db = getDb()
  const [seller] = await db.select().from(characters).where(eq(characters.id, sellerCharacterId)).limit(1)
  if (!seller) return { error: 'Postava nenájdená.' }

  const totalPrice = pricePerUnit * quantity
  const listingFee = calculateListingFee(totalPrice)

  if (seller.gold < listingFee) {
    return { error: `Nedostatok zlata na poplatok (${listingFee}).` }
  }

  const priceCheck = validateListingPrice(pricePerUnit, quantity, 0)
  if (!priceCheck.valid) return { error: priceCheck.error }

  const [listing] = await db.insert(auctionListings).values({
    sellerCharacterId,
    listingType,
    itemId,
    materialTemplateId,
    quantity,
    pricePerUnit,
    totalPrice,
    endsAt: new Date(Date.now() + durationHours * 3600000),
  }).returning()

  return { success: true, listingId: listing.id, listingFee }
}

export async function purchaseListing(listingId: string, buyerCharacterId: string) {
  const db = getDb()
  const [listing] = await db.select().from(auctionListings)
    .where(eq(auctionListings.id, listingId))
    .limit(1)

  if (!listing) return { error: 'Ponuka nenájdená.' }

  const [buyer] = await db.select().from(characters).where(eq(characters.id, buyerCharacterId)).limit(1)
  if (!buyer) return { error: 'Postava nenájdená.' }

  const check = canPurchaseListing(listing.status, listing.sellerCharacterId, buyerCharacterId, buyer.gold, listing.totalPrice)
  if (!check.allowed) return { error: check.reason }

  const saleFee = calculateSaleFee(listing.totalPrice)
  const netProceeds = calculateNetProceeds(listing.totalPrice)

  await db.update(auctionListings).set({
    status: 'sold',
    soldAt: new Date(),
    buyerCharacterId,
  }).where(eq(auctionListings.id, listingId))

  await db.insert(auctionTransactions).values({
    listingId,
    sellerCharacterId: listing.sellerCharacterId,
    buyerCharacterId,
    grossAmount: listing.totalPrice,
    feeAmount: saleFee,
    netAmount: netProceeds,
    idempotencyKey: `buy_${listingId}_${buyerCharacterId}_${Date.now()}`,
  })

  return { success: true, saleFee, netProceeds }
}

export async function cancelListing(listingId: string, characterId: string) {
  const db = getDb()
  const [listing] = await db.select().from(auctionListings)
    .where(and(eq(auctionListings.id, listingId), eq(auctionListings.sellerCharacterId, characterId)))
    .limit(1)

  if (!listing) return { error: 'Ponuka nenájdená.' }
  if (listing.status !== 'active') return { error: 'Ponuka nie je aktívna.' }

  await db.update(auctionListings).set({ status: 'cancelled' }).where(eq(auctionListings.id, listingId))

  return { success: true }
}

export async function getMyListings(characterId: string) {
  const db = getDb()
  const listings = await db.select().from(auctionListings)
    .where(eq(auctionListings.sellerCharacterId, characterId))
    .orderBy(desc(auctionListings.createdAt))

  return { listings }
}
