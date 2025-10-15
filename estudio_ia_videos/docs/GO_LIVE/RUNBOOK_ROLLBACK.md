
# 🔄 ROLLBACK RUNBOOK

**Emergency procedures for production rollback**

---

## 🚨 WHEN TO ROLLBACK

### Immediate Rollback (No Questions Asked)
1. **Critical Security Breach**
   - SQL injection detected
   - XSS vulnerability exploited
   - Data leak identified

2. **Complete Service Outage**
   - Homepage returning 500
   - Database connection failures
   - Redis completely down

3. **Data Corruption**
   - User data being corrupted
   - Files being deleted unexpectedly
   - Database integrity issues

### Conditional Rollback (Assess First)
1. **High Error Rate**
   - Error rate > 5% for 5+ minutes
   - Sentry critical alerts (> 10/min)
   - Health check failing intermittently

2. **Performance Degradation**
   - Response time p95 > 5s
   - LCP > 10s
   - CDN HIT rate < 20%

3. **Feature Malfunction**
   - Upload failing > 20%
   - TTS generation failing > 30%
   - Render pipeline stuck

---

## 🛠️ ROLLBACK PROCEDURES

### Method 1: Git Revert (Preferred)
**Duration**: ~10 minutes  
**Risk**: Low

```bash
# 1. Identify problematic commit
git log --oneline -10

# 2. Revert commit
git revert <commit-sha>
git push origin main

# 3. CI/CD will auto-deploy to staging
# Wait for staging verification

# 4. Merge to production
git checkout production
git merge main
git push origin production

# 5. Monitor deployment
watch -n 5 'curl -s https://treinx.abacusai.app/api/health | jq'
```

### Method 2: Tag Rollback
**Duration**: ~5 minutes  
**Risk**: Low

```bash
# 1. List recent releases
git tag -l "v*" --sort=-version:refname | head -10

# 2. Checkout stable version
git checkout v3.9.0

# 3. Create rollback branch
git checkout -b rollback/v3.9.0
git push origin rollback/v3.9.0

# 4. Fast-forward production
git checkout production
git reset --hard v3.9.0
git push origin production --force

# 5. Verify
curl https://treinx.abacusai.app/api/health
```

### Method 3: Infrastructure Rollback (Vercel/Railway)
**Duration**: ~2 minutes  
**Risk**: Very Low

#### Vercel
```bash
# 1. List deployments
vercel ls

# 2. Rollback to specific deployment
vercel rollback <deployment-url>

# 3. Verify
vercel inspect <deployment-url>
```

#### Railway
```bash
# 1. List deployments
railway deployments

# 2. Rollback
railway rollback <deployment-id>

# 3. Verify
railway logs
```

### Method 4: Database Rollback (If Needed)
**Duration**: Variable  
**Risk**: HIGH - Use with caution

```bash
# 1. Identify migration to rollback to
npx prisma migrate status

# 2. Rollback migration
npx prisma migrate resolve --rolled-back <migration-name>

# 3. Re-apply if needed
npx prisma migrate deploy

# 4. Verify data integrity
npx prisma studio
```

---

## 📋 ROLLBACK CHECKLIST

### Pre-Rollback
- [ ] Confirm rollback is necessary
- [ ] Identify root cause (if possible, quick)
- [ ] Notify team (Slack/Discord)
- [ ] Take snapshot of current state (logs, metrics)
- [ ] Identify target rollback version

### During Rollback
- [ ] Execute rollback procedure
- [ ] Monitor deployment progress
- [ ] Watch error rates in Sentry
- [ ] Check health endpoint
- [ ] Verify core functionality

### Post-Rollback
- [ ] Confirm service is stable
- [ ] Update status page
- [ ] Notify stakeholders
- [ ] Document incident
- [ ] Schedule post-mortem
- [ ] Create hotfix if needed

---

## 🔍 VERIFICATION STEPS

### 1. Health Check
```bash
curl https://treinx.abacusai.app/api/health | jq
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": "...",
  "checks": {
    "redis": { "healthy": true },
    "database": { "healthy": true },
    "memory": { "healthy": true }
  }
}
```

### 2. Smoke Tests
```bash
# Homepage
curl -I https://treinx.abacusai.app
# Expected: 200 OK

# API
curl https://treinx.abacusai.app/api/projects
# Expected: 200 OK (or 401 if auth required)

# Metrics
curl https://treinx.abacusai.app/api/metrics | jq '.uptime'
# Expected: Number (seconds)
```

### 3. Error Rate
```bash
# Check Sentry dashboard
# Expected: < 1% error rate
```

### 4. Performance
```bash
# Run Lighthouse
npx lighthouse https://treinx.abacusai.app --view
# Expected: Performance score > 80
```

---

## 🚦 MONITORING DURING ROLLBACK

### Key Metrics to Watch
```bash
# 1. Error rate
watch -n 5 'curl -s https://treinx.abacusai.app/api/metrics | jq ".custom.http_errors"'

# 2. Response time
watch -n 5 'curl -s https://treinx.abacusai.app/api/metrics | jq ".custom.http_request_duration"'

# 3. Active connections
watch -n 5 'curl -s https://treinx.abacusai.app/api/health | jq ".checks.redis"'
```

### Sentry Dashboard
1. Open: https://sentry.io/organizations/your-org/projects/estudio-ia-videos/
2. Check:
   - Error frequency graph
   - New issues
   - Performance metrics

### Logs
```bash
# Production logs (if accessible)
tail -f /var/log/app/production.log | grep ERROR

# Or via kubectl (if Kubernetes)
kubectl logs -f deployment/app --tail=100

# Or via cloud provider
# AWS CloudWatch, GCP Logs, Azure Monitor, etc.
```

---

## 📊 SUCCESS CRITERIA

### Rollback is Successful When:
- ✅ Health check returning 200 OK consistently
- ✅ Error rate < 1% for 5+ minutes
- ✅ Response time p95 < 1s
- ✅ No critical errors in Sentry
- ✅ Core features working (manual verification)
- ✅ User reports stopped/decreased

### Partial Success (Needs Investigation):
- ⚠️ Some features degraded but core working
- ⚠️ Error rate improved but not ideal (1-3%)
- ⚠️ Performance better but not optimal

### Rollback Failed (Emergency):
- ❌ Error rate > 5%
- ❌ Health check failing
- ❌ New critical errors appearing
- ❌ Service still down

**Next Step**: Escalate to senior team, consider complete infrastructure restart

---

## 🚨 EMERGENCY CONTACTS

### Level 1: First Response
- **On-Call Engineer**: [Phone/Slack]
- **Tech Lead**: [Phone/Slack]

### Level 2: Escalation
- **CTO**: [Phone]
- **DevOps Lead**: [Phone/Slack]

### Level 3: Critical
- **CEO**: [Phone] (for security breaches, data loss)
- **Legal**: [Phone] (for LGPD/GDPR incidents)

### External
- **Cloud Provider Support**: [Number]
- **CDN Provider Support**: [Number]
- **Database Provider Support**: [Number]

---

## 📝 INCIDENT TEMPLATE

```markdown
# Incident Report: [DATE] - [BRIEF DESCRIPTION]

## Timeline
- **Detection**: [Time]
- **Rollback Decision**: [Time]
- **Rollback Started**: [Time]
- **Rollback Completed**: [Time]
- **Service Restored**: [Time]

## Impact
- **Duration**: [X minutes/hours]
- **Affected Users**: [Estimate or exact]
- **Affected Features**: [List]
- **Data Loss**: [Yes/No - Details]

## Root Cause
[Description of what caused the issue]

## Resolution
[What was done to fix it]

## Prevention
[What will be done to prevent this in the future]

## Action Items
- [ ] [Action 1 - Assignee]
- [ ] [Action 2 - Assignee]
- [ ] Schedule post-mortem
```

---

## 🔄 POST-ROLLBACK ACTIONS

### Immediate (Within 1 hour)
1. [ ] Verify all core features working
2. [ ] Monitor error rates for stability
3. [ ] Update status page/blog if public incident
4. [ ] Notify affected users (if applicable)

### Short-term (Within 24 hours)
1. [ ] Document incident details
2. [ ] Create Jira ticket for root cause
3. [ ] Plan hotfix or next steps
4. [ ] Update runbooks if needed

### Long-term (Within 1 week)
1. [ ] Conduct post-mortem meeting
2. [ ] Implement preventive measures
3. [ ] Update tests to catch similar issues
4. [ ] Review deployment process

---

## 🎓 LESSONS LEARNED

### Common Rollback Causes (Historical)
1. **Uncaught exceptions** → Solution: Better error handling + tests
2. **Database migration issues** → Solution: Migration staging + validation
3. **Third-party API changes** → Solution: API version pinning + monitoring
4. **Configuration errors** → Solution: Config validation + dry-run
5. **Memory leaks** → Solution: Load testing + profiling

### Best Practices
- ✅ Always test in staging first
- ✅ Use feature flags for risky changes
- ✅ Deploy during low-traffic windows
- ✅ Have rollback plan before deployment
- ✅ Monitor for at least 1 hour post-deploy

---

**Last Updated**: 2025-10-02  
**Version**: 1.0  
**Next Review**: Sprint 32
