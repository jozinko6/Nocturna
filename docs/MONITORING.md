# Monitoring & Alerting

## Health Endpoints
- `/api/health/liveness` — Process alive check (200 = OK)
- `/api/health/readiness` — Full dependency check (DB, Redis)
- `/api/health/admin` — Admin-only detailed health (requires auth + admin role)

## Sentry (Error Tracking)
- Client: `src/sentry.client.config.ts`
- Server: `src/sentry.server.config.ts`
- Edge: `src/sentry.edge.config.ts`

### Alert Rules
| Alert | Condition | Severity |
|-------|-----------|----------|
| Spike in errors | >50 errors/min | Critical |
| New error type | First occurrence | Warning |
| Payment failures | Any stripe error | Critical |
| Auth failures | >10 failed logins/min | Warning |

## PostHog (Analytics)
- Key events tracked via `src/game/analytics.ts`
- Dashboard: https://eu.posthog.com/project/YOUR_PROJECT

### Key Metrics
- DAU/MAU ratio
- Training completion rate
- Expedition success rate
- PvP win rate distribution
- Payment conversion rate
- Session duration

## Database Monitoring
Track via Supabase dashboard:
- Query performance (pg_stat_statements)
- Connection pool usage
- Table bloat
- Index usage

## Redis Monitoring
Track via Upstash dashboard:
- Memory usage
- Command latency
- Connection count

## Uptime Monitoring
Configure external monitoring (e.g., UptimeRobot, BetterStack) for:
- `/api/health/liveness` — check every 1 minute
- Homepage — check every 5 minutes
