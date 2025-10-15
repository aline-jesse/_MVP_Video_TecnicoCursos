# ⚡ SETUP RÁPIDO - Fases 1 + 2

Guia de instalação e configuração rápida de todas as implementações reais.

---

## 🚀 INSTALAÇÃO EM 5 MINUTOS

### Passo 1: Instalar Dependências (2 min)

```bash
# Dependências principais
npm install bull socket.io formidable fluent-ffmpeg sharp archiver nodemailer axios

# Dependências de desenvolvimento
npm install -D @types/bull @types/formidable @types/fluent-ffmpeg @types/nodemailer

# Instalar FFmpeg no sistema
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y ffmpeg

# macOS
brew install ffmpeg

# Windows (via Chocolatey)
choco install ffmpeg
```

### Passo 2: Configurar Environment (1 min)

Criar/atualizar `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/estudio_ia_videos"

# Redis
REDIS_URL="redis://localhost:6379"

# Assets APIs
UNSPLASH_ACCESS_KEY="your_unsplash_key"
PEXELS_API_KEY="your_pexels_key"

# WebSocket
NEXT_PUBLIC_WS_URL="ws://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID="G-XXXXXXXXXX"
GA4_API_SECRET="your_ga4_secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"
SMTP_FROM="noreply@estudioiavideos.com"

# AWS S3 (opcional)
AWS_S3_BUCKET="estudio-ia-videos"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_key"
AWS_SECRET_ACCESS_KEY="your_secret"

# Push Notifications (opcional - Firebase)
FIREBASE_PROJECT_ID="your-project"
FIREBASE_PRIVATE_KEY="your-key"
FIREBASE_CLIENT_EMAIL="your-email@project.iam.gserviceaccount.com"
```

### Passo 3: Atualizar Database (1 min)

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate dev --name add_all_systems

# Seed data (opcional)
npx prisma db seed
```

### Passo 4: Iniciar Serviços (1 min)

```bash
# Opção 1: Manualmente (3 terminais)
# Terminal 1
npm run dev

# Terminal 2
docker run -p 6379:6379 redis:alpine

# Terminal 3
npm run worker:render

# Opção 2: Automaticamente (recomendado)
npm run start:all
```

---

## 📦 PACKAGE.JSON SCRIPTS

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "worker:render": "tsx workers/video-render-worker.ts",
    "start:all": "concurrently \"npm run dev\" \"docker run -p 6379:6379 redis:alpine\" \"npm run worker:render\"",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.24.0",
    "bull": "^4.12.0",
    "socket.io": "^4.6.0",
    "formidable": "^3.5.0",
    "fluent-ffmpeg": "^2.1.2",
    "sharp": "^0.33.0",
    "archiver": "^6.0.0",
    "nodemailer": "^6.9.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/bull": "^4.10.0",
    "@types/formidable": "^3.4.0",
    "@types/fluent-ffmpeg": "^2.1.0",
    "@types/nodemailer": "^6.4.0",
    "typescript": "^5.0.0",
    "prisma": "^5.0.0",
    "tsx": "^4.0.0",
    "concurrently": "^8.2.0",
    "@jest/globals": "^29.7.0",
    "jest": "^29.7.0"
  }
}
```

---

## 🗄️ PRISMA SCHEMA COMPLETO

Adicionar ao `prisma/schema.prisma`:

```prisma
// Modelos existentes...

// ============================================
// FASE 1 - Assets, Render, Collaboration, Analytics
// ============================================

model Asset {
  id             String   @id @default(cuid())
  name           String
  description    String?
  type           String   // image, video, audio, font, template
  url            String
  thumbnailUrl   String?
  license        String   // free, premium
  provider       String   // unsplash, pexels, local
  tags           String[]
  width          Int?
  height         Int?
  duration       Int?
  size           BigInt?
  downloads      Int      @default(0)
  metadata       Json?
  userId         String?
  organizationId String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([type])
  @@index([provider])
  @@index([userId])
}

model RenderJob {
  id            String    @id @default(cuid())
  projectId     String
  userId        String
  type          String    // video, audio, image
  status        String    @default("pending")
  priority      Int       @default(5)
  progress      Int       @default(0)
  settings      Json?
  outputUrl     String?
  outputPath    String?
  fileSize      BigInt?
  duration      Int?
  errorMessage  String?
  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id])

  @@index([status])
  @@index([userId])
  @@index([projectId])
}

model ProjectComment {
  id          String   @id @default(cuid())
  projectId   String
  userId      String
  content     String
  slideNumber Int?
  position    Json?
  resolved    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id])

  @@index([projectId])
  @@index([userId])
}

model Analytics {
  id        String   @id @default(cuid())
  userId    String?
  projectId String?
  eventType String
  eventData Json?
  userAgent String?
  ipAddress String?
  country   String?
  device    String?
  timestamp DateTime @default(now())

  @@index([eventType])
  @@index([userId])
  @@index([timestamp])
}

// ============================================
// FASE 2 - Templates, Notifications, Projects
// ============================================

model Template {
  id             String   @id @default(cuid())
  name           String
  description    String?
  category       String   // corporate, education, marketing, etc.
  type           String   // video, slide, intro, outro, full-project
  thumbnail      String?
  previewUrl     String?
  config         Json
  tags           String[]
  isPremium      Boolean  @default(false)
  isPublic       Boolean  @default(true)
  usage          Int      @default(0)
  rating         Float    @default(0)
  userId         String?
  organizationId String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user         User?              @relation(fields: [userId], references: [id])
  organization Organization?      @relation(fields: [organizationId], references: [id])
  ratings      TemplateRating[]

  @@index([category])
  @@index([type])
  @@index([isPublic])
  @@index([rating])
}

model TemplateRating {
  id         String   @id @default(cuid())
  templateId String
  userId     String
  rating     Int      // 1-5
  createdAt  DateTime @default(now())

  template Template @relation(fields: [templateId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id])

  @@unique([templateId, userId])
  @@index([templateId])
}

model Notification {
  id          String    @id @default(cuid())
  userId      String
  type        String
  title       String
  message     String
  data        Json?
  read        Boolean   @default(false)
  readAt      DateTime?
  channel     String[]  // in-app, push, email, webhook
  priority    String    @default("normal") // low, normal, high, urgent
  actionUrl   String?
  actionLabel String?
  imageUrl    String?
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([read])
  @@index([type])
  @@index([createdAt])
}

model NotificationPreferences {
  id                    String   @id @default(cuid())
  userId                String   @unique
  channels              Json     // { eventType: [channels] }
  doNotDisturb          Boolean  @default(false)
  doNotDisturbStart     String?  // HH:MM
  doNotDisturbEnd       String?  // HH:MM
  emailDigest           Boolean  @default(false)
  emailDigestFrequency  String   @default("never") // daily, weekly, never
  updatedAt             DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserDevice {
  id        String   @id @default(cuid())
  userId    String
  pushToken String?
  platform  String   // ios, android, web
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Webhook {
  id        String   @id @default(cuid())
  userId    String
  url       String
  secret    String
  events    String[] // tipos de eventos a escutar
  active    Boolean  @default(true)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model ProjectShare {
  id         String    @id @default(cuid())
  projectId  String
  userId     String
  permission String    @default("view") // view, comment, edit, admin
  expiresAt  DateTime?
  createdAt  DateTime  @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id])

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
}

model ProjectVersion {
  id          String   @id @default(cuid())
  projectId   String
  version     Int
  name        String?
  description String?
  config      Json
  createdBy   String
  createdAt   DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  creator User    @relation(fields: [createdBy], references: [id])

  @@index([projectId])
  @@index([version])
}

// Atualizar modelo Project com novos campos
model Project {
  id             String   @id @default(cuid())
  name           String
  description    String?
  type           String   // video, presentation, animation, training
  status         String   @default("draft") // draft, in-progress, review, approved, published, archived
  visibility     String   @default("private") // private, shared, public
  thumbnail      String?
  duration       Int      @default(0)
  config         Json
  templateId     String?
  userId         String
  organizationId String?
  tags           String[]
  views          Int      @default(0)
  downloads      Int      @default(0)
  lastEditedAt   DateTime @default(now())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user         User              @relation(fields: [userId], references: [id])
  organization Organization?     @relation(fields: [organizationId], references: [id])
  shares       ProjectShare[]
  versions     ProjectVersion[]
  comments     ProjectComment[]
  renderJobs   RenderJob[]

  @@index([userId])
  @@index([status])
  @@index([visibility])
  @@index([type])
  @@index([lastEditedAt])
}

// Atualizar modelo User com novos relacionamentos
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          String    @default("user")
  organizationId String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  projects               Project[]
  templates              Template[]
  templateRatings        TemplateRating[]
  notifications          Notification[]
  notificationPreferences NotificationPreferences?
  devices                UserDevice[]
  webhooks               Webhook[]
  projectShares          ProjectShare[]
  projectVersions        ProjectVersion[]
  comments               ProjectComment[]
  renderJobs             RenderJob[]
  organization           Organization? @relation(fields: [organizationId], references: [id])
}

model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users     User[]
  projects  Project[]
  templates Template[]
}
```

---

## ✅ VERIFICAÇÃO DE INSTALAÇÃO

Execute este script para verificar se tudo está configurado:

```bash
# Criar arquivo test-setup.sh
cat > test-setup.sh << 'EOF'
#!/bin/bash

echo "🔍 Verificando instalação..."

# Verificar Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js $(node -v)"
else
    echo "❌ Node.js não instalado"
fi

# Verificar npm
if command -v npm &> /dev/null; then
    echo "✅ npm $(npm -v)"
else
    echo "❌ npm não instalado"
fi

# Verificar FFmpeg
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg $(ffmpeg -version | head -n 1)"
else
    echo "❌ FFmpeg não instalado"
fi

# Verificar Redis
if command -v redis-cli &> /dev/null; then
    echo "✅ Redis $(redis-cli --version)"
else
    echo "⚠️ Redis CLI não instalado (use Docker)"
fi

# Verificar PostgreSQL
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL $(psql --version)"
else
    echo "⚠️ PostgreSQL não instalado localmente (pode usar cloud)"
fi

# Verificar arquivo .env.local
if [ -f ".env.local" ]; then
    echo "✅ .env.local existe"
else
    echo "❌ .env.local não encontrado"
fi

# Verificar node_modules
if [ -d "node_modules" ]; then
    echo "✅ node_modules existe"
else
    echo "❌ Execute: npm install"
fi

echo ""
echo "✨ Verificação completa!"
EOF

chmod +x test-setup.sh
./test-setup.sh
```

---

## 🎯 TESTES RÁPIDOS

### Testar APIs

```bash
# Testar busca de assets
curl -X POST http://localhost:3000/api/assets/search \
  -H "Content-Type: application/json" \
  -d '{"query":"training","filters":{"type":"image"}}'

# Testar criação de render job
curl -X POST http://localhost:3000/api/render/create \
  -H "Content-Type: application/json" \
  -d '{"projectId":"proj_123","type":"video","settings":{"format":"mp4"}}'

# Testar busca de templates
curl http://localhost:3000/api/templates?category=education

# Testar notificações
curl http://localhost:3000/api/notifications

# Testar projetos
curl http://localhost:3000/api/projects?type=training
```

### Testar WebSocket (Browser Console)

```javascript
// Abrir DevTools (F12) e executar:
const socket = io('ws://localhost:3000')

socket.on('connect', () => {
  console.log('✅ WebSocket conectado')
})

socket.emit('join-project', {
  projectId: 'proj_123',
  userId: 'user_456',
  userName: 'Teste'
})

socket.on('notification', (data) => {
  console.log('🔔 Notificação:', data)
})
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module 'bull'"
```bash
npm install bull @types/bull
```

### Erro: "FFmpeg not found"
```bash
# Verificar instalação
ffmpeg -version

# Se não instalado:
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg
```

### Erro: "Redis connection refused"
```bash
# Iniciar Redis via Docker
docker run -d -p 6379:6379 redis:alpine

# Ou instalar localmente
sudo apt-get install redis-server
sudo systemctl start redis
```

### Erro: "Prisma Client not generated"
```bash
npx prisma generate
```

### Erro: "Database connection error"
```bash
# Verificar DATABASE_URL no .env.local
# Testar conexão
npx prisma db push
```

---

## 📊 MONITORAMENTO

### Verificar Status dos Serviços

```bash
# Next.js
curl http://localhost:3000/api/health

# Redis
redis-cli ping
# Deve retornar: PONG

# Worker (logs)
tail -f logs/worker.log

# Database
npx prisma studio
# Abre interface web em http://localhost:5555
```

---

## 🎉 SUCESSO!

Se todos os passos foram completados sem erros, você tem:

✅ 8 sistemas funcionais
✅ 25+ APIs REST
✅ Worker de renderização ativo
✅ WebSocket real-time
✅ Notificações multi-canal
✅ Sistema de templates
✅ Gerenciamento completo de projetos
✅ Analytics e métricas

**Próximo passo**: Acessar http://localhost:3000 e começar a usar! 🚀
