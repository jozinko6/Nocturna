import { TERRITORY_CONFIG, type TerritoryRegion, type TerritoryNode } from '@/lib/config/territory'

export interface TerritoryControl {
  nodeId: string
  ownerType: 'faction' | 'clan' | 'none'
  ownerId: string | null
  defenseLevel: number
}

export function getRegions(): TerritoryRegion[] {
  return [...TERRITORY_CONFIG.regions]
}

export function getRegion(slug: string): TerritoryRegion | undefined {
  return TERRITORY_CONFIG.regions.find(r => r.slug === slug)
}

export function getRegionNodes(regionSlug: string): TerritoryNode[] {
  const region = getRegion(regionSlug)
  return region ? [...region.nodes] : []
}

export function canCaptureTerritory(
  attackerClanTerritories: number,
  attackerClanLevel: number,
  territoryDefenseLevel: number,
  attackerPower: number,
  dominantClanTerritories: number,
): { allowed: boolean; reason?: string; captureCost: number } {
  if (attackerClanTerritories >= TERRITORY_CONFIG.dominance.maxTerritoriesPerClan) {
    return { allowed: false, reason: 'Maximálny počet území.', captureCost: 0 }
  }

  const baseCost = TERRITORY_CONFIG.dominance.captureCostBase
  const perOwnedCost = attackerClanTerritories * TERRITORY_CONFIG.dominance.captureCostPerOwned
  let captureCost = baseCost + perOwnedCost

  if (dominantClanTerritories > TERRITORY_CONFIG.dominance.maxTerritoriesPerClan * 0.6) {
    captureCost = Math.floor(captureCost * 0.8)
  }

  if (territoryDefenseLevel > 5) {
    captureCost = Math.floor(captureCost * (1 + territoryDefenseLevel * 0.1))
  }

  return { allowed: true, captureCost }
}

export function calculateTerritoryBonus(nodeType: string): { type: string; value: number } {
  const bonusMap: Record<string, { type: string; value: number }> = {
    fortress: { type: 'defense_boost', value: 0.05 },
    mine: { type: 'resource_boost', value: 0.1 },
    sanctuary: { type: 'energy_regen', value: 0.05 },
    trade_route: { type: 'merchant_discount', value: 0.03 },
    watchtower: { type: 'enemy_intel', value: 1 },
    relic_site: { type: 'drop_boost', value: 0.05 },
  }
  return bonusMap[nodeType] || { type: 'none', value: 0 }
}

export function calculateDefenseFatigue(currentDefenseCount: number): number {
  return Math.pow(TERRITORY_CONFIG.dominance.defenseFatigueMultiplier, currentDefenseCount)
}

export function calculateAttackerBonus(
  defenderOwnedTerritories: number,
  dominantThreshold: number,
): number {
  if (defenderOwnedTerritories > dominantThreshold) {
    return TERRITORY_CONFIG.dominance.attackerBonusVsDominant
  }
  return 0
}

export function shouldDecayTerritory(
  lastActivityAt: Date | null,
  decayDays: number,
): boolean {
  if (!lastActivityAt) return true
  const daysSince = (Date.now() - lastActivityAt.getTime()) / (86400000)
  return daysSince >= decayDays
}

export function getFactionGoalPoints(
  activityType: 'pve' | 'pvp' | 'boss' | 'territory',
): number {
  const config = TERRITORY_CONFIG.factionGoals
  switch (activityType) {
    case 'pve': return config.pointsPerPvE
    case 'pvp': return config.pointsPerPvP
    case 'boss': return config.pointsPerBoss
    case 'territory': return config.pointsPerTerritory
    default: return 0
  }
}

export function calculateCatchUpBonus(
  currentFactionScore: number,
  leadingFactionScore: number,
): number {
  if (leadingFactionScore === 0) return 1.0
  const ratio = currentFactionScore / leadingFactionScore
  if (ratio < TERRITORY_CONFIG.factionGoals.catchUpBonusThreshold) {
    return TERRITORY_CONFIG.factionGoals.catchUpBonusMultiplier
  }
  return 1.0
}

export function getNodeBonusDescription(nodeType: string): string {
  const descriptions: Record<string, string> = {
    fortress: '+5% obranný boost pre klan',
    mine: '+10% kovové materiály',
    sanctuary: '+5% regenerácia energie',
    trade_route: '-3% obchodnícke poplatky',
    watchtower: 'Lepší odhad nepriateľov',
    relic_site: '+5% šanca na rare dropy',
  }
  return descriptions[nodeType] || 'Žiadny bonus'
}

export function getNodeTypeColor(nodeType: string): string {
  return (TERRITORY_CONFIG.nodeTypes as any)[nodeType]?.color || '#808080'
}

export function isSeasonResetRequired(): boolean {
  return TERRITORY_CONFIG.season.resetOnSeasonEnd
}
