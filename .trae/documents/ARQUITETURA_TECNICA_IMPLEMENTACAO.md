# 🏗️ ARQUITETURA TÉCNICA - IMPLEMENTAÇÃO 100% REAL

**Documento**: Especificação de Arquitetura Técnica  
**Data**: 06/10/2025  
**Versão**: 1.0.0  
**Objetivo**: Definir arquitetura técnica para eliminar mocks e implementar funcionalidades reais  

---

## 📋 ÍNDICE

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Arquitetura de Dados](#arquitetura-de-dados)
3. [Arquitetura de Serviços](#arquitetura-de-serviços)
4. [Arquitetura de APIs](#arquitetura-de-apis)
5. [Arquitetura de Processamento](#arquitetura-de-processamento)
6. [Arquitetura de Segurança](#arquitetura-de-segurança)
7. [Arquitetura de Deploy](#arquitetura-de-deploy)

---

## 🔍 VISÃO GERAL DA ARQUITETURA {#visão-geral-da-arquitetura}

### Arquitetura Atual vs. Arquitetura Alvo

```mermaid
graph TB
    subgraph "ATUAL (70-75% Real)"
        A1[Frontend Next.js] --> A2[API Routes]
        A2 --> A3[Mock Data Layer]
        A2 --> A4[Real Data Layer]
        A3 --> A5[(Fake Data)]
        A4 --> A6[(PostgreSQL)]
        A2 --> A7[S3 Storage]
    end
    
    subgraph "ALVO (100% Real)"
        B1[Frontend Next.js] --> B2[API Routes]
        B2 --> B3[Service Layer]
        B3 --> B4[Data Access Layer]
        B4 --> B5[(PostgreSQL)]
        B3 --> B6[Queue System]
        B6 --> B7[(Redis)]
        B3 --> B8[External APIs]
        B8 --> B9[OpenAI GPT-4]
        B8 --> B10[ElevenLabs]
        B3 --> B11[File Storage]
        B11 --> B12[AWS S3]
        B3 --> B13[Processing Engine]
        B13 --> B14[FFmpeg]
        B13 --> B15[PptxGenJS]
    end
```

### Princípios Arquiteturais

#### 1. Separation of Concerns
```typescript
// Camadas bem definidas
Frontend Layer (UI/UX)
  ↓
API Layer (Routes + Validation)
  ↓
Service Layer (Business Logic)
  ↓
Data Access Layer (Repositories)
  ↓
Infrastructure Layer (DB, S3, Redis)
```

#### 2. Dependency Injection
```typescript
// Inversão de dependências
interface IPPTXProcessor {
  extract(s3Key: string): Promise<PPTXResult>;
}

class PPTXService {
  constructor(
    private processor: IPPTXProcessor,
    private storage: IStorageService,
    private repository: ISlideRepository
  ) {}
}
```

#### 3. Event-Driven Architecture
```typescript
// Eventos para processamento assíncrono
PPTXUploaded → PPTXProcessingStarted → SlidesExtracted → RenderQueued → VideoGenerated
```

---

## 🗄️ ARQUITETURA DE DADOS {#arquitetura-de-dados}

### Modelo de Dados Atualizado

```mermaid
erDiagram
    USER ||--o{ PROJECT : creates
    PROJECT ||--o{ SLIDE : contains
    PROJECT ||--o{ RENDER_JOB : has
    SLIDE ||--o{ SLIDE_ASSET : contains
    RENDER_JOB ||--o{ RENDER_SCENE : includes
    PROJECT ||--o{ COMPLIANCE_ANALYSIS : has
    PROJECT ||--o{ ANALYTICS_EVENT : tracks
    
    USER {
        string id PK
        string email
        string name
        string plan
        datetime created_at
        datetime updated_at
    }
    
    PROJECT {
        string id PK
        string user_id FK
        string title
        string description
        string status
        string pptx_s3_key
        int total_slides
        string thumbnail_url
        json metadata
        datetime created_at
        datetime updated_at
    }
    
    SLIDE {
        string id PK
        string project_id FK
        int slide_number
        string title
        text content
        text notes
        string layout
        json extracted_shapes
        json extracted_tables
        json extracted_charts
        int word_count
        int estimated_duration
        string background_color
        string background_image
        datetime created_at
        datetime updated_at
    }
    
    SLIDE_ASSET {
        string id PK
        string slide_id FK
        string asset_type
        string s3_key
        string public_url
        int width
        int height
        int x_position
        int y_position
        json metadata
        datetime created_at
    }
    
    RENDER_JOB {
        string id PK
        string project_id FK
        string status
        string job_id
        string video_s3_key
        string video_url
        int duration
        int file_size
        string resolution
        json render_config
        text error_message
        datetime started_at
        datetime completed_at
        datetime created_at
    }
    
    RENDER_SCENE {
        string id PK
        string render_job_id FK
        int scene_number
        string slide_id FK
        string image_url
        string audio_url
        int duration
        string transition_type
        json effects
        datetime created_at
    }
    
    COMPLIANCE_ANALYSIS {
        string id PK
        string project_id FK
        string nr_type
        int score
        json analysis_result
        json gaps_identified
        json suggestions
        boolean ai_generated
        datetime analyzed_at
        datetime created_at
    }
    
    ANALYTICS_EVENT {
        string id PK
        string project_id FK
        string user_id FK
        string event_type
        json event_data
        string session_id
        datetime created_at
    }
```

### Schema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  plan      String   @default("free")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  projects         Project[]
  analyticsEvents  AnalyticsEvent[]

  @@map("users")
}

model Project {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  status      String   @default("draft") // draft, processing, ready, error
  pptxS3Key   String?
  totalSlides Int      @default(0)
  thumbnailUrl String?
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user                User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  slides              Slide[]
  renderJobs          RenderJob[]
  complianceAnalyses  ComplianceAnalysis[]
  analyticsEvents     AnalyticsEvent[]

  @@index([userId])
  @@index([status])
  @@map("projects")
}

model Slide {
  id                String   @id @default(cuid())
  projectId         String
  slideNumber       Int
  title             String
  content           String   @db.Text
  notes             String?  @db.Text
  layout            String   @default("auto")
  extractedShapes   Json?
  extractedTables   Json?
  extractedCharts   Json?
  wordCount         Int      @default(0)
  estimatedDuration Int      @default(5) // seconds
  backgroundColor   String?
  backgroundImage   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assets      SlideAsset[]
  renderScenes RenderScene[]

  @@unique([projectId, slideNumber])
  @@index([projectId])
  @@map("slides")
}

model SlideAsset {
  id          String   @id @default(cuid())
  slideId     String
  assetType   String   // image, video, audio, shape
  s3Key       String
  publicUrl   String
  width       Int?
  height      Int?
  xPosition   Int?
  yPosition   Int?
  metadata    Json?
  createdAt   DateTime @default(now())

  // Relations
  slide Slide @relation(fields: [slideId], references: [id], onDelete: Cascade)

  @@index([slideId])
  @@index([assetType])
  @@map("slide_assets")
}

model RenderJob {
  id           String    @id @default(cuid())
  projectId    String
  status       String    @default("pending") // pending, processing, completed, failed
  jobId        String?   // BullMQ job ID
  videoS3Key   String?
  videoUrl     String?
  duration     Int?      // seconds
  fileSize     Int?      // bytes
  resolution   String?   // 1920x1080
  renderConfig Json?
  errorMessage String?   @db.Text
  startedAt    DateTime?
  completedAt  DateTime?
  createdAt    DateTime  @default(now())

  // Relations
  project      Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  renderScenes RenderScene[]

  @@index([projectId])
  @@index([status])
  @@map("render_jobs")
}

model RenderScene {
  id             String   @id @default(cuid())
  renderJobId    String
  sceneNumber    Int
  slideId        String
  imageUrl       String
  audioUrl       String?
  duration       Int      // seconds
  transitionType String?