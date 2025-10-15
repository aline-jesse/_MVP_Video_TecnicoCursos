# 🏗️ ARQUITETURA TÉCNICA - SISTEMA 100% REAL

**Documento**: Arquitetura Técnica Completa  
**Data**: 06/10/2025  
**Versão**: 1.0.0  
**Objetivo**: Definir arquitetura para sistema 100% funcional real  

---

## 1. Arquitetura Geral do Sistema

### Diagrama de Arquitetura End-to-End

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React 18 + Next.js 14]
        B[TypeScript + Tailwind CSS]
        C[Shadcn UI Components]
        D[Canvas Editor Pro V3]
    end
    
    subgraph "API Layer"
        E[Next.js API Routes]
        F[NextAuth.js]
        G[Middleware & Validation]
    end
    
    subgraph "Business Logic Layer"
        H[PPTX Processor]
        I[Video Renderer]
        J[Compliance Engine]
        K[Analytics Engine]
        L[Voice Cloning Service]
        M[Avatar 3D Service]
    end
    
    subgraph "Queue & Processing"
        N[Redis Queue]
        O[BullMQ Jobs]
        P[FFmpeg Workers]
        Q[Background Tasks]
    end
    
    subgraph "Data Layer"
        R[(PostgreSQL)]
        S[Prisma ORM]
        T[Redis Cache]
    end
    
    subgraph "Storage Layer"
        U[AWS S3 Storage]
        V[CDN CloudFront]
    end
    
    subgraph "External APIs"
        W[OpenAI GPT-4]
        X[ElevenLabs Voice]
        Y[Azure Speech]
        Z[WebSocket Server]
    end
    
    A --> E
    E --> H
    E --> I
    E --> J
    E --> K
    H --> N
    I --> N
    N --> P
    E --> S
    S --> R
    N --> T
    I --> U
    H --> U
    J --> W
    L --> X
    M --> U
    U --> V
    
    classDef frontend fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef business fill:#e8f5e8
    classDef queue fill:#fff3e0
    classDef data fill:#fce4ec
    classDef storage fill:#f1f8e9
    classDef external fill:#fff8e1
    
    class A,B,C,D frontend
    class E,F,G api
    class H,I,J,K,L,M business
    class N,O,P,Q queue
    class R,S,T data
    class U,V storage
    class W,X,Y,Z external
```

### Fluxo de Dados Principal

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API
    participant P as PPTX Processor
    participant Q as Queue
    participant R as Renderer
    participant S as Storage
    participant D as Database
    
    U->>F: Upload PPTX
    F->>A: POST /api/v1/pptx/process
    A->>P: Processar arquivo
    P->>S: Extrair e salvar imagens
    P->>D: Salvar slides reais
    A->>F: Slides processados
    
    U->>F: Iniciar render
    F->>A: POST /api/v1/video/render
    A->>Q: Adicionar job à queue
    Q->>R: Processar render
    R->>S: Gerar e salvar vídeo
    R->>D: Atualizar status
    R->>F: Notificar conclusão (WebSocket)
    
    U->>F: Download vídeo
    F->>S: Acessar vídeo via CDN
```

---

## 2. Tecnologias e Dependências

### Frontend Stack
```typescript
// Core Framework
"next": "^14.0.0"
"react": "^18.0.0"
"typescript": "^5.0.0"

// UI & Styling
"tailwindcss": "^3.3.0"
"@radix-ui/react-*": "^1.0.0"
"lucide-react": "^0.263.0"
"framer-motion": "^10.16.0"

// State Management
"zustand": "^4.4.0"
"react-query": "^3.39.0"

// Canvas & Editor
"fabric": "^5.3.0"
"konva": "^9.2.0"
"react-konva": "^18.2.0"
```

### Backend Stack
```typescript
// Core APIs
"next": "^14.0.0"
"next-auth": "^4.24.0"

// Database & ORM
"prisma": "^5.0.0"
"@prisma/client": "^5.0.0"
"pg": "^8.11.0"

// Queue & Cache
"ioredis": "^5.3.0"
"bullmq": "^4.0.0"

// File Processing
"pptxgenjs": "^3.12.0"
"sharp": "^0.32.0"
"fluent-ffmpeg": "^2.1.0"

// External APIs
"openai": "^4.0.0"
"elevenlabs": "^0.4.0"
"socket.io": "^4.7.0"
```

### Infrastructure
```yaml
# Production Environment
Database: PostgreSQL 15+
Cache: Redis 7+
Storage: AWS S3 + CloudFront CDN
Queue: Redis + BullMQ
Monitoring: DataDog / New Relic
Deployment: Vercel / AWS ECS
```

---

## 3. Definições de Rotas

### Frontend Routes
| Rota | Componente | Propósito | Auth |
|------|------------|-----------|------|
| `/` | HomePage | Landing page e navegação principal | ❌ |
| `/login` | LoginPage | Autenticação de usuários | ❌ |
| `/register` | RegisterPage | Registro de novos usuários | ❌ |
| `/dashboard` | DashboardPage | Visão geral de projetos | ✅ |
| `/projects` | ProjectsPage | Lista de projetos do usuário | ✅ |
| `/projects/[id]` | ProjectDetailPage | Detalhes e edição de projeto | ✅ |
| `/projects/[id]/editor` | EditorPage | Editor de slides e timeline | ✅ |
| `/projects/[id]/render` | RenderPage | Configuração e render de vídeo | ✅ |
| `/projects/[id]/analytics` | AnalyticsPage | Analytics e relatórios | ✅ |
| `/studio` | StudioPage | Studio wizard para criação | ✅ |
| `/templates` | TemplatesPage | Biblioteca de templates | ✅ |
| `/profile` | ProfilePage | Configurações do usuário | ✅ |
| `/collaboration/[id]` | CollaborationPage | Colaboração em tempo real | ✅ |

### API Routes

#### Autenticação
```typescript
// NextAuth.js routes
GET/POST /api/auth/[...nextauth]  // Autenticação completa
GET /api/auth/session             // Sessão atual
POST /api/auth/signout           // Logout
```

#### Projetos
```typescript
GET    /api/v1/projects          // Listar projetos
POST   /api/v1/projects          // Criar projeto
GET    /api/v1/projects/[id]     // Detalhes do projeto
PUT    /api/v1/projects/[id]     // Atualizar projeto
DELETE /api/v1/projects/[id]     // Deletar projeto
```

#### PPTX Processing (FASE 1)
```typescript
POST /api/v1/pptx/process        // Processar PPTX real
GET  /api/v1/pptx/[id]/slides    // Obter slides processados
PUT  /api/v1/pptx/[id]/slides/[slideId] // Atualizar slide
```

#### Video Rendering (FASE 2)
```typescript
POST /api/v1/video/render        // Iniciar render real
GET  /api/v1/video/status/[jobId] // Status do render
POST /api/v1/video/cancel/[jobId] // Cancelar render
GET  /api/v1/video/download/[id] // Download do vídeo
```

#### Compliance NR (FASE 3)
```typescript
POST /api/v1/compliance/validate // Validar com GPT-4
GET  /api/v1/compliance/templates // Templates NR
GET  /api/v1/compliance/reports/[id] // Relatório detalhado
```

#### Analytics (FASE 4)
```typescript
GET /api/v1/analytics/dashboard  // Dashboard real-time
GET /api/v1/analytics/projects/[id] // Analytics do projeto
GET /api/v1/analytics/export     // Export PDF/CSV
```

#### Voice Cloning (FASE 7)
```typescript
POST /api/v1/voice/clone         // Criar clone de voz
GET  /api/v1/voice/library       // Biblioteca de vozes
POST /api/v1/voice/generate      // Gerar áudio
```

#### Collaboration (FASE 8)
```typescript
GET  /api/v1/collaboration/[id]  // Dados de colaboração
POST /api/v1/collaboration/[id]/join // Entrar na sessão
WebSocket /api/v1/collaboration/ws // WebSocket real-time
```

---

## 4. Definições de APIs Externas

### 4.1 OpenAI GPT-4 (FASE 3)

#### Validação de Compliance NR
```typescript
POST https://api.openai.com/v1/chat/completions

// Request
interface ComplianceRequest {
  model: "gpt-4";
  messages: [
    {
      role: "system";
      content: string; // Prompt de validação NR
    },
    {
      role: "user";
      content: string; // Conteúdo do slide
    }
  ];
  temperature: 0.1;
  max_tokens: 1000;
}

// Response
interface ComplianceResponse {
  choices: [{
    message: {
      content: string; // JSON com score e análise
    }
  }];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Parsed Response
interface ComplianceResult {
  score: number; // 0-100
  compliance: boolean;
  issues: string[];
  suggestions: string[];
  category: string;
  confidence: number;
}
```

### 4.2 ElevenLabs Voice API (FASE 7)

#### Voice Cloning
```typescript
POST https://api.elevenlabs.io/v1/voices/add

// Request
interface VoiceCloneRequest {
  name: string;
  files: File[]; // Samples de voz
  description?: string;
  labels?: Record<string, string>;
}

// Response
interface VoiceCloneResponse {
  voice_id: string;
  name: string;
  samples: Array<{
    sample_id: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
  }>;
  category: string;
  fine_tuning: {
    is_allowed_to_fine_tune: boolean;
    state: string;
  };
}
```

#### Text-to-Speech
```typescript
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}

// Request
interface TTSRequest {
  text: string;
  model_id: "eleven_monolingual_v1" | "eleven_multilingual_v2";
  voice_settings: {
    stability: number; // 0-1
    similarity_boost: number; // 0-1
    style?: number; // 0-1
    use_speaker_boost?: boolean;
  };
}

// Response: Audio stream (MP3)
```

### 4.3 AWS S3 Storage

#### Upload de Arquivos
```typescript
// Configuração S3
const s3Config = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  bucket: process.env.AWS_S3_BUCKET,
};

// Upload de Imagem
interface ImageUpload {
  key: string; // projects/{projectId}/images/{filename}
  body: Buffer;
  contentType: string;
  metadata: {
    projectId: string;
    slideNumber: string;
    originalName: string;
  };
}

// Upload de Vídeo
interface VideoUpload {
  key: string; // projects/{projectId}/videos/{filename}
  body: Buffer;
  contentType: "video/mp4";
  metadata: {
    projectId: string;
    duration: string;
    resolution: string;
    fileSize: string;
  };
}
```

---

## 5. Arquitetura de Servidor

### Diagrama de Camadas

```mermaid
graph TD
    subgraph "Presentation Layer"
        A[Next.js API Routes]
        B[Middleware]
        C[Authentication]
        D[Validation]
    end
    
    subgraph "Business Logic Layer"
        E[Project Service]
        F[PPTX Service]
        G[Render Service]
        H[Compliance Service]
        I[Analytics Service]
        J[Voice Service]
        K[Collaboration Service]
    end
    
    subgraph "Data Access Layer"
        L[Prisma Repository]
        M[Redis Repository]
        N[S3 Repository]
        O[External API Clients]
    end
    
    subgraph "Infrastructure Layer"
        P[(PostgreSQL)]
        Q[Redis Cache]
        R[AWS S3]
        S[External APIs]
    end
    
    A --> E
    A --> F
    A --> G
    A --> H
    B --> C
    C --> D
    E --> L
    F --> L
    G --> M
    H --> O
    L --> P
    M --> Q
    N --> R
    O --> S
    
    classDef presentation fill:#e3f2fd
    classDef business fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef infrastructure fill:#fce4ec
    
    class A,B,C,D presentation
    class E,F,G,H,I,J,K business
    class L,M,N,O data
    class P,Q,R,S infrastructure
```

### Padrões de Arquitetura

#### 1. Repository Pattern
```typescript
// Interface base
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findMany(filter: any): Promise<T[]>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<void>;
}

// Implementação Prisma
class ProjectRepository implements Repository<Project> {
  async findById(id: string): Promise<Project | null> {
    return await prisma.project.findUnique({
      where: { id },
      include: { slides: true }
    });
  }
  
  async findMany(filter: ProjectFilter): Promise<Project[]> {
    return await prisma.project.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });
  }
  
  // ... outras implementações
}
```

#### 2. Service Layer Pattern
```typescript
// Service base
abstract class BaseService {
  protected repository: Repository<any>;
  protected logger: Logger;
  
  constructor(repository: Repository<any>) {
    this.repository = repository;
    this.logger = new Logger(this.constructor.name);
  }
}

// Implementação específica
class ProjectService extends BaseService {
  constructor(private projectRepo: ProjectRepository) {
    super(projectRepo);
  }
  
  async createProject(data: CreateProjectData): Promise<Project> {
    this.logger.info('Creating new project', { data });
    
    // Validação
    await this.validateProjectData(data);
    
    // Criação
    const project = await this.projectRepo.create(data);
    
    // Log de auditoria
    await this.auditLog('PROJECT_CREATED', project.id);
    
    return project;
  }
  
  private async validateProjectData(data: CreateProjectData): Promise<void> {
    if (!data.name || data.name.length < 3) {
      throw new ValidationError('Nome do projeto deve ter pelo menos 3 caracteres');
    }
    
    if (!data.userId) {
      throw new ValidationError('ID do usuário é obrigatório');
    }
  }
  
  private async auditLog(action: string, projectId: string): Promise<void> {
    // Implementar log de auditoria
  }
}
```

#### 3. Queue Pattern (FASE 2)
```typescript
// Queue abstrata
abstract class BaseQueue {
  protected queue: Queue;
  protected redis: Redis;
  
  constructor(queueName: string) {
    this.redis = new Redis(process.env.REDIS_URL);
    this.queue = new Queue(queueName, { connection: this.redis });
  }
  
  abstract processJob(job: Job): Promise<any>;
  
  async addJob(data: any, options?: JobOptions): Promise<Job> {
    return await this.queue.add('process', data, options);
  }
}

// Implementação específica
class RenderQueue extends BaseQueue {
  constructor() {
    super('video-render');
    this.setupWorker();
  }
  
  async processJob(job: Job<RenderJobData>): Promise<string> {
    const { projectId, settings } = job.data;
    
    // Atualizar progresso
    await job.updateProgress(0);
    
    // Processar render
    const renderer = new FFmpegRenderer();
    const videoUrl = await renderer.renderVideo(job.data, (progress) => {
      job.updateProgress(progress.progress);
    });
    
    return videoUrl;
  }
  
  private setupWorker(): void {
    const worker = new Worker('video-render', this.processJob.bind(this), {
      connection: this.redis,
      concurrency: 2 // Máximo 2 renders simultâneos
    });
    
    worker.on('completed', (job, result) => {
      console.log(`Render completed: ${job.id} -> ${result}`);
    });
    
    worker.on('failed', (job, err) => {
      console.error(`Render failed: ${job.id}`, err);
    });
  }
}
```

---

## 6. Modelo de Dados

### Diagrama ER Completo

```mermaid
erDiagram
    USER ||--o{ PROJECT : creates
    USER ||--o{ COLLABORATION_SESSION : participates
    PROJECT ||--o{ SLIDE : contains
    PROJECT ||--o{ RENDER_JOB : generates
    PROJECT ||--o{ COMPLIANCE_REPORT : has
    PROJECT ||--o{ ANALYTICS_EVENT : tracks
    SLIDE ||--o{ SLIDE_IMAGE : contains
    SLIDE ||--o{ SLIDE_AUDIO : has
    RENDER_JOB ||--o{ RENDER_PROGRESS : tracks
    COLLABORATION_SESSION ||--o{ COLLABORATION_EVENT : logs
    
    USER {
        string id PK
        string email UK
        string name
        string passwordHash
        string plan
        int usageCount
        json preferences
        datetime createdAt
        datetime updatedAt
    }
    
    PROJECT {
        string id PK
        string userId FK
        string name
        string description
        string status
        int totalSlides
        int totalWords
        int estimatedDuration
        json settings
        datetime createdAt
        datetime updatedAt
    }
    
    SLIDE {
        string id PK
        string projectId FK
        int slideNumber
        string title
        text content
        text notes
        string layout
        json extractedShapes
        json extractedTables
        json extractedCharts
        int wordCount
        int estimatedDuration
        int order
        datetime createdAt
        datetime updatedAt
    }
    
    SLIDE_IMAGE {
        string id PK
        string slideId FK
        string s3Url
        string s3Key
        string originalName
        int width
        int height
        string format
        int size
        json position
        datetime createdAt
    }
    
    SLIDE_AUDIO {
        string id PK
        string slideId FK
        string s3Url
        string s3Key
        string voiceId
        text ttsText
        int duration
        string status
        datetime createdAt
    }
    
    RENDER_JOB {
        string id PK
        string projectId FK
        string userId FK
        string status
        int progress
        json settings
        string outputUrl
        string thumbnailUrl
        text error
        datetime createdAt
        datetime startedAt
        datetime completedAt
    }
    
    RENDER_PROGRESS {
        string id PK
        string jobId FK
        string status
        int progress
        int currentSlide
        int totalSlides
        int estimatedTimeRemaining
        string message
        datetime timestamp
    }
    
    COMPLIANCE_REPORT {
        string id PK
        string projectId FK
        string templateId
        int score
        boolean compliant
        json issues
        json suggestions
        string category
        float confidence
        datetime createdAt
    }
    
    ANALYTICS_EVENT {
        string id PK
        string projectId FK
        string userId FK
        string eventType
        json eventData
        string sessionId
        datetime timestamp
    }
    
    COLLABORATION_SESSION {
        string id PK
        string projectId FK
        string ownerId FK
        string status
        json participants
        datetime createdAt
        datetime endedAt
    }
    
    COLLABORATION_EVENT {
        string id PK
        string sessionId FK
        string userId FK
        string eventType
        json eventData
        datetime timestamp
    }
    
    VOICE_CLONE {
        string id PK
        string userId FK
        string name
        string elevenLabsId
        string status
        json samples
        datetime createdAt
    }
    
    AVATAR_ASSET {
        string id PK
        string name
        string s3Url
        string s3Key
        string type
        json metadata
        boolean isPublic
        datetime createdAt
    }
```

### DDL (Data Definition Language)

#### Tabelas Principais
```sql
-- Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    usage_count INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projetos
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'processed', 'rendering', 'completed', 'failed')),
    total_slides INTEGER DEFAULT 0,
    total_words INTEGER DEFAULT 0,
    estimated_duration INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slides
CREATE TABLE slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    slide_number INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    notes TEXT,
    images TEXT[] DEFAULT '{}',
    layout VARCHAR(50) DEFAULT 'auto',
    background_color VARCHAR(7),
    background_image VARCHAR(500),
    extracted_shapes JSONB,
    extracted_tables JSONB,
    extracted_charts JSONB,
    word_count INTEGER DEFAULT 0,
    estimated_duration INTEGER DEFAULT 5,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, slide_number)
);

-- Jobs de Render
CREATE TABLE render_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'rendering', 'uploading', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    settings JSONB NOT NULL DEFAULT '{}',
    output_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Progresso de Render
CREATE TABLE render_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES render_jobs(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
    current_slide INTEGER,
    total_slides INTEGER,
    estimated_time_remaining INTEGER,
    message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relatórios de Compliance
CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    template_id VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    compliant BOOLEAN NOT NULL,
    issues JSONB DEFAULT '[]',
    suggestions JSONB DEFAULT '[]',
    category VARCHAR(100),
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eventos de Analytics
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clones de Voz
CREATE TABLE voice_clones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    elevenlabs_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'training' CHECK (status IN ('training', 'ready', 'failed')),
    samples JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets de Avatar 3D
CREATE TABLE avatar_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    s3_url VARCHAR(500) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('model', 'texture', 'animation', 'thumbnail')),
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Índices para Performance
```sql
-- Índices principais
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX idx_slides_project_id ON slides(project_id);
CREATE INDEX idx_slides_order ON slides(project_id, "order");

CREATE INDEX idx_render_jobs_user_id ON render_jobs(user_id);
CREATE INDEX idx_render_jobs_status ON render_jobs(status);
CREATE INDEX idx_render_jobs_created_at ON render_jobs(created_at DESC);

CREATE INDEX idx_render_progress_job_id ON render_progress(job_id);
CREATE INDEX idx_render_progress_timestamp ON render_progress(timestamp DESC);

CREATE INDEX idx_compliance_reports_project_id ON compliance_reports(project_id);
CREATE INDEX idx_compliance_reports_score ON compliance_reports(score DESC);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_project_id ON analytics_events(project_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);

CREATE INDEX idx_voice_clones_user_id ON voice_clones(user_id);
CREATE INDEX idx_voice_clones_status ON voice_clones(status);

CREATE INDEX idx_avatar_assets_type ON avatar_assets(type);
CREATE INDEX idx_avatar_assets_public ON avatar_assets(is_public);
```

#### Dados Iniciais
```sql
-- Templates de Compliance NR
INSERT INTO compliance_templates (id, name, category, rules, created_at) VALUES
('nr-01', 'NR-01 - Disposições Gerais', 'seguranca', '{"required_topics": ["objetivos", "campo_aplicacao", "responsabilidades"]}', NOW()),
('nr-05', 'NR-05 - CIPA', 'seguranca', '{"required_topics": ["constituicao", "atribuicoes", "funcionamento"]}', NOW()),
('nr-06', 'NR-06 - EPI', 'seguranca', '{"required_topics": ["obrigacoes", "tipos", "manutencao"]}', NOW()),
('nr-10', 'NR-10 - Segurança em Instalações Elétricas', 'eletrica', '{"required_topics": ["medidas_controle", "qualificacao", "procedimentos"]}', NOW()),
('nr-12', 'NR-12 - Segurança no Trabalho em Máquinas', 'maquinas', '{"required_topics": ["protecoes", "dispositivos", "manutencao"]}', NOW()),
('nr-17', 'NR-17 - Ergonomia', 'ergonomia', '{"required_topics": ["analise", "condicoes", "organizacao"]}', NOW()),
('nr-18', 'NR-18 - Construção Civil', 'construcao', '{"required_topics": ["pcmat", "areas_vivencia", "equipamentos"]}', NOW()),
('nr-23', 'NR-23 - Proteção Contra Incêndios', 'incendio', '{"required_topics": ["prevencao", "combate", "plano_emergencia"]}', NOW()),
('nr-33', 'NR-33 - Espaços Confinados', 'confinados', '{"required_topics": ["permissao", "procedimentos", "emergencia"]}', NOW()),
('nr-35', 'NR-35 - Trabalho em Altura', 'altura', '{"required_topics": ["analise_risco", "equipamentos", "capacitacao"]}', NOW());

-- Avatares 3D padrão
INSERT INTO avatar_assets (name, s3_url, s3_key, type, metadata, is_public) VALUES
('Avatar Masculino 1', 'https://cdn.example.com/avatars/male-1.glb', 'avatars/male-1.glb', 'model', '{"gender": "male", "style": "professional"}', true),
('Avatar Feminino 1', 'https://cdn.example.com/avatars/female-1.glb', 'avatars/female-1.glb', 'model', '{"gender": "female", "style": "professional"}', true),
('Avatar Neutro 1', 'https://cdn.example.com/avatars/neutral-1.glb', 'avatars/neutral-1.glb', 'model', '{"gender": "neutral", "style": "casual"}', true);
```

---

## 7. Configurações de Ambiente

### Variáveis de Ambiente (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/video_studio"
DIRECT_URL="postgresql://user:password@localhost:5432/video_studio"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="video-studio-storage"
AWS_CLOUDFRONT_DOMAIN="d1234567890.cloudfront.net"

# OpenAI
OPENAI_API_KEY="sk-your-openai-key"
OPENAI_ORG_ID="org-your-org-id"

# ElevenLabs
ELEVENLABS_API_KEY="your-elevenlabs-key"

# Azure Speech (backup)
AZURE_SPEECH_KEY="your-azure-key"
AZURE_SPEECH_REGION="eastus"

# Monitoring
DATADOG_API_KEY="your-datadog-key"
SENTRY_DSN="your-sentry-dsn"

# Feature Flags
ENABLE_VOICE_CLONING="true"
ENABLE_COLLABORATION="true"
ENABLE_3D_AVATARS="true"
ENABLE_ANALYTICS="true"

# Limits
MAX_FILE_SIZE_MB="50"
MAX_SLIDES_PER_PROJECT="100"
MAX_CONCURRENT_RENDERS="2"
MAX_PROJECTS_FREE="5"
MAX_PROJECTS_PRO="50"
```

### Configuração Docker (docker-compose.yml)
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
    volumes:
      - ./temp:/app/temp

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: video_studio
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

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

---

## 8. Monitoramento e Observabilidade

### Métricas Principais
```typescript
// Métricas de negócio
interface BusinessMetrics {
  // Projetos
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  
  // Renders
  totalRenders: number;
  successfulRenders: number;
  failedRenders: number;
  averageRenderTime: number;
  
  // Usuários
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  
  // Performance
  apiResponseTime: number;
  renderQueueLength: number;
  storageUsage: number;
}

// Métricas técnicas
interface TechnicalMetrics {
  // Sistema
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  
  // Database
  dbConnections: number;
  dbQueryTime: number;
  dbErrors: number;
  
  // Cache
  redisConnections: number;
  cacheHitRate: number;
  cacheErrors: number;
  
  // External APIs
  openaiRequests: number;
  openaiErrors: number;
  elevenlabsRequests: number;
  elevenlabsErrors: number;
}
```

### Alertas Configurados
```yaml
# Alertas críticos
alerts:
  - name: "High Error Rate"
    condition: "error_rate > 5%"
    severity: "critical"
    notification: ["email", "slack"]
    
  - name: "Render Queue Backup"
    condition: "queue_length > 10"
    severity: "warning"
    notification: ["slack"]
    
  - name: "Database Connection Issues"
    condition: "db_errors > 10/min"
    severity: "critical"
    notification: ["email", "slack", "pagerduty"]
    
  - name: "Storage Usage High"
    condition: "storage_usage > 80%"
    severity: "warning"
    notification: ["email"]
    
  - name: "API Response Time High"
    condition: "avg_response_time > 2s"
    severity: "warning"
    notification: ["slack"]
```

---

## 9. Segurança

### Autenticação e Autorização
```typescript
// Middleware de autenticação
export async function authMiddleware(req: NextRequest) {
  const token = await getToken({ req });
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Verificar plano do usuário
  const user = await prisma.user.findUnique({
    where: { id: token.sub }
  });
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  // Adicionar informações do usuário ao request
  req.user = user;
  
  return NextResponse.next();
}

// Middleware de rate limiting
export async function rateLimitMiddleware(req: NextRequest) {
  const ip = req.ip || 'unknown';
  const key = `rate_limit:${ip}`;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 60); // 1 minuto
  }
  
  if (current > 100) { // 100 requests por minuto
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  return NextResponse.next();
}
```

### Validação de Dados
```typescript
// Schemas de validação com Zod
export const createProjectSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().max(1000).optional(),
  settings: z.object({
    resolution: z.enum(['720p', '1080p', '4k']),
    quality: z.enum(['low', 'medium', 'high', 'ultra']),
    includeAudio: z.boolean()
  }).optional()
});

export const uploadPPTXSchema = z.object({
  file: z.instanceof(File),
  projectId: z.string().uuid()
});

// Middleware de validação
export function validateSchema<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      req.validatedData = validatedData;
      return NextResponse.next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  };
}
```

---

## 10. Conclusão

Esta arquitetura técnica fornece a base sólida para implementar o sistema 100% funcional real, eliminando todos os mocks e garantindo:

### ✅ Características Principais
- **Escalabilidade**: Arquitetura em camadas com separação clara de responsabilidades
- **Performance**: Cache Redis, CDN, otimização de queries e processamento assíncrono
- **Confiabilidade**: Error handling robusto, retry mechanisms e monitoring completo
- **Segurança**: Autenticação, autorização, validação e rate limiting
- **Manutenibilidade**: Código limpo, padrões consistentes e documentação completa

### 🎯 Próximos Passos
1. **Implementar FASE 1**: PPTX Processing Real
2. **Implementar FASE 2**: Render Queue Real
3. **Continuar com as demais fases** conforme cronograma
4. **Monitorar e otimizar** continuamente

A arquitetura está preparada para suportar todas as 10 fases de implementação, garantindo que o sistema evolua de 70-75% para 100% funcional real de forma estruturada e confiável.

---

**Documento criado por**: SOLO Document AI  
**Data**: 06/10/2025  
**Versão**: 1.0.0  
**Status**: Pronto para implementação