# Deployment Guide

## Prerequisites
- Node.js v22+
- PostgreSQL 16+ (or Supabase)
- Redis (Upstash recommended)
- Stripe account (for payments)

## Environment Variables
Copy `.env.template` to `.env.local` and fill in all required values.

## Production Build
```bash
npm run build
npm start
```

## Database Setup
```bash
npx drizzle-kit push        # Push schema
npx tsx scripts/seed-data.ts  # Optional: seed demo data
```

## Vercel Deployment
1. Connect repository to Vercel
2. Set all environment variables in Vercel dashboard
3. Deploy — automatic on push to `main`

## Manual Deployment
```bash
npm run build
NODE_ENV=production node .next/standalone/server.js
```

## Pre-deployment Checklist
- [ ] All env vars set
- [ ] Database migrations run
- [ ] Sentry configured
- [ ] Stripe webhooks configured
- [ ] Health endpoints responding
- [ ] Smoke tests pass: `bash scripts/smoke-test.sh https://nocturna.game`

## Rollback
If issues detected post-deploy:
1. Revert to previous Vercel deployment
2. Or: `git revert HEAD && git push`
3. Database schema is additive only — no rollback needed
