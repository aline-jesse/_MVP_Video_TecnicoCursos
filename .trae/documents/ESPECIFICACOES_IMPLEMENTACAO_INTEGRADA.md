# 🔧 Especificações Técnicas - Implementação Integrada

## 1. Análise do Estado Atual

### 1.1 Módulos Funcionais Identificados
- ✅ **PPTX Processing**: 70% funcional (com alguns mocks)
- ⚠️ **Avatar 3D Rendering**: 40% funcional (pipeline básico implementado)
- ⚠️ **TTS & Voice Cloning**: 60% funcional (ElevenLabs integrado, Azure parcial)
- ✅ **Video Rendering**: 75% funcional (FFmpeg pipeline ativo)
- ⚠️ **Dashboard & Analytics**: 50% funcional (UI completa, dados parciais)
- ✅ **Authentication & User Management**: 90% funcional (NextAuth implementado)

### 1.2 Problemas Críticos Identificados
1. **Fragmentação de Módulos**: Cada módulo opera independentemente
2. **APIs Desconectadas**: Falta sincronização entre serviços
3. **Dados Mockados**: Alguns endpoints retornam dados falsos
4. **Falta de Estado Global**: Não há persistência de estado entre módulos
5. **Queue System Instável**: Redis queue com fallbacks mockados

## 2. Arquitetura de Integração Unificada

### 2.1 Fluxo Principal Integrado

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant API as API Gateway
    participant PPTX as PPTX Service
    participant TTS as TTS Service
    participant AVT as Avatar Service
    participant RND as Render Service
    participant Q as Queue System
    participant S3 as Storage

    U->>F: Upload PPTX + Configurações
    F->>API: POST /api/v1/projects/unified
    API->>PPTX: Processar PPTX
    PPTX->>Q: Enfileirar processamento
    Q->>PPTX: Extrair slides + texto
    PPTX->>API: Slides processados
    
    API->>TTS: Gerar áudio para cada slide
    TTS->>Q: Enfileirar síntese de voz
    Q->>TTS: Processar TTS
    TTS->>S3: Salvar arquivos de áudio
    
    API->>AVT: Configurar avatar 3D
    AVT->>Q: Enfileirar renderização avatar
    Q->>AVT: Renderizar com lip-sync
    AVT->>S3: Salvar vídeos de avatar
    
    API->>RND: Iniciar renderização final
    RND->>Q: Enfileirar composição final
    Q->>RND: Compor vídeo completo
    RND->>S3: Salvar vídeo final
    
    RND->>F: WebSocket: Status updates
    F->>U: Notificação de conclusão
```

### 2.2 Estado Global Unificado

```typescript
// Zustand Store para Estado Global
interface UnifiedProjectState {
  // Projeto atual
  currentProject: {
    id: string;
    name: string;
    status: 'draft' | 'processing' | 'ready' | 'rendering' | 'completed';
    slides: Slide[];
    timeline: TimelineConfig;
    renderConfig: RenderConfig;
  };
  
  // Estados de processamento
  processing: {
    pptxStatus: ProcessingStatus;
    ttsStatus: ProcessingStatus;
    avatarStatus: ProcessingStatus;
    renderStatus: ProcessingStatus;
  };
  
  // Assets gerados
  assets: {
    audioTracks: AudioTrack[];
    avatarVideos: AvatarVideo[];
    finalVideo?: FinalVideo;
  };
  
  // Configurações do usuário
  userPreferences: {
    defaultAvatar: string;
    defaultVoice: string;
    renderQuality: 'draft' | 'standard' | 'high' | '4k';
  };
}
```

## 3. Implementação por Fases

### 3.1 Fase 1: Unificação da API Gateway (Semana 1)

**Objetivo**: Criar um ponto único de entrada para todos os módulos

**Implementação**:
```typescript
// app/api/v1/unified/route.ts
export async function POST(request: Request) {
  const { action, projectId, data } = await request.json();
  
  switch (action) {
    case 'create_project':
      return await createUnifiedProject(data);
    case 'process_pptx':
      return await processPPTXIntegrated(projectId, data);
    case 'generate_tts':
      return await generateTTSIntegrated(projectId, data);
    case 'render_avatar':
      return await renderAvatarIntegrated(projectId, data);
    case 'start_final_render':
      return await startFinalRender(projectId, data);
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}
```

**Entregáveis**:
- [ ] API Gateway unificada
- [ ] Middleware de autenticação centralizado
- [ ] Sistema de logging integrado
- [ ] Validação de requests padronizada

### 3.2 Fase 2: Integração PPTX → TTS (Semana 2)

**Objetivo**: Automatizar a geração de áudio a partir do texto extraído

**Implementação**:
```typescript
// lib/services/pptx-tts-integration.ts
export class PPTXTTSIntegration {
  async processSlideWithAudio(slide: Slide, voiceConfig: VoiceConfig) {
    // 1. Extrair texto do slide
    const extractedText = await this.extractTextFromSlide(slide);
    
    // 2. Processar texto para TTS
    const processedText = await this.preprocessTextForTTS(extractedText);
    
    // 3. Gerar áudio
    const audioResult = await this.generateAudio(processedText, voiceConfig);
    
    // 4. Sincronizar com timeline
    const timelineEntry = await this.createTimelineEntry(slide, audioResult);
    
    return {
      slide: { ...slide, audioUrl: audioResult.url },
      timeline: timelineEntry,
      duration: audioResult.duration
    };
  }
}
```

**Entregáveis**:
- [ ] Extração automática de texto de slides
- [ ] Preprocessamento de texto para TTS
- [ ] Geração automática de áudio por slide
- [ ] Sincronização com timeline do projeto

### 3.3 Fase 3: Avatar 3D + Lip Sync (Semana 3)

**Objetivo**: Sincronizar avatar 3D com áudio gerado

**Implementação**:
```typescript
// lib/services/avatar-lipsync-service.ts
export class AvatarLipSyncService {
  async renderAvatarWithAudio(avatarConfig: AvatarConfig, audioUrl: string) {
    // 1. Analisar áudio para lip sync
    const lipSyncData = await this.analyzeAudioForLipSync(audioUrl);
    
    // 2. Configurar animações do avatar
    const animationConfig = await this.createAnimationConfig(lipSyncData);
    
    // 3. Renderizar avatar com Three.js/WebGL
    const avatarVideo = await this.renderAvatarVideo(avatarConfig, animationConfig);
    
    // 4. Compor com background se necessário
    const composedVideo = await this.composeWithBackground(avatarVideo, avatarConfig.background);
    
    return composedVideo;
  }
}
```

**Entregáveis**:
- [ ] Sistema de análise de áudio para lip sync
- [ ] Renderização 3D com Three.js otimizada
- [ ] Composição de avatar com backgrounds
- [ ] Cache de renderizações para performance

### 3.4 Fase 4: Pipeline de Renderização Unificado (Semana 4)

**Objetivo**: Compor todos os elementos em vídeo final

**Implementação**:
```typescript
// lib/services/unified-render-pipeline.ts
export class UnifiedRenderPipeline {
  async renderFinalVideo(project: UnifiedProject) {
    const renderJob = await this.createRenderJob(project);
    
    // 1. Preparar assets
    const assets = await this.prepareAssets(project);
    
    // 2. Criar composição FFmpeg
    const composition = await this.createFFmpegComposition(assets);
    
    // 3. Renderizar com progress tracking
    const result = await this.renderWithProgress(composition, renderJob.id);
    
    // 4. Upload para S3 e CDN
    const finalUrl = await this.uploadToStorage(result);
    
    // 5. Atualizar status do projeto
    await this.updateProjectStatus(project.id, 'completed', finalUrl);
    
    return { url: finalUrl, renderJob };
  }
}
```

**Entregáveis**:
- [ ] Pipeline FFmpeg otimizado
- [ ] Sistema de progress tracking em tempo real
- [ ] Upload automático para S3/CDN
- [ ] Notificações WebSocket para usuário

## 4. Configuração de Ambiente Integrado

### 4.1 Variáveis de Ambiente Necessárias

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/estudio_ia_videos"
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Storage
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="estudio-ia-videos"
CLOUDFRONT_DOMAIN="cdn.estudio-ia-videos.com"

# External APIs
OPENAI_API_KEY="your-openai-key"
ELEVENLABS_API_KEY="your-elevenlabs-key"
AZURE_SPEECH_KEY="your-azure-key"
AZURE_SPEECH_REGION="eastus"

# Processing
FFMPEG_PATH="/usr/bin/ffmpeg"
MAX_CONCURRENT_RENDERS=3
RENDER_TIMEOUT_MINUTES=30
```

### 4.2 Docker Compose para Desenvolvimento

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: estudio_ia_videos
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 5. Testes de Integração

### 5.1 Teste de Fluxo Completo

```typescript
// tests/integration/unified-flow.test.ts
describe('Fluxo Unificado Completo', () => {
  test('Deve processar PPTX → TTS → Avatar → Render', async () => {
    // 1. Upload PPTX
    const project = await createProject({
      name: 'Teste Integração',
      type: 'pptx_import'
    });
    
    const pptxFile = new File([pptxBuffer], 'test.pptx');
    const pptxResult = await processPPTX(project.id, pptxFile);
    
    expect(pptxResult.slides).toHaveLength(5);
    
    // 2. Gerar TTS para todos os slides
    const ttsResults = await Promise.all(
      pptxResult.slides.map(slide => 
        generateTTS(project.id, slide.id, {
          voiceId: 'default-voice',
          speed: 1.0
        })
      )
    );
    
    expect(ttsResults).toHaveLength(5);
    ttsResults.forEach(result => {
      expect(result.audioUrl).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
    });
    
    // 3. Renderizar avatar para cada slide
    const avatarResults = await Promise.all(
      ttsResults.map(tts => 
        renderAvatar(project.id, {
          avatarId: 'default-avatar',
          audioUrl: tts.audioUrl,
          lipSync: true
        })
      )
    );
    
    expect(avatarResults).toHaveLength(5);
    
    // 4. Renderização final
    const finalRender = await startFinalRender(project.id, {
      quality: 'standard',
      format: 'mp4'
    });
    
    // Aguardar conclusão (com timeout)
    const result = await waitForRenderCompletion(finalRender.jobId, 300000);
    
    expect(result.status).toBe('completed');
    expect(result.outputUrl).toBeDefined();
    
    // 5. Verificar arquivo final
    const videoInfo = await getVideoInfo(result.outputUrl);
    expect(videoInfo.duration).toBeGreaterThan(0);
    expect(videoInfo.format).toBe('mp4');
  }, 600000); // 10 minutos timeout
});
```

### 5.2 Testes de Performance

```typescript
// tests/performance/render-performance.test.ts
describe('Performance de Renderização', () => {
  test('Deve renderizar vídeo de 5 slides em menos de 5 minutos', async () => {
    const startTime = Date.now();
    
    const result = await renderCompleteVideo({
      slides: 5,
      quality: 'standard',
      avatarComplexity: 'medium'
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // segundos
    
    expect(duration).toBeLessThan(300); // 5 minutos
    expect(result.status).toBe('completed');
  });
  
  test('Deve suportar 3 renderizações simultâneas', async () => {
    const promises = Array(3).fill(null).map(() => 
      renderCompleteVideo({
        slides: 3,
        quality: 'draft'
      })
    );
    
    const results = await Promise.all(promises);
    
    results.forEach(result => {
      expect(result.status).toBe('completed');
    });
  });
});
```

## 6. Monitoramento e Observabilidade

### 6.1 Métricas Essenciais

```typescript
// lib/monitoring/metrics.ts
export const metrics = {
  // Performance
  renderTime: histogram('render_duration_seconds'),
  queueSize: gauge('queue_size_total'),
  activeJobs: gauge('active_jobs_total'),
  
  // Qualidade
  successRate: counter('renders_success_total'),
  errorRate: counter('renders_error_total'),
  
  // Recursos
  memoryUsage: gauge('memory_usage_bytes'),
  cpuUsage: gauge('cpu_usage_percent'),
  storageUsage: gauge('storage_usage_bytes'),
  
  // Usuário
  projectsCreated: counter('projects_created_total'),
  videosGenerated: counter('videos_generated_total'),
  userSessions: gauge('active_user_sessions')
};
```

### 6.2 Alertas Críticos

```yaml
# monitoring/alerts.yml
alerts:
  - name: RenderQueueBacklog
    condition: queue_size_total > 50
    severity: warning
    message: "Fila de renderização com mais de 50 jobs"
    
  - name: HighErrorRate
    condition: rate(renders_error_total[5m]) > 0.1
    severity: critical
    message: "Taxa de erro de renderização acima de 10%"
    
  - name: LongRenderTime
    condition: render_duration_seconds > 600
    severity: warning
    message: "Renderização levando mais de 10 minutos"
```

## 7. Cronograma de Implementação

### Semana 1: Fundação
- [ ] Setup da API Gateway unificada
- [ ] Configuração do estado global (Zustand)
- [ ] Middleware de autenticação
- [ ] Sistema de logging

### Semana 2: Integração PPTX-TTS
- [ ] Processamento automático de PPTX
- [ ] Geração automática de TTS
- [ ] Sincronização de timeline
- [ ] Testes de integração básicos

### Semana 3: Avatar 3D + Lip Sync
- [ ] Sistema de lip sync
- [ ] Renderização 3D otimizada
- [ ] Composição com backgrounds
- [ ] Cache de renderizações

### Semana 4: Pipeline Final
- [ ] Renderização unificada com FFmpeg
- [ ] Sistema de progress tracking
- [ ] Upload automático para CDN
- [ ] Notificações em tempo real

### Semana 5: Testes e Otimização
- [ ] Testes de fluxo completo
- [ ] Testes de performance
- [ ] Otimizações de velocidade
- [ ] Documentação final

## 8. Critérios de Validação

### 8.1 Funcionalidade
- ✅ Upload de PPTX e processamento automático
- ✅ Geração de TTS para todos os slides
- ✅ Renderização de avatar 3D com lip sync
- ✅ Composição final em vídeo MP4
- ✅ Download via CDN

### 8.2 Performance
- ✅ Renderização de 5 slides em < 5 minutos
- ✅ Suporte a 3 renderizações simultâneas
- ✅ Taxa de sucesso > 95%
- ✅ Tempo de resposta da API < 2 segundos

### 8.3 Qualidade
- ✅ Vídeo final em qualidade HD (1080p)
- ✅ Áudio sincronizado com avatar
- ✅ Transições suaves entre slides
- ✅ Sem artefatos visuais ou de áudio

### 8.4 Experiência do Usuário
- ✅ Interface unificada sem módulos separados
- ✅ Progress tracking em tempo real
- ✅ Notificações de status
- ✅ Preview antes da renderização final