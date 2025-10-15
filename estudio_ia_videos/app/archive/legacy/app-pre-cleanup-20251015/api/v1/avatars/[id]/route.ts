
import { NextRequest, NextResponse } from 'next/server'
import { avatar3DHyperPipeline } from '@/lib/avatar-3d-pipeline'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const avatar = avatar3DHyperPipeline.getAvatar(params.id)

    if (!avatar) {
      return NextResponse.json({ error: 'Avatar hiper-realista não encontrado' }, { status: 404 })
    }

    // Capacidades do avatar hiper-realista
    const capabilities = {
      hyperRealistic: true,
      rendering: avatar.rendering,
      features: avatar.features,
      animations: avatar.animations,
      voiceSync: avatar.voiceSync,
      technical: {
        polygonCount: avatar.quality === 'hyperreal' ? 850000 : 450000,
        textureResolution: avatar.quality === 'hyperreal' ? '8192x8192' : '4096x4096',
        renderingEngine: 'Unreal Engine 5',
        lipSyncEngine: avatar.voiceSync.lipSyncEngine,
        facialRig: avatar.voiceSync.facialRig
      }
    }

    return NextResponse.json({
      avatar: {
        id: avatar.id,
        name: avatar.name,
        category: avatar.category,
        gender: avatar.gender,
        ethnicity: avatar.ethnicity,
        age: avatar.age,
        quality: avatar.quality,
        style: avatar.style,
        features: avatar.features,
        assets: avatar.assets,
        rendering: avatar.rendering,
        animations: avatar.animations,
        voiceSync: avatar.voiceSync,
        hyperRealistic: true,
        pipeline: 'UE5 Hiper-Realista'
      },
      capabilities
    })

  } catch (error) {
    console.error('Error fetching hyper-realistic avatar:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar avatar hiper-realista' },
      { status: 500 }
    )
  }
}
