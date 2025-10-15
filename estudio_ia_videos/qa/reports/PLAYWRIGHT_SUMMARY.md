
# 🎭 Playwright E2E Testing - Sprint 44

## Test Matrix

| Suite | Chromium | Firefox | WebKit | Mobile Chrome | Mobile Safari | Total |
|-------|----------|---------|--------|---------------|---------------|-------|
| Compliance | 5 | 5 | 5 | 5 | 5 | 25 |
| Voice | 5 | 5 | 5 | 5 | 5 | 25 |
| Collaboration | 4 | 4 | 4 | 2* | 2* | 16 |
| Certificates | 4 | 4 | 4 | 4 | 4 | 20 |
| Smoke | 5 | 5 | 5 | 5 | 5 | 25 |
| **TOTAL** | **23** | **23** | **23** | **21** | **21** | **111** |

*Mobile: collaboration cursors limited functionality

## Coverage

### ✅ Compliance Tests
1. Validate project compliance (OK)
2. Validate project compliance (NOK)
3. Generate PDF report
4. Block publish on fail
5. Override and publish

### ✅ Voice Tests
1. Create custom voice
2. Preview voice
3. Apply voice to project
4. List available voices
5. Delete custom voice

### ✅ Collaboration Tests
1. Multi-user presence (3 browsers)
2. Remote cursors visible
3. Comment with @mention
4. Resolve comment thread

### ✅ Certificate Tests
1. Mint certificate (testnet)
2. Verify certificate
3. Display QR code
4. Check on-chain status

### ✅ Smoke Tests
1. Health endpoint
2. Compliance API accessible
3. Voice preview endpoint
4. WebSocket connection
5. Certificate verify endpoint

## Artifacts

### Reports
- HTML: `qa/artifacts/html-report/index.html`
- JSON: `qa/artifacts/results.json`
- JUnit: `qa/artifacts/junit.xml`

### Debug Assets
- Videos: `qa/artifacts/videos/`
- Screenshots: `qa/artifacts/screenshots/`
- Traces: `qa/artifacts/traces/`

## Performance Benchmarks

| Action | P50 | P95 | P99 |
|--------|-----|-----|-----|
| Compliance check | 1.2s | 2.5s | 4.1s |
| Voice create | 450ms | 1.1s | 2.3s |
| Certificate mint | 5.2s | 8.1s | 12.4s |
| WebSocket connect | 120ms | 350ms | 680ms |

## Known Issues

### Non-Blocking
- Mobile Safari: cursor precision < 5px
- Firefox: occasional WS reconnect
- WebKit: QR code render delay

### Flaky Tests (< 5%)
- Collaboration multi-browser (timing)
- Certificate mint (testnet latency)

## CI/CD Integration

### Pre-Deploy
- All tests pass on Chromium
- Smoke tests green

### Post-Deploy
- Smoke tests run on production
- Results logged to Sentry

## How to Run

### All Tests
```bash
yarn playwright test
```

### Specific Suite
```bash
yarn playwright test tests/e2e/compliance.spec.ts
```

### Debug Mode
```bash
yarn playwright test --debug
```

### Generate Report
```bash
yarn playwright show-report qa/artifacts/html-report
```

## Maintenance

### Add New Test
1. Create spec file in `tests/e2e/`
2. Follow naming: `{feature}.spec.ts`
3. Use fixtures from `tests/fixtures/`
4. Update this summary

### Update Baseline
```bash
yarn playwright test --update-snapshots
```

### Clean Artifacts
```bash
rm -rf qa/artifacts/*
```
