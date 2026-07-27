import { describe, it, expect } from 'vitest'
import { calculateListingFee, calculateSaleFee, calculateNetProceeds, canCreateListing, validateListingPrice, canPurchaseListing, detectFraudulentActivity, isItemTradable, estimateItemValue, getDurations } from '@/game/auction'
import { AUCTION_CONFIG } from '@/lib/config/auction'

describe('Auction Fees', () => {
  it('calculateListingFee returns minimum fee for small amounts', () => {
    expect(calculateListingFee(100)).toBe(5)
  })

  it('calculateListingFee scales with price', () => {
    const fee100 = calculateListingFee(100)
    const fee1000 = calculateListingFee(1000)
    expect(fee1000).toBeGreaterThan(fee100)
  })

  it('calculateSaleFee is 5% of total', () => {
    expect(calculateSaleFee(1000)).toBe(50)
    expect(calculateSaleFee(200)).toBe(10)
  })

  it('calculateNetProceeds subtracts sale fee', () => {
    expect(calculateNetProceeds(1000)).toBe(950)
  })

  it('all fees are integers', () => {
    expect(Number.isInteger(calculateListingFee(333))).toBe(true)
    expect(Number.isInteger(calculateSaleFee(333))).toBe(true)
    expect(Number.isInteger(calculateNetProceeds(333))).toBe(true)
  })
})

describe('Listing Validation', () => {
  it('canCreateListing allows valid listing', () => {
    const result = canCreateListing(0, 0, 0, 7, 10, 15, true)
    expect(result.allowed).toBe(true)
  })

  it('canCreateListing rejects without verified email', () => {
    expect(canCreateListing(0, 0, 0, 7, 10, 15, false).allowed).toBe(false)
  })

  it('canCreateListing rejects when at max listings', () => {
    const result = canCreateListing(0, 0, 3, 7, 10, 15, true)
    expect(result.allowed).toBe(false)
  })

  it('canCreateListing rejects when daily limit reached', () => {
    const result = canCreateListing(0, 20, 0, 7, 10, 15, true)
    expect(result.allowed).toBe(false)
  })

  it('validateListingPrice rejects below minimum', () => {
    expect(validateListingPrice(1, 1, 100).valid).toBe(false)
  })

  it('validateListingPrice allows valid price', () => {
    expect(validateListingPrice(100, 1, 100).valid).toBe(true)
  })
})

describe('Purchase Validation', () => {
  it('canPurchaseListing allows valid purchase', () => {
    expect(canPurchaseListing('active', 'seller', 'buyer', 1000, 500).allowed).toBe(true)
  })

  it('canPurchaseListing rejects self-purchase', () => {
    expect(canPurchaseListing('active', 'same', 'same', 1000, 500).allowed).toBe(false)
  })

  it('canPurchaseListing rejects inactive listing', () => {
    expect(canPurchaseListing('sold', 'seller', 'buyer', 1000, 500).allowed).toBe(false)
  })

  it('canPurchaseListing rejects insufficient gold', () => {
    expect(canPurchaseListing('active', 'seller', 'buyer', 100, 500).allowed).toBe(false)
  })
})

describe('Fraud Detection', () => {
  it('detects repeated transactions between same parties', () => {
    const now = new Date()
    const recent = Array.from({ length: 5 }, (_, i) => ({
      buyerId: 'buyer1',
      sellerId: 'seller1',
      amount: 100,
      timestamp: new Date(now.getTime() - i * 60000),
    }))
    const result = detectFraudulentActivity(recent, { buyerId: 'buyer1', sellerId: 'seller1', amount: 100 })
    expect(result.suspicious).toBe(true)
  })

  it('does not flag normal transactions', () => {
    const result = detectFraudulentActivity([], { buyerId: 'buyer1', sellerId: 'seller1', amount: 100 })
    expect(result.suspicious).toBe(false)
  })
})

describe('Item Utilities', () => {
  it('isItemTradable returns true for tradable items', () => {
    expect(isItemTradable('tradable')).toBe(true)
  })

  it('isItemTradable returns false for bound items', () => {
    expect(isItemTradable('bind_on_equip')).toBe(false)
    expect(isItemTradable('bind_on_pickup')).toBe(false)
    expect(isItemTradable('non_tradable')).toBe(false)
  })

  it('estimateItemValue returns positive number', () => {
    expect(estimateItemValue({ attack: 10 }, 'rare', 10, 0)).toBeGreaterThan(0)
  })

  it('estimateItemValue increases with rarity', () => {
    const common = estimateItemValue({ attack: 10 }, 'common', 10, 0)
    const epic = estimateItemValue({ attack: 10 }, 'epic', 10, 0)
    expect(epic).toBeGreaterThan(common)
  })

  it('getDurations returns valid options', () => {
    const durations = getDurations()
    expect(durations).toContain(24)
    expect(durations.length).toBeGreaterThan(0)
  })
})
