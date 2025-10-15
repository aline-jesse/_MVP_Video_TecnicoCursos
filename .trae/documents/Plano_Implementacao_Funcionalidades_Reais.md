# Plano de Implementação - Funcionalidades Reais

## 1. Visão Geral da Implementação

**Objetivo**: Substituir todas as implementações mockadas por funcionalidades reais e operacionais
**Prazo Total**: 8-10 semanas
**Metodologia**: Desenvolvimento incremental com validação contínua
**Critério de Sucesso**: 100% das funcionalidades operacionais em produção

## 2. Fases de Implementação

### FASE 1: PPTX Processing Real (Semana 1-2)
**Prioridade**: 🔴 CRÍTICA
**Dependências**: Nenhuma
**Status Atual**: 30% funcional (upload ok, parsing mockado)

#### Objetivos
- Implementar parsing real de arquivos PPTX
- Extrair texto, imagens, layouts e metadados reais
- Processar anotações do apresentador
- Detectar estrutura hierárquica dos slides

#### Tarefas Técnicas

**Task 1.1: Configurar Biblioteca PPTX**
```bash
# Instalar dependências
npm install pptxgenjs officegen mammoth
npm install --save-dev @types/pptxgenjs
```

**Task 1.2: Implementar Parser Real**
```typescript
// app/lib/pptx/real-parser.ts
import PptxGenJS from 'pptxgenjs';
import { S3StorageService } from '@/lib/s3-storage';

export class RealPPTXParser {
  async parseFromS3(s3Key: string): Promise<ParsedSlides> {
    // 1. Download do S3
    const buffer = await this.s3Service.downloadFile(s3Key);
    
    // 2. Parse real com PptxGenJS
    const pptx = new PptxGenJS();
    await pptx.load(buffer);
    
    // 3. Extrair dados reais
    return this.extractRealContent(pptx);
  }
  
  private extractRealContent(pptx: any): ParsedSlides {
    // Implementação real de extração
  }
}
```

**Task 1.3: API de Processamento Real**
```typescript
// app/api/v1/pptx/process-real/route.ts
export async function POST(request: Request) {
  const { s3Key } = await request.json();
  
  const parser = new RealPPTXParser();
  const slides = await parser.parseFromS3(s3Key);
  
  // Salvar no banco de dados
  await prisma.slide.createMany({
    data: slides.map(slide => ({
      projectId,
      slideNumber: slide.number,
      title: slide.title, // REAL
      content: slide.content, // REAL
      speakerNotes: slide.notes, // REAL
      elements: slide.elements // REAL
    }))
  });
  
  return NextResponse.json({ success: true, slides });
}
```

#### Critérios de Aceitação
- ✅ Parser extrai texto real dos slides
- ✅ Imagens são extraídas e salvas no S3
- ✅ Anotações do apresentador são capturadas
- ✅ Layout e formatação são preservados
- ✅ Testes automatizados passam

---

### FASE 2: Render Queue System Real (Semana 2-3)
**Prioridade**: 🔴 CRÍTICA
**Dependências**: FASE 1
**Status Atual**: 40% funcional (fallback para mock)

#### Objetivos
- Implementar fila real de renderização com Redis
- Processar vídeos com FFmpeg real
- Sistema de monitoramento e logs
- Balanceamento de carga de jobs

#### Tarefas Técnicas

**Task 2.1: Sistema de Fila Real**
```typescript
// app/lib/render/queue-system.ts
import Bull from 'bull';
import Redis from 'ioredis';

export class RealRenderQueue {
  private queue: Bull.Queue;
  
  constructor() {
    this.queue = new Bull('video-render', {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });
    
    this.setupProcessors();
  }
  
  async addRenderJob(projectData: RenderJobData): Promise<string> {
    const job = await this.queue.add('render-video', projectData, {
      priority: this.calculatePriority(projectData),
      attempts: 3,
      backoff: 'exponential'
    });
    
    return job.id.toString();
  }
  
  private setupProcessors() {
    this.queue.process('render-video', 2, this.processRenderJob.bind(this));
  }
  
  private async processRenderJob(job: Bull.Job): Promise<void> {
    // Implementação real de renderização
    const renderer = new FFmpegRenderer();
    await renderer.renderVideo(job.data, (progress) => {
      job.progress(progress);
    });
  }
}
```

**Task 2.2: FFmpeg Renderer Real**
```typescript
// app/lib/render/ffmpeg-renderer.ts
import ffmpeg from 'fluent-ffmpeg';
import { S3StorageService } from '@/lib/s3-storage';

export class FFmpegRenderer {
  async renderVideo(projectData: RenderJobData, onProgress: (progress: number) => void): Promise<string> {
    const tempDir = `/tmp/render_${projectData.jobId}`;
    
    // 1. Preparar assets
    await this.prepareAssets(projectData, tempDir);
    
    // 2. Gerar vídeo com FFmpeg
    const outputPath = await this.generateVideo(tempDir, onProgress);
    
    // 3. Upload para S3
    const s3Url = await this.uploadToS3(outputPath);
    
    // 4. Cleanup
    await this.cleanup(tempDir);
    
    return s3Url;
  }
  
  private async generateVideo(tempDir: string, onProgress: (progress: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = `${tempDir}/output.mp4`;
      
      ffmpeg()
        .input(`${tempDir}/slides/*.png`)
        .input(`${tempDir}/audio.wav`)
        .videoCodec('libx264')
        .audioCodec('aac')
        .fps(30)
        .size('1920x1080')
        .on('progress', (progress) => {
          onProgress(progress.percent || 0);
        })
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .save(outputPath);
    });
  }
}
```

#### Critérios de Aceitação
- ✅ Fila Redis processa jobs reais
- ✅ FFmpeg gera vídeos funcionais
- ✅ Progress tracking em tempo real
- ✅ Sistema de retry em falhas
- ✅ Logs detalhados de renderização

---

### FASE 3: Avatar 3D Integration Real (Semana 3-4)
**Prioridade**: 🟡 ALTA
**Dependências**: FASE 2
**Status Atual**: 20% funcional (URLs fake)

#### Objetivos
- Integrar com serviços reais de avatar 3D
- Biblioteca de assets reais no S3
- Personalização de avatares
- Sincronização labial com áudio

#### Tarefas Técnicas

**Task 3.1: Integração com Serviços de Avatar**
```typescript
// app/lib/avatar/avatar-service.ts
export class AvatarService {
  async getAvailableAvatars(): Promise<Avatar[]> {
    // Integração real com APIs de avatar
    const response = await fetch(`${process.env.AVATAR_API_URL}/avatars`, {
      headers: {
        'Authorization': `Bearer ${process.env.AVATAR_API_KEY}`
      }
    });
    
    return response.json();
  }
  
  async generateAvatarVideo(avatarId: string, audioUrl: string, script: string): Promise<string> {
    // Gerar vídeo real do avatar
    const response = await fetch(`${process.env.AVATAR_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AVATAR_API_KEY}`
      },
      body: JSON.stringify({
        avatarId,
        audioUrl,
        script,
        settings: {
          resolution: '1920x1080',
          fps: 30,
          format: 'mp4'
        }
      })
    });
    
    const result = await response.json();
    return result.videoUrl;
  }
}
```

#### Critérios de Aceitação
- ✅ Catálogo real de avatares carregado
- ✅ Personalização funcional
- ✅ Geração de vídeo com avatar real
- ✅ Sincronização labial precisa

---

### FASE 4: Voice Cloning Real (Semana 4-5)
**Prioridade**: 🟡 ALTA
**Dependências**: FASE 3
**Status Atual**: 15% funcional (100% mockado)

#### Objetivos
- Implementar clonagem real com ElevenLabs
- Sistema de treinamento de vozes
- Qualidade de áudio profissional
- Cache inteligente de sínteses

#### Tarefas Técnicas

**Task 4.1: Integração ElevenLabs Real**
```typescript
// app/lib/voice/elevenlabs-service.ts
import { ElevenLabsApi } from 'elevenlabs';

export class RealVoiceCloningService {
  private client: ElevenLabsApi;
  
  constructor() {
    this.client = new ElevenLabsApi({
      apiKey: process.env.ELEVENLABS_API_KEY
    });
  }
  
  async cloneVoice(audioFile: Buffer, voiceName: string): Promise<string> {
    // Upload do áudio para clonagem
    const voice = await this.client.voices.add({
      name: voiceName,
      files: [audioFile],
      description: `Voice cloned for ${voiceName}`
    });
    
    return voice.voice_id;
  }
  
  async synthesizeSpeech(text: string, voiceId: string): Promise<Buffer> {
    const audio = await this.client.generate({
      voice: voiceId,
      text: text,
      model_id: "eleven_multilingual_v2"
    });
    
    return Buffer.from(await audio.arrayBuffer());
  }
}
```

#### Critérios de Aceitação
- ✅ Clonagem real de vozes funcionando
- ✅ Síntese de alta qualidade
- ✅ Cache de áudios gerados
- ✅ Suporte a múltiplos idiomas

---

### FASE 5: Analytics System Real (Semana 5-6)
**Prioridade**: 🟡 MÉDIA
**Dependências**: Todas as anteriores
**Status Atual**: 60% funcional (mix real/mock)

#### Objetivos
- Tracking real de eventos
- Métricas de engajamento
- Relatórios customizados
- Dashboard em tempo real

#### Tarefas Técnicas

**Task 5.1: Sistema de Tracking Real**
```typescript
// app/lib/analytics/tracking-service.ts
export class RealAnalyticsService {
  async trackEvent(eventData: AnalyticsEvent): Promise<void> {
    // Salvar no banco de dados
    await prisma.analyticsEvent.create({
      data: {
        userId: eventData.userId,
        projectId: eventData.projectId,
        eventType: eventData.type,
        eventData: eventData.data,
        timestamp: new Date(),
        ipAddress: eventData.ipAddress,
        userAgent: eventData.userAgent
      }
    });
    
    // Enviar para serviços externos (opcional)
    if (process.env.GOOGLE_ANALYTICS_ID) {
      await this.sendToGoogleAnalytics(eventData);
    }
  }
  
  async getProjectMetrics(projectId: string, dateRange: DateRange): Promise<ProjectMetrics> {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        projectId,
        timestamp: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    });
    
    return this.calculateMetrics(events);
  }
}
```

#### Critérios de Aceitação
- ✅ Eventos trackados em tempo real
- ✅ Métricas calculadas corretamente
- ✅ Dashboard responsivo
- ✅ Exportação de relatórios

---

### FASE 6: Collaboration Real-Time (Semana 6-7)
**Prioridade**: 🟢 BAIXA
**Dependências**: Independente
**Status Atual**: 10% funcional (WebSocket mock)

#### Objetivos
- WebSocket real para colaboração
- Edição simultânea
- Sistema de comentários
- Notificações push

#### Tarefas Técnicas

**Task 6.1: WebSocket Server Real**
```typescript
// app/lib/collaboration/websocket-server.ts
import { Server } from 'socket.io';
import { createServer } from 'http';

export class CollaborationServer {
  private io: Server;
  
  constructor() {
    const httpServer = createServer();
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
      }
    });
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('join-project', (projectId) => {
        socket.join(`project:${projectId}`);
        this.broadcastUserJoined(projectId, socket.id);
      });
      
      socket.on('edit-slide', (data) => {
        socket.to(`project:${data.projectId}`).emit('slide-updated', data);
        this.saveEdit(data);
      });
      
      socket.on('add-comment', (data) => {
        socket.to(`project:${data.projectId}`).emit('comment-added', data);
        this.saveComment(data);
      });
    });
  }
}
```

#### Critérios de Aceitação
- ✅ WebSocket conecta múltiplos usuários
- ✅ Edições sincronizadas em tempo real
- ✅ Sistema de comentários funcional
- ✅ Notificações push operacionais

---

### FASE 7: Timeline Editor Profissional (Semana 7-8)
**Prioridade**: 🟡 ALTA
**Dependências**: FASE 1, 2
**Status Atual**: 50% funcional (básico)

#### Objetivos
- Editor multi-track profissional
- Sincronização precisa de áudio/vídeo
- Efeitos e transições
- Export em múltiplos formatos

#### Tarefas Técnicas

**Task 7.1: Timeline Engine Real**
```typescript
// app/lib/timeline/timeline-engine.ts
export class ProfessionalTimelineEngine {
  private tracks: Track[] = [];
  private currentTime: number = 0;
  
  addTrack(type: 'video' | 'audio' | 'text'): Track {
    const track = new Track(type, this.tracks.length);
    this.tracks.push(track);
    return track;
  }
  
  addClip(trackId: number, clip: Clip, startTime: number): void {
    const track = this.tracks[trackId];
    track.addClip(clip, startTime);
    this.recalculateTimeline();
  }
  
  exportTimeline(format: ExportFormat): Promise<string> {
    // Gerar arquivo de timeline real
    return this.renderTimeline(format);
  }
}
```

#### Critérios de Aceitação
- ✅ Multi-track funcional
- ✅ Sincronização precisa
- ✅ Efeitos aplicados corretamente
- ✅ Export em múltiplos formatos

---

### FASE 8: Compliance NR Inteligente (Semana 8)
**Prioridade**: 🟡 MÉDIA
**Dependências**: FASE 1
**Status Atual**: 40% funcional (superficial)

#### Objetivos
- Base de conhecimento NR real
- Validação automática com IA
- Sugestões inteligentes
- Relatórios de conformidade

#### Tarefas Técnicas

**Task 8.1: Sistema de Compliance Real**
```typescript
// app/lib/compliance/nr-validator.ts
export class NRComplianceValidator {
  private knowledgeBase: NRKnowledgeBase;
  
  async validateContent(content: string, nrType: string): Promise<ComplianceReport> {
    // Análise real com IA
    const analysis = await this.analyzeWithAI(content, nrType);
    
    // Verificar conformidade
    const violations = await this.checkViolations(analysis, nrType);
    
    // Gerar sugestões
    const suggestions = await this.generateSuggestions(violations);
    
    return {
      score: this.calculateScore(violations),
      violations,
      suggestions,
      isCompliant: violations.length === 0
    };
  }
}
```

#### Critérios de Aceitação
- ✅ Validação precisa de NRs
- ✅ Sugestões úteis geradas
- ✅ Relatórios detalhados
- ✅ Base de conhecimento atualizada

---

## 3. Cronograma de Entrega

| Semana | Fase | Entregáveis | Status |
|--------|------|-------------|---------|
| 1-2 | PPTX Processing | Parser real, APIs, testes | 🔄 Em desenvolvimento |
| 2-3 | Render Queue | Sistema de fila, FFmpeg, monitoramento | ⏳ Aguardando |
| 3-4 | Avatar 3D | Integração real, biblioteca assets | ⏳ Aguardando |
| 4-5 | Voice Cloning | ElevenLabs, síntese real, cache | ⏳ Aguardando |
| 5-6 | Analytics | Tracking real, métricas, dashboard | ⏳ Aguardando |
| 6-7 | Collaboration | WebSocket, edição simultânea | ⏳ Aguardando |
| 7-8 | Timeline Editor | Multi-track, efeitos, export | ⏳ Aguardando |
| 8 | Compliance NR | Validação IA, sugestões | ⏳ Aguardando |

## 4. Critérios de Aceitação Gerais

### Funcionalidade
- ✅ Todas as features funcionam sem mocks
- ✅ Performance adequada (< 3s response time)
- ✅ Escalabilidade testada (100+ usuários simultâneos)
- ✅ Integração completa entre módulos

### Qualidade
- ✅ Cobertura de testes > 80%
- ✅ Zero vulnerabilidades críticas
- ✅ Documentação técnica completa
- ✅ Logs e monitoramento implementados

### Produção
- ✅ Deploy automatizado funcionando
- ✅ Backup e recovery testados
- ✅ Monitoring e alertas ativos
- ✅ Performance otimizada

## 5. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| APIs externas instáveis | Média | Alto | Implementar fallbacks e cache |
| Performance de renderização | Alta | Médio | Otimizar FFmpeg e usar GPU |
| Complexidade de integração | Média | Alto | Testes incrementais e rollback |
| Limitações de quota APIs | Baixa | Alto | Monitorar uso e ter planos B |

## 6. Recursos Necessários

### Desenvolvimento
- 2 desenvolvedores full-stack sênior
- 1 especialista em processamento de vídeo
- 1 DevOps engineer

### Infraestrutura
- Servidores com GPU para renderização
- Redis cluster para alta disponibilidade
- CDN para distribuição de assets
- Monitoramento e logs centralizados

### Ferramentas
- Licenças de APIs (ElevenLabs, Avatar services)
- Ferramentas de teste e CI/CD
- Ambiente de staging completo