import { COMBAT_MAX_ROUNDS, BLOCK_CHANCE, BLOCK_REDUCTION, CRIT_MULTIPLIER } from './config'
import { Rng, randomInt } from './rng'
import { CombatantSnapshot } from './snapshot'

export interface CombatRound {
  round: number
  attackerDamage: number
  defenderDamage: number
  attackerHp: number
  defenderHp: number
  attackerBlocked: boolean
  defenderBlocked: boolean
  attackerCrit: boolean
  defenderCrit: boolean
}

export interface BattleResult {
  winner: 'attacker' | 'defender'
  rounds: CombatRound[]
  totalAttackerDamage: number
  totalDefenderDamage: number
}

export function simulateBattle(
  attacker: CombatantSnapshot,
  defender: CombatantSnapshot,
  rng: Rng,
): BattleResult {
  let attackerHp = attacker.currentHp
  let defenderHp = defender.currentHp
  const rounds: CombatRound[] = []
  let totalAttackerDamage = 0
  let totalDefenderDamage = 0

  for (let i = 1; i <= COMBAT_MAX_ROUNDS; i++) {
    let attackerDamage = randomInt(rng, attacker.minDamage, attacker.maxDamage)
    const attackerCrit = rng() * 100 < attacker.critChance
    if (attackerCrit) attackerDamage = Math.floor(attackerDamage * CRIT_MULTIPLIER)
    const defenderBlocked = rng() * 100 < defender.blockChance
    if (defenderBlocked) attackerDamage = Math.floor(attackerDamage * (1 - BLOCK_REDUCTION))
    defenderHp -= attackerDamage
    totalAttackerDamage += attackerDamage

    let defenderDamage = randomInt(rng, defender.minDamage, defender.maxDamage)
    const defenderCrit = rng() * 100 < defender.critChance
    if (defenderCrit) defenderDamage = Math.floor(defenderDamage * CRIT_MULTIPLIER)
    const attackerBlocked = rng() * 100 < attacker.blockChance
    if (attackerBlocked) defenderDamage = Math.floor(defenderDamage * (1 - BLOCK_REDUCTION))
    attackerHp -= defenderDamage
    totalDefenderDamage += defenderDamage

    rounds.push({
      round: i,
      attackerDamage,
      defenderDamage,
      attackerHp: Math.max(0, attackerHp),
      defenderHp: Math.max(0, defenderHp),
      attackerBlocked,
      defenderBlocked,
      attackerCrit,
      defenderCrit,
    })

    if (defenderHp <= 0 || attackerHp <= 0) break
  }

  return {
    winner: attackerHp > 0 ? 'attacker' : 'defender',
    rounds,
    totalAttackerDamage,
    totalDefenderDamage,
  }
}
