export interface BotOpponent {
  id: string
  name: string
  level: number
  rating: number
  stats: { strength: number; dexterity: number; endurance: number; perception: number; willpower: number; luck: number }
  portraitUrl: string | null
}

export const BOT_OPPONENTS: BotOpponent[] = [
  {
    id: 'bot_shade',
    name: 'Tieň',
    level: 5,
    rating: 900,
    stats: { strength: 8, dexterity: 7, endurance: 6, perception: 5, willpower: 4, luck: 3 },
    portraitUrl: null,
  },
  {
    id: 'bot_wraith',
    name: 'Prízrak',
    level: 10,
    rating: 1000,
    stats: { strength: 12, dexterity: 10, endurance: 9, perception: 8, willpower: 6, luck: 4 },
    portraitUrl: null,
  },
  {
    id: 'bot_sentinel',
    name: 'Strážca',
    level: 15,
    rating: 1200,
    stats: { strength: 15, dexterity: 12, endurance: 14, perception: 10, willpower: 8, luck: 5 },
    portraitUrl: null,
  },
  {
    id: 'bot_hunter',
    name: 'Lovec',
    level: 20,
    rating: 1400,
    stats: { strength: 18, dexterity: 16, endurance: 13, perception: 14, willpower: 10, luck: 6 },
    portraitUrl: null,
  },
  {
    id: 'bot_blood_knight',
    name: 'Rytier krvi',
    level: 25,
    rating: 1600,
    stats: { strength: 22, dexterity: 18, endurance: 16, perception: 12, willpower: 12, luck: 7 },
    portraitUrl: null,
  },
  {
    id: 'bot_moon_stalker',
    name: 'Mesačný stopár',
    level: 30,
    rating: 1800,
    stats: { strength: 25, dexterity: 22, endurance: 20, perception: 18, willpower: 15, luck: 8 },
    portraitUrl: null,
  },
]

export function findSuitableBots(playerRating: number, count: number = 5): BotOpponent[] {
  const sorted = [...BOT_OPPONENTS].sort(
    (a, b) => Math.abs(a.rating - playerRating) - Math.abs(b.rating - playerRating),
  )
  return sorted.slice(0, count)
}
