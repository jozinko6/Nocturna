export type PushNotificationType =
  | 'expedition_complete'
  | 'crafting_complete'
  | 'upgrade_complete'
  | 'clan_war_start'
  | 'clan_boss_available'
  | 'story_chapter_unlocked'
  | 'auction_sale'
  | 'season_ending'
  | 'event_started'
  | 'daily_reward_ready'

export interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, any>
}

export interface PushPreferences {
  expeditionComplete: boolean
  craftingComplete: boolean
  hideoutComplete: boolean
  clanWar: boolean
  clanBoss: boolean
  auctionSale: boolean
  seasonEvent: boolean
  marketing: boolean
}

export const PUSH_NOTIFICATION_TEMPLATES: Record<PushNotificationType, { titleKey: string; bodyKey: string }> = {
  expedition_complete: { titleKey: 'push.expedition_complete.title', bodyKey: 'push.expedition_complete.body' },
  crafting_complete: { titleKey: 'push.crafting_complete.title', bodyKey: 'push.crafting_complete.body' },
  upgrade_complete: { titleKey: 'push.upgrade_complete.title', bodyKey: 'push.upgrade_complete.body' },
  clan_war_start: { titleKey: 'push.clan_war_start.title', bodyKey: 'push.clan_war_start.body' },
  clan_boss_available: { titleKey: 'push.clan_boss_available.title', bodyKey: 'push.clan_boss_available.body' },
  story_chapter_unlocked: { titleKey: 'push.story_chapter_unlocked.title', bodyKey: 'push.story_chapter_unlocked.body' },
  auction_sale: { titleKey: 'push.auction_sale.title', bodyKey: 'push.auction_sale.body' },
  season_ending: { titleKey: 'push.season_ending.title', bodyKey: 'push.season_ending.body' },
  event_started: { titleKey: 'push.event_started.title', bodyKey: 'push.event_started.body' },
  daily_reward_ready: { titleKey: 'push.daily_reward_ready.title', bodyKey: 'push.daily_reward_ready.body' },
}

export function isNotificationTypeEnabled(
  preferences: PushPreferences,
  notificationType: PushNotificationType,
): boolean {
  const mapping: Record<PushNotificationType, keyof PushPreferences> = {
    expedition_complete: 'expeditionComplete',
    crafting_complete: 'craftingComplete',
    upgrade_complete: 'craftingComplete',
    clan_war_start: 'clanWar',
    clan_boss_available: 'clanBoss',
    story_chapter_unlocked: 'seasonEvent',
    auction_sale: 'auctionSale',
    season_ending: 'seasonEvent',
    event_started: 'seasonEvent',
    daily_reward_ready: 'expeditionComplete',
  }

  const prefKey = mapping[notificationType]
  return preferences[prefKey] ?? false
}

export function shouldRequestPushPermission(
  recentActivity: 'expedition' | 'crafting' | 'clan_war' | 'none',
  hasSubscription: boolean,
  hasPermission: boolean,
): { shouldAsk: boolean; reason?: string } {
  if (hasSubscription && hasPermission) return { shouldAsk: false }
  if (hasPermission && !hasSubscription) return { shouldAsk: true, reason: 'Máš povolenie, ale nie subscription.' }

  switch (recentActivity) {
    case 'expedition':
      return { shouldAsk: true, reason: 'Dlhá výprava — upozorníme ťa na dokončenie.' }
    case 'crafting':
      return { shouldAsk: true, reason: 'Crafting bude trvať — upozorníme ťa.' }
    case 'clan_war':
      return { shouldAsk: true, reason: 'Klanová vojna — upozorníme ťa na útoky.' }
    default:
      return { shouldAsk: false }
  }
}

export function sanitizePushPayload(payload: PushPayload): PushPayload {
  return {
    title: payload.title,
    body: payload.body.replace(/\d+/g, '**'),
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    data: { type: payload.data?.type },
  }
}

export function getPushPayload(
  type: PushNotificationType,
  _data?: Record<string, any>,
): PushPayload {
  const template = PUSH_NOTIFICATION_TEMPLATES[type]
  const defaults: Record<PushNotificationType, PushPayload> = {
    expedition_complete: { title: 'Výprava dokončená', body: 'Tvoja výprava je hotová. Pozri sa na odmeny!', tag: 'expedition' },
    crafting_complete: { title: 'Crafting dokončený', body: 'Tvoj predmet je pripravený na prevzatie.', tag: 'crafting' },
    upgrade_complete: { title: 'Vylepšenie dokončené', body: 'Tvoje vylepšenie bolo úspešné.', tag: 'upgrade' },
    clan_war_start: { title: 'Klanová vojna', body: 'Tvoja klanová vojna začala!', tag: 'clan-war' },
    clan_boss_available: { title: 'Klanový boss', body: 'Nový klanový boss je dostupný.', tag: 'clan-boss' },
    story_chapter_unlocked: { title: 'Nová kapitola', body: 'Odomkla sa nová kapitola príbehu.', tag: 'story' },
    auction_sale: { title: 'Predaj na aukcii', body: 'Tvoja ponuka bola predaná!', tag: 'auction' },
    season_ending: { title: 'Sezóna končí', body: 'Sezóna sa čoskoro skončí. Dokonči svoje ciele!', tag: 'season' },
    event_started: { title: 'Nový event', body: 'Začal sa nový live event!', tag: 'event' },
    daily_reward_ready: { title: 'Denná odmena', body: 'Tvoja denná odmena je pripravená.', tag: 'daily' },
  }

  return defaults[type]
}

export function validateSubscriptionPayload(payload: any): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') return { valid: false, error: 'Neplatný payload.' }
  if (!payload.endpoint) return { valid: false, error: 'Chýba endpoint.' }
  if (!payload.keys?.p256dh) return { valid: false, error: 'Chýba p256dh key.' }
  if (!payload.keys?.auth) return { valid: false, error: 'Chýba auth key.' }
  return { valid: true }
}

export function hashEndpoint(endpoint: string): string {
  let hash = 0
  for (let i = 0; i < endpoint.length; i++) {
    hash = ((hash << 5) - hash + endpoint.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36)
}

export function getNotificationTag(type: PushNotificationType): string {
  return PUSH_NOTIFICATION_TEMPLATES[type]?.titleKey?.split('.').pop() || type
}

export function isTransakcnyPush(type: PushNotificationType): boolean {
  const marketingTypes: PushNotificationType[] = ['event_started', 'season_ending']
  return !marketingTypes.includes(type)
}

export function getDefaultPreferences(): PushPreferences {
  return {
    expeditionComplete: true,
    craftingComplete: true,
    hideoutComplete: true,
    clanWar: true,
    clanBoss: true,
    auctionSale: true,
    seasonEvent: true,
    marketing: false,
  }
}
