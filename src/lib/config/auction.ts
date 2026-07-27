export const AUCTION_CONFIG = {
  fees: {
    listingFee: { type: 'percentage' as const, min: 5, rate: 0.01 },
    saleFee: { type: 'percentage' as const, rate: 0.05 },
  },

  limits: {
    maxActiveListings: 5,
    maxNewListingsPerDay: 20,
    maxDurationHours: 48,
    minPrice: 10,
    premiumBonusListings: 2,
  },

  trustLevels: [
    { level: 0, requirements: { verifiedEmail: true, accountAgeDays: 3, minLevel: 5, minExpeditions: 10 }, maxActiveListings: 3 },
    { level: 1, requirements: { accountAgeDays: 7, minLevel: 10, minTransactions: 5, noReports: true }, maxActiveListings: 5 },
    { level: 2, requirements: { accountAgeDays: 30, minLevel: 20, minTransactions: 20, noReports: true }, maxActiveListings: 8 },
    { level: 3, requirements: { accountAgeDays: 90, minLevel: 30, minTransactions: 50, noReports: true }, maxActiveListings: 12 },
  ],

  priceLimits: {
    maxMultiplierFromEstimated: 3.0,
    minMultiplierFromEstimated: 0.1,
    maxLevelDifferenceForPricing: 10,
    rarePriceMultiplier: 2.5,
    epicPriceMultiplier: 5.0,
    legendaryPriceMultiplier: 15.0,
  },

  fraudDetection: {
    maxTransactionsPerHour: 10,
    maxSameBuyerSellerPerDay: 3,
    suspiciousPriceDeviation: 5.0,
    newAccountCooldownDays: 3,
    washTradingDetectionEnabled: true,
  },

  itemBinding: {
    tradable: 'tradable',
    bindOnEquip: 'bind_on_equip',
    bindOnPickup: 'bind_on_pickup',
    accountBound: 'account_bound',
    nonTradable: 'non_tradable',
  },

  durations: [6, 12, 24, 48],
} as const

export type AuctionFeeConfig = typeof AUCTION_CONFIG.fees
export type TrustLevel = typeof AUCTION_CONFIG.trustLevels[number]
