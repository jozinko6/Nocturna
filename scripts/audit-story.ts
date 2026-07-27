import { STORY_CONFIG } from '../src/lib/config/story'

console.log('=== Story Campaign Audit ===\n')

const issues: string[] = []
const missionSlugs = new Set<string>()

for (const chapter of STORY_CONFIG.chapters) {
  console.log(`${chapter.slug}: ${chapter.missions.length} missions`)

  for (const mission of chapter.missions) {
    if (missionSlugs.has(mission.slug)) {
      issues.push(`Duplicate mission slug: ${mission.slug}`)
    }
    missionSlugs.add(mission.slug)
  }
}

console.log(`\nTotal missions: ${missionSlugs.size}`)
console.log(`Chapters: ${STORY_CONFIG.chapters.length}`)
console.log(`Bosses: ${STORY_CONFIG.bosses.length}`)
console.log(`Decisions: ${STORY_CONFIG.decisions.length}`)
console.log(`Regions: ${STORY_CONFIG.regions.length}`)

for (const boss of STORY_CONFIG.bosses) {
  console.log(`Boss: ${boss.slug} (level ${boss.level}) - ${boss.mechanics.join(', ')}`)
}

if (issues.length > 0) {
  console.log('\n=== ISSUES ===')
  issues.forEach(i => console.log(`  ⚠ ${i}`))
} else {
  console.log('\n=== NO ISSUES ===')
}
