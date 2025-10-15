
# 🚀 Sprint 44 - Technical Documentation

## Overview
Sprint 44 delivers production-ready UI components, real service integrations, comprehensive E2E testing, review workflow, and CI/CD with blue-green deployment.

## Architecture

### New Components
- **Compliance Panel**: Real-time NR compliance validation with PDF reports
- **Voice Wizard**: Guided flow for custom voice creation (ElevenLabs)
- **Collaboration Cursors**: Real-time presence and cursor tracking (Socket.IO)

### Services Integration
- **ElevenLabs**: Voice cloning and custom TTS
- **Polygon (Amoy Testnet)**: Blockchain certificate minting
- **Redis**: TTS audio cache, compliance results cache
- **Sentry**: Error tracking and performance monitoring

## Setup

### 1. Environment Variables
```bash
# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# ElevenLabs
ELEVENLABS_API_KEY=sk_...

# Azure Speech (fallback)
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=brazilsouth

# Sentry
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production

# Polygon Testnet
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
WALLET_PRIVATE_KEY=0x...
CERTIFICATE_CONTRACT_ADDRESS=0x...
```

### 2. Install Dependencies
```bash
yarn install
yarn prisma generate
```

### 3. Run Development
```bash
yarn dev
```

### 4. Run E2E Tests
```bash
# All browsers
yarn playwright test

# Specific browser
yarn playwright test --project=chromium

# Smoke tests only
yarn playwright test tests/e2e/smoke.spec.ts

# Generate HTML report
yarn playwright show-report qa/artifacts/html-report
```

## API Endpoints

### Voice Cloning
- `POST /api/voice/create` - Create custom voice (multipart)
- `GET /api/voice/status?jobId=xxx` - Check training status
- `POST /api/voice/preview` - Generate TTS preview

### Certificates
- `POST /api/certificates/mint` - Mint certificate on-chain
- `GET /api/certificates/verify?tokenId=xxx` - Verify certificate
- `GET /api/certificates/verify?tokenId=xxx&format=qr` - Get QR code

### Compliance
- `POST /api/compliance/check` - Run compliance validation
- `GET /api/compliance/check?projectId=xxx` - Get latest result
- `POST /api/compliance/report` - Generate PDF report

### Workflow
- `POST /api/workflow/request-review` - Request project review
- `POST /api/workflow/approve` - Approve project
- `POST /api/workflow/reject` - Reject project
- `POST /api/workflow/publish` - Publish project
- `GET /api/workflow/history?projectId=xxx` - Review history

### Security
- `GET /api/user/export-data` - Export user data (LGPD)
- `DELETE /api/user/delete-account` - Delete account (LGPD)

## Deployment

### Manual Deploy
```bash
# Build
yarn build

# Blue-Green deploy
./scripts/deploy-blue-green.sh production

# Rollback if needed
./scripts/rollback.sh
```

### CI/CD Pipeline
Automated deployment via GitHub Actions on push to `main`:
1. Build & TypeScript check
2. E2E tests (Chromium, Firefox, WebKit, Mobile)
3. Deploy to Staging
4. Smoke tests on Staging
5. Deploy GREEN (new version)
6. Health checks
7. Switch traffic (Blue → Green)
8. Auto-rollback on failure

## Rate Limits
- Voice creation: 5/hour
- Compliance check: 20/minute
- Certificate mint: 10/hour
- Default: 100/minute

## Monitoring

### Health Check
```bash
curl https://treinx.abacusai.app/api/health
```

### Sentry Dashboard
- Module tags: `compliance`, `voice`, `collab`, `cert`, `editor`
- Release tracking with source maps
- Real-time error alerts

## Troubleshooting

### Redis Connection Issues
Cache is optional - system works without Redis (logs warning).

### ElevenLabs API Errors
- Check `ELEVENLABS_API_KEY` is valid
- Verify rate limits not exceeded
- Sample audio must be > 30s, high quality

### Blockchain Testnet
- Amoy testnet faucet: https://faucet.polygon.technology/
- Explorer: https://amoy.polygonscan.com/
- Ensure wallet has test MATIC for gas

### WebSocket Not Connecting
- Verify Socket.IO server running
- Check CORS configuration
- Browser console for connection errors

## Testing

### Run All Tests
```bash
yarn playwright test
```

### Test Coverage
- ✅ Compliance: validate, report, block publish
- ✅ Voice: create, train, preview, apply
- ✅ Collaboration: presence, cursors, comments
- ✅ Certificates: mint, verify, QR code

### Test Artifacts
- Videos: `qa/artifacts/videos/`
- Screenshots: `qa/artifacts/screenshots/`
- HTML report: `qa/artifacts/html-report/`
- Trace viewer: `qa/artifacts/traces/`

## Support
- Docs: `/docs/SPRINT44/`
- Runbooks: `/docs/SPRINT44/RUNBOOKS.md`
- Issues: GitHub Issues
