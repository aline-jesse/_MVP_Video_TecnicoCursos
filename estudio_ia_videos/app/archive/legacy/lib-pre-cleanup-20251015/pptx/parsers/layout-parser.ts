/**
 * 📐 Layout Parser - Detecção inteligente de layouts de slides
 * FASE 1: PPTX Processing Real
 */

import JSZip from 'jszip'
import { parseStringPromise } from 'xml2js'
import { PPTXLayoutType, SlideLayout, LayoutPlaceholder, PlaceholderType } from '../types/slide-types'

export interface LayoutDetectionResult {
  success: boolean
  layout: SlideLayout
  confidence: number
  detectedElements: LayoutElement[]
  elements: LayoutElement[] // Alias para compatibilidade com testes
  warnings: string[]
  error?: string // Para casos de erro
}

export interface LayoutElement {
  type: 'text' | 'image' | 'chart' | 'table' | 'shape' | 'media'
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  content?: string
  placeholder?: PlaceholderType
}

export interface LayoutAnalysis {
  totalElements: number
  textElements: number
  imageElements: number
  chartElements: number
  tableElements: number
  shapeElements: number
  mediaElements: number
  hasTitle: boolean
  hasSubtitle: boolean
  hasContent: boolean
  hasImages: boolean
  hasCharts: boolean
  hasTables: boolean
  contentDistribution: 'top' | 'center' | 'bottom' | 'left' | 'right' | 'distributed'
}

export class PPTXLayoutParser {
  private static readonly LAYOUT_PATTERNS = {
    TITLE_SLIDE: {
      minTitleElements: 1,
      maxContentElements: 2,
      allowImages: false,
      titlePosition: 'center'
    },
    TITLE_AND_CONTENT: {
      minTitleElements: 1,
      minContentElements: 1,
      allowImages: true,
      titlePosition: 'top'
    },
    TWO_CONTENT: {
      minContentElements: 2,
      allowImages: true,
      contentLayout: 'side-by-side'
    },
    COMPARISON: {
      minContentElements: 2,
      requiresSymmetry: true,
      allowImages: true
    },
    CONTENT_WITH_CAPTION: {
      minContentElements: 1,
      requiresCaption: true,
      allowImages: true
    },
    BLANK: {
      maxElements: 0
    },
    PICTURE_WITH_CAPTION: {
      minImageElements: 1,
      requiresCaption: true
    },
    SECTION_HEADER: {
      minTitleElements: 1,
      maxContentElements: 1,
      titleStyle: 'large'
    }
  }

  /**
   * Detecta o layout de um slide
   */
  static async detectLayout(
    zip: JSZip,
    slideXmlPath: string,
    slideIndex: number
  ): Promise<LayoutDetectionResult> {
    try {
      console.log(`📐 Detectando layout do slide ${slideIndex}: ${slideXmlPath}`)
      
      const slideFile = zip.file(slideXmlPath)
      if (!slideFile) {
        return {
          success: false,
          layout: this.createDefaultLayout(),
          confidence: 0,
          detectedElements: [],
          elements: [],
          warnings: [`Arquivo de slide não encontrado: ${slideXmlPath}`],
          error: `Slide ${slideIndex} não encontrado`
        }
      }

      const slideXml = await slideFile.async('text')
      const slideData = await parseStringPromise(slideXml)
      
      // Extrair elementos do slide
      const elements = await this.extractLayoutElements(slideData)
      
      // Analisar distribuição de conteúdo
      const analysis = this.analyzeSlideContent(elements)
      
      // Detectar tipo de layout
      const layoutType = this.detectLayoutType(analysis, elements)
      
      // Calcular confiança da detecção
      const confidence = this.calculateConfidence(layoutType, analysis, elements)
      
      // Criar objeto de layout
      const layout = this.createSlideLayout(layoutType, elements, analysis)
      
      console.log(`✅ Layout detectado: ${layoutType} (confiança: ${Math.round(confidence * 100)}%)`)
      
      return {
        success: true,
        layout,
        confidence,
        detectedElements: elements,
        elements: elements, // Alias para compatibilidade
        warnings: []
      }
    } catch (error) {
      console.error('❌ Erro na detecção de layout:', error)
      return {
        success: false,
        layout: this.createDefaultLayout(),
        confidence: 0,
        detectedElements: [],
        elements: [],
        warnings: [error instanceof Error ? error.message : 'Erro desconhecido'],
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Extrai elementos de layout do XML do slide
   */
  private static async extractLayoutElements(slideData: any): Promise<LayoutElement[]> {
    const elements: LayoutElement[] = []
    
    try {
      const slide = slideData['p:sld']
      if (!slide || !slide['p:cSld'] || !slide['p:cSld'][0] || !slide['p:cSld'][0]['p:spTree']) {
        return elements
      }

      const spTree = slide['p:cSld'][0]['p:spTree'][0]
      
      // Processar shapes (formas)
      if (spTree['p:sp']) {
        for (const shape of spTree['p:sp']) {
          const element = this.parseShapeElement(shape)
          if (element) {
            elements.push(element)
          }
        }
      }

      // Processar pictures (imagens)
      if (spTree['p:pic']) {
        for (const pic of spTree['p:pic']) {
          const element = this.parsePictureElement(pic)
          if (element) {
            elements.push(element)
          }
        }
      }

      // Processar gráficos
      if (spTree['p:graphicFrame']) {
        for (const frame of spTree['p:graphicFrame']) {
          const element = this.parseGraphicElement(frame)
          if (element) {
            elements.push(element)
          }
        }
      }

      // Processar grupos
      if (spTree['p:grpSp']) {
        for (const group of spTree['p:grpSp']) {
          const groupElements = await this.parseGroupElements(group)
          elements.push(...groupElements)
        }
      }
    } catch (error) {
      console.warn('Erro ao extrair elementos de layout:', error)
    }

    return elements
  }

  /**
   * Analisa um elemento shape
   */
  private static parseShapeElement(shape: any): LayoutElement | null {
    try {
      const nvSpPr = shape['p:nvSpPr']?.[0]
      const spPr = shape['p:spPr']?.[0]
      const txBody = shape['p:txBody']?.[0]

      // Obter posição e tamanho
      const position = this.extractPosition(spPr)
      
      // Determinar tipo baseado no conteúdo
      let type: LayoutElement['type'] = 'shape'
      let content = ''
      let placeholder: PlaceholderType | undefined

      // Verificar se é placeholder
      if (nvSpPr?.['p:nvPr']?.[0]?.['p:ph']) {
        const ph = nvSpPr['p:nvPr'][0]['p:ph'][0]
        placeholder = this.mapPlaceholderType(ph['$']?.type)
        
        if (placeholder === 'title' || placeholder === 'subtitle') {
          type = 'text'
        }
      }

      // Extrair texto se houver
      if (txBody) {
        content = this.extractTextContent(txBody)
        if (content.trim()) {
          type = 'text'
        }
      }

      return {
        type,
        position,
        content: content || undefined,
        placeholder
      }
    } catch (error) {
      console.warn('Erro ao analisar shape:', error)
      return null
    }
  }

  /**
   * Analisa um elemento picture
   */
  private static parsePictureElement(pic: any): LayoutElement | null {
    try {
      const spPr = pic['p:spPr']?.[0]
      const position = this.extractPosition(spPr)

      return {
        type: 'image',
        position
      }
    } catch (error) {
      console.warn('Erro ao analisar picture:', error)
      return null
    }
  }

  /**
   * Analisa um elemento gráfico (chart, table, etc.)
   */
  private static parseGraphicElement(frame: any): LayoutElement | null {
    try {
      const spPr = frame['p:spPr']?.[0]
      const position = this.extractPosition(spPr)
      
      // Determinar tipo baseado no conteúdo gráfico
      const graphic = frame['a:graphic']?.[0]?.['a:graphicData']?.[0]
      let type: LayoutElement['type'] = 'shape'

      if (graphic) {
        const uri = graphic['$']?.uri
        if (uri?.includes('chart')) {
          type = 'chart'
        } else if (uri?.includes('table')) {
          type = 'table'
        }
      }

      return {
        type,
        position
      }
    } catch (error) {
      console.warn('Erro ao analisar elemento gráfico:', error)
      return null
    }
  }

  /**
   * Analisa elementos de grupo
   */
  private static async parseGroupElements(group: any): Promise<LayoutElement[]> {
    const elements: LayoutElement[] = []
    
    try {
      // Processar shapes dentro do grupo
      if (group['p:sp']) {
        for (const shape of group['p:sp']) {
          const element = this.parseShapeElement(shape)
          if (element) {
            elements.push(element)
          }
        }
      }

      // Processar pictures dentro do grupo
      if (group['p:pic']) {
        for (const pic of group['p:pic']) {
          const element = this.parsePictureElement(pic)
          if (element) {
            elements.push(element)
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao analisar grupo:', error)
    }

    return elements
  }

  /**
   * Extrai posição e tamanho de um elemento
   */
  private static extractPosition(spPr: any): LayoutElement['position'] {
    const defaultPosition = { x: 0, y: 0, width: 0, height: 0 }
    
    try {
      const xfrm = spPr?.['a:xfrm']?.[0]
      if (!xfrm) return defaultPosition

      const off = xfrm['a:off']?.[0]?.['$']
      const ext = xfrm['a:ext']?.[0]?.['$']

      return {
        x: parseInt(off?.x || '0'),
        y: parseInt(off?.y || '0'),
        width: parseInt(ext?.cx || '0'),
        height: parseInt(ext?.cy || '0')
      }
    } catch (error) {
      return defaultPosition
    }
  }

  /**
   * Extrai conteúdo de texto
   */
  private static extractTextContent(txBody: any): string {
    try {
      let text = ''
      
      if (txBody['a:p']) {
        for (const paragraph of txBody['a:p']) {
          if (paragraph['a:r']) {
            for (const run of paragraph['a:r']) {
              if (run['a:t']) {
                text += run['a:t'].join(' ')
              }
            }
          }
          text += '\n'
        }
      }

      return text.trim()
    } catch (error) {
      return ''
    }
  }

  /**
   * Mapeia tipo de placeholder
   */
  private static mapPlaceholderType(type: string): PlaceholderType {
    const mapping: { [key: string]: PlaceholderType } = {
      'title': 'title',
      'subTitle': 'subtitle',
      'ctrTitle': 'title',
      'body': 'content',
      'obj': 'content',
      'pic': 'image',
      'chart': 'chart',
      'tbl': 'table',
      'media': 'media',
      'sldNum': 'slide-number',
      'dt': 'date',
      'ftr': 'footer',
      'hdr': 'header'
    }
    
    return mapping[type] || 'content'
  }

  /**
   * Analisa o conteúdo do slide
   */
  private static analyzeSlideContent(elements: LayoutElement[]): LayoutAnalysis {
    const analysis: LayoutAnalysis = {
      totalElements: elements.length,
      textElements: 0,
      imageElements: 0,
      chartElements: 0,
      tableElements: 0,
      shapeElements: 0,
      mediaElements: 0,
      hasTitle: false,
      hasSubtitle: false,
      hasContent: false,
      hasImages: false,
      hasCharts: false,
      hasTables: false,
      contentDistribution: 'center'
    }

    for (const element of elements) {
      switch (element.type) {
        case 'text':
          analysis.textElements++
          if (element.placeholder === 'title') {
            analysis.hasTitle = true
          } else if (element.placeholder === 'subtitle') {
            analysis.hasSubtitle = true
          } else {
            analysis.hasContent = true
          }
          break
        case 'image':
          analysis.imageElements++
          analysis.hasImages = true
          break
        case 'chart':
          analysis.chartElements++
          analysis.hasCharts = true
          break
        case 'table':
          analysis.tableElements++
          analysis.hasTables = true
          break
        case 'media':
          analysis.mediaElements++
          break
        case 'shape':
          analysis.shapeElements++
          break
      }
    }

    // Determinar distribuição de conteúdo
    analysis.contentDistribution = this.analyzeContentDistribution(elements)

    return analysis
  }

  /**
   * Analisa a distribuição espacial do conteúdo
   */
  private static analyzeContentDistribution(elements: LayoutElement[]): LayoutAnalysis['contentDistribution'] {
    if (elements.length === 0) return 'center'

    const positions = elements.map(e => e.position)
    const avgY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length
    const avgX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length
    
    // Valores aproximados baseados em coordenadas típicas do PowerPoint
    const slideHeight = 6858000 // EMUs típicos
    const slideWidth = 9144000

    if (avgY < slideHeight * 0.3) return 'top'
    if (avgY > slideHeight * 0.7) return 'bottom'
    if (avgX < slideWidth * 0.3) return 'left'
    if (avgX > slideWidth * 0.7) return 'right'
    
    return 'center'
  }

  /**
   * Detecta o tipo de layout baseado na análise
   */
  private static detectLayoutType(analysis: LayoutAnalysis, elements: LayoutElement[]): PPTXLayoutType {
    // Slide em branco
    if (analysis.totalElements === 0) {
      return 'BLANK'
    }

    // Slide de título
    if (analysis.hasTitle && !analysis.hasContent && !analysis.hasImages && analysis.totalElements <= 2) {
      return 'TITLE_SLIDE'
    }

    // Slide de cabeçalho de seção
    if (analysis.hasTitle && analysis.textElements === 1 && !analysis.hasImages) {
      return 'SECTION_HEADER'
    }

    // Imagem com legenda
    if (analysis.hasImages && analysis.imageElements === 1 && analysis.textElements >= 1) {
      return 'PICTURE_WITH_CAPTION'
    }

    // Dois conteúdos lado a lado
    if (analysis.textElements >= 2 || (analysis.hasContent && analysis.hasImages)) {
      const contentElements = elements.filter(e => 
        e.type === 'text' && e.placeholder !== 'title' && e.placeholder !== 'subtitle'
      )
      
      if (contentElements.length >= 2) {
        // Verificar se estão lado a lado
        const leftElements = contentElements.filter(e => e.position.x < 4572000) // Metade da largura
        const rightElements = contentElements.filter(e => e.position.x >= 4572000)
        
        if (leftElements.length > 0 && rightElements.length > 0) {
          return 'TWO_CONTENT'
        }
      }
    }

    // Comparação (similar ao two content mas com simetria)
    if (analysis.hasContent && (analysis.hasImages || analysis.hasCharts)) {
      return 'COMPARISON'
    }

    // Conteúdo com legenda
    if (analysis.hasContent && (analysis.hasImages || analysis.hasCharts || analysis.hasTables)) {
      return 'CONTENT_WITH_CAPTION'
    }

    // Título e conteúdo (padrão)
    if (analysis.hasTitle || analysis.hasContent) {
      return 'TITLE_AND_CONTENT'
    }

    return 'TITLE_AND_CONTENT' // Fallback
  }

  /**
   * Calcula a confiança da detecção
   */
  private static calculateConfidence(
    layoutType: PPTXLayoutType,
    analysis: LayoutAnalysis,
    elements: LayoutElement[]
  ): number {
    let confidence = 0.5 // Base

    const pattern = this.LAYOUT_PATTERNS[layoutType]
    if (!pattern) return confidence

    // Verificar padrões específicos
    switch (layoutType) {
      case 'TITLE_SLIDE':
        if (analysis.hasTitle && !analysis.hasContent && !analysis.hasImages) {
          confidence = 0.9
        }
        break
      
      case 'TITLE_AND_CONTENT':
        if (analysis.hasTitle && analysis.hasContent) {
          confidence = 0.8
        } else if (analysis.hasContent) {
          confidence = 0.7
        }
        break
      
      case 'TWO_CONTENT':
        const contentElements = elements.filter(e => 
          e.type === 'text' && e.placeholder !== 'title'
        )
        if (contentElements.length >= 2) {
          confidence = 0.8
        }
        break
      
      case 'PICTURE_WITH_CAPTION':
        if (analysis.hasImages && analysis.hasContent) {
          confidence = 0.85
        }
        break
      
      case 'BLANK':
        if (analysis.totalElements === 0) {
          confidence = 1.0
        }
        break
      
      default:
        confidence = 0.6
    }

    return Math.min(confidence, 1.0)
  }

  /**
   * Cria objeto de layout
   */
  private static createSlideLayout(
    layoutType: PPTXLayoutType,
    elements: LayoutElement[],
    analysis: LayoutAnalysis
  ): SlideLayout {
    const placeholders: LayoutPlaceholder[] = []
    
    // Criar placeholders baseados nos elementos detectados
    for (const element of elements) {
      if (element.placeholder) {
        placeholders.push({
          type: element.placeholder,
          position: {
            x: element.position.x,
            y: element.position.y,
            width: element.position.width,
            height: element.position.height
          },
          required: element.placeholder === 'title',
          content: element.content
        })
      }
    }

    return {
      type: layoutType,
      name: this.getLayoutName(layoutType),
      placeholders,
      metadata: {
        totalElements: analysis.totalElements,
        hasTitle: analysis.hasTitle,
        hasContent: analysis.hasContent,
        hasImages: analysis.hasImages,
        contentDistribution: analysis.contentDistribution
      }
    }
  }

  /**
   * Obtém nome amigável do layout
   */
  private static getLayoutName(layoutType: PPTXLayoutType): string {
    const names: { [key in PPTXLayoutType]: string } = {
      'TITLE_SLIDE': 'Slide de Título',
      'TITLE_AND_CONTENT': 'Título e Conteúdo',
      'TWO_CONTENT': 'Dois Conteúdos',
      'COMPARISON': 'Comparação',
      'CONTENT_WITH_CAPTION': 'Conteúdo com Legenda',
      'BLANK': 'Slide em Branco',
      'PICTURE_WITH_CAPTION': 'Imagem com Legenda',
      'SECTION_HEADER': 'Cabeçalho de Seção'
    }
    
    return names[layoutType]
  }

  /**
   * Cria layout padrão
   */
  private static createDefaultLayout(): SlideLayout {
    return {
      type: 'TITLE_AND_CONTENT',
      name: 'Título e Conteúdo',
      placeholders: [],
      metadata: {
        totalElements: 0,
        hasTitle: false,
        hasContent: false,
        hasImages: false,
        contentDistribution: 'center'
      }
    }
  }

  /**
   * Método público para detectar layout de slide (usado nos testes)
   */
  static async detectSlideLayout(zip: JSZip, slideIndex: number): Promise<LayoutDetectionResult> {
    const slideXmlPath = `ppt/slides/slide${slideIndex}.xml`
    return this.detectLayout(zip, slideXmlPath, slideIndex)
  }
}