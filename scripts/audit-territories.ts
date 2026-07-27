import { TERRITORY_CONFIG } from '../src/lib/config/territory'

console.log('=== Territory Audit ===\n')

let totalNodes = 0
for (const region of TERRITORY_CONFIG.regions) {
  totalNodes += region.nodes.length
  console.log(`${region.slug}: ${region.nodes.length} nodes (level ${region.levelMin}-${region.levelMax})`)
}

console.log(`\nTotal territories: ${totalNodes}`)
console.log(`Node types: ${Object.keys(TERRITORY_CONFIG.nodeTypes).join(', ')}`)
console.log(`Max territories per clan: ${TERRITORY_CONFIG.dominance.maxTerritoriesPerClan}`)
console.log(`Decay days: ${TERRITORY_CONFIG.dominance.decayDaysInactive}`)
console.log(`Season reset: ${TERRITORY_CONFIG.season.resetOnSeasonEnd}`)
