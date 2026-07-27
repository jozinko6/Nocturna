// ---------------------------------------------------------------------------
// Nocturna — Monetization Configuration
//
// Crystal packages, membership tiers, and purchase allowlists/blocklists.
// All prices are in EUR. Crystal packages are one-time purchases.
// Membership is a monthly subscription.
// ---------------------------------------------------------------------------

export interface CrystalPackage {
  id: string
  name: string
  /** Slovak description */
  description: string
  /** Number of crystals */
  crystals: number
  /** Bonus crystals (included for free) */
  bonusCrystals: number
  /** Price in EUR (including VAT) */
  priceEur: number
  /** Stripe Price ID for payment processing */
  stripePriceId: string | null
  /** Whether this is the recommended / best value package */
  recommended: boolean
  /** Display order in the shop */
  sortOrder: number
}

export interface MembershipTier {
  id: string
  name: string
  /** Slovak description */
  description: string
  /** Monthly price in EUR */
  priceEur: number
  /** Stripe Price ID */
  stripePriceId: string | null
  /** Monthly crystal stipend */
  monthlyCrystals: number
  /** Passive bonuses while subscribed */
  bonuses: {
    /** XP multiplier (e.g. 1.2 = +20% XP) */
    xpMultiplier: number
    /** Gold multiplier */
    goldMultiplier: number
    /** Energy regen reduction (percentage) */
    energyRegenReduction: number
    /** Additional daily missions */
    extraDailyMissions: number
    /** Priority in PvP matchmaking */
    pvpPriority: boolean
    /** Exclusive cosmetics (IDs) */
    exclusiveCosmetics: string[]
  }
}

// ---------------------------------------------------------------------------
// Crystal Packages
// ---------------------------------------------------------------------------

export const crystalPackages: CrystalPackage[] = [
  {
    id: 'crystal_50',
    name: 'Malý kryštálový balíček',
    description: '50 kryštálov pre začiatok tvojej cesty.',
    crystals: 50,
    bonusCrystals: 0,
    priceEur: 1.99,
    stripePriceId: null,
    recommended: false,
    sortOrder: 1,
  },
  {
    id: 'crystal_150',
    name: 'Stredný kryštálový balíček',
    description: '150 kryštálov + 15 bonusových.',
    crystals: 150,
    bonusCrystals: 15,
    priceEur: 4.99,
    stripePriceId: null,
    recommended: false,
    sortOrder: 2,
  },
  {
    id: 'crystal_400',
    name: 'Veľký kryštálový balíček',
    description: '400 kryštálov + 60 bonusových.',
    crystals: 400,
    bonusCrystals: 60,
    priceEur: 9.99,
    stripePriceId: null,
    recommended: true,
    sortOrder: 3,
  },
  {
    id: 'crystal_1000',
    name: 'Obrovský kryštálový balíček',
    description: '1000 kryštálov + 200 bonusových.',
    crystals: 1000,
    bonusCrystals: 200,
    priceEur: 19.99,
    stripePriceId: null,
    recommended: false,
    sortOrder: 4,
  },
  {
    id: 'crystal_2500',
    name: 'Kráľovský kryštálový balíček',
    description: '2500 kryštálov + 750 bonusových.',
    crystals: 2500,
    bonusCrystals: 750,
    priceEur: 39.99,
    stripePriceId: null,
    recommended: false,
    sortOrder: 5,
  },
]

// ---------------------------------------------------------------------------
// Membership
// ---------------------------------------------------------------------------

export const membershipTiers: MembershipTier[] = [
  {
    id: 'membership_standard',
    name: 'Nočný rytier',
    description: 'Mesačné členstvo s bonusmi a exkluzívnym obsahom.',
    priceEur: 4.99,
    stripePriceId: null,
    monthlyCrystals: 100,
    bonuses: {
      xpMultiplier: 1.15,
      goldMultiplier: 1.10,
      energyRegenReduction: 0.10,
      extraDailyMissions: 1,
      pvpPriority: false,
      exclusiveCosmetics: [],
    },
  },
  {
    id: 'membership_premium',
    name: 'Temný pán',
    description: 'Prémiové členstvo s maximálnymi bonusmi.',
    priceEur: 9.99,
    stripePriceId: null,
    monthlyCrystals: 300,
    bonuses: {
      xpMultiplier: 1.30,
      goldMultiplier: 1.25,
      energyRegenReduction: 0.20,
      extraDailyMissions: 2,
      pvpPriority: true,
      exclusiveCosmetics: ['cosmetic_aura_dark', 'cosmetic_mount_shadow'],
    },
  },
]

// ---------------------------------------------------------------------------
// Purchase rules
// ---------------------------------------------------------------------------

export interface PurchaseRule {
  /** Item or action ID */
  id: string
  /** Whether this ID is allowed (true) or blocked (false) */
  allowed: boolean
  /** Reason (for internal logging) */
  reason: string
}

/**
 * Items/actions that CAN be purchased with crystals.
 */
export const allowedPurchases: PurchaseRule[] = [
  { id: 'shop_refresh', allowed: true, reason: 'Manual shop refresh' },
  { id: 'energy_refill', allowed: true, reason: 'Energy refill' },
  { id: 'expedition_skip', allowed: true, reason: 'Expedition time skip' },
  { id: 'inventory_expand', allowed: true, reason: 'Inventory expansion' },
  { id: 'cosmetic_aura', allowed: true, reason: 'Cosmetic auras' },
  { id: 'cosmetic_mount', allowed: true, reason: 'Cosmetic mounts' },
  { id: 'membership_standard', allowed: true, reason: 'Standard membership' },
  { id: 'membership_premium', allowed: true, reason: 'Premium membership' },
]

/**
 * Items/actions that CANNOT be purchased with crystals (pay-to-win prevention).
 */
export const forbiddenPurchases: PurchaseRule[] = [
  { id: 'direct_gold', allowed: false, reason: 'No direct gold purchase' },
  { id: 'stat_boost', allowed: false, reason: 'No direct stat boosts' },
  { id: 'level_skip', allowed: false, reason: 'No level skipping' },
  { id: 'pvp_advantage', allowed: false, reason: 'No PvP stat advantages' },
  { id: 'loot_box', allowed: false, reason: 'No loot boxes (EU regulations)' },
  { id: 'gambling_mechanic', allowed: false, reason: 'No gambling mechanics' },
]

/**
 * Check if a purchase is allowed.
 */
export function isPurchaseAllowed(purchaseId: string): { allowed: boolean; reason: string } {
  const forbidden = forbiddenPurchases.find((r) => r.id === purchaseId)
  if (forbidden) return { allowed: false, reason: forbidden.reason }

  const allowed = allowedPurchases.find((r) => r.id === purchaseId)
  if (allowed) return { allowed: true, reason: allowed.reason }

  // Default: deny unknown purchases
  return { allowed: false, reason: 'Unknown purchase type' }
}
