import { describe, it, expect } from 'vitest'
import { getRecipe, canCraft, calculateCraftingCost, isCraftingDeterministic, calculateCraftingSuccess, canClaimCraftingJob, getUpgradeCost, getUpgradeMultiplier, getUpgradeSuccessRate, canUpgrade, calculateUpgradeResult } from '@/game/crafting'
import { CRAFTING_CONFIG } from '@/lib/config/crafting'

describe('Crafting System', () => {
  it('getRecipe returns valid recipes', () => {
    const recipe = getRecipe('temna-sekera')
    expect(recipe).toBeDefined()
    expect(recipe!.slug).toBe('temna-sekera')
  })

  it('getRecipe returns undefined for unknown', () => {
    expect(getRecipe('nonexistent')).toBeUndefined()
  })

  it('canCraft returns true when requirements met', () => {
    const recipe = getRecipe('temna-sekera')!
    const materials = recipe.materials.map(m => ({ slug: m.slug, quantity: m.qty + 10 }))
    const result = canCraft(recipe, 1000, materials, ['temna-sekera'])
    expect(result.allowed).toBe(true)
  })

  it('canCraft returns false for insufficient gold', () => {
    const recipe = getRecipe('temna-sekera')!
    const materials = [{ slug: CRAFTING_CONFIG.materials.templates[0].slug, quantity: 20 }]
    expect(canCraft(recipe, 0, materials, ['temna-sekera']).allowed).toBe(false)
  })

  it('canCraft returns false for missing recipe unlock', () => {
    const recipe = getRecipe('temna-sekera')!
    const materials = [{ slug: CRAFTING_CONFIG.materials.templates[0].slug, quantity: 20 }]
    expect(canCraft(recipe, 1000, materials, []).allowed).toBe(false)
  })

  it('canCraft returns false for insufficient materials', () => {
    const recipe = getRecipe('temna-sekera')!
    expect(canCraft(recipe, 1000, [], ['temna-sekera']).allowed).toBe(false)
  })

  it('calculateCraftingCost returns gold and materials', () => {
    const recipe = getRecipe('temna-sekera')!
    const cost = calculateCraftingCost(recipe)
    expect(cost.gold).toBeGreaterThan(0)
    expect(cost.materials.length).toBeGreaterThan(0)
  })

  it('deterministic recipes have 100% success rate', () => {
    const recipe = getRecipe('temna-sekera')!
    expect(isCraftingDeterministic(recipe)).toBe(true)
  })

  it('canClaimCraftingJob returns false for pending status', () => {
    expect(canClaimCraftingJob('pending', null).canClaim).toBe(false)
  })

  it('canClaimCraftingJob returns true for completed crafting past end time', () => {
    const pastDate = new Date(Date.now() - 10000).toISOString()
    expect(canClaimCraftingJob('crafting', pastDate).canClaim).toBe(true)
  })

  it('canClaimCraftingJob returns false for already claimed', () => {
    expect(canClaimCraftingJob('completed', null).canClaim).toBe(false)
  })

  it('all recipes have valid output types', () => {
    for (const recipe of CRAFTING_CONFIG.recipes) {
      expect(['item', 'material']).toContain(recipe.outputType)
      expect(recipe.outputQuantity).toBeGreaterThan(0)
      expect(recipe.goldCost).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('Upgrade System', () => {
  it('getUpgradeCost returns increasing costs', () => {
    const cost0 = getUpgradeCost(0)
    const cost5 = getUpgradeCost(5)
    expect(cost5.gold).toBeGreaterThan(cost0.gold)
  })

  it('getUpgradeMultiplier increases with level', () => {
    expect(getUpgradeMultiplier(5)).toBeGreaterThan(getUpgradeMultiplier(0))
    expect(getUpgradeMultiplier(10)).toBeGreaterThan(getUpgradeMultiplier(5))
  })

  it('getUpgradeSuccessRate is 100% for low levels', () => {
    expect(getUpgradeSuccessRate(1)).toBe(1.0)
    expect(getUpgradeSuccessRate(5)).toBe(1.0)
  })

  it('getUpgradeSuccessRate decreases for high levels', () => {
    expect(getUpgradeSuccessRate(9)).toBeLessThan(1.0)
  })

  it('canUpgrade returns false at max level', () => {
    expect(canUpgrade(10, 10000, 50, []).allowed).toBe(false)
  })

  it('canUpgrade returns false for insufficient gold', () => {
    expect(canUpgrade(0, 0, 1, []).allowed).toBe(false)
  })

  it('calculateUpgradeResult succeeds at low levels', () => {
    const result = calculateUpgradeResult(0)
    expect(result.success).toBe(true)
    expect(result.newLevel).toBe(1)
  })

  it('max upgrade level is 10', () => {
    expect(CRAFTING_CONFIG.upgrade.maxLevel).toBe(10)
  })
})
