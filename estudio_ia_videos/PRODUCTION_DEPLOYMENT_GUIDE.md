
# 🚀 Guia de Deploy em Produção - Estúdio IA de Vídeos

## Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Variáveis de Ambiente](#variáveis-de-ambiente)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Monitoramento](#monitoramento)
5. [Segurança](#segurança)
6. [Performance](#performance)
7. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

### Serviços Necessários
- **Banco de Dados**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Storage**: AWS S3 (ou compatível)
- **CDN**: CloudFlare, AWS CloudFront ou similar
- **Monitoring**: Sentry (opcional mas recomendado)

### Ferramentas
- Node.js 18+
- Yarn 1.22+
- Git
- GitHub account (para CI/CD)

---

## Variáveis de Ambiente

### Configuração Mínima (.env)

```bash
# App
NODE_ENV=production
APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=https://treinx.abacusai.app

# Database
DATABASE_URL=postgresql://user:password@host:5432/estudio_ia_videos

# Auth
NEXTAUTH_URL=https://treinx.abacusai.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Redis
REDIS_URL=redis://user:password@host:6379

# AWS S3
AWS_BUCKET_NAME=your-bucket-name
AWS_FOLDER_PREFIX=production/
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# TTS Providers
AZURE_SPEECH_KEY=your-azure-key
AZURE_SPEECH_REGION=eastus
ELEVENLABS_API_KEY=your-elevenlabs-key

# Security
CSRF_SECRET=generate-with-openssl-rand-base64-32

# Monitoring (Opcional)
SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn

# CDN (Opcional)
CDN_URL=https://cdn.your-domain.com
```

### Gerar Secrets

```bash
# Gerar NEXTAUTH_SECRET
openssl rand -base64 32

# Gerar CSRF_SECRET
openssl rand -base64 32
```

---

## CI/CD Pipeline

### GitHub Actions

O projeto inclui pipeline completo em `.github/workflows/ci-cd-production.yml`

#### Configurar Secrets no GitHub

1. Acesse: `Settings` → `Secrets and variables` → `Actions`
2. Adicione os seguintes secrets:

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
REDIS_URL
AZURE_SPEECH_KEY
AZURE_SPEECH_REGION
ELEVENLABS_API_KEY
AWS_BUCKET_NAME
AWS_FOLDER_PREFIX
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
SENTRY_DSN
CSRF_SECRET
```

#### Fluxo de Deploy

```mermaid
graph LR
  A[Push to main] --> B[Lint & Type Check]
  B --> C[Security Audit]
  B --> D[Unit Tests]
  B --> E[E2E Tests]
  C --> F[Build]
  D --> F
  E --> F
  F --> G[Deploy Staging]
  G --> H{Tests Pass?}
  H -->|Yes| I[Deploy Production]
  H -->|No| J[Rollback]
```

#### Comandos Manuais

```bash
# Build local
cd app && yarn build

# Rodar testes
yarn test

# E2E tests
npx playwright test

# Deploy manual (após build)
# Configure seu comando de deploy aqui
```

---

## Monitoramento

### Sentry Setup

1. **Criar conta**: https://sentry.io
2. **Criar projeto**: Next.js
3. **Obter DSN**: Settings → Client Keys
4. **Adicionar ao .env**:
   ```bash
   SENTRY_DSN=your-dsn-here
   NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
   ```

### Endpoints de Monitoramento

#### Health Check
```bash
curl https://treinx.abacusai.app/api/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-02T12:00:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": { "status": "healthy", "latency": 5 },
    "redis": { "status": "healthy", "latency": 2 },
    "memory": { "status": "healthy", "usage": 128, "total": 512 }
  }
}
```

#### Métricas (Prometheus)
```bash
curl https://treinx.abacusai.app/api/metrics
```

### Logs

Logs são salvos em:
- **Production**: `/app/logs/`
- **Console**: Formato estruturado JSON
- **Sentry**: Errors e exceptions

Acessar logs:
```bash
# Error logs
tail -f logs/error.log

# Combined logs
tail -f logs/combined.log

# Exceptions
tail -f logs/exceptions.log
```

---

## Segurança

### Rate Limiting

Configurado automaticamente via Redis:

| Endpoint | Limite | Window |
|----------|--------|--------|
| Public | 60 req/min | 60s |
| API | 30 req/min | 60s |
| Auth | 5 req/15min | 15min |
| TTS | 10 req/min | 60s |
| Render | 3 req/min | 60s |
| Upload | 5 req/min | 60s |
| Admin | 10 req/min | 60s |

### Security Headers

Todos os responses incluem:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy` (completo)

### CSRF Protection

- Token CSRF gerado automaticamente
- Validação em todos os requests POST/PUT/PATCH/DELETE
- Token no header: `X-CSRF-Token`

### Auditorias

```bash
# Security audit
cd app && yarn audit

# Fix vulnerabilities
yarn audit fix

# Check for high/critical
yarn audit --level high
```

---

## Performance

### CDN Configuration

#### CloudFlare (Recomendado)

1. Adicionar domínio ao CloudFlare
2. Configurar DNS:
   ```
   Type: CNAME
   Name: @
   Target: your-hosting.com
   Proxy: Enabled (orange cloud)
   ```
3. Settings → Speed → Optimization:
   - ✅ Auto Minify (JS, CSS, HTML)
   - ✅ Brotli compression
   - ✅ Rocket Loader
   - ✅ Mirage

#### Cache Rules

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### Otimização de Imagens

Todas as imagens usam Next.js `<Image>`:
- **Formatos**: WebP, AVIF (fallback JPEG)
- **Lazy loading**: Automático
- **Responsive**: srcset gerado automaticamente

### Code Splitting

Automático via Next.js dynamic imports:
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false
})
```

---

## Troubleshooting

### Build Failures

#### TypeScript Errors
```bash
cd app
npx tsc --noEmit
# Fix errors
yarn build
```

#### Missing Dependencies
```bash
cd app
rm -rf node_modules yarn.lock
yarn install
yarn build
```

### Runtime Issues

#### Database Connection
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Prisma schema
cd app
npx prisma generate
npx prisma db push
```

#### Redis Connection
```bash
# Test Redis
redis-cli -u $REDIS_URL ping
# Expected: PONG

# Flush cache se necessário
redis-cli -u $REDIS_URL FLUSHALL
```

#### Memory Issues
```bash
# Check memory usage
curl https://treinx.abacusai.app/api/health | jq '.checks.memory'

# Restart app
pm2 restart estudio-ia-videos
```

### Performance Issues

#### Slow API Responses
1. Check Redis cache: `curl /api/health`
2. Check database queries (add indexes)
3. Review Sentry performance traces

#### High Memory Usage
1. Check `/api/metrics`
2. Review memory leaks no Sentry
3. Restart app se necessário

#### Rate Limit Issues
```bash
# Check current limits
curl https://treinx.abacusai.app/api/metrics

# Reset specific user
# Implementar endpoint de admin se necessário
```

---

## Comandos Úteis

```bash
# Deploy full pipeline
git push origin production

# Build local
cd app && yarn build

# Start production
cd app && yarn start

# Logs
pm2 logs estudio-ia-videos

# Restart
pm2 restart estudio-ia-videos

# Stop
pm2 stop estudio-ia-videos

# Health check
curl https://treinx.abacusai.app/api/health

# Metrics
curl https://treinx.abacusai.app/api/metrics

# API docs
open https://treinx.abacusai.app/api/docs
```

---

## Rollback

### GitHub Actions Rollback

Se o deploy falhar, o pipeline faz rollback automático.

### Manual Rollback

```bash
# 1. Revert commit
git revert HEAD
git push origin production

# 2. Ou voltar para commit anterior
git reset --hard <commit-hash>
git push --force origin production

# 3. Rebuildar
# GitHub Actions vai rebuildar automaticamente
```

---

## Checklist de Deploy

Antes de deploy em produção:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Secrets do GitHub configurados
- [ ] Database migrations rodadas
- [ ] Redis conectado e funcionando
- [ ] S3 bucket configurado
- [ ] Sentry configurado (opcional)
- [ ] CDN configurado (opcional)
- [ ] Health check passa
- [ ] E2E tests passam
- [ ] Security audit passa
- [ ] Build local funciona
- [ ] Documentação atualizada

---

## Suporte

- **Issues**: GitHub Issues
- **Email**: suporte@estudioiavideos.com.br
- **Docs**: https://treinx.abacusai.app/api/docs

---

**Última atualização**: Sprint 30 - Outubro 2025
