# 🔧 ESPECIFICAÇÕES TÉCNICAS DETALHADAS - 10 FASES

**Documento**: Especificações Técnicas Completas  
**Data**: 06/10/2025  
**Versão**: 1.0.0  
**Complemento**: DOCUMENTO_IMPLEMENTACAO_TECNICA_100_REAL.md  

---

## 📋 ÍNDICE

1. [FASE 1: PPTX Processing Real](#fase-1-pptx-processing-real)
2. [FASE 2: Render Queue Real](#fase-2-render-queue-real)
3. [FASE 3: Compliance NR Inteligente](#fase-3-compliance-nr-inteligente)
4. [FASE 4: Analytics Completo](#fase-4-analytics-completo)
5. [FASE 5: Timeline Profissional](#fase-5-timeline-profissional)
6. [FASE 6: Avatar 3D Assets](#fase-6-avatar-3d-assets)
7. [FASE 7: Voice Cloning Real](#fase-7-voice-cloning-real)
8. [FASE 8: Collaboration Real-Time](#fase-8-collaboration-real-time)
9. [FASE 9: Canvas Advanced](#fase-9-canvas-advanced)
10. [FASE 10: Integrações Finais](#fase-10-integrações-finais)

---

## 🔴 FASE 1: PPTX Processing Real

### Objetivo
Eliminar completamente o mock de processamento PPTX e implementar parsing real com extração de texto, imagens, layouts e metadados.

### Dependências Técnicas
```bash
# Instalar dependências principais
yarn add pptxgenjs sharp
yarn add --dev @types/pptxgenjs @types/sharp

# Dependências auxiliares
yarn add mime-types file-type
```

### Estrutura de Arquivos Completa
```
app/lib/pptx/
├── types/
│   ├── pptx-types.ts           # Tipos TypeScript
│   └── slide-types.ts          # Tipos de slides
├── parsers/
│   ├── text-parser.ts          # Parser de texto
│   ├── image-parser.ts         # Parser de imagens
│   ├── layout-parser.ts        # Detector de layouts
│   ├── metadata-extractor.ts   # Extrator de metadados
│   └── shape-parser.ts         # Parser de formas/objetos
├── services/
│   ├── s3-storage.ts          # Serviço S3
│   ├── image-processor.ts     # Processador de imagens
│   └── pptx-validator.ts      # Validador de PPTX
├── utils/
│   ├── file-utils.ts          # Utilitários de arquivo
│   └── layout-detector.ts     # Detector de layouts
└── pptx-processor.ts          # Orquestrador principal

app/tests/unit/pptx/
├── text-parser.test.ts
├── image-parser.test.ts
├── layout-parser.test.ts
└── pptx-processor.test.ts
```

### Implementação Detalhada

#### 1. Tipos TypeScript (pptx-types.ts)
```typescript
export interface PPTXSlideData {
  slideNumber: number;
  title: string;
  content: string;
  notes?: string;
  images: PPTXImage[];
  layout: SlideLayout;
  backgroundColor?: string;
  backgroundImage?: string;
  shapes: PPTXShape[];
  tables: PPTXTable[];
  charts: PPTXChart[];
  wordCount: number;
  estimatedDuration: number;
}

export interface PPTXImage {
  id: string;
  originalName: string;
  s3Url: string;
  s3Key: string;
  width: number;
  height: number;
  format: 'png' | 'jpg' | 'gif' | 'svg';
  size: number; // bytes
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PPTXShape {
  type: 'rectangle' | 'circle' | 'line' | 'arrow' | 'textbox';
  text?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
}

export type SlideLayout = 
  | 'title'
  | 'title-content'
  | 'two-content'
  | 'content-image'
  | 'image-content'
  | 'full-image'
  | 'bullets'
  | 'blank'
  | 'auto';

export interface PPTXProcessingResult {
  success: boolean;
  slides: PPTXSlideData[];
  metadata: {
    totalSlides: number;
    totalImages: number;
    totalWords: number;
    estimatedDuration: number;
    fileSize: number;
    createdDate?: Date;
    modifiedDate?: Date;
    author?: string;
    title?: string;
  };
  errors: string[];
  warnings: string[];
}
```

#### 2. Text Parser (text-parser.ts)
```typescript
import PptxGenJS from 'pptxgenjs';

export class PPTXTextParser {
  async extractText(pptxBuffer: Buffer): Promise<{
    slides: Array<{
      slideNumber: number;
      title: string;
      content: string;
      notes?: string;
      wordCount: number;
    }>;
    totalWords: number;
  }> {
    try {
      const pptx = new PptxGenJS();
      await pptx.load(pptxBuffer);
      
      const slides = [];
      let totalWords = 0;
      
      for (let i = 0; i < pptx.slides.length; i++) {
        const slide = pptx.slides[i];
        const slideData = await this.extractSlideText(slide, i + 1);
        slides.push(slideData);
        totalWords += slideData.wordCount;
      }
      
      return { slides, totalWords };
    } catch (error) {
      throw new Error(`Erro ao extrair texto do PPTX: ${error.message}`);
    }
  }
  
  private async extractSlideText(slide: any, slideNumber: number) {
    let title = '';
    let content = '';
    let notes = '';
    
    // Extrair texto de todos os elementos da slide
    if (slide.objects) {
      for (const obj of slide.objects) {
        if (obj.options?.isTitle) {
          title += this.extractTextFromObject(obj) + ' ';
        } else {
          content += this.extractTextFromObject(obj) + '\n';
        }
      }
    }
    
    // Extrair speaker notes
    if (slide.notes) {
      notes = slide.notes;
    }
    
    // Limpar e contar palavras
    title = title.trim();
    content = content.trim();
    const wordCount = this.countWords(title + ' ' + content + ' ' + notes);
    
    return {
      slideNumber,
      title: title || `Slide ${slideNumber}`,
      content,
      notes,
      wordCount
    };
  }
  
  private extractTextFromObject(obj: any): string {
    if (obj.text) {
      if (Array.isArray(obj.text)) {
        return obj.text.map(t => t.text || '').join(' ');
      }
      return obj.text;
    }
    return '';
  }
  
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}
```

#### 3. Image Parser (image-parser.ts)
```typescript
import sharp from 'sharp';
import { S3StorageService } from '../services/s3-storage';
import { PPTXImage } from '../types/pptx-types';

export class PPTXImageParser {
  private s3Service: S3StorageService;
  
  constructor() {
    this.s3Service = new S3StorageService();
  }
  
  async extractImages(pptxBuffer: Buffer, projectId: string): Promise<PPTXImage[]> {
    try {
      const pptx = new PptxGenJS();
      await pptx.load(pptxBuffer);
      
      const images: PPTXImage[] = [];
      
      for (let i = 0; i < pptx.slides.length; i++) {
        const slide = pptx.slides[i];
        const slideImages = await this.extractSlideImages(slide, i + 1, projectId);
        images.push(...slideImages);
      }
      
      return images;
    } catch (error) {
      throw new Error(`Erro ao extrair imagens do PPTX: ${error.message}`);
    }
  }
  
  private async extractSlideImages(slide: any, slideNumber: number, projectId: string): Promise<PPTXImage[]> {
    const images: PPTXImage[] = [];
    
    if (slide.objects) {
      for (const obj of slide.objects) {
        if (obj.image) {
          const image = await this.processImage(obj, slideNumber, projectId);
          if (image) {
            images.push(image);
          }
        }
      }
    }
    
    return images;
  }
  
  private async processImage(imageObj: any, slideNumber: number, projectId: string): Promise<PPTXImage | null> {
    try {
      // Extrair dados da imagem
      const imageData = imageObj.image.data || imageObj.image.path;
      if (!imageData) return null;
      
      // Processar com Sharp
      const imageBuffer = Buffer.from(imageData, 'base64');
      const metadata = await sharp(imageBuffer).metadata();
      
      // Otimizar imagem
      const optimizedBuffer = await sharp(imageBuffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      // Upload para S3
      const fileName = `slide-${slideNumber}-${Date.now()}.jpg`;
      const s3Key = `projects/${projectId}/images/${fileName}`;
      const s3Url = await this.s3Service.uploadImage(optimizedBuffer, s3Key);
      
      return {
        id: `img-${slideNumber}-${Date.now()}`,
        originalName: imageObj.image.name || fileName,
        s3Url,
        s3Key,
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: 'jpg',
        size: optimizedBuffer.length,
        position: {
          x: imageObj.options?.x || 0,
          y: imageObj.options?.y || 0,
          width: imageObj.options?.w || metadata.width || 0,
          height: imageObj.options?.h || metadata.height || 0
        }
      };
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      return null;
    }
  }
}
```

#### 4. Layout Parser (layout-parser.ts)
```typescript
import { SlideLayout, PPTXShape } from '../types/pptx-types';

export class PPTXLayoutParser {
  detectLayout(slide: any): SlideLayout {
    const objects = slide.objects || [];
    
    // Contar tipos de objetos
    const titleCount = objects.filter(obj => obj.options?.isTitle).length;
    const textCount = objects.filter(obj => obj.text && !obj.options?.isTitle).length;
    const imageCount = objects.filter(obj => obj.image).length;
    const shapeCount = objects.filter(obj => obj.shape).length;
    
    // Detectar layout baseado na composição
    if (titleCount > 0 && textCount === 0 && imageCount === 0) {
      return 'title';
    }
    
    if (titleCount > 0 && textCount > 0 && imageCount === 0) {
      return 'title-content';
    }
    
    if (titleCount > 0 && textCount > 0 && imageCount === 1) {
      return this.detectImageContentLayout(objects);
    }
    
    if (titleCount > 0 && textCount >= 2) {
      return 'two-content';
    }
    
    if (imageCount >= 1 && textCount === 0) {
      return 'full-image';
    }
    
    if (textCount > 0 && this.hasBulletPoints(objects)) {
      return 'bullets';
    }
    
    if (objects.length === 0) {
      return 'blank';
    }
    
    return 'auto';
  }
  
  private detectImageContentLayout(objects: any[]): SlideLayout {
    const images = objects.filter(obj => obj.image);
    const texts = objects.filter(obj => obj.text && !obj.options?.isTitle);
    
    if (images.length === 1 && texts.length > 0) {
      const image = images[0];
      const imageX = image.options?.x || 0;
      
      // Se imagem está à esquerda, layout é image-content
      if (imageX < 50) {
        return 'image-content';
      }
      // Se imagem está à direita, layout é content-image
      return 'content-image';
    }
    
    return 'title-content';
  }
  
  private hasBulletPoints(objects: any[]): boolean {
    return objects.some(obj => {
      if (obj.text && Array.isArray(obj.text)) {
        return obj.text.some(t => 
          t.text && (t.text.includes('•') || t.text.includes('-') || t.text.includes('*'))
        );
      }
      return false;
    });
  }
  
  extractShapes(slide: any): PPTXShape[] {
    const shapes: PPTXShape[] = [];
    const objects = slide.objects || [];
    
    for (const obj of objects) {
      if (obj.shape) {
        shapes.push({
          type: this.mapShapeType(obj.shape),
          text: obj.text || undefined,
          position: {
            x: obj.options?.x || 0,
            y: obj.options?.y || 0,
            width: obj.options?.w || 0,
            height: obj.options?.h || 0
          },
          style: {
            fill: obj.options?.fill || undefined,
            stroke: obj.options?.line || undefined,
            strokeWidth: obj.options?.lineSize || undefined
          }
        });
      }
    }
    
    return shapes;
  }
  
  private mapShapeType(shapeType: string): PPTXShape['type'] {
    const typeMap: Record<string, PPTXShape['type']> = {
      'rect': 'rectangle',
      'ellipse': 'circle',
      'line': 'line',
      'arrow': 'arrow',
      'textBox': 'textbox'
    };
    
    return typeMap[shapeType] || 'rectangle';
  }
}
```

#### 5. Orquestrador Principal (pptx-processor.ts)
```typescript
import { PPTXTextParser } from './parsers/text-parser';
import { PPTXImageParser } from './parsers/image-parser';
import { PPTXLayoutParser } from './parsers/layout-parser';
import { PPTXProcessingResult } from './types/pptx-types';

export class PPTXProcessor {
  private textParser: PPTXTextParser;
  private imageParser: PPTXImageParser;
  private layoutParser: PPTXLayoutParser;
  
  constructor() {
    this.textParser = new PPTXTextParser();
    this.imageParser = new PPTXImageParser();
    this.layoutParser = new PPTXLayoutParser();
  }
  
  async processFile(pptxBuffer: Buffer, projectId: string): Promise<PPTXProcessingResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Validar arquivo PPTX
      await this.validatePPTX(pptxBuffer);
      
      // Extrair texto
      const textResult = await this.textParser.extractText(pptxBuffer);
      
      // Extrair imagens
      const images = await this.imageParser.extractImages(pptxBuffer, projectId);
      
      // Processar slides
      const pptx = new PptxGenJS();
      await pptx.load(pptxBuffer);
      
      const slides = [];
      
      for (let i = 0; i < textResult.slides.length; i++) {
        const textSlide = textResult.slides[i];
        const slide = pptx.slides[i];
        
        // Detectar layout
        const layout = this.layoutParser.detectLayout(slide);
        
        // Extrair formas
        const shapes = this.layoutParser.extractShapes(slide);
        
        // Filtrar imagens desta slide
        const slideImages = images.filter(img => 
          img.id.includes(`slide-${i + 1}`)
        );
        
        // Calcular duração estimada (baseado em palavras)
        const estimatedDuration = Math.max(5, Math.ceil(textSlide.wordCount / 150 * 60));
        
        slides.push({
          slideNumber: textSlide.slideNumber,
          title: textSlide.title,
          content: textSlide.content,
          notes: textSlide.notes,
          images: slideImages,
          layout,
          shapes,
          tables: [], // TODO: Implementar extração de tabelas
          charts: [], // TODO: Implementar extração de gráficos
          wordCount: textSlide.wordCount,
          estimatedDuration
        });
      }
      
      // Calcular metadados
      const metadata = {
        totalSlides: slides.length,
        totalImages: images.length,
        totalWords: textResult.totalWords,
        estimatedDuration: slides.reduce((sum, slide) => sum + slide.estimatedDuration, 0),
        fileSize: pptxBuffer.length,
        createdDate: new Date(),
        modifiedDate: new Date()
      };
      
      return {
        success: true,
        slides,
        metadata,
        errors,
        warnings
      };
      
    } catch (error) {
      errors.push(error.message);
      return {
        success: false,
        slides: [],
        metadata: {
          totalSlides: 0,
          totalImages: 0,
          totalWords: 0,
          estimatedDuration: 0,
          fileSize: pptxBuffer.length
        },
        errors,
        warnings
      };
    }
  }
  
  private async validatePPTX(buffer: Buffer): Promise<void> {
    // Verificar se é um arquivo PPTX válido
    const header = buffer.slice(0, 4);
    if (header.toString('hex') !== '504b0304') {
      throw new Error('Arquivo não é um PPTX válido');
    }
    
    // Verificar tamanho mínimo
    if (buffer.length < 1000) {
      throw new Error('Arquivo PPTX muito pequeno');
    }
    
    // Verificar tamanho máximo (50MB)
    if (buffer.length > 50 * 1024 * 1024) {
      throw new Error('Arquivo PPTX muito grande (máximo 50MB)');
    }
  }
}
```

#### 6. API Route Atualizada (app/api/v1/pptx/process/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PPTXProcessor } from '@/lib/pptx/pptx-processor';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    
    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'Arquivo e projectId são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Converter arquivo para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Processar PPTX
    const processor = new PPTXProcessor();
    const result = await processor.processFile(buffer, projectId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Erro ao processar PPTX', details: result.errors },
        { status: 500 }
      );
    }
    
    // Salvar slides no banco
    await prisma.$transaction(async (tx) => {
      // Deletar slides existentes
      await tx.slide.deleteMany({
        where: { projectId }
      });
      
      // Criar novos slides
      for (const slideData of result.slides) {
        await tx.slide.create({
          data: {
            projectId,
            slideNumber: slideData.slideNumber,
            title: slideData.title,
            content: slideData.content,
            notes: slideData.notes,
            images: slideData.images.map(img => img.s3Url),
            layout: slideData.layout,
            wordCount: slideData.wordCount,
            estimatedDuration: slideData.estimatedDuration,
            extractedShapes: slideData.shapes,
            order: slideData.slideNumber
          }
        });
      }
      
      // Atualizar projeto
      await tx.project.update({
        where: { id: projectId },
        data: {
          status: 'processed',
          totalSlides: result.metadata.totalSlides,
          totalWords: result.metadata.totalWords,
          estimatedDuration: result.metadata.estimatedDuration
        }
      });
    });
    
    return NextResponse.json({
      success: true,
      message: 'PPTX processado com sucesso',
      data: {
        slides: result.slides.length,
        images: result.metadata.totalImages,
        words: result.metadata.totalWords,
        duration: result.metadata.estimatedDuration
      }
    });
    
  } catch (error) {
    console.error('Erro no processamento PPTX:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

### Testes Unitários

#### text-parser.test.ts
```typescript
import { PPTXTextParser } from '../parsers/text-parser';
import fs from 'fs';
import path from 'path';

describe('PPTXTextParser', () => {
  let parser: PPTXTextParser;
  
  beforeEach(() => {
    parser = new PPTXTextParser();
  });
  
  test('deve extrair texto de PPTX simples', async () => {
    const testFile = fs.readFileSync(path.join(__dirname, 'fixtures/simple.pptx'));
    const result = await parser.extractText(testFile);
    
    expect(result.slides).toHaveLength(3);
    expect(result.slides[0].title).toBe('Título do Slide 1');
    expect(result.slides[0].content).toContain('Conteúdo');
    expect(result.totalWords).toBeGreaterThan(0);
  });
  
  test('deve contar palavras corretamente', async () => {
    const testFile = fs.readFileSync(path.join(__dirname, 'fixtures/text-heavy.pptx'));
    const result = await parser.extractText(testFile);
    
    expect(result.totalWords).toBeGreaterThan(100);
    expect(result.slides[0].wordCount).toBeGreaterThan(0);
  });
  
  test('deve extrair speaker notes', async () => {
    const testFile = fs.readFileSync(path.join(__dirname, 'fixtures/with-notes.pptx'));
    const result = await parser.extractText(testFile);
    
    expect(result.slides[0].notes).toBeDefined();
    expect(result.slides[0].notes).toContain('Nota do apresentador');
  });
});
```

### Critérios de Aceitação FASE 1

#### ✅ Funcionalidades Obrigatórias
- [ ] Extrai texto real de slides PPTX
- [ ] Extrai imagens e salva no S3 com URLs reais
- [ ] Detecta layouts automaticamente (8 tipos)
- [ ] Salva metadados completos no banco
- [ ] Processa PPTX com até 50 slides
- [ ] Suporta imagens PNG, JPG, GIF
- [ ] Extrai speaker notes quando disponíveis
- [ ] Calcula duração estimada baseada em palavras
- [ ] Valida arquivos PPTX antes do processamento
- [ ] Otimiza imagens automaticamente

#### ✅ Performance
- [ ] Processa PPTX de 10 slides em < 30 segundos
- [ ] Processa PPTX de 50 slides em < 2 minutos
- [ ] Upload de imagens para S3 em paralelo
- [ ] Compressão de imagens sem perda significativa de qualidade

#### ✅ Qualidade
- [ ] Testes unitários com coverage > 90%
- [ ] Tratamento de erros robusto
- [ ] Logs detalhados para debugging
- [ ] Validação de entrada completa
- [ ] Cleanup de recursos temporários

---

## 🔴 FASE 2: Render Queue Real

### Objetivo
Implementar sistema de render real com FFmpeg, eliminando todos os mocks e garantindo geração de vídeos MP4 reais.

### Dependências Técnicas
```bash
# Dependências já instaladas (verificar)
yarn list fluent-ffmpeg ioredis bullmq

# Instalar se necessário
yarn add fluent-ffmpeg ioredis bullmq
yarn add --dev @types/fluent-ffmpeg
```

### Estrutura de Arquivos
```
app/lib/video/
├── types/
│   ├── render-types.ts         # Tipos de render
│   └── scene-types.ts          # Tipos de cenas
├── renderers/
│   ├── ffmpeg-renderer.ts      # Renderer principal
│   ├── scene-composer.ts       # Compositor de cenas
│   ├── audio-mixer.ts          # Mixer de áudio
│   └── transition-effects.ts   # Efeitos de transição
├── services/
│   ├── video-optimizer.ts      # Otimizador de vídeo
│   └── thumbnail-generator.ts  # Gerador de thumbnails
└── utils/
    ├── ffmpeg-config.ts        # Configurações FFmpeg
    └── video-utils.ts          # Utilitários de vídeo

app/lib/queue/
├── redis-health.ts             # Health checker Redis
├── render-queue.ts             # Queue principal
├── job-processor.ts            # Processador de jobs
├── progress-tracker.ts         # Tracker de progresso
└── notification-service.ts     # Serviço de notificações
```

### Implementação Detalhada

#### 1. Tipos de Render (render-types.ts)
```typescript
export interface RenderJob {
  id: string;
  projectId: string;
  userId: string;
  slides: RenderSlide[];
  settings: RenderSettings;
  status: RenderStatus;
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  outputUrl?: string;
  thumbnailUrl?: string;
}

export interface RenderSlide {
  id: string;
  slideNumber: number;
  title: string;
  content: string;
  images: string[]; // S3 URLs
  duration: number; // segundos
  transition: TransitionType;
  audio?: {
    ttsText: string;
    voiceId: string;
    audioUrl?: string;
  };
  background?: {
    color?: string;
    image?: string;
    video?: string;
  };
}

export interface RenderSettings {
  resolution: '720p' | '1080p' | '4k';
  fps: 24 | 30 | 60;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  format: 'mp4' | 'webm' | 'mov';
  codec: 'h264' | 'h265' | 'vp9';
  bitrate?: string;
  includeAudio: boolean;
  includeSubtitles: boolean;
}

export type RenderStatus = 
  | 'pending'
  | 'processing'
  | 'rendering'
  | 'uploading'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TransitionType = 
  | 'none'
  | 'fade'
  | 'slide'
  | 'zoom'
  | 'dissolve'
  | 'wipe';

export interface RenderProgress {
  jobId: string;
  status: RenderStatus;
  progress: number; // 0-100
  currentSlide?: number;
  totalSlides: number;
  estimatedTimeRemaining?: number; // segundos
  message?: string;
}
```

#### 2. FFmpeg Renderer (ffmpeg-renderer.ts)
```typescript
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { RenderJob, RenderSettings, RenderProgress } from '../types/render-types';
import { S3StorageService } from '../services/s3-storage';

export class FFmpegRenderer {
  private s3Service: S3StorageService;
  private tempDir: string;
  
  constructor() {
    this.s3Service = new S3StorageService();
    this.tempDir = path.join(process.cwd(), 'temp', 'render');
  }
  
  async renderVideo(job: RenderJob, onProgress: (progress: RenderProgress) => void): Promise<string> {
    const jobTempDir = path.join(this.tempDir, job.id);
    await fs.mkdir(jobTempDir, { recursive: true });
    
    try {
      // 1. Preparar assets
      onProgress({
        jobId: job.id,
        status: 'processing',
        progress: 5,
        totalSlides: job.slides.length,
        message: 'Preparando assets...'
      });
      
      await this.prepareAssets(job, jobTempDir);
      
      // 2. Gerar cenas individuais
      onProgress({
        jobId: job.id,
        status: 'rendering',
        progress: 10,
        totalSlides: job.slides.length,
        message: 'Gerando cenas...'
      });
      
      const sceneFiles = await this.generateScenes(job, jobTempDir, onProgress);
      
      // 3. Compor vídeo final
      onProgress({
        jobId: job.id,
        status: 'rendering',
        progress: 80,
        totalSlides: job.slides.length,
        message: 'Compondo vídeo final...'
      });
      
      const outputFile = await this.composeVideo(sceneFiles, job.settings, jobTempDir);
      
      // 4. Upload para S3
      onProgress({
        jobId: job.id,
        status: 'uploading',
        progress: 90,
        totalSlides: job.slides.length,
        message: 'Fazendo upload...'
      });
      
      const s3Url = await this.uploadToS3(outputFile, job.projectId);
      
      // 5. Cleanup
      await this.cleanup(jobTempDir);
      
      onProgress({
        jobId: job.id,
        status: 'completed',
        progress: 100,
        totalSlides: job.slides.length,
        message: 'Concluído!'
      });
      
      return s3Url;
      
    } catch (error) {
      await this.cleanup(jobTempDir);
      throw error;
    }
  }
  
  private async prepareAssets(job: RenderJob, tempDir: string): Promise<void> {
    const assetsDir = path.join(tempDir, 'assets');
    await fs.mkdir(assetsDir, { recursive: true });
    
    // Download de imagens do S3
    for (const slide of job.slides) {
      for (let i = 0; i < slide.images.length; i++) {
        const imageUrl = slide.images[i];
        const imagePath = path.join(assetsDir, `slide-${slide.slideNumber}-img-${i}.jpg`);
        await this.downloadImage(imageUrl, imagePath);
      }
    }
    
    // Preparar áudios TTS se necessário
    if (job.settings.includeAudio) {
      await this.prepareAudioAssets(job, assetsDir);
    }
  }
  
  private async generateScenes(
    job: RenderJob, 
    tempDir: string, 
    onProgress: (progress: RenderProgress) => void
  ): Promise<string[]> {
    const scenesDir = path.join(tempDir, 'scenes');
    await fs.mkdir(scenesDir, { recursive: true });
    
    const sceneFiles: string[] = [];
    
    for (let i = 0; i < job.slides.length; i++) {
      const slide = job.slides[i];
      const sceneFile = path.join(scenesDir, `scene-${slide.slideNumber}.mp4`);
      
      await this.generateSlideScene(slide, sceneFile, job.settings, tempDir);
      sceneFiles.push(sceneFile);
      
      // Atualizar progresso
      const progress = 10 + (i / job.slides.length) * 70;
      onProgress({
        jobId: job.id,
        status: 'rendering',
        progress: Math.round(progress),
        currentSlide: i + 1,
        totalSlides: job.slides.length,
        message: `Renderizando slide ${i + 1}/${job.slides.length}...`
      });
    }
    
    return sceneFiles;
  }
  
  private async generateSlideScene(
    slide: RenderSlide, 
    outputFile: string, 
    settings: RenderSettings,
    tempDir: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      // Configurar resolução
      const { width, height } = this.getResolution(settings.resolution);
      
      // Background
      if (slide.background?.image) {
        command.input(slide.background.image);
      } else {
        // Criar background sólido
        command.input(`color=${slide.background?.color || '#ffffff'}:size=${width}x${height}:duration=${slide.duration}`)
               .inputFormat('lavfi');
      }
      
      // Adicionar imagens
      slide.images.forEach((imagePath, index) => {
        command.input(imagePath);
      });
      
      // Adicionar áudio se disponível
      if (slide.audio?.audioUrl) {
        command.input(slide.audio.audioUrl);
      }
      
      // Configurar filtros de vídeo
      const videoFilters = this.buildVideoFilters(slide, width, height);
      command.complexFilter(videoFilters);
      
      // Configurações de output
      command
        .outputOptions([
          '-c:v', this.getVideoCodec(settings.codec),
          '-preset', this.getPreset(settings.quality),
          '-crf', this.getCRF(settings.quality),
          '-r', settings.fps.toString(),
          '-t', slide.duration.toString()
        ])
        .output(outputFile)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }
  
  private buildVideoFilters(slide: RenderSlide, width: number, height: number): string[] {
    const filters: string[] = [];
    
    // Base background
    filters.push('[0:v]scale=' + width + ':' + height + '[bg]');
    
    // Overlay de imagens
    slide.images.forEach((_, index) => {
      const inputIndex = index + 1;
      const prevLabel = index === 0 ? '[bg]' : `[overlay${index - 1}]`;
      const currentLabel = `[overlay${index}]`;
      
      // Calcular posição da imagem (centralizada por padrão)
      const x = '(main_w-overlay_w)/2';
      const y = '(main_h-overlay_h)/2';
      
      filters.push(
        `[${inputIndex}:v]scale=iw*min(${width}/iw\\,${height}/ih):ih*min(${width}/iw\\,${height}/ih)[img${index}]`,
        `${prevLabel}[img${index}]overlay=${x}:${y}${currentLabel}`
      );
    });
    
    // Adicionar texto (título e conteúdo)
    if (slide.title) {
      const lastLabel = slide.images.length > 0 ? `[overlay${slide.images.length - 1}]` : '[bg]';
      filters.push(
        `${lastLabel}drawtext=text='${this.escapeText(slide.title)}':fontfile=/System/Library/Fonts/Arial.ttf:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=50[title]`
      );
    }
    
    return filters;
  }
  
  private async composeVideo(sceneFiles: string[], settings: RenderSettings, tempDir: string): Promise<string> {
    const outputFile = path.join(tempDir, 'final-video.mp4');
    const concatFile = path.join(tempDir, 'concat.txt');
    
    // Criar arquivo de concatenação
    const concatContent = sceneFiles.map(file => `file '${file}'`).join('\n');
    await fs.writeFile(concatFile, concatContent);
    
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatFile)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions([
          '-c', 'copy',
          '-movflags', '+faststart'
        ])
        .output(outputFile)
        .on('end', () => resolve(outputFile))
        .on('error', reject)
        .run();
    });
  }
  
  private async uploadToS3(filePath: string, projectId: string): Promise<string> {
    const fileName = `video-${Date.now()}.mp4`;
    const s3Key = `projects/${projectId}/videos/${fileName}`;
    
    const fileBuffer = await fs.readFile(filePath);
    return await this.s3Service.uploadVideo(fileBuffer, s3Key);
  }
  
  private async cleanup(tempDir: string): Promise<void> {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Erro ao limpar arquivos temporários:', error);
    }
  }
  
  // Métodos auxiliares
  private getResolution(resolution: string): { width: number; height: number } {
    const resolutions = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '4k': { width: 3840, height: 2160 }
    };
    return resolutions[resolution] || resolutions['1080p'];
  }
  
  private getVideoCodec(codec: string): string {
    const codecs = {
      'h264': 'libx264',
      'h265': 'libx265',
      'vp9': 'libvpx-vp9'
    };
    return codecs[codec] || 'libx264';
  }
  
  private getPreset(quality: string): string {
    const presets = {
      'low': 'ultrafast',
      'medium': 'medium',
      'high': 'slow',
      'ultra': 'veryslow'
    };
    return presets[quality] || 'medium';
  }
  
  private getCRF(quality: string): string {
    const crfs = {
      'low': '28',
      'medium': '23',
      'high': '18',
      'ultra': '15'
    };
    return crfs[quality] || '23';
  }
  
  private escapeText(text: string): string {
    return text.replace(/'/g, "\\'").replace(/:/g, "\\:");
  }
  
  private async downloadImage(url: string, outputPath: string): Promise<void> {
    // Implementar download de imagem do S3
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    await fs.writeFile(outputPath, Buffer.from(buffer));
  }
  
  private async prepareAudioAssets(job: RenderJob, assetsDir: string): Promise<void> {
    // Implementar preparação de assets de áudio
    // Será detalhado na FASE 7 (Voice Cloning)
  }
}
```

### Critérios de Aceitação FASE 2

#### ✅ Funcionalidades Obrigatórias
- [ ] Redis sempre conectado (sem fallback mock)
- [ ] FFmpeg gera vídeos MP4 reais
- [ ] Vídeos salvos no S3 com URLs reais
- [ ] Progress tracking em tempo real
- [ ] Queue processa múltiplos jobs simultaneamente
- [ ] Notificações de conclusão funcionais
- [ ] Error handling robusto com retry
- [ ] Cleanup automático de arquivos temporários
- [ ] Suporte a múltiplas resoluções (720p, 1080p, 4K)
- [ ] Otimização de vídeo para web

#### ✅ Performance
- [ ] Render de 10 slides em < 5 minutos
- [ ] Processamento paralelo de cenas
- [ ] Upload otimizado para S3
- [ ] Compressão eficiente sem perda de qualidade

---

*[Continuação das outras 8 fases será fornecida no próximo documento devido ao limite de tamanho]*