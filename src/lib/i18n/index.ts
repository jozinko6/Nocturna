// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Locale = 'sk' | 'en'

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const translations = {
  sk: {
    // Common
    'game.name': 'Nocturna',
    'game.tagline': 'Temná fantasy RPG v tvojom prehliadači',

    // Factions
    'faction.sangvari': 'Sangvari',
    'faction.sangvari.desc': 'Krv, manipulácia a precíznosť. Životná energia a kliatby.',
    'faction.lunari': 'Lunari',
    'faction.lunari.desc': 'Silná regenerácia a odolnosť. Poľovačka a divokosť.',

    // Attributes
    'attr.strength': 'Sila',
    'attr.endurance': 'Vytrvalosť',
    'attr.dexterity': 'Obratnosť',
    'attr.perception': 'Vnímanie',
    'attr.luck': 'Šťastie',

    // Item types
    'item.weapon': 'Zbraň',
    'item.offhand': 'Druhotná zbraň',
    'item.helmet': 'Prilba',
    'item.armor': 'Brnenie',
    'item.gloves': 'Rukavice',
    'item.boots': 'Topánky',
    'item.amulet': 'Amulet',
    'item.ring': 'Prsteň',
    'item.relic': 'Relikvia',
    'item.consumable': 'Spotrebný predmet',

    // Rarity
    'rarity.common': 'Bežný',
    'rarity.uncommon': 'Neobvyklý',
    'rarity.rare': 'Vzácny',
    'rarity.epic': 'Epický',
    'rarity.legendary': 'Legendárny',
    'rarity.cursed': 'Prekliaty',

    // UI Labels
    'ui.inventory': 'Inventár',
    'ui.equipment': 'Výstroj',
    'ui.combat': 'Súboj',
    'ui.character': 'Postava',
    'ui.shop': 'Obchod',
    'ui.missions': 'Úlohy',
    'ui.hideout': 'Úkryt',
    'ui.expedition': 'Výprava',
    'ui.pvp': 'PvP Aréna',
    'ui.settings': 'Nastavenia',
    'ui.logout': 'Odhlásiť sa',
    'ui.login': 'Prihlásiť sa',
    'ui.register': 'Registrovať sa',
    'ui.level': 'Úroveň {0}',
    'ui.health': 'Život',
    'ui.energy': 'Energia',
    'ui.gold': 'Zlaté',
    'ui.crystals': 'Kryštály',
    'ui.xp': 'Skúsenosti',
    'ui.attack': 'Útok',
    'ui.defense': 'Obrana',
    'ui.accuracy': 'Presnosť',
    'ui.crit': 'Kritický zásah',
    'ui.dodge': 'Úhyb',
    'ui.battle_log': 'Záznam súboja',
    'ui.victory': 'Víťazstvo',
    'ui.defeat': 'Porážka',
    'ui.claim': 'Vybrať odmenu',
    'ui.train': 'Trénovať',
    'ui.upgrade': 'Vylepšiť',
    'ui.build': 'Postaviť',
    'ui.collect': 'Vyzdvihnúť',
    'ui.refresh': 'Obnoviť',
    'ui.confirm': 'Potvrdiť',
    'ui.cancel': 'Zrušiť',
    'ui.back': 'Späť',
    'ui.next': 'Ďalej',

    // Pluralization helper (Slovak rules)
    'plural.crystal': '{0} kryštál|{0} kryštály|{0} kryštálov',
    'plural.gold': '{0} zlatý|{0} zlaté|{0} zlatých',
    'plural.enemy': '{0} nepriateľ|{0} nepriatelia|{0} nepriateľov',
    'plural.round': '{0} kolo|{0} kolá|{0} kôl',
  },

  en: {
    'game.name': 'Nocturna',
    'game.tagline': 'Dark fantasy RPG in your browser',

    'faction.sangvari': 'Sangvari',
    'faction.sangvari.desc': 'Blood, manipulation, and precision. Life energy and curses.',
    'faction.lunari': 'Lunari',
    'faction.lunari.desc': 'Strong regeneration and resilience. Hunt and fury.',

    'attr.strength': 'Strength',
    'attr.endurance': 'Endurance',
    'attr.dexterity': 'Dexterity',
    'attr.perception': 'Perception',
    'attr.luck': 'Luck',

    'item.weapon': 'Weapon',
    'item.offhand': 'Offhand',
    'item.helmet': 'Helmet',
    'item.armor': 'Armor',
    'item.gloves': 'Gloves',
    'item.boots': 'Boots',
    'item.amulet': 'Amulet',
    'item.ring': 'Ring',
    'item.relic': 'Relic',
    'item.consumable': 'Consumable',

    'rarity.common': 'Common',
    'rarity.uncommon': 'Uncommon',
    'rarity.rare': 'Rare',
    'rarity.epic': 'Epic',
    'rarity.legendary': 'Legendary',
    'rarity.cursed': 'Cursed',

    'ui.inventory': 'Inventory',
    'ui.equipment': 'Equipment',
    'ui.combat': 'Combat',
    'ui.character': 'Character',
    'ui.shop': 'Shop',
    'ui.missions': 'Missions',
    'ui.hideout': 'Hideout',
    'ui.expedition': 'Expedition',
    'ui.pvp': 'PvP Arena',
    'ui.settings': 'Settings',
    'ui.logout': 'Logout',
    'ui.login': 'Login',
    'ui.register': 'Register',
    'ui.level': 'Level {0}',
    'ui.health': 'Health',
    'ui.energy': 'Energy',
    'ui.gold': 'Gold',
    'ui.crystals': 'Crystals',
    'ui.xp': 'Experience',
    'ui.attack': 'Attack',
    'ui.defense': 'Defense',
    'ui.accuracy': 'Accuracy',
    'ui.crit': 'Critical Hit',
    'ui.dodge': 'Dodge',
    'ui.battle_log': 'Battle Log',
    'ui.victory': 'Victory',
    'ui.defeat': 'Defeat',
    'ui.claim': 'Claim Reward',
    'ui.train': 'Train',
    'ui.upgrade': 'Upgrade',
    'ui.build': 'Build',
    'ui.collect': 'Collect',
    'ui.refresh': 'Refresh',
    'ui.confirm': 'Confirm',
    'ui.cancel': 'Cancel',
    'ui.back': 'Back',
    'ui.next': 'Next',

    'plural.crystal': '{0} crystal|{0} crystals|{0} crystals',
    'plural.gold': '{0} gold|{0} gold|{0} gold',
    'plural.enemy': '{0} enemy|{0} enemies|{0} enemies',
    'plural.round': '{0} round|{0} rounds|{0} rounds',
  },
} satisfies Record<Locale, Record<string, string>>

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve a translated string by key.
 *
 * Supports simple interpolation with positional placeholders {0}, {1}, ...
 *
 * @param locale - 'sk' (default) or 'en'
 * @param key    - dot-separated translation key
 * @param args   - positional interpolation arguments
 */
export function getTranslation(locale: Locale, key: string, ...args: string[]): string {
  const dict = (translations[locale] ?? translations.sk) as Record<string, string>
  let value = dict[key] ?? (translations.sk as Record<string, string>)[key] ?? key

  for (let i = 0; i < args.length; i++) {
    value = value.replace(`{${i}}`, args[i])
  }

  return value
}

/**
 * Slovak pluralization.
 *
 * Slovak has 3 plural forms:
 *   - form 1: 1 (jeden kryštál)
 *   - form 2: 2–4 (2, 3, 4 kryštály)
 *   - form 3: 0, 5–21, … (5, 6, 11 kryštálov)
 *
 * @param locale - 'sk' or 'en' (en always uses form 2+)
 * @param key    - translation key whose value is "form1|form2|form3"
 * @param count  - the number to pluralize
 */
export function pluralize(locale: Locale, key: string, count: number): string {
  const dict = (translations[locale] ?? translations.sk) as Record<string, string>
  const raw = dict[key] ?? key
  const forms = raw.split('|')

  if (locale === 'en') {
    const form = count === 1 ? 0 : 1
    return (forms[form] ?? forms[0] ?? key).replace('{0}', String(count))
  }

  // Slovak rules
  let formIndex: number
  if (count === 1) {
    formIndex = 0
  } else if (count >= 2 && count <= 4) {
    formIndex = 1
  } else {
    formIndex = 2
  }

  return (forms[formIndex] ?? forms[formIndex] ?? forms[0] ?? key).replace(
    '{0}',
    String(count)
  )
}

export { translations }
