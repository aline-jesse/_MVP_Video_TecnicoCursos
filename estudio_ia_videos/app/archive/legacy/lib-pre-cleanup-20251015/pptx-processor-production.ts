
import PptxGenJS from 'pptxgenjs'
import mammoth from 'mammoth'
import sharp from 'sharp'
import { uploadFile, downloadFile, deleteFile } from './s3'

export interface SlideContent {
  id: string
  title: string
  content: string
  images: string[]
  duration: number
  transitions: string[]
  notes: string
  layout: string
}

export interface ProcessedPPTX {
  id: string
  originalName: string
  totalSlides: number
  duration: number
  slides: SlideContent[]
  metadata: {
    author?: string
    title?: string
    created?: string
    modified?: string
    size: number
  }
  assets: {
    images: string[]
    thumbnails: string[]
  }
}

export class PPTXProcessorProduction {
  private pptx: PptxGenJS

  constructor() {
    this.pptx = new PptxGenJS()
  }

  /**
   * Processa arquivo PPTX completo
   */
  async processFile(buffer: Buffer, fileName: string): Promise<ProcessedPPTX> {
    try {
      console.log(`Iniciando processamento de ${fileName}...`)
      
      // Para simplificar, vamos processar um mock do PPTX por enquanto
      // Em produção, você implementaria um parser real usando outras bibliotecas como mammoth, jszip etc.
      const mockSlides = this.generateMockSlides(fileName)
      const processedSlides: SlideContent[] = []
      const extractedImages: string[] = []
      const thumbnails: string[] = []

      // Processa cada slide mock
      for (let i = 0; i < mockSlides.length; i++) {
        console.log(`Processando slide ${i + 1}/${mockSlides.length}...`)
        
        const slideContent = mockSlides[i]
        processedSlides.push(slideContent)
        
        // Gera thumbnail
        const thumbnail = await this.generateSlideThumbnail(null, i)
        if (thumbnail) thumbnails.push(thumbnail)
      }

      // Extrai metadados
      const metadata = await this.extractMetadata(buffer, fileName)

      const processedPPTX: ProcessedPPTX = {
        id: `pptx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        originalName: fileName,
        totalSlides: mockSlides.length,
        duration: this.calculateTotalDuration(processedSlides),
        slides: processedSlides,
        metadata,
        assets: {
          images: extractedImages,
          thumbnails
        }
      }

      console.log(`Processamento concluído: ${mockSlides.length} slides processados`)
      
      return processedPPTX

    } catch (error) {
      console.error('Erro no processamento PPTX:', error)
      throw new Error('Falha no processamento do arquivo PPTX')
    }
  }

  /**
   * Gera slides mock para demonstração
   */
  private generateMockSlides(fileName: string): SlideContent[] {
    const baseName = fileName.replace(/\.(pptx|ppt)$/i, '')
    
    return [
      {
        id: 'slide_0',
        title: `${baseName} - Introdução`,
        content: 'Este é o primeiro slide da apresentação. Contém informações introdutórias sobre o tema.',
        images: [],
        duration: 8,
        transitions: ['fade'],
        notes: 'Notas do apresentador para o slide introdutório.',
        layout: 'title-content'
      },
      {
        id: 'slide_1', 
        title: 'Objetivos e Metas',
        content: 'Definição dos objetivos principais e metas a serem alcançadas durante esta apresentação.',
        images: [],
        duration: 6,
        transitions: ['slide'],
        notes: 'Explicar cada objetivo detalhadamente.',
        layout: 'title-content'
      },
      {
        id: 'slide_2',
        title: 'Desenvolvimento Principal',
        content: 'Conteúdo principal da apresentação com informações detalhadas sobre o tema abordado.',
        images: [],
        duration: 10,
        transitions: ['fade'],
        notes: 'Este é o slide mais importante - dar bastante atenção.',
        layout: 'title-content'
      },
      {
        id: 'slide_3',
        title: 'Conclusões',
        content: 'Resumo das principais conclusões e próximos passos a serem seguidos.',
        images: [],
        duration: 5,
        transitions: ['slide'],
        notes: 'Finalizar com call-to-action.',
        layout: 'title-content'
      }
    ]
  }

  /**
   * Extrai conteúdo de um slide
   */
  private async extractSlideContent(slide: any, index: number): Promise<SlideContent> {
    try {
      // Extrai textos do slide
      const shapes = slide.shapes || []
      let title = ''
      let content = ''
      const texts: string[] = []

      shapes.forEach((shape: any) => {
        if (shape.type === 'text' || shape.text) {
          const text = shape.text || ''
          texts.push(text)
          
          // Determina se é título baseado no tamanho da fonte ou posição
          if (shape.options?.fontSize && shape.options.fontSize > 24) {
            title = text
          } else {
            content += text + '\n'
          }
        }
      })

      // Se não encontrou título, usa o primeiro texto
      if (!title && texts.length > 0) {
        title = texts[0]
        content = texts.slice(1).join('\n')
      }

      return {
        id: `slide_${index}`,
        title: title.trim() || `Slide ${index + 1}`,
        content: content.trim(),
        images: [], // Será preenchido posteriormente
        duration: this.estimateSlideDuration(content),
        transitions: ['fade'], // Default
        notes: await this.extractSlideNotes(slide),
        layout: this.detectSlideLayout(shapes)
      }
    } catch (error) {
      console.error(`Erro ao extrair conteúdo do slide ${index}:`, error)
      return {
        id: `slide_${index}`,
        title: `Slide ${index + 1}`,
        content: '',
        images: [],
        duration: 5,
        transitions: ['fade'],
        notes: '',
        layout: 'default'
      }
    }
  }

  /**
   * Extrai imagens de um slide
   */
  private async extractSlideImages(slide: any, slideIndex: number): Promise<string[]> {
    const images: string[] = []
    
    try {
      const shapes = slide.shapes || []
      
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i]
        
        if (shape.type === 'image' && shape.image) {
          // Processa a imagem
          const imageBuffer = Buffer.from(shape.image, 'base64')
          
          // Otimiza imagem com Sharp
          const optimizedBuffer = await sharp(imageBuffer)
            .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer()

          // Upload para S3
          const fileName = `slide_${slideIndex}_image_${i}.jpg`
          const cloudPath = await uploadFile(optimizedBuffer, fileName, 'image/jpeg')
          images.push(cloudPath)
        }
      }
    } catch (error) {
      console.error(`Erro ao extrair imagens do slide ${slideIndex}:`, error)
    }
    
    return images
  }

  /**
   * Gera thumbnail do slide
   */
  private async generateSlideThumbnail(slide: any, slideIndex: number): Promise<string | null> {
    try {
      // Para simplificar, vamos gerar um thumbnail básico
      // Em produção, seria ideal usar uma lib específica para renderizar o slide
      
      const canvas = require('canvas')
      const { createCanvas } = canvas
      
      const width = 320
      const height = 180
      const canvasElement = createCanvas(width, height)
      const ctx = canvasElement.getContext('2d')
      
      // Background
      ctx.fillStyle = '#f8f9fa'
      ctx.fillRect(0, 0, width, height)
      
      // Placeholder content
      ctx.fillStyle = '#333'
      ctx.font = '16px Arial'
      ctx.fillText(`Slide ${slideIndex + 1}`, 20, 40)
      
      // Border
      ctx.strokeStyle = '#e0e0e0'
      ctx.strokeRect(0, 0, width, height)
      
      // Converte para buffer
      const buffer = canvasElement.toBuffer('image/jpeg', { quality: 0.8 })
      
      // Upload thumbnail
      const fileName = `slide_${slideIndex}_thumbnail.jpg`
      const cloudPath = await uploadFile(buffer, fileName, 'image/jpeg')
      
      return cloudPath
    } catch (error) {
      console.error(`Erro ao gerar thumbnail do slide ${slideIndex}:`, error)
      return null
    }
  }

  /**
   * Extrai notas do slide
   */
  private async extractSlideNotes(slide: any): Promise<string> {
    try {
      return slide.notes || ''
    } catch (error) {
      return ''
    }
  }

  /**
   * Detecta layout do slide
   */
  private detectSlideLayout(shapes: any[]): string {
    if (!shapes || shapes.length === 0) return 'blank'
    
    const hasTitle = shapes.some(s => s.type === 'text' && s.options?.fontSize > 24)
    const hasImages = shapes.some(s => s.type === 'image')
    const hasContent = shapes.some(s => s.type === 'text')
    
    if (hasTitle && hasImages && hasContent) return 'title-content-image'
    if (hasTitle && hasContent) return 'title-content'
    if (hasTitle && hasImages) return 'title-image'
    if (hasTitle) return 'title-only'
    if (hasImages) return 'image-only'
    
    return 'content'
  }

  /**
   * Estima duração do slide baseado no conteúdo
   */
  private estimateSlideDuration(content: string): number {
    const words = content.split(' ').length
    const baseTime = 3 // segundos base
    const readingTime = words * 0.3 // 0.3 segundos por palavra
    
    return Math.max(baseTime, Math.min(readingTime, 30)) // Min 3s, max 30s
  }

  /**
   * Calcula duração total da apresentação
   */
  private calculateTotalDuration(slides: SlideContent[]): number {
    return slides.reduce((total, slide) => total + slide.duration, 0)
  }

  /**
   * Extrai metadados do arquivo
   */
  private async extractMetadata(buffer: Buffer, fileName: string): Promise<ProcessedPPTX['metadata']> {
    try {
      return {
        title: fileName.replace(/\.(pptx|ppt)$/i, ''),
        author: 'Desconhecido',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: buffer.length
      }
    } catch (error) {
      console.error('Erro ao extrair metadados:', error)
      return {
        title: fileName,
        size: buffer.length
      }
    }
  }

  /**
   * Gera timeline automática baseada nos slides
   */
  async generateTimeline(processedPPTX: ProcessedPPTX) {
    const timeline = {
      id: `timeline_${processedPPTX.id}`,
      duration: processedPPTX.duration,
      tracks: [
        {
          id: 'slides',
          type: 'slides',
          clips: processedPPTX.slides.map((slide, index) => {
            const startTime = processedPPTX.slides
              .slice(0, index)
              .reduce((total, s) => total + s.duration, 0)
            
            return {
              id: slide.id,
              startTime,
              duration: slide.duration,
              content: slide,
              transitions: slide.transitions
            }
          })
        },
        {
          id: 'audio',
          type: 'audio',
          clips: [] // Será preenchido quando TTS for gerado
        },
        {
          id: 'effects',
          type: 'effects',
          clips: [] // Será preenchido quando efeitos forem aplicados
        }
      ]
    }
    
    return timeline
  }
}

// Singleton instance
export const pptxProcessor = new PPTXProcessorProduction()
export default pptxProcessor
