export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || ''
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com'
export const POSTHOG_ENABLED = !!POSTHOG_KEY

export type AnalyticsEvent =
  | { event: 'character_created'; properties: { faction: string; class: string } }
  | { event: 'level_up'; properties: { characterId: string; level: number } }
  | { event: 'combat_completed'; properties: { victory: boolean; enemyType: string; duration: number } }
  | { event: 'pvp_match'; properties: { victory: boolean; ratingChange: number } }
  | { event: 'expedition_completed'; properties: { regionId: string; victory: boolean } }
  | { event: 'training'; properties: { attributeName: string; newLevel: number } }
  | { event: 'purchase'; properties: { itemId: string; priceEur: number; crystals: number } }
  | { event: 'subscription_started'; properties: { plan: string } }
  | { event: 'subscription_canceled'; properties: { plan: string; reason?: string } }
  | { event: 'ad_watched'; properties: { rewardType: string; amount: number } }
  | { event: 'daily_login'; properties: { streak: number } }
  | { event: 'clan_created'; properties: { clanName: string } }
  | { event: 'referral_used'; properties: { referrerId: string } }
  | { event: 'season_pass_claim'; properties: { tier: number; isPremium: boolean } }
  | { event: 'cosmetic_purchased'; properties: { itemId: string; category: string } }
  | { event: 'session_start'; properties: { platform: string } }
  | { event: 'session_end'; properties: { duration: number } }

type BufferedEvent = {
  event: AnalyticsEvent
  userId?: string
  characterId?: string
  timestamp: string
}

let eventBuffer: BufferedEvent[] = []
let flushInterval: ReturnType<typeof setInterval> | null = null
let posthogClient: { capture: (id: string, event: string, props?: Record<string, unknown>) => void; identify: (id: string, props?: Record<string, unknown>) => void } | null = null

function getPosthogClient() {
  if (posthogClient) return posthogClient
  if (!POSTHOG_ENABLED) return null

  try {
    const PostHog = require('posthog-node').default
    posthogClient = new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST })
    return posthogClient
  } catch {
    return null
  }
}

function flush() {
  const events = eventBuffer.splice(0, eventBuffer.length)
  if (!events.length) return 0

  const client = getPosthogClient()

  for (const buffered of events) {
    if (process.env.NODE_ENV === 'development' || !client) {
      console.log('[Analytics]', buffered.event.event, buffered.event.properties)
      continue
    }

    const distinctId = buffered.userId || buffered.characterId || 'anonymous'

    if (buffered.characterId) {
      client.capture(distinctId, buffered.event.event, {
        ...buffered.event.properties,
        characterId: buffered.characterId,
        timestamp: buffered.timestamp,
      })
    } else {
      client.capture(distinctId, buffered.event.event, {
        ...buffered.event.properties,
        timestamp: buffered.timestamp,
      })
    }
  }

  return events.length
}

function track(event: AnalyticsEvent, userId?: string, characterId?: string) {
  if (!POSTHOG_ENABLED) return

  try {
    eventBuffer.push({
      event,
      userId,
      characterId,
      timestamp: new Date().toISOString(),
    })

    if (eventBuffer.length >= 50) {
      flush()
    }
  } catch {
    // silently fail
  }
}

function trackBatch(events: AnalyticsEvent[], userId?: string, characterId?: string) {
  if (!POSTHOG_ENABLED) return

  try {
    const now = new Date().toISOString()
    for (const event of events) {
      eventBuffer.push({ event, userId, characterId, timestamp: now })
    }

    if (eventBuffer.length >= 50) {
      flush()
    }
  } catch {
    // silently fail
  }
}

function identify(userId: string, properties: Record<string, unknown>) {
  if (!POSTHOG_ENABLED) return

  try {
    const client = getPosthogClient()

    if (process.env.NODE_ENV === 'development' || !client) {
      console.log('[Analytics] identify', userId, properties)
      return
    }

    client.identify(userId, properties)
  } catch {
    // silently fail
  }
}

function getAnalyticsStatus() {
  return {
    enabled: POSTHOG_ENABLED,
    queuedEvents: eventBuffer.length,
    posthogHost: POSTHOG_HOST,
  }
}

function startAutoFlush() {
  if (flushInterval) return
  flushInterval = setInterval(() => {
    try {
      flush()
    } catch {
      // silently fail
    }
  }, 30_000)
}

function shutdownAnalytics() {
  if (flushInterval) {
    clearInterval(flushInterval)
    flushInterval = null
  }
  flush()
}

startAutoFlush()

export { track, identify, flush, trackBatch, getAnalyticsStatus, shutdownAnalytics }
