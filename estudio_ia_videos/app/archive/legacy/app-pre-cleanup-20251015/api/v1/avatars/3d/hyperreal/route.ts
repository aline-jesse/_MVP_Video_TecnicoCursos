
/**
 * 🎭 API de Avatares 3D Hiper-Realistas
 * Renderização cinematográfica com ray tracing
 */

import { NextRequest, NextResponse } from 'next/server'
import { avatar3DHyperPipeline } from '@/lib/avatar-3d-pipeline'


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const quality = searchParams.get('quality') || 'hyperreal'

    let avatars
    if (category) {
      avatars = avatar3DHyperPipeline.getAvatarsByCategory(category)
    } else {
      avatars = avatar3DHyperPipeline.getAllAvatars()
    }

    // Filtrar por qualidade
    const filteredAvatars = avatars.filter(avatar => 
      quality === 'all' || avatar.quality === quality
    )

    return NextResponse.json({
      success: true,
      avatars: filteredAvatars.map(avatar => ({
        id: avatar.id,
        name: avatar.name,
        category: avatar.category,
        gender: avatar.gender,
        ethnicity: avatar.ethnicity,
        age: avatar.age,
        quality: avatar.quality,
        features: avatar.features,
        preview: {
          thumbnail: `/api/v1/avatars/3d/preview/${avatar.id}/thumb.jpg`,
          animation: `/api/v1/avatars/3d/preview/${avatar.id}/idle.mp4`,
          quality: {
            polygonCount: avatar.quality === 'hyperreal' ? '850K+' : '450K+',
            textureRes: '8K PBR',
            renderEngine: 'UE5 + Ray Tracing',
            lipSyncAccuracy: `${avatar.features.lipSyncAccuracy}%`
          }
        }
      })),
      categories: avatar3DHyperPipeline.getAllCategories(),
      totalCount: filteredAvatars.length,
      qualityLevels: {
        hyperreal: {
          description: 'Qualidade cinematográfica com ray tracing',
          polygons: '850K+',
          textures: '8K PBR',
          features: ['Ray Tracing', 'Subsurface Scattering', 'Volumetric Hair', 'Micro Expressions']
        },
        cinematic: {
          description: 'Qualidade profissional premium',
          polygons: '450K',
          textures: '4K PBR',
          features: ['Global Illumination', 'Facial Rigging', 'Cloth Physics']
        },
        premium: {
          description: 'Alta qualidade otimizada',
          polygons: '250K',
          textures: '2K PBR',
          features: ['Advanced Lighting', 'Smooth Animations']
        }
      }
    })

  } catch (error) {
    console.error('3D Avatars API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao carregar avatares 3D',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { avatarId, animation, audioFile, renderOptions } = await request.json()

    if (!avatarId || !animation) {
      return NextResponse.json(
        { error: 'Avatar ID e animação são obrigatórios' },
        { status: 400 }
      )
    }

    // Renderizar avatar hiper-realista
    const result = await avatar3DHyperPipeline.renderHyperRealisticAvatar(
      avatarId,
      animation,
      audioFile,
      renderOptions
    )

    return NextResponse.json({
      success: true,
      render: result,
      pipeline: {
        stage: 'completed',
        quality: 'hyperreal',
        engine: 'Unreal Engine 5',
        features: ['Ray Tracing', 'Lumen GI', 'Nanite Virtualized', 'Temporal AA'],
        performance: {
          renderTime: result.renderTime,
          polygonCount: result.quality.polygonCount,
          textureMemory: '2.4GB',
          rayTracingMemory: '1.8GB'
        }
      }
    })

  } catch (error) {
    console.error('Avatar Render Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao renderizar avatar',
        details: error instanceof Error ? error.message : 'Erro de renderização'
      },
      { status: 500 }
    )
  }
}
