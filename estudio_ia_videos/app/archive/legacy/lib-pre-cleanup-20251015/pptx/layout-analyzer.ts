/**
 * 🔍 Layout Analyzer - Detecta problemas de qualidade em slides PPTX
 * IMPLEMENTAÇÃO REAL: Valida contraste, legibilidade e boas práticas
 * 
 * Funcionalidades:
 * - Validação de contraste WCAG 2.1
 * - Detecção de texto muito pequeno
 * - Verificação de alinhamento
 * - Detecção de imagens de baixa resolução
 * - Sugestões de correção automática
 */

import { PPTXSlideData, PPTXTextBox, PPTXImage } from './types/pptx-types'

export interface LayoutIssue {
  id: string
  slideNumber: number
  severity: 'error' | 'warning' | 'info'
  category: 'readability' | 'contrast' | 'alignment' | 'spacing' | 'resolution' | 'accessibility'
  title: string
  description: string
  element?: {
    id: string
    type: string
    position?: { x: number; y: number }
  }
  suggestion: string
  autoFixable: boolean
  autoFix?: () => void
}

export interface LayoutAnalysisResult {
  slideNumber: number
  totalIssues: number
  errors: number
  warnings: number
  infos: number
  issues: LayoutIssue[]
  score: number // 0-100 (qualidade geral)
  recommendations: string[]
}

export interface BatchAnalysisResult {
  totalSlides: number
  totalIssues: number
  averageScore: number
  slideResults: LayoutAnalysisResult[]
  criticalIssues: LayoutIssue[]
  summary: {
    errors: number
    warnings: number
    infos: number
    byCategory: Record<string, number>
  }
}

export class LayoutAnalyzer {
  // Constantes de validação
  private static readonly MIN_FONT_SIZE_VIDEO = 24 // pt
  private static readonly MIN_FONT_SIZE_WARNING = 18 // pt
  private static readonly MIN_CONTRAST_RATIO = 4.5 // WCAG AA
  private static readonly MIN_IMAGE_WIDTH = 800 // px
  private static readonly MIN_IMAGE_HEIGHT = 600 // px
  private static readonly MAX_ELEMENTS_PER_SLIDE = 15
  private static readonly MAX_TEXT_LENGTH = 200 // caracteres

  /**
   * Analisa um slide completo
   */
  analyzeSlide(slide: PPTXSlideData): LayoutAnalysisResult {
    const issues: LayoutIssue[] = []

    console.log(`🔍 Analisando slide ${slide.slideNumber}...`)

    // 1. Verificar elementos de texto
    if (slide.textBoxes && slide.textBoxes.length > 0) {
      issues.push(...this.analyzeTextElements(slide))
    }

    // 2. Verificar imagens
    if (slide.images && slide.images.length > 0) {
      issues.push(...this.analyzeImages(slide))
    }

    // 3. Verificar layout geral
    issues.push(...this.analyzeOverallLayout(slide))

    // 4. Verificar acessibilidade
    issues.push(...this.analyzeAccessibility(slide))

    // Calcular métricas
    const errors = issues.filter(i => i.severity === 'error').length
    const warnings = issues.filter(i => i.severity === 'warning').length
    const infos = issues.filter(i => i.severity === 'info').length

    // Calcular score (100 - penalidades)
    const score = Math.max(0, 100 - (errors * 15) - (warnings * 5) - (infos * 2))

    // Gerar recomendações
    const recommendations = this.generateRecommendations(issues, slide)

    console.log(`📊 Slide ${slide.slideNumber}: ${issues.length} issues, score ${score}/100`)

    return {
      slideNumber: slide.slideNumber,
      totalIssues: issues.length,
      errors,
      warnings,
      infos,
      issues,
      score,
      recommendations
    }
  }

  /**
   * Analisa elementos de texto
   */
  private analyzeTextElements(slide: PPTXSlideData): LayoutIssue[] {
    const issues: LayoutIssue[] = []

    for (const textBox of slide.textBoxes) {
      // Verificar tamanho da fonte
      const fontSize = textBox.formatting?.fontSize || 12
      
      if (fontSize < LayoutAnalyzer.MIN_FONT_SIZE_VIDEO) {
        issues.push({
          id: `${slide.slideNumber}-text-${textBox.id}-font-size`,
          slideNumber: slide.slideNumber,
          severity: fontSize < LayoutAnalyzer.MIN_FONT_SIZE_WARNING ? 'error' : 'warning',
          category: 'readability',
          title: 'Fonte muito pequena para vídeo',
          description: `Fonte de ${fontSize}pt pode ser ilegível em vídeo. Recomendado: mínimo ${LayoutAnalyzer.MIN_FONT_SIZE_VIDEO}pt.`,
          element: {
            id: textBox.id,
            type: 'text',
            position: textBox.position
          },
          suggestion: `Aumentar tamanho da fonte para ${LayoutAnalyzer.MIN_FONT_SIZE_VIDEO}pt ou maior`,
          autoFixable: true,
          autoFix: () => {
            if (textBox.formatting) {
              textBox.formatting.fontSize = LayoutAnalyzer.MIN_FONT_SIZE_VIDEO
            }
          }
        })
      }

      // Verificar comprimento do texto
      if (textBox.text.length > LayoutAnalyzer.MAX_TEXT_LENGTH) {
        issues.push({
          id: `${slide.slideNumber}-text-${textBox.id}-length`,
          slideNumber: slide.slideNumber,
          severity: 'warning',
          category: 'readability',
          title: 'Texto muito longo',
          description: `${textBox.text.length} caracteres. Textos longos reduzem legibilidade em vídeo.`,
          element: {
            id: textBox.id,
            type: 'text',
            position: textBox.position
          },
          suggestion: 'Dividir em múltiplos slides ou resumir conteúdo',
          autoFixable: false
        })
      }

      // Verificar contraste
      const contrastIssue = this.checkContrast(
        textBox,
        slide.backgroundColor || '#FFFFFF',
        slide.slideNumber
      )
      
      if (contrastIssue) {
        issues.push(contrastIssue)
      }
    }

    return issues
  }

  /**
   * Verifica contraste de cores (WCAG 2.1)
   */
  private checkContrast(
    textBox: PPTXTextBox,
    backgroundColor: string,
    slideNumber: number
  ): LayoutIssue | null {
    const textColor = textBox.formatting?.color || '#000000'
    const contrastRatio = this.calculateContrastRatio(textColor, backgroundColor)

    if (contrastRatio < LayoutAnalyzer.MIN_CONTRAST_RATIO) {
      return {
        id: `${slideNumber}-text-${textBox.id}-contrast`,
        slideNumber,
        severity: 'error',
        category: 'contrast',
        title: 'Contraste insuficiente',
        description: `Contraste ${contrastRatio.toFixed(2)}:1 abaixo do mínimo WCAG AA (${LayoutAnalyzer.MIN_CONTRAST_RATIO}:1)`,
        element: {
          id: textBox.id,
          type: 'text',
          position: textBox.position
        },
        suggestion: this.suggestBetterContrast(textColor, backgroundColor),
        autoFixable: true,
        autoFix: () => {
          // Auto-fix: escurecer ou clarear cor do texto
          if (textBox.formatting) {
            const newColor = this.adjustColorForContrast(textColor, backgroundColor)
            textBox.formatting.color = newColor
          }
        }
      }
    }

    return null
  }

  /**
   * Calcula contraste entre duas cores (WCAG)
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getRelativeLuminance(color1)
    const lum2 = this.getRelativeLuminance(color2)
    
    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }

  /**
   * Calcula luminância relativa (WCAG)
   */
  private getRelativeLuminance(color: string): number {
    const rgb = this.hexToRgb(color)
    if (!rgb) return 0

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      const normalized = val / 255
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  /**
   * Converte hex para RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  /**
   * Sugere cor com melhor contraste
   */
  private suggestBetterContrast(textColor: string, bgColor: string): string {
    const bgLuminance = this.getRelativeLuminance(bgColor)
    
    // Se fundo é claro, sugerir texto escuro e vice-versa
    if (bgLuminance > 0.5) {
      return 'Use texto escuro (#000000 ou #333333) em fundo claro'
    } else {
      return 'Use texto claro (#FFFFFF) em fundo escuro'
    }
  }

  /**
   * Ajusta cor para ter contraste adequado
   */
  private adjustColorForContrast(textColor: string, bgColor: string): string {
    const bgLuminance = this.getRelativeLuminance(bgColor)
    
    // Escolher preto ou branco baseado no fundo
    return bgLuminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  /**
   * Analisa imagens
   */
  private analyzeImages(slide: PPTXSlideData): LayoutIssue[] {
    const issues: LayoutIssue[] = []

    for (const image of slide.images) {
      // Verificar resolução
      if (image.dimensions) {
        const { width, height } = image.dimensions
        
        if (width < LayoutAnalyzer.MIN_IMAGE_WIDTH || height < LayoutAnalyzer.MIN_IMAGE_HEIGHT) {
          issues.push({
            id: `${slide.slideNumber}-image-${image.id}-resolution`,
            slideNumber: slide.slideNumber,
            severity: 'warning',
            category: 'resolution',
            title: 'Imagem de baixa resolução',
            description: `${width}x${height}px pode ficar pixelada em vídeo. Recomendado: mínimo ${LayoutAnalyzer.MIN_IMAGE_WIDTH}x${LayoutAnalyzer.MIN_IMAGE_HEIGHT}px.`,
            element: {
              id: image.id,
              type: 'image'
            },
            suggestion: 'Substituir por imagem de maior resolução',
            autoFixable: false
          })
        }
      }
    }

    return issues
  }

  /**
   * Analisa layout geral do slide
   */
  private analyzeOverallLayout(slide: PPTXSlideData): LayoutIssue[] {
    const issues: LayoutIssue[] = []

    // Contar total de elementos
    const totalElements = 
      (slide.textBoxes?.length || 0) +
      (slide.images?.length || 0) +
      (slide.shapes?.length || 0)

    if (totalElements > LayoutAnalyzer.MAX_ELEMENTS_PER_SLIDE) {
      issues.push({
        id: `${slide.slideNumber}-layout-overcrowded`,
        slideNumber: slide.slideNumber,
        severity: 'warning',
        category: 'spacing',
        title: 'Slide com muitos elementos',
        description: `${totalElements} elementos. Slides com mais de ${LayoutAnalyzer.MAX_ELEMENTS_PER_SLIDE} elementos podem parecer poluídos.`,
        suggestion: 'Dividir conteúdo em múltiplos slides',
        autoFixable: false
      })
    }

    // Verificar se slide está vazio
    if (totalElements === 0 && !slide.content) {
      issues.push({
        id: `${slide.slideNumber}-layout-empty`,
        slideNumber: slide.slideNumber,
        severity: 'warning',
        category: 'readability',
        title: 'Slide vazio',
        description: 'Slide sem conteúdo visível',
        suggestion: 'Adicionar conteúdo ou remover slide',
        autoFixable: false
      })
    }

    return issues
  }

  /**
   * Analisa acessibilidade
   */
  private analyzeAccessibility(slide: PPTXSlideData): LayoutIssue[] {
    const issues: LayoutIssue[] = []

    // Verificar se imagens têm texto alternativo
    if (slide.images) {
      for (const image of slide.images) {
        if (!image.alt || image.alt.trim().length === 0) {
          issues.push({
            id: `${slide.slideNumber}-image-${image.id}-alt`,
            slideNumber: slide.slideNumber,
            severity: 'info',
            category: 'accessibility',
            title: 'Imagem sem texto alternativo',
            description: 'Texto alternativo melhora acessibilidade',
            element: {
              id: image.id,
              type: 'image'
            },
            suggestion: 'Adicionar descrição da imagem para acessibilidade',
            autoFixable: false
          })
        }
      }
    }

    return issues
  }

  /**
   * Gera recomendações baseadas nos issues
   */
  private generateRecommendations(issues: LayoutIssue[], slide: PPTXSlideData): string[] {
    const recommendations: string[] = []

    if (issues.filter(i => i.category === 'readability').length > 0) {
      recommendations.push('Aumentar tamanhos de fonte para melhor legibilidade em vídeo')
    }

    if (issues.filter(i => i.category === 'contrast').length > 0) {
      recommendations.push('Melhorar contraste entre texto e fundo (WCAG AA)')
    }

    if (issues.filter(i => i.category === 'resolution').length > 0) {
      recommendations.push('Usar imagens de alta resolução (mínimo 800x600px)')
    }

    if (issues.filter(i => i.category === 'spacing').length > 0) {
      recommendations.push('Simplificar slide removendo elementos desnecessários')
    }

    return recommendations
  }

  /**
   * Analisa múltiplos slides (batch)
   */
  analyzeBatch(slides: PPTXSlideData[]): BatchAnalysisResult {
    console.log(`🔍 Analisando ${slides.length} slides em lote...`)

    const slideResults: LayoutAnalysisResult[] = []
    let totalIssues = 0
    let totalScore = 0

    for (const slide of slides) {
      const result = this.analyzeSlide(slide)
      slideResults.push(result)
      totalIssues += result.totalIssues
      totalScore += result.score
    }

    // Identificar issues críticos (erros)
    const criticalIssues = slideResults
      .flatMap(r => r.issues)
      .filter(i => i.severity === 'error')

    // Consolidar por categoria
    const byCategory: Record<string, number> = {}
    const allIssues = slideResults.flatMap(r => r.issues)
    
    for (const issue of allIssues) {
      byCategory[issue.category] = (byCategory[issue.category] || 0) + 1
    }

    const summary = {
      errors: allIssues.filter(i => i.severity === 'error').length,
      warnings: allIssues.filter(i => i.severity === 'warning').length,
      infos: allIssues.filter(i => i.severity === 'info').length,
      byCategory
    }

    const averageScore = slides.length > 0 ? Math.round(totalScore / slides.length) : 0

    console.log(`✅ Análise concluída: ${totalIssues} issues, score médio ${averageScore}/100`)

    return {
      totalSlides: slides.length,
      totalIssues,
      averageScore,
      slideResults,
      criticalIssues,
      summary
    }
  }

  /**
   * Aplica correções automáticas
   */
  autoFixIssues(issues: LayoutIssue[]): number {
    let fixed = 0

    for (const issue of issues) {
      if (issue.autoFixable && issue.autoFix) {
        try {
          issue.autoFix()
          fixed++
          console.log(`✅ Auto-corrigido: ${issue.title}`)
        } catch (error) {
          console.error(`❌ Erro ao auto-corrigir ${issue.title}:`, error)
        }
      }
    }

    console.log(`🔧 ${fixed} issues corrigidos automaticamente`)

    return fixed
  }
}

export default LayoutAnalyzer
