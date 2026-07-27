export interface MatchmakingCandidate {
  characterId: string
  rating: number
  level: number
  power: number
  winRate: number
  recentWins: number
  recentLosses: number
  lastMatchAt: Date | null
  isSmurfSuspected: boolean
}

export interface MatchmakingResult {
  candidates: MatchmakingCandidate[]
  recommended: MatchmakingCandidate | null
  internalScore: number
}

export function calculateInternalScore(
  rating: number,
  level: number,
  power: number,
  winRate: number,
): number {
  return (
    rating * 0.5 +
    level * 20 +
    power * 0.3 +
    winRate * 100
  )
}

export function findMatchCandidates(
  playerRating: number,
  playerLevel: number,
  playerPower: number,
  allCharacters: MatchmakingCandidate[],
  excludeIds: string[] = [],
): MatchmakingCandidate[] {
  const ratingRange = 500
  const levelRange = 10

  return allCharacters
    .filter(c => {
      if (excludeIds.includes(c.characterId)) return false
      if (Math.abs(c.rating - playerRating) > ratingRange) return false
      if (Math.abs(c.level - playerLevel) > levelRange) return false
      return true
    })
    .sort((a, b) => {
      const distA = Math.abs(a.rating - playerRating) + Math.abs(a.level - playerLevel) * 10
      const distB = Math.abs(b.rating - playerRating) + Math.abs(b.level - playerLevel) * 10
      return distA - distB
    })
    .slice(0, 10)
}

export function selectRecommendedCandidate(
  candidates: MatchmakingCandidate[],
  playerWinStreak: number,
): MatchmakingCandidate | null {
  if (candidates.length === 0) return null

  if (playerWinStreak >= 3) {
    const harder = candidates.filter(c => c.rating > 0).sort((a, b) => b.rating - a.rating)
    if (harder.length > 0) return harder[0]
  }

  if (playerWinStreak <= -3) {
    const easier = candidates.sort((a, b) => a.rating - b.rating)
    if (easier.length > 0) return easier[0]
  }

  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function detectSmurf(
  accountAgeDays: number,
  level: number,
  winRate: number,
  averagePowerForLevel: number,
  characterPower: number,
  matchCount: number,
): { suspected: boolean; reasons: string[] } {
  const reasons: string[] = []

  if (accountAgeDays < 7 && level > 20) {
    reasons.push('Nový účet s vysokou úrovňou.')
  }

  if (accountAgeDays < 14 && winRate > 0.8 && matchCount > 10) {
    reasons.push('Podozrivo vysoká win rate pre nový účet.')
  }

  if (characterPower > averagePowerForLevel * 2 && level < 15) {
    reasons.push('Extrémne silná výbava na nízkom leveli.')
  }

  return { suspected: reasons.length > 0, reasons }
}

export function detectRatingManipulation(
  recentResults: ('win' | 'loss')[],
): { suspicious: boolean; reason?: string } {
  if (recentResults.length < 5) return { suspicious: false }

  const last5 = recentResults.slice(-5)
  const losses = last5.filter(r => r === 'loss').length
  const wins = last5.filter(r => r === 'win').length

  if (losses === 5) {
    return { suspicious: true, reason: 'Podozrivá séria prehier.' }
  }

  if (wins >= 4 && recentResults.length >= 10) {
    const prev10 = recentResults.slice(-10, -5)
    const prevLosses = prev10.filter(r => r === 'loss').length
    if (prevLosses >= 4) {
      return { suspicious: true, reason: 'Striedanie sérií výhier a prehier.' }
    }
  }

  return { suspicious: false }
}

export function shouldShowMatchScore(): boolean {
  return false
}

export function avoidRepeatedMatchups(
  candidates: MatchmakingCandidate[],
  recentOpponentIds: string[],
): MatchmakingCandidate[] {
  return candidates.filter(c => !recentOpponentIds.includes(c.characterId))
}

export function calculateWinStreak(results: ('win' | 'loss')[]): number {
  let streak = 0
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i] === 'win') streak++
    else break
  }
  return streak
}

export function calculateLoseStreak(results: ('win' | 'loss')[]): number {
  let streak = 0
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i] === 'loss') streak++
    else break
  }
  return streak
}

export function getRecommendedDifficulty(
  winStreak: number,
  loseStreak: number,
): 'easier' | 'normal' | 'harder' {
  if (loseStreak >= 3) return 'easier'
  if (winStreak >= 3) return 'harder'
  return 'normal'
}
