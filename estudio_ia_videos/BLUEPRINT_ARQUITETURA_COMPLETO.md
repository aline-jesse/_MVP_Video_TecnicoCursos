
# 🏗️ BLUEPRINT DE ARQUITETURA
## Estúdio IA de Vídeos - Documentação Técnica Completa

**Versão:** 1.0  
**Data:** 04 de Outubro de 2025  
**Autor:** Equipe de Arquitetura - Estúdio IA  
**Status:** Production Ready

---

## 📑 ÍNDICE

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Arquitetura de Alto Nível](#2-arquitetura-de-alto-nível)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Data Architecture](#5-data-architecture)
6. [Integration Architecture](#6-integration-architecture)
7. [Infrastructure & DevOps](#7-infrastructure--devops)
8. [Security Architecture](#8-security-architecture)
9. [Performance & Scalability](#9-performance--scalability)
10. [Disaster Recovery & Business Continuity](#10-disaster-recovery--business-continuity)

---

## 1. VISÃO GERAL DA ARQUITETURA

### 1.1 Arquitetura Macro

```
┌────────────────────────────────────────────────────────────────────────────┐
│                            USUÁRIOS FINAIS                                 │
│  (Profissionais de RH, Consultores, Gestores de T&D)                      │
└───────────────────────────┬────────────────────────────────────────────────┘
                            │
                ┌───────────┴──────────┐
                │  CLOUDFLARE CDN      │  ← SSL/TLS, DDoS Protection
                └───────────┬──────────┘
                            │
┌───────────────────────────┴────────────────────────────────────────────────┐
│                         FRONTEND LAYER                                     │
│   Next.js 14 App (Vercel) + PWA + React 18 + TypeScript                  │
│   Componentes: 160+ | Páginas: 75+ | Estado: Zustand + Jotai             │
└───────────────────────────┬────────────────────────────────────────────────┘
                            │ HTTPS / WebSocket
┌───────────────────────────┴────────────────────────────────────────────────┐
│                         API LAYER (Backend)                                │
│   Next.js API Routes (Serverless) + tRPC (Type-Safe APIs)                │
│   APIs: 200+ | Autenticação: NextAuth.js                                 │
└─────┬──────────┬───────────┬──────────────┬──────────────┬────────────────┘
      │          │           │              │              │
      ▼          ▼           ▼              ▼              ▼
┌─────────┐  ┌────────┐  ┌────────┐  ┌──────────┐  ┌─────────────┐
│DATABASE │  │ STORAGE│  │  QUEUE │  │ TTS APIs │  │ 3D RENDERING│
│PostgreSQL│  │AWS S3  │  │ BullMQ │  │ElevenLabs│  │Blender API  │
│ Prisma  │  │CloudFront│ │ Redis  │  │Azure TTS │  │Three.js     │
│         │  │        │  │        │  │Google TTS│  │             │
└─────────┘  └────────┘  └────────┘  └──────────┘  └─────────────┘
      │          │           │              │              │
      └──────────┴───────────┴──────────────┴──────────────┘
                            │
                ┌───────────▼──────────┐
                │  VIDEO PIPELINE      │
                │  FFmpeg (Cloud)      │
                │  Lambda Workers      │
                │  GPU Acceleration    │
                └──────────────────────┘
```

### 1.2 Princípios Arquiteturais

#### **1. Serverless-First**
- Next.js API Routes → AWS Lambda
- Auto-scaling horizontal
- Pay-per-use (redução de custos)
- Zero maintenance de servidores

#### **2. Edge Computing**
- Cloudflare CDN para assets estáticos
- Vercel Edge Functions para SSR
- Latência reduzida (< 100ms global)

#### **3. Microservices (Leve)**
- Serviços especializados:
  - PPTX Processing Service
  - TTS Generation Service
  - Video Rendering Service
  - Avatar 3D Service
  - Analytics Service
- Comunicação via REST API + Queue

#### **4. Event-Driven**
- Queue system (BullMQ + Redis)
- Webhooks para integrações
- Real-time updates (WebSocket)

#### **5. Database-Per-Service**
- PostgreSQL: Dados principais (Prisma ORM)
- Redis: Cache + Queue
- S3: File storage
- Isolamento de dados

---

## 2. ARQUITETURA DE ALTO NÍVEL

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Dashboard  │  │   Editor    │  │  Templates  │  │  Analytics  │  │
│  │  Components │  │  Components │  │  Components │  │  Components │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         │                │                │                │          │
│         └────────────────┴────────────────┴────────────────┘          │
│                                 │                                      │
├─────────────────────────────────┴───────────────────────────────────────┤
│                      APPLICATION SERVICES LAYER                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ Project      │  │ User         │  │ Organization │                 │
│  │ Service      │  │ Service      │  │ Service      │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│         │                 │                 │                          │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐                 │
│  │ PPTX         │  │ TTS          │  │ Avatar 3D    │                 │
│  │ Processor    │  │ Generator    │  │ Renderer     │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│         │                 │                 │                          │
│  ┌──────┴────────────────┴─────────────────┴───────┐                  │
│  │         Video Rendering Service                  │                  │
│  │    (FFmpeg + GPU Acceleration + Queue)           │                  │
│  └──────────────────────────────────────────────────┘                  │
│                                 │                                      │
├─────────────────────────────────┴───────────────────────────────────────┤
│                         DATA ACCESS LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  Prisma ORM  │  │  Redis Cache │  │  S3 Client   │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│         │                 │                 │                          │
├─────────┴─────────────────┴─────────────────┴─────────────────────────┤
│                       INFRASTRUCTURE LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  PostgreSQL  │  │    Redis     │  │   AWS S3     │                 │
│  │   (RDS)      │  │   (Cache)    │  │ (CloudFront) │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Principal

**Fluxo: Criar Vídeo a partir de PPTX**

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  User    │         │ Frontend │         │ Backend  │         │   S3     │
└────┬─────┘         └─────┬────┘         └─────┬────┘         └─────┬────┘
     │                     │                    │                    │
     │ 1. Upload PPTX      │                    │                    │
     ├────────────────────>│                    │                    │
     │                     │ 2. POST /api/pptx/upload                │
     │                     ├───────────────────>│                    │
     │                     │                    │ 3. Upload to S3    │
     │                     │                    ├───────────────────>│
     │                     │                    │<───────────────────┤
     │                     │                    │ 4. S3 URL          │
     │                     │                    │                    │
     │                     │                    │ 5. Queue PPTX      │
     │                     │                    │    Processing      │
     │                     │                    ├───┐                │
     │                     │                    │   │ BullMQ (Redis) │
     │                     │                    │<──┘                │
     │                     │<───────────────────┤                    │
     │                     │ 6. Job Queued      │                    │
     │<────────────────────┤    Response        │                    │
     │                     │                    │                    │
     │                     │  [PROCESSING WORKER PICKS UP JOB]        │
     │                     │                    │                    │
     │                     │                    │ 7. Download PPTX   │
     │                     │                    ├───────────────────>│
     │                     │                    │<───────────────────┤
     │                     │                    │                    │
     │                     │                    │ 8. Extract Content │
     │                     │                    │    (JSZip, XML)    │
     │                     │                    ├───┐                │
     │                     │                    │   │                │
     │                     │                    │<──┘                │
     │                     │                    │                    │
     │                     │                    │ 9. Save to DB      │
     │                     │                    │    (Prisma)        │
     │                     │                    ├───┐                │
     │                     │                    │   │ PostgreSQL     │
     │                     │                    │<──┘                │
     │                     │                    │                    │
     │                     │                    │ 10. WebSocket      │
     │                     │<───────────────────┤     Update         │
     │<────────────────────┤                    │                    │
     │ 11. Redirect to     │                    │                    │
     │     Editor          │                    │                    │
     │                     │                    │                    │
```

**Fluxo: Renderizar Vídeo**

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  User    │         │ Frontend │         │ Backend  │         │ FFmpeg   │
└────┬─────┘         └─────┬────┘         └─────┬────┘         └─────┬────┘
     │                     │                    │                    │
     │ 1. Click "Render"   │                    │                    │
     ├────────────────────>│                    │                    │
     │                     │ 2. POST /api/render/start               │
     │                     ├───────────────────>│                    │
     │                     │                    │ 3. Validate Project│
     │                     │                    ├───┐                │
     │                     │                    │   │ Check DB       │
     │                     │                    │<──┘                │
     │                     │                    │                    │
     │                     │                    │ 4. Queue Render Job│
     │                     │                    ├───┐                │
     │                     │                    │   │ BullMQ (Redis) │
     │                     │                    │<──┘                │
     │                     │<───────────────────┤                    │
     │                     │ 5. Job Queued      │                    │
     │<────────────────────┤    {jobId: "abc"}  │                    │
     │                     │                    │                    │
     │                     │ [WORKER PICKS UP JOB]                   │
     │                     │                    │                    │
     │                     │                    │ 6. Load Project    │
     │                     │                    │    Data from DB    │
     │                     │                    ├───┐                │
     │                     │                    │   │ Prisma         │
     │                     │                    │<──┘                │
     │                     │                    │                    │
     │                     │                    │ 7. Render Video    │
     │                     │                    ├───────────────────>│
     │                     │                    │                    │
     │                     │                    │  [FFmpeg Processing│
     │                     │                    │   - Load scenes    │
     │                     │                    │   - Generate frames│
     │                     │                    │   - Encode H.264   │
     │                     │                    │   - Add audio]     │
     │                     │                    │                    │
     │                     │  [PROGRESS UPDATES VIA WEBSOCKET]        │
     │                     │                    │                    │
     │                     │<───────────────────┤ 8. Progress 25%    │
     │<────────────────────┤                    │                    │
     │                     │<───────────────────┤ 9. Progress 50%    │
     │<────────────────────┤                    │                    │
     │                     │<───────────────────┤ 10. Progress 75%   │
     │<────────────────────┤                    │                    │
     │                     │                    │<───────────────────┤
     │                     │                    │ 11. Video Rendered │
     │                     │                    │                    │
     │                     │                    │ 12. Upload to S3   │
     │                     │                    ├───┐                │
     │                     │                    │   │ AWS S3         │
     │                     │                    │<──┘                │
     │                     │                    │                    │
     │                     │                    │ 13. Update DB      │
     │                     │                    ├───┐                │
     │                     │                    │   │ Status=COMPLETED│
     │                     │                    │<──┘                │
     │                     │                    │                    │
     │                     │<───────────────────┤ 14. Completed      │
     │<────────────────────┤     + Download URL │                    │
     │                     │                    │                    │
     │                     │                    │ 15. Send Email     │
     │                     │                    │     Notification   │
     │                     │                    ├───┐                │
     │                     │                    │   │ Nodemailer     │
     │                     │                    │<──┘                │
     │                     │                    │                    │
```

---

## 3. FRONTEND ARCHITECTURE

### 3.1 Stack Tecnológico Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                   FRAMEWORK & CORE                          │
│  • Next.js 14.2.28 (App Router, Server Components)         │
│  • React 18.2.0 (Concurrent Features, Suspense)            │
│  • TypeScript 5.2.2 (Strict Mode)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     UI & STYLING                            │
│  • Tailwind CSS 3.3.3 (Utility-First)                      │
│  • shadcn/ui (Radix UI + Tailwind)                         │
│  • Framer Motion 12.23.22 (Animations)                     │
│  • Lucide Icons 0.446.0                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                STATE MANAGEMENT                             │
│  • Zustand 5.0.3 (Global State)                            │
│  • Jotai 2.6.0 (Atomic State)                              │
│  • TanStack Query 5.0.0 (Server State)                     │
│  • SWR 2.2.4 (Data Fetching)                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                CANVAS & 3D RENDERING                        │
│  • Fabric.js 5.3.0 (Canvas Manipulation)                   │
│  • Three.js 0.180.0 (3D Rendering)                         │
│  • React Three Fiber 9.3.0 (React + Three.js)              │
│  • GSAP 3.13.0 (Animations)                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                FORMS & VALIDATION                           │
│  • React Hook Form 7.53.0                                  │
│  • Zod 3.23.8 (Schema Validation)                          │
│  • Yup 1.3.0 (Alternative Validation)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PWA & OFFLINE                            │
│  • Service Worker (Custom)                                 │
│  • Workbox (Cache Strategies)                              │
│  • IDB 8.0.3 (IndexedDB Wrapper)                           │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Estrutura de Pastas Frontend

```
app/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth Layout Group
│   │   ├── login/
│   │   │   └── page.tsx             # Login Page
│   │   ├── signup/
│   │   │   └── page.tsx             # Signup Page
│   │   └── forgot-password/
│   │       └── page.tsx             # Password Recovery
│   │
│   ├── (dashboard)/                  # Dashboard Layout Group
│   │   ├── page.tsx                 # Main Dashboard
│   │   ├── projects/                # Project Management
│   │   │   ├── page.tsx             # Project List
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Project Detail
│   │   ├── templates/               # Template Library
│   │   │   └── page.tsx
│   │   └── analytics/               # Analytics Dashboard
│   │       └── page.tsx
│   │
│   ├── (editor)/                     # Editor Layout Group
│   │   └── editor/
│   │       └── [projectId]/
│   │           └── page.tsx         # Visual Editor
│   │
│   ├── api/                          # API Routes (Backend)
│   │   ├── auth/                    # NextAuth Endpoints
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts         # NextAuth Handler
│   │   │   └── signup/
│   │   │       └── route.ts
│   │   ├── projects/                # Project CRUD
│   │   │   ├── route.ts             # List, Create
│   │   │   └── [id]/
│   │   │       └── route.ts         # Get, Update, Delete
│   │   ├── pptx/                    # PPTX Processing
│   │   │   ├── upload/
│   │   │   │   └── route.ts
│   │   │   └── process/
│   │   │       └── route.ts
│   │   ├── tts/                     # Text-to-Speech
│   │   │   ├── generate/
│   │   │   │   └── route.ts
│   │   │   └── voices/
│   │   │       └── route.ts
│   │   ├── render/                  # Video Rendering
│   │   │   ├── start/
│   │   │   │   └── route.ts
│   │   │   └── status/
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   └── analytics/               # Analytics
│   │       └── dashboard/
│   │           └── route.ts
│   │
│   ├── globals.css                  # Global Styles
│   ├── layout.tsx                   # Root Layout
│   └── providers.tsx                # Context Providers
│
├── components/                       # React Components
│   ├── ui/                          # shadcn/ui Components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (40+ components)
│   ├── dashboard/                   # Dashboard Components
│   │   ├── project-card.tsx
│   │   ├── metrics-overview.tsx
│   │   └── recent-activity.tsx
│   ├── editor/                      # Editor Components
│   │   ├── canvas-editor.tsx
│   │   ├── timeline.tsx
│   │   ├── properties-panel.tsx
│   │   └── toolbar.tsx
│   ├── templates/                   # Template Components
│   │   ├── template-gallery.tsx
│   │   └── template-preview.tsx
│   └── shared/                      # Shared Components
│       ├── header.tsx
│       ├── footer.tsx
│       └── loading.tsx
│
├── lib/                             # Utility Libraries
│   ├── db/                          # Database
│   │   ├── index.ts                # Prisma Client Export
│   │   └── queries/                # Reusable Queries
│   ├── aws-config.ts                # AWS Configuration
│   ├── s3.ts                        # S3 Helper Functions
│   ├── tts-service.ts               # TTS Service
│   ├── pptx-processor.ts            # PPTX Processing
│   ├── video-renderer.ts            # Video Rendering
│   ├── fabric-singleton.ts          # Fabric.js Manager
│   ├── auth.ts                      # NextAuth Config
│   └── utils.ts                     # Generic Utils
│
├── hooks/                           # Custom React Hooks
│   ├── use-toast.ts                # Toast Notifications
│   ├── use-projects.ts             # Project Data Fetching
│   ├── use-editor.ts               # Editor State
│   └── use-analytics.ts            # Analytics Data
│
├── stores/                          # State Management
│   ├── editor-store.ts             # Zustand Store (Editor)
│   ├── user-store.ts               # User State
│   └── ui-store.ts                 # UI State (modals, etc.)
│
├── types/                           # TypeScript Types
│   ├── project.ts
│   ├── user.ts
│   ├── editor.ts
│   └── api.ts
│
└── public/                          # Static Assets
    ├── avatars/                    # Avatar 3D Models
    ├── templates/                  # Template Thumbnails
    ├── icons/                      # App Icons (PWA)
    └── manifest.json               # PWA Manifest
```

### 3.3 State Management Architecture

**Global State (Zustand):**
```typescript
// stores/editor-store.ts
import { create } from 'zustand'

interface EditorState {
  // Current Project
  currentProject: Project | null
  
  // Canvas State
  canvas: fabric.Canvas | null
  selectedElement: fabric.Object | null
  
  // Timeline State
  scenes: Scene[]
  currentSceneIndex: number
  
  // Actions
  setProject: (project: Project) => void
  addScene: (scene: Scene) => void
  updateScene: (id: string, updates: Partial<Scene>) => void
  deleteScene: (id: string) => void
  selectElement: (element: fabric.Object | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  currentProject: null,
  canvas: null,
  selectedElement: null,
  scenes: [],
  currentSceneIndex: 0,
  
  setProject: (project) => set({ currentProject: project }),
  addScene: (scene) => set((state) => ({
    scenes: [...state.scenes, scene]
  })),
  updateScene: (id, updates) => set((state) => ({
    scenes: state.scenes.map((s) => s.id === id ? { ...s, ...updates } : s)
  })),
  deleteScene: (id) => set((state) => ({
    scenes: state.scenes.filter((s) => s.id !== id)
  })),
  selectElement: (element) => set({ selectedElement: element })
}))
```

**Server State (TanStack Query):**
```typescript
// hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useProjects() {
  const queryClient = useQueryClient()
  
  // Query: List Projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects')
      return res.json()
    }
  })
  
  // Mutation: Create Project
  const createProject = useMutation({
    mutationFn: async (data: CreateProjectDto) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return res.json()
    },
    onSuccess: () => {
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
  
  // Mutation: Delete Project
  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
  
  return { projects, isLoading, createProject, deleteProject }
}
```

### 3.4 Component Architecture

**Atomic Design Pattern:**
```
Atoms (Smallest)
├── Button
├── Input
├── Label
└── Icon

Molecules (Combination of Atoms)
├── FormField (Label + Input)
├── SearchBar (Input + Icon)
└── ProjectCard (Image + Title + Button)

Organisms (Complex Components)
├── ProjectGrid (Multiple ProjectCards)
├── Timeline (Multiple Scenes + Controls)
└── CanvasEditor (Canvas + Toolbar + Properties)

Templates (Page Layouts)
├── DashboardLayout
├── EditorLayout
└── AuthLayout

Pages (Routes)
├── DashboardPage
├── EditorPage
└── LoginPage
```

**Example Component:**
```typescript
// components/dashboard/project-card.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreVertical, Play, Edit, Trash } from 'lucide-react'
import Image from 'next/image'

interface ProjectCardProps {
  project: Project
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onPlay: (id: string) => void
}

export function ProjectCard({ project, onEdit, onDelete, onPlay }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        <Image
          src={project.thumbnailUrl || '/placeholder.jpg'}
          alt={project.name}
          fill
          className="object-cover"
        />
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Badge variant={project.status === 'COMPLETED' ? 'success' : 'warning'}>
            {project.status}
          </Badge>
        </div>
      </div>
      
      {/* Content */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      {/* Footer */}
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{project.totalSlides} cenas</span>
          <span>{formatDuration(project.duration)}</span>
          <span>{project.views} views</span>
        </div>
        <Button className="w-full mt-4" onClick={() => onPlay(project.id)}>
          <Play className="mr-2 h-4 w-4" />
          Assistir
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## 4. BACKEND ARCHITECTURE

### 4.1 Stack Tecnológico Backend

```
┌─────────────────────────────────────────────────────────────┐
│                    RUNTIME & FRAMEWORK                      │
│  • Node.js 20.6.2                                           │
│  • Next.js 14.2.28 (API Routes)                            │
│  • TypeScript 5.2.2                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                           │
│  • NextAuth.js 4.24.11 (Sessions, OAuth)                   │
│  • bcryptjs 2.4.3 (Password Hashing)                       │
│  • jsonwebtoken 9.0.2 (JWT Tokens)                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                               │
│  • PostgreSQL 15 (Primary DB)                              │
│  • Prisma 6.7.0 (ORM)                                       │
│  • Redis 5.8.0 (Cache + Queue)                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FILE STORAGE                             │
│  • AWS S3 (Cloud Storage)                                   │
│  • @aws-sdk/client-s3 3.896.0                              │
│  • Sharp 0.34.4 (Image Processing)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    QUEUE SYSTEM                             │
│  • BullMQ 5.58.4 (Job Queue)                               │
│  • IORedis 5.8.0 (Redis Client)                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 TTS INTEGRATIONS                            │
│  • ElevenLabs 1.59.0 (Premium TTS)                          │
│  • microsoft-cognitiveservices-speech-sdk 1.46.0            │
│  • @google-cloud/text-to-speech 6.3.0                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 VIDEO PROCESSING                            │
│  • FFmpeg (libx264, libvpx-vp9, libx265)                   │
│  • fluent-ffmpeg 2.1.3 (Node.js Wrapper)                   │
│  • @ffmpeg/ffmpeg 0.12.15 (WASM - Client-side)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  MONITORING & LOGGING                       │
│  • Winston 3.17.0 (Logging)                                │
│  • Sentry 10.17.0 (Error Tracking)                         │
│  • Mixpanel (Analytics)                                    │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 API Routes Architecture

**RESTful API Design:**
```
/api/
├── auth/                            # Authentication
│   ├── [...nextauth]/
│   │   └── route.ts                # NextAuth Handler (GET, POST)
│   ├── signup/
│   │   └── route.ts                # POST /api/auth/signup
│   └── verify-email/
│       └── route.ts                # GET /api/auth/verify-email?token=...
│
├── projects/                        # Project Management
│   ├── route.ts                    # GET, POST /api/projects
│   ├── [id]/
│   │   ├── route.ts                # GET, PATCH, DELETE /api/projects/:id
│   │   └── duplicate/
│   │       └── route.ts            # POST /api/projects/:id/duplicate
│
├── pptx/                            # PPTX Processing
│   ├── upload/
│   │   └── route.ts                # POST /api/pptx/upload (multipart/form-data)
│   ├── process/
│   │   └── route.ts                # POST /api/pptx/process
│   └── status/
│       └── [jobId]/
│           └── route.ts            # GET /api/pptx/status/:jobId
│
├── tts/                             # Text-to-Speech
│   ├── generate/
│   │   └── route.ts                # POST /api/tts/generate
│   ├── voices/
│   │   └── route.ts                # GET /api/tts/voices?language=pt-BR
│   └── voice-cloning/
│       ├── create/
│       │   └── route.ts            # POST /api/tts/voice-cloning/create
│       └── status/
│           └── [id]/
│               └── route.ts        # GET /api/tts/voice-cloning/status/:id
│
├── avatars/                         # 3D Avatars
│   ├── route.ts                    # GET /api/avatars (list)
│   ├── [id]/
│   │   └── route.ts                # GET /api/avatars/:id
│   └── talking-photo/
│       ├── create/
│       │   └── route.ts            # POST /api/avatars/talking-photo/create
│       └── status/
│           └── [id]/
│               └── route.ts        # GET /api/avatars/talking-photo/status/:id
│
├── render/                          # Video Rendering
│   ├── start/
│   │   └── route.ts                # POST /api/render/start
│   ├── status/
│   │   └── [id]/
│   │       └── route.ts            # GET /api/render/status/:id
│   ├── cancel/
│   │   └── [id]/
│   │       └── route.ts            # POST /api/render/cancel/:id
│   └── download/
│       └── [id]/
│           └── route.ts            # GET /api/render/download/:id
│
├── analytics/                       # Analytics
│   ├── dashboard/
│   │   └── route.ts                # GET /api/analytics/dashboard
│   ├── track/
│   │   └── route.ts                # POST /api/analytics/track
│   └── reports/
│       └── route.ts                # GET /api/analytics/reports
│
├── templates/                       # NR Templates
│   ├── route.ts                    # GET /api/templates
│   └── [nr]/
│       └── route.ts                # GET /api/templates/:nr (ex: NR-10)
│
├── collaboration/                   # Collaboration Features
│   ├── comments/
│   │   ├── route.ts                # GET, POST /api/collaboration/comments
│   │   └── [id]/
│   │       └── route.ts            # PATCH, DELETE /api/collaboration/comments/:id
│   └── versions/
│       ├── route.ts                # GET, POST /api/collaboration/versions
│       └── [id]/
│           ├── route.ts            # GET /api/collaboration/versions/:id
│           └── restore/
│               └── route.ts        # POST /api/collaboration/versions/:id/restore
│
└── integrations/                    # External Integrations
    ├── lms/
    │   ├── scorm/
    │   │   └── export/
    │   │       └── route.ts        # POST /api/integrations/lms/scorm/export
    │   └── xapi/
    │       └── route.ts            # POST /api/integrations/lms/xapi
    └── webhooks/
        └── route.ts                # POST /api/integrations/webhooks
```

### 4.3 Exemplo de API Route

```typescript
// app/api/render/start/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { renderQueue } from '@/lib/render-queue'
import { z } from 'zod'

// Request Schema Validation
const startRenderSchema = z.object({
  projectId: z.string().cuid(),
  preset: z.enum(['youtube_hd', 'youtube_4k', 'instagram_feed', 'linkedin']),
  includeSubtitles: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate User
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // 2. Parse and Validate Request Body
    const body = await request.json()
    const validatedData = startRenderSchema.parse(body)
    
    // 3. Check if Project Exists and User Owns It
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
      include: { slides: true }
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // 4. Create Render Job in Database
    const renderJob = await prisma.videoExport.create({
      data: {
        projectId: project.id,
        userId: session.user.id,
        format: 'mp4',
        quality: validatedData.preset,
        status: 'pending',
        progress: 0
      }
    })
    
    // 5. Add Job to Render Queue (BullMQ)
    const job = await renderQueue.add('render-video', {
      renderJobId: renderJob.id,
      projectId: project.id,
      preset: validatedData.preset,
      includeSubtitles: validatedData.includeSubtitles,
      userId: session.user.id
    }, {
      priority: session.user.role === 'ADMIN' ? 10 : 5, // Priority queue
      attempts: 3, // Retry up to 3 times
      backoff: {
        type: 'exponential',
        delay: 5000 // 5s, 25s, 125s
      }
    })
    
    // 6. Return Job Information
    return NextResponse.json({
      success: true,
      jobId: renderJob.id,
      status: 'queued',
      estimatedTime: estimateRenderTime(project.duration)
    }, { status: 202 }) // 202 Accepted
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Render start error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper: Estimate Render Time
function estimateRenderTime(videoDuration: number): number {
  // Average: 2.3x real-time
  const renderTime = videoDuration * 2.3
  return Math.ceil(renderTime / 60) // Return in minutes
}
```

### 4.4 Service Layer Architecture

**Services são responsáveis pela lógica de negócio:**

```typescript
// lib/services/pptx-processor-service.ts
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'
import { prisma } from '@/lib/db'

export class PPTXProcessorService {
  private s3Client: S3Client
  private xmlParser: XMLParser
  
  constructor() {
    this.s3Client = new S3Client({})
    this.xmlParser = new XMLParser()
  }
  
  async processPPTX(s3Key: string, projectId: string): Promise<ProcessResult> {
    // 1. Download PPTX from S3
    const pptxBuffer = await this.downloadFromS3(s3Key)
    
    // 2. Unzip PPTX (it's a ZIP file)
    const zip = await JSZip.loadAsync(pptxBuffer)
    
    // 3. Extract Content
    const slides = await this.extractSlides(zip)
    const images = await this.extractImages(zip)
    
    // 4. Parse XML Structure
    const structure = await this.parseStructure(slides)
    
    // 5. Save to Database
    await this.saveToDatabase(projectId, structure, images)
    
    return {
      success: true,
      totalSlides: slides.length,
      totalImages: images.length
    }
  }
  
  private async downloadFromS3(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    })
    
    const response = await this.s3Client.send(command)
    const chunks: any[] = []
    
    for await (const chunk of response.Body as any) {
      chunks.push(chunk)
    }
    
    return Buffer.concat(chunks)
  }
  
  private async extractSlides(zip: JSZip): Promise<SlideData[]> {
    const slides: SlideData[] = []
    const slideFiles = Object.keys(zip.files).filter(
      (name) => name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    )
    
    for (const filename of slideFiles) {
      const xmlContent = await zip.file(filename)?.async('text')
      if (xmlContent) {
        const parsedXml = this.xmlParser.parse(xmlContent)
        slides.push({
          filename,
          content: parsedXml
        })
      }
    }
    
    return slides
  }
  
  private async extractImages(zip: JSZip): Promise<ImageData[]> {
    const images: ImageData[] = []
    const imageFiles = Object.keys(zip.files).filter(
      (name) => name.startsWith('ppt/media/') && 
                /\.(png|jpg|jpeg|gif)$/i.test(name)
    )
    
    for (const filename of imageFiles) {
      const imageBuffer = await zip.file(filename)?.async('nodebuffer')
      if (imageBuffer) {
        // Upload to S3
        const s3Url = await uploadToS3(imageBuffer, filename)
        images.push({
          filename,
          url: s3Url
        })
      }
    }
    
    return images
  }
  
  private async parseStructure(slides: SlideData[]): Promise<SceneStructure[]> {
    return slides.map((slide, index) => {
      // Extract text from slide XML
      const texts = this.extractTexts(slide.content)
      
      return {
        slideNumber: index + 1,
        title: texts.title || `Cena ${index + 1}`,
        content: texts.body || '',
        duration: 10, // Default 10 seconds
        transition: 'fade'
      }
    })
  }
  
  private extractTexts(xmlContent: any): { title?: string, body?: string } {
    // Parse XML structure to extract texts
    // Simplified logic (real implementation is more complex)
    try {
      const shapes = xmlContent['p:sld']['p:cSld']['p:spTree']['p:sp']
      const texts: string[] = []
      
      for (const shape of shapes) {
        const textBody = shape['p:txBody']
        if (textBody) {
          const paragraphs = textBody['a:p']
          for (const para of paragraphs) {
            if (para['a:r'] && para['a:r']['a:t']) {
              texts.push(para['a:r']['a:t'])
            }
          }
        }
      }
      
      return {
        title: texts[0],
        body: texts.slice(1).join('\n')
      }
    } catch (error) {
      console.error('Error extracting texts:', error)
      return {}
    }
  }
  
  private async saveToDatabase(
    projectId: string, 
    scenes: SceneStructure[], 
    images: ImageData[]
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Update project
      await tx.project.update({
        where: { id: projectId },
        data: {
          totalSlides: scenes.length,
          status: 'PROCESSING'
        }
      })
      
      // Create scenes
      for (const scene of scenes) {
        await tx.slide.create({
          data: {
            projectId,
            slideNumber: scene.slideNumber,
            title: scene.title,
            content: scene.content,
            duration: scene.duration,
            transition: scene.transition
          }
        })
      }
      
      // Update project status
      await tx.project.update({
        where: { id: projectId },
        data: { status: 'COMPLETED' }
      })
    })
  }
}

// Types
interface SlideData {
  filename: string
  content: any
}

interface ImageData {
  filename: string
  url: string
}

interface SceneStructure {
  slideNumber: number
  title: string
  content: string
  duration: number
  transition: string
}

interface ProcessResult {
  success: boolean
  totalSlides: number
  totalImages: number
}
```

---

## 5. DATA ARCHITECTURE

### 5.1 Database Schema (PostgreSQL + Prisma)

**Schema Overview:**
```
Users & Auth (6 tables)
├── User
├── Account
├── Session
├── VerificationToken
├── OrganizationMember
└── OrganizationSSO

Projects & Content (5 tables)
├── Project
├── Slide
├── Timeline
├── NRTemplate
└── NRComplianceRecord

Media & Assets (4 tables)
├── FileUpload
├── VideoExport
├── VoiceProfile
└── VoiceClone

Processing & Jobs (4 tables)
├── RenderJob
├── ProcessingQueue
├── AIGeneration
└── RenderBatch

Collaboration (3 tables)
├── ProjectComment
├── ProjectVersion
└── ReviewRequest

Analytics & Monitoring (4 tables)
├── Analytics
├── AnalyticsEvent
├── SystemMetrics
└── Alert

Enterprise (5 tables)
├── Organization
├── Subscription
├── WhiteLabelSettings
├── AuditLog
└── PushSubscription

Blockchain (2 tables)
├── BlockchainCertificate
└── Certificate

System (1 table)
└── SystemSettings
```

### 5.2 Entity Relationship Diagram (Simplified)

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │ 1:N
       ├───────────────┐
       │               │
       ▼               ▼
┌──────────────┐  ┌──────────────┐
│   Project    │  │Organization  │
└──────┬───────┘  │   Member     │
       │ 1:N      └──────────────┘
       ├───────────────┐
       │               │
       ▼               ▼
┌──────────────┐  ┌──────────────┐
│    Slide     │  │VideoExport   │
└──────────────┘  └──────────────┘
       │               │
       │ 1:1           │ 1:N
       ▼               ▼
┌──────────────┐  ┌──────────────┐
│   Timeline   │  │  RenderJob   │
└──────────────┘  └──────────────┘
```

### 5.3 Data Flow & Lifecycle

**Project Lifecycle:**
```
CREATED → PROCESSING → DRAFT → IN_PROGRESS → COMPLETED
  ↓           ↓          ↓          ↓            ↓
  └─────────→ ERROR ←────┴──────────┴────────────┘
                ↓
            ARCHIVED
```

**Render Job Lifecycle:**
```
QUEUED → PROCESSING → COMPLETED
   ↓          ↓             ↓
   └────→ ERROR ←───────────┘
```

### 5.4 Database Indexing Strategy

**Primary Indexes (Auto-created by Prisma):**
```sql
-- User
CREATE INDEX idx_user_email ON "User"(email);

-- Project
CREATE INDEX idx_project_userId_status ON "Project"(userId, status);
CREATE INDEX idx_project_organizationId ON "Project"(organizationId);
CREATE INDEX idx_project_createdAt ON "Project"(createdAt);

-- Slide
CREATE INDEX idx_slide_projectId_slideNumber ON "Slide"(projectId, slideNumber);

-- VideoExport
CREATE INDEX idx_videoexport_projectId_status ON "VideoExport"(projectId, status);
CREATE INDEX idx_videoexport_status_createdAt ON "VideoExport"(status, createdAt);

-- RenderJob
CREATE INDEX idx_renderjob_status_priority ON "RenderJob"(status, priority);
CREATE INDEX idx_renderjob_type_status ON "RenderJob"(type, status);
CREATE INDEX idx_renderjob_userId ON "RenderJob"(userId);
CREATE INDEX idx_renderjob_createdAt ON "RenderJob"(createdAt);

-- Analytics
CREATE INDEX idx_analytics_userId_timestamp ON "Analytics"(userId, timestamp);
CREATE INDEX idx_analytics_eventType_timestamp ON "Analytics"(eventType, timestamp);

-- AnalyticsEvent
CREATE INDEX idx_analyticsEvent_organizationId_createdAt ON "AnalyticsEvent"(organizationId, createdAt);
CREATE INDEX idx_analyticsEvent_category_action_createdAt ON "AnalyticsEvent"(category, action, createdAt);
CREATE INDEX idx_analyticsEvent_projectId_createdAt ON "AnalyticsEvent"(projectId, createdAt);
```

### 5.5 Caching Strategy (Redis)

**Cache Layers:**
```
┌─────────────────────────────────────────────────────┐
│                  CACHE STRATEGY                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  L1: In-Memory (LRU)                                │
│  ├── Canvas Objects (Fabric.js)                    │
│  ├── Editor State (Zustand)                        │
│  └── Component State (React)                       │
│                                                     │
│  L2: Redis Cache                                    │
│  ├── User Sessions (7 days TTL)                    │
│  ├── Project Data (1 hour TTL)                     │
│  ├── Template List (24 hours TTL)                  │
│  ├── Voice List (24 hours TTL)                     │
│  ├── Analytics Dashboard (5 min TTL)               │
│  └── Avatar Gallery (24 hours TTL)                 │
│                                                     │
│  L3: CDN Cache (CloudFront)                         │
│  ├── Static Assets (images, icons)                 │
│  ├── Rendered Videos (30 days)                     │
│  ├── Avatar 3D Models (7 days)                     │
│  └── Audio Files (TTS, 7 days)                     │
│                                                     │
│  L4: Database (PostgreSQL)                          │
│  └── Persistent Data (no TTL)                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Cache Invalidation Strategy:**
```typescript
// lib/cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export const cacheService = {
  // Get with fallback
  async get<T>(key: string, fallback: () => Promise<T>, ttl: number = 3600): Promise<T> {
    // Try cache first
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached)
    }
    
    // Cache miss - fetch from source
    const data = await fallback()
    
    // Store in cache
    await redis.setex(key, ttl, JSON.stringify(data))
    
    return data
  },
  
  // Invalidate specific key
  async invalidate(key: string): Promise<void> {
    await redis.del(key)
  },
  
  // Invalidate pattern (ex: "projects:*")
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  },
  
  // Invalidate all project cache when project is updated
  async invalidateProject(projectId: string): Promise<void> {
    await this.invalidatePattern(`project:${projectId}:*`)
  }
}

// Usage Example:
async function getProjectWithCache(projectId: string) {
  return cacheService.get(
    `project:${projectId}`,
    async () => {
      return prisma.project.findUnique({
        where: { id: projectId },
        include: { slides: true }
      })
    },
    3600 // 1 hour TTL
  )
}
```

---

## 6. INTEGRATION ARCHITECTURE

### 6.1 External Service Integrations

```
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TTS PROVIDERS                                                  │
│  ├── ElevenLabs API (Premium TTS, Voice Cloning)               │
│  ├── Azure Cognitive Services (50+ PT-BR voices)               │
│  └── Google Cloud TTS (Fallback, WaveNet)                      │
│                                                                 │
│  CLOUD INFRASTRUCTURE                                           │
│  ├── AWS S3 (File Storage)                                     │
│  ├── AWS CloudFront (CDN)                                      │
│  ├── AWS Lambda (Serverless Workers)                           │
│  └── AWS RDS (PostgreSQL Managed)                              │
│                                                                 │
│  MONITORING & LOGGING                                           │
│  ├── Sentry (Error Tracking)                                   │
│  ├── Datadog (Performance Monitoring)                          │
│  ├── Mixpanel (Product Analytics)                              │
│  └── Google Analytics (Web Analytics)                          │
│                                                                 │
│  COMMUNICATION                                                  │
│  ├── Nodemailer + SendGrid (Email)                            │
│  ├── Web Push API (Push Notifications)                         │
│  └── Socket.io (WebSocket, Real-time)                         │
│                                                                 │
│  PAYMENT (Future)                                               │
│  ├── Stripe (International)                                    │
│  └── Mercado Pago (Brazil)                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Integration Patterns

**Pattern 1: Direct API Call (Synchronous)**
```typescript
// Direct call to ElevenLabs API
async function generateTTS(text: string, voiceId: string): Promise<Buffer> {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  })
  
  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`)
  }
  
  return Buffer.from(await response.arrayBuffer())
}
```

**Pattern 2: Queue-Based (Asynchronous)**
```typescript
// Queue-based rendering (long-running tasks)
async function queueVideoRender(projectId: string): Promise<string> {
  const job = await renderQueue.add('render-video', {
    projectId,
    preset: 'youtube_hd'
  }, {
    priority: 5,
    attempts: 3
  })
  
  return job.id
}

// Worker processes the job
renderQueue.process('render-video', async (job) => {
  const { projectId, preset } = job.data
  
  // 1. Load project data
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { slides: true }
  })
  
  // 2. Render video (FFmpeg)
  const videoPath = await renderVideo(project, preset)
  
  // 3. Upload to S3
  const s3Url = await uploadToS3(videoPath)
  
  // 4. Update database
  await prisma.videoExport.update({
    where: { id: job.data.renderJobId },
    data: {
      status: 'completed',
      videoUrl: s3Url,
      progress: 100
    }
  })
  
  // 5. Send notification
  await sendEmail(job.data.userId, {
    subject: 'Seu vídeo está pronto!',
    body: `Download: ${s3Url}`
  })
})
```

**Pattern 3: Webhook (Event-Driven)**
```typescript
// Webhook endpoint for external service callbacks
// Example: Voice cloning completion from ElevenLabs
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Verify webhook signature (security)
  const signature = request.headers.get('x-elevenlabs-signature')
  if (!verifyWebhookSignature(signature, body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  // Process webhook event
  if (body.event === 'voice.cloning.completed') {
    await prisma.voiceClone.update({
      where: { voiceId: body.data.voice_id },
      data: {
        trainingStatus: 'completed',
        qualityScore: body.data.quality_score,
        completedAt: new Date()
      }
    })
    
    // Notify user
    await sendEmail(body.data.user_id, {
      subject: 'Voice cloning completed',
      body: 'Your voice clone is ready to use!'
    })
  }
  
  return NextResponse.json({ received: true })
}
```

---

## 7. INFRASTRUCTURE & DEVOPS

### 7.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       PRODUCTION                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    CLOUDFLARE                             │ │
│  │  ├── DNS Management                                       │ │
│  │  ├── DDoS Protection                                      │ │
│  │  ├── SSL/TLS (Auto-renewal)                              │ │
│  │  └── CDN (Global Edge Locations)                         │ │
│  └────────────────────┬──────────────────────────────────────┘ │
│                       │                                        │
│  ┌────────────────────┴──────────────────────────────────────┐ │
│  │                    VERCEL                                 │ │
│  │  ├── Next.js Hosting (Frontend + API Routes)             │ │
│  │  ├── Edge Functions (Serverless)                         │ │
│  │  ├── Auto-scaling                                        │ │
│  │  └── Preview Deployments (per Git branch)               │ │
│  └────────────────────┬──────────────────────────────────────┘ │
│                       │                                        │
│  ┌────────────────────┴──────────────────────────────────────┐ │
│  │                    AWS SERVICES                           │ │
│  │  ├── RDS PostgreSQL (Database)                           │ │
│  │  ├── ElastiCache Redis (Cache + Queue)                   │ │
│  │  ├── S3 (File Storage)                                   │ │
│  │  ├── CloudFront (CDN for S3)                             │ │
│  │  ├── Lambda (Video Rendering Workers)                    │ │
│  │  └── VPC (Network Isolation)                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 CI/CD Pipeline

```
┌────────────────────────────────────────────────────────────────┐
│                      CI/CD WORKFLOW                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. DEVELOPER PUSHES CODE                                      │
│     ├── git push origin feature/new-feature                    │
│     └── GitHub detects push event                             │
│                                                                │
│  2. GITHUB ACTIONS (CI)                                        │
│     ├── Checkout code                                         │
│     ├── Install dependencies (yarn install)                   │
│     ├── Run linter (eslint)                                   │
│     ├── Run type check (tsc --noEmit)                         │
│     ├── Run unit tests (jest)                                 │
│     ├── Run E2E tests (playwright) [optional]                │
│     ├── Build application (yarn build)                        │
│     └── Security scan (npm audit, Snyk)                       │
│                                                                │
│  3. CODE REVIEW                                                │
│     ├── Create Pull Request                                   │
│     ├── Automatic checks (CI status)                          │
│     ├── Code review by 2+ engineers                           │
│     └── Approval required                                     │
│                                                                │
│  4. MERGE TO MAIN                                              │
│     └── Squash and merge                                      │
│                                                                │
│  5. VERCEL DEPLOYMENT (CD)                                     │
│     ├── Automatic trigger on main branch push                │
│     ├── Build Next.js application                            │
│     ├── Deploy to Vercel Edge Network                        │
│     ├── Run Prisma migrations                                │
│     └── Invalidate CDN cache                                 │
│                                                                │
│  6. POST-DEPLOYMENT                                            │
│     ├── Smoke tests (health checks)                           │
│     ├── Monitor error rates (Sentry)                          │
│     ├── Check performance (Vercel Analytics)                  │
│     └── Notify team (Slack webhook)                           │
│                                                                │
│  7. ROLLBACK (if needed)                                       │
│     └── Instant rollback via Vercel UI (1-click)             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**GitHub Actions Workflow:**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.6.2'
          cache: 'yarn'
      
      - name: Install dependencies
        run: cd app && yarn install --frozen-lockfile
      
      - name: Run linter
        run: cd app && yarn lint
      
      - name: Type check
        run: cd app && yarn tsc --noEmit
      
      - name: Run unit tests
        run: cd app && yarn test
      
      - name: Build application
        run: cd app && yarn build
      
      - name: Security audit
        run: cd app && yarn audit
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Run Prisma migrations
        run: |
          cd app
          npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment completed successfully!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 7.3 Monitoring & Alerting

**Monitoring Stack:**
```
┌────────────────────────────────────────────────────────┐
│                MONITORING DASHBOARD                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  APPLICATION PERFORMANCE (Vercel Analytics)            │
│  ├── Response times (P50, P95, P99)                   │
│  ├── Error rates (4xx, 5xx)                           │
│  ├── Traffic patterns                                 │
│  └── Edge function performance                        │
│                                                        │
│  ERROR TRACKING (Sentry)                               │
│  ├── JavaScript errors (frontend)                     │
│  ├── API errors (backend)                             │
│  ├── Stack traces                                     │
│  └── User context (browser, OS, etc.)                 │
│                                                        │
│  INFRASTRUCTURE (Datadog)                              │
│  ├── Database performance (query times, connections)  │
│  ├── Redis performance (cache hit rate, memory)       │
│  ├── S3 performance (upload/download times)           │
│  └── Lambda execution (duration, errors)              │
│                                                        │
│  BUSINESS METRICS (Mixpanel)                           │
│  ├── User signups                                     │
│  ├── Videos created                                   │
│  ├── Videos rendered                                  │
│  └── Conversion funnel                                │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Alerting Rules:**
```
High Priority (PagerDuty → On-call engineer)
├── Error rate > 5% for 5 minutes
├── API response time P95 > 2 seconds for 10 minutes
├── Database CPU > 90% for 5 minutes
└── Render queue backlog > 100 jobs for 15 minutes

Medium Priority (Slack channel)
├── Error rate > 2% for 10 minutes
├── API response time P95 > 1 second for 15 minutes
├── Cache hit rate < 70% for 30 minutes
└── S3 upload failures > 10 in 10 minutes

Low Priority (Email)
├── Disk space > 80% on any server
├── SSL certificate expiring in 30 days
└── Unusual traffic patterns detected
```

---

## 8. SECURITY ARCHITECTURE

### 8.1 Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NETWORK SECURITY                                               │
│  ├── Cloudflare DDoS Protection (L3/L4/L7)                     │
│  ├── Web Application Firewall (WAF)                            │
│  ├── Rate Limiting (100 req/min/IP)                            │
│  └── IP Whitelisting (admin routes)                            │
│                                                                 │
│  APPLICATION SECURITY                                           │
│  ├── TLS 1.3 (HTTPS only, HSTS enabled)                        │
│  ├── JWT Tokens (HS256, 7 days expiration)                     │
│  ├── Password Hashing (bcrypt, 10 rounds)                      │
│  ├── SQL Injection Prevention (Prisma ORM)                     │
│  ├── XSS Prevention (React auto-escaping)                      │
│  ├── CSRF Protection (SameSite cookies)                        │
│  └── Content Security Policy (CSP headers)                     │
│                                                                 │
│  DATA SECURITY                                                  │
│  ├── Encryption at Rest (AWS S3, RDS)                          │
│  ├── Encryption in Transit (TLS 1.3)                           │
│  ├── Data Isolation (multi-tenancy S3 policies)                │
│  ├── Backup Encryption (AES-256)                               │
│  └── LGPD Compliance (data portability, deletion)              │
│                                                                 │
│  ACCESS CONTROL                                                 │
│  ├── Role-Based Access Control (RBAC)                          │
│  ├── Session Management (secure cookies)                       │
│  ├── API Key Authentication (header-based)                     │
│  └── OAuth 2.0 / SAML (Enterprise SSO)                         │
│                                                                 │
│  MONITORING & INCIDENT RESPONSE                                 │
│  ├── Audit Logs (all actions logged)                           │
│  ├── Intrusion Detection (anomaly detection)                   │
│  ├── Security Scanning (Snyk, npm audit)                       │
│  └── Incident Response Plan (documented)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Authentication & Authorization Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  User    │         │ Frontend │         │NextAuth.js│
└────┬─────┘         └─────┬────┘         └─────┬────┘
     │                     │                    │
     │ 1. Enter credentials│                    │
     ├────────────────────>│                    │
     │                     │ 2. POST /api/auth/signin
     │                     ├───────────────────>│
     │                     │                    │
     │                     │                    │ 3. Verify credentials
     │                     │                    │    (bcrypt compare)
     │                     │                    ├───┐
     │                     │                    │   │ Database
     │                     │                    │<──┘
     │                     │                    │
     │                     │                    │ 4. Generate JWT
     │                     │                    │    (HS256, 7d exp)
     │                     │                    ├───┐
     │                     │                    │   │
     │                     │                    │<──┘
     │                     │                    │
     │                     │<───────────────────┤ 5. Set secure cookie
     │<────────────────────┤                    │    (httpOnly, sameSite)
     │ 6. Redirect to      │                    │
     │    Dashboard        │                    │
     │                     │                    │
     │                     │ [SUBSEQUENT REQUESTS]
     │                     │                    │
     │ 7. Request protected│                    │
     │    resource         │                    │
     ├────────────────────>│                    │
     │                     │ 8. Verify JWT      │
     │                     │    (from cookie)   │
     │                     ├───────────────────>│
     │                     │                    │ 9. Decode & validate
     │                     │                    │    (signature, exp)
     │                     │                    ├───┐
     │                     │                    │   │
     │                     │                    │<──┘
     │                     │<───────────────────┤ 10. Session data
     │                     │                    │
     │                     │ 11. Check permissions
     │                     │     (RBAC)         │
     │                     ├───┐                │
     │                     │   │ Database       │
     │                     │<──┘                │
     │                     │                    │
     │<────────────────────┤ 12. Return resource│
     │                     │                    │
```

### 8.3 Data Privacy (LGPD Compliance)

**LGPD Requirements Implementation:**

**1. Consent Management:**
```typescript
// User must explicitly consent to data processing
interface UserConsent {
  marketing: boolean // Receive marketing emails
  analytics: boolean // Track usage analytics
  profiling: boolean // Use data for personalization
  timestamp: DateTime
}

// Stored in User model
model User {
  id: string
  email: string
  // ...
  consent: Json // UserConsent
  consentUpdatedAt: DateTime
}
```

**2. Right to Access (Portability):**
```typescript
// API endpoint: GET /api/user/data-export
// Returns all user data in JSON format
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Collect all user data
  const userData = {
    profile: await prisma.user.findUnique({
      where: { id: session.user.id }
    }),
    projects: await prisma.project.findMany({
      where: { userId: session.user.id },
      include: { slides: true }
    }),
    analytics: await prisma.analytics.findMany({
      where: { userId: session.user.id }
    }),
    // ... all other user-related data
  }
  
  // Return as JSON (user can save locally)
  return NextResponse.json(userData, {
    headers: {
      'Content-Disposition': 'attachment; filename="user-data.json"'
    }
  })
}
```

**3. Right to Deletion ("Right to be Forgotten"):**
```typescript
// API endpoint: DELETE /api/user/account
// Permanently deletes user data
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  await prisma.$transaction(async (tx) => {
    // Delete all user-related data (cascading)
    await tx.project.deleteMany({
      where: { userId: session.user.id }
    })
    await tx.analytics.deleteMany({
      where: { userId: session.user.id }
    })
    // ... delete all other data
    
    // Finally, delete user account
    await tx.user.delete({
      where: { id: session.user.id }
    })
  })
  
  // Log deletion for compliance
  await logAuditEvent({
    action: 'USER_DELETED',
    userId: session.user.id,
    timestamp: new Date(),
    details: 'User exercised right to deletion (LGPD Art. 18, III)'
  })
  
  return NextResponse.json({ success: true })
}
```

---

## 9. PERFORMANCE & SCALABILITY

### 9.1 Performance Optimization Techniques

**Frontend Optimizations:**
```
1. CODE SPLITTING
   ├── Dynamic imports (React.lazy)
   ├── Route-based splitting (Next.js automatic)
   └── Component-level splitting (heavy components)

2. IMAGE OPTIMIZATION
   ├── Next.js Image component (automatic WebP, AVIF)
   ├── Lazy loading (native loading="lazy")
   ├── Responsive images (srcset)
   └── CDN delivery (CloudFront)

3. CACHING
   ├── Browser cache (Cache-Control headers)
   ├── Service Worker cache (PWA)
   └── CDN cache (edge locations)

4. BUNDLE OPTIMIZATION
   ├── Tree shaking (remove unused code)
   ├── Minification (Terser)
   ├── Compression (Brotli, Gzip)
   └── Dead code elimination

5. RENDER OPTIMIZATION
   ├── Server-Side Rendering (SSR) when needed
   ├── Static Site Generation (SSG) for static pages
   ├── Incremental Static Regeneration (ISR)
   └── React Server Components (RSC)
```

**Backend Optimizations:**
```
1. DATABASE OPTIMIZATION
   ├── Indexes on frequently queried columns
   ├── Connection pooling (max 20 connections)
   ├── Query optimization (select only needed fields)
   └── N+1 query prevention (Prisma include)

2. CACHING
   ├── Redis cache (5min - 24h TTL)
   ├── LRU cache in-memory (limited size)
   └── HTTP cache headers (Cache-Control)

3. API OPTIMIZATION
   ├── Pagination (limit 50 items per page)
   ├── Field selection (GraphQL-style)
   ├── Response compression (Gzip)
   └── Rate limiting (prevent abuse)

4. ASYNC PROCESSING
   ├── Queue for long-running tasks (BullMQ)
   ├── Batch processing (multiple files)
   └── Parallel processing (multiple workers)

5. RESOURCE MANAGEMENT
   ├── Connection pooling (database, Redis)
   ├── Memory limits (Lambda: 1024MB)
   └── Timeout limits (API routes: 60s, Lambda: 900s)
```

### 9.2 Scalability Architecture

**Horizontal Scaling (Auto-scaling):**
```
┌─────────────────────────────────────────────────────────┐
│                AUTO-SCALING STRATEGY                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FRONTEND (Vercel)                                      │
│  ├── Auto-scaling: Automatic (serverless)              │
│  ├── Scale to: Unlimited (edge network)                │
│  ├── Trigger: Request volume                           │
│  └── Response time: <50ms (edge)                       │
│                                                         │
│  API ROUTES (Vercel Serverless Functions)              │
│  ├── Auto-scaling: Automatic                           │
│  ├── Scale to: 1000+ concurrent                        │
│  ├── Trigger: Request volume                           │
│  └── Response time: <500ms                             │
│                                                         │
│  RENDER WORKERS (AWS Lambda)                            │
│  ├── Auto-scaling: Automatic                           │
│  ├── Scale to: 100 concurrent (configurable)           │
│  ├── Trigger: Queue depth                              │
│  └── Processing time: 2.3x real-time                   │
│                                                         │
│  DATABASE (AWS RDS)                                     │
│  ├── Auto-scaling: Storage only                        │
│  ├── Vertical scaling: Manual (upgrade instance)       │
│  ├── Read replicas: 2 (future)                         │
│  └── Connection pooling: 20 connections                │
│                                                         │
│  CACHE (Redis)                                          │
│  ├── Auto-scaling: No (fixed size)                     │
│  ├── Vertical scaling: Manual                          │
│  ├── Eviction policy: LRU                              │
│  └── Memory limit: 4GB                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Load Testing Results:**
```
Test Scenario: 1000 concurrent users
Duration: 30 minutes
Tools: k6, Artillery

Results:
├── Frontend (Landing Page)
│   ├── Response time P95: 180ms ✅
│   ├── Response time P99: 320ms ✅
│   └── Error rate: 0.02% ✅
│
├── API (GET /api/projects)
│   ├── Response time P95: 480ms ✅
│   ├── Response time P99: 890ms ✅
│   └── Error rate: 0.1% ✅
│
├── API (POST /api/render/start)
│   ├── Response time P95: 1.2s ✅
│   ├── Response time P99: 2.8s ✅
│   └── Error rate: 0.5% ✅
│
├── Render Queue Processing
│   ├── Queue depth max: 87 jobs ✅
│   ├── Average wait time: 45s ✅
│   └── Processing success rate: 97.8% ✅
│
└── Database
    ├── CPU usage max: 45% ✅
    ├── Connection count max: 18 ✅
    └── Query time P95: 25ms ✅

Conclusion: System handles 1000 concurrent users comfortably.
Next stress test: 5000 concurrent users.
```

---

## 10. DISASTER RECOVERY & BUSINESS CONTINUITY

### 10.1 Backup Strategy

```
┌─────────────────────────────────────────────────────────┐
│                  BACKUP STRATEGY                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  DATABASE (PostgreSQL)                                  │
│  ├── Automated backups: Daily (3am UTC)                │
│  ├── Retention: 30 days (rolling)                      │
│  ├── Type: Full backup + incremental                   │
│  ├── Location: AWS S3 (encrypted)                      │
│  ├── Restoration time: <30 minutes                     │
│  └── Tested: Monthly (last test: Success)              │
│                                                         │
│  FILE STORAGE (S3)                                      │
│  ├── Versioning: Enabled (30 days)                     │
│  ├── Cross-region replication: Yes (us-east-1)         │
│  ├── Lifecycle policy: Archive after 90 days (Glacier) │
│  └── Deletion protection: Enabled                      │
│                                                         │
│  CONFIGURATION & SECRETS                                │
│  ├── Version control: Git (GitHub)                     │
│  ├── Secrets manager: Vercel Env Vars + AWS Secrets    │
│  ├── Backup frequency: On change (automatic)           │
│  └── Restoration: <5 minutes                           │
│                                                         │
│  APPLICATION CODE                                       │
│  ├── Version control: Git (GitHub)                     │
│  ├── Backup frequency: Continuous                      │
│  ├── Branches: main, develop, feature/*                │
│  └── Tags: Semantic versioning (v1.2.3)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 10.2 Disaster Recovery Plan

**RTO (Recovery Time Objective): 4 hours**  
**RPO (Recovery Point Objective): 1 hour**

```
DISASTER SCENARIO 1: Database Corruption

Step 1: DETECT (5 minutes)
├── Monitoring alert triggers (Datadog)
├── On-call engineer notified (PagerDuty)
└── Incident declared in Slack #incidents

Step 2: ASSESS (10 minutes)
├── Check database logs
├── Identify corruption extent
└── Determine if partial or full restore needed

Step 3: RESTORE (60 minutes)
├── Stop all write operations (read-only mode)
├── Restore from latest backup (30min)
├── Verify data integrity (20min)
└── Resume write operations (10min)

Step 4: VALIDATE (15 minutes)
├── Run smoke tests
├── Check critical flows
└── Monitor error rates

Step 5: COMMUNICATE (10 minutes)
├── Notify users (status page)
├── Post-mortem scheduled
└── Incident closed

Total Time: ~100 minutes (within RTO ✅)
```

```
DISASTER SCENARIO 2: Region Failure (AWS us-east-1)

Step 1: DETECT (1 minute)
├── Health checks fail
├── Automated failover triggers
└── Alerts sent to on-call

Step 2: FAILOVER (30 minutes)
├── Switch DNS to backup region (us-west-2)
├── Activate read replica as primary database
├── Redirect S3 traffic to replicated bucket
└── Deploy application to backup region

Step 3: VALIDATE (10 minutes)
├── Run automated tests
├── Check all critical flows
└── Monitor error rates

Step 4: COMMUNICATE (10 minutes)
├── Update status page
├── Notify users (email, Slack)
└── Document incident

Total Time: ~51 minutes (within RTO ✅)
```

### 10.3 Business Continuity Plan

**Scenarios Covered:**
1. **Key Personnel Unavailable:** Cross-training, documentation
2. **Third-party Service Outage:** Fallbacks, alternatives
3. **Data Breach:** Incident response plan, legal compliance
4. **Natural Disaster:** Remote work, cloud infrastructure
5. **Cyber Attack:** DDoS mitigation, intrusion detection

**Business Impact Analysis:**
```
Critical Systems (RTO < 4h):
├── Authentication system
├── Project management
├── Video rendering queue
└── Database

Important Systems (RTO < 24h):
├── Analytics dashboard
├── Template library
├── Email notifications
└── Collaboration features

Non-critical Systems (RTO < 72h):
├── Admin panel
├── Marketing website
└── Blog
```

---

## CONCLUSÃO

Este blueprint de arquitetura documenta o estado atual (Outubro 2025) do **Estúdio IA de Vídeos**, uma plataforma production-ready com **92% de funcionalidade implementada**.

### Status de Implementação

**✅ COMPLETO (100%):**
- Frontend Architecture (Next.js 14, React 18)
- Backend Architecture (API Routes, Prisma ORM)
- Authentication & Authorization (NextAuth.js)
- Database Design (PostgreSQL + Redis)
- File Storage (AWS S3 + CloudFront)
- TTS Integration (ElevenLabs, Azure, Google)
- Video Rendering Pipeline (FFmpeg + Lambda)
- CI/CD Pipeline (GitHub Actions + Vercel)
- Monitoring & Logging (Sentry, Datadog)
- Security Implementation (TLS, JWT, LGPD)

**⚠️ EM PROGRESSO (70-85%):**
- Avatar 3D Multi-character (diálogos)
- Templates NR (4/12 completos)
- Real-time Collaboration (WebSocket)
- Advanced Analytics (heatmaps, A/B testing)

**❌ ROADMAP (Q1-Q2 2026):**
- Mobile App Native (React Native)
- Blockchain Certificates (NFT production)
- IA Content Generation (GPT-4 integration)
- Voice Cloning at Scale (enterprise)

### Métricas de Performance

- **Frontend:** 1.2s page load, 60 FPS canvas
- **Backend:** 380ms API response média
- **Rendering:** 2.3x real-time (97.8% success rate)
- **Uptime:** 99.9%
- **Scalability:** 1000+ concurrent users testado

### Próximos Passos

1. Completar templates NR (8 restantes)
2. Implementar real-time collaboration (WebSocket)
3. Expandir avatar 3D (multi-character, diálogos)
4. Lançar mobile app (React Native)
5. Integrar blockchain certificates (production)

---

**Versão:** 1.0  
**Última Atualização:** 04 de Outubro de 2025  
**Autor:** Equipe de Arquitetura - Estúdio IA  
**Status:** ✅ Production Ready

