import * as Sentry from '@sentry/nextjs'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.APP_ENV || 'development',
    release: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    tracesSampleRate: process.env.APP_ENV === 'production' ? 0.05 : 1.0,
  })
}
