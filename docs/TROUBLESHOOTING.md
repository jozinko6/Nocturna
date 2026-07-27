# Troubleshooting

## Common Issues

### "Invalid environment variables" error
**Cause**: Missing or incorrect env vars
**Fix**: Copy `.env.template` to `.env.local` and fill in all values

### Database connection refused
**Cause**: PostgreSQL not running or wrong URL
**Fix**:
1. Check `DATABASE_URL` in `.env.local`
2. Ensure PostgreSQL is running
3. Run `npx drizzle-kit push` to sync schema

### "Module not found" errors
**Cause**: Dependencies not installed
**Fix**: `rm -rf node_modules && npm install`

### Build fails with TypeScript errors
**Cause**: Type errors in source
**Fix**:
1. Run `npx tsc --noEmit` to see errors
2. Fix type issues
3. Rebuild

### Stripe webhook not receiving events
**Cause**: Wrong webhook URL or secret
**Fix**:
1. Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Ensure webhook URL is `https://your-domain.com/api/webhooks/stripe`
3. Test with `stripe trigger payment_intent.succeeded`

### Sentry not capturing errors
**Cause**: DSN not configured
**Fix**:
1. Set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`
2. Ensure Sentry project is created
3. Deploy to trigger first error

### Performance issues
**Diagnosis**:
1. Check health endpoints for latency
2. Review Sentry performance traces
3. Check database query performance in Supabase
4. Monitor Redis memory usage

### Maintenance mode stuck
**Cause**: `MAINTENANCE_MODE` env var set to `full` or `read-only`
**Fix**: Set `MAINTENANCE_MODE=off` and redeploy

## Debug Mode
Set `APP_ENV=development` for verbose logging and debug features.

## Getting Help
- Check existing GitHub Issues
- Search documentation
- Ask in Discord community
