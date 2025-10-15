
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { vidnozAvatarEngine } from '@/lib/vidnoz-avatar-engine'

/**
 * 🎭 API para galeria de avatares hiper-realistas
 * GET /api/avatars/hyperreal/gallery
 */
export async function GET(request: NextRequest) {
  try {
    const avatars = await vidnozAvatarEngine.getAvatarGallery()

    return NextResponse.json({
      success: true,
      avatars,
      totalAvatars: avatars.length,
      message: 'Galeria de avatares carregada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao carregar galeria de avatares:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor ao carregar avatares',
        avatars: []
      },
      { status: 500 }
    )
  }
}

/**
 * 📊 Estatísticas da galeria
 */
export async function POST(request: NextRequest) {
  try {
    const avatars = await vidnozAvatarEngine.getAvatarGallery()
    
    // Calcular estatísticas
    const stats = {
      totalAvatars: avatars.length,
      byGender: {
        male: avatars.filter(a => a.gender === 'male').length,
        female: avatars.filter(a => a.gender === 'female').length
      },
      byQuality: {
        HD: avatars.filter(a => a.quality === 'HD').length,
        '4K': avatars.filter(a => a.quality === '4K').length,
        '8K': avatars.filter(a => a.quality === '8K').length
      },
      byStyle: {
        professional: avatars.filter(a => a.style === 'professional').length,
        casual: avatars.filter(a => a.style === 'casual').length,
        corporate: avatars.filter(a => a.style === 'corporate').length,
        friendly: avatars.filter(a => a.style === 'friendly').length
      },
      averageLipSync: Math.round(avatars.reduce((acc, a) => acc + a.lipSyncAccuracy, 0) / avatars.length),
      totalLanguages: [...new Set(avatars.flatMap(a => a.languages))].length,
      totalExpressions: avatars.reduce((acc, a) => acc + a.facialExpressions, 0)
    }

    return NextResponse.json({
      success: true,
      stats,
      message: 'Estatísticas calculadas com sucesso'
    })

  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao calcular estatísticas'
      },
      { status: 500 }
    )
  }
}
