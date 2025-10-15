# 🚀 SPRINT 48 - SHIP REAL FEATURES, NOT PROMISES
**Data**: 05/10/2025 | **Status**: 🔥 EM EXECUÇÃO  
**Objetivo**: Transformar 30% → 80% de funcionalidades REAIS

---

## 🎯 META DO SPRINT

**Deliverable Final**: 1 vídeo NR12 completo gerado end-to-end
- Upload PPTX → Parser → Canvas → Render → Download
- Analytics REAL rastreando cada etapa
- Timeline funcional com preview
- Render queue com progresso real-time

---

## 📋 TASKS - ORDEM DE EXECUÇÃO

### FASE 1: Analytics Real (Base para tudo)
**Duração**: 45 min  
**Prioridade**: P0 (necessário para medir sucesso)

#### Task 1.1: Prisma Schema - Tabela de Métricas
```prisma
model AnalyticsEvent {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  eventType   String   // "upload", "render_start", "render_complete", "download"
  eventData   Json     // Dados específicos do evento
  timestamp   DateTime @default(now())
  
  @@index([userId])
  @@index([eventType])
  @@index([timestamp])
}

model RenderJob {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id])
  status        String   @default("pending") // pending, processing, completed, failed
  progress      Int      @default(0) // 0-100
  startedAt     DateTime?
  completedAt   DateTime?
  outputUrl     String?
  errorMessage  String?
  
  @@index([userId])
  @@index([status])
}
```

#### Task 1.2: API de Tracking
**Arquivo**: `app/api/analytics/track/route.ts`
```typescript
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventType, eventData } = await req.json();

  await prisma.analyticsEvent.create({
    data: {
      userId: session.user.id,
      eventType,
      eventData
    }
  });

  return NextResponse.json({ success: true });
}
```

#### Task 1.3: Hook de Tracking Client-Side
**Arquivo**: `hooks/use-analytics-track.ts`
```typescript
export function useAnalyticsTrack() {
  return {
    trackUpload: (fileSize: number, fileName: string) => {
      fetch('/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({
          eventType: 'upload',
          eventData: { fileSize, fileName }
        })
      });
    },
    trackRenderStart: (projectId: string) => { /* ... */ },
    trackRenderComplete: (projectId: string, duration: number) => { /* ... */ },
    trackDownload: (videoUrl: string) => { /* ... */ }
  };
}
```

---

### FASE 2: Parser PPTX Completo
**Duração**: 2h  
**Prioridade**: P0 (base do fluxo)

#### Task 2.1: Instalar Dependências
```bash
cd app && yarn add pptxgenjs officegen mammoth
```

#### Task 2.2: Parser Avançado
**Arquivo**: `lib/pptx/parser.ts`
```typescript
import PptxGenJS from 'pptxgenjs';

export async function parsePPTX(buffer: Buffer) {
  const pptx = new PptxGenJS();
  await pptx.load(buffer);
  
  const slides = pptx.slides.map((slide, index) => ({
    slideNumber: index + 1,
    elements: slide.getAllElements(), // Textos, imagens, formas
    layout: slide.getLayout(),
    background: slide.getBackground(),
    notes: slide.getNotes()
  }));
  
  return {
    slides,
    metadata: {
      title: pptx.title,
      author: pptx.author,
      slideCount: slides.length
    }
  };
}
```

#### Task 2.3: API de Upload com Parser
**Arquivo**: `app/api/pptx/upload/route.ts`
```typescript
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  // 1. Upload para S3
  const buffer = Buffer.from(await file.arrayBuffer());
  const s3Key = await uploadFile(buffer, file.name);
  
  // 2. Parse PPTX
  const parsed = await parsePPTX(buffer);
  
  // 3. Criar projeto no DB
  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      name: file.name,
      cloud_storage_path: s3Key,
      pptxData: parsed, // JSON com estrutura completa
      status: 'uploaded'
    }
  });
  
  // 4. Track analytics
  await prisma.analyticsEvent.create({
    data: {
      userId: session.user.id,
      eventType: 'upload',
      eventData: { projectId: project.id, fileSize: file.size }
    }
  });
  
  return NextResponse.json({ project });
}
```

---

### FASE 3: Render Queue com Redis
**Duração**: 2h  
**Prioridade**: P0 (crítico para escala)

#### Task 3.1: BullMQ Setup
```bash
cd app && yarn add bullmq ioredis
```

#### Task 3.2: Queue Worker
**Arquivo**: `lib/queue/video-render-worker.ts`
```typescript
import { Worker, Job } from 'bullmq';
import { renderVideo } from '@/lib/ffmpeg/video-processor';
import { prisma } from '@/lib/db';

const worker = new Worker('video-render', async (job: Job) => {
  const { projectId, userId } = job.data;
  
  // Atualizar status no DB
  await prisma.renderJob.update({
    where: { id: job.id },
    data: { status: 'processing', startedAt: new Date() }
  });
  
  try {
    // Render com FFmpeg
    const outputUrl = await renderVideo(projectId, (progress) => {
      // Atualizar progresso
      job.updateProgress(progress);
      prisma.renderJob.update({
        where: { id: job.id },
        data: { progress }
      });
    });
    
    // Marcar como completo
    await prisma.renderJob.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        outputUrl,
        progress: 100
      }
    });
    
    return { outputUrl };
  } catch (error) {
    await prisma.renderJob.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        errorMessage: error.message
      }
    });
    throw error;
  }
}, {
  connection: { host: 'localhost', port: 6379 }
});
```

#### Task 3.3: API de Render
**Arquivo**: `app/api/video/render/route.ts`
```typescript
import { Queue } from 'bullmq';

const videoQueue = new Queue('video-render', {
  connection: { host: 'localhost', port: 6379 }
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const { projectId } = await req.json();
  
  // Criar render job no DB
  const renderJob = await prisma.renderJob.create({
    data: {
      userId: session.user.id,
      projectId,
      status: 'pending'
    }
  });
  
  // Adicionar à queue
  await videoQueue.add('render', {
    jobId: renderJob.id,
    projectId,
    userId: session.user.id
  });
  
  return NextResponse.json({ jobId: renderJob.id });
}
```

#### Task 3.4: API de Status
**Arquivo**: `app/api/video/render/[jobId]/route.ts`
```typescript
export async function GET(req: Request, { params }: { params: { jobId: string } }) {
  const job = await prisma.renderJob.findUnique({
    where: { id: params.jobId }
  });
  
  return NextResponse.json(job);
}
```

---

### FASE 4: Timeline com Preview Real
**Duração**: 3h  
**Prioridade**: P1 (UX crítica)

#### Task 4.1: Hook de Timeline
**Arquivo**: `hooks/use-timeline-real.ts`
```typescript
export function useTimelineReal(projectId: string) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Carregar projeto
  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then(r => r.json())
      .then(data => {
        setTracks(data.timeline.tracks);
      });
  }, [projectId]);
  
  // Sincronização de tempo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);
  
  return {
    tracks,
    currentTime,
    videoRef,
    addTrack: (track: Track) => setTracks([...tracks, track]),
    removeTrack: (id: string) => setTracks(tracks.filter(t => t.id !== id)),
    updateTrack: (id: string, data: Partial<Track>) => {
      setTracks(tracks.map(t => t.id === id ? { ...t, ...data } : t));
    }
  };
}
```

#### Task 4.2: Componente de Timeline
**Arquivo**: `components/timeline/timeline-real.tsx`
```typescript
export function TimelineReal({ projectId }: { projectId: string }) {
  const { tracks, currentTime, videoRef, addTrack } = useTimelineReal(projectId);
  
  return (
    <div className="timeline-container">
      {/* Video Preview */}
      <video ref={videoRef} controls className="w-full" />
      
      {/* Timeline Tracks */}
      <div className="tracks">
        {tracks.map(track => (
          <TimelineTrack
            key={track.id}
            track={track}
            currentTime={currentTime}
          />
        ))}
      </div>
      
      {/* Playhead */}
      <div
        className="playhead"
        style={{ left: `${(currentTime / totalDuration) * 100}%` }}
      />
    </div>
  );
}
```

---

### FASE 5: Dashboard Analytics REAL
**Duração**: 1h  
**Prioridade**: P1 (validação de métricas)

#### Task 5.1: API de Métricas
**Arquivo**: `app/api/analytics/metrics/route.ts`
```typescript
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  const [uploads, renders, downloads] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { userId: session.user.id, eventType: 'upload' }
    }),
    prisma.analyticsEvent.count({
      where: { userId: session.user.id, eventType: 'render_complete' }
    }),
    prisma.analyticsEvent.count({
      where: { userId: session.user.id, eventType: 'download' }
    })
  ]);
  
  return NextResponse.json({ uploads, renders, downloads });
}
```

#### Task 5.2: Dashboard Atualizado
**Arquivo**: `app/analytics-real/page.tsx`
```typescript
export default function AnalyticsRealPage() {
  const { data } = useSWR('/api/analytics/metrics', fetcher);
  
  return (
    <div>
      <h1>Analytics REAL</h1>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Uploads" value={data?.uploads || 0} />
        <MetricCard title="Renders" value={data?.renders || 0} />
        <MetricCard title="Downloads" value={data?.downloads || 0} />
      </div>
    </div>
  );
}
```

---

## ✅ CRITÉRIOS DE SUCESSO

### Teste End-to-End:
1. ✅ Upload de `NR 11 – SEGURANÇA NA OPERAÇÃO DE EMPILHADEIRAS.pptx`
2. ✅ Parser extrai 8 slides com textos + imagens
3. ✅ Canvas mostra preview correto
4. ✅ Botão "Render" adiciona job à queue
5. ✅ Progresso atualiza em tempo real (0% → 100%)
6. ✅ Vídeo final disponível para download
7. ✅ Analytics registra: 1 upload, 1 render, 1 download
8. ✅ Dashboard mostra métricas corretas

---

## 📊 ESTIMATIVA DE TEMPO

| Fase | Duração | Status |
|------|---------|--------|
| FASE 1: Analytics | 45 min | 🔜 Próximo |
| FASE 2: Parser PPTX | 2h | ⏳ Aguardando |
| FASE 3: Render Queue | 2h | ⏳ Aguardando |
| FASE 4: Timeline | 3h | ⏳ Aguardando |
| FASE 5: Dashboard | 1h | ⏳ Aguardando |
| **TOTAL** | **9h** | |

---

## 🚀 COMEÇANDO AGORA

**Primeira tarefa**: FASE 1 - Analytics Real (Task 1.1)

```bash
# 1. Atualizar Prisma Schema
# 2. Gerar migration
# 3. Aplicar migration
# 4. Gerar client
# 5. Testar
```

**Comandante pronto para executar!** 🎯

---

**Assinado**: DeepAgent AI  
**Sprint**: 48  
**Motto**: Ship real features, not promises 🚀
