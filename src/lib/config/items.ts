// ---------------------------------------------------------------------------
// Nocturna — Item Template Seed Data
//
// 40+ items across all types and rarities. All names, descriptions, and lore
// are in Slovak. Items marked with `factionRestricted` can only be equipped
// by members of that faction. Cursed items carry both a pro and a con.
// ---------------------------------------------------------------------------

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'cursed'

export type ItemSlot =
  | 'weapon'
  | 'offhand'
  | 'helmet'
  | 'armor'
  | 'gloves'
  | 'boots'
  | 'amulet'
  | 'ring'
  | 'relic'
  | 'consumable'

export interface ItemTemplate {
  id: string
  name: string
  slot: ItemSlot
  rarity: Rarity
  /** Stat bonuses granted when equipped */
  stats: Partial<{
    strength: number
    endurance: number
    dexterity: number
    perception: number
    luck: number
    weaponDamage: number
    armor: number
    maxHp: number
  }>
  /** Flat gold value for vendor sale */
  sellPrice: number
  /** Buy price from shop (0 = not purchasable) */
  buyPrice: number
  /** Slovak description */
  description: string
  /** Slovak flavour / lore text */
  lore: string
  /** Restrict to a faction ID, or null for all */
  factionRestricted: string | null
  /** Whether this is a cursed item */
  cursed: boolean
  /** Cursed item: positive effect description */
  cursedPro?: string
  /** Cursed item: negative effect description */
  cursedCon?: string
}

// ---------------------------------------------------------------------------
// Weapons
// ---------------------------------------------------------------------------

const weapons: ItemTemplate[] = [
  {
    id: 'w_rusty_sword',
    name: 'Hrdzavý meč',
    slot: 'weapon',
    rarity: 'common',
    stats: { weaponDamage: 8 },
    sellPrice: 25,
    buyPrice: 80,
    description: 'Starý meč pokrytý hrdzou. Ešte stále dokáže rezať.',
    lore: 'Padlý vojak ho nechal v blate. Teraz slúži tebe.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'w_iron_mace',
    name: 'Železná palica',
    slot: 'weapon',
    rarity: 'common',
    stats: { weaponDamage: 10, strength: 1 },
    sellPrice: 35,
    buyPrice: 110,
    description: 'Ťažká železná palica. Pomalá, ale účinná.',
    lore: 'Každý úder rezonuje kosťami.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'w_dagger_of_shadows',
    name: 'Dýka tieňov',
    slot: 'weapon',
    rarity: 'uncommon',
    stats: { weaponDamage: 12, dexterity: 2, perception: 1 },
    sellPrice: 120,
    buyPrice: 350,
    description: 'Ostrá ako myšlienka. Tichá ako šepot.',
    lore: 'Vybral ju tieň, ktorý zabudol byť tmou.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'w_sangvari_fang',
    name: 'Sangvari kel',
    slot: 'weapon',
    rarity: 'rare',
    stats: { weaponDamage: 18, strength: 3, perception: 2 },
    sellPrice: 450,
    buyPrice: 1200,
    description: 'Krvavý meč z ocele kalenej v mesačnom svetle.',
    lore: 'Kedysi patril veliteľovi Sangvari. Jeho čepeľ pije krv nepriateľov.',
    factionRestricted: 'sangvari',
    cursed: false,
  },
  {
    id: 'w_moonlit_cleaver',
    name: 'Mesačná sekyra',
    slot: 'weapon',
    rarity: 'rare',
    stats: { weaponDamage: 20, strength: 4 },
    sellPrice: 500,
    buyPrice: 1350,
    description: 'Sekyra, ktorej čepeľ žiari v mesačnom svetle.',
    lore: 'Lunari ju získali z mesačného kameňa. Každý úder nesie silu noci.',
    factionRestricted: 'lunari',
    cursed: false,
  },
  {
    id: 'w_bloodthorn',
    name: 'Krvavý tŕň',
    slot: 'weapon',
    rarity: 'epic',
    stats: { weaponDamage: 28, strength: 5, perception: 3, luck: 2 },
    sellPrice: 1200,
    buyPrice: 3500,
    description: 'Čepeľ posiatá tŕňmi, ktoré sa živia krvou.',
    lore: 'Každá rana, ktorú zasadí, zanecháva krvácajúce zranenie.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'w_worldender',
    name: 'Ničiteľ svetov',
    slot: 'weapon',
    rarity: 'legendary',
    stats: { weaponDamage: 40, strength: 8, endurance: 3, luck: 3 },
    sellPrice: 5000,
    buyPrice: 0,
    description: 'Zbraň, ktorá dokáže rozlomiť realitu.',
    lore: 'Prvý Sangvari ju ukul z vlastnej krvi. Hovorí sa, že ju nemožno zastaviť.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'w_whisperblade',
    name: 'Šepkajúca čepeľ',
    slot: 'weapon',
    rarity: 'cursed',
    stats: { weaponDamage: 32, dexterity: 6, perception: 4 },
    sellPrice: 0,
    buyPrice: 0,
    description: 'Čepeľ, ktorá šepce svojmu nositeľovi tajomstvá.',
    lore: 'Každý, kto ju držal, počul jej hlasy. Nie všetci prežili.',
    factionRestricted: null,
    cursed: true,
    cursedPro: '+32 poškodenia, +6 obratnosti, +4 vnímania',
    cursedCon: '-10% maximálneho HP počas nosenia',
  },
]

// ---------------------------------------------------------------------------
// Offhand
// ---------------------------------------------------------------------------

const offhands: ItemTemplate[] = [
  {
    id: 'o_wooden_shield',
    name: 'Drevený štít',
    slot: 'offhand',
    rarity: 'common',
    stats: { armor: 5, endurance: 1 },
    sellPrice: 30,
    buyPrice: 90,
    description: 'Jednoduchý drevený štít. Ochráni pred najhorším.',
    lore: 'Nie každý boj potrebuje meč. Niekedy stačí prežiť.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'o_iron_buckler',
    name: 'Železný štít',
    slot: 'offhand',
    rarity: 'uncommon',
    stats: { armor: 10, endurance: 2 },
    sellPrice: 150,
    buyPrice: 400,
    description: 'Pevný železný štít s krvavými škrabancami.',
    lore: 'Každý škrabanec rozpráva príbeh.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'o_sangvari_tome',
    name: 'Sangvari grimoár',
    slot: 'offhand',
    rarity: 'rare',
    stats: { weaponDamage: 5, perception: 3, luck: 2 },
    sellPrice: 400,
    buyPrice: 1100,
    description: 'Krvavý grimoár plný zakázaných kúziel.',
    lore: 'Jeho stránky sú napísané krvou prvorodených.',
    factionRestricted: 'sangvari',
    cursed: false,
  },
]

// ---------------------------------------------------------------------------
// Helmets
// ---------------------------------------------------------------------------

const helmets: ItemTemplate[] = [
  {
    id: 'h_leather_cap',
    name: 'Kožená prilba',
    slot: 'helmet',
    rarity: 'common',
    stats: { armor: 3, perception: 1 },
    sellPrice: 20,
    buyPrice: 60,
    description: 'Jednoduchá kožená prilba.',
    lore: 'Lepšie ako nič.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'h_iron_helm',
    name: 'Železná prilba',
    slot: 'helmet',
    rarity: 'uncommon',
    stats: { armor: 8, endurance: 2 },
    sellPrice: 180,
    buyPrice: 500,
    description: 'Pevná železná prilba s ochranou tváre.',
    lore: 'Udrží tvár celú, aspoň väčšinu času.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'h_crown_of_blood',
    name: 'Koruna krvi',
    slot: 'helmet',
    rarity: 'epic',
    stats: { armor: 12, strength: 3, luck: 4 },
    sellPrice: 900,
    buyPrice: 2800,
    description: 'Koruna z stvrdnutej krvi, ktorá žiadi obete.',
    lore: 'Kráľ Sangvari ju nosil posledný deň svojho života.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'h_moonveil_hood',
    name: 'Mesačná kapucňa',
    slot: 'helmet',
    rarity: 'rare',
    stats: { armor: 10, dexterity: 3, perception: 2 },
    sellPrice: 550,
    buyPrice: 1500,
    description: 'Kapucňa z látky, ktorá odráža mesačné svetlo.',
    lore: 'Lunari ju nosia počas nočných lovov.',
    factionRestricted: 'lunari',
    cursed: false,
  },
]

// ---------------------------------------------------------------------------
// Armor
// ---------------------------------------------------------------------------

const armors: ItemTemplate[] = [
  {
    id: 'a_leather_vest',
    name: 'Kožená vesta',
    slot: 'armor',
    rarity: 'common',
    stats: { armor: 5, endurance: 1 },
    sellPrice: 30,
    buyPrice: 100,
    description: 'Základná kožená zbroj.',
    lore: 'Chránený je lepšie ako nahý.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'a_chainmail',
    name: 'Krutý kolákový šat',
    slot: 'armor',
    rarity: 'uncommon',
    stats: { armor: 12, endurance: 3 },
    sellPrice: 250,
    buyPrice: 700,
    description: 'Pevný kolákový šat, ktorý rozptyľuje údery.',
    lore: 'Každý odkaz odráža časť sily.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'a_plate_of_void',
    name: 'Brnenie prázdnoty',
    slot: 'armor',
    rarity: 'epic',
    stats: { armor: 22, endurance: 5, maxHp: 50 },
    sellPrice: 1500,
    buyPrice: 4500,
    description: 'Brnenie, ktoré absorbuje časť poškodenia.',
    lore: 'Vyrobené z prázdnoty medzi svetmi.',
    factionRestricted: null,
    cursed: false,
  },
]

// ---------------------------------------------------------------------------
// Gloves
// ---------------------------------------------------------------------------

const gloves: ItemTemplate[] = [
  {
    id: 'g_leather_gloves',
    name: 'Kožené rukavice',
    slot: 'gloves',
    rarity: 'common',
    stats: { dexterity: 1 },
    sellPrice: 15,
    buyPrice: 50,
    description: 'Jednoduché kožené rukavice.',
    lore: 'Lepší úchop, lepšie údery.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'g_gauntlets_of_power',
    name: 'Rukavice moci',
    slot: 'gloves',
    rarity: 'rare',
    stats: { strength: 3, dexterity: 2, weaponDamage: 3 },
    sellPrice: 350,
    buyPrice: 950,
    description: 'Rukavice prešpikované silou.',
    lore: 'Každý úder s nimi má váhu osudu.',
    factionRestricted: null,
    cursed: false,
  },
]

// ---------------------------------------------------------------------------
// Boots
// ---------------------------------------------------------------------------

const boots: ItemTemplate[] = [
  {
    id: 'b_leather_boots',
    name: 'Kožené topánky',
    slot: 'boots',
    rarity: 'common',
    stats: { dexterity: 1 },
    sellPrice: 15,
    buyPrice: 45,
    description: 'Pohodlné kožené topánky.',
    lore: 'Ticho sa blížia, ticho odchádzajú.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'b_boots_of_haste',
    name: 'Topánky spěchu',
    slot: 'boots',
    rarity: 'uncommon',
    stats: { dexterity: 3 },
    sellPrice: 200,
    buyPrice: 550,
    description: 'Topánky, ktoré zrýchľujú kroky.',
    lore: 'Niekedy je rýchlosť jediná obrana.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'b_shadowstriders',
    name: 'Tieňové kroky',
    slot: 'boots',
    rarity: 'epic',
    stats: { dexterity: 5, perception: 3 },
    sellPrice: 800,
    buyPrice: 2400,
    description: 'Topánky, ktoré kráčajú medzi tieňmi.',
    lore: 'Nositeľ zmizne skôr, než stihneš zapnúť.',
    factionRestricted: null,
    cursed: false,
  },
]

// ---------------------------------------------------------------------------
// Amulets
// ---------------------------------------------------------------------------

const amulets: ItemTemplate[] = [
  {
    id: 'am_bone_pendant',
    name: 'Kostný prívesok',
    slot: 'amulet',
    rarity: 'common',
    stats: { maxHp: 15 },
    sellPrice: 20,
    buyPrice: 65,
    description: 'Prívesok z kosti neznámeho tvora.',
    lore: 'Chránený pred smrťou. Aspoň trochu.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'am_bloodstone_amulet',
    name: 'Krvavý amulet',
    slot: 'amulet',
    rarity: 'rare',
    stats: { strength: 2, luck: 3, maxHp: 30 },
    sellPrice: 400,
    buyPrice: 1100,
    description: 'Amulet z krvavého kameňa, ktorý pulzuje energiou.',
    lore: 'Sangvari ho používajú ako zdroj moci.',
    factionRestricted: 'sangvari',
    cursed: false,
  },
]

// ---------------------------------------------------------------------------
// Rings
// ---------------------------------------------------------------------------

const rings: ItemTemplate[] = [
  {
    id: 'r_copper_ring',
    name: 'Medený prsteň',
    slot: 'ring',
    rarity: 'common',
    stats: { luck: 1 },
    sellPrice: 10,
    buyPrice: 30,
    description: 'Jednoduchý medený prsteň.',
    lore: 'Možno prinesie šťastie.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'r_ring_of_fortitude',
    name: 'Prsteň húževnatosti',
    slot: 'ring',
    rarity: 'uncommon',
    stats: { endurance: 2, maxHp: 20 },
    sellPrice: 180,
    buyPrice: 500,
    description: 'Prsteň, ktorý posilňuje telo.',
    lore: 'Vytrvalosť je zbraň sama o sebe.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'r_ring_of_greed',
    name: 'Prsteň chamtivosti',
    slot: 'ring',
    rarity: 'cursed',
    stats: { luck: 5 },
    sellPrice: 0,
    buyPrice: 0,
    description: 'Prsteň, ktorý priťahuje zlato, ale život.',
    lore: 'Každý, kto ho nosil, chcel viac. A viac. A viac.',
    factionRestricted: null,
    cursed: true,
    cursedPro: '+5 šťastia, viac zlatých z výprav',
    cursedCon: '-15% maximálneho HP',
  },
  {
    id: 'r_lunar_signet',
    name: 'Mesačný pečatný prsteň',
    slot: 'ring',
    rarity: 'rare',
    stats: { perception: 3, dexterity: 2, luck: 2 },
    sellPrice: 420,
    buyPrice: 1150,
    description: 'Prsteň s mesačným motívom, ktorý žiari v tme.',
    lore: 'Lunari ho nosia ako znak vernosti mesiacu.',
    factionRestricted: 'lunari',
    cursed: false,
  },
]

// ---------------------------------------------------------------------------
// Relics
// ---------------------------------------------------------------------------

const relics: ItemTemplate[] = [
  {
    id: 're_heart_of_darkness',
    name: 'Srdce temnoty',
    slot: 'relic',
    rarity: 'epic',
    stats: { strength: 4, endurance: 4, luck: 3 },
    sellPrice: 1000,
    buyPrice: 3000,
    description: 'Pulzujúce srdce z hĺbky temnoty.',
    lore: 'Prvý Sangvari ho našiel v pekle. Nikto nevie, čo vlastne je.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 're_moonshard',
    name: 'Mesačný úlomok',
    slot: 'relic',
    rarity: 'rare',
    stats: { perception: 4, dexterity: 2, maxHp: 25 },
    sellPrice: 500,
    buyPrice: 1400,
    description: 'Úlomok mesačného kameňa, ktorý šepoce.',
    lore: 'Lunari ho nazývajú "oko mesiaca".',
    factionRestricted: null,
    cursed: false,
  },
]

// ---------------------------------------------------------------------------
// Consumables
// ---------------------------------------------------------------------------

const consumables: ItemTemplate[] = [
  {
    id: 'c_health_potion',
    name: 'Liečivý elixír',
    slot: 'consumable',
    rarity: 'common',
    stats: {},
    sellPrice: 10,
    buyPrice: 25,
    description: 'Obnoví 50 HP.',
    lore: 'Základný elixír každého dobrodruha.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'c_greater_health_potion',
    name: 'Silný liečivý elixír',
    slot: 'consumable',
    rarity: 'uncommon',
    stats: {},
    sellPrice: 40,
    buyPrice: 100,
    description: 'Obnoví 150 HP.',
    lore: 'Pre tých, ktorí sa dostali príliš nízko.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'c_energy_drink',
    name: 'Energetický nápoj',
    slot: 'consumable',
    rarity: 'common',
    stats: {},
    sellPrice: 15,
    buyPrice: 40,
    description: 'Obnoví 20 energie.',
    lore: 'Chutí ako tma s nádychom ovocia.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'c_berserker_potion',
    name: 'Elixír berserkera',
    slot: 'consumable',
    rarity: 'rare',
    stats: {},
    sellPrice: 80,
    buyPrice: 220,
    description: '+10% k útoku na 5 minút. -5% k obrane.',
    lore: 'Moc za cenu rozumu.',
    factionRestricted: null,
    cursed: false,
  },
  {
    id: 'c_shadow_vial',
    name: 'Fľaštička tieňa',
    slot: 'consumable',
    rarity: 'uncommon',
    stats: {},
    sellPrice: 50,
    buyPrice: 130,
    description: '+8% k úhybu na 5 minút.',
    lore: 'Staň sa tieňom. Aspoň na chvíľu.',
    factionRestricted: null,
    cursed: false,
  },
]

// ---------------------------------------------------------------------------
// All items registry
// ---------------------------------------------------------------------------

export const allItems: ItemTemplate[] = [
  ...weapons,
  ...offhands,
  ...helmets,
  ...armors,
  ...gloves,
  ...boots,
  ...amulets,
  ...rings,
  ...relics,
  ...consumables,
]

/**
 * Retrieve an item template by ID.
 */
export function getItemById(id: string): ItemTemplate | undefined {
  return allItems.find((item) => item.id === id)
}

/**
 * Get all items of a given rarity.
 */
export function getItemsByRarity(rarity: Rarity): ItemTemplate[] {
  return allItems.filter((item) => item.rarity === rarity)
}

/**
 * Get all items for a specific slot.
 */
export function getItemsBySlot(slot: ItemSlot): ItemTemplate[] {
  return allItems.filter((item) => item.slot === slot)
}

/**
 * Get all faction-restricted items for a given faction.
 */
export function getFactionItems(factionId: string): ItemTemplate[] {
  return allItems.filter((item) => item.factionRestricted === factionId)
}

/**
 * Get all cursed items.
 */
export function getCursedItems(): ItemTemplate[] {
  return allItems.filter((item) => item.cursed)
}
