'use server'

import { getDb } from '@/lib/db/drizzle'
import { craftingJobs, craftingRecipeTemplates, characterMaterials, characterRecipeUnlocks, characters, materialLedger } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getRecipe, canCraft, prepareCraftingSnapshot, canClaimCraftingJob, getUpgradeCost, canUpgrade, calculateUpgradeResult, getUpgradeMultiplier } from '@/game/crafting'
import { validateMaterialLedgerEntry } from '@/game/materials'

export async function getAvailableRecipes(characterId: string) {
  const db = getDb()
  const unlocks = await db.select().from(characterRecipeUnlocks)
    .where(eq(characterRecipeUnlocks.characterId, characterId))

  const recipes = await db.select().from(craftingRecipeTemplates)
    .where(eq(craftingRecipeTemplates.enabled, true))

  const unlockedSlugs = unlocks.map(u => {
    const recipe = recipes.find(r => r.id === u.recipeTemplateId)
    return recipe?.slug
  }).filter(Boolean)

  return { recipes: recipes.filter(r => unlockedSlugs.includes(r.slug)) }
}

export async function startCrafting(characterId: string, recipeSlug: string) {
  const db = getDb()
  const recipe = getRecipe(recipeSlug)
  if (!recipe) return { error: 'Recept neexistuje.' }

  const [character] = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1)
  if (!character) return { error: 'Postava nenájdená.' }

  const materials = await db.select().from(characterMaterials)
    .where(eq(characterMaterials.characterId, characterId))

  const unlocks = await db.select().from(characterRecipeUnlocks)
    .where(eq(characterRecipeUnlocks.characterId, characterId))

  const unlockedRecipes = unlocks.map(u => u.recipeTemplateId)
  const recipeRow = await db.select().from(craftingRecipeTemplates)
    .where(eq(craftingRecipeTemplates.slug, recipeSlug)).limit(1)

  if (recipeRow.length === 0 || !unlockedRecipes.includes(recipeRow[0].id)) {
    return { error: 'Recept nie je odomknutý.' }
  }

  const materialData = materials.map(m => ({ slug: m.materialTemplateId, quantity: m.quantity }))
  const check = canCraft(recipe, character.gold, materialData, unlockedRecipes.map(() => recipeSlug))
  if (!check.allowed) return { error: check.reason }

  const idempotencyKey = `craft_${characterId}_${recipeSlug}_${Date.now()}`
  const snapshot = prepareCraftingSnapshot(recipe, characterId)

  await db.insert(craftingJobs).values({
    characterId,
    recipeTemplateId: recipeRow[0].id,
    status: 'crafting',
    inputSnapshot: snapshot.input,
    outputSnapshot: snapshot.output,
    startedAt: new Date(),
    endsAt: new Date(Date.now() + recipe.durationSeconds * 1000),
    idempotencyKey,
  })

  return { success: true, durationSeconds: recipe.durationSeconds, idempotencyKey }
}

export async function claimCraftingJob(characterId: string, jobId: string) {
  const db = getDb()
  const [job] = await db.select().from(craftingJobs)
    .where(and(eq(craftingJobs.id, jobId), eq(craftingJobs.characterId, characterId)))
    .limit(1)

  if (!job) return { error: 'Crafting job nenájdený.' }

  const check = canClaimCraftingJob(job.status, job.endsAt)
  if (!check.canClaim) return { error: check.reason }

  const output = job.outputSnapshot as any

  await db.update(craftingJobs).set({
    status: 'completed',
    claimedAt: new Date(),
  }).where(eq(craftingJobs.id, jobId))

  return { success: true, output }
}

export async function upgradeItem(characterId: string, characterItemId: string) {
  const db = getDb()
  const [character] = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1)
  if (!character) return { error: 'Postava nenájdená.' }

  const cost = getUpgradeCost(0)
  const materials = await db.select().from(characterMaterials)
    .where(eq(characterMaterials.characterId, characterId))

  const materialData = materials.map(m => ({ slug: m.materialTemplateId, quantity: m.quantity }))
  const check = canUpgrade(0, character.gold, character.level, materialData)
  if (!check.allowed) return { error: check.reason }

  const result = calculateUpgradeResult(0)

  return { ...result, success: true, multiplier: getUpgradeMultiplier(result.newLevel) }
}
