# ⚡ SETUP COMPLETO - Versão 2.1.0 (Fase 3)

**Guia de instalação rápida para produção**  
**Tempo estimado**: 10-15 minutos  
**Última atualização**: 7 de Outubro de 2025

---

## 📋 PRÉ-REQUISITOS

### Obrigatórios
- ✅ Node.js 18+ ([Download](https://nodejs.org))
- ✅ PostgreSQL 14+ ([Download](https://postgresql.org))
- ✅ Redis 6+ ([Download](https://redis.io))
- ✅ FFmpeg ([Download](https://ffmpeg.org))

### Opcionais (Produção)
- ⚪ AWS Account (S3 storage)
- ⚪ SMTP Server (notificações email)
- ⚪ Sentry Account (error tracking)

### Para Desenvolvimento
- ⚪ LocalStack (AWS local)
- ⚪ MailHog (SMTP local)

---

## 🚀 INSTALAÇÃO RÁPIDA

### 1. Clonar e Instalar (3 min)

```bash
# Clone o repositório
git clone <repository-url>
cd estudio-ia-videos

# Instalar todas as dependências
npm install

# Dependências específicas Fase 1-3
npm install bull socket.io formidable fluent-ffmpeg sharp archiver nodemailer axios @aws-sdk/client-s3 @aws-sdk/s3-request-presigner redis

# Dev dependencies
npm install -D @types/bull @types/formidable @types/fluent-ffmpeg @types/nodemailer @jest/globals @types/jest jest ts-jest supertest @types/supertest
```

### 2. Instalar FFmpeg no Sistema (1 min)

```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y ffmpeg

# macOS
brew install ffmpeg

# Windows (via Chocolatey)
choco install ffmpeg

# Verificar instalação
ffmpeg -version
```

### 3. Iniciar Serviços (2 min)

```bash
# PostgreSQL
# Criar database
createdb estudio_ia_videos

# Redis
# Docker
docker run -d -p 6379:6379 redis:alpine

# Ou nativo
redis-server

# Verificar
redis-cli ping  # deve retornar PONG
```

### 4. Configurar Environment (2 min)

Criar `.env.local`:

```env
# ==============================================
# DATABASE
# ==============================================
DATABASE_URL="postgresql://user:password@localhost:5432/estudio_ia_videos"

# ==============================================
# REDIS
# ==============================================
REDIS_URL="redis://localhost:6379"

# ==============================================
# ASSETS APIS
# ==============================================
UNSPLASH_ACCESS_KEY="your_unsplash_access_key"
PEXELS_API_KEY="your_pexels_api_key"

# ==============================================
# AWS S3 (Fase 3)
# ==============================================
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_S3_BUCKET="estudio-ia-videos"
CDN_URL="https://cdn.example.com"  # Opcional
MAX_FILE_SIZE="524288000"  # 500MB

# Para desenvolvimento com LocalStack
# AWS_ENDPOINT="http://localhost:4566"

# ==============================================
# WEBSOCKET
# ==============================================
NEXT_PUBLIC_WS_URL="ws://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ==============================================
# ANALYTICS
# ==============================================
NEXT_PUBLIC_GA4_MEASUREMENT_ID="G-XXXXXXXXXX"
GA4_API_SECRET="your_ga4_api_secret"

# ==============================================
# EMAIL/SMTP
# ==============================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@estudio-ia-videos.com"

# Para desenvolvimento
# Use MailHog: SMTP_HOST="localhost" SMTP_PORT="1025"

# ==============================================
# NEXT AUTH (se aplicável)
# ==============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# ==============================================
# EXTERNAL SERVICES (Opcional)
# ==============================================
SENTRY_DSN="your_sentry_dsn"  # Error tracking
DATADOG_API_KEY="your_datadog_key"  # APM

# ==============================================
# NODE ENV
# ==============================================
NODE_ENV="development"
```

### 5. Setup Database (2 min)

```bash
# Gerar Prisma Client
npx prisma generate

# Rodar migrations
npx prisma migrate dev --name init

# (Opcional) Seed inicial
npx prisma db seed
```

### 6. Build e Start (2 min)

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start

# Com worker (renderização)
# Terminal 1
npm run dev

# Terminal 2
npm run worker

# Ou com PM2 (recomendado produção)
pm2 start ecosystem.config.js
```

---

## ✅ VERIFICAÇÃO

### Testar Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Assets (Unsplash)
curl "http://localhost:3000/api/assets/images?query=nature&limit=5"

# Storage quota
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/storage/quota

# Rate limit test
for i in {1..10}; do
  curl http://localhost:3000/api/health
done
```

### Testar WebSocket

```javascript
// No browser console
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (e) => console.log('Message:', e.data);
```

### Rodar Testes

```bash
# Todos os testes
npm test

# Coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Específico
npm test -- real-systems.test.ts
```

---

## 🗄️ PRISMA SCHEMA COMPLETO

Adicionar ao `prisma/schema.prisma`:

```prisma
// ============================================
// FASE 3 - STORAGE
// ============================================

model StorageFile {
  id            String   @id @default(cuid())
  key           String   @unique
  bucket        String
  size          Int
  originalSize  Int
  contentType   String
  metadata      Json     @default({})
  tags          Json     @default({})
  etag          String
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  isPublic      Boolean  @default(false)
  isCompressed  Boolean  @default(false)
  isOptimized   Boolean  @default(false)
  expiresAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([expiresAt])
}

// ============================================
// FASE 3 - RATE LIMITING
// ============================================

model RateLimitBlock {
  id        String   @id @default(cuid())
  key       String   @unique
  reason    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([expiresAt])
}

// ============================================
// FASE 3 - LOGGING
// ============================================

model Log {
  id         String   @id @default(cuid())
  level      String
  message    String
  context    String?
  data       Json     @default({})
  error      Json     @default({})
  userId     String?
  ip         String?
  userAgent  String?
  requestId  String?
  duration   Int?
  timestamp  DateTime
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([level])
  @@index([timestamp])
}

model AuditLog {
  id           String   @id @default(cuid())
  action       String
  userId       String
  ip           String
  userAgent    String
  resource     String?
  resourceId   String?
  changes      Json     @default({})
  metadata     Json     @default({})
  success      Boolean
  errorMessage String?
  timestamp    DateTime
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([timestamp])
  @@index([resource, resourceId])
}

model PerformanceMetric {
  id        String   @id @default(cuid())
  name      String
  duration  Int
  metadata  Json     @default({})
  timestamp DateTime
  createdAt DateTime @default(now())

  @@index([name])
  @@index([timestamp])
}

// ============================================
// USER MODEL - ADICIONAR CAMPO
// ============================================

model User {
  id            String        @id @default(cuid())
  // ... campos existentes ...
  storageQuota  BigInt?       @default(5368709120) // 5GB
  storageFiles  StorageFile[]
  // ... outros relacionamentos ...
}
```

---

## 🐳 DOCKER COMPOSE (Opcional)

Criar `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: estudio_ia_videos
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  localstack:
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
    environment:
      SERVICES: s3
      DEBUG: 1
      DATA_DIR: /tmp/localstack/data
    volumes:
      - localstack_data:/tmp/localstack

  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

volumes:
  postgres_data:
  redis_data:
  localstack_data:
```

Iniciar:

```bash
docker-compose up -d
```

---

## 📦 PACKAGE.JSON SCRIPTS

Adicionar scripts úteis:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "worker": "tsx workers/video-render-worker.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "start:all": "concurrently \"npm run dev\" \"npm run worker\"",
    "pm2:start": "pm2 start ecosystem.config.js",
    "pm2:stop": "pm2 stop ecosystem.config.js",
    "pm2:logs": "pm2 logs"
  }
}
```

---

## 🔧 TROUBLESHOOTING

### Redis não conecta

```bash
# Verificar se está rodando
redis-cli ping

# Iniciar se necessário
redis-server

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### PostgreSQL erro de conexão

```bash
# Verificar se está rodando
pg_isready

# Criar database
createdb estudio_ia_videos

# Testar conexão
psql -d estudio_ia_videos
```

### FFmpeg não encontrado

```bash
# Verificar instalação
which ffmpeg
ffmpeg -version

# Adicionar ao PATH se necessário
export PATH=$PATH:/usr/local/bin
```

### S3 upload falha

```bash
# Verificar credenciais
aws configure list

# Testar com AWS CLI
aws s3 ls s3://estudio-ia-videos/

# LocalStack (dev)
AWS_ENDPOINT=http://localhost:4566 aws s3 mb s3://estudio-ia-videos
```

### Rate limit muito restritivo

```javascript
// Ajustar em lib/rate-limiter-real.ts
export const RATE_LIMITS = {
  PUBLIC_API: { points: 1000, duration: 60 }, // Aumentar
  // ...
};
```

### Testes falhando

```bash
# Limpar cache
npm run test -- --clearCache

# Rodar em verbose
npm run test -- --verbose

# Específico
npm test -- --testNamePattern="Storage"
```

---

## 🚀 DEPLOY PRODUÇÃO

### Checklist

```bash
✅ Environment variables configuradas
✅ DATABASE_URL aponta para DB produção
✅ REDIS_URL aponta para Redis produção
✅ AWS S3 bucket criado e configurado
✅ SMTP configurado (ou SendGrid/SES)
✅ Build testado: npm run build
✅ Testes passando: npm test
✅ Migrations aplicadas: npx prisma migrate deploy
✅ PM2 configurado
✅ Nginx/Apache configurado (reverse proxy)
✅ SSL/HTTPS configurado
✅ Monitoring configurado (Sentry/DataDog)
✅ Backup configurado (DB + S3)
```

### Comandos

```bash
# Build
npm run build

# Migrations (produção)
npx prisma migrate deploy

# Start com PM2
pm2 start ecosystem.config.js --env production

# Logs
pm2 logs

# Monitoring
pm2 monit

# Restart
pm2 restart all

# Save configuration
pm2 save
pm2 startup
```

---

## 📞 PRÓXIMOS PASSOS

Após instalação:

1. ✅ Verificar todos os endpoints
2. ✅ Rodar suite de testes
3. ✅ Configurar monitoring
4. ✅ Configurar backups
5. ⏳ Implementar UI (Fase 4)
6. ⏳ Load testing
7. ⏳ Security audit

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **Fase 1-2**: `IMPLEMENTACOES_FASE_2_OUTUBRO_2025.md`
- **Fase 3**: `IMPLEMENTACOES_FASE_3_OUTUBRO_2025.md`
- **Métricas**: `DASHBOARD_METRICAS.md`
- **Roadmap**: `PROXIMOS_PASSOS_ROADMAP.md`
- **Resumo Fase 3**: `FASE_3_COMPLETA_RESUMO.md`

---

**🎉 Setup concluído! Sistema pronto para uso.**

*Documento atualizado: 7 de Outubro de 2025*  
*Versão: 2.1.0*
