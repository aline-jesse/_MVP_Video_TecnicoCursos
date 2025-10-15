

/**
 * Scene Templates System for Sprint 6
 * Auto-layout templates for different slide types
 */

export interface SceneTemplate {
  id: string
  name: string
  description: string
  layout: 'title-only' | 'title-bullets' | 'title-image' | 'two-columns' | 'image-full' | 'highlight'
  config: {
    titlePosition: { x: number, y: number, width: number, height: number }
    contentPosition: { x: number, y: number, width: number, height: number }
    imagePosition?: { x: number, y: number, width: number, height: number }
    backgroundColor: string
    textColor: string
    titleFontSize: number
    contentFontSize: number
    animations: {
      titleEntry: 'fadeIn' | 'slideFromTop' | 'slideFromBottom' | 'zoomIn'
      contentEntry: 'fadeIn' | 'slideFromLeft' | 'slideFromBottom'
      imageEntry?: 'fadeIn' | 'slideFromRight' | 'zoomIn'
      timing: {
        titleDelay: number
        contentDelay: number
        imageDelay?: number
      }
    }
  }
  preview: string
  isActive: boolean
}

export interface SceneMapping {
  slideId: string
  templateId: string
  customizations?: {
    backgroundColor?: string
    textColor?: string
    titleFontSize?: number
    contentFontSize?: number
    avatarEnabled?: boolean
    avatarPosition?: 'left' | 'right' | 'bottom'
  }
}

/**
 * Scene Templates Manager
 */
export class SceneTemplatesManager {
  
  /**
   * Get all available scene templates
   */
  static getAvailableTemplates(): SceneTemplate[] {
    return [
      {
        id: 'title-only-1',
        name: 'Título Centralizado',
        description: 'Template simples com título centralizado',
        layout: 'title-only',
        config: {
          titlePosition: { x: 10, y: 30, width: 80, height: 40 },
          contentPosition: { x: 0, y: 0, width: 0, height: 0 },
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          titleFontSize: 48,
          contentFontSize: 24,
          animations: {
            titleEntry: 'zoomIn',
            contentEntry: 'fadeIn',
            timing: {
              titleDelay: 0,
              contentDelay: 0
            }
          }
        },
        preview: 'https://cdn.abacus.ai/images/a1b38415-c0b2-4f9f-9e7a-4485f3017109.png',
        isActive: true
      },
      {
        id: 'title-bullets-1',
        name: 'Título + Lista',
        description: 'Título no topo com lista de pontos',
        layout: 'title-bullets',
        config: {
          titlePosition: { x: 5, y: 10, width: 90, height: 15 },
          contentPosition: { x: 10, y: 30, width: 80, height: 60 },
          backgroundColor: '#ffffff',
          textColor: '#374151',
          titleFontSize: 36,
          contentFontSize: 20,
          animations: {
            titleEntry: 'slideFromTop',
            contentEntry: 'slideFromLeft',
            timing: {
              titleDelay: 0,
              contentDelay: 0.5
            }
          }
        },
        preview: 'https://cdn.abacus.ai/images/3d49f254-73cc-4b16-ae6a-34eb25b90fcf.png',
        isActive: true
      },
      {
        id: 'title-image-1',
        name: 'Título + Imagem Grande',
        description: 'Título com imagem ocupando maior parte do slide',
        layout: 'title-image',
        config: {
          titlePosition: { x: 5, y: 5, width: 90, height: 15 },
          contentPosition: { x: 0, y: 0, width: 0, height: 0 },
          imagePosition: { x: 10, y: 25, width: 80, height: 65 },
          backgroundColor: '#f8fafc',
          textColor: '#1e293b',
          titleFontSize: 32,
          contentFontSize: 18,
          animations: {
            titleEntry: 'fadeIn',
            contentEntry: 'fadeIn',
            imageEntry: 'zoomIn',
            timing: {
              titleDelay: 0,
              contentDelay: 0,
              imageDelay: 0.8
            }
          }
        },
        preview: 'https://cdn.abacus.ai/images/1cf10807-c8a4-452e-9af6-73052b0664b3.png',
        isActive: true
      },
      {
        id: 'two-columns-1',
        name: 'Duas Colunas',
        description: 'Layout com texto à esquerda e imagem à direita',
        layout: 'two-columns',
        config: {
          titlePosition: { x: 5, y: 8, width: 90, height: 12 },
          contentPosition: { x: 5, y: 25, width: 45, height: 65 },
          imagePosition: { x: 55, y: 25, width: 40, height: 65 },
          backgroundColor: '#ffffff',
          textColor: '#111827',
          titleFontSize: 28,
          contentFontSize: 18,
          animations: {
            titleEntry: 'slideFromTop',
            contentEntry: 'slideFromLeft',
            imageEntry: 'slideFromRight',
            timing: {
              titleDelay: 0,
              contentDelay: 0.3,
              imageDelay: 0.6
            }
          }
        },
        preview: 'https://cdn.abacus.ai/images/f31f928b-2ab6-430a-8c60-7fa484e9ac00.png',
        isActive: true
      },
      {
        id: 'image-full-1',
        name: 'Imagem Completa',
        description: 'Imagem ocupando toda a tela com título sobreposto',
        layout: 'image-full',
        config: {
          titlePosition: { x: 10, y: 80, width: 80, height: 15 },
          contentPosition: { x: 0, y: 0, width: 0, height: 0 },
          imagePosition: { x: 0, y: 0, width: 100, height: 100 },
          backgroundColor: '#000000',
          textColor: '#ffffff',
          titleFontSize: 36,
          contentFontSize: 20,
          animations: {
            titleEntry: 'slideFromBottom',
            contentEntry: 'fadeIn',
            imageEntry: 'fadeIn',
            timing: {
              titleDelay: 1.0,
              contentDelay: 0,
              imageDelay: 0
            }
          }
        },
        preview: 'https://cdn.abacus.ai/images/c0899a5c-906e-43ed-b146-969bf360e6dd.png',
        isActive: true
      },
      {
        id: 'highlight-1',
        name: 'Destaque/Alerta',
        description: 'Template para slides de destaque com cores chamativas',
        layout: 'highlight',
        config: {
          titlePosition: { x: 10, y: 25, width: 80, height: 20 },
          contentPosition: { x: 10, y: 50, width: 80, height: 40 },
          backgroundColor: '#fef2f2',
          textColor: '#991b1b',
          titleFontSize: 40,
          contentFontSize: 22,
          animations: {
            titleEntry: 'zoomIn',
            contentEntry: 'slideFromLeft',
            timing: {
              titleDelay: 0.2,
              contentDelay: 0.8
            }
          }
        },
        preview: 'https://cdn.abacus.ai/images/7597db86-185c-4b8a-873a-76ec728a9a40.png',
        isActive: true
      }
    ]
  }
  
  /**
   * Get template by ID
   */
  static getTemplateById(templateId: string): SceneTemplate | null {
    return this.getAvailableTemplates().find(t => t.id === templateId) || null
  }
  
  /**
   * Auto-select best template for slide content
   */
  static autoSelectTemplate(slide: any): string {
    const hasTitle = slide.title && slide.title.length > 0
    const hasBullets = slide.bullets && slide.bullets.length > 0
    const hasImages = slide.images && slide.images.length > 0
    const isHighlight = slide.title && (
      slide.title.toLowerCase().includes('atenção') ||
      slide.title.toLowerCase().includes('importante') ||
      slide.title.toLowerCase().includes('cuidado') ||
      slide.title.toLowerCase().includes('alerta')
    )
    
    if (isHighlight) return 'highlight-1'
    if (!hasBullets && !hasImages && hasTitle) return 'title-only-1'
    if (hasBullets && hasImages) return 'two-columns-1'
    if (hasImages && !hasBullets) return hasTitle ? 'title-image-1' : 'image-full-1'
    if (hasBullets && !hasImages) return 'title-bullets-1'
    
    return 'title-bullets-1' // default
  }
  
  /**
   * Calculate scene duration based on content and template
   */
  static calculateSceneDuration(slide: any, templateId: string): number {
    const template = this.getTemplateById(templateId)
    if (!template) return 15 // default
    
    // Base duration calculation
    let duration = 5 // minimum
    
    // Add time for title
    if (slide.title) {
      duration += Math.max(2, slide.title.length / 10)
    }
    
    // Add time for bullets/content
    if (slide.bullets && slide.bullets.length > 0) {
      const totalBulletText = slide.bullets.join(' ').length
      duration += Math.max(3, totalBulletText / 12)
    }
    
    // Add time for images (pause for viewing)
    if (slide.images && slide.images.length > 0) {
      duration += 3
    }
    
    // Template-specific adjustments
    switch (template.layout) {
      case 'image-full':
        duration += 5 // More time for full images
        break
      case 'highlight':
        duration += 2 // Extra emphasis time
        break
      case 'two-columns':
        duration += 3 // Time to process both columns
        break
    }
    
    return Math.round(Math.min(duration, 45)) // Max 45 seconds per slide
  }
  
  /**
   * Generate scene mapping for all slides
   */
  static generateSceneMappings(slides: any[]): SceneMapping[] {
    return slides.map(slide => ({
      slideId: slide.id || slide.slideNumber.toString(),
      templateId: this.autoSelectTemplate(slide),
      customizations: {
        backgroundColor: slide.backgroundColor,
        textColor: slide.textColor,
        avatarEnabled: true,
        avatarPosition: 'right' as const
      }
    }))
  }
  
  /**
   * Validate template configuration
   */
  static validateTemplateConfig(template: SceneTemplate): Array<{
    type: 'error' | 'warning'
    message: string
  }> {
    const issues = []
    
    // Check position boundaries
    if (template.config.titlePosition.x < 0 || template.config.titlePosition.x > 100) {
      issues.push({
        type: 'error' as const,
        message: 'Posição X do título fora dos limites (0-100)'
      })
    }
    
    if (template.config.titlePosition.width <= 0) {
      issues.push({
        type: 'error' as const,
        message: 'Largura do título deve ser maior que 0'
      })
    }
    
    // Check color format
    if (!template.config.backgroundColor.match(/^#[0-9a-fA-F]{6}$/)) {
      issues.push({
        type: 'warning' as const,
        message: 'Cor de fundo deve estar no formato hexadecimal'
      })
    }
    
    return issues
  }
}

/**
 * Scene Generator - Creates scenes from slides using templates
 */
export class SceneGenerator {
  
  /**
   * Generate scenes from slides with templates
   */
  static generateScenesFromSlides(slides: any[], mappings: SceneMapping[]) {
    return slides.map((slide, index) => {
      const mapping = mappings[index]
      const template = SceneTemplatesManager.getTemplateById(mapping.templateId)
      
      if (!template) {
        throw new Error(`Template not found: ${mapping.templateId}`)
      }
      
      return {
        id: `scene_${slide.slideNumber}`,
        slideNumber: slide.slideNumber,
        templateId: mapping.templateId,
        duration: SceneTemplatesManager.calculateSceneDuration(slide, mapping.templateId),
        content: {
          title: slide.title,
          bullets: slide.bullets || [],
          images: slide.images || [],
          notes: slide.notes || ''
        },
        style: {
          ...template.config,
          ...mapping.customizations
        },
        animations: template.config.animations,
        voiceText: this.generateVoiceText(slide),
        status: 'pending' as const
      }
    })
  }
  
  /**
   * Generate voice text for TTS from slide content
   */
  private static generateVoiceText(slide: any): string {
    let voiceText = ''
    
    // Add title
    if (slide.title) {
      voiceText += slide.title + '. '
    }
    
    // Add bullets as natural speech
    if (slide.bullets && slide.bullets.length > 0) {
      slide.bullets.forEach((bullet: string, index: number) => {
        if (index === 0) {
          voiceText += 'Vamos ver os principais pontos: '
        }
        voiceText += bullet
        if (index < slide.bullets.length - 1) {
          voiceText += '. Próximo ponto: '
        } else {
          voiceText += '. '
        }
      })
    }
    
    // Add notes if available
    if (slide.notes && slide.notes.length > 0) {
      voiceText += slide.notes + ' '
    }
    
    return voiceText.trim()
  }
}
