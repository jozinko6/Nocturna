export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogContext {
  requestId?: string
  traceId?: string
  userId?: string
  characterId?: string
  clanId?: string
  action?: string
  result?: string
  duration?: number
  errorCode?: string
  environment?: string
  releaseId?: string
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context: LogContext
  error?: { name: string; message: string; stack?: string }
}

const REDACTION_PATTERNS: [RegExp, string][] = [
  [/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL_REDACTED]'],
  [/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]'],
  [/sk_live_[a-zA-Z0-9]+/g, '[STRIPE_KEY_REDACTED]'],
  [/pk_live_[a-zA-Z0-9]+/g, '[STRIPE_KEY_REDACTED]'],
  [/Bearer\s+[a-zA-Z0-9._-]+/g, 'Bearer [TOKEN_REDACTED]'],
]

function redactSensitive(text: string): string {
  let result = text
  for (const [pattern, replacement] of REDACTION_PATTERNS) {
    result = result.replace(pattern, replacement)
  }
  return result
}

function formatEntry(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`
  const ctx = Object.entries(entry.context)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ')
  const ctxStr = ctx ? ` ${ctx}` : ''
  const errStr = entry.error ? ` error=${entry.error.name}:${entry.error.message}` : ''
  return redactSensitive(`${base}${ctxStr}${errStr}`)
}

const GLOBAL_CONTEXT: LogContext = {}

export function setGlobalContext(ctx: Partial<LogContext>) {
  Object.assign(GLOBAL_CONTEXT, ctx)
}

export function clearGlobalContext() {
  Object.keys(GLOBAL_CONTEXT).forEach(k => delete (GLOBAL_CONTEXT as any)[k])
}

function log(level: LogLevel, message: string, context: LogContext = {}, error?: Error) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: { ...GLOBAL_CONTEXT, ...context },
    error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined,
  }
  
  const formatted = formatEntry(entry)
  
  switch (level) {
    case 'debug': console.debug(formatted); break
    case 'info': console.info(formatted); break
    case 'warn': console.warn(formatted); break
    case 'error':
    case 'fatal': console.error(formatted); break
  }
  
  if (typeof window !== 'undefined') return
  try {
    if (process.env.SENTRY_DSN && (level === 'error' || level === 'fatal')) {
      const Sentry = require('@sentry/nextjs')
      Sentry.captureException(error || new Error(message), { extra: context })
    }
  } catch {}
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => log('debug', msg, ctx),
  info: (msg: string, ctx?: LogContext) => log('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext, error?: Error) => log('error', msg, ctx, error),
  fatal: (msg: string, ctx?: LogContext, error?: Error) => log('fatal', msg, ctx, error),
  
  child: (baseContext: LogContext) => ({
    debug: (msg: string, ctx?: LogContext) => log('debug', msg, { ...baseContext, ...ctx }),
    info: (msg: string, ctx?: LogContext) => log('info', msg, { ...baseContext, ...ctx }),
    warn: (msg: string, ctx?: LogContext) => log('warn', msg, { ...baseContext, ...ctx }),
    error: (msg: string, ctx?: LogContext, error?: Error) => log('error', msg, { ...baseContext, ...ctx }, error),
    fatal: (msg: string, ctx?: LogContext, error?: Error) => log('fatal', msg, { ...baseContext, ...ctx }, error),
  }),
}

export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
