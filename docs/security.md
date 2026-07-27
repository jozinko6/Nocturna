# Security Policy

## Architecture Principles
- **Server-authoritative**: Client never decides combat, rewards, or economy
- **Zod validation**: All inputs validated at action boundaries
- **RLS policies**: Row-Level Security on all Supabase tables
- **Rate limiting**: Global and per-user limits on all endpoints
- **Audit logging**: All mutations logged with request IDs

## Authentication
- Supabase Auth with email/password
- JWT tokens with short expiry (1 hour)
- Secure HTTP-only cookies
- CSRF protection via SameSite cookies

## Authorization
- User roles: `user`, `moderator`, `admin`
- Admin endpoints require `role = 'admin'` in users table
- Moderation actions require `role IN ('moderator', 'admin')`

## Input Validation
All server actions validate with Zod schemas before processing.
Malformed input returns `VALIDATION_FAILED` error.

## Rate Limits
| Endpoint Type | Global/User | Burst |
|--------------|-------------|-------|
| Auth actions | 5/min | 3 |
| Game actions | 30/min | 10 |
| Social actions | 20/min | 5 |
| Payment webhooks | 100/min | 50 |

## Data Protection
- PII encrypted at rest (Supabase default)
- GDPR compliance: data export + deletion via `src/game/gdpr.ts`
- No payment data stored locally — Stripe handles all card data
- API keys never exposed to client

## Vulnerability Reporting
Report security issues to: security@nocturna.game
Do NOT open public GitHub issues for security vulnerabilities.

## Security Headers
Configured in `src/middleware.ts`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security: max-age=63072000
- Content-Security-Policy: restrictive policy
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: minimal permissions
