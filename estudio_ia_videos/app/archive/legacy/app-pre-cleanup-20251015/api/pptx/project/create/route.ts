

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    // Simplified for demo - in production, add proper authentication
    const session = { user: { email: 'demo@user.com' } }
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { 
      title, 
      description, 
      slides, 
      narration, 
      voiceConfig, 
      avatarConfig, 
      metadata 
    } = await request.json()

    if (!title || !slides || slides.length === 0) {
      return NextResponse.json(
        { error: 'Título e slides são obrigatórios' },
        { status: 400 }
      )
    }

    // In production, this would save to database
    // For now, we'll return a project structure that can be used by the editor
    
    const projectId = `pptx_project_${Date.now()}`
    
    // Convert slides to scenes format compatible with the existing editor
    const scenes = slides.map((slide: any, index: number) => ({
      id: `scene_${slide.slideNumber}`,
      type: 'slide',
      duration: narration[index]?.totalDuration || 15,
      content: {
        title: slide.title,
        text: slide.bullets?.join('\n') || slide.notes || '',
        imageUrl: slide.images?.[0]?.url || null
      },
      style: {
        template: metadata.sceneMappings?.[index]?.templateId || 'title-bullets-1',
        backgroundColor: slide.backgroundColor || '#ffffff',
        textColor: slide.textColor || '#1f2937'
      },
      narration: {
        text: narration[index]?.segments?.map((seg: any) => seg.text).join(' ') || '',
        audioUrl: narration[index]?.segments?.[0]?.audioUrl || null,
        voiceId: voiceConfig.voiceId,
        duration: narration[index]?.totalDuration || 15
      },
      avatar: {
        enabled: avatarConfig.enabled,
        position: avatarConfig.position,
        avatarId: avatarConfig.avatarId
      },
      order: index
    }))

    // Create project structure
    const project = {
      id: projectId,
      title,
      description,
      status: 'draft',
      type: 'pptx_conversion',
      scenes,
      config: {
        voice: voiceConfig,
        avatar: avatarConfig,
        duration: scenes.reduce((sum: number, scene: any) => sum + scene.duration, 0)
      },
      metadata: {
        ...metadata,
        originalSlideCount: slides.length,
        totalScenes: scenes.length,
        createdFrom: 'pptx',
        createdAt: new Date().toISOString(),
        createdBy: session?.user?.email
      }
    }

    // In production, save to database here
    console.log('Created PPTX project:', project.id)

    return NextResponse.json({
      success: true,
      project,
      redirectUrl: `/editor?project=${projectId}&type=pptx`,
      message: `Projeto criado com ${scenes.length} cenas`
    })

  } catch (error) {
    console.error('Error creating PPTX project:', error)
    return NextResponse.json(
      { error: 'Erro interno ao criar projeto PPTX' },
      { status: 500 }
    )
  }
}
