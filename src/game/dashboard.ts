/**
 * Nocturna — Dashboard Recommendation Engine
 *
 * Generates personalized recommendations for the main dashboard
 * based on the character's current state, recent activity, and goals.
 */

export interface DashboardRecommendation {
  id: string
  type: 'action' | 'tip' | 'goal'
  priority: number // 1 = highest
  title: string
  description: string
  actionUrl?: string
  actionLabel?: string
  icon?: string
}

interface CharacterState {
  level: number
  gold: number
  premiumCurrency: number
  experience: number
  energy: number
  maxEnergy: number
  pvpRating: number
  pvpWins: number
  pvpLosses: number
  stats: {
    strength: number
    dexterity: number
    endurance: number
    perception: number
    willpower: number
    luck: number
  }
  hideoutLevels: Record<string, number>
  completedQuestsToday: number
  totalQuestsToday: number
  hasClaimedDailyReward: boolean
  daysSinceLastLogin: number
}

/**
 * Generate dashboard recommendations based on character state.
 */
export function generateRecommendations(state: CharacterState): DashboardRecommendation[] {
  const recs: DashboardRecommendation[] = []

  // Priority 1: Daily reward
  if (!state.hasClaimedDailyReward) {
    recs.push({
      id: 'daily_reward',
      type: 'action',
      priority: 1,
      title: 'Denná odmena',
      description: 'Nezabudni si prevziať dennú odmenu!',
      actionUrl: '/daily',
      actionLabel: 'Prevziať',
      icon: '🎁',
    })
  }

  // Priority 2: Available energy
  if (state.energy >= 15) {
    recs.push({
      id: 'expedition',
      type: 'action',
      priority: 2,
      title: 'Energia na výpravu',
      description: `Máš ${state.energy} energie. Pošli postavu na výpravu!`,
      actionUrl: '/expeditions',
      actionLabel: 'Na výpravu',
      icon: '⚔️',
    })
  }

  // Priority 3: Training
  const statTotal = Object.values(state.stats).reduce((a, b) => a + b, 0)
  const avgStat = statTotal / 6
  if (avgStat < state.level * 1.5 && state.gold >= 200) {
    recs.push({
      id: 'training',
      type: 'action',
      priority: 3,
      title: 'Tréning atribútov',
      description: `Tvoje atribúty sú pod priemerom. Trénuj za ${state.gold} zlata.`,
      actionUrl: '/character/training',
      actionLabel: 'Trénovať',
      icon: '💪',
    })
  }

  // Priority 4: Unclaimed quests
  const unclaimedQuests = state.totalQuestsToday - state.completedQuestsToday
  if (unclaimedQuests > 0) {
    recs.push({
      id: 'quests',
      type: 'action',
      priority: 4,
      title: 'Nesplnené úlohy',
      description: `Máš ${unclaimedQuests} nesplnených denných úloh.`,
      actionUrl: '/daily',
      actionLabel: 'Zobraziť',
      icon: '📋',
    })
  }

  // Priority 5: PvP
  if (state.level >= 10 && state.pvpWins + state.pvpLosses < 10) {
    recs.push({
      id: 'pvp_intro',
      type: 'action',
      priority: 5,
      title: 'PvP Aréna',
      description: 'Vyskúšaj PvP súboje! Získaj hodnotenie a odmeny.',
      actionUrl: '/pvp',
      actionLabel: 'Do arény',
      icon: '🏟️',
    })
  }

  // Priority 6: Hideout
  const lowestBuilding = Object.entries(state.hideoutLevels)
    .sort(([, a], [, b]) => a - b)[0]
  if (lowestBuilding && lowestBuilding[1] < 3 && state.gold >= 300) {
    recs.push({
      id: 'hideout',
      type: 'action',
      priority: 6,
      title: 'Vylepši úkryt',
      description: `${lowestBuilding[0]} je na úrovni ${lowestBuilding[1]}. Vylepši ho pre bonusy.`,
      actionUrl: '/hideout',
      actionLabel: 'Vylepšiť',
      icon: '🏰',
    })
  }

  // Tips (always show, lower priority)
  if (state.level <= 5) {
    recs.push({
      id: 'tip_factions',
      type: 'tip',
      priority: 10,
      title: 'Tip: Frakcie',
      description: 'Každá frakcia má unikátne pasívne bonusy. Sangvari preferuje presnosť a lifesteal, Lunari odolnosť a regeneráciu.',
    })
  }

  if (state.level >= 5 && state.level <= 15) {
    recs.push({
      id: 'tip_equipment',
      type: 'tip',
      priority: 10,
      title: 'Tip: Vybavenie',
      description: 'Pravidelne kontroluj obchodníka za nové vybavenie. Lepšie vybavenie = silnejšie postavy.',
    })
  }

  if (state.pvpRating > 1200) {
    recs.push({
      id: 'tip_high_rating',
      type: 'tip',
      priority: 10,
      title: 'Tip: Vysoké hodnotenie',
      description: 'Tvoje PvP hodnotenie je vysoké! Udržiavaj ho víťazstvami v aréne.',
    })
  }

  return recs.sort((a, b) => a.priority - b.priority).slice(0, 8)
}
