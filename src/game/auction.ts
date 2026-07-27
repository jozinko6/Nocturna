import { AUCTION_CONFIG } from '@/lib/config/auction'

export interface AuctionListingInput {
  sellerCharacterId: string
  listingType: 'item' | 'material'
  itemId?: string
  materialTemplateId?: string
  quantity: number
  pricePerUnit: number
  durationHours: number
}

export interface AuctionPurchaseInput {
  listingId: string
  buyerCharacterId: string
  idempotencyKey: string
}

export function calculateListingFee(totalPrice: number): number {
  const { min, rate } = AUCTION_CONFIG.fees.listingFee
  return Math.max(min, Math.floor(totalPrice * rate))
}

export function calculateSaleFee(totalPrice: number): number {
  return Math.floor(totalPrice * AUCTION_CONFIG.fees.saleFee.rate)
}

export function calculateNetProceeds(totalPrice: number): number {
  return totalPrice - calculateSaleFee(totalPrice)
}

export function canCreateListing(
  trustLevel: number,
  activeListingsToday: number,
  activeListingCount: number,
  accountAgeDays: number,
  characterLevel: number,
  expeditionsCompleted: number,
  hasVerifiedEmail: boolean,
): { allowed: boolean; reason?: string; maxListings: number } {
  const trust = AUCTION_CONFIG.trustLevels.find(t => t.level === trustLevel) || AUCTION_CONFIG.trustLevels[0]
  const maxListings = trust.maxActiveListings

  if (!hasVerifiedEmail) return { allowed: false, reason: 'Over svoj email.', maxListings }
  if (accountAgeDays < (trust.requirements.accountAgeDays || 0)) {
    return { allowed: false, reason: `Účet musí mať aspoň ${trust.requirements.accountAgeDays} dní.`, maxListings }
  }
  if (characterLevel < (trust.requirements.minLevel || 0)) {
    return { allowed: false, reason: `Potrebuješ úroveň ${trust.requirements.minLevel}.`, maxListings }
  }
  const minExpeditions =
    'minExpeditions' in trust.requirements ? trust.requirements.minExpeditions : 0
  if (expeditionsCompleted < minExpeditions) {
    return { allowed: false, reason: `Potrebuješ aspoň ${minExpeditions} výprav.`, maxListings }
  }
  if (activeListingCount >= maxListings) {
    return { allowed: false, reason: `Maximálne ${maxListings} aktívnych ponúk.`, maxListings }
  }
  if (activeListingsToday >= AUCTION_CONFIG.limits.maxNewListingsPerDay) {
    return { allowed: false, reason: 'Denný limit ponúk dosiahnutý.', maxListings }
  }

  return { allowed: true, maxListings }
}

export function validateListingPrice(
  pricePerUnit: number,
  quantity: number,
  estimatedValue: number,
): { valid: boolean; error?: string } {
  const totalPrice = pricePerUnit * quantity

  if (totalPrice < AUCTION_CONFIG.limits.minPrice) {
    return { valid: false, error: `Minimálna cena je ${AUCTION_CONFIG.limits.minPrice} zlata.` }
  }

  const maxPrice = estimatedValue * AUCTION_CONFIG.priceLimits.maxMultiplierFromEstimated
  const minPrice = estimatedValue * AUCTION_CONFIG.priceLimits.minMultiplierFromEstimated

  if (estimatedValue > 0 && totalPrice > maxPrice) {
    return { valid: false, error: `Cena je príliš vysoká (max: ${Math.floor(maxPrice)}).` }
  }

  if (estimatedValue > 0 && totalPrice < minPrice) {
    return { valid: false, error: `Cena je príliš nízka (min: ${Math.floor(minPrice)}).` }
  }

  return { valid: true }
}

export function canPurchaseListing(
  listingStatus: string,
  sellerCharacterId: string,
  buyerCharacterId: string,
  buyerGold: number,
  totalPrice: number,
): { allowed: boolean; reason?: string } {
  if (listingStatus !== 'active') return { allowed: false, reason: 'Ponuka už nie je aktívna.' }
  if (sellerCharacterId === buyerCharacterId) return { allowed: false, reason: 'Nemôžeš kúpiť vlastnú ponuku.' }
  if (buyerGold < totalPrice) return { allowed: false, reason: 'Nedostatok zlata.' }

  return { allowed: true }
}

export function prepareAuctionSnapshot(
  listing: any,
  buyerId: string,
): { itemSnapshot: any } {
  return {
    itemSnapshot: {
      listingId: listing.id,
      type: listing.listingType,
      itemId: listing.itemId,
      materialTemplateId: listing.materialTemplateId,
      quantity: listing.quantity,
      pricePerUnit: listing.pricePerUnit,
      totalPrice: listing.totalPrice,
      sellerId: listing.sellerCharacterId,
      buyerId,
      timestamp: new Date().toISOString(),
    },
  }
}

export function detectFraudulentActivity(
  recentTransactions: { buyerId: string; sellerId: string; amount: number; timestamp: Date }[],
  currentTransaction: { buyerId: string; sellerId: string; amount: number },
): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = []
  const oneHourAgo = new Date(Date.now() - 3600000)

  const recentWithSameParties = recentTransactions.filter(
    t => t.timestamp > oneHourAgo &&
      ((t.buyerId === currentTransaction.buyerId && t.sellerId === currentTransaction.sellerId) ||
        (t.buyerId === currentTransaction.sellerId && t.sellerId === currentTransaction.buyerId))
  )

  if (recentWithSameParties.length >= AUCTION_CONFIG.fraudDetection.maxSameBuyerSellerPerDay) {
    reasons.push('Opakované transakcie medzi rovnakými hráčmi.')
  }

  const recentByBuyer = recentTransactions.filter(
    t => t.timestamp > oneHourAgo && t.buyerId === currentTransaction.buyerId
  )

  if (recentByBuyer.length >= AUCTION_CONFIG.fraudDetection.maxTransactionsPerHour) {
    reasons.push('Príliš veľa transakcií za hodinu.')
  }

  return { suspicious: reasons.length > 0, reasons }
}

export function getDurations(): number[] {
  return [...AUCTION_CONFIG.durations]
}

export function isItemTradable(itemBinding: string): boolean {
  return itemBinding === AUCTION_CONFIG.itemBinding.tradable
}

export function estimateItemValue(
  baseStats: Record<string, number>,
  rarity: string,
  level: number,
  upgradeLevel: number,
): number {
  const statTotal = Object.values(baseStats).reduce((sum, v) => sum + v, 0)
  const rarityMult = ({ common: 1, uncommon: 1.5, rare: 2.5, epic: 5, legendary: 15, cursed: 3 } as any)[rarity] || 1
  const upgradeMult = 1 + upgradeLevel * 0.15

  return Math.floor(statTotal * 10 * rarityMult * upgradeMult * (1 + level * 0.1))
}
