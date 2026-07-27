export type ErrorCode =
  | 'AUTH_REQUIRED'
  | 'ACCESS_DENIED'
  | 'VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'INSUFFICIENT_ENERGY'
  | 'INSUFFICIENT_GOLD'
  | 'INSUFFICIENT_CRYSTALS'
  | 'ACTIVITY_NOT_READY'
  | 'REWARD_ALREADY_CLAIMED'
  | 'ITEM_NOT_OWNED'
  | 'ITEM_EQUIPPED'
  | 'FEATURE_DISABLED'
  | 'MAINTENANCE_MODE'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'SUBSCRIPTION_EXPIRED'
  | 'CHARACTER_NOT_FOUND'
  | 'CLAN_FULL'
  | 'ALREADY_IN_CLAN'
  | 'NOT_IN_CLAN'
  | 'DAILY_LIMIT_REACHED'
  | 'COOLDOWN_ACTIVE'
  | 'LEVEL_TOO_LOW'
  | 'BLACKLISTED'
  | 'BETA_ACCESS_REQUIRED'
  | 'INTERNAL_ERROR'

type LogLevel = 'info' | 'warn' | 'error' | 'fatal'

const ERROR_MAP: Record<ErrorCode, { message: string; status: number; logLevel: LogLevel }> = {
  AUTH_REQUIRED: { message: 'Prihlásenie je povinné.', status: 401, logLevel: 'warn' },
  ACCESS_DENIED: { message: 'Nemáš oprávnenie na túto akciu.', status: 403, logLevel: 'warn' },
  VALIDATION_FAILED: { message: 'Neplatné údaje.', status: 400, logLevel: 'warn' },
  RATE_LIMITED: { message: 'Príliš veľa požiadaviek. Skús to znova.', status: 429, logLevel: 'warn' },
  INSUFFICIENT_ENERGY: { message: 'Nedostatok energie.', status: 400, logLevel: 'warn' },
  INSUFFICIENT_GOLD: { message: 'Nedostatok zlata.', status: 400, logLevel: 'warn' },
  INSUFFICIENT_CRYSTALS: { message: 'Nedostatok kryštálov.', status: 400, logLevel: 'warn' },
  ACTIVITY_NOT_READY: { message: 'Aktivita ešte nie je dokončená.', status: 400, logLevel: 'warn' },
  REWARD_ALREADY_CLAIMED: { message: 'Odmena už bola prevzatá.', status: 400, logLevel: 'warn' },
  ITEM_NOT_OWNED: { message: 'Predmet nevlastníš.', status: 400, logLevel: 'warn' },
  ITEM_EQUIPPED: { message: 'Predmet je equipnutý.', status: 400, logLevel: 'warn' },
  FEATURE_DISABLED: { message: 'Táto funkcia je momentálne vypnutá.', status: 403, logLevel: 'info' },
  MAINTENANCE_MODE: { message: 'Prebieha údržba. Skús to neskôr.', status: 503, logLevel: 'info' },
  PAYMENT_PENDING: { message: 'Platba sa spracúva.', status: 409, logLevel: 'info' },
  PAYMENT_FAILED: { message: 'Platba zlyhala.', status: 402, logLevel: 'error' },
  PAYMENT_REFUNDED: { message: 'Platba bola vrátená.', status: 400, logLevel: 'info' },
  SUBSCRIPTION_EXPIRED: { message: 'Predplatné vypršalo.', status: 402, logLevel: 'info' },
  CHARACTER_NOT_FOUND: { message: 'Postava nenájdená.', status: 404, logLevel: 'warn' },
  CLAN_FULL: { message: 'Klan je plný.', status: 400, logLevel: 'warn' },
  ALREADY_IN_CLAN: { message: 'Už si členom klanu.', status: 400, logLevel: 'warn' },
  NOT_IN_CLAN: { message: 'Nie si členom klanu.', status: 400, logLevel: 'warn' },
  DAILY_LIMIT_REACHED: { message: 'Denný limit dosiahnutý.', status: 429, logLevel: 'warn' },
  COOLDOWN_ACTIVE: { message: 'Musíš počkať pred ďalšou akciou.', status: 429, logLevel: 'warn' },
  LEVEL_TOO_LOW: { message: 'Nedostatočná úroveň.', status: 400, logLevel: 'warn' },
  BLACKLISTED: { message: 'Prístup zamietnutý.', status: 403, logLevel: 'warn' },
  BETA_ACCESS_REQUIRED: { message: 'Potrebuješ prístup k bete.', status: 403, logLevel: 'warn' },
  INTERNAL_ERROR: { message: 'Nastala interná chyba.', status: 500, logLevel: 'fatal' },
}

export class AppError extends Error {
  code: ErrorCode
  status: number
  logLevel: LogLevel
  requestId?: string
  
  constructor(code: ErrorCode, requestId?: string, cause?: Error) {
    const config = ERROR_MAP[code]
    super(config.message)
    this.name = 'AppError'
    this.code = code
    this.status = config.status
    this.logLevel = config.logLevel
    this.requestId = requestId
    if (cause) this.cause = cause
  }
  
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        requestId: this.requestId,
      },
    }
  }
}

export function getErrorStatus(code: ErrorCode): number {
  return ERROR_MAP[code].status
}

export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MAP[code].message
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function toAppError(error: unknown, requestId?: string): AppError {
  if (error instanceof AppError) {
    if (requestId) error.requestId = requestId
    return error
  }
  if (error instanceof Error) {
    return new AppError('INTERNAL_ERROR', requestId, error)
  }
  return new AppError('INTERNAL_ERROR', requestId)
}
