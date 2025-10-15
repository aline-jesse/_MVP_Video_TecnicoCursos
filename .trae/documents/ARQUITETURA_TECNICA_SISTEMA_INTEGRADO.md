# 🏗️ Arquitetura Técnica - Sistema Integrado Unificado

## 1. Architecture Design

```mermaid
graph TD
    A[User Browser] --> B[Next.js 14 Frontend Application]
    B --> C[Unified API Gateway]
    C --> D[PPTX Processing Service]
    C --> E[Avatar 3D Rendering Service]
    C --> F[TTS & Voice Cloning Service]
    C --> G[Video Rendering Pipeline]
    C --> H[Analytics & Compliance Engine]
    
    I[Redis Queue System] --> D
    I --> E
    I --> F
    I --> G
    
    J[PostgreSQL Database] --> K[Prisma ORM]
    K --> C
    
    L[AWS S3 Storage] --> M[CloudFront CDN]
    D --> L
    E --> L
    F --> L
    G --> L
    
    N[External APIs] --> O[OpenAI GPT-4]
    N --> P[ElevenLabs TTS]
    N --> Q[Azure Speech Services]
    H --> O
    F --> P
    F --> Q
    
    R[WebSocket Server] --> B
    G --> R
    
    subgraph "Frontend Layer"
        B
    end
    
    subgraph "API Gateway Layer"
        C
    end
    
    subgraph "Microservices Layer"
        D
        E
        F
        G
        H
    end
    
    subgraph "Queue & Cache Layer"
        I
    end
    
    subgraph "Data Layer"
        J
        K
    end
    
    subgraph "Storage Layer"
        L
        M
    end
    
    subgraph "External Services"
        N
        O
        P
        Q
    end
    
    subgraph "Real-time Layer"
        R
    end
```

## 2. Technology Description

- **Frontend**: React@18 + Next.js@14 + TypeScript@5 + Tailwind CSS@3 + Framer Motion@12
- **Backend**: Next.js@14 API Routes + NextAuth.js@4 + Prisma@6 + BullMQ@5
- **Database**: PostgreSQL@15 + Redis@7 + Prisma ORM
- **Storage**: AWS S3 + CloudFront CDN + Sharp@0.32 para processamento de imagens
- **Processing**: FFmpeg@6 + PptxGenJS@3 + Canvas API + WebGL para renderização 3D
- **External APIs**: OpenAI GPT-4 + ElevenLabs + Azure Speech + Socket.io@4
- **Infrastructure**: Docker + Vercel/AWS ECS + DataDog monitoring

## 3. Route Definitions

| Route | Purpose |
|-------|---------|
| `/` | Landing page com overview do sistema e call-to-action para registro |
| `/auth/login` | Página de autenticação com OAuth (Google/Microsoft) e email/senha |
| `/auth/register` | Registro de novos usuários com planos básico/premium |
| `/dashboard` | Dashboard unificado principal com visão geral de projetos e analytics |
| `/studio` | Ambiente integrado de criação com todos os módulos unificados |
| `/studio/project/[id]` | Editor específico de projeto com estado persistente |
| `/library` | Biblioteca centralizada de assets (avatares, vozes, templates) |
| `/render-center` | Centro de monitoramento de renderização e downloads |
| `/analytics` | Analytics avançados e relatórios de compliance |
| `/profile` | Configurações de usuário e preferências do sistema |
| `/admin` | Painel administrativo para gestão de usuários e sistema |

## 4. API Definitions

### 4.1 Core API - Unified Project Management

**Criar projeto integrado**
```
POST /api/v1/projects/unified
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| name | string | true | Nome do projeto |
| type | enum | true | Tipo: 'pptx_import' ou 'from_scratch' |
| pptx_file | File | false | Arquivo PPTX (se type = pptx_import) |
| template_id | string | false | ID do template NR (opcional) |

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| project_id | string | ID único do projeto criado |
| status | string | Status do processamento inicial |
| slides | array | Array de slides processados (se PPTX) |
| timeline | object | Configuração inicial da timeline |

**Processamento PPTX integrado**
```
POST /api/v1/pptx/process-unified
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| project_id | string | true | ID do projeto |
| file | File | true | Arquivo PPTX para processamento |
| extract_images | boolean | false | Extrair imagens automaticamente |
| generate_timeline | boolean | false | Gerar timeline automaticamente |

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| slides | array | Slides extraídos com texto, imagens e layouts |
| timeline_config | object | Configuração automática da timeline |
| processing_status | string | Status do processamento |

### 4.2 Avatar 3D Integration API

**Renderizar avatar com sincronização**
```
POST /api/v1/avatar/render-sync
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| project_id | string | true | ID do projeto |
| avatar_id | string | true | ID do avatar 3D selecionado |
| audio_url | string | true | URL do áudio TTS gerado |
| scene_config | object | true | Configurações de cena (posição, iluminação) |
| lip_sync | boolean | false | Ativar sincronização labial |

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| render_job_id | string | ID do job de renderização |
| estimated_time | number | Tempo estimado em segundos |
| preview_url | string | URL do preview em baixa qualidade |

### 4.3 TTS & Voice Cloning API

**Gerar áudio com voice cloning**
```
POST /api/v1/tts/generate-voice
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| project_id | string | true | ID do projeto |
| text | string | true | Texto para síntese |
| voice_id | string | true | ID da voz (padrão ou clonada) |
| speed | number | false | Velocidade (0.5-2.0) |
| emotion | string | false | Emoção: 'neutral', 'happy', 'serious' |

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| audio_url | string | URL do áudio gerado |
| duration | number | Duração em segundos |
| waveform_data | array | Dados para visualização de waveform |

### 4.4 Unified Render Pipeline API

**Iniciar renderização completa**
```
POST /api/v1/render/start-unified
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| project_id | string | true | ID do projeto |
| quality | enum | true | Qualidade: 'draft', 'standard', 'high', '4k' |
| format | enum | true | Formato: 'mp4', 'webm', 'mov' |
| include_subtitles | boolean | false | Incluir legendas automáticas |
| watermark | boolean | false | Incluir watermark (usuários básicos) |

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| render_job_id | string | ID único do job de renderização |
| queue_position | number | Posição na fila |
| estimated_completion | string | Timestamp estimado de conclusão |

## 5. Server Architecture Diagram

```mermaid
graph TD
    A[Client / Frontend] --> B[API Gateway Layer]
    B --> C[Authentication Middleware]
    C --> D[Request Validation Layer]
    D --> E[Business Logic Controllers]
    
    E --> F[PPTX Service Layer]
    E --> G[Avatar Service Layer]
    E --> H[TTS Service Layer]
    E --> I[Render Service Layer]
    E --> J[Analytics Service Layer]
    
    F --> K[Queue Management Layer]
    G --> K
    H --> K
    I --> K
    
    K --> L[Background Workers]
    L --> M[External API Integrations]
    L --> N[File Processing Workers]
    L --> O[Render Pipeline Workers]
    
    E --> P[Data Access Layer]
    P --> Q[(PostgreSQL Database)]
    P --> R[(Redis Cache)]
    
    L --> S[Storage Layer]
    S --> T[AWS S3 Bucket]
    T --> U[CloudFront CDN]
    
    subgraph "API Layer"
        B
        C
        D
    end
    
    subgraph "Business Layer"
        E
        F
        G
        H
        I
        J
    end
    
    subgraph "Processing Layer"
        K
        L
        M
        N
        O
    end
    
    subgraph "Data Layer"
        P
        Q
        R
    end
    
    subgraph "Storage Layer"
        S
        T
        U
    end
```

## 6. Data Model

### 6.1 Data Model Definition

```mermaid
erDiagram
    USER ||--o{ PROJECT : creates
    PROJECT ||--o{ SLIDE : contains
    PROJECT ||--o{ RENDER_JOB : generates
    PROJECT ||--o{ ANALYTICS_EVENT : tracks
    
    SLIDE ||--o{ SLIDE_ELEMENT : contains
    SLIDE ||--o{ AUDIO_TRACK : has
    
    RENDER_JOB ||--o{ RENDER_ASSET : produces
    
    AVATAR_3D ||--o{ AVATAR_RENDER : used_in
    VOICE_PROFILE ||--o{ AUDIO_TRACK : generates
    
    USER {
        uuid id PK
        string email UK
        string name
        enum plan
        jsonb preferences
        timestamp created_at
        timestamp updated_at
    }
    
    PROJECT {
        uuid id PK
        uuid user_id FK
        string name
        enum type
        enum status
        jsonb config
        jsonb timeline_data
        timestamp created_at
        timestamp updated_at
    }
    
    SLIDE {
        uuid id PK
        uuid project_id FK
        integer order_index
        string title
        text content
        jsonb layout_config
        jsonb elements
        timestamp created_at
    }
    
    SLIDE_ELEMENT {
        uuid id PK
        uuid slide_id FK
        enum type
        jsonb properties
        jsonb position
        integer z_index
    }
    
    AUDIO_TRACK {
        uuid id PK
        uuid slide_id FK
        uuid voice_profile_id FK
        string audio_url
        float duration
        jsonb waveform_data
        timestamp created_at
    }
    
    AVATAR_3D {
        uuid id PK
        string name
        string model_url
        string thumbnail_url
        jsonb config
        enum category
        boolean is_premium
    }
    
    VOICE_PROFILE {
        uuid id PK
        uuid user_id FK
        string name
        string provider
        string voice_id
        jsonb settings
        boolean is_custom
    }
    
    RENDER_JOB {
        uuid id PK
        uuid project_id FK
        enum status
        enum quality
        enum format
        jsonb config
        string output_url
        float progress
        timestamp started_at
        timestamp completed_at
    }
    
    RENDER_ASSET {
        uuid id PK
        uuid render_job_id FK
        enum type
        string url
        integer file_size
        jsonb metadata
    }
    
    ANALYTICS_EVENT {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        string event_type
        jsonb event_data
        timestamp created_at
    }
```

### 6.2 Data Definition Language

**Tabela de Usuários**
```sql
-- Criar tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    plan VARCHAR(20) DEFAULT 'basic' CHECK (plan IN ('basic', 'premium', 'enterprise')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan ON users(plan);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

**Tabela de Projetos Integrados**
```sql
-- Criar tabela de projetos
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('pptx_import', 'from_scratch', 'template')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'ready', 'rendering', 'completed')),
    config JSONB DEFAULT '{}',
    timeline_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para queries otimizadas
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

**Tabela de Jobs de Renderização**
```sql
-- Criar tabela de jobs de renderização
CREATE TABLE render_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    quality VARCHAR(20) NOT NULL CHECK (quality IN ('draft', 'standard', 'high', '4k')),
    format VARCHAR(10) NOT NULL CHECK (format IN ('mp4', 'webm', 'mov')),
    config JSONB DEFAULT '{}',
    output_url VARCHAR(500),
    progress FLOAT DEFAULT 0.0 CHECK (progress >= 0.0 AND progress <= 100.0),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para monitoramento de fila
CREATE INDEX idx_render_jobs_status ON render_jobs(status);
CREATE INDEX idx_render_jobs_project_id ON render_jobs(project_id);
CREATE INDEX idx_render_jobs_created_at ON render_jobs(created_at DESC);
```

**Dados Iniciais**
```sql
-- Inserir avatares 3D padrão
INSERT INTO avatar_3d (name, model_url, thumbnail_url, config, category, is_premium) VALUES
('Avatar Executivo Masculino', '/assets/avatars/executive-male.glb', '/assets/thumbnails/executive-male.jpg', '{"style": "professional", "animations": ["idle", "talking", "gesturing"]}', 'executive', false),
('Avatar Educadora Feminina', '/assets/avatars/teacher-female.glb', '/assets/thumbnails/teacher-female.jpg', '{"style": "friendly", "animations": ["idle", "talking", "pointing"]}', 'education', false),
('Avatar Técnico Industrial', '/assets/avatars/technician-male.glb', '/assets/thumbnails/technician-male.jpg', '{"style": "industrial", "animations": ["idle", "talking", "demonstrating"]}', 'technical', true);

-- Inserir vozes padrão
INSERT INTO voice_profiles (name, provider, voice_id, settings, is_custom) VALUES
('Voz Masculina Profissional', 'elevenlabs', 'voice_001', '{"language": "pt-BR", "gender": "male", "age": "adult"}', false),
('Voz Feminina Educativa', 'elevenlabs', 'voice_002', '{"language": "pt-BR", "gender": "female", "age": "adult"}', false),
('Voz Técnica Industrial', 'azure', 'pt-BR-AntonioNeural', '{"language": "pt-BR", "gender": "male", "style": "technical"}', false);
```