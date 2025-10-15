
/**
 * 🎨 PPTX REAL GENERATOR - Sistema Completo de Geração PPTX
 * Substitui simulações por geração real usando PptxGenJS
 */

import PptxGenJS from 'pptxgenjs'
import { uploadFileToS3 } from './aws-s3-config'
import { prisma } from './prisma'

export interface SlideContent {
  title: string
  content: string
  backgroundType?: 'solid' | 'gradient' | 'image'
  backgroundColor?: string
  backgroundImage?: string
  layout?: 'title' | 'content' | 'twoContent' | 'comparison'
  animations?: {
    in: 'fadeIn' | 'slideIn' | 'zoomIn'
    out: 'fadeOut' | 'slideOut' | 'zoomOut'
  }
  duration?: number
  elements?: Array<{
    type: 'text' | 'image' | 'shape' | 'chart'
    content: any
    position: { x: number, y: number, w: number, h: number }
    style?: any
  }>
}

export interface PptxGenerationOptions {
  title: string
  slides: SlideContent[]
  template?: 'corporate' | 'educational' | 'safety' | 'custom'
  branding?: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
  }
  metadata?: {
    author: string
    company?: string
    subject?: string
  }
}

export class RealPptxGenerator {
  private pptx: PptxGenJS

  constructor() {
    this.pptx = new PptxGenJS()
    this.setupDefaultSettings()
  }

  private setupDefaultSettings() {
    // Configurações padrão para apresentações profissionais
    this.pptx.defineLayout({ name: 'HD', width: 10, height: 5.625 })
    this.pptx.layout = 'HD'
    this.pptx.rtlMode = false
  }

  /**
   * Gera PPTX completo com conteúdo real
   */
  async generateRealPptx(options: PptxGenerationOptions): Promise<{
    buffer: Buffer
    filename: string
    slideCount: number
  }> {
    console.log('🎨 Iniciando geração PPTX real:', options.title)

    // Aplicar template e branding
    this.applyTemplate(options.template || 'corporate', options.branding)

    // Gerar slides reais
    for (let i = 0; i < options.slides.length; i++) {
      const slideData = options.slides[i]
      await this.createRealSlide(slideData, i)
    }

    // Definir metadados
    if (options.metadata) {
      this.pptx.author = options.metadata.author
      this.pptx.company = options.metadata.company || ''
      this.pptx.subject = options.metadata.subject || options.title
    }

    // Gerar buffer do PPTX
    const pptxBuffer = await this.pptx.write({ outputType: 'nodebuffer' }) as Buffer
    const filename = `${this.sanitizeFilename(options.title)}_${Date.now()}.pptx`

    console.log('✅ PPTX real gerado:', filename, 'Slides:', options.slides.length)

    return {
      buffer: pptxBuffer,
      filename,
      slideCount: options.slides.length
    }
  }

  /**
   * Cria slide real com conteúdo formatado
   */
  private async createRealSlide(slideData: SlideContent, index: number) {
    const slide = this.pptx.addSlide()

    // Background
    this.applySlideBackground(slide, slideData)

    // Layout baseado no tipo
    switch (slideData.layout) {
      case 'title':
        this.createTitleSlide(slide, slideData)
        break
      case 'content':
        this.createContentSlide(slide, slideData)
        break
      case 'twoContent':
        this.createTwoContentSlide(slide, slideData)
        break
      case 'comparison':
        this.createComparisonSlide(slide, slideData)
        break
      default:
        this.createContentSlide(slide, slideData)
    }

    // Elementos adicionais
    if (slideData.elements) {
      await this.addCustomElements(slide, slideData.elements)
    }

    // Animações (simuladas via timing)
    this.addSlideAnimations(slide, slideData.animations)

    console.log(`✅ Slide ${index + 1} criado:`, slideData.title)
  }

  /**
   * Aplica template profissional
   */
  private applyTemplate(template: string, branding?: PptxGenerationOptions['branding']) {
    const templates = {
      corporate: {
        primaryColor: branding?.primaryColor || '0066CC',
        secondaryColor: branding?.secondaryColor || 'F0F0F0',
        fontFamily: branding?.fontFamily || 'Calibri',
        headerHeight: 0.5,
        footerHeight: 0.3
      },
      educational: {
        primaryColor: branding?.primaryColor || '4CAF50',
        secondaryColor: branding?.secondaryColor || 'E8F5E8',
        fontFamily: branding?.fontFamily || 'Arial',
        headerHeight: 0.6,
        footerHeight: 0.4
      },
      safety: {
        primaryColor: branding?.primaryColor || 'FF6B00',
        secondaryColor: branding?.secondaryColor || 'FFF3E0',
        fontFamily: branding?.fontFamily || 'Arial Black',
        headerHeight: 0.7,
        footerHeight: 0.3
      }
    }

    const config = templates[template as keyof typeof templates] || templates.corporate
    
    // Aplicar configurações do template
    this.pptx.theme = {
      headFontFace: config.fontFamily,
      bodyFontFace: config.fontFamily
    }
  }

  /**
   * Aplica background no slide
   */
  private applySlideBackground(slide: any, slideData: SlideContent) {
    if (slideData.backgroundType === 'gradient') {
      slide.background = {
        fill: {
          type: 'gradient',
          angle: 90,
          stops: [
            { position: 0, color: slideData.backgroundColor || '0066CC' },
            { position: 100, color: this.lightenColor(slideData.backgroundColor || '0066CC') }
          ]
        }
      }
    } else if (slideData.backgroundType === 'solid') {
      slide.background = { fill: slideData.backgroundColor || 'FFFFFF' }
    } else if (slideData.backgroundType === 'image' && slideData.backgroundImage) {
      slide.background = { path: slideData.backgroundImage, sizing: 'cover' }
    } else {
      slide.background = { fill: 'FFFFFF' }
    }
  }

  /**
   * Cria slide de título
   */
  private createTitleSlide(slide: any, slideData: SlideContent) {
    // Título principal
    slide.addText(slideData.title, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 1.5,
      fontSize: 44,
      bold: true,
      fontFace: 'Calibri',
      color: '333333',
      align: 'center'
    })

    // Subtítulo/conteúdo
    slide.addText(slideData.content, {
      x: 0.5,
      y: 3.2,
      w: 9,
      h: 1,
      fontSize: 24,
      fontFace: 'Calibri',
      color: '666666',
      align: 'center'
    })
  }

  /**
   * Cria slide de conteúdo
   */
  private createContentSlide(slide: any, slideData: SlideContent) {
    // Título
    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 32,
      bold: true,
      fontFace: 'Calibri',
      color: '333333'
    })

    // Conteúdo formatado
    const contentLines = slideData.content.split('\n')
    contentLines.forEach((line, index) => {
      if (line.trim()) {
        slide.addText(`• ${line.trim()}`, {
          x: 1,
          y: 1.5 + (index * 0.4),
          w: 8,
          h: 0.4,
          fontSize: 18,
          fontFace: 'Calibri',
          color: '444444'
        })
      }
    })
  }

  /**
   * Cria slide com duas colunas
   */
  private createTwoContentSlide(slide: any, slideData: SlideContent) {
    // Título
    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      fontFace: 'Calibri',
      color: '333333'
    })

    const contentParts = slideData.content.split('|')
    
    // Coluna esquerda
    slide.addText(contentParts[0] || '', {
      x: 0.5,
      y: 1.5,
      w: 4.5,
      h: 3.5,
      fontSize: 16,
      fontFace: 'Calibri',
      color: '444444'
    })

    // Coluna direita
    slide.addText(contentParts[1] || '', {
      x: 5.2,
      y: 1.5,
      w: 4.5,
      h: 3.5,
      fontSize: 16,
      fontFace: 'Calibri',
      color: '444444'
    })
  }

  /**
   * Cria slide de comparação
   */
  private createComparisonSlide(slide: any, slideData: SlideContent) {
    // Título
    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      fontFace: 'Calibri',
      color: '333333'
    })

    // Caixas de comparação
    const contentParts = slideData.content.split('vs')
    
    // Lado A
    slide.addShape('rect', {
      x: 0.5,
      y: 1.2,
      w: 4,
      h: 3.5,
      fill: { color: 'E3F2FD' },
      line: { color: '2196F3', width: 2 }
    })
    
    slide.addText('ANTES', {
      x: 0.5,
      y: 1.4,
      w: 4,
      h: 0.5,
      fontSize: 16,
      bold: true,
      align: 'center',
      color: '2196F3'
    })
    
    slide.addText(contentParts[0] || '', {
      x: 0.7,
      y: 2,
      w: 3.6,
      h: 2.5,
      fontSize: 14,
      color: '333333'
    })

    // Lado B
    slide.addShape('rect', {
      x: 5.5,
      y: 1.2,
      w: 4,
      h: 3.5,
      fill: { color: 'E8F5E8' },
      line: { color: '4CAF50', width: 2 }
    })
    
    slide.addText('DEPOIS', {
      x: 5.5,
      y: 1.4,
      w: 4,
      h: 0.5,
      fontSize: 16,
      bold: true,
      align: 'center',
      color: '4CAF50'
    })
    
    slide.addText(contentParts[1] || '', {
      x: 5.7,
      y: 2,
      w: 3.6,
      h: 2.5,
      fontSize: 14,
      color: '333333'
    })
  }

  /**
   * Adiciona elementos customizados
   */
  private async addCustomElements(slide: any, elements: SlideContent['elements']) {
    if (!elements) return

    for (const element of elements) {
      switch (element.type) {
        case 'text':
          slide.addText(element.content, {
            x: element.position.x,
            y: element.position.y,
            w: element.position.w,
            h: element.position.h,
            ...element.style
          })
          break
        case 'shape':
          slide.addShape(element.content.shape, {
            x: element.position.x,
            y: element.position.y,
            w: element.position.w,
            h: element.position.h,
            ...element.style
          })
          break
        case 'chart':
          slide.addChart('bar', element.content.data, {
            x: element.position.x,
            y: element.position.y,
            w: element.position.w,
            h: element.position.h,
            ...element.style
          })
          break
      }
    }
  }

  /**
   * Adiciona metadados de animação
   */
  private addSlideAnimations(slide: any, animations?: SlideContent['animations']) {
    if (animations) {
      // Simulado via timing - em versão futura pode usar XML animations
      slide._animations = animations
    }
  }

  /**
   * Utilitários
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9\-_\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
  }

  private lightenColor(color: string): string {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, (num >> 16) + 40)
    const g = Math.min(255, ((num >> 8) & 0x00FF) + 40)
    const b = Math.min(255, (num & 0x0000FF) + 40)
    return `${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }
}

/**
 * Função principal para geração completa de PPTX
 */
export async function generateRealPptxFromProject(
  projectId: string,
  customOptions?: Partial<PptxGenerationOptions>
): Promise<{
  success: boolean
  pptxUrl?: string
  error?: string
  metadata: {
    filename: string
    slideCount: number
    fileSize: number
  }
}> {
  try {
    console.log('🎨 Iniciando geração PPTX real para projeto:', projectId)

    // Buscar dados do projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        slides: {
          orderBy: { slideNumber: 'asc' }
        }
      }
    })

    if (!project) {
      throw new Error('Projeto não encontrado')
    }

    // Converter slides do banco para formato do gerador
    const slides: SlideContent[] = project.slides.map(slide => ({
      title: slide.title,
      content: slide.content,
      backgroundType: slide.backgroundType as any,
      backgroundColor: slide.backgroundColor || undefined,
      backgroundImage: slide.backgroundImage || undefined,
      layout: 'content',
      duration: slide.duration,
      animations: {
        in: slide.animationIn as any || 'fadeIn',
        out: slide.animationOut as any || 'fadeOut'
      },
      elements: slide.elements as any
    }))

    // Opções de geração
    const options: PptxGenerationOptions = {
      title: project.name,
      slides,
      template: customOptions?.template || 'corporate',
      branding: customOptions?.branding || {
        primaryColor: '#0066CC',
        secondaryColor: '#F0F0F0',
        fontFamily: 'Calibri'
      },
      metadata: {
        author: 'Estúdio IA de Vídeos',
        company: 'Sistema de Criação de Conteúdo',
        subject: project.description || project.name
      }
    }

    // Gerar PPTX
    const generator = new RealPptxGenerator()
    const result = await generator.generateRealPptx(options)

    // Upload para S3
    const s3Key = await uploadFileToS3(
      new File([result.buffer], result.filename),
      result.filename
    )

    // Atualizar projeto com URL do PPTX gerado
    await prisma.project.update({
      where: { id: projectId },
      data: {
        pptxUrl: s3Key,
        status: 'COMPLETED',
        processingLog: {
          ...(project.processingLog as any) || {},
          pptxGenerated: true,
          pptxUrl: s3Key,
          slideCount: result.slideCount,
          generatedAt: new Date().toISOString()
        }
      }
    })

    console.log('✅ PPTX real gerado e salvo:', s3Key)

    return {
      success: true,
      pptxUrl: s3Key,
      metadata: {
        filename: result.filename,
        slideCount: result.slideCount,
        fileSize: result.buffer.length
      }
    }

  } catch (error) {
    console.error('❌ Erro na geração PPTX real:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      metadata: {
        filename: '',
        slideCount: 0,
        fileSize: 0
      }
    }
  }
}
