import { CRAFTING_CONFIG, type MaterialTemplate } from '@/lib/config/crafting'

export interface MaterialBalance {
  templateId: string
  slug: string
  quantity: number
  stackLimit: number
}

export function getMaterialTemplate(slug: string): MaterialTemplate | undefined {
  return CRAFTING_CONFIG.materials.templates.find(t => t.slug === slug)
}

export function getMaterialBySlug(slug: string): MaterialTemplate | undefined {
  return getMaterialTemplate(slug)
}

export function canAddMaterial(currentQty: number, addQty: number, stackLimit: number): boolean {
  return currentQty + addQty <= stackLimit
}

export function calculateDismantleYield(
  itemRarity: string,
  itemLevel: number,
  upgradeLevel: number,
): { slug: string; qty: number }[] {
  const rarityMult = (CRAFTING_CONFIG.dismantle.rarityMultipliers as any)[itemRarity] || 0.5
  const levelBonus = 1 + itemLevel * CRAFTING_CONFIG.dismantle.levelBonusPerLevel
  const upgradeBonus = 1 + upgradeLevel * CRAFTING_CONFIG.dismantle.upgradeBonusPerLevel
  const baseQty = Math.floor(3 * rarityMult * levelBonus * upgradeBonus)

  const materials: { slug: string; qty: number }[] = []

  if (itemRarity === 'common' || itemRarity === 'uncommon') {
    materials.push({ slug: 'temne-zelezo', qty: Math.max(1, baseQty) })
  } else if (itemRarity === 'rare') {
    materials.push({ slug: 'runova-ocel', qty: Math.max(1, Math.floor(baseQty * 0.7)) })
    materials.push({ slug: 'temne-zelezo', qty: Math.max(1, baseQty) })
  } else if (itemRarity === 'epic') {
    materials.push({ slug: 'meteoriticke-zelezo', qty: Math.max(1, Math.floor(baseQty * 0.5)) })
    materials.push({ slug: 'runova-ocel', qty: Math.max(1, baseQty) })
  } else if (itemRarity === 'legendary') {
    materials.push({ slug: 'meteoriticke-zelezo', qty: Math.max(1, baseQty) })
    materials.push({ slug: 'esencia-zatmenia', qty: Math.max(1, Math.floor(baseQty * 0.3)) })
  } else {
    materials.push({ slug: 'temne-zelezo', qty: Math.max(1, baseQty) })
  }

  return materials
}

export function requiresDismantleConfirmation(rarity: string, upgradeLevel: number): boolean {
  return CRAFTING_CONFIG.dismantle.confirmationRequired.includes(rarity as any) || upgradeLevel > 0
}

export function validateMaterialLedgerEntry(
  quantityBefore: number,
  delta: number,
): { valid: boolean; quantityAfter: number; error?: string } {
  const quantityAfter = quantityBefore + delta
  if (quantityAfter < 0) {
    return { valid: false, quantityAfter: 0, error: 'Nedostatok materiálu.' }
  }
  return { valid: true, quantityAfter }
}

export function getAllMaterialSlugs(): string[] {
  return CRAFTING_CONFIG.materials.templates.map(t => t.slug)
}

export function getMaterialsByRarity(rarity: string): MaterialTemplate[] {
  return CRAFTING_CONFIG.materials.templates.filter(t => t.rarity === rarity)
}

export function isMaterialTradable(slug: string): boolean {
  const template = getMaterialTemplate(slug)
  return template?.tradable ?? false
}
