export const PORTRAITS = [
  { id: 'portrait_warrior', name: 'Bojovník', url: '/portraits/warrior.jpg' },
  { id: 'portrait_rogue', name: 'Zlodej', url: '/portraits/rogue.jpg' },
  { id: 'portrait_mage', name: 'Mág', url: '/portraits/mage.jpg' },
  { id: 'portrait_healer', name: 'Liečiteľ', url: '/portraits/healer.jpg' },
]

export const FIRST_EXPEDITION = {
  regionId: 'r_mesto',
  difficulty: 'safe' as const,
  eventName: 'Nočná patrola',
}

export const STARTER_ITEMS = [
  { templateSlug: 'w_rusty_sword', quantity: 1 },
]
