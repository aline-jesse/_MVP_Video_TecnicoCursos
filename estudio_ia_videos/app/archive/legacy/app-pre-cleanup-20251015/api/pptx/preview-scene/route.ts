

import { NextRequest, NextResponse } from 'next/server'
import { SceneTemplatesManager } from '../../../../lib/pptx/scene-templates'

export async function POST(request: NextRequest) {
  try {
    const { slide, templateId, customizations } = await request.json()
    
    if (!slide || !templateId) {
      return NextResponse.json(
        { error: 'Slide e template ID são obrigatórios' },
        { status: 400 }
      )
    }

    const template = SceneTemplatesManager.getTemplateById(templateId)
    if (!template) {
      return NextResponse.json(
        { error: `Template não encontrado: ${templateId}` },
        { status: 404 }
      )
    }

    // Generate preview scene
    const previewScene = {
      id: `preview_${slide.slideNumber}`,
      slideNumber: slide.slideNumber,
      templateId,
      duration: SceneTemplatesManager.calculateSceneDuration(slide, templateId),
      content: {
        title: slide.title || '',
        bullets: slide.bullets || [],
        images: slide.images || [],
        notes: slide.notes || ''
      },
      style: {
        ...template.config,
        ...customizations
      },
      animations: template.config.animations,
      preview: {
        thumbnailUrl: template.preview,
        estimatedSize: calculateSceneSize(slide, template),
        complexity: assessSceneComplexity(slide, template)
      }
    }

    // Validate scene configuration
    const validationIssues = SceneTemplatesManager.validateTemplateConfig(template)

    return NextResponse.json({
      success: true,
      previewScene,
      validationIssues,
      recommendations: generateSceneRecommendations(slide, template)
    })

  } catch (error) {
    console.error('Error generating scene preview:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar preview da cena' },
      { status: 500 }
    )
  }
}

/**
 * Calculate estimated scene size in MB
 */
function calculateSceneSize(slide: any, template: any): number {
  let baseSize = 2 // Base scene size in MB
  
  // Add size for images
  if (slide.images && slide.images.length > 0) {
    baseSize += slide.images.length * 0.5 // 0.5MB per image
  }
  
  // Add size based on content complexity
  const textLength = (slide.title || '').length + (slide.bullets?.join(' ') || '').length
  baseSize += Math.ceil(textLength / 1000) * 0.1 // 0.1MB per 1000 chars
  
  // Template complexity factor
  switch (template.layout) {
    case 'image-full':
      baseSize *= 1.5
      break
    case 'two-columns':
      baseSize *= 1.2
      break
    case 'highlight':
      baseSize *= 1.1
      break
  }
  
  return Math.round(baseSize * 10) / 10
}

/**
 * Assess scene complexity
 */
function assessSceneComplexity(slide: any, template: any): 'low' | 'medium' | 'high' {
  let complexityScore = 0
  
  // Content complexity
  const totalText = (slide.title || '').length + (slide.bullets?.join(' ') || '').length
  if (totalText > 300) complexityScore += 2
  else if (totalText > 150) complexityScore += 1
  
  // Image complexity
  if (slide.images && slide.images.length > 2) complexityScore += 2
  else if (slide.images && slide.images.length > 0) complexityScore += 1
  
  // Template complexity
  switch (template.layout) {
    case 'two-columns':
    case 'image-full':
      complexityScore += 2
      break
    case 'title-image':
    case 'highlight':
      complexityScore += 1
      break
  }
  
  if (complexityScore >= 4) return 'high'
  if (complexityScore >= 2) return 'medium'
  return 'low'
}

/**
 * Generate recommendations for scene optimization
 */
function generateSceneRecommendations(slide: any, template: any): string[] {
  const recommendations = []
  
  const totalText = (slide.title || '').length + (slide.bullets?.join(' ') || '').length
  
  if (totalText > 400) {
    recommendations.push('Considere dividir o conteúdo em múltiplos slides para melhor compreensão')
  }
  
  if (slide.bullets && slide.bullets.length > 6) {
    recommendations.push('Reduza o número de bullets para melhor retenção (máximo recomendado: 5)')
  }
  
  if (template.layout === 'image-full' && (!slide.images || slide.images.length === 0)) {
    recommendations.push('Template de imagem completa requer pelo menos uma imagem')
  }
  
  if (template.layout === 'title-only' && totalText < 50) {
    recommendations.push('Considere adicionar mais conteúdo ou usar um template mais simples')
  }
  
  if (slide.images && slide.images.length > 3) {
    recommendations.push('Muitas imagens podem sobrecarregar o slide. Considere usar múltiplos slides.')
  }
  
  return recommendations
}
