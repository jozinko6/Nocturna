export const CLAN_WAR_CONFIG = {
  requirements: {
    minClanMembers: 5,
    minClanLevel: 3,
    cooldownDays: 1,
    maxPowerDifference: 2.0,
  },

  duration: {
    minHours: 24,
    maxHours: 48,
    defaultHours: 48,
  },

  scoring: {
    winBase: 100,
    lossBase: 20,
    underdogBonus: 50,
    underdogThreshold: 0.7,
    defensiveWinBonus: 30,
    participationBonus: 10,
    maxScorePerPlayer: 500,
    diminishingReturns: {
      firstMatchMultiplier: 1.0,
      secondMatchMultiplier: 0.75,
      thirdMatchMultiplier: 0.5,
      fourthMatchMultiplier: 0.25,
      fifthMatchMultiplier: 0.1,
    },
  },

  attacks: {
    maxPerPlayer: 5,
    cooldownMinutes: 30,
    cannotRepeatDefender: true,
    minContributionForReward: 1,
  },

  matchmaking: {
    ratingRange: 500,
    levelRange: 10,
    memberCountRange: 5,
    maxLosses: 3,
    cooldownAfterLossDays: 1,
  },

  protection: {
    noviceProtectionDays: 7,
    maxWarsPerWeek: 5,
    declineCooldownMinutes: 60,
    minAcceptanceTimeHours: 12,
  },

  rewards: {
    winner: {
      clanXp: 500,
      clanTokens: 100,
      territoryPoints: 1,
      seasonalPoints: 50,
    },
    loser: {
      clanXp: 100,
      clanTokens: 25,
      territoryPoints: 0,
      seasonalPoints: 10,
    },
    participation: {
      minBattlesForFullReward: 3,
      rewardScaleByContribution: true,
    },
  },
} as const

export type ClanWarScoring = typeof CLAN_WAR_CONFIG.scoring
