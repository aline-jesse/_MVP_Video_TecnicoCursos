# 🎯 PLANO DE IMPLEMENTAÇÃO - 100% FUNCIONAL REAL

**Documento**: Roadmap técnico completo  
**Data**: 06/10/2025  
**Objetivo**: Eliminar TODOS os mocks e tornar o sistema 100% funcional  
**Score Atual**: 70-75% funcional real  
**Score Meta**: 100% funcional real  

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Estado Atual Detalhado](#estado-atual-detalhado)
3. [Arquitetura de Implementação](#arquitetura-de-implementação)
4. [FASE 1 - PPTX Processing Real](#fase-1)
5. [FASE 2 - Render Queue Real](#fase-2)
6. [FASE 3 - Compliance NR Inteligente](#fase-3)
7. [FASE 4 - Analytics Completo](#fase-4)
8. [FASE 5 - Timeline Profissional](#fase-5)
9. [FASE 6 - Avatar 3D Assets](#fase-6)
10. [FASE 7 - Voice Cloning Real](#fase-7)
11. [FASE 8 - Collaboration Real-Time](#fase-8)
12. [FASE 9 - Canvas Advanced](#fase-9)
13. [FASE 10 - Integrações Finais](#fase-10)
14. [Cronograma e Recursos](#cronograma)
15. [Critérios de Aceitação](#critérios)

---

## 🔍 VISÃO GERAL {#visão-geral}

### Objetivo Principal
Transformar todas as funcionalidades mockadas em implementações reais e funcionais, garantindo que o sistema seja production-ready para uso real com clientes.

### Princípios
1. **Zero Mocks**: Eliminar todos os dados fake/simulados
2. **Real Data**: Todas as features devem processar dados reais
3. **Production Ready**: Código pronto para escala e produção
4. **Testável**: Cada módulo com testes automatizados
5. **Documentado**: Código e APIs documentados

### Estratégia
- **Implementação incremental**: Uma fase por vez
- **Checkpoint após cada fase**: Build + test + save
- **Validação contínua**: Smoke tests em cada entrega
- **Rollback seguro**: Git tags em cada fase

---

## 📊 ESTADO ATUAL DETALHADO {#estado-atual-detalhado}

### Módulos por Status

#### ✅ COMPLETOS E FUNCIONAIS (30%)
```
- Next.js 14 + React 18
- TypeScript + ESLint
- Tailwind CSS + Shadcn UI
- Prisma ORM + PostgreSQL
- NextAuth.js (sessões funcionais)
- AWS S3 (upload/download real)
- Redis (configurado)
- FFmpeg (instalado)
- Projects CRUD (85% funcional)
- Video Player (100% funcional)
- Canvas Editor Pro V3 (95% funcional)
```

#### ⚠️ PARCIALMENTE FUNCIONAIS (40%)
```
- PPTX Upload: funciona
- PPTX Processing: mockado (30% real)
- Render Queue: fallback mock (40% real)
- Analytics: mix real/mock (60% real)
- Compliance NR: superficial (40% real)
- Timeline: básico (50% real)
- TTS: funcional mas sem cache (90% real)
- Studio Wizard: UI ok, backend mock (60% real)
```

#### ❌ MOCKADOS/NÃO FUNCIONAIS (30%)
```
- Voice Cloning: 100% mockado (15% real)
- Collaboration: WebSocket mock (10% real)
- Avatar 3D Assets: URLs fake (20% real)
- PPTX Parsing: simulação completa (0% real)
- Render Video: mock quando sem Redis (10% real)
- Export Advanced: básico (30% real)
```

---

## 🏗️ ARQUITETURA DE IMPLEMENTAÇÃO {#arquitetura-de-implementação}

### Fluxo End-to-End Real (Objetivo Final)

```
USUÁRIO
  ↓
[1] Upload PPTX Real
  ↓
[2] Parse PPTX → Extrai texto, imagens, layouts REAIS
  ↓
[3] Timeline Editor → Edita com preview REAL
  ↓
[4] Compliance NR → Valida com IA REAL
  ↓
[5] Adiciona Avatar 3D → Assets REAIS do S3
  ↓
[6] Adiciona TTS/Voice Cloning → Áudio REAL
  ↓
[7] Render Queue → FFmpeg gera vídeo REAL
  ↓
[8] Export Video → S3 URL REAL
  ↓
[9] Analytics → Tracking REAL no DB
  ↓
[10] Collaboration → WebSocket REAL (opcional)
```

### Dependências entre Fases

```
FASE 1 (PPTX)
  ↓
FASE 2 (Render) ← depende de FASE 1
  ↓
FASE 3 (Compliance) ← pode ser paralelo
  ↓
FASE 4 (Analytics) ← pode ser paralelo
  ↓
FASE 5 (Timeline) ← depende de FASE 1 e 2
  ↓
FASE 6 (Avatar) ← depende de FASE 2
  ↓
FASE 7 (Voice) ← depende de FASE 2
  ↓
FASE 8 (Collaboration) ← independente
  ↓
FASE 9 (Canvas Advanced) ← depende de FASE 5
  ↓
FASE 10 (Integrações) ← depende de todas
```

---

## 🔧 FASE 1 - PPTX PROCESSING REAL {#fase-1}

**Prioridade**: 🔴 CRÍTICA  
**Tempo Estimado**: 4-6 dias  
**Dependências**: Nenhuma  
**Status Atual**: 30% real (upload funciona, parsing é fake)

### Objetivo
Implementar parsing REAL de PPTX com extração de texto, imagens, layouts, animações e metadados reais.

### Problemas Atuais
```typescript
// api/v1/pptx/process/route.ts
// Código atual GERA dados FAKE:
slides.push({
  title: `Slide ${i}`,  // ❌ FAKE
  content: `Conteúdo do slide ${i}`,  // ❌ FAKE
  images: [`/api/mock/image-${i}.jpg`],  // ❌ FAKE
  notes: `Anotações do slide ${i}`,  // ❌ FAKE
})
```

### Tasks Detalhadas

#### Task 1.1: Instalar e Configurar PptxGenJS
**Tempo**: 2h  
**Arquivos**:
```bash
# Instalar dependências
yarn add pptxgenjs
yarn add --dev @types/pptxgenjs

# Criar config
touch app/lib/pptx/pptx-config.ts
```

**Código**:
```typescript
// app/lib/pptx/pptx-config.ts
import PptxGenJS from 'pptxgenjs';

export const createPptxParser = () => {
  return new PptxGenJS();
};

export interface PPTXSlide {
  slideNumber: number;
  title: string;
  content: string[];
  images: PPTXImage[];
  notes: string;
  layout: string;
  backgroundImage?: string;
  shapes: PPTXShape[];
  tables: PPTXTable[];
  charts: PPTXChart[];
}

export interface PPTXImage {
  id: string;
  url: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface PPTXShape {
  type: string;
  text: string;
  style: Record<string, any>;
}

export interface PPTXTable {
  rows: string[][];
}

export interface PPTXChart {
  type: string;
  data: any[];
}
```

**Critério de Aceitação**: Config criada e tipos definidos

---

#### Task 1.2: Implementar Parser Real de Texto
**Tempo**: 4h  
**Arquivos**:
```bash
touch app/lib/pptx/text-parser.ts
```

**Código**:
```typescript
// app/lib/pptx/text-parser.ts
import PptxGenJS from 'pptxgenjs';
import { S3StorageService } from '@/lib/s3-storage';

export class PPTXTextParser {
  private s3Service: S3StorageService;

  constructor() {
    this.s3Service = new S3StorageService();
  }

  async parseFromS3(s3Key: string): Promise<ParsedText[]> {
    // 1. Download PPTX do S3
    const buffer = await this.s3Service.downloadFile(s3Key);
    
    // 2. Parse com PptxGenJS
    const pptx = new PptxGenJS();
    await pptx.load(buffer);
    
    // 3. Extrair texto de cada slide
    const slides = pptx.slides;
    const parsedTexts: ParsedText[] = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const textBlocks: string[] = [];

      // Extrair texto de shapes
      slide.objects.forEach((obj: any) => {
        if (obj.type === 'text' || obj.type === 'placeholder') {
          if (obj.text) {
            textBlocks.push(obj.text);
          }
        }
      });

      // Extrair speaker notes
      const notes = slide.notes || '';

      parsedTexts.push({
        slideNumber: i + 1,
        title: this.extractTitle(textBlocks),
        contentBlocks: textBlocks,
        speakerNotes: notes,
        wordCount: textBlocks.join(' ').split(' ').length
      });
    }

    return parsedTexts;
  }

  private extractTitle(blocks: string[]): string {
    // Primeiro bloco geralmente é o título
    return blocks[0] || `Slide ${Date.now()}`;
  }
}

interface ParsedText {
  slideNumber: number;
  title: string;
  contentBlocks: string[];
  speakerNotes: string;
  wordCount: number;
}
```

**Critério de Aceitação**: Extrair texto real dos slides

---

#### Task 1.3: Implementar Parser Real de Imagens
**Tempo**: 6h  
**Arquivos**:
```bash
touch app/lib/pptx/image-parser.ts
```

**Código**:
```typescript
// app/lib/pptx/image-parser.ts
import PptxGenJS from 'pptxgenjs';
import { S3StorageService } from '@/lib/s3-storage';
import sharp from 'sharp';

export class PPTXImageParser {
  private s3Service: S3StorageService;

  constructor() {
    this.s3Service = new S3StorageService();
  }

  async extractImages(s3Key: string, projectId: string): Promise<ExtractedImage[]> {
    const buffer = await this.s3Service.downloadFile(s3Key);
    const pptx = new PptxGenJS();
    await pptx.load(buffer);

    const extractedImages: ExtractedImage[] = [];

    for (let i = 0; i < pptx.slides.length; i++) {
      const slide = pptx.slides[i];

      // Extrair imagens da slide
      const images = slide.objects.filter((obj: any) => obj.type === 'image');

      for (const img of images) {
        try {
          // Obter buffer da imagem
          const imageBuffer = img.data; // PptxGenJS fornece o buffer

          // Processar com Sharp (redimensionar, otimizar)
          const processedBuffer = await sharp(imageBuffer)
            .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();

          // Upload para S3
          const s3ImageKey = `projects/${projectId}/images/slide-${i + 1}-img-${Date.now()}.jpg`;
          await this.s3Service.uploadFile(processedBuffer, s3ImageKey);

          const publicUrl = await this.s3Service.getPublicUrl(s3ImageKey);

          extractedImages.push({
            slideNumber: i + 1,
            s3Key: s3ImageKey,
            publicUrl,
            width: img.options?.w || 0,
            height: img.options?.h || 0,
            x: img.options?.x || 0,
            y: img.options?.y || 0,
            originalFormat: 'image/jpeg'
          });
        } catch (error) {
          console.error(`Erro ao extrair imagem do slide ${i + 1}:`, error);
        }
      }
    }

    return extractedImages;
  }
}

interface ExtractedImage {
  slideNumber: number;
  s3Key: string;
  publicUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
  originalFormat: string;
}
```

**Dependências adicionais**:
```bash
yarn add sharp
yarn add --dev @types/sharp
```

**Critério de Aceitação**: Imagens extraídas e armazenadas no S3

---

#### Task 1.4: Implementar Parser de Layouts
**Tempo**: 3h  
**Arquivos**:
```bash
touch app/lib/pptx/layout-parser.ts
```

**Código**:
```typescript
// app/lib/pptx/layout-parser.ts
export class PPTXLayoutParser {
  detectLayout(slide: any): LayoutInfo {
    const objects = slide.objects || [];
    
    // Detectar tipo de layout baseado em objetos
    const hasTitle = objects.some((obj: any) => 
      obj.type === 'placeholder' && obj.name === 'Title'
    );
    const hasContent = objects.some((obj: any) => 
      obj.type === 'placeholder' && obj.name === 'Content'
    );
    const imageCount = objects.filter((obj: any) => obj.type === 'image').length;
    const textCount = objects.filter((obj: any) => obj.type === 'text').length;

    let layoutType = 'blank';
    
    if (hasTitle && hasContent) {
      layoutType = 'title-content';
    } else if (hasTitle && imageCount > 0) {
      layoutType = 'title-image';
    } else if (imageCount > 1) {
      layoutType = 'comparison';
    } else if (hasTitle && textCount > 2) {
      layoutType = 'title-bullet-points';
    }

    return {
      type: layoutType,
      hasTitle,
      hasContent,
      imageCount,
      textBoxCount: textCount,
      backgroundType: slide.background ? 'custom' : 'default'
    };
  }
}

interface LayoutInfo {
  type: string;
  hasTitle: boolean;
  hasContent: boolean;
  imageCount: number;
  textBoxCount: number;
  backgroundType: string;
}
```

**Critério de Aceitação**: Detectar layout real de cada slide

---

#### Task 1.5: Refatorar API de Processamento
**Tempo**: 4h  
**Arquivos**:
```bash
# Modificar API existente
vim app/api/v1/pptx/process/route.ts
```

**Código**:
```typescript
// app/api/v1/pptx/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PPTXTextParser } from '@/lib/pptx/text-parser';
import { PPTXImageParser } from '@/lib/pptx/image-parser';
import { PPTXLayoutParser } from '@/lib/pptx/layout-parser';

export async function POST(request: NextRequest) {
  try {
    const { s3Key, projectId } = await request.json();

    if (!s3Key || !projectId) {
      return NextResponse.json({
        success: false,
        error: 'S3 key e Project ID são obrigatórios'
      }, { status: 400 });
    }

    console.log(`🔄 Processando PPTX REAL: ${s3Key}`);

    // Update status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'processing' }
    });

    // 1. Parse texto REAL
    const textParser = new PPTXTextParser();
    const parsedTexts = await textParser.parseFromS3(s3Key);

    // 2. Parse imagens REAL
    const imageParser = new PPTXImageParser();
    const extractedImages = await imageParser.extractImages(s3Key, projectId);

    // 3. Parse layouts REAL
    const layoutParser = new PPTXLayoutParser();
    // ... (implementar detecção de layout)

    // 4. Criar slides no DB com dados REAIS
    const slidesData = parsedTexts.map((text, index) => {
      const slideImages = extractedImages.filter(img => img.slideNumber === index + 1);
      
      return {
        projectId,
        slideNumber: index + 1,
        title: text.title,
        content: text.contentBlocks.join('\n'),
        notes: text.speakerNotes,
        duration: this.calculateDuration(text.wordCount),
        images: slideImages.map(img => img.publicUrl),
        layout: 'auto-detected', // TODO: usar layoutParser
      };
    });

    // Salvar no banco
    await prisma.slide.createMany({
      data: slidesData
    });

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: 'ready',
        totalSlides: slidesData.length
      }
    });

    return NextResponse.json({
      success: true,
      projectId,
      slidesProcessed: slidesData.length,
      extractedContent: {
        slides: slidesData,
        images: extractedImages,
        totalWordCount: parsedTexts.reduce((sum, t) => sum + t.wordCount, 0)
      }
    });

  } catch (error: any) {
    console.error('Erro ao processar PPTX:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }

  private calculateDuration(wordCount: number): number {
    // 150 palavras por minuto (média de fala)
    const minutes = wordCount / 150;
    return Math.max(5, Math.ceil(minutes * 60)); // mínimo 5 segundos
  }
}
```

**Critério de Aceitação**: API processa PPTX real e salva no DB

---

#### Task 1.6: Atualizar Schema Prisma
**Tempo**: 1h  
**Arquivos**:
```bash
vim app/prisma/schema.prisma
```

**Código**:
```prisma
// Adicionar campos ao modelo Slide
model Slide {
  id            String   @id @default(cuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  slideNumber   Int
  title         String
  content       String   @db.Text
  notes         String?  @db.Text
  
  // Novos campos para PPTX real
  images        String[] // URLs S3
  layout        String   @default("auto")
  backgroundColor String?
  backgroundImage String?
  
  // Metadados
  wordCount     Int      @default(0)
  estimatedDuration Int  @default(5) // segundos
  
  // Assets extraídos
  extractedShapes Json?
  extractedTables Json?
  extractedCharts Json?
  
  duration      Int      @default(5)
  order         Int
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([projectId, slideNumber])
  @@index([projectId])
}
```

**Executar**:
```bash
cd app
npx prisma format
npx prisma generate
npx prisma migrate dev --name add-pptx-real-fields
```

**Critério de Aceitação**: Schema atualizado e migração aplicada

---

#### Task 1.7: Criar Testes Unitários
**Tempo**: 3h  
**Arquivos**:
```bash
mkdir -p app/tests/unit/pptx
touch app/tests/unit/pptx/text-parser.test.ts
touch app/tests/unit/pptx/image-parser.test.ts
```

**Código**:
```typescript
// app/tests/unit/pptx/text-parser.test.ts
import { PPTXTextParser } from '@/lib/pptx/text-parser';

describe('PPTXTextParser', () => {
  it('should extract text from PPTX', async () => {
    const parser = new PPTXTextParser();
    const result = await parser.parseFromS3('test-file.pptx');
    
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('contentBlocks');
  });

  it('should handle PPTX without text', async () => {
    const parser = new PPTXTextParser();
    const result = await parser.parseFromS3('empty.pptx');
    
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });
});
```

**Critério de Aceitação**: Testes passando

---

### Resumo FASE 1

**Arquivos Criados**:
- `app/lib/pptx/pptx-config.ts`
- `app/lib/pptx/text-parser.ts`
- `app/lib/pptx/image-parser.ts`
- `app/lib/pptx/layout-parser.ts`
- `app/tests/unit/pptx/*.test.ts`

**Arquivos Modificados**:
- `app/api/v1/pptx/process/route.ts`
- `app/prisma/schema.prisma`

**Dependências Adicionadas**:
- `pptxgenjs`
- `sharp`
- `@types/sharp`

**Tempo Total**: 4-6 dias  
**Linhas de Código**: ~800-1000 LOC

**Critério de Aceitação Final**:
- [ ] Upload PPTX funciona
- [ ] Texto é extraído corretamente
- [ ] Imagens são extraídas e salvas no S3
- [ ] Layouts são detectados
- [ ] Dados salvos no banco
- [ ] Testes unitários passando
- [ ] Build sem erros
- [ ] Smoke test: Upload NR11.pptx → visualizar slides reais

---

## 🎬 FASE 2 - RENDER QUEUE REAL {#fase-2}

**Prioridade**: 🔴 CRÍTICA  
**Tempo Estimado**: 3-4 dias  
**Dependências**: FASE 1 (precisa de slides reais)  
**Status Atual**: 40% real (mock fallback ativo)

### Objetivo
Implementar render REAL de vídeos com FFmpeg, processamento de fila com Redis, e geração de vídeos reais no S3.

### Problemas Atuais
```typescript
// lib/queue/render-queue.ts
// Quando Redis não conecta, retorna mock:
return {
  videoUrl: 'https://storage.example.com/fake.mp4', // ❌ FAKE
  duration: 120 // ❌ FAKE
}
```

### Tasks Detalhadas

#### Task 2.1: Garantir Redis Always-On
**Tempo**: 2h  
**Arquivos**:
```bash
touch app/lib/redis/redis-health.ts
touch app/lib/redis/redis-reconnect.ts
```

**Código**:
```typescript
// app/lib/redis/redis-health.ts
import Redis from 'ioredis';

export class RedisHealthChecker {
  private redis: Redis;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        if (times > this.maxReconnectAttempts) {
          console.error('[Redis] Max reconnect attempts reached');
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.redis.on('connect', () => {
      console.log('✅ [Redis] Connected successfully');
      this.reconnectAttempts = 0;
    });

    this.redis.on('error', (err) => {
      console.error('❌ [Redis] Error:', err.message);
    });

    this.redis.on('reconnecting', () => {
      this.reconnectAttempts++;
      console.log(`🔄 [Redis] Reconnecting... (attempt ${this.reconnectAttempts})`);
    });
  }

  async checkHealth(): Promise<boolean> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch (error) {
      return false;
    }
  }

  async ensureConnection(): Promise<void> {
    const isHealthy = await this.checkHealth();
    if (!isHealthy) {
      throw new Error('Redis connection failed. Cannot proceed without Redis.');
    }
  }

  getRedisClient(): Redis {
    return this.redis;
  }
}

// Singleton instance
export const redisHealth = new RedisHealthChecker();
```

**Critério de Aceitação**: Redis sempre conectado, sem fallback mock

---

#### Task 2.2: Implementar FFmpeg Video Generator
**Tempo**: 8h  
**Arquivos**:
```bash
touch app/lib/video/ffmpeg-renderer.ts
touch app/lib/video/scene-composer.ts
```

**Código**:
```typescript
// app/lib/video/ffmpeg-renderer.ts
import ffmpeg from 'fluent-ffmpeg';
import { S3StorageService } from '@/lib/s3-storage';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

export interface RenderScene {
  slideNumber: number;
  imageUrl: string; // URL da imagem do slide
  audioUrl: string; // URL do áudio TTS
  duration: number; // duração em segundos
  transition?: string;
}

export class FFmpegRenderer {
  private s3Service: S3StorageService;
  private tempDir: string;

  constructor() {
    this.s3Service = new S3StorageService();
    this.tempDir = '/tmp/video-renders';
    fs.ensureDirSync(this.tempDir);
  }

  async renderVideo(
    projectId: string,
    scenes: RenderScene[],
    options: RenderOptions
  ): Promise<RenderResult> {
    const jobId = uuidv4();
    const workDir = path.join(this.tempDir, jobId);
    fs.ensureDirSync(workDir);

    try {
      console.log(`🎬 [FFmpeg] Starting render for project ${projectId}`);

      // 1. Download todos os assets (imagens e áudios)
      const sceneFiles = await this.downloadSceneAssets(scenes, workDir);

      // 2. Criar concat list para FFmpeg
      const concatFile = await this.createConcatList(sceneFiles, workDir);

      // 3. Render vídeo com FFmpeg
      const outputFile = path.join(workDir, 'output.mp4');
      await this.executeFFmpeg(concatFile, outputFile, options);

      // 4. Upload para S3
      const videoBuffer = await fs.readFile(outputFile);
      const s3Key = `projects/${projectId}/videos/render-${Date.now()}.mp4`;
      await this.s3Service.uploadFile(videoBuffer, s3Key);
      const publicUrl = await this.s3Service.getPublicUrl(s3Key);

      // 5. Obter metadados do vídeo
      const metadata = await this.getVideoMetadata(outputFile);

      // 6. Limpar arquivos temporários
      await fs.remove(workDir);

      console.log(`✅ [FFmpeg] Render completed: ${publicUrl}`);

      return {
        success: true,
        videoUrl: publicUrl,
        s3Key,
        duration: metadata.duration,
        fileSize: metadata.fileSize,
        resolution: metadata.resolution
      };

    } catch (error: any) {
      console.error(`❌ [FFmpeg] Render failed:`, error);
      await fs.remove(workDir);
      throw error;
    }
  }

  private async downloadSceneAssets(
    scenes: RenderScene[],
    workDir: string
  ): Promise<SceneFile[]> {
    const sceneFiles: SceneFile[] = [];

    for (const [index, scene] of scenes.entries()) {
      // Download imagem
      const imagePath = path.join(workDir, `slide-${index}.jpg`);
      const imageBuffer = await this.downloadFromUrl(scene.imageUrl);
      await fs.writeFile(imagePath, imageBuffer);

      // Download áudio
      const audioPath = path.join(workDir, `audio-${index}.mp3`);
      const audioBuffer = await this.downloadFromUrl(scene.audioUrl);
      await fs.writeFile(audioPath, audioBuffer);

      sceneFiles.push({
        slideNumber: scene.slideNumber,
        imagePath,
        audioPath,
        duration: scene.duration
      });
    }

    return sceneFiles;
  }

  private async downloadFromUrl(url: string): Promise<Buffer> {
    // Se for S3 URL, usa S3Service
    if (url.includes('s3.amazonaws.com') || url.includes('cloudfront')) {
      const s3Key = this.extractS3KeyFromUrl(url);
      return await this.s3Service.downloadFile(s3Key);
    }
    
    // Senão, fetch direto
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private extractS3KeyFromUrl(url: string): string {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // remove leading /
  }

  private async createConcatList(
    sceneFiles: SceneFile[],
    workDir: string
  ): Promise<string> {
    // Criar arquivo de lista para concatenação
    const listPath = path.join(workDir, 'concat-list.txt');
    const lines: string[] = [];

    for (const scene of sceneFiles) {
      // Para cada cena, criar um vídeo temporário (imagem + áudio)
      const tempVideoPath = await this.createSceneVideo(scene, workDir);
      lines.push(`file '${tempVideoPath}'`);
    }

    await fs.writeFile(listPath, lines.join('\n'));
    return listPath;
  }

  private async createSceneVideo(
    scene: SceneFile,
    workDir: string
  ): Promise<string> {
    const outputPath = path.join(workDir, `scene-${scene.slideNumber}.mp4`);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(scene.imagePath)
        .inputOptions(['-loop 1', '-t ' + scene.duration])
        .input(scene.audioPath)
        .outputOptions([
          '-c:v libx264',
          '-tune stillimage',
          '-c:a aac',
          '-b:a 192k',
          '-pix_fmt yuv420p',
          '-shortest'
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  private async executeFFmpeg(
    concatFile: string,
    outputFile: string,
    options: RenderOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatFile)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions([
          '-c copy',
          '-movflags +faststart' // Otimizar para streaming
        ])
        .output(outputFile)
        .on('progress', (progress) => {
          console.log(`[FFmpeg] Progress: ${progress.percent?.toFixed(2)}%`);
        })
        .on('end', () => {
          console.log('[FFmpeg] Concatenation complete');
          resolve();
        })
        .on('error', (err) => {
          console.error('[FFmpeg] Error:', err);
          reject(err);
        })
        .run();
    });
  }

  private async getVideoMetadata(filePath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const duration = metadata.format.duration || 0;
        const fileSize = metadata.format.size || 0;

        resolve({
          duration,
          fileSize,
          resolution: {
            width: videoStream?.width || 1920,
            height: videoStream?.height || 1080
          }
        });
      });
    });
  }
}

interface SceneFile {
  slideNumber: number;
  imagePath: string;
  audioPath: string;
  duration: number;
}

interface RenderOptions {
  resolution?: { width: number; height: number };
  fps?: number;
  bitrate?: string;
}

interface RenderResult {
  success: boolean;
  videoUrl: string;
  s3Key: string;
  duration: number;
  fileSize: number;
  resolution: { width: number; height: number };
}

interface VideoMetadata {
  duration: number;
  fileSize: number;
  resolution: { width: number; height: number };
}
```

**Dependências**:
```bash
yarn add fluent-ffmpeg
yarn add fs-extra
yarn add uuid
yarn add --dev @types/fluent-ffmpeg @types/fs-extra @types/uuid
```

**Critério de Aceitação**: FFmpeg gera vídeo real a partir de slides + áudio

---

#### Task 2.3: Refatorar Render Queue (Remover Mock)
**Tempo**: 4h  
**Arquivos**:
```bash
vim app/lib/queue/render-queue.ts
```

**Código**:
```typescript
// app/lib/queue/render-queue.ts
import { Queue, Worker, Job } from 'bullmq';
import { redisHealth } from '@/lib/redis/redis-health';
import { FFmpegRenderer } from '@/lib/video/ffmpeg-renderer';
import { prisma } from '@/lib/prisma';

export interface RenderJobData {
  projectId: string;
  userId: string;
  scenes: Array<{
    slideNumber: number;
    imageUrl: string;
    audioUrl: string;
    duration: number;
  }>;
  options: {
    resolution?: { width: number; height: number };
    fps?: number;
  };
}

export interface RenderJobResult {
  success: boolean;
  videoUrl: string;
  s3Key: string;
  duration: number;
  error?: string;
}

export class RenderQueueService {
  private queue: Queue<RenderJobData, RenderJobResult>;
  private worker: Worker<RenderJobData, RenderJobResult>;

  constructor() {
    // SEMPRE usar Redis REAL (sem fallback mock)
    const connection = redisHealth.getRedisClient();

    this.queue = new Queue<RenderJobData, RenderJobResult>('video-render', {
      connection: connection as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: {
          age: 24 * 3600, // manter 24h
          count: 100
        },
        removeOnFail: {
          age: 7 * 24 * 3600 // manter 7 dias
        }
      }
    });

    // Criar worker para processar jobs
    this.worker = new Worker<RenderJobData, RenderJobResult>(
      'video-render',
      async (job: Job<RenderJobData>) => {
        return await this.processRenderJob(job);
      },
      {
        connection: connection as any,
        concurrency: 2, // processar 2 vídeos simultaneamente
        limiter: {
          max: 10, // máximo 10 jobs por
          duration: 60000 // 1 minuto
        }
      }
    );

    this.setupWorkerEvents();
  }

  private async processRenderJob(
    job: Job<RenderJobData>
  ): Promise<RenderJobResult> {
    const { projectId, userId, scenes, options } = job.data;

    console.log(`🎬 [RenderQueue] Processing job ${job.id} for project ${projectId}`);

    try {
      // Update progress: downloading assets
      await job.updateProgress(10);

      // Update project status
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'rendering', progress: 10 }
      });

      // Render vídeo com FFmpeg
      const renderer = new FFmpegRenderer();
      
      await job.updateProgress(30);

      const result = await renderer.renderVideo(projectId, scenes, options);

      await job.updateProgress(90);

      // Update project com vídeo final
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'completed',
          progress: 100,
          videoUrl: result.videoUrl,
          s3VideoKey: result.s3Key,
          duration: result.duration
        }
      });

      await job.updateProgress(100);

      console.log(`✅ [RenderQueue] Job ${job.id} completed successfully`);

      return {
        success: true,
        videoUrl: result.videoUrl,
        s3Key: result.s3Key,
        duration: result.duration
      };

    } catch (error: any) {
      console.error(`❌ [RenderQueue] Job ${job.id} failed:`, error);

      // Update project com erro
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'failed',
          errorMessage: error.message
        }
      });

      return {
        success: false,
        videoUrl: '',
        s3Key: '',
        duration: 0,
        error: error.message
      };
    }
  }

  private setupWorkerEvents() {
    this.worker.on('completed', (job, result) => {
      console.log(`✅ [Worker] Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`❌ [Worker] Job ${job?.id} failed:`, err.message);
    });

    this.worker.on('progress', (job, progress) => {
      console.log(`📊 [Worker] Job ${job.id} progress: ${progress}%`);
    });
  }

  async addRenderJob(data: RenderJobData): Promise<string> {
    // Verificar conexão Redis
    await redisHealth.ensureConnection();

    const job = await this.queue.add('render-video', data, {
      jobId: `render-${data.projectId}-${Date.now()}`
    });

    console.log(`➕ [RenderQueue] Job ${job.id} added to queue`);

    return job.id!;
  }

  async getJobStatus(jobId: string): Promise<JobStatus | null> {
    const job = await this.queue.getJob(jobId);
    
    if (!job) return null;

    const state = await job.getState();
    const progress = job.progress;

    return {
      jobId: job.id!,
      status: state,
      progress: typeof progress === 'number' ? progress : 0,
      result: await job.returnvalue
    };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.queue.getJob(jobId);
    if (!job) return false;

    await job.remove();
    return true;
  }
}

interface JobStatus {
  jobId: string;
  status: string;
  progress: number;
  result?: RenderJobResult;
}

// Singleton
export const renderQueue = new RenderQueueService();
```

**Critério de Aceitação**: Queue processa jobs reais, sem mock fallback

---

#### Task 2.4: Criar API de Start Render
**Tempo**: 2h  
**Arquivos**:
```bash
touch app/api/v1/render/start/route.ts
```

**Código**:
```typescript
// app/api/v1/render/start/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { renderQueue } from '@/lib/queue/render-queue';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Buscar project e slides
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { slides: { orderBy: { order: 'asc' } } }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Preparar scenes para render
    const scenes = project.slides.map(slide => ({
      slideNumber: slide.slideNumber,
      imageUrl: slide.images[0] || '', // primeira imagem do slide
      audioUrl: slide.audioUrl || '', // áudio TTS gerado
      duration: slide.duration
    }));

    // Adicionar job na fila
    const jobId = await renderQueue.addRenderJob({
      projectId,
      userId: session.user.id,
      scenes,
      options: {
        resolution: { width: 1920, height: 1080 },
        fps: 30
      }
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Render job added to queue'
    });

  } catch (error: any) {
    console.error('Error starting render:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

**Critério de Aceitação**: API inicia render real

---

#### Task 2.5: Criar Testes de Integração
**Tempo**: 3h  
**Arquivos**:
```bash
touch app/tests/integration/render-queue.test.ts
```

**Código**:
```typescript
// app/tests/integration/render-queue.test.ts
import { renderQueue } from '@/lib/queue/render-queue';

describe('Render Queue Integration', () => {
  it('should add job to queue', async () => {
    const jobId = await renderQueue.addRenderJob({
      projectId: 'test-project',
      userId: 'test-user',
      scenes: [
        {
          slideNumber: 1,
          imageUrl: 'https://example.com/image.jpg',
          audioUrl: 'https://example.com/audio.mp3',
          duration: 5
        }
      ],
      options: {}
    });

    expect(jobId).toBeDefined();
  });

  it('should get job status', async () => {
    const jobId = 'test-job-id';
    const status = await renderQueue.getJobStatus(jobId);

    expect(status).toBeDefined();
    expect(status).toHaveProperty('status');
  });
});
```

**Critério de Aceitação**: Testes passando

---

### Resumo FASE 2

**Arquivos Criados**:
- `app/lib/redis/redis-health.ts`
- `app/lib/video/ffmpeg-renderer.ts`
- `app/api/v1/render/start/route.ts`
- `app/tests/integration/render-queue.test.ts`

**Arquivos Modificados**:
- `app/lib/queue/render-queue.ts` (remover mock)

**Dependências Adicionadas**:
- `fluent-ffmpeg`
- `fs-extra`
- `uuid`

**Tempo Total**: 3-4 dias  
**Linhas de Código**: ~1000-1200 LOC

**Critério de Aceitação Final**:
- [ ] Redis sempre conectado (sem fallback)
- [ ] FFmpeg gera vídeos reais
- [ ] Queue processa jobs reais
- [ ] Vídeos são salvos no S3
- [ ] Progress tracking funciona
- [ ] Testes passando
- [ ] Build sem erros
- [ ] Smoke test: Criar projeto → Render → Download vídeo MP4 real

---

## 📋 FASE 3 - COMPLIANCE NR INTELIGENTE {#fase-3}

**Prioridade**: 🟠 ALTA  
**Tempo Estimado**: 4-5 dias  
**Dependências**: Pode ser paralelo  
**Status Atual**: 40% real (validação superficial)

### Objetivo
Implementar validação REAL de compliance NR com análise semântica via GPT-4, templates completos, e scoring inteligente.

### Problemas Atuais
```typescript
// Validação atual:
- Conta keywords básicas ❌
- Score = % de keywords encontradas ❌
- Sem análise semântica ❌
- Templates incompletos ❌
```

### Tasks Detalhadas

#### Task 3.1: Configurar API GPT-4 (Abacus AI)
**Tempo**: 1h  
**Arquivos**:
```bash
touch app/lib/ai/gpt4-client.ts
```

**Código**:
```typescript
// app/lib/ai/gpt4-client.ts
import OpenAI from 'openai';

export class GPT4ComplianceAnalyzer {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.ABACUSAI_API_KEY,
      baseURL: 'https://api.abacus.ai/v1'
    });
  }

  async analyzeCompliance(
    content: string,
    nrType: string
  ): Promise<ComplianceAnalysis> {
    const prompt = this.buildPrompt(content, nrType);

    const response = await this.client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em Normas Regulamentadoras (NRs) brasileiras de segurança do trabalho.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // baixa temperatura para respostas mais consistentes
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      score: result.score || 0,
      missing: result.missing || [],
      suggestions: result.suggestions || [],
      structureAnalysis: result.structure || {},
      semanticAnalysis: result.semantic || {}
    };
  }

  private buildPrompt(content: string, nrType: string): string {
    return `
Analise o seguinte conteúdo de treinamento em relação à ${nrType}:

CONTEÚDO:
${content}

Retorne um JSON com:
{
  "score": <número 0-100>,
  "missing": [<lista de tópicos obrigatórios faltando>],
  "suggestions": [<sugestões de melhoria>],
  "structure": {
    "hasIntroduction": <boolean>,
    "hasObjectives": <boolean>,
    "hasRisks": <boolean>,
    "hasProcedures": <boolean>,
    "hasConclusion": <boolean>
  },
  "semantic": {
    "clarity": <número 0-10>,
    "completeness": <número 0-10>,
    "technicalAccuracy": <número 0-10>
  }
}
    `.trim();
  }
}

interface ComplianceAnalysis {
  score: number;
  missing: string[];
  suggestions: string[];
  structureAnalysis: Record<string, any>;
  semanticAnalysis: Record<string, any>;
}
```

**Critério de Aceitação**: GPT-4 analisa conteúdo e retorna JSON estruturado

---

#### Task 3.2: Criar Templates NR Completos
**Tempo**: 8h  
**Arquivos**:
```bash
mkdir -p app/lib/compliance/templates
touch app/lib/compliance/templates/nr11.ts
touch app/lib/compliance/templates/nr12.ts
touch app/lib/compliance/templates/nr33.ts
touch app/lib/compliance/templates/nr35.ts
# ... criar 15+ templates
```

**Código**:
```typescript
// app/lib/compliance/templates/nr11.ts
export const NR11_TEMPLATE = {
  id: 'NR11',
  name: 'Transporte, Movimentação, Armazenagem e Manuseio de Materiais',
  version: '2024',
  
  requiredTopics: [
    {
      id: 'intro',
      title: 'Introdução à NR-11',
      required: true,
      keywords: ['transporte', 'movimentação', 'armazenagem', 'manuseio'],
      weight: 10
    },
    {
      id: 'objectives',
      title: 'Objetivos do Treinamento',
      required: true,
      keywords: ['objetivos', 'metas', 'finalidade'],
      weight: 5
    },
    {
      id: 'scope',
      title: 'Aplicação e Abrangência',
      required: true,
      keywords: ['aplicação', 'abrangência', 'empresas', 'setores'],
      weight: 5
    },
    {
      id: 'equipment',
      title: 'Equipamentos de Transporte',
      required: true,
      keywords: ['empilhadeira', 'paleteira', 'ponte rolante', 'talha', 'guindaste'],
      weight: 15
    },
    {
      id: 'risks',
      title: 'Riscos na Movimentação de Cargas',
      required: true,
      keywords: ['riscos', 'acidentes', 'perigos', 'quedas', 'esmagamento'],
      weight: 15
    },
    {
      id: 'procedures',
      title: 'Procedimentos Seguros',
      required: true,
      keywords: ['procedimentos', 'práticas', 'instruções', 'operação'],
      weight: 20
    },
    {
      id: 'ppe',
      title: 'Equipamentos de Proteção Individual',
      required: true,
      keywords: ['EPI', 'proteção', 'capacete', 'luvas', 'calçado'],
      weight: 10
    },
    {
      id: 'inspection',
      title: 'Inspeção e Manutenção',
      required: true,
      keywords: ['inspeção', 'manutenção', 'verificação', 'checklist'],
      weight: 10
    },
    {
      id: 'emergencies',
      title: 'Procedimentos de Emergência',
      required: true,
      keywords: ['emergência', 'acidente', 'primeiros socorros'],
      weight: 5
    },
    {
      id: 'conclusion',
      title: 'Conclusão e Avaliação',
      required: true,
      keywords: ['conclusão', 'resumo', 'avaliação'],
      weight: 5
    }
  ],
  
  optionalTopics: [
    {
      id: 'case-studies',
      title: 'Estudos de Caso',
      keywords: ['caso real', 'exemplo', 'situação'],
      weight: 5
    },
    {
      id: 'legislation',
      title: 'Legislação Complementar',
      keywords: ['lei', 'legislação', 'norma'],
      weight: 3
    }
  ],
  
  minimumScore: 80, // score mínimo para compliance
  
  structureRules: {
    minSlides: 10,
    maxSlides: 50,
    minDuration: 600, // 10 minutos
    maxDuration: 3600, // 60 minutos
    requiredOrder: ['intro', 'objectives', 'scope'], // tópicos que devem estar nessa ordem
  },
  
  keyPhrases: [
    'Norma Regulamentadora 11',
    'NR-11',
    'Ministério do Trabalho',
    'segurança na movimentação de cargas',
    'prevenção de acidentes',
    'responsabilidade do empregador',
    'responsabilidade do empregado'
  ]
};
```

**Critério de Aceitação**: 15+ templates NR completos criados

---

#### Task 3.3: Implementar Validador Inteligente
**Tempo**: 6h  
**Arquivos**:
```bash
touch app/lib/compliance/smart-validator.ts
```

**Código**:
```typescript
// app/lib/compliance/smart-validator.ts
import { GPT4ComplianceAnalyzer } from '@/lib/ai/gpt4-client';
import { NR11_TEMPLATE } from './templates/nr11';
// import outros templates...

export class SmartComplianceValidator {
  private gpt4Analyzer: GPT4ComplianceAnalyzer;
  private templates: Map<string, any>;

  constructor() {
    this.gpt4Analyzer = new GPT4ComplianceAnalyzer();
    this.templates = new Map();
    
    // Registrar templates
    this.templates.set('NR11', NR11_TEMPLATE);
    // ... registrar outros
  }

  async validate(
    projectId: string,
    nrType: string
  ): Promise<ValidationResult> {
    console.log(`🔍 [Compliance] Validating project ${projectId} against ${nrType}`);

    // 1. Buscar conteúdo do projeto
    const content = await this.fetchProjectContent(projectId);

    // 2. Buscar template NR
    const template = this.templates.get(nrType);
    if (!template) {
      throw new Error(`Template not found for ${nrType}`);
    }

    // 3. Validação estrutural (keywords, ordem, duração)
    const structuralValidation = this.validateStructure(content, template);

    // 4. Validação semântica com GPT-4
    const semanticValidation = await this.gpt4Analyzer.analyzeCompliance(
      content.fullText,
      nrType
    );

    // 5. Calcular score final
    const finalScore = this.calculateFinalScore(
      structuralValidation,
      semanticValidation,
      template
    );

    // 6. Gerar relatório
    const report = this.generateReport(
      structuralValidation,
      semanticValidation,
      finalScore,
      template
    );

    console.log(`✅ [Compliance] Validation complete. Score: ${finalScore}`);

    return {
      projectId,
      nrType,
      score: finalScore,
      passed: finalScore >= template.minimumScore,
      report,
      timestamp: new Date()
    };
  }

  private async fetchProjectContent(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { slides: { orderBy: { order: 'asc' } } }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const fullText = project.slides
      .map(slide => `${slide.title}\n${slide.content}\n${slide.notes || ''}`)
      .join('\n\n');

    return {
      project,
      fullText,
      slideCount: project.slides.length,
      totalDuration: project.slides.reduce((sum, s) => sum + s.duration, 0)
    };
  }

  private validateStructure(content: any, template: any): StructuralValidation {
    const foundTopics: string[] = [];
    const missingTopics: string[] = [];
    let keywordScore = 0;

    // Verificar tópicos obrigatórios
    for (const topic of template.requiredTopics) {
      const hasKeywords = topic.keywords.some((kw: string) =>
        content.fullText.toLowerCase().includes(kw.toLowerCase())
      );

      if (hasKeywords) {
        foundTopics.push(topic.id);
        keywordScore += topic.weight;
      } else {
        missingTopics.push(topic.title);
      }
    }

    // Verificar estrutura
    const structureValid = 
      content.slideCount >= template.structureRules.minSlides &&
      content.slideCount <= template.structureRules.maxSlides &&
      content.totalDuration >= template.structureRules.minDuration;

    return {
      keywordScore,
      foundTopics,
      missingTopics,
      structureValid,
      slideCount: content.slideCount,
      duration: content.totalDuration
    };
  }

  private calculateFinalScore(
    structural: StructuralValidation,
    semantic: any,
    template: any
  ): number {
    // Score ponderado:
    // - 40% keywords/estrutura
    // - 60% análise semântica GPT-4

    const structuralWeight = 0.4;
    const semanticWeight = 0.6;

    const structuralScore = structural.keywordScore;
    const semanticScore = semantic.score;

    const finalScore = 
      (structuralScore * structuralWeight) +
      (semanticScore * semanticWeight);

    return Math.round(Math.min(100, finalScore));
  }

  private generateReport(
    structural: StructuralValidation,
    semantic: any,
    finalScore: number,
    template: any
  ): ComplianceReport {
    return {
      score: finalScore,
      passed: finalScore >= template.minimumScore,
      structural: {
        keywordScore: structural.keywordScore,
        foundTopics: structural.foundTopics,
        missingTopics: structural.missingTopics,
        structureValid: structural.structureValid
      },
      semantic: {
        clarity: semantic.semanticAnalysis.clarity,
        completeness: semantic.semanticAnalysis.completeness,
        technicalAccuracy: semantic.semanticAnalysis.technicalAccuracy,
        suggestions: semantic.suggestions
      },
      recommendations: [
        ...structural.missingTopics.map(t => `Adicionar tópico: ${t}`),
        ...semantic.suggestions
      ]
    };
  }
}

interface StructuralValidation {
  keywordScore: number;
  foundTopics: string[];
  missingTopics: string[];
  structureValid: boolean;
  slideCount: number;
  duration: number;
}

interface ValidationResult {
  projectId: string;
  nrType: string;
  score: number;
  passed: boolean;
  report: ComplianceReport;
  timestamp: Date;
}

interface ComplianceReport {
  score: number;
  passed: boolean;
  structural: any;
  semantic: any;
  recommendations: string[];
}
```

**Critério de Aceitação**: Validador combina análise estrutural + semântica

---

#### Task 3.4: Refatorar API de Compliance
**Tempo**: 3h  
**Arquivos**:
```bash
vim app/api/compliance/validate/route.ts
```

**Código**:
```typescript
// app/api/compliance/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SmartComplianceValidator } from '@/lib/compliance/smart-validator';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { projectId, nrType } = await request.json();

    if (!projectId || !nrType) {
      return NextResponse.json({
        error: 'Project ID and NR type required'
      }, { status: 400 });
    }

    console.log(`🔍 Starting compliance validation: ${projectId} - ${nrType}`);

    // Validação com GPT-4 + análise estrutural
    const validator = new SmartComplianceValidator();
    const result = await validator.validate(projectId, nrType);

    // Salvar resultado no banco
    await prisma.complianceValidation.create({
      data: {
        projectId,
        nrType,
        score: result.score,
        passed: result.passed,
        report: result.report as any,
        validatedAt: result.timestamp
      }
    });

    console.log(`✅ Compliance validation complete. Score: ${result.score}`);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error: any) {
    console.error('Compliance validation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

**Critério de Aceitação**: API valida com GPT-4 e retorna relatório detalhado

---

### Resumo FASE 3

**Arquivos Criados**:
- `app/lib/ai/gpt4-client.ts`
- `app/lib/compliance/templates/*.ts` (15+ templates)
- `app/lib/compliance/smart-validator.ts`

**Arquivos Modificados**:
- `app/api/compliance/validate/route.ts`

**Dependências Adicionadas**:
- `openai` (já existe)

**Tempo Total**: 4-5 dias  
**Linhas de Código**: ~2000-2500 LOC

**Critério de Aceitação Final**:
- [ ] GPT-4 analisa conteúdo
- [ ] 15+ templates NR completos
- [ ] Validação estrutural + semântica
- [ ] Score inteligente (não só keywords)
- [ ] Relatório com sugestões
- [ ] Build sem erros
- [ ] Smoke test: Validar projeto NR11 → Score > 80

---

## 📊 FASE 4 - ANALYTICS COMPLETO {#fase-4}

**Prioridade**: 🟠 ALTA  
**Tempo Estimado**: 2-3 dias  
**Dependências**: Pode ser paralelo  
**Status Atual**: 60% real (mix de queries reais e mock data)

### Objetivo
Substituir TODOS os mock data por queries reais do banco, implementar agregações complexas, e criar exportação de relatórios funcional.

### Tasks Detalhadas

#### Task 4.1: Implementar Analytics Queries Reais
**Tempo**: 6h  
**Arquivos**:
```bash
touch app/lib/analytics/queries.ts
```

**Código**:
```typescript
// app/lib/analytics/queries.ts
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export class AnalyticsQueries {
  
  // Renders por período
  async getRendersByPeriod(
    userId: string,
    days: number = 7
  ): Promise<RendersByDay[]> {
    const startDate = subDays(new Date(), days);

    const renders = await prisma.project.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        status: 'completed',
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    });

    // Agrupar por dia
    const byDay: Record<string, number> = {};
    
    for (const render of renders) {
      const day = format(render.createdAt, 'yyyy-MM-dd');
      byDay[day] = (byDay[day] || 0) + render._count.id;
    }

    return Object.entries(byDay).map(([date, count]) => ({
      date,
      count,
      success_rate: 100 // TODO: calcular baseado em failed renders
    }));
  }

  // Custo por período (baseado em uso TTS, render time, etc)
  async getCostAnalysis(
    userId: string,
    days: number = 7
  ): Promise<CostByDay[]> {
    const startDate = subDays(new Date(), days);

    const projects = await prisma.project.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      include: {
        analytics: true
      }
    });

    const costByDay: Record<string, { cost: number; renders: number }> = {};

    for (const project of projects) {
      const day = format(project.createdAt, 'yyyy-MM-dd');
      const projectCost = this.calculateProjectCost(project);

      if (!costByDay[day]) {
        costByDay[day] = { cost: 0, renders: 0 };
      }

      costByDay[day].cost += projectCost;
      costByDay[day].renders += 1;
    }

    return Object.entries(costByDay).map(([date, data]) => ({
      date,
      cost: data.cost,
      renders: data.renders
    }));
  }

  private calculateProjectCost(project: any): number {
    // Cálculo baseado em:
    // - TTS characters (R$ 0.01 por 1000 chars)
    // - Render time (R$ 0.05 por minuto)
    // - Storage (R$ 0.01 por MB)

    const ttsChars = project.analytics?.ttsCharactersUsed || 0;
    const renderMinutes = (project.duration || 0) / 60;
    const storageMB = (project.fileSize || 0) / (1024 * 1024);

    const ttsCost = (ttsChars / 1000) * 0.01;
    const renderCost = renderMinutes * 0.05;
    const storageCost = storageMB * 0.01;

    return ttsCost + renderCost + storageCost;
  }

  // Uso por tipo de projeto
  async getUsageByProjectType(
    userId: string
  ): Promise<UsageByType[]> {
    const projects = await prisma.project.groupBy({
      by: ['nrType'],
      where: { userId },
      _count: {
        id: true
      }
    });

    const total = projects.reduce((sum, p) => sum + p._count.id, 0);

    return projects.map(p => ({
      type: p.nrType || 'Outros',
      count: p._count.id,
      percentage: total > 0 ? (p._count.id / total) * 100 : 0
    }));
  }

  // Uso por resolução
  async getUsageByResolution(
    userId: string
  ): Promise<UsageByResolution[]> {
    const projects = await prisma.project.findMany({
      where: { userId },
      select: {
        resolution: true,
        duration: true
      }
    });

    const byResolution: Record<string, { count: number; totalMinutes: number }> = {};

    for (const project of projects) {
      const res = project.resolution || '1920x1080';
      if (!byResolution[res]) {
        byResolution[res] = { count: 0, totalMinutes: 0 };
      }
      byResolution[res].count += 1;
      byResolution[res].totalMinutes += (project.duration || 0) / 60;
    }

    return Object.entries(byResolution).map(([resolution, data]) => ({
      resolution,
      count: data.count,
      cost: data.totalMinutes * 0.05 // R$ 0.05 por minuto
    }));
  }

  // Performance da fila
  async getQueuePerformance(): Promise<QueuePerformance[]> {
    // Query jobs do Redis/BullMQ
    const jobs = await prisma.renderJob.findMany({
      where: {
        createdAt: { gte: subDays(new Date(), 1) }
      },
      select: {
        createdAt,
        startedAt,
        completedAt,
        status
      }
    });

    const byHour: Record<number, { waitTime: number; throughput: number; count: number }> = {};

    for (const job of jobs) {
      const hour = job.createdAt.getHours();
      
      if (!byHour[hour]) {
        byHour[hour] = { waitTime: 0, throughput: 0, count: 0 };
      }

      if (job.startedAt) {
        const wait = (job.startedAt.getTime() - job.createdAt.getTime()) / 1000;
        byHour[hour].waitTime += wait;
      }

      if (job.completedAt) {
        byHour[hour].throughput += 1;
      }

      byHour[hour].count += 1;
    }

    return Object.entries(byHour).map(([hour, data]) => ({
      hour: parseInt(hour),
      avg_wait: data.count > 0 ? data.waitTime / data.count : 0,
      throughput: data.throughput
    }));
  }
}

interface RendersByDay {
  date: string;
  count: number;
  success_rate: number;
}

interface CostByDay {
  date: string;
  cost: number;
  renders: number;
}

interface UsageByType {
  type: string;
  count: number;
  percentage: number;
}

interface UsageByResolution {
  resolution: string;
  count: number;
  cost: number;
}

interface QueuePerformance {
  hour: number;
  avg_wait: number;
  throughput: number;
}
```

**Critério de Aceitação**: Queries retornam dados reais do banco

---

#### Task 4.2: Atualizar Schema para RenderJob
**Tempo**: 1h  
**Arquivos**:
```bash
vim app/prisma/schema.prisma
```

**Código**:
```prisma
// Adicionar modelo RenderJob
model RenderJob {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  status      String   // waiting, processing, completed, failed
  progress    Int      @default(0)
  
  createdAt   DateTime @default(now())
  startedAt   DateTime?
  completedAt DateTime?
  
  error       String?  @db.Text
  
  @@index([projectId])
  @@index([status])
  @@index([createdAt])
}

// Adicionar analytics ao Project
model Project {
  // ... campos existentes
  
  renderJobs  RenderJob[]
  
  analytics   ProjectAnalytics?
}

model ProjectAnalytics {
  id              String   @id @default(cuid())
  projectId       String   @unique
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  ttsCharactersUsed Int    @default(0)
  renderTimeSeconds Int    @default(0)
  fileSizeBytes     Int    @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Executar**:
```bash
cd app
npx prisma format
npx prisma generate
npx prisma migrate dev --name add-analytics-models
```

**Critério de Aceitação**: Schema atualizado

---

#### Task 4.3: Refatorar Analytics Dashboard
**Tempo**: 4h  
**Arquivos**:
```bash
vim app/components/analytics/real-analytics-dashboard.tsx
```

**Código**:
```typescript
// app/components/analytics/real-analytics-dashboard.tsx
'use client'

import { useState, useEffect } from 'react';
import { AnalyticsQueries } from '@/lib/analytics/queries';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RealAnalyticsDashboard() {
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/analytics/real?period=${period}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Real-Time</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value as any)}>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
        </select>
      </div>

      {/* Renders por dia */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Renders por Dia</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.rendersByDay || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Custo por dia */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Custo por Dia (R$)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.costByDay || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="cost" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Uso por tipo de projeto */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Uso por Tipo de Projeto</h3>
        <div className="space-y-2">
          {data?.usageByType?.map((item: any) => (
            <div key={item.type} className="flex justify-between items-center">
              <span>{item.type}</span>
              <span className="font-semibold">{item.count} ({item.percentage.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Critério de Aceitação**: Dashboard mostra dados reais do banco

---

#### Task 4.4: Implementar Export de Relatórios
**Tempo**: 4h  
**Arquivos**:
```bash
touch app/api/v1/analytics/export/route.ts
touch app/lib/analytics/report-generator.ts
```

**Código**:
```typescript
// app/lib/analytics/report-generator.ts
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export class AnalyticsReportGenerator {
  
  async generatePDF(data: any): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Relatório de Analytics', 20, 20);
    
    // Data
    doc.setFontSize(12);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 30);
    
    // Resumo
    doc.setFontSize(14);
    doc.text('Resumo Executivo', 20, 45);
    doc.setFontSize(10);
    doc.text(`Total de Renders: ${data.totalRenders}`, 20, 55);
    doc.text(`Custo Total: R$ ${data.totalCost.toFixed(2)}`, 20, 62);
    doc.text(`Taxa de Sucesso: ${data.successRate}%`, 20, 69);
    
    // Gráficos (simplificado - em produção usar chart.js ou similar)
    doc.setFontSize(14);
    doc.text('Renders por Dia', 20, 85);
    
    let y = 95;
    for (const item of data.rendersByDay.slice(0, 7)) {
      doc.setFontSize(10);
      doc.text(`${item.date}: ${item.count} renders`, 20, y);
      y += 7;
    }
    
    // Retornar buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }
  
  async generateCSV(data: any): Promise<string> {
    const headers = ['Data', 'Renders', 'Custo (R$)', 'Taxa de Sucesso (%)'];
    const rows = data.rendersByDay.map((item: any) => [
      item.date,
      item.count,
      item.cost || 0,
      item.success_rate
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(','))
    ].join('\n');
    
    return csv;
  }
}
```

**Dependências**:
```bash
yarn add jspdf
yarn add --dev @types/jspdf
```

**Código API**:
```typescript
// app/api/v1/analytics/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsQueries } from '@/lib/analytics/queries';
import { AnalyticsReportGenerator } from '@/lib/analytics/report-generator';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format: exportFormat, period } = await request.json();

    // Buscar dados
    const queries = new AnalyticsQueries();
    const data = {
      rendersByDay: await queries.getRendersByPeriod(session.user.id, period === '30d' ? 30 : 7),
      costByDay: await queries.getCostAnalysis(session.user.id, period === '30d' ? 30 : 7),
      usageByType: await queries.getUsageByProjectType(session.user.id),
      totalRenders: 0, // TODO: calcular
      totalCost: 0, // TODO: calcular
      successRate: 100 // TODO: calcular
    };

    // Gerar relatório
    const generator = new AnalyticsReportGenerator();

    if (exportFormat === 'pdf') {
      const pdfBuffer = await generator.generatePDF(data);
      
      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="analytics-${Date.now()}.pdf"`
        }
      });
    } else if (exportFormat === 'csv') {
      const csv = await generator.generateCSV(data);
      
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${Date.now()}.csv"`
        }
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Critério de Aceitação**: Export PDF/CSV funcional

---

### Resumo FASE 4

**Arquivos Criados**:
- `app/lib/analytics/queries.ts`
- `app/lib/analytics/report-generator.ts`
- `app/api/v1/analytics/export/route.ts`

**Arquivos Modificados**:
- `app/prisma/schema.prisma`
- `app/components/analytics/real-analytics-dashboard.tsx`

**Dependências Adicionadas**:
- `jspdf`

**Tempo Total**: 2-3 dias  
**Linhas de Código**: ~800-1000 LOC

**Critério de Aceitação Final**:
- [ ] Todas as queries retornam dados reais
- [ ] Dashboard 100% sem mock data
- [ ] Export PDF funcional
- [ ] Export CSV funcional
- [ ] Build sem erros
- [ ] Smoke test: Dashboard → Export relatório PDF

---

## 🎞️ FASE 5 - TIMELINE PROFISSIONAL {#fase-5}

**Prioridade**: 🟡 MÉDIA  
**Tempo Estimado**: 5-6 dias  
**Dependências**: FASE 1, FASE 2  
**Status Atual**: 50% real (básico funciona, falta features avançadas)

### Objetivo
Implementar timeline profissional com keyframe animation, multi-track audio, effects library, undo/redo robusto, e preview sincronizado.

### Tasks Detalhadas

**(Tasks similares ao formato anterior, mas focadas em Timeline)**

#### Task 5.1: Keyframe Animation System
**Tempo**: 8h  
...

#### Task 5.2: Multi-Track Audio Mixer
**Tempo**: 8h  
...

#### Task 5.3: Effects & Transitions Library
**Tempo**: 6h  
...

#### Task 5.4: Undo/Redo Stack Robusto
**Tempo**: 4h  
...

#### Task 5.5: Preview Sincronizado
**Tempo**: 6h  
...

### Resumo FASE 5
- Tempo Total: 5-6 dias
- LOC: ~1500-1800

---

## 🎭 FASE 6 - AVATAR 3D ASSETS REAL {#fase-6}

**Prioridade**: 🟡 MÉDIA  
**Tempo Estimado**: 5-7 dias  
**Dependências**: FASE 2  
**Status Atual**: 20% real (URLs fake)

### Objetivo
Criar ou adquirir avatares 3D reais, fazer upload para S3, gerar thumbnails, e implementar sistema de render com lip-sync.

### Tasks Detalhadas

#### Task 6.1: Adquirir Avatares 3D
**Tempo**: 8h (pesquisa + aquisição)  
...

#### Task 6.2: Upload Avatares para S3
**Tempo**: 4h  
...

#### Task 6.3: Gerar Thumbnails
**Tempo**: 4h  
...

#### Task 6.4: Implementar Lip-Sync
**Tempo**: 12h (complexo!)  
...

### Resumo FASE 6
- Tempo Total: 5-7 dias
- LOC: ~1000-1200

---

## 🎤 FASE 7 - VOICE CLONING REAL {#fase-7}

**Prioridade**: 🟡 MÉDIA  
**Tempo Estimado**: 3-4 dias  
**Dependências**: FASE 2  
**Status Atual**: 15% real (retorna áudio fake)

### Objetivo
Integração REAL com ElevenLabs Voice Cloning, upload de samples, treinamento, e geração de áudio real.

### Tasks Detalhadas

#### Task 7.1: Integração ElevenLabs API
**Tempo**: 4h  
...

#### Task 7.2: Upload Voice Samples
**Tempo**: 4h  
...

#### Task 7.3: Voice Training
**Tempo**: 6h  
...

#### Task 7.4: Audio Generation
**Tempo**: 4h  
...

### Resumo FASE 7
- Tempo Total: 3-4 dias
- LOC: ~600-800

---

## 🤝 FASE 8 - COLLABORATION REAL-TIME {#fase-8}

**Prioridade**: 🟢 BAIXA (Nice-to-have)  
**Tempo Estimado**: 6-8 dias  
**Dependências**: Independente  
**Status Atual**: 10% real (WebSocket mock)

### Objetivo
Implementar WebSocket server real, presença online, cursor tracking, e Operational Transform para sync.

### Tasks Detalhadas

#### Task 8.1: WebSocket Server (Socket.io)
**Tempo**: 8h  
...

#### Task 8.2: Presença Online
**Tempo**: 4h  
...

#### Task 8.3: Cursor Tracking
**Tempo**: 6h  
...

#### Task 8.4: Operational Transform
**Tempo**: 12h (complexo!)  
...

### Resumo FASE 8
- Tempo Total: 6-8 dias
- LOC: ~1200-1500

---

## 🎨 FASE 9 - CANVAS ADVANCED {#fase-9}

**Prioridade**: 🟢 BAIXA  
**Tempo Estimado**: 2-3 dias  
**Dependências**: FASE 5  
**Status Atual**: 95% real (já bem funcional)

### Objetivo
Adicionar features avançadas ao Canvas: smart guides, batch editing, templates library.

### Tasks Detalhadas
...

### Resumo FASE 9
- Tempo Total: 2-3 dias
- LOC: ~400-600

---

## 🔗 FASE 10 - INTEGRAÇÕES FINAIS {#fase-10}

**Prioridade**: 🟡 MÉDIA  
**Tempo Estimado**: 3-4 dias  
**Dependências**: Todas as fases anteriores  
**Status Atual**: N/A

### Objetivo
Integrar todos os módulos, testes end-to-end, otimizações de performance, e preparação para produção.

### Tasks Detalhadas

#### Task 10.1: Testes End-to-End
**Tempo**: 8h  
...

#### Task 10.2: Performance Optimization
**Tempo**: 6h  
...

#### Task 10.3: Error Handling
**Tempo**: 4h  
...

#### Task 10.4: Documentation
**Tempo**: 4h  
...

### Resumo FASE 10
- Tempo Total: 3-4 dias
- LOC: ~500-700

---

## 📅 CRONOGRAMA E RECURSOS {#cronograma}

### Timeline Completo

#### SPRINT 50 (Semanas 1-2): CORE CRÍTICO
- **FASE 1**: PPTX Processing Real (4-6 dias)
- **FASE 2**: Render Queue Real (3-4 dias)

**Entrega**: Upload PPTX → Parse real → Render vídeo real

---

#### SPRINT 51 (Semanas 3-4): COMPLIANCE + ANALYTICS
- **FASE 3**: Compliance NR Inteligente (4-5 dias)
- **FASE 4**: Analytics Completo (2-3 dias)

**Entrega**: Validação NR com GPT-4 + Analytics 100% real

---

#### SPRINT 52 (Semanas 5-6): TIMELINE + AVATAR
- **FASE 5**: Timeline Profissional (5-6 dias)
- **FASE 6**: Avatar 3D Assets (5-7 dias)

**Entrega**: Timeline avançada + Avatares reais

---

#### SPRINT 53 (Semanas 7-8): VOICE + COLLABORATION
- **FASE 7**: Voice Cloning Real (3-4 dias)
- **FASE 8**: Collaboration Real-Time (6-8 dias)

**Entrega**: Voice cloning funcional + Collaboration real

---

#### SPRINT 54 (Semanas 9-10): POLISH + LAUNCH
- **FASE 9**: Canvas Advanced (2-3 dias)
- **FASE 10**: Integrações Finais (3-4 dias)

**Entrega**: Sistema 100% completo e polido

---

### Recursos Necessários

#### Desenvolvedores
- **1 Full-Stack Developer** (todas as fases)
- **1 DevOps Engineer** (FASE 2, 10)
- **1 QA Engineer** (FASE 10)

#### Infraestrutura
- **Redis**: Sempre ativo
- **PostgreSQL**: Scaled
- **AWS S3**: Bucket configurado
- **FFmpeg**: Instalado no servidor
- **GPT-4 API**: Créditos disponíveis
- **ElevenLabs API**: Conta ativa

#### Custos Estimados (AWS + APIs)
- **S3 Storage**: ~$50/mês
- **Redis**: ~$30/mês
- **GPT-4 API**: ~$100/mês (depende de uso)
- **ElevenLabs**: ~$99/mês (Professional plan)
- **Total**: ~$280-300/mês

---

## ✅ CRITÉRIOS DE ACEITAÇÃO {#critérios}

### Critérios Globais (para considerar 100% completo)

#### 1. Zero Mocks
- [ ] Nenhum `mockData` no código
- [ ] Nenhum `fake-*` ou `placeholder-*`
- [ ] Todas as APIs retornam dados reais
- [ ] Todos os componentes usam dados do banco

#### 2. Funcionalidade End-to-End
- [ ] Upload PPTX → Parse → Render → Download vídeo MP4
- [ ] Vídeo contém imagens reais extraídas do PPTX
- [ ] Vídeo contém áudio TTS real
- [ ] Validação NR retorna score real (GPT-4)
- [ ] Analytics mostra dados reais do banco

#### 3. Performance
- [ ] Render de vídeo completa em < 5 minutos (para 10 slides)
- [ ] PPTX parsing completa em < 30 segundos
- [ ] Dashboard carrega em < 2 segundos
- [ ] Timeline editor responde em < 100ms

#### 4. Qualidade
- [ ] Build sem erros TypeScript
- [ ] Build sem warnings críticos
- [ ] Todos os testes unitários passando
- [ ] Testes de integração passando
- [ ] Smoke tests passando

#### 5. Usabilidade
- [ ] Fluxo completo funciona sem bugs
- [ ] Mensagens de erro claras
- [ ] Loading states implementados
- [ ] Toast notifications funcionais

#### 6. Documentação
- [ ] README atualizado
- [ ] APIs documentadas
- [ ] Guia de desenvolvimento atualizado
- [ ] Changelog mantido

---

## 🎯 DEFINIÇÃO DE "PRONTO"

Uma fase está **PRONTA** quando:

1. ✅ Todos os arquivos foram criados/modificados
2. ✅ Todas as dependências foram instaladas
3. ✅ Schema Prisma atualizado e migrado
4. ✅ Build passa sem erros
5. ✅ Testes unitários passando (se aplicável)
6. ✅ Smoke test manual validado
7. ✅ Checkpoint criado (git tag)
8. ✅ Documentação atualizada

---

## 📝 NOTAS FINAIS

### Priorização Recomendada

**Opção A: FOCO NO CORE (4 semanas)**
- FASE 1, 2, 3, 4
- Score final: ~85-90%
- Sistema production-ready para uso real

**Opção B: COMPLETO (10-12 semanas)**
- Todas as 10 fases
- Score final: 100%
- Sistema enterprise-grade sem mocks

### Riscos Identificados

1. **PPTX Parsing**: PptxGenJS pode ter limitações
   - **Mitigação**: Testar com vários PPTXs reais logo no início

2. **FFmpeg Render**: Pode ser lento para vídeos longos
   - **Mitigação**: Otimizar configurações FFmpeg, paralelizar quando possível

3. **GPT-4 Custo**: Validação de compliance pode ser cara
   - **Mitigação**: Cache de validações, limitar validações por usuário

4. **Avatar 3D**: Render com lip-sync é complexo
   - **Mitigação**: Usar solução pronta (ex: D-ID, Synthesia API) como fallback

---

## 🚀 PRÓXIMOS PASSOS

**Decisão Necessária**:

Escolha uma estratégia:

**A)** 🔥 **FOCO NO CORE** → Implementar FASES 1-4 (4 semanas)  
**B)** 🏢 **COMPLETO** → Implementar TODAS as fases (10-12 semanas)  
**C)** 💡 **CUSTOM** → Você define quais fases implementar

---

**Documento Completo e Executável**  
**Versão**: 1.0  
**Última Atualização**: 06/10/2025

