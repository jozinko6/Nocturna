/**
 * Nocturna — Economy Protection
 *
 * Rate limiting and fraud detection for economic operations.
 * All monetary operations should validate through these checks.
 */

/**
 * Rate limit configuration per operation type.
 * Max operations per time window.
 */
export const RATE_LIMITS: Record<string, { maxOps: number; windowMs: number }> = {
  training: { maxOps: 20, windowMs: 60_000 },
  batch_training: { maxOps: 5, windowMs: 60_000 },
  shop_buy: { maxOps: 10, windowMs: 300_000 },
  shop_sell: { maxOps: 20, windowMs: 300_000 },
  expedition_start: { maxOps: 10, windowMs: 300_000 },
  pvp_attack: { maxOps: 15, windowMs: 300_000 },
  hideout_upgrade: { maxOps: 5, windowMs: 600_000 },
  quest_claim: { maxOps: 10, windowMs: 60_000 },
  daily_reward: { maxOps: 2, windowMs: 60_000 },
  premium_purchase: { maxOps: 5, windowMs: 3_600_000 },
}

/**
 * In-memory rate limiter (per process).
 * In production, use Redis for distributed rate limiting.
 */
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()

export function checkRateLimit(
  characterId: string,
  operationType: string,
): { allowed: boolean; retryAfterMs?: number } {
  const config = RATE_LIMITS[operationType]
  if (!config) return { allowed: true }

  const key = `${characterId}:${operationType}`
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now - entry.windowStart > config.windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now })
    return { allowed: true }
  }

  entry.count++
  if (entry.count > config.maxOps) {
    const retryAfterMs = config.windowMs - (now - entry.windowStart)
    return { allowed: false, retryAfterMs }
  }

  return { allowed: true }
}

/**
 * Fraud detection heuristics for economic operations.
 * Returns a list of flags if suspicious activity is detected.
 */
export type FraudFlag = {
  type: 'rapid_gold_gain' | 'rapid_gold_spend' | 'suspicious_pattern' | 'rate_limit_exceeded'
  severity: 'low' | 'medium' | 'high'
  message: string
}

export function detectFraud(
  characterId: string,
  operationType: string,
  amount: number,
  currentBalance: number,
  recentLedgerEntries: { changeAmount: number; createdAt: string; sourceType: string }[],
): FraudFlag[] {
  const flags: FraudFlag[] = []

  // Check for rapid gold gain (> 10,000 in 1 hour)
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()
  const recentGains = recentLedgerEntries
    .filter(e => e.changeAmount > 0 && e.createdAt > oneHourAgo)
    .reduce((sum, e) => sum + e.changeAmount, 0)

  if (recentGains > 10_000) {
    flags.push({
      type: 'rapid_gold_gain',
      severity: 'high',
      message: `Rapid gold gain detected: ${recentGains} gold in the last hour`,
    })
  }

  // Check for rapid gold spending (> 5,000 in 10 minutes)
  const tenMinAgo = new Date(Date.now() - 600_000).toISOString()
  const recentSpending = recentLedgerEntries
    .filter(e => e.changeAmount < 0 && e.createdAt > tenMinAgo)
    .reduce((sum, e) => sum + Math.abs(e.changeAmount), 0)

  if (recentSpending > 5_000) {
    flags.push({
      type: 'rapid_gold_spend',
      severity: 'medium',
      message: `Rapid gold spending detected: ${recentSpending} gold in the last 10 minutes`,
    })
  }

  // Check for excessive purchases (> 5 in 1 minute)
  const oneMinAgo = new Date(Date.now() - 60_000).toISOString()
  const recentPurchases = recentLedgerEntries.filter(
    e => e.sourceType === 'shop_purchase' && e.createdAt > oneMinAgo,
  ).length

  if (recentPurchases > 5) {
    flags.push({
      type: 'suspicious_pattern',
      severity: 'medium',
      message: `Excessive purchases: ${recentPurchases} in the last minute`,
    })
  }

  // Check for negative balance
  if (currentBalance < 0) {
    flags.push({
      type: 'suspicious_pattern',
      severity: 'high',
      message: `Negative balance detected: ${currentBalance}`,
    })
  }

  return flags
}

/**
 * Clean up expired rate limit entries.
 * Should be called periodically.
 */
export function cleanupRateLimits() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    const config = RATE_LIMITS[key.split(':')[1]]
    if (config && now - entry.windowStart > config.windowMs) {
      rateLimitStore.delete(key)
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 300_000)
}
