
import { NextRequest, NextResponse } from 'next/server'

/**
 * 📁 API para carregar projetos por ID
 */

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do projeto não fornecido' },
        { status: 400 }
      )
    }

    console.log(`📁 Carregando projeto: ${id}`)
    
    // Em produção, carregar do banco
    // const project = await db.projects.findUnique({
    //   where: { id }
    // })
    
    // if (!project) {
    //   return NextResponse.json(
    //     { error: 'Projeto não encontrado' },
    //     { status: 404 }
    //   )
    // }
    
    // Mock: Retornar projeto simulado
    const mockProject = {
      id,
      title: `Projeto ${id}`,
      description: 'Projeto carregado via API',
      slides: [
        {
          id: 'slide_1',
          index: 0,
          title: 'Slide Carregado',
          layout: 'title',
          background: {
            type: 'gradient',
            value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            opacity: 1
          },
          elements: [
            {
              id: 'title_loaded',
              type: 'text' as const,
              content: 'Projeto carregado com sucesso!',
              position: { x: 200, y: 250, width: 600, height: 100 },
              style: {
                fontSize: 32,
                fontFamily: 'Arial',
                color: '#ffffff'
              },
              animation: {
                type: 'fadeIn' as const,
                duration: 1000,
                delay: 0,
                easing: 'ease-in-out' as const
              },
              interactive: { clickable: true },
              metadata: {
                originalIndex: 0,
                slideId: 'slide_1',
                elementId: 'title_loaded',
                visible: true,
                locked: false
              }
            }
          ],
          duration: 8,
          transition: {
            type: 'fade',
            duration: 500
          },
          voiceover: {
            text: 'Projeto carregado com sucesso',
            voice: 'pt-BR-AntonioNeural',
            speed: 1.0,
            pitch: 1.0
          }
        }
      ],
      timeline: {
        totalDuration: 8,
        layers: []
      },
      assets: {
        images: [],
        videos: [],
        audio: [],
        fonts: ['Arial', 'Helvetica']
      },
      settings: {
        fps: 30,
        resolution: '1080p' as const,
        aspectRatio: '16:9' as const,
        quality: 'high' as const
      },
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: 'API Mock',
        version: '1.0',
        fileSize: 0
      }
    }
    
    return NextResponse.json({
      success: true,
      project: mockProject
    })
    
  } catch (error) {
    console.error('❌ Erro ao carregar projeto:', error)
    
    return NextResponse.json(
      {
        error: 'Erro interno ao carregar projeto',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    // Em produção, deletar do banco
    // await db.projects.delete({
    //   where: { id }
    // })
    
    return NextResponse.json({
      success: true,
      message: 'Projeto deletado com sucesso'
    })
    
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erro ao deletar projeto',
        success: false
      },
      { status: 500 }
    )
  }
}
