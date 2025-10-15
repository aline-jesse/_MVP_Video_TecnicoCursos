
# 🔐 ENVIRONMENT VARIABLES CHECKLIST

**Todas as variáveis necessárias para produção**

---

## 🌐 Application

```bash
# Environment
NODE_ENV=production

# Application URL
NEXT_PUBLIC_APP_URL=https://treinx.abacusai.app
NEXTAUTH_URL=https://treinx.abacusai.app

# Version (opcional, auto-gerado pelo CI/CD)
NEXT_PUBLIC_APP_VERSION=4.0.0
```

---

## 🔒 Authentication

```bash
# NextAuth Secret (CRITICAL - generate com: openssl rand -base64 32)
NEXTAUTH_SECRET=<generate-strong-secret-here>

# Session
SESSION_MAX_AGE=2592000  # 30 dias
```

---

## 🗄️ Database

```bash
# PostgreSQL Connection String
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public

# Connection Pool (opcional)
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

---

## 🔴 Redis

```bash
# Redis URL (formato: redis://[user[:password]@]host[:port][/db-number])
REDIS_URL=redis://localhost:6379

# Redis Password (se aplicável)
REDIS_PASSWORD=<password>

# Redis Connection Options
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=100
```

---

## 🔍 Observability

```bash
# Sentry DSN
SENTRY_DSN=https://xxxxxxxxxxxxx@oxxxxxx.ingest.sentry.io/xxxxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxx@oxxxxxx.ingest.sentry.io/xxxxxxx

# Sentry Options
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
```

---

## 🎙️ TTS Providers

### ElevenLabs
```bash
ELEVENLABS_API_KEY=<your-api-key>
ELEVENLABS_API_URL=https://api.elevenlabs.io
```

### Azure Speech Services
```bash
AZURE_SPEECH_KEY=<your-subscription-key>
AZURE_SPEECH_REGION=<region>  # Ex: eastus, westeurope
```

### Google Cloud TTS
```bash
GOOGLE_CLOUD_API_KEY=<your-api-key>
# Ou usando service account:
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

---

## ☁️ AWS (S3 Storage)

```bash
# S3 Configuration
AWS_BUCKET_NAME=<your-bucket-name>
AWS_FOLDER_PREFIX=production/
AWS_REGION=us-east-1

# Credentials (usar IAM roles em produção quando possível)
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
```

---

## 🌐 CDN

```bash
# CDN URL (Cloudflare, CloudFront, etc)
CDN_URL=https://cdn.treinx.abacusai.app

# CDN API Key (para invalidações)
CDN_API_KEY=<api-key>
CDN_ZONE_ID=<zone-id>
```

---

## 🔒 Security

```bash
# CORS Allowed Origins (comma-separated)
CORS_ALLOWED_ORIGINS=https://treinx.abacusai.app,https://staging.treinx.abacusai.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000  # 1 minuto
RATE_LIMIT_MAX_REQUESTS=60
```

---

## 🔄 Real-time Collaboration

```bash
# WebSocket URL (se diferente do app URL)
NEXT_PUBLIC_WS_URL=https://treinx.abacusai.app

# Socket.IO Options
SOCKET_IO_PATH=/api/socket.io
SOCKET_IO_TRANSPORTS=websocket,polling
```

---

## 📊 Analytics & Monitoring

```bash
# Google Analytics (opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Custom Analytics Endpoint (opcional)
ANALYTICS_ENDPOINT=https://analytics.treinx.abacusai.app
```

---

## 🚀 Deployment

```bash
# CI/CD
VERCEL_TOKEN=<token>  # Se usando Vercel
RAILWAY_TOKEN=<token>  # Se usando Railway

# Build Options
NEXT_TELEMETRY_DISABLED=1
SKIP_ENV_VALIDATION=false
```

---

## ✅ VALIDATION CHECKLIST

### Critical (Must Have)
- [x] `NODE_ENV=production`
- [x] `NEXTAUTH_SECRET` (strong, unique)
- [x] `DATABASE_URL` (production DB)
- [x] `REDIS_URL` (production Redis)
- [x] `NEXT_PUBLIC_APP_URL`
- [x] `NEXTAUTH_URL`

### High Priority (Should Have)
- [x] `SENTRY_DSN` (error tracking)
- [x] TTS provider keys (pelo menos 1)
- [x] `AWS_BUCKET_NAME` (storage)
- [x] `CDN_URL` (performance)

### Nice to Have
- [ ] Google Analytics ID
- [ ] Custom analytics endpoint
- [ ] Additional TTS providers

---

## 🔐 SECURITY NOTES

1. **NEVER commit `.env` files** to git
   ```bash
   # .gitignore should have:
   .env
   .env.local
   .env.production
   .env*.local
   ```

2. **Use secrets management** in production:
   - Vercel: Vercel Secrets
   - Railway: Railway Secrets
   - AWS: AWS Secrets Manager
   - GCP: Secret Manager
   - Azure: Key Vault

3. **Rotate secrets** periodically:
   - API keys: every 90 days
   - Database passwords: every 180 days
   - Session secrets: every 365 days

4. **Audit access** to secrets:
   - Who has access?
   - When was it last rotated?
   - Are old keys revoked?

---

## 🔧 HOW TO SET ENV VARS

### Local Development
```bash
# Create .env.local
cp .env.example .env.local
# Edit with your local values
nano .env.local
```

### Production (Vercel)
```bash
vercel env add VARIABLE_NAME production
```

### Production (Railway)
```bash
railway variables set VARIABLE_NAME=value
```

### Production (Docker)
```bash
# Use .env file
docker run --env-file .env.production ...

# Or pass individually
docker run -e NODE_ENV=production -e DATABASE_URL=... ...
```

---

## 📝 TEMPLATE

Download template:
```bash
# .env.example
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379

SENTRY_DSN=
ELEVENLABS_API_KEY=
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=
AWS_BUCKET_NAME=
AWS_REGION=us-east-1
```

---

**Last Updated**: 2025-10-02  
**Next Review**: Sprint 32
