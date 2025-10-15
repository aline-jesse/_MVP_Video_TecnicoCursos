# Arquitetura Técnica - Estúdio IA Vídeos v7 - Documento de Implementação

## 1. Arquitetura Geral do Sistema

```mermaid
graph TD
    A[Cliente Web Browser] --> B[Next.js 14 Frontend]
    B --> C[API Gateway / Next.js API Routes]
    C --> D[Supabase Backend Services]
    C --> E[Redis Cache Layer]
    C --> F[External AI Services]
    
    subgraph "Frontend Layer"
        B
        G[React Components]
        H[Zustand State Management]
        I[TailwindCSS Styling]
    end
    
    subgraph "Backend Services"
        D
        J[PostgreSQL Database]
        K[Supabase Auth]
        L[Supabase Storage]
        M[Real-time Subscriptions]
    end
    
    subgraph "Processing Layer"
        E
        N[Queue Management]
        O[Background Jobs]
        P[File Processing]
    end
    
    subgraph "External APIs"
        F
        Q[ElevenLabs TTS]
        R[Ready Player Me]
        S[Azure Speech Services]
        T[FFmpeg Processing]
    end
    
    B --> G
    B --> H
    B --> I
    D --> J
    D --> K
    D --> L
    D --> M
    C --> N
    C --> O
    C --> P
    F --> Q
    F --> R
    F --> S
    F --> T
```

## 2. Stack Tecnológico Detalhado

### 2.1 Frontend Technologies

**Core Framework**:
- **Next.js 14**: App Router, Server Components, Streaming
- **React 18**: Concurrent features, Suspense, Error Boundaries
- **TypeScript 5**: Strict typing, advanced type features

**Styling & UI**:
- **TailwindCSS 3**: Utility-first CSS framework
- **Headless UI**: Accessible component primitives
- **Framer Motion**: Advanced animations and transitions
- **Lucide React**: Modern icon library

**State Management**:
- **Zustand**: Lightweight state management
- **React Query (TanStack Query)**: Server state management
- **React Hook Form**: Form state and validation

**Development Tools**:
- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality control

### 2.2 Backend Technologies

**Database & Backend Services**:
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL 15**: Primary database with advanced features
- **Prisma ORM**: Type-safe database client
- **Redis**: Caching and session management

**Authentication & Security**:
- **NextAuth.js**: Authentication framework
- **Supabase Auth**: User management and JWT tokens
- **bcryptjs**: Password hashing
- **jose**: JWT handling

**File Processing**:
- **Multer**: File upload handling
- **Sharp**: Image processing and optimization
- **FFmpeg**: Video/audio processing
- **pdf-parse**: PDF content extraction

### 2.3 External Services Integration

**AI & TTS Services**:
- **ElevenLabs API**: Premium text-to-speech
- **Azure Speech Services**: Multi-language TTS
- **OpenAI API**: Content generation and enhancement

**3D Avatar Services**:
- **Ready Player Me**: 3D avatar creation and management
- **Three.js**: 3D rendering in browser
- **React Three Fiber**: React renderer for Three.js

**Media Processing**:
- **Remotion**: Programmatic video creation
- **Canvas API**: 2D graphics rendering
- **WebGL**: Hardware-accelerated graphics

## 3. Definições de Rotas Frontend

| Rota | Propósito | Componentes Principais |
|------|-----------|------------------------|
| `/` | Landing page pública | Hero, Features, Pricing, Testimonials |
| `/dashboard` | Dashboard principal do usuário | ProjectGrid, StatsCards, QuickActions |
| `/login` | Página de autenticação | LoginForm, SocialAuth, ForgotPassword |
| `/register` | Registro de novos usuários | RegisterForm, PlanSelection, EmailVerification |
| `/projects` | Lista de projetos do usuário | ProjectList, Filters, SearchBar, Pagination |
| `/projects/[id]` | Editor de projeto específico | Timeline, AvatarSelector, VoiceConfig, Preview |
| `/projects/[id]/render` | Configuração de renderização | RenderSettings, QualitySelector, ExportOptions |
| `/avatars` | Biblioteca de avatares | AvatarGrid, CategoryFilter, CustomizationPanel |
| `/avatars/create` | Criação de avatar personalizado | ReadyPlayerMeIntegration, AvatarPreview |
| `/templates` | Biblioteca de templates | TemplateGrid, PreviewModal, CategoryTabs |
| `/analytics` | Dashboard de analytics | Charts, Metrics, Reports, Filters |
| `/settings` | Configurações do usuário | ProfileSettings, BillingInfo, Preferences |
| `/settings/organization` | Configurações organizacionais | TeamManagement, RoleAssignment, Billing |
| `/admin` | Painel administrativo | UserManagement, SystemMetrics, ContentModeration |
| `/admin/system` | Configurações do sistema | APIKeys, SystemHealth, DatabaseStats |

## 4. Definições de APIs Backend

### 4.1 APIs de Autenticação

**Registro de Usuário**
```
POST /api/auth/register
```

Request:
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| email | string | true | Email do usuário |
| password | string | true | Senha (mínimo 8 caracteres) |
| name | string | true | Nome completo |
| plan | string | false | Plano inicial (free/premium) |

Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João Silva",
    "plan": "free",
    "emailVerified": false
  },
  "token": "jwt_token"
}
```

**Login de Usuário**
```
POST /api/auth/login
```

Request:
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| email | string | true | Email do usuário |
| password | string | true | Senha do usuário |
| remember | boolean | false | Manter logado |

Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João Silva",
    "plan": "premium",
    "lastLogin": "2024-01-15T10:30:00Z"
  },
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### 4.2 APIs de Projetos

**Criar Projeto**
```
POST /api/projects
```

Request:
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| name | string | true | Nome do projeto |
| description | string | false | Descrição do projeto |
| type | string | true | Tipo (presentation/course/tutorial) |
| settings | object | false | Configurações iniciais |

Response:
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "name": "Meu Curso de IA",
    "description": "Curso introdutório sobre IA",
    "type": "course",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z",
    "settings": {
      "width": 1920,
      "height": 1080,
      "fps": 30,
      "quality": "high"
    }
  }
}
```

**Listar Projetos**
```
GET /api/projects
```

Query Parameters:
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| page | number | Página (padrão: 1) |
| limit | number | Itens por página (padrão: 10) |
| status | string | Filtrar por status |
| type | string | Filtrar por tipo |
| search | string | Buscar por nome/descrição |

### 4.3 APIs de Upload e Processamento

**Upload de PPTX**
```
POST /api/pptx/upload
```

Request (multipart/form-data):
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| file | File | true | Arquivo PPTX (max 50MB) |
| projectId | string | true | ID do projeto |
| extractText | boolean | false | Extrair texto automaticamente |
| extractImages | boolean | false | Extrair imagens |

Response:
```json
{
  "success": true,
  "upload": {
    "id": "uuid",
    "filename": "apresentacao.pptx",
    "size": 2048576,
    "projectId": "uuid",
    "status": "processing",
    "extractedData": {
      "slideCount": 15,
      "textBlocks": 45,
      "imageCount": 8,
      "estimatedDuration": 900
    }
  }
}
```

**Status do Processamento**
```
GET /api/pptx/status/[uploadId]
```

Response:
```json
{
  "success": true,
  "status": "completed",
  "progress": 100,
  "result": {
    "slides": [
      {
        "id": 1,
        "title": "Introdução à IA",
        "content": "Texto extraído do slide...",
        "images": ["image1.jpg"],
        "duration": 60,
        "speakerNotes": "Notas do apresentador..."
      }
    ],
    "metadata": {
      "totalDuration": 900,
      "wordCount": 1250,
      "complexity": "medium"
    }
  }
}
```

### 4.4 APIs de Avatares

**Listar Avatares**
```
GET /api/avatars
```

Query Parameters:
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| category | string | Categoria (business/casual/formal) |
| gender | string | Gênero (male/female/other) |
| style | string | Estilo (realistic/cartoon) |
| page | number | Página |
| limit | number | Itens por página |

Response:
```json
{
  "success": true,
  "avatars": [
    {
      "id": "uuid",
      "name": "Alex Business",
      "readyPlayerMeUrl": "https://models.readyplayer.me/...",
      "thumbnailUrl": "https://storage.../thumbnail.jpg",
      "category": "business",
      "gender": "male",
      "style": "realistic",
      "isPremium": false,
      "animations": ["idle", "talking", "gesturing"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

**Criar Avatar Personalizado**
```
POST /api/avatars
```

Request:
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| name | string | true | Nome do avatar |
| readyPlayerMeUrl | string | true | URL do Ready Player Me |
| category | string | true | Categoria |
| isPrivate | boolean | false | Avatar privado |

### 4.5 APIs de Text-to-Speech

**Gerar Áudio TTS**
```
POST /api/tts/generate
```

Request:
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| text | string | true | Texto para conversão |
| voiceId | string | true | ID da voz |
| provider | string | true | Provedor (elevenlabs/azure) |
| settings | object | false | Configurações de voz |

Response:
```json
{
  "success": true,
  "audio": {
    "id": "uuid",
    "url": "https://storage.../audio.mp3",
    "duration": 45.2,
    "size": 1024576,
    "format": "mp3",
    "sampleRate": 44100,
    "bitrate": 128
  },
  "metadata": {
    "characterCount": 250,
    "wordCount": 45,
    "provider": "elevenlabs",
    "voiceId": "voice_123",
    "processingTime": 2.1
  }
}
```

**Listar Vozes Disponíveis**
```
GET /api/tts/voices
```

Query Parameters:
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| provider | string | Provedor específico |
| language | string | Idioma (pt-BR, en-US) |
| gender | string | Gênero da voz |

### 4.6 APIs de Renderização

**Iniciar Renderização**
```
POST /api/render
```

Request:
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| projectId | string | true | ID do projeto |
| settings | object | true | Configurações de renderização |

Settings Object:
```json
{
  "resolution": "1080p",
  "fps": 30,
  "quality": "high",
  "format": "mp4",
  "audioBitrate": 128,
  "videoBitrate": 5000,
  "watermark": false,
  "subtitles": true
}
```

Response:
```json
{
  "success": true,
  "renderJob": {
    "id": "uuid",
    "projectId": "uuid",
    "status": "queued",
    "priority": "normal",
    "estimatedDuration": 300,
    "settings": { /* configurações */ },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Status da Renderização**
```
GET /api/render/status/[jobId]
```

Response:
```json
{
  "success": true,
  "job": {
    "id": "uuid",
    "status": "processing",
    "progress": 65,
    "currentStep": "Rendering video with avatar",
    "estimatedTimeRemaining": 120,
    "startedAt": "2024-01-15T10:30:00Z",
    "logs": [
      {
        "timestamp": "2024-01-15T10:31:00Z",
        "level": "info",
        "message": "Started avatar rendering"
      }
    ]
  }
}
```

### 4.7 APIs de Analytics

**Registrar Evento**
```
POST /api/analytics/events
```

Request:
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| event | string | true | Nome do evento |
| properties | object | false | Propriedades do evento |
| userId | string | false | ID do usuário |
| sessionId | string | false | ID da sessão |

**Obter Métricas**
```
GET /api/analytics/metrics
```

Query Parameters:
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| startDate | string | Data inicial (ISO 8601) |
| endDate | string | Data final (ISO 8601) |
| metric | string | Métrica específica |
| groupBy | string | Agrupar por (day/week/month) |

## 5. Arquitetura de Componentes Frontend

### 5.1 Estrutura de Componentes

```
src/
├── components/
│   ├── ui/                    # Componentes base reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── layout/                # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── dashboard/             # Componentes do dashboard
│   │   ├── StatsCards.tsx
│   │   ├── ProjectGrid.tsx
│   │   ├── RecentActivity.tsx
│   │   └── QuickActions.tsx
│   ├── editor/                # Componentes do editor
│   │   ├── Timeline.tsx
│   │   ├── AvatarSelector.tsx
│   │   ├── VoiceConfig.tsx
│   │   ├── SlideEditor.tsx
│   │   └── PreviewPlayer.tsx
│   ├── avatars/               # Componentes de avatares
│   │   ├── AvatarGrid.tsx
│   │   ├── AvatarCard.tsx
│   │   ├── AvatarPreview.tsx
│   │   └── CustomizationPanel.tsx
│   └── analytics/             # Componentes de analytics
│       ├── MetricsChart.tsx
│       ├── ReportsTable.tsx
│       └── FilterPanel.tsx
```

### 5.2 Gerenciamento de Estado com Zustand

**Store Principal**:
```typescript
interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  
  // Project state
  currentProject: Project | null
  projects: Project[]
  
  // Editor state
  timeline: TimelineElement[]
  selectedAvatar: Avatar | null
  voiceSettings: VoiceConfig
  
  // UI state
  isLoading: boolean
  notifications: Notification[]
  modals: ModalState
  
  // Actions
  setUser: (user: User | null) => void
  setCurrentProject: (project: Project) => void
  updateTimeline: (elements: TimelineElement[]) => void
  addNotification: (notification: Notification) => void
}
```

**Store de Editor**:
```typescript
interface EditorState {
  // Timeline state
  timelineElements: TimelineElement[]
  currentTime: number
  duration: number
  isPlaying: boolean
  
  // Selection state
  selectedElements: string[]
  clipboard: TimelineElement[]
  
  // History state
  history: EditorHistory[]
  historyIndex: number
  
  // Actions
  addElement: (element: TimelineElement) => void
  removeElement: (id: string) => void
  updateElement: (id: string, updates: Partial<TimelineElement>) => void
  undo: () => void
  redo: () => void
  play: () => void
  pause: () => void
  seek: (time: number) => void
}
```

### 5.3 Integração com APIs

**React Query Configuration**:
```typescript
// hooks/useProjects.ts
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to fetch projects')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      })
      if (!response.ok) throw new Error('Failed to create project')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
```

## 6. Modelo de Dados Detalhado

### 6.1 Schema do Banco de Dados

```sql
-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    organization_id UUID REFERENCES organizations(id),
    usage_stats JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Tabela de Organizações
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    plan VARCHAR(20) DEFAULT 'team' CHECK (plan IN ('team', 'enterprise')),
    settings JSONB DEFAULT '{}',
    billing_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Projetos
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('presentation', 'course', 'tutorial', 'demo')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'error')),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    
    -- Configurações do projeto
    settings JSONB DEFAULT '{
        "width": 1920,
        "height": 1080,
        "fps": 30,
        "quality": "high",
        "format": "mp4"
    }',
    
    -- Dados do PPTX processado
    pptx_data JSONB,
    
    -- Configurações de vídeo
    video_settings JSONB DEFAULT '{}',
    
    -- Configurações de áudio/TTS
    audio_settings JSONB DEFAULT '{}',
    
    -- Métricas do projeto
    metrics JSONB DEFAULT '{
        "views": 0,
        "render_count": 0,
        "total_duration": 0
    }',
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'organization', 'public')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Slides
CREATE TABLE slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    slide_number INTEGER NOT NULL,
    title VARCHAR(500),
    content TEXT,
    speaker_notes TEXT,
    
    -- Dados visuais
    background_data JSONB,
    layout_data JSONB,
    elements JSONB DEFAULT '[]',
    
    -- Configurações de animação
    animations JSONB DEFAULT '[]',
    transitions JSONB DEFAULT '{}',
    
    -- Dados de áudio
    audio_url TEXT,
    audio_duration DECIMAL(10,2),
    tts_settings JSONB,
    
    -- Configurações de timing
    duration DECIMAL(10,2) DEFAULT 5.0,
    start_time DECIMAL(10,2) DEFAULT 0.0,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, slide_number)
);

-- Tabela de Avatares
CREATE TABLE avatars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    ready_player_me_url TEXT NOT NULL,
    thumbnail_url TEXT,
    
    -- Classificação
    category VARCHAR(50) NOT NULL CHECK (category IN ('business', 'casual', 'formal', 'creative')),
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    style VARCHAR(20) CHECK (style IN ('realistic', 'cartoon', 'anime')),
    
    -- Configurações
    avatar_type VARCHAR(20) DEFAULT 'half_body' CHECK (avatar_type IN ('full_body', 'half_body', 'head_only')),
    animations JSONB DEFAULT '["idle", "talking", "gesturing"]',
    
    -- Propriedades customizáveis
    custom_properties JSONB DEFAULT '{}',
    
    -- Controle de acesso
    is_premium BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    owner_id UUID REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Perfis de Voz
CREATE TABLE voice_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('elevenlabs', 'azure', 'google')),
    voice_id VARCHAR(100) NOT NULL,
    
    -- Características da voz
    language VARCHAR(10) NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    age_range VARCHAR(20) CHECK (age_range IN ('child', 'young_adult', 'adult', 'senior')),
    accent VARCHAR(50),
    
    -- Configurações padrão
    default_settings JSONB DEFAULT '{
        "speed": 1.0,
        "pitch": 0,
        "volume": 1.0,
        "stability": 0.5,
        "similarity_boost": 0.5
    }',
    
    -- Metadados
    description TEXT,
    sample_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(provider, voice_id)
);

-- Tabela de Jobs de Renderização
CREATE TABLE render_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Configurações de renderização
    settings JSONB NOT NULL,
    
    -- Status e progresso
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    current_step VARCHAR(200),
    
    -- Prioridade
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- em segundos
    
    -- Resultado
    output_url TEXT,
    output_size BIGINT,
    output_duration DECIMAL(10,2),
    
    -- Logs e erros
    logs JSONB DEFAULT '[]',
    error_message TEXT,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Analytics
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100),
    project_id UUID REFERENCES projects(id),
    
    -- Propriedades do evento
    properties JSONB DEFAULT '{}',
    
    -- Contexto
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    page_url TEXT,
    
    -- Timing
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadados
    metadata JSONB DEFAULT '{}'
);

-- Tabela de Métricas do Sistema
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
    
    -- Dimensões
    dimensions JSONB DEFAULT '{}',
    
    -- Timing
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadados
    metadata JSONB DEFAULT '{}'
);
```

### 6.2 Índices para Performance

```sql
-- Índices para tabela users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Índices para tabela projects
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- Índices para tabela slides
CREATE INDEX idx_slides_project_id ON slides(project_id);
CREATE INDEX idx_slides_slide_number ON slides(project_id, slide_number);

-- Índices para tabela avatars
CREATE INDEX idx_avatars_category ON avatars(category);
CREATE INDEX idx_avatars_gender ON avatars(gender);
CREATE INDEX idx_avatars_style ON avatars(style);
CREATE INDEX idx_avatars_is_public ON avatars(is_public);
CREATE INDEX idx_avatars_owner_id ON avatars(owner_id);

-- Índices para tabela voice_profiles
CREATE INDEX idx_voice_profiles_provider ON voice_profiles(provider);
CREATE INDEX idx_voice_profiles_language ON voice_profiles(language);
CREATE INDEX idx_voice_profiles_gender ON voice_profiles(gender);
CREATE INDEX idx_voice_profiles_is_active ON voice_profiles(is_active);

-- Índices para tabela render_jobs
CREATE INDEX idx_render_jobs_project_id ON render_jobs(project_id);
CREATE INDEX idx_render_jobs_user_id ON render_jobs(user_id);
CREATE INDEX idx_render_jobs_status ON render_jobs(status);
CREATE INDEX idx_render_jobs_priority ON render_jobs(priority);
CREATE INDEX idx_render_jobs_created_at ON render_jobs(created_at DESC);

-- Índices para tabela analytics_events
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_project_id ON analytics_events(project_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);

-- Índices para tabela system_metrics
CREATE INDEX idx_system_metrics_metric_name ON system_metrics(metric_name);
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp DESC);
```

### 6.3 Permissões de Acesso (RLS - Row Level Security)

```sql
-- Habilitar RLS nas tabelas principais
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela projects
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can view organization projects" ON projects
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (owner_id = auth.uid());

-- Políticas para tabela slides
CREATE POLICY "Users can access slides of their projects" ON slides
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
        )
    );

-- Políticas para tabela render_jobs
CREATE POLICY "Users can access their own render jobs" ON render_jobs
    FOR ALL USING (user_id = auth.uid());

-- Políticas para tabela analytics_events
CREATE POLICY "Users can access their own analytics" ON analytics_events
    FOR SELECT USING (user_id = auth.uid());

-- Permissões para roles anônimos e autenticados
GRANT SELECT ON avatars TO anon, authenticated;
GRANT SELECT ON voice_profiles TO anon, authenticated;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON slides TO authenticated;
GRANT ALL ON render_jobs TO authenticated;
GRANT INSERT ON analytics_events TO authenticated;
```

## 7. Configurações de Deployment

### 7.1 Docker Configuration

**Dockerfile**:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./temp:/app/temp

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

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
  redis_data:
```

### 7.2 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/estudio_ia_videos"
DIRECT_URL="postgresql://user:password@localhost:5432/estudio_ia_videos"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Redis
REDIS_URL="redis://localhost:6379"

# External APIs
ELEVENLABS_API_KEY="your-elevenlabs-key"
AZURE_SPEECH_KEY="your-azure-speech-key"
AZURE_SPEECH_REGION="your-region"
OPENAI_API_KEY="your-openai-key"

# File Storage
UPLOAD_MAX_SIZE="52428800" # 50MB
TEMP_DIR="/tmp/estudio-ia"
STORAGE_BUCKET="estudio-ia-storage"

# Rendering
RENDER_QUEUE_CONCURRENCY="3"
RENDER_TIMEOUT="1800" # 30 minutes
FFMPEG_PATH="/usr/bin/ffmpeg"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="info"
ENABLE_ANALYTICS="true"

# Feature Flags
ENABLE_PREMIUM_FEATURES="true"
ENABLE_ORGANIZATION_FEATURES="true"
ENABLE_BETA_FEATURES="false"
```

### 7.3 CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Generate Prisma client
        run: npx prisma generate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run tests
        run: yarn test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
      
      - name: Run E2E tests
        run: yarn test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
      
      - name: Build application
        run: yarn build
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to production
        uses: your-deployment-action@v1
        with:
          api-key: ${{ secrets.DEPLOYMENT_API_KEY }}
          environment: production
```

## 8. Monitoramento e Observabilidade

### 8.1 Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    storage: await checkStorage(),
    externalAPIs: await checkExternalAPIs(),
  }
  
  const isHealthy = Object.values(checks).every(check => check.status === 'ok')
  
  return Response.json({
    status: isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    checks,
  }, {
    status: isHealthy ? 200 : 503
  })
}
```

### 8.2 Logging Structure

```typescript
interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  service: string
  userId?: string
  projectId?: string
  requestId?: string
  metadata?: Record<string, any>
}
```

### 8.3 Performance Monitoring

```typescript
// lib/monitoring.ts
export const trackPerformance = (operation: string, duration: number, metadata?: any) => {
  // Send to monitoring service
  analytics.track('performance_metric', {
    operation,
    duration,
    timestamp: Date.now(),
    ...metadata
  })
}

export const trackError = (error: Error, context?: any) => {
  // Send to error tracking service
  Sentry.captureException(error, {
    tags: {
      service: 'estudio-ia-videos',
      environment: process.env.NODE_ENV,
    },
    extra: context,
  })
}
```

## 9. Considerações de Segurança

### 9.1 Autenticação e Autorização

- **JWT Tokens**: Tokens seguros com expiração adequada
- **Refresh Tokens**: Rotação automática de tokens
- **Rate Limiting**: Proteção contra ataques de força bruta
- **CORS**: Configuração restritiva de origens permitidas

### 9.2 Proteção de Dados

- **Criptografia**: TLS 1.3 para dados em trânsito
- **Hashing**: bcrypt para senhas com salt adequado
- **Sanitização**: Validação e sanitização de inputs
- **SQL Injection**: Uso de prepared statements via Prisma

### 9.3 Compliance

- **LGPD/GDPR**: Implementação de direitos dos usuários
- **Auditoria**: Logs de todas as ações sensíveis
- **Backup**: Estratégia de backup e recuperação
- **Retenção**: Políticas de retenção de dados

## 10. Próximos Passos de Implementação

### 10.1 Prioridade Alta (Próximas 2-3 semanas)

1. **Completar Sistema TTS**
   - Integração completa com ElevenLabs
   - Cache de áudio gerado
   - Interface de configuração de voz

2. **Timeline Editor Funcional**
   - Interface drag-and-drop
   - Preview em tempo real
   - Sincronização áudio/vídeo

3. **Sistema de Renderização 3D**
   - Integração Remotion + Three.js
   - Renderização de avatares
   - Fila de processamento

### 10.2 Prioridade Média (4-6 semanas)

1. **Sistema de Templates**
   - Biblioteca de templates
   - Aplicação automática
   - Customização avançada

2. **Analytics Avançados**
   - Dashboard detalhado
   - Relatórios customizados
   - Métricas de engajamento

3. **Otimizações de Performance**
   - Cache inteligente
   - Compressão de assets
   - Lazy loading avançado

### 10.3 Prioridade Baixa (7+ semanas)

1. **Funcionalidades Premium**
   - Avatares customizados
   - Qualidade 4K
   - Recursos colaborativos

2. **Integrações Externas**
   - APIs de terceiros
   - Webhooks
   - Marketplace de assets

3. **Mobile App**
   - React Native
   - Funcionalidades básicas
   - Sincronização com web

Esta arquitetura técnica fornece uma base sólida para a implementação completa do sistema, garantindo escalabilidade, performance e manutenibilidade do código.