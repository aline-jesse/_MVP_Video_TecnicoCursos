# 🚀 GUIA RÁPIDO DE INÍCIO

**Para desenvolvedores que querem começar rapidamente**

---

## ⚡ INÍCIO RÁPIDO (5 minutos)

### 1. Clone e Instale

```bash
cd estudio_ia_videos
npm install
```

### 2. Configure Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/estudio_ia"
REDIS_URL="redis://localhost:6379"
AWS_ACCESS_KEY_ID="seu-access-key"
AWS_SECRET_ACCESS_KEY="seu-secret-key"
AWS_S3_BUCKET="estudio-ia-videos"
```

### 3. Inicie Serviços

```bash
# Redis
redis-server

# Em outro terminal
npm run dev
```

### 4. Teste as Funcionalidades

```bash
# Validar implementações
.\validate-implementations.ps1

# Executar testes
npm test
```

---

## 📦 FUNCIONALIDADES DISPONÍVEIS

### 1. Processar PPTX

```typescript
import { processPPTXFile } from '@/lib/pptx-processor-real';

const result = await processPPTXFile('/path/to/file.pptx', 'project-id');
console.log(result.slides);
```

### 2. Renderizar Vídeo

```typescript
import { getRenderQueue } from '@/lib/render-queue-real';

const queue = getRenderQueue();
const jobId = await queue.addRenderJob({
  id: 'job-1',
  projectId: 'project-1',
  userId: 'user-1',
  type: 'video',
  priority: 'normal',
  settings: {
    resolution: '1080p',
    fps: 30,
    codec: 'h264',
    bitrate: '5000k',
    format: 'mp4',
    quality: 'good'
  },
  metadata: {}
});
```

### 3. Rastrear Analytics

```typescript
import { analytics } from '@/lib/analytics-real';

await analytics.track({
  userId: 'user-1',
  event: 'Video Created',
  properties: { videoId: 'video-1' }
});
```

---

## 🔌 APIs DISPONÍVEIS

### PPTX Processing
- `POST /api/pptx/process` - Processar arquivo
- `GET /api/pptx/process/[id]` - Obter resultado

### Render Queue
- `POST /api/render/queue` - Adicionar job
- `GET /api/render/queue/[jobId]` - Obter progresso
- `DELETE /api/render/queue/[jobId]` - Cancelar job
- `GET /api/render/stats` - Estatísticas

### Analytics
- `POST /api/analytics/track` - Rastrear evento
- `GET /api/analytics/user` - Métricas do usuário
- `GET /api/analytics/system` - Métricas do sistema

---

## 🧪 EXECUTAR TESTES

```bash
# Todos os testes
npm test

# Apenas um arquivo
npm test -- integration.test.ts

# Com cobertura
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 📊 MONITORAMENTO

### Ver Estatísticas da Fila

```bash
curl http://localhost:3000/api/render/stats
```

### Ver Métricas do Sistema

```bash
curl http://localhost:3000/api/analytics/system
```

---

## 🐛 TROUBLESHOOTING

### Redis não conecta
```bash
# Verifique se está rodando
redis-cli ping

# Se não, inicie
redis-server
```

### PostgreSQL não conecta
```bash
# Verifique a DATABASE_URL no .env
echo $DATABASE_URL

# Execute migrations
npx prisma migrate dev
```

### FFmpeg não encontrado
```bash
# Windows
choco install ffmpeg

# Linux
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

Consulte `IMPLEMENTACOES_REAIS_08_OUTUBRO_2025.md` para:
- Arquitetura detalhada
- Exemplos de código
- Configurações avançadas
- Troubleshooting completo

---

**Pronto para começar?** Execute `npm run dev` e acesse http://localhost:3000
