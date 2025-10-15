# 🚀 Timeline Multi-Track API - Referência Rápida

## 📍 Endpoints Disponíveis

### Timeline Base
```http
POST   /api/v1/timeline/multi-track          # Criar/atualizar timeline completa
GET    /api/v1/timeline/multi-track          # Obter timeline atual
PATCH  /api/v1/timeline/multi-track          # Atualizar parcialmente
DELETE /api/v1/timeline/multi-track          # Deletar timeline
```

### Versionamento
```http
GET    /api/v1/timeline/multi-track/history  # Listar histórico de versões
POST   /api/v1/timeline/multi-track/snapshot # Criar snapshot
POST   /api/v1/timeline/multi-track/restore  # Restaurar versão anterior
```

### Colaboração (Sprint 44)
```http
POST   /api/v1/timeline/multi-track/collaborate  # Lock/unlock tracks
GET    /api/v1/timeline/multi-track/collaborate  # Listar locks e presença
PUT    /api/v1/timeline/multi-track/collaborate  # Atualizar presença
```

### Templates (Sprint 44)
```http
POST   /api/v1/timeline/multi-track/templates  # Criar template
GET    /api/v1/timeline/multi-track/templates  # Listar/buscar templates
PUT    /api/v1/timeline/multi-track/templates  # Aplicar template
DELETE /api/v1/timeline/multi-track/templates  # Deletar template
```

### Bulk Operations (Sprint 44)
```http
POST   /api/v1/timeline/multi-track/bulk  # Operações em lote
```

### Analytics (Sprint 44)
```http
GET    /api/v1/timeline/multi-track/analytics  # Obter analytics
```

---

## 🔧 Exemplos Práticos

### 1. Criar Timeline
```typescript
const response = await fetch('/api/v1/timeline/multi-track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'proj-123',
    tracks: [
      {
        id: 'track1',
        type: 'video',
        clips: [
          { id: 'clip1', startTime: 0, duration: 10, source: 'video.mp4' }
        ]
      }
    ],
    totalDuration: 100,
    exportSettings: {
      fps: 30,
      resolution: '1920x1080',
      format: 'mp4',
      quality: 'hd'
    }
  })
})
```

### 2. Obter Timeline
```typescript
const response = await fetch('/api/v1/timeline/multi-track?projectId=proj-123')
const { data } = await response.json()
// data.tracks, data.settings, data.version, etc.
```

### 3. Atualizar Apenas FPS
```typescript
await fetch('/api/v1/timeline/multi-track', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'proj-123',
    settings: { fps: 60 }
  })
})
```

### 4. Criar Snapshot (Backup)
```typescript
const snapshot = await fetch('/api/v1/timeline/multi-track/snapshot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'proj-123',
    description: 'Antes de adicionar efeitos'
  })
})
const { data } = await snapshot.json()
console.log('Snapshot ID:', data.id)
```

### 5. Ver Histórico
```typescript
const history = await fetch('/api/v1/timeline/multi-track/history?projectId=proj-123&limit=10')
const { data } = await history.json()

data.history.forEach(version => {
  console.log(`v${version.version}: ${version.description} (${version.createdAt})`)
})
```

### 6. Restaurar Versão
```typescript
await fetch('/api/v1/timeline/multi-track/restore', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    snapshotId: 'snapshot-id-here'
  })
})
// Cria backup automático do estado atual antes de restaurar
```

### 7. Deletar Timeline
```typescript
await fetch('/api/v1/timeline/multi-track?projectId=proj-123', {
  method: 'DELETE'
})
```

### 8. Bloquear Track (Colaboração)
```typescript
await fetch('/api/v1/timeline/multi-track/collaborate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'proj-123',
    trackId: 'track1',
    action: 'lock'
  })
})
```

### 9. Criar Template
```typescript
const template = await fetch('/api/v1/timeline/multi-track/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'proj-123',
    name: 'Meu Template',
    category: 'corporate',
    isPublic: false
  })
})
```

### 10. Aplicar Efeito em Múltiplos Clips (Bulk)
```typescript
await fetch('/api/v1/timeline/multi-track/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'proj-123',
    operation: 'apply_effect',
    targets: { clipIds: ['clip1', 'clip2', 'clip3'] },
    data: {
      effect: { type: 'fade_in', duration: 1.5 }
    }
  })
})
```

### 11. Obter Analytics de Performance
```typescript
const analytics = await fetch(
  '/api/v1/timeline/multi-track/analytics?projectId=proj-123&type=performance'
)
const { data } = await analytics.json()
console.log('Complexity:', data.complexity.score)
console.log('Render Time:', data.performance.estimatedRenderTime)
```

---

## 📦 Tipos TypeScript

```typescript
interface TimelineRequest {
  projectId: string
  tracks?: Track[]
  totalDuration?: number
  exportSettings?: {
    fps?: 30 | 60
    resolution?: '1920x1080' | '3840x2160'
    format?: 'mp4' | 'webm'
    quality?: 'hd' | '4k'
    zoom?: number
    snapToGrid?: boolean
    autoSave?: boolean
  }
}

interface TimelineResponse {
  success: boolean
  data: {
    id: string
    projectId: string
    version: number
    totalDuration: number
    tracks: Track[]
    settings: Settings
    updatedAt: string
    analytics?: {
      tracksCount: number
      keyframesCount: number
      avgTrackDuration: number
      complexity: 'low' | 'medium' | 'high'
    }
  }
  message: string
}

interface HistoryResponse {
  success: boolean
  data: {
    currentVersion: number
    history: Array<{
      id: string
      version: number
      createdAt: string
      createdBy: string
      description: string
      tracksCount: number
      totalDuration: number
    }>
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}
```

---

## ⚠️ Códigos de Status

| Código | Significado |
|--------|------------|
| 200 | ✅ Sucesso |
| 400 | ❌ Dados inválidos (falta projectId, etc.) |
| 401 | 🔒 Não autenticado |
| 403 | 🚫 Sem permissão (não é dono do projeto) |
| 404 | 🔍 Timeline/Snapshot não encontrado |
| 500 | 💥 Erro no servidor |

---

## 🎯 Workflow Recomendado

```typescript
class TimelineManager {
  async saveWithBackup(projectId: string, newTracks: Track[]) {
    // 1. Criar snapshot antes de mudanças importantes
    const snapshot = await this.createSnapshot(projectId, 'Auto-backup')
    
    try {
      // 2. Atualizar timeline
      await this.updateTracks(projectId, newTracks)
      return { success: true, snapshotId: snapshot.id }
    } catch (error) {
      // 3. Em caso de erro, restaurar
      await this.restore(snapshot.id)
      throw error
    }
  }

  async updateTracks(projectId: string, tracks: Track[]) {
    return fetch('/api/v1/timeline/multi-track', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, tracks })
    })
  }

  async createSnapshot(projectId: string, description: string) {
    const res = await fetch('/api/v1/timeline/multi-track/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, description })
    })
    const { data } = await res.json()
    return data
  }

  async restore(snapshotId: string) {
    return fetch('/api/v1/timeline/multi-track/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshotId })
    })
  }
}
```

---

## 🧪 Testar Localmente

```bash
# Executar todos os testes de API
npm run test:api

# Executar apenas testes de timeline
npm run test -- __tests__/api.timeline.*.test.ts

# Executar com watch mode
npm run test:watch -- __tests__/api.timeline.advanced.test.ts
```

---

## 📊 Analytics

Todas as operações são rastreadas automaticamente:
- ✅ Criação de timeline
- ✅ Atualização (POST/PATCH)
- ✅ Restauração de versão
- ✅ Número de tracks
- ✅ Duração total
- ✅ Complexidade (low/medium/high)

---

## 🔐 Autenticação

Todos os endpoints requerem:
1. **Sessão válida** (NextAuth)
2. **Permissões de acesso** (usuário deve ser dono do projeto)

Headers automáticos via NextAuth, não precisa configurar manualmente.

---

## 💡 Dicas

### Quando usar POST vs PATCH?
- **POST**: Atualizar timeline completa (todos os campos)
- **PATCH**: Atualizar apenas campos específicos (mais eficiente)

### Quando criar snapshots?
- Antes de mudanças grandes
- Antes de testar novas features
- Após concluir uma fase importante
- Periodicamente (auto-save)

### Performance
- Use PATCH para atualizações frequentes (menos dados)
- Snapshots são rápidos (usa `upsert` do Prisma)
- Paginação no histórico para grandes quantidades

---

## 🆘 Troubleshooting

**Timeline não encontrada (404)**
```typescript
// Criar timeline primeiro
await fetch('/api/v1/timeline/multi-track', {
  method: 'POST',
  body: JSON.stringify({ projectId, tracks: [], totalDuration: 0 })
})
```

**Não autorizado (401)**
```typescript
// Verificar se está logado
const session = await getSession()
if (!session) {
  // Redirecionar para login
}
```

**Sem permissão (403)**
```typescript
// Usuário não é dono do projeto
// Verificar permissões no projeto
```

---

## 📚 Documentação Completa

- **Sprint 43**: `TIMELINE_FEATURES_SPRINT43.md` (Versionamento)
- **Sprint 44**: `TIMELINE_FEATURES_SPRINT44.md` (Colaboração, Templates, Bulk, Analytics)

