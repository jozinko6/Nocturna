export interface CombatantSnapshot {
  characterId: string | null
  name: string
  level: number
  currentHp: number
  maxHp: number
  stats: {
    strength: number
    dexterity: number
    endurance: number
    perception: number
    willpower: number
    luck: number
  }
  equipment: Record<string, any>
  minDamage: number
  maxDamage: number
  blockChance: number
  critChance: number
}

export function createPlayerSnapshot(
  characterId: string,
  name: string,
  level: number,
  stats: { strength: number; dexterity: number; endurance: number; perception: number; willpower: number; luck: number },
  equipment: Record<string, any>,
  currentHp: number,
  maxHp: number,
): CombatantSnapshot {
  const weaponDamage = equipment?.weapon?.base_damage || 5
  return {
    characterId,
    name,
    level,
    currentHp,
    maxHp,
    stats,
    equipment,
    minDamage: Math.floor(weaponDamage * 0.8 + stats.strength),
    maxDamage: Math.floor(weaponDamage * 1.2 + stats.strength * 1.5),
    blockChance: 5 + stats.dexterity * 0.5,
    critChance: 3 + stats.luck * 0.8 + stats.dexterity * 0.3,
  }
}

export function createEnemySnapshot(
  name: string,
  level: number,
  baseHp: number,
  baseAttack: number,
  baseDefense: number,
): CombatantSnapshot {
  return {
    characterId: null,
    name,
    level,
    currentHp: baseHp,
    maxHp: baseHp,
    stats: { strength: baseAttack, dexterity: 5, endurance: baseDefense, perception: 5, willpower: 3, luck: 3 },
    equipment: {},
    minDamage: Math.floor(baseAttack * 0.8),
    maxDamage: Math.floor(baseAttack * 1.2),
    blockChance: 5 + baseDefense * 0.3,
    critChance: 3,
  }
}
