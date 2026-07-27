import { describe, it, expect } from 'vitest'
import {
  getCrystalPackById,
  getMembershipById,
  getAllCrystalPackages,
  getAllMembershipTiers,
  CRYSTAL_PACK_IDS,
  MEMBERSHIP_IDS,
  ENERGY_REFILL_COST_CRYSTALS,
  ENERGY_REFILL_AMOUNT,
  SHOP_REFRESH_COST_CRYSTALS,
  INVENTORY_EXPAND_COST_CRYSTALS,
  INVENTORY_EXPAND_AMOUNT,
} from '../game/payments'

describe('Payments', () => {
  describe('getCrystalPackById', () => {
    it('returns valid packs', () => {
      const pack = getCrystalPackById('crystal_50')
      expect(pack).not.toBeNull()
      expect(pack!.crystals).toBe(50)
      expect(pack!.priceEur).toBe(1.99)
    })

    it('returns null for unknown pack', () => {
      expect(getCrystalPackById('nonexistent')).toBeNull()
    })

    it('all packs have required fields', () => {
      for (const pack of getAllCrystalPackages()) {
        expect(pack.id).toBeTruthy()
        expect(pack.crystals).toBeGreaterThan(0)
        expect(pack.priceEur).toBeGreaterThan(0)
        expect(typeof pack.name).toBe('string')
        expect(typeof pack.description).toBe('string')
      }
    })
  })

  describe('getMembershipById', () => {
    it('returns valid memberships', () => {
      const standard = getMembershipById('membership_standard')
      expect(standard).not.toBeNull()
      expect(standard!.priceEur).toBe(4.99)
      expect(standard!.monthlyCrystals).toBe(100)

      const premium = getMembershipById('membership_premium')
      expect(premium).not.toBeNull()
      expect(premium!.priceEur).toBe(9.99)
      expect(premium!.monthlyCrystals).toBe(300)
    })

    it('returns null for unknown membership', () => {
      expect(getMembershipById('nonexistent')).toBeNull()
    })
  })

  describe('getAllCrystalPackages', () => {
    it('returns all 5 packages', () => {
      const packages = getAllCrystalPackages()
      expect(packages).toHaveLength(5)
    })

    it('packages are sorted by sortOrder', () => {
      const packages = getAllCrystalPackages()
      for (let i = 1; i < packages.length; i++) {
        expect(packages[i].sortOrder).toBeGreaterThanOrEqual(packages[i - 1].sortOrder)
      }
    })
  })

  describe('constants', () => {
    it('has correct pack IDs', () => {
      expect(CRYSTAL_PACK_IDS).toHaveLength(5)
      expect(CRYSTAL_PACK_IDS).toContain('crystal_50')
      expect(CRYSTAL_PACK_IDS).toContain('crystal_2500')
    })

    it('has correct membership IDs', () => {
      expect(MEMBERSHIP_IDS).toHaveLength(2)
      expect(MEMBERSHIP_IDS).toContain('membership_standard')
      expect(MEMBERSHIP_IDS).toContain('membership_premium')
    })

    it('energy refill costs reasonable crystals', () => {
      expect(ENERGY_REFILL_COST_CRYSTALS).toBeGreaterThan(0)
      expect(ENERGY_REFILL_AMOUNT).toBeGreaterThan(0)
    })

    it('shop refresh costs reasonable crystals', () => {
      expect(SHOP_REFRESH_COST_CRYSTALS).toBeGreaterThan(0)
    })

    it('inventory expand costs reasonable crystals', () => {
      expect(INVENTORY_EXPAND_COST_CRYSTALS).toBeGreaterThan(0)
      expect(INVENTORY_EXPAND_AMOUNT).toBeGreaterThan(0)
    })
  })
})
