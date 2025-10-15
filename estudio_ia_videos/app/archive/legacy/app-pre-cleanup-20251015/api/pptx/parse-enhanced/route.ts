

import { NextRequest, NextResponse } from 'next/server'
import { EnhancedPPTXParser } from '../../../../lib/pptx/enhanced-pptx-parser'
import { SceneTemplatesManager, SceneGenerator } from '../../../../lib/pptx/scene-templates'
import { pptxCache } from '../../../../lib/cache/intelligent-cache'
import { performanceOptimizer } from '../../../../lib/optimization/performance-optimizer'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const autoTemplate = formData.get('autoTemplate') === 'true'
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo PPTX foi enviado' },
        { status: 400 }
      )
    }

    // Validate file
    if (!file.name.toLowerCase().endsWith('.pptx') && !file.name.toLowerCase().endsWith('.ppt')) {
      return NextResponse.json(
        { error: 'Formato de arquivo inválido. Apenas arquivos .pptx e .ppt são aceitos.' },
        { status: 400 }
      )
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json(
        { error: 'Arquivo muito grande. Limite máximo: 50MB' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Sprint 7: Check cache first for optimization
    const cacheKey = `pptx_parse_${file.name}_${file.size}_${autoTemplate}`
    const cachedResult = pptxCache.get(cacheKey)
    
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
        message: 'Resultado obtido do cache inteligente'
      })
    }
    
    // Enhanced parsing
    const parseResult = await EnhancedPPTXParser.parsePPTX(buffer, file.name)
    
    // Validate content quality
    const contentIssues = parseResult.slides.map(slide => ({
      slideNumber: slide.slideNumber,
      issues: EnhancedPPTXParser.validateSlideContent(slide)
    }))
    
    // Auto-generate scene mappings if requested
    let sceneMappings = null
    let generatedScenes = null
    
    if (autoTemplate) {
      sceneMappings = SceneTemplatesManager.generateSceneMappings(parseResult.slides)
      generatedScenes = SceneGenerator.generateScenesFromSlides(parseResult.slides, sceneMappings)
    }
    
    // Sprint 7: Cache the result for future requests
    const responseData = {
      success: true,
      parseResult,
      contentIssues,
      sceneMappings,
      generatedScenes,
      availableTemplates: SceneTemplatesManager.getAvailableTemplates(),
      summary: {
        totalSlides: parseResult.slides.length,
        estimatedDuration: generatedScenes ? 
          generatedScenes.reduce((sum: number, scene: any) => sum + scene.duration, 0) : 
          parseResult.slides.length * 15,
        qualityScore: calculateQualityScore(contentIssues),
        processingTime: parseResult.metadata.processingTime
      }
    }
    
    // Cache the result with intelligent tags
    pptxCache.set(cacheKey, responseData, {
      priority: file.size > 10 * 1024 * 1024 ? 'high' : 'medium', // High priority for large files
      tags: [
        'pptx',
        'parsing',
        parseResult.slides.length > 20 ? 'large_presentation' : 'small_presentation',
        autoTemplate ? 'auto_template' : 'manual_template'
      ]
    })
    
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error in enhanced PPTX parsing:', error)
    return NextResponse.json(
      { error: 'Erro interno durante o processamento do arquivo PPTX' },
      { status: 500 }
    )
  }
}

/**
 * Calculate content quality score
 */
function calculateQualityScore(contentIssues: Array<{ slideNumber: number, issues: any[] }>): number {
  const totalIssues = contentIssues.reduce((sum, slide) => sum + slide.issues.length, 0)
  const totalSlides = contentIssues.length
  
  if (totalSlides === 0) return 100
  
  const issuesPerSlide = totalIssues / totalSlides
  const score = Math.max(0, 100 - (issuesPerSlide * 20))
  
  return Math.round(score)
}
