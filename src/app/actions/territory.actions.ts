'use server'

import { getDb } from '@/lib/db/drizzle'
import { worldRegions, territoryNodes, territoryControlHistory } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getRegions, getRegionNodes, canCaptureTerritory, calculateTerritoryBonus } from '@/game/world-map'

export async function getWorldMap() {
  const regions = getRegions()
  const db = getDb()
  const nodes = await db.select().from(territoryNodes)

  return {
    regions: regions.map(r => ({
      ...r,
      nodes: nodes.filter(n => n.regionId === r.slug || n.slug.startsWith(r.slug)),
    })),
  }
}

export async function getTerritoryDetails(nodeSlug: string) {
  const db = getDb()
  const [node] = await db.select().from(territoryNodes)
    .where(eq(territoryNodes.slug, nodeSlug))
    .limit(1)

  if (!node) return { error: 'Územie nenájdené.' }

  const bonus = calculateTerritoryBonus(node.nodeType)
  const history = await db.select().from(territoryControlHistory)
    .where(eq(territoryControlHistory.territoryNodeId, node.id))
    .limit(10)

  return { node, bonus, history }
}

export async function captureTerritory(
  clanId: string,
  nodeSlug: string,
) {
  const db = getDb()
  const [node] = await db.select().from(territoryNodes)
    .where(eq(territoryNodes.slug, nodeSlug))
    .limit(1)

  if (!node) return { error: 'Územie nenájdené.' }

  const ownedNodes = await db.select().from(territoryNodes)
    .where(eq(territoryNodes.ownerClanId, clanId))

  const check = canCaptureTerritory(
    ownedNodes.length,
    1,
    node.defenseLevel,
    100,
    3,
  )

  if (!check.allowed) return { error: check.reason }

  const previousOwnerType = node.ownerType
  const previousOwnerId = node.ownerClanId

  await db.update(territoryNodes).set({
    ownerType: 'clan',
    ownerClanId: clanId,
    status: 'controlled',
    defenseLevel: node.defenseLevel + 1,
    updatedAt: new Date(),
  }).where(eq(territoryNodes.id, node.id))

  await db.insert(territoryControlHistory).values({
    territoryNodeId: node.id,
    previousOwnerType,
    previousOwnerId,
    newOwnerType: 'clan',
    newOwnerId: clanId,
    causeType: 'clan_war',
  })

  return { success: true, captureCost: check.captureCost }
}

export async function getFactionGoals(seasonId?: string) {
  const db = getDb()
  return { goals: [] }
}
