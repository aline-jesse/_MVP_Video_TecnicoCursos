import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema de validação para atualização de projetos
const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo').optional(),
  description: z.string().optional(),
  type: z.enum(['video', 'presentation', 'animation']).optional(),
  status: z.enum(['draft', 'in_progress', 'completed', 'failed']).optional(),
  settings: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    fps: z.number().optional(),
    duration: z.number().optional(),
    quality: z.enum(['low', 'medium', 'high']).optional(),
    format: z.enum(['mp4', 'mov', 'avi']).optional()
  }).optional(),
  is_public: z.boolean().optional()
})

// Armazenamento em memória (mesmo do route.ts principal)
// Em produção, isso seria substituído por consultas ao banco de dados
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
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
]

// GET - Obter projeto específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 [PROJECT-API] Buscando projeto: ${params.id}`)
    
    const project = projects.find(p => p.id === params.id)
    
    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Projeto não encontrado',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    console.log(`✅ [PROJECT-API] Projeto encontrado: ${project.name}`)
    
    return NextResponse.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error(`💥 [PROJECT-API] Erro ao buscar projeto ${params.id}:`, error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// PUT - Atualizar projeto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📝 [PROJECT-API] Atualizando projeto: ${params.id}`)
    
    const body = await request.json()
    
    // Validação dos dados
    const validationResult = UpdateProjectSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: validationResult.error.errors,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const validatedData = validationResult.data
    
    // Encontrar projeto
    const projectIndex = projects.findIndex(p => p.id === params.id)
    
    if (projectIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Projeto não encontrado',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Atualizar projeto
    const currentProject = projects[projectIndex]
    const updatedProject = {
      ...currentProject,
      ...validatedData,
      settings: {
        ...currentProject.settings,
        ...validatedData.settings
      },
      updated_at: new Date().toISOString()
    }

    projects[projectIndex] = updatedProject

    console.log(`✅ [PROJECT-API] Projeto atualizado: ${updatedProject.name}`)
    
    return NextResponse.json({
      success: true,
      message: 'Projeto atualizado com sucesso!',
      data: updatedProject,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error(`💥 [PROJECT-API] Erro ao atualizar projeto ${params.id}:`, error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// DELETE - Excluir projeto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🗑️ [PROJECT-API] Excluindo projeto: ${params.id}`)
    
    const projectIndex = projects.findIndex(p => p.id === params.id)
    
    if (projectIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Projeto não encontrado',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    const deletedProject = projects[projectIndex]
    projects.splice(projectIndex, 1)

    console.log(`✅ [PROJECT-API] Projeto excluído: ${deletedProject.name}`)
    
    return NextResponse.json({
      success: true,
      message: 'Projeto excluído com sucesso!',
      data: {
        id: deletedProject.id,
        name: deletedProject.name
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error(`💥 [PROJECT-API] Erro ao excluir projeto ${params.id}:`, error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}