import { CLAN_WAR_CONFIG } from '@/lib/config/clan-wars'

export interface ClanWarInput {
  attackerClanId: string
  defenderClanId: string
  warType: 'standard' | 'territory' | 'seasonal'
}

export interface ClanWarBattleInput {
  clanWarId: string
  attackerCharacterId: string
  defenderCharacterId: string
  battleResult: 'win' | 'loss' | 'draw'
  attackerLevel: number
  defenderLevel: number
  idempotencyKey: string
}

export function canDeclareWar(
  attackerMembers: number,
  defenderMembers: number,
  attackerClanLevel: number,
  defenderClanLevel: number,
  attackerPower: number,
  defenderPower: number,
  hasActiveWar: boolean,
  cooldownRemaining: boolean,
): { allowed: boolean; reason?: string } {
  if (attackerMembers < CLAN_WAR_CONFIG.requirements.minClanMembers) {
    return { allowed: false, reason: `Potrebuješ aspoň ${CLAN_WAR_CONFIG.requirements.minClanMembers} členov.` }
  }
  if (defenderMembers < CLAN_WAR_CONFIG.requirements.minClanMembers) {
    return { allowed: false, reason: `Protivník musí mať aspoň ${CLAN_WAR_CONFIG.requirements.minClanMembers} členov.` }
  }
  if (attackerClanLevel < CLAN_WAR_CONFIG.requirements.minClanLevel) {
    return { allowed: false, reason: `Potrebuješ klan úroveň ${CLAN_WAR_CONFIG.requirements.minClanLevel}.` }
  }
  if (hasActiveWar) {
    return { allowed: false, reason: 'Už máš aktívnu vojnu.' }
  }
  if (cooldownRemaining) {
    return { allowed: false, reason: 'Cooldown medzi vojnami.' }
  }

  const powerRatio = Math.max(attackerPower, defenderPower) / Math.max(1, Math.min(attackerPower, defenderPower))
  if (powerRatio > CLAN_WAR_CONFIG.requirements.maxPowerDifference) {
    return { allowed: false, reason: 'Príliš veľký rozdiel sily.' }
  }

  return { allowed: true }
}

export function calculateBattleScore(
  isAttacker: boolean,
  attackerLevel: number,
  defenderLevel: number,
  result: 'win' | 'loss' | 'draw',
  attackCount: number,
): number {
  const baseScore = result === 'win' ? CLAN_WAR_CONFIG.scoring.winBase : CLAN_WAR_CONFIG.scoring.lossBase
  const isUnderdog = isAttacker
    ? attackerLevel < defenderLevel * CLAN_WAR_CONFIG.scoring.underdogThreshold
    : defenderLevel < attackerLevel * CLAN_WAR_CONFIG.scoring.underdogThreshold

  let score = baseScore
  if (isUnderdog) score += CLAN_WAR_CONFIG.scoring.underdogBonus
  if (!isAttacker && result === 'win') score += CLAN_WAR_CONFIG.scoring.defensiveWinBonus

  const diminishingIndex = Math.min(attackCount - 1, 4)
  const multipliers = Object.values(CLAN_WAR_CONFIG.scoring.diminishingReturns)
  score = Math.floor(score * (multipliers[diminishingIndex] || 0.1))

  return Math.min(score, CLAN_WAR_CONFIG.scoring.maxScorePerPlayer)
}

export function calculateWarDuration(hours?: number): number {
  const h = hours || CLAN_WAR_CONFIG.duration.defaultHours
  return Math.max(CLAN_WAR_CONFIG.duration.minHours, Math.min(CLAN_WAR_CONFIG.duration.maxHours, h))
}

export function canAttack(
  attacksUsed: number,
  maxAttacks: number,
  lastAttackTime: Date | null,
  defenderCharacterId: string,
  previousDefenders: string[],
): { allowed: boolean; reason?: string } {
  if (attacksUsed >= maxAttacks) {
    return { allowed: false, reason: 'Využil si všetky útoky.' }
  }

  if (lastAttackTime) {
    const cooldownMs = CLAN_WAR_CONFIG.attacks.cooldownMinutes * 60000
    if (Date.now() - lastAttackTime.getTime() < cooldownMs) {
      return { allowed: false, reason: 'Cooldown medzi útokmi.' }
    }
  }

  if (CLAN_WAR_CONFIG.attacks.cannotRepeatDefender && previousDefenders.includes(defenderCharacterId)) {
    return { allowed: false, reason: 'Už si útočil na tohto hráča.' }
  }

  return { allowed: true }
}

export function calculateWarRewards(
  attackerScore: number,
  defenderScore: number,
  isWinner: boolean,
  contribution: number,
  minContribution: number,
): { clanXp: number; clanTokens: number; territoryPoints: number; seasonalPoints: number } {
  const rewards = isWinner ? CLAN_WAR_CONFIG.rewards.winner : CLAN_WAR_CONFIG.rewards.loser

  const participationScale = contribution >= minContribution ? 1.0 : contribution / minContribution

  return {
    clanXp: Math.floor(rewards.clanXp * participationScale),
    clanTokens: Math.floor(rewards.clanTokens * participationScale),
    territoryPoints: Math.floor(rewards.territoryPoints * participationScale),
    seasonalPoints: Math.floor(rewards.seasonalPoints * participationScale),
  }
}

export function getMatchmakingScore(
  clanLevel: number,
  memberCount: number,
  averagePower: number,
  recentWins: number,
  recentLosses: number,
): number {
  return (
    clanLevel * 100 +
    memberCount * 50 +
    averagePower * 0.5 +
    recentWins * 20 -
    recentLosses * 10
  )
}

export function wouldCreateStalemate(
  attackerLastWins: number,
  attackerLastLosses: number,
  defenderLastWins: number,
  defenderLastLosses: number,
): boolean {
  const attackerTrend = attackerLastWins - attackerLastLosses
  const defenderTrend = defenderLastWins - defenderLastLosses
  return Math.abs(attackerTrend - defenderTrend) < 2
}
