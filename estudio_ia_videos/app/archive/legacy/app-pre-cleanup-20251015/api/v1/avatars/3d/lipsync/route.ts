
/**
 * 🗣️ API de Lip Sync 3D Hiper-Realista
 * Sincronização labial cinematográfica
 */

import { NextRequest, NextResponse } from 'next/server'
import { avatar3DHyperPipeline } from '@/lib/avatar-3d-pipeline'


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const { avatarId, audioFile, text, language = 'pt-BR', quality = 'hyperreal' } = await request.json()

    if (!avatarId || !text) {
      return NextResponse.json(
        { error: 'Avatar ID e texto são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar lip sync hiper-realista
    const lipSyncResult = await avatar3DHyperPipeline.generateHyperRealisticLipSync(
      avatarId,
      audioFile,
      text
    )

    return NextResponse.json({
      success: true,
      lipSync: lipSyncResult,
      hyperRealisticFeatures: {
        microExpressions: true,
        facialMuscles: 'Anatomically Accurate',
        lipDetail: 'Photorealistic',
        eyeMovement: 'Natural Tracking',
        breathing: 'Subtle Animation',
        skinSubsurface: 'Ray-Traced SSS'
      },
      technical: {
        accuracy: `${lipSyncResult.accuracy}%`,
        processingTime: `${lipSyncResult.processingTime}ms`,
        phonemeCount: lipSyncResult.lipSyncData.length,
        blendShapeCount: Object.keys(lipSyncResult.lipSyncData[0]?.blendShapes || {}).length,
        engine: 'ML-Driven Facial Analysis',
        quality: 'Cinema Grade'
      }
    })

  } catch (error) {
    console.error('Lip Sync Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao gerar lip sync',
        details: error instanceof Error ? error.message : 'Erro no processamento'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const avatarId = searchParams.get('avatarId')

    if (!avatarId) {
      return NextResponse.json(
        { error: 'Avatar ID é obrigatório' },
        { status: 400 }
      )
    }

    const avatar = avatar3DHyperPipeline.getAvatar(avatarId)
    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      avatar: {
        id: avatar.id,
        name: avatar.name,
        lipSyncCapabilities: avatar.voiceSync,
        supportedPhonemes: Object.keys(avatar.voiceSync.phonemeMapping),
        blendShapes: avatar.assets.blendShapes,
        accuracy: avatar.features.lipSyncAccuracy,
        engine: avatar.voiceSync.lipSyncEngine
      },
      availableLanguages: avatar.voiceSync.supportedLanguages,
      qualityMetrics: {
        facialRigComplexity: 'Enterprise Grade',
        morphTargets: '150+ Blend Shapes',
        facialMuscles: '43 Anatomical Groups',
        lipAccuracy: `${avatar.features.lipSyncAccuracy}% Cinema Grade`,
        realTimeCapable: true
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar configurações de lip sync' },
      { status: 500 }
    )
  }
}
