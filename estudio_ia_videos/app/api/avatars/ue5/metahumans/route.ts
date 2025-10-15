
import { NextResponse } from 'next/server'
import { ue5AvatarEngine } from '@/lib/engines/ue5-avatar-engine'

/**
 * GET /api/avatars/ue5/metahumans
 * Listar MetaHumans disponíveis
 */
export async function GET() {
  try {
    const metahumans = ue5AvatarEngine.getAvailableMetaHumans()
    
    return NextResponse.json({
      success: true,
      count: metahumans.length,
      metahumans: metahumans.map(mh => ({
        id: mh.id,
        name: mh.name,
        display_name: mh.display_name,
        gender: mh.gender,
        ethnicity: mh.ethnicity,
        age_range: mh.age_range,
        style: mh.style,
        capabilities: {
          blendshapes: mh.blendshape_count,
          expressions: mh.expression_presets.length,
          clothing_options: mh.clothing_options.length,
          hair_options: mh.hair_options.length
        },
        quality: {
          polygons: mh.polygon_count,
          texture_resolution: mh.texture_resolution,
          optimization: mh.optimization_level
        }
      }))
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao listar MetaHumans:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
