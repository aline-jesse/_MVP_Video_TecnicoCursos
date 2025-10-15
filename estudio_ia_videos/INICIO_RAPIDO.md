# 🚀 GUIA DE INÍCIO RÁPIDO - ESTÚDIO IA VIDEOS v2.2

**Para**: Desenvolvedores que querem começar rapidamente  
**Tempo estimado**: 15-20 minutos  
**Versão**: 2.2.0

---

## ⚡ INSTALAÇÃO EM 5 PASSOS

### 1️⃣ Clone e Instale (2 min)

```bash
# Clone o repositório
git clone <repository-url>
cd estudio_ia_videos

# Instale as dependências
npm install

# Dependências adicionais da Fase 3-4
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner redis sharp recharts socket.io-client

# Dependências de desenvolvimento (testes)
npm install -D jest ts-jest @types/jest supertest @types/supertest
```

---

### 2️⃣ Configure o Environment (3 min)

Crie o arquivo `.env.local` na raiz do projeto:

```env
# ===== DATABASE =====
DATABASE_URL="postgresql://user:password@localhost:5432/estudio_ia_videos"
REDIS_URL="redis://localhost:6379"

# ===== APIs EXTERNAS =====
# Unsplash (https://unsplash.com/developers)
UNSPLASH_ACCESS_KEY="your_unsplash_access_key"

# Pexels (https://www.pexels.com/api/)
PEXELS_API_KEY="your_pexels_api_key"

# Google Analytics 4
NEXT_PUBLIC_GA4_MEASUREMENT_ID="G-XXXXXXXXXX"

# ===== AWS S3 (Fase 3) =====
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_S3_BUCKET="your-bucket-name"
CDN_URL="https://your-cdn-url.com"  # opcional

# ===== EMAIL (SMTP) =====
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@estudio-ia-videos.com"

# ===== WEBSOCKET (Fase 4) =====
NEXT_PUBLIC_WS_URL="http://localhost:3000"

# ===== SYSTEM CONFIGS =====
MAX_FILE_SIZE="104857600"  # 100MB
ADMIN_DEFAULT_STORAGE_QUOTA="5368709120"  # 5GB
NODE_ENV="development"
```

**📝 Nota**: Para desenvolvimento local, você pode usar **LocalStack** para simular S3 ou **MinIO** como alternativa ao AWS S3.

---

### 3️⃣ Setup dos Serviços (5 min)

#### Docker Compose (Recomendado)

Crie `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: estudio_postgres
    environment:
      POSTGRES_USER: estudio
      POSTGRES_PASSWORD: senha_segura
      POSTGRES_DB: estudio_ia_videos
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: estudio_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Opcional: MinIO para S3 local
  minio:
    image: minio/minio
    container_name: estudio_minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

Inicie os serviços:

```bash
docker-compose up -d
```

#### OU Instalação Manual

**PostgreSQL**:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-15

# macOS
brew install postgresql@15

# Windows: Download do site oficial
```

**Redis**:
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Windows: Download do site oficial ou usar WSL
```

---

### 4️⃣ Setup do Database (3 min)

```bash
# Gerar Prisma Client
npx prisma generate

# Rodar migrations (cria todas as tabelas)
npx prisma migrate dev --name initial_setup

# (Opcional) Popular com dados de teste
npx prisma db seed
```

**Verificar database**:
```bash
# Abrir Prisma Studio
npx prisma studio
# Acesse: http://localhost:5555
```

---

### 5️⃣ Iniciar Aplicação (2 min)

```bash
# Terminal 1: Next.js App
npm run dev

# Terminal 2: Worker de Renderização
npm run worker

# Terminal 3 (opcional): Testes
npm test
```

**URLs**:
- 🌐 **App**: http://localhost:3000
- 📊 **Prisma Studio**: http://localhost:5555
- 🗄️ **MinIO Console**: http://localhost:9001 (se usando MinIO)

---

## ✅ VERIFICAÇÃO RÁPIDA

### Checklist de Funcionamento

```bash
# 1. Verificar database
npx prisma studio
# ✅ Deve abrir interface gráfica

# 2. Verificar Redis
redis-cli ping
# ✅ Deve responder: PONG

# 3. Rodar testes
npm test
# ✅ Deve passar 100+ testes

# 4. Verificar build
npm run build
# ✅ Deve compilar sem erros

# 5. Health check da API
curl http://localhost:3000/api/health
# ✅ Deve retornar: {"status":"ok"}
```

---

## 🎯 PRIMEIROS PASSOS

### 1. Criar um Usuário Admin

```bash
# Via Prisma Studio ou comando SQL
npx prisma studio
```

Ou usando SQL direto:

```sql
INSERT INTO "User" (id, name, email, role, status) 
VALUES (
  'user_admin_001',
  'Admin',
  'admin@estudio.com',
  'admin',
  'active'
);
```

### 2. Acessar o Admin Panel

1. Acesse: http://localhost:3000/admin
2. Login com usuário admin
3. Explore as 6 tabs:
   - 👥 Usuários
   - 🛡️ Rate Limits
   - 💾 Storage
   - 📜 Audit Logs
   - 🔗 Webhooks
   - ⚙️ Sistema

### 3. Ver Analytics Dashboard

1. Acesse: http://localhost:3000/dashboard/analytics
2. Visualize métricas em tempo real
3. Teste os filtros de período
4. Experimente o export de dados

### 4. Criar um Projeto

```typescript
// Via API
const response = await fetch('http://localhost:3000/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Meu Primeiro Projeto',
    description: 'Projeto de teste',
    settings: {
      resolution: '1920x1080',
      fps: 30,
    },
  }),
})

const project = await response.json()
console.log('Projeto criado:', project.id)
```

### 5. Testar Webhooks

```typescript
// Registrar webhook
const webhook = await fetch('http://localhost:3000/api/webhooks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://webhook.site/unique-url',  // Use webhook.site para testes
    events: ['render.completed', 'project.created'],
    description: 'Webhook de teste',
  }),
})

// Disparar evento (vai notificar o webhook)
await fetch('http://localhost:3000/api/render', {
  method: 'POST',
  body: JSON.stringify({ projectId: 'project_id' }),
})
```

---

## 📊 ARQUITETURA RÁPIDA

```
┌─────────────────────────────────────────────────────────┐
│                    NEXT.JS APP (Port 3000)               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Frontend   │  │   API Routes │  │  WebSocket   │  │
│  │   (React)    │  │   (REST)     │  │   (Socket)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    ┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
    │  PostgreSQL  │ │   Redis   │ │   AWS S3    │
    │  (Database)  │ │ (Cache +  │ │  (Storage)  │
    │              │ │  Queue)   │ │             │
    └──────────────┘ └───────────┘ └─────────────┘
                            │
                    ┌───────▼────────┐
                    │  Worker        │
                    │  (Background)  │
                    │  - Renders     │
                    │  - Webhooks    │
                    └────────────────┘
```

---

## 🔍 PRINCIPAIS ENDPOINTS

### Assets
```bash
GET    /api/assets/images?query=nature&page=1
GET    /api/assets/videos?query=ocean&page=1
POST   /api/assets/download
```

### Projects
```bash
GET    /api/projects
POST   /api/projects
GET    /api/projects/[id]
PUT    /api/projects/[id]
DELETE /api/projects/[id]
POST   /api/projects/[id]/export
```

### Render
```bash
POST   /api/render
GET    /api/render/[id]
DELETE /api/render/[id]
```

### Storage
```bash
POST   /api/storage/upload
GET    /api/storage/quota
GET    /api/storage/files/[key]
DELETE /api/storage/files/[key]
```

### Admin (requer role: admin)
```bash
GET    /api/admin/users
GET    /api/admin/stats
PUT    /api/admin/users/[id]
```

### Analytics
```bash
GET    /api/analytics/dashboard?range=7d
GET    /api/analytics/export?format=csv
```

### Webhooks
```bash
GET    /api/webhooks
POST   /api/webhooks
PUT    /api/webhooks/[id]
GET    /api/webhooks/[id]/stats
```

---

## 🧪 TESTES RÁPIDOS

```bash
# Todos os testes
npm test

# Testes com coverage
npm run test:coverage

# Testes em watch mode
npm run test:watch

# Apenas um arquivo
npm test -- storage-system

# Ver relatório de coverage
open coverage/lcov-report/index.html
```

---

## 🐛 TROUBLESHOOTING COMUM

### Erro: "Cannot connect to database"
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Ou se instalado localmente
sudo systemctl status postgresql  # Linux
brew services list  # macOS
```

**Solução**: Inicie o PostgreSQL ou ajuste a `DATABASE_URL` no `.env.local`

---

### Erro: "Redis connection failed"
```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Ou testar conexão
redis-cli ping
```

**Solução**: Inicie o Redis ou ajuste a `REDIS_URL`

---

### Erro: "AWS credentials not found"
**Solução**: 
- Configure as variáveis `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`
- OU use MinIO localmente
- OU desabilite temporariamente o storage S3

---

### Testes falhando
```bash
# Limpar cache
npm run test:clear

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar environment de teste
cat .env.test
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para documentação detalhada, consulte:

1. **Setup Completo**: `SETUP_FASE_3_COMPLETO.md`
2. **Fase 1**: `IMPLEMENTACOES_REAIS_OUTUBRO_2025.md`
3. **Fase 2**: `IMPLEMENTACOES_FASE_2_OUTUBRO_2025.md`
4. **Fase 3**: `IMPLEMENTACOES_FASE_3_OUTUBRO_2025.md`
5. **Fase 4**: `IMPLEMENTACOES_FASE_4_OUTUBRO_2025.md`
6. **Índice**: `INDICE_COMPLETO_DOCUMENTACAO.md`
7. **Métricas**: `DASHBOARD_METRICAS.md`

---

## 🎓 PRÓXIMOS PASSOS

Depois de configurar:

1. ✅ **Explore o Admin Panel** (`/admin`)
2. ✅ **Veja o Analytics Dashboard** (`/dashboard/analytics`)
3. ✅ **Crie um projeto** via API
4. ✅ **Configure um webhook** para testes
5. ✅ **Rode os testes** automatizados
6. ✅ **Leia a documentação técnica** completa
7. ✅ **Comece a desenvolver** novas features!

---

## 💡 DICAS ÚTEIS

### Desenvolvimento
```bash
# Hot reload automático
npm run dev

# Verificar types
npx tsc --noEmit

# Formatar código
npm run format

# Lint
npm run lint
```

### Database
```bash
# Reset database (CUIDADO!)
npx prisma migrate reset

# Ver schema atual
npx prisma db pull

# Gerar novo migration
npx prisma migrate dev --name my_migration
```

### Logs
```bash
# Ver logs do worker
tail -f logs/worker.log

# Ver logs de audit
tail -f logs/audit.log

# Ver logs de performance
tail -f logs/performance.log
```

---

## 🆘 SUPORTE

- 📖 **Documentação**: `INDICE_COMPLETO_DOCUMENTACAO.md`
- 🐛 **Issues**: Abra uma issue no repositório
- 💬 **Discussões**: Use a aba Discussions
- 📧 **Email**: suporte@estudio-ia-videos.com

---

## ✅ CHECKLIST DE INÍCIO

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL rodando
- [ ] Redis rodando
- [ ] Dependências instaladas (`npm install`)
- [ ] `.env.local` configurado
- [ ] Migrations executadas (`npx prisma migrate dev`)
- [ ] App iniciado (`npm run dev`)
- [ ] Worker iniciado (`npm run worker`)
- [ ] Testes passando (`npm test`)
- [ ] Prisma Studio acessível (`npx prisma studio`)
- [ ] Admin panel acessível (`http://localhost:3000/admin`)

---

**🎉 Pronto! Seu Estúdio IA Videos está operacional!**

**Versão**: 2.2.0  
**Data**: 7 de Outubro de 2025  
**Status**: ✅ Production Ready
