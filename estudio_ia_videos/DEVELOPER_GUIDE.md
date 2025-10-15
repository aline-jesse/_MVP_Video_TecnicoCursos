
# 👨‍💻 Guia do Desenvolvedor - Estúdio IA de Vídeos

## Arquitetura do Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────┐
│           Frontend (Next.js)            │
│  React 18 + TypeScript + Tailwind       │
│  Canvas Editor + Timeline + Preview     │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│         API Routes (Next.js)            │
│  REST + GraphQL (Apollo Server)         │
│  TTS + Render + Upload + Admin          │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│           Services Layer                │
│  Redis Cache + Job Queue (BullMQ)       │
│  Image Optimizer + Video Processor      │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│          Infrastructure                 │
│  PostgreSQL + Redis + S3 + CDN          │
└─────────────────────────────────────────┘
```

---

## Setup de Desenvolvimento

### Pré-requisitos

- Node.js 18+
- Yarn 1.22+
- PostgreSQL 15+
- Redis 7+
- Git

### Instalação

```bash
# Clone o repositório
git clone https://github.com/your-org/estudio-ia-videos.git
cd estudio-ia-videos

# Instalar dependências
cd app
yarn install

# Configurar .env
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Setup do banco
npx prisma generate
npx prisma db push

# Rodar em desenvolvimento
yarn dev
```

Acesse: http://localhost:3000

---

## Estrutura de Pastas

```
estudio_ia_videos/
├── app/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── tts/          # Text-to-Speech
│   │   │   ├── render/       # Video rendering
│   │   │   ├── upload/       # File upload
│   │   │   ├── projects/     # Project management
│   │   │   ├── health/       # Health check
│   │   │   ├── metrics/      # Prometheus metrics
│   │   │   └── docs/         # API documentation
│   │   ├── (dashboard)/      # Dashboard routes
│   │   ├── (editor)/         # Editor routes
│   │   └── layout.tsx        # Root layout
│   │
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── editor/           # Canvas editor
│   │   ├── timeline/         # Timeline
│   │   └── dashboard/        # Dashboard
│   │
│   ├── lib/                   # Core libraries
│   │   ├── monitoring/       # Sentry, Logger
│   │   ├── security/         # Rate limiter, CSRF
│   │   ├── performance/      # CDN, Image optimizer
│   │   ├── tts/              # TTS providers
│   │   ├── render/           # Video rendering
│   │   ├── aws-config.ts     # S3 configuration
│   │   └── db.ts             # Prisma client
│   │
│   ├── hooks/                 # React hooks
│   ├── types/                 # TypeScript types
│   ├── middleware.ts          # Next.js middleware
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci-cd-production.yml  # CI/CD pipeline
│
├── docs/                      # Documentation
├── public/                    # Static assets
└── README.md
```

---

## Principais Módulos

### 1. TTS (Text-to-Speech)

**Providers suportados**: Azure, ElevenLabs, Google

```typescript
// app/lib/tts/providers/elevenlabs.ts
import { ElevenLabsClient } from 'elevenlabs'

export async function generateTTS(text: string, voice: string) {
  const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
  })
  
  const audio = await client.generate({
    voice,
    text,
    model_id: 'eleven_multilingual_v2'
  })
  
  return audio
}
```

**Cache com Redis**:
```typescript
// app/lib/tts/cache.ts
import redis from '@/lib/security/rate-limiter'

const CACHE_TTL = 60 * 60 * 24 * 7 // 7 days

export async function getCachedTTS(hash: string) {
  const cached = await redis.get(`tts:${hash}`)
  return cached ? JSON.parse(cached) : null
}

export async function cacheTTS(hash: string, data: any) {
  await redis.setex(
    `tts:${hash}`,
    CACHE_TTL,
    JSON.stringify(data)
  )
}
```

### 2. Canvas Editor

**Fabric.js + React**:

```typescript
// app/components/editor/canvas-editor.tsx
import { Canvas } from 'fabric'
import { useEffect, useRef } from 'react'

export function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  
  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = new Canvas(canvasRef.current, {
      width: 1920,
      height: 1080,
      backgroundColor: '#ffffff'
    })
    
    fabricRef.current = canvas
    
    return () => canvas.dispose()
  }, [])
  
  const addText = () => {
    const text = new fabric.IText('Seu texto aqui', {
      left: 100,
      top: 100,
      fontSize: 32,
      fill: '#000000'
    })
    
    fabricRef.current?.add(text)
  }
  
  return (
    <div>
      <canvas ref={canvasRef} />
      <button onClick={addText}>Adicionar Texto</button>
    </div>
  )
}
```

### 3. Video Rendering

**FFmpeg + Remotion**:

```typescript
// app/lib/render/video-renderer.ts
import { bundle } from '@remotion/bundler'
import { renderMedia } from '@remotion/renderer'

export async function renderVideo(composition: any) {
  // Bundle Remotion composition
  const bundled = await bundle({
    entryPoint: composition.entryPoint,
    webpackOverride: config => config
  })
  
  // Render video
  const output = await renderMedia({
    composition: composition.id,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: composition.output,
    inputProps: composition.props
  })
  
  return output
}
```

### 4. Rate Limiting

**Redis-based limiter**:

```typescript
// app/lib/security/rate-limiter.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function checkRateLimit(
  identifier: string,
  type: RateLimitType
) {
  const config = RATE_LIMIT_CONFIGS[type]
  const key = `ratelimit:${type}:${identifier}`
  const now = Date.now()
  
  await redis.zremrangebyscore(key, 0, now - config.windowMs)
  await redis.zadd(key, now, `${now}`)
  
  const count = await redis.zcard(key)
  const allowed = count <= config.max
  
  return {
    allowed,
    remaining: Math.max(0, config.max - count)
  }
}
```

### 5. Monitoring

**Sentry + Winston Logger**:

```typescript
// app/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
})

// app/lib/monitoring/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})
```

---

## API Routes

### Convenções

- **Autenticação**: Bearer token via NextAuth
- **Rate limiting**: Automático via middleware
- **Validação**: Zod schemas
- **Errors**: JSON com `{ error: string, details?: any }`

### Exemplo: API de TTS

```typescript
// app/app/api/tts/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateTTS } from '@/lib/tts'
import { log } from '@/lib/monitoring/logger'

const schema = z.object({
  text: z.string().min(1).max(5000),
  provider: z.enum(['azure', 'elevenlabs', 'google']),
  voice: z.string(),
  speed: z.number().min(0.5).max(2.0).default(1.0)
})

export async function POST(request: NextRequest) {
  try {
    // Parse body
    const body = await request.json()
    const data = schema.parse(body)
    
    // Generate TTS
    const audio = await generateTTS(data)
    
    // Log
    log.info('TTS generated', {
      provider: data.provider,
      textLength: data.text.length
    })
    
    return NextResponse.json({
      audioUrl: audio.url,
      duration: audio.duration,
      cached: audio.cached
    })
    
  } catch (error: any) {
    log.error('TTS generation failed', error)
    
    return NextResponse.json(
      { error: 'Failed to generate TTS', details: error.message },
      { status: 500 }
    )
  }
}
```

---

## Database Schema

### Principais Modelos

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String
  projects      Project[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Project {
  id            String    @id @default(cuid())
  title         String
  description   String?
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  scenes        Scene[]
  status        ProjectStatus @default(DRAFT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Scene {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  order         Int
  duration      Float
  content       Json
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum ProjectStatus {
  DRAFT
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## Testing

### Unit Tests

```typescript
// app/__tests__/tts.test.ts
import { generateTTS } from '@/lib/tts'

describe('TTS', () => {
  it('should generate audio', async () => {
    const result = await generateTTS({
      text: 'Hello world',
      provider: 'azure',
      voice: 'pt-BR-Francisca'
    })
    
    expect(result.audioUrl).toBeDefined()
    expect(result.duration).toBeGreaterThan(0)
  })
})
```

### E2E Tests (Playwright)

```typescript
// app/e2e/editor.spec.ts
import { test, expect } from '@playwright/test'

test('should create project', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('text=Novo Projeto')
  await page.fill('[name="title"]', 'Meu Projeto')
  await page.click('text=Criar')
  
  await expect(page).toHaveURL(/\/editor\//)
})
```

---

## CI/CD

### GitHub Actions

Pipeline completo em `.github/workflows/ci-cd-production.yml`:

1. **Lint & Type Check**
2. **Security Audit**
3. **Unit Tests**
4. **E2E Tests (Playwright)**
5. **Build**
6. **Deploy Staging**
7. **Deploy Production** (manual approval)

### Comandos

```bash
# Rodar localmente
cd app

# Lint
yarn lint

# Type check
npx tsc --noEmit

# Unit tests
yarn test

# E2E tests
npx playwright test

# Build
yarn build
```

---

## Deployment

### Ambientes

- **Development**: `http://localhost:3000`
- **Staging**: `https://staging.treinx.abacusai.app`
- **Production**: `https://treinx.abacusai.app`

### Deploy Manual

```bash
# Build
cd app && yarn build

# Start production server
yarn start

# Ou com PM2
pm2 start ecosystem.config.js
```

### Environment Variables

Ver `.env.example` para lista completa.

Principais:
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis connection
- `NEXTAUTH_SECRET`: Auth secret
- `AWS_*`: S3 credentials
- `AZURE_SPEECH_*`: Azure TTS
- `ELEVENLABS_API_KEY`: ElevenLabs TTS
- `SENTRY_DSN`: Error tracking

---

## Contribuindo

### Branch Strategy

- `main`: Desenvolvimento
- `staging`: Pre-production
- `production`: Production

### Workflow

1. **Criar branch**: `git checkout -b feature/my-feature`
2. **Fazer mudanças**: Commit pequenos e descritivos
3. **Push**: `git push origin feature/my-feature`
4. **Pull Request**: Para `main`
5. **Code Review**: Aguardar aprovação
6. **Merge**: Squash and merge
7. **Deploy**: Automático via CI/CD

### Commit Messages

Seguir Conventional Commits:

```
feat: Add new TTS provider
fix: Resolve rate limit issue
docs: Update developer guide
test: Add E2E tests for editor
refactor: Optimize image processing
```

---

## Troubleshooting

### Build Errors

```bash
# Limpar cache
rm -rf .next node_modules
yarn install
yarn build
```

### Database Issues

```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### Redis Issues

```bash
# Flush cache
redis-cli -u $REDIS_URL FLUSHALL

# Check connection
redis-cli -u $REDIS_URL ping
```

---

## Performance Tips

1. **Use Redis cache** para TTS e requests frequentes
2. **Optimize images** antes do upload
3. **Code splitting** para componentes pesados
4. **Lazy loading** para modais e tabs
5. **Debounce** em inputs de busca
6. **Virtualize** listas longas (react-window)
7. **Memoize** cálculos pesados (useMemo, useCallback)
8. **Server Components** quando possível

---

## Security Checklist

- [ ] Rate limiting em todas as APIs
- [ ] CSRF protection em mutations
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention (DOMPurify)
- [ ] CORS configurado
- [ ] Security headers configurados
- [ ] Secrets em environment variables
- [ ] HTTPS em produção
- [ ] Audit logs para ações sensíveis

---

## Recursos

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Fabric.js**: http://fabricjs.com/
- **Remotion**: https://www.remotion.dev/
- **Sentry**: https://docs.sentry.io/
- **Playwright**: https://playwright.dev/

---

## Suporte

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: dev@estudioiavideos.com.br

---

**Happy coding! 🚀**

*Última atualização: Sprint 30 - Outubro 2025*
