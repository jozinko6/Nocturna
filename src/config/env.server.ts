import { z } from 'zod'

const serverEnvSchema = z.object({
  // Core
  APP_ENV: z.enum(['development', 'preview', 'staging', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().url().optional(),
  POSTGRES_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),

  // Redis (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // PostHog
  POSTHOG_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().url().default('https://eu.posthog.com'),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Auth
  CRON_SECRET: z.string().min(16).optional(),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),

  // Maintenance
  MAINTENANCE_MODE: z.enum(['off', 'read-only', 'full']).default('off'),
}).superRefine((env, ctx) => {
  if (!env.DATABASE_URL && !env.POSTGRES_URL) {
    ctx.addIssue({
      code: 'custom',
      path: ['DATABASE_URL'],
      message: 'DATABASE_URL or POSTGRES_URL is required',
    })
  }
}).transform((env) => ({
  ...env,
  DATABASE_URL: env.DATABASE_URL ?? env.POSTGRES_URL!,
}))

export type ServerEnv = z.infer<typeof serverEnvSchema>

function validateServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env)

  if (!result.success) {
    const issues = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`)
    throw new Error(`Invalid server environment variables:\n${issues.join('\n')}`)
  }

  if (
    !result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    !result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      'Invalid server environment variables:\n  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Required'
    )
  }

  return result.data
}

let _env: ServerEnv | null = null

export function getServerEnv(): ServerEnv {
  if (_env) return _env
  _env = validateServerEnv()
  return _env
}

export function isProduction(): boolean {
  return getServerEnv().APP_ENV === 'production'
}

export function isStaging(): boolean {
  return getServerEnv().APP_ENV === 'staging'
}

export function isMaintenanceMode(): boolean {
  return getServerEnv().MAINTENANCE_MODE !== 'off'
}

export function isReadOnlyMode(): boolean {
  return getServerEnv().MAINTENANCE_MODE === 'read-only'
}
