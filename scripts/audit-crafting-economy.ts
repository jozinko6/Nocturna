import { CRAFTING_CONFIG } from '../src/lib/config/crafting'

console.log('=== Crafting Economy Audit ===\n')

const issues: string[] = []

for (const recipe of CRAFTING_CONFIG.recipes) {
  const materialValue = recipe.materials.reduce((sum, m) => {
    const baseValue = ({ common: 10, uncommon: 25, rare: 75, epic: 200, legendary: 500 } as any)[m.slug.includes('zelezo') ? 'common' : m.slug.includes('prach') ? 'rare' : 'uncommon'] || 15
    return sum + baseValue * m.qty
  }, 0)

  const totalCost = materialValue + recipe.goldCost

  console.log(`${recipe.slug}: cost=${totalCost}, output=${recipe.outputType}:${recipe.outputTemplateId}`)

  if (recipe.goldCost < materialValue * 0.1) {
    issues.push(`${recipe.slug}: gold cost suspiciously low compared to material value`)
  }
}

const dismantle = CRAFTING_CONFIG.dismantle
console.log(`\nDismantle yield multiplier: ${dismantle.yieldMultiplier}`)
console.log('Rarity multipliers:', dismantle.rarityMultipliers)

const upgrade = CRAFTING_CONFIG.upgrade
console.log(`\nUpgrade max level: ${upgrade.maxLevel}`)
console.log(`Per-level multiplier: ${upgrade.perLevelMultiplier}`)

if (issues.length > 0) {
  console.log('\n=== ISSUES FOUND ===')
  issues.forEach(i => console.log(`  ⚠ ${i}`))
} else {
  console.log('\n=== NO ISSUES FOUND ===')
}
