

/**
 * Sprint 7 - API para pré-carregamento de itens comuns
 */

import { NextRequest, NextResponse } from 'next/server'
import { templateCache, pptxCache } from '../../../../lib/cache/intelligent-cache'

export async function POST(request: NextRequest) {
  try {
    const preloadedItems: string[] = []
    
    // Preload common templates
    const commonTemplates = [
      {
        id: 'corporate_clean',
        name: 'Corporate Clean',
        data: {
          background: '#ffffff',
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          fontFamily: 'Inter',
          animations: { titleEntry: 'fadeIn', contentEntry: 'slideFromLeft' }
        }
      },
      {
        id: 'safety_focus',
        name: 'Safety Focus',
        data: {
          background: '#fef3c7',
          primaryColor: '#dc2626',
          secondaryColor: '#7c2d12',
          fontFamily: 'Inter',
          animations: { titleEntry: 'zoomIn', contentEntry: 'slideFromLeft' }
        }
      },
      {
        id: 'modern_minimal',
        name: 'Modern Minimal',
        data: {
          background: '#f8fafc',
          primaryColor: '#0f172a',
          secondaryColor: '#475569',
          fontFamily: 'Inter',
          animations: { titleEntry: 'slideFromTop', contentEntry: 'fadeIn' }
        }
      }
    ]
    
    commonTemplates.forEach(template => {
      templateCache.set(`template_${template.id}`, template.data, {
        priority: 'high',
        tags: ['template', 'common', 'preloaded']
      })
      preloadedItems.push(`Template: ${template.name}`)
    })
    
    // Preload common PPTX parsing patterns
    const commonPatterns = [
      {
        key: 'pptx_bullet_pattern',
        data: {
          pattern: 'bullet_points',
          processor: 'optimized',
          animations: 'standard'
        }
      },
      {
        key: 'pptx_title_slide_pattern',
        data: {
          pattern: 'title_slide',
          processor: 'fast',
          animations: 'minimal'
        }
      },
      {
        key: 'pptx_content_slide_pattern',
        data: {
          pattern: 'content_slide',
          processor: 'balanced',
          animations: 'standard'
        }
      }
    ]
    
    commonPatterns.forEach(pattern => {
      pptxCache.set(pattern.key, pattern.data, {
        priority: 'medium',
        tags: ['pattern', 'common', 'preloaded']
      })
      preloadedItems.push(`Padrão PPTX: ${pattern.key}`)
    })
    
    // Preload common narration configurations
    const commonNarrations = [
      {
        key: 'narration_pt_br_female_standard',
        data: {
          voice: 'pt-BR-female-1',
          speed: 1.0,
          pitch: 0,
          emphasis: 'safety_training'
        }
      },
      {
        key: 'narration_pt_br_male_standard',
        data: {
          voice: 'pt-BR-male-1',
          speed: 1.0,
          pitch: 0,
          emphasis: 'technical_training'
        }
      }
    ]
    
    commonNarrations.forEach(narration => {
      templateCache.set(narration.key, narration.data, {
        priority: 'medium',
        tags: ['narration', 'common', 'preloaded']
      })
      preloadedItems.push(`Narração: ${narration.key}`)
    })
    
    return NextResponse.json({
      success: true,
      message: 'Pré-carregamento concluído',
      preloadedItems,
      summary: {
        templates: commonTemplates.length,
        patterns: commonPatterns.length,
        narrations: commonNarrations.length,
        total: preloadedItems.length
      }
    })
    
  } catch (error) {
    console.error('Error preloading common items:', error)
    return NextResponse.json(
      { error: 'Erro no pré-carregamento' },
      { status: 500 }
    )
  }
}
