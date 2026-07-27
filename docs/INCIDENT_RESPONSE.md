# Incident Response Playbook

## Severity Levels
| Level | Description | Response Time |
|-------|-------------|---------------|
| P0 | Complete outage, data loss | Immediate |
| P1 | Major feature broken | <1 hour |
| P2 | Minor feature broken | <4 hours |
| P3 | Cosmetic/low impact | <24 hours |

## Incident Response Steps

### 1. Detect
- Sentry alerts trigger
- Health endpoint failures
- User reports

### 2. Triage
- Assess severity (P0-P3)
- Determine scope (all users vs subset)
- Check for data integrity issues

### 3. Mitigate
**For P0/P1 issues:**
1. Enable maintenance mode: `MAINTENANCE_MODE=full`
2. Or deploy previous working version
3. Communicate status on status page

**For payment issues:**
1. Check Stripe dashboard
2. Review webhook logs
3. Verify Stripe secret key

**For database issues:**
1. Check connection pool
2. Review slow queries
3. Check for deadlocks

### 4. Resolve
- Fix root cause
- Deploy fix
- Monitor for recurrence

### 5. Communicate
- Update status page
- Notify affected users
- Post-mortem for P0/P1

## Emergency Commands
```bash
# Enable maintenance mode
MAINTENANCE_MODE=full

# Check health
curl https://your-domain.com/api/health/admin

# Review recent errors
# Check Sentry dashboard

# Check job queue
# Query background_jobs table
```

## Rollback Procedure
1. Vercel: Revert to previous deployment
2. Git: `git revert HEAD && git push`
3. Database: Schema is additive only, no rollback needed
4. Stripe: Void/refund affected transactions
