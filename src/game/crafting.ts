import { CRAFTING_CONFIG, type CraftingRecipe } from '@/lib/config/crafting'

export interface CraftingJobInput {
  recipeSlug: string
  characterId: string
  idempotencyKey: string
}

export interface CraftingJobOutput {
  success: boolean
  outputType: string
  outputTemplateId: string
  outputQuantity: number
}

export function getRecipe(slug: string): CraftingRecipe | undefined {
  return CRAFTING_CONFIG.recipes.find(r => r.slug === slug)
}

export function getRecipesByOutputType(type: 'item' | 'material'): CraftingRecipe[] {
  return CRAFTING_CONFIG.recipes.filter(r => r.outputType === type)
}

export function canCraft(
  recipe: CraftingRecipe,
  characterGold: number,
  materials: { slug: string; quantity: number }[],
  unlockedRecipes: string[],
): { allowed: boolean; reason?: string } {
  if (!unlockedRecipes.includes(recipe.slug)) {
    return { allowed: false, reason: 'Recept nie je odomknutý.' }
  }

  if (characterGold < recipe.goldCost) {
    return { allowed: false, reason: 'Nedostatok zlata.' }
  }

  for (const required of recipe.materials) {
    const owned = materials.find(m => m.slug === required.slug)
    if (!owned || owned.quantity < required.qty) {
      return { allowed: false, reason: `Nedostatok ${required.slug}.` }
    }
  }

  return { allowed: true }
}

export function calculateCraftingCost(recipe: CraftingRecipe): {
  gold: number
  materials: { slug: string; qty: number }[]
} {
  return {
    gold: recipe.goldCost,
    materials: [...recipe.materials],
  }
}

export function calculateCraftingDuration(recipe: CraftingRecipe): number {
  return recipe.durationSeconds
}

export function isCraftingDeterministic(recipe: CraftingRecipe): boolean {
  return recipe.successRate === 1.0
}

export function calculateCraftingSuccess(recipe: CraftingRecipe, seed?: string): boolean {
  if (recipe.successRate >= 1.0) return true
  if (!seed) return Math.random() < recipe.successRate
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  return (Math.abs(hash) % 100) / 100 < recipe.successRate
}

export function prepareCraftingSnapshot(
  recipe: CraftingRecipe,
  characterId: string,
): { input: any; output: any } {
  return {
    input: {
      recipeSlug: recipe.slug,
      characterId,
      goldCost: recipe.goldCost,
      materials: recipe.materials.map(m => ({ ...m })),
      timestamp: new Date().toISOString(),
    },
    output: {
      type: recipe.outputType,
      templateId: recipe.outputTemplateId,
      quantity: recipe.outputQuantity,
    },
  }
}

export function canClaimCraftingJob(
  status: string,
  endsAt: string | Date | null,
): { canClaim: boolean; reason?: string } {
  if (status === 'completed') return { canClaim: false, reason: 'Už bolo prevzaté.' }
  if (status === 'failed') return { canClaim: false, reason: 'Crafting zlyhal.' }
  if (status === 'cancelled') return { canClaim: false, reason: 'Crafting bol zrušený.' }
  if (status !== 'crafting') return { canClaim: false, reason: 'Crafting nie je dokončený.' }

  if (endsAt) {
    const end = new Date(endsAt)
    if (new Date() < end) return { canClaim: false, reason: 'Crafting ešte nie je dokončený.' }
  }

  return { canClaim: true }
}

// ─── Upgrade System ───────────────────────────────────────────────────────

export interface UpgradeCost {
  gold: number
  materials: { slug: string; qty: number }[]
  requiredLevel: number
}

export function getUpgradeCost(currentLevel: number): UpgradeCost {
  const base = CRAFTING_CONFIG.upgrade.costs
  const gold = base.goldBase + currentLevel * base.goldPerLevel

  let materials: { slug: string; qty: number }[] = []
  for (const tier of base.materialCosts) {
    if (currentLevel >= tier.level) {
      materials = tier.materials.map(m => ({ ...m }))
    }
  }

  const requiredLevel = Math.max(1, currentLevel * 5)

  return { gold, materials, requiredLevel }
}

export function getUpgradeMultiplier(level: number): number {
  return CRAFTING_CONFIG.upgrade.baseMultiplier + level * CRAFTING_CONFIG.upgrade.perLevelMultiplier
}

export function getUpgradeSuccessRate(level: number): number {
  for (const tier of CRAFTING_CONFIG.upgrade.tiers) {
    if (level >= tier.minLevel && level <= tier.maxLevel) {
      return tier.successRate
    }
  }
  return 1.0
}

export function canUpgrade(
  currentLevel: number,
  characterGold: number,
  characterLevel: number,
  materials: { slug: string; quantity: number }[],
): { allowed: boolean; reason?: string } {
  if (currentLevel >= CRAFTING_CONFIG.upgrade.maxLevel) {
    return { allowed: false, reason: 'Predmet je na maximálnom vylepšení.' }
  }

  const cost = getUpgradeCost(currentLevel)

  if (characterLevel < cost.requiredLevel) {
    return { allowed: false, reason: `Potrebuješ úroveň ${cost.requiredLevel}.` }
  }

  if (characterGold < cost.gold) {
    return { allowed: false, reason: 'Nedostatok zlata.' }
  }

  for (const required of cost.materials) {
    const owned = materials.find(m => m.slug === required.slug)
    if (!owned || owned.quantity < required.qty) {
      return { allowed: false, reason: `Nedostatok ${required.slug}.` }
    }
  }

  return { allowed: true }
}

export function calculateUpgradeResult(
  currentLevel: number,
  seed?: string,
): { success: boolean; newLevel: number } {
  const rate = getUpgradeSuccessRate(currentLevel)
  const success = rate >= 1.0 ? true : calculateCraftingSuccess({ successRate: Math.round(rate * 100) } as any, seed)

  return {
    success,
    newLevel: success ? currentLevel + 1 : currentLevel,
  }
}

export function getAllRecipes(): CraftingRecipe[] {
  return [...CRAFTING_CONFIG.recipes]
}
