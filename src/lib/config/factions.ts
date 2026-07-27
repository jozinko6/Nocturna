// ---------------------------------------------------------------------------
// Nocturna — Faction Configuration
//
// Both factions are symmetric in power. Passives are configured so that
// neither faction dominates; the choice is aesthetic / role-play preference.
// ---------------------------------------------------------------------------

export interface FactionPassive {
  /** Human-readable description (Slovak) */
  description: string
  /** Mechanical effect key used by combat/economy modules */
  effect: string
  /** Numeric value — interpretation depends on `effect` */
  value: number
}

export interface Faction {
  id: string
  name: string
  /** Slovak lore description */
  lore: string
  /** Visual theme colour (hex) */
  color: string
  /** Passive bonuses (array for future expansion) */
  passives: FactionPassive[]
}

// ---------------------------------------------------------------------------
// Sangvari — blood, manipulation, precision, life energy, curses
// ---------------------------------------------------------------------------

export const sangvari: Faction = {
  id: 'sangvari',
  name: 'Sangvari',
  lore: 'Starobylý krvavý rád, ktorý ovláda umenie manipulácie životnou energiou. ' +
    'Ich precíznosť v boji je legendárna, no ich moc prichádza s cenou — ' +
    'každá kliatba, ktorú uvalia, sa im vráti späť.',
  color: '#8B0000',
  passives: [
    {
      description: '+5% k presnosti',
      effect: 'accuracyBonus',
      value: 0.05,
    },
    {
      description: '+5% lifesteal (kradnutie života)',
      effect: 'lifesteal',
      value: 0.05,
    },
    {
      description: '-3% k maximálnym HP',
      effect: 'maxHpPenalty',
      value: -0.03,
    },
  ],
}

// ---------------------------------------------------------------------------
// Lunari — strength, regeneration, resilience, hunt, fury
// ---------------------------------------------------------------------------

export const lunari: Faction = {
  id: 'lunari',
  name: 'Lunari',
  lore: 'Divoký kmeň viazaný na mesačné sily. Lunari veria v regeneráciu a ' +
    'odolnosť — ich bojovníci sa zotavia z každej rany a v noci sú takmer ' +
    'neporaziteľní. Každá zbraň sa im v rukách mení na osud.',
  color: '#1E3A5F',
  passives: [
    {
      description: '+5% k maximálnym HP',
      effect: 'maxHpBonus',
      value: 0.05,
    },
    {
      description: '+5% k regenerácii HP (počas odpočinku)',
      effect: 'hpRegen',
      value: 0.05,
    },
    {
      description: '-3% k presnosti',
      effect: 'accuracyPenalty',
      value: -0.03,
    },
  ],
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const factions: Record<string, Faction> = {
  sangvari,
  lunari,
}

/**
 * Retrieve a faction by ID, or undefined if not found.
 */
export function getFaction(id: string): Faction | undefined {
  return factions[id]
}
