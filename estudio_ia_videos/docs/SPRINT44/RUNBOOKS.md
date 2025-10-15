
# 📖 Sprint 44 - Operational Runbooks

## Voice Cloning Operations

### Create Custom Voice
1. User uploads 3-5 audio samples (30s+ each)
2. System validates samples
3. Sends to ElevenLabs API
4. Polls training status (mock: instant, real: 10-30min)
5. Stores voiceId in database
6. User can preview and apply to projects

**Troubleshooting**:
- Sample quality issues → Ask user to re-record
- Training timeout → Check ElevenLabs status page
- Preview fails → Verify TTS service endpoint

### Delete Custom Voice
```bash
curl -X DELETE https://api.elevenlabs.io/v1/voices/{voiceId} \
  -H "xi-api-key: $ELEVENLABS_API_KEY"
```

## Compliance Operations

### Run Compliance Check
1. Fetch project content from database
2. Load NR template matching project type
3. Run validation rules (150+ checks)
4. Calculate score
5. Generate issues list with suggestions
6. Cache result (5min TTL)
7. Return to user

**Key Metrics**:
- Score threshold: 70% = acceptable
- Critical issues: block publish
- Cache hit rate: ~80%

### Generate Compliance Report
PDF generation with:
- Executive summary
- Detailed findings
- Recommendations
- Compliance history

**Performance**:
- Generation time: 2-5s
- Max file size: 5MB

## Collaboration Operations

### Real-Time Presence
1. User joins project → Socket.IO `join-project` event
2. Server adds to room `project:{projectId}`
3. Broadcast `user-joined` to others
4. Track cursor movements (throttled to 100ms)
5. On disconnect → Cleanup and notify

**Capacity**:
- Max users per project: 50
- Message rate: 10/second per user

### Comment Thread Management
- Create comment → Broadcast to room
- @mention → Send notification
- Resolve thread → Update status
- Delete comment → Soft delete (audit trail)

## Certificate Operations

### Mint Certificate (Testnet)
1. Validate project completion
2. Prepare metadata JSON
3. Call smart contract mint()
4. Wait for transaction confirmation
5. Store tokenId + txHash in DB
6. Generate QR code for verification

**Blockchain Details**:
- Network: Polygon Amoy Testnet
- Gas cost: ~0.001 MATIC
- Confirmation: 2 blocks (~5s)

### Verify Certificate
1. Fetch tokenId from QR/URL
2. Query smart contract
3. Check owner + metadata
4. Display validity status

**Public Verification**:
```
https://treinx.abacusai.app/api/certificates/verify?tokenId=12345
```

## Review Workflow Operations

### States
- **Draft**: Editable, no review
- **Review**: Locked, awaiting approval
- **Approved**: Ready to publish
- **Rejected**: Back to draft with feedback
- **Published**: Live, immutable

### Request Review
1. User clicks "Request Review"
2. Select reviewers (1-5)
3. Project locked (status → review)
4. Notification sent to reviewers
5. Comments thread opened

### Approve/Reject
**Approve**:
- Reviewer adds mandatory comment
- Status → approved
- Project unlocked
- Notification sent to author

**Reject**:
- Reviewer adds mandatory comment
- Status → draft
- Project unlocked
- Author must fix issues

### Publish
Pre-flight checks:
1. Status = approved? ✓
2. Compliance passed? ✓ (or override)
3. No critical issues? ✓

If all pass → Status = published

## Incident Response

### High Error Rate (Sentry Alert)
1. Check Sentry dashboard for patterns
2. Identify module via tags
3. Check recent deployments
4. If critical → Rollback

### WebSocket Server Down
1. Restart Socket.IO server
2. Check Redis connectivity
3. Verify port 3000 not blocked
4. Force reconnect clients (refresh)

### Blockchain Transaction Failed
1. Check wallet MATIC balance
2. Verify RPC endpoint responsive
3. Retry with higher gas limit
4. If testnet down → Wait or switch RPC

### Cache Miss Storm (Redis)
1. Check Redis health
2. Verify connection pool not exhausted
3. Increase TTL if appropriate
4. Monitor cache hit rate

## Rollback Procedure

### Manual Rollback
```bash
./scripts/rollback.sh
```

### Automated (CI/CD)
Triggers on:
- Health check fail (3 consecutive)
- Smoke test failure
- Error rate > 5% in 5min

Process:
1. Switch LB to BLUE
2. Scale down GREEN
3. Post-rollback health check
4. Slack notification

## Maintenance

### Clear Redis Cache
```bash
redis-cli -h localhost -p 6379 FLUSHDB
```

### Regenerate Prisma Client
```bash
yarn prisma generate
```

### Database Migration
```bash
yarn prisma migrate dev --name sprint44
yarn prisma migrate deploy  # production
```

### Backup Certificates
```bash
# Export from DB
yarn ts-node scripts/export-certificates.ts

# Store metadata + txHash for recovery
```

## Monitoring Checklist

Daily:
- [ ] Check Sentry errors
- [ ] Review rate limit hits
- [ ] Verify backup completed
- [ ] Check disk space

Weekly:
- [ ] Review audit logs
- [ ] Analyze E2E test trends
- [ ] Update dependencies
- [ ] Performance review

Monthly:
- [ ] Rotate secrets
- [ ] Compliance audit
- [ ] Cost optimization
- [ ] Capacity planning
