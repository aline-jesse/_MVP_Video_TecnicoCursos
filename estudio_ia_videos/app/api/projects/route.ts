import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema de validação para projetos
const ProjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  description: z.string().optional(),
  type: z.enum(['video', 'presentation', 'animation']).default('video'),
  settings: z.object({
    width: z.number().default(1920),
    height: z.number().default(1080),
    fps: z.number().default(30),
    duration: z.number().optional(),
    quality: z.enum(['low', 'medium', 'high']).default('high'),
    format: z.enum(['mp4', 'mov', 'avi']).default('mp4')
  }).optional()
})

// Armazenamento em memória para demonstração
let projects: any[] = [
  {
    id: 'proj-001',
    name: 'Projeto Demo 1',
    description: 'Projeto de demonstração do sistema',
    type: 'video',
    status: 'draft',
    owner_id: 'user-demo',
    settings: {
      width: 1920,
      height: 1080,
      fps: 30,
      quality: 'high',
      format: 'mp4'
    },
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'proj-002',
    name: 'Apresentação Corporativa',
    description: 'Vídeo para apresentação da empresa',
    type: 'presentation',
    status: 'in_progress',
    owner_id: 'user-demo',
    settings: {
      width: 1920,
      height: 1080,
      fps: 30,
      quality: 'high',
      format: 'mp4'
    },
    is_public: true,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    updated_at: new Date().toISOString()
  }
]

// GET - Listar projetos
export async function GET(request: NextRequest) {
  try {
    console.log('📋 [PROJECTS-API] Listando projetos...')
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    let filteredProjects = [...projects]

    // Filtros
    if (status) {
      filteredProjects = filteredProjects.filter(p => p.status === status)
    }
    
    if (type) {
      filteredProjects = filteredProjects.filter(p => p.type === type)
    }
    
    if (search) {
      filteredProjects = filteredProjects.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

    const response = {
      success: true,
      data: paginatedProjects,
      pagination: {
        page,
        limit,
        total: filteredProjects.length,
        pages: Math.ceil(filteredProjects.length / limit)
      },
      filters: {
        status,
        type,
        search
      },
      timestamp: new Date().toISOString()
    }

    console.log(`✅ [PROJECTS-API] ${paginatedProjects.length} projetos retornados`)
    return NextResponse.json(response)

  } catch (error) {
    console.error('💥 [PROJECTS-API] Erro ao listar projetos:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST - Criar novo projeto
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [PROJECTS-API] Criando novo projeto...')
    
    const body = await request.json()
    
    // Validação dos dados
    const validationResult = ProjectSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: validationResult.error.errors,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const validatedData = validationResult.data

    // Criar novo projeto
    const newProject = {
      id: `proj-${Date.now()}`,
      name: validatedData.name,
      description: validatedData.description || '',
      type: validatedData.type,
      status: 'draft',
      owner_id: 'user-demo', // Em produção, pegar do token de auth
      settings: {
        width: 1920,
        height: 1080,
        fps: 30,
        quality: 'high',
        format: 'mp4',
        ...validatedData.settings
      },
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Adicionar ao armazenamento
    projects.push(newProject)

    console.log(`✅ [PROJECTS-API] Projeto criado: ${newProject.id}`)
    
    return NextResponse.json({
      success: true,
      message: 'Projeto criado com sucesso!',
      data: newProject,
      timestamp: new Date().toISOString()
    }, { status: 201 })

  } catch (error) {
    console.error('💥 [PROJECTS-API] Erro ao criar projeto:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}