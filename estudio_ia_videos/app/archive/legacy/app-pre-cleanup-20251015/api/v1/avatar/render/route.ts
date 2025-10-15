
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { avatar3DHyperPipeline } from '@/lib/avatar-3d-pipeline'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      avatar_id = 'br_corporate_ana',
      audio_base64,
      text,
      duration,
      animation = 'talking_confident',
      options = {}
    } = body

    if (!audio_base64 || !text || !duration) {
      return NextResponse.json(
        { error: 'Audio data, text, and duration are required' },
        { status: 400 }
      )
    }

    // Validar se avatar existe no pipeline hiper-realista
    const avatar = avatar3DHyperPipeline.getAvatar(avatar_id)
    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar hiper-realista não encontrado' },
        { status: 404 }
      )
    }

    const startTime = Date.now()
    
    // Simular conversão de áudio base64 para arquivo
    const audioFileName = `audio_${Date.now()}.wav`
    
    // Gerar lip sync hiper-realista usando o pipeline
    const lipSyncResult = await avatar3DHyperPipeline.generateHyperRealisticLipSync(
      avatar_id,
      audioFileName,
      text
    )
    
    // Renderizar avatar hiper-realista
    const renderResult = await avatar3DHyperPipeline.renderHyperRealisticAvatar(
      avatar_id,
      animation,
      audioFileName,
      {
        resolution: options.resolution === '4K' ? '4K' : '8K',
        quality: 'hyperreal',
        rayTracing: true,
        realTimeLipSync: true
      }
    )
    
    const processingTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      avatar: {
        id: avatar_id,
        name: avatar.name,
        video: renderResult.videoUrl,
        thumbnail: renderResult.thumbnailUrl,
        quality: avatar.quality,
        hyperRealistic: true,
        pipeline: 'UE5 Hiper-Realista'
      },
      animation: {
        lipsync_data: lipSyncResult.lipSyncData,
        accuracy: lipSyncResult.accuracy,
        duration,
        engine: avatar.voiceSync.lipSyncEngine,
        blendShapes: lipSyncResult.lipSyncData.length,
        facialRig: avatar.voiceSync.facialRig
      },
      rendering: {
        quality: renderResult.quality,
        renderTime: renderResult.renderTime,
        resolution: options.resolution || '8K',
        rayTracing: true,
        engine: 'Unreal Engine 5'
      },
      processing: {
        time_ms: processingTime,
        lipSyncAccuracy: lipSyncResult.accuracy,
        renderQuality: 'Cinema Grade'
      }
    })

  } catch (error) {
    console.error('Avatar render error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to render avatar',
        details: 'Check avatar service configuration and audio data'
      },
      { status: 500 }
    )
  }
}

// Get available hyper-realistic avatars
export async function GET() {
  try {
    const avatars = avatar3DHyperPipeline.getAllAvatars()
    const categories = avatar3DHyperPipeline.getAllCategories()
    
    return NextResponse.json({
      success: true,
      avatars: avatars.map(avatar => ({
        id: avatar.id,
        name: avatar.name,
        category: avatar.category,
        quality: avatar.quality,
        preview: `/avatars/previews/${avatar.id}.jpg`,
        hyperRealistic: true,
        lipSyncAccuracy: avatar.features.lipSyncAccuracy,
        supportedLanguages: avatar.voiceSync.supportedLanguages
      })),
      categories,
      capabilities: {
        hyperRealistic: true,
        renderingEngine: 'Unreal Engine 5',
        maxResolution: '8K',
        rayTracing: true,
        realTimeLipSync: true,
        microExpressions: true,
        globalIllumination: true,
        subsurfaceScattering: true,
        volumetricLighting: true,
        lipSyncEngine: 'ML-Driven',
        facialRigging: 'Cinema Grade',
        supportedFormats: ['MP4', 'WebM', 'MOV'],
        supportedLanguages: ['pt-BR', 'en-US', 'es-ES']
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar avatares hiper-realistas' },
      { status: 500 }
    )
  }
}
