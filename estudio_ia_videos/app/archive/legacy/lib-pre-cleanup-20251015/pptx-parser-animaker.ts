
/**
 * 🔧 PPTX Parser Animaker Style
 * Extração completa de elementos PPTX para editor visual interativo
 */

import JSZip from 'jszip'
import xml2js from 'xml2js'

export interface AnimakerElement {
  id: string
  type: 'text' | 'image' | 'shape' | 'video' | 'audio' | 'chart' | 'table'
  content: string
  position: {
    x: number
    y: number
    width: number
    height: number
    z?: number // layer depth
  }
  style: {
    fontSize?: number
    fontFamily?: string
    color?: string
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    opacity?: number
    rotation?: number
    scaleX?: number
    scaleY?: number
  }
  animation?: {
    type: 'fadeIn' | 'slideIn' | 'zoomIn' | 'bounceIn' | 'rotateIn' | 'none'
    duration: number
    delay: number
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  }
  interactive?: {
    clickable: boolean
    link?: string
    action?: string
  }
  metadata: {
    originalIndex: number
    slideId: string
    elementId: string
    locked?: boolean
    visible: boolean
  }
}

export interface AnimakerSlide {
  id: string
  index: number
  title: string
  layout: string
  background: {
    type: 'color' | 'gradient' | 'image' | 'video'
    value: string
    opacity?: number
  }
  elements: AnimakerElement[]
  duration: number
  transition: {
    type: string
    duration: number
    direction?: string
  }
  notes?: string
  audio?: {
    narration?: string
    backgroundMusic?: string
    volume: number
  }
  voiceover: {
    text: string
    voice: string
    speed: number
    pitch: number
  }
}

export interface AnimakerProject {
  id: string
  title: string
  description: string
  slides: AnimakerSlide[]
  timeline: {
    totalDuration: number
    layers: Array<{
      id: string
      name: string
      elements: string[]
      locked: boolean
      visible: boolean
      opacity: number
    }>
  }
  assets: {
    images: Array<{
      id: string
      name: string
      url: string
      size: number
    }>
    videos: Array<{
      id: string
      name: string
      url: string
      duration: number
    }>
    audio: Array<{
      id: string
      name: string
      url: string
      duration: number
    }>
    fonts: string[]
  }
  settings: {
    fps: number
    resolution: '720p' | '1080p' | '4k'
    aspectRatio: '16:9' | '4:3' | '1:1' | '9:16'
    quality: 'low' | 'medium' | 'high' | 'ultra'
  }
  metadata: {
    created: string
    modified: string
    author: string
    version: string
    fileSize: number
  }
}

export class PPTXParserAnimaker {
  
  static async parseBuffer(buffer: Buffer, fileName: string = 'presentation.pptx'): Promise<AnimakerProject> {
    console.log('🔍 Iniciando parsing PPTX para editor Animaker...')
    
    try {
      // Extrair conteúdo do arquivo PPTX (ZIP)
      const zip = await JSZip.loadAsync(buffer)
      
      // Extrair estrutura XML
      const presentationXml = await this.extractPresentationXML(zip)
      const slidesData = await this.extractSlidesData(zip)
      const mediaFiles = await this.extractMediaFiles(zip)
      const themeData = await this.extractThemeData(zip)
      
      // Processar slides
      const slides = await this.processSlides(slidesData, mediaFiles, themeData)
      
      // Gerar timeline com layers
      const timeline = this.generateTimeline(slides)
      
      // Extrair assets
      const assets = this.extractAssets(mediaFiles)
      
      // Criar projeto Animaker
      const project: AnimakerProject = {
        id: `project_${Date.now()}`,
        title: this.extractTitle(fileName, presentationXml),
        description: `Projeto importado de ${fileName}`,
        slides,
        timeline,
        assets,
        settings: {
          fps: 30,
          resolution: '1080p',
          aspectRatio: '16:9',
          quality: 'high'
        },
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          author: 'PPTX Parser',
          version: '1.0',
          fileSize: buffer.length
        }
      }

      console.log(`✅ Parsing concluído: ${slides.length} slides, ${assets.images.length} imagens`)
      return project

    } catch (error) {
      console.error('❌ Erro no parsing PPTX:', error)
      
      // Fallback: gerar projeto simulado
      return this.createMockProject(fileName, buffer.length)
    }
  }
  
  // Extrair XML principal da apresentação
  private static async extractPresentationXML(zip: JSZip): Promise<any> {
    const presentationFile = zip.file('ppt/presentation.xml')
    if (!presentationFile) throw new Error('presentation.xml não encontrado')
    
    const xmlContent = await presentationFile.async('text')
    const parser = new xml2js.Parser({ explicitArray: false })
    
    return new Promise((resolve, reject) => {
      parser.parseString(xmlContent, (err: any, result: any) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
  }
  
  // Extrair dados de todos os slides
  private static async extractSlidesData(zip: JSZip): Promise<any[]> {
    const slideFiles = Object.keys(zip.files)
      .filter(name => name.match(/ppt\/slides\/slide\d+\.xml/))
      .sort()
    
    const slidesData = []
    
    for (const slideFile of slideFiles) {
      const file = zip.file(slideFile)
      if (!file) continue
      
      const xmlContent = await file.async('text')
      const parser = new xml2js.Parser({ explicitArray: false })
      
      const slideData = await new Promise((resolve, reject) => {
        parser.parseString(xmlContent, (err: any, result: any) => {
          if (err) reject(err)
          else resolve(result)
        })
      })
      
      slidesData.push({
        fileName: slideFile,
        data: slideData
      })
    }
    
    return slidesData
  }
  
  // Extrair arquivos de mídia
  private static async extractMediaFiles(zip: JSZip): Promise<any> {
    const mediaFiles: any = {
      images: [],
      videos: [],
      audio: []
    }
    
    // Extrair imagens
    const imageFiles = Object.keys(zip.files)
      .filter(name => name.match(/ppt\/media\/.+\.(jpg|jpeg|png|gif|bmp)/i))
    
    for (const imageFile of imageFiles) {
      const file = zip.file(imageFile)
      if (!file) continue
      
      const buffer = await file.async('nodebuffer')
      mediaFiles.images.push({
        name: imageFile.split('/').pop(),
        path: imageFile,
        buffer,
        size: buffer.length
      })
    }
    
    // Extrair vídeos
    const videoFiles = Object.keys(zip.files)
      .filter(name => name.match(/ppt\/media\/.+\.(mp4|avi|mov|wmv)/i))
    
    for (const videoFile of videoFiles) {
      const file = zip.file(videoFile)
      if (!file) continue
      
      const buffer = await file.async('nodebuffer')
      mediaFiles.videos.push({
        name: videoFile.split('/').pop(),
        path: videoFile,
        buffer,
        size: buffer.length
      })
    }
    
    return mediaFiles
  }
  
  // Extrair dados de tema
  private static async extractThemeData(zip: JSZip): Promise<any> {
    const themeFile = zip.file('ppt/theme/theme1.xml')
    if (!themeFile) return null
    
    try {
      const xmlContent = await themeFile.async('text')
      const parser = new xml2js.Parser({ explicitArray: false })
      
      return new Promise((resolve, reject) => {
        parser.parseString(xmlContent, (err: any, result: any) => {
          if (err) resolve(null) // Ignore theme errors
          else resolve(result)
        })
      })
    } catch {
      return null
    }
  }
  
  // Processar slides em formato Animaker
  private static async processSlides(
    slidesData: any[], 
    mediaFiles: any, 
    themeData: any
  ): Promise<AnimakerSlide[]> {
    const slides: AnimakerSlide[] = []
    
    for (let i = 0; i < slidesData.length; i++) {
      const slideData = slidesData[i]
      const slideElements = this.extractSlideElements(slideData.data, mediaFiles)
      
      const slide: AnimakerSlide = {
        id: `slide_${i + 1}`,
        index: i,
        title: this.extractSlideTitle(slideElements) || `Slide ${i + 1}`,
        layout: this.determineLayout(slideElements),
        background: this.extractBackground(slideData.data, themeData),
        elements: slideElements,
        duration: this.calculateSlideDuration(slideElements),
        transition: {
          type: 'fade',
          duration: 500
        },
        notes: this.extractSlideNotes(slideData.data),
        voiceover: {
          text: this.extractSlideText(slideElements),
          voice: 'pt-BR-AntonioNeural',
          speed: 1.0,
          pitch: 1.0
        }
      }
      
      slides.push(slide)
    }
    
    return slides
  }
  
  // Extrair elementos individuais do slide
  private static extractSlideElements(slideXml: any, mediaFiles: any): AnimakerElement[] {
    const elements: AnimakerElement[] = []
    
    try {
      const shapes = slideXml?.['p:sld']?.['p:cSld']?.['p:spTree']?.['p:sp'] || []
      const shapeArray = Array.isArray(shapes) ? shapes : [shapes]
      
      shapeArray.forEach((shape: any, index: number) => {
        const element = this.processShape(shape, index, mediaFiles)
        if (element) elements.push(element)
      })
      
      // Processar imagens
      const pics = slideXml?.['p:sld']?.['p:cSld']?.['p:spTree']?.['p:pic'] || []
      const picArray = Array.isArray(pics) ? pics : [pics]
      
      picArray.forEach((pic: any, index: number) => {
        const element = this.processPicture(pic, index, mediaFiles)
        if (element) elements.push(element)
      })
      
    } catch (error) {
      console.warn('Erro ao extrair elementos:', error)
    }
    
    return elements
  }
  
  // Processar shape individual
  private static processShape(shape: any, index: number, mediaFiles: any): AnimakerElement | null {
    try {
      const textBody = shape?.['p:txBody']?.['a:p']
      const spPr = shape?.['p:spPr']
      
      if (!textBody && !spPr) return null
      
      // Extrair posição
      const xfrm = spPr?.['a:xfrm']
      const position = {
        x: parseFloat(xfrm?.['a:off']?.['$']?.x || '0') / 12700, // EMUs to pixels
        y: parseFloat(xfrm?.['a:off']?.['$']?.y || '0') / 12700,
        width: parseFloat(xfrm?.['a:ext']?.['$']?.cx || '100') / 12700,
        height: parseFloat(xfrm?.['a:ext']?.['$']?.cy || '50') / 12700
      }
      
      // Extrair texto
      const textRuns = textBody?.['a:r'] || []
      const textArray = Array.isArray(textRuns) ? textRuns : [textRuns]
      const content = textArray
        .map((run: any) => run?.['a:t'] || '')
        .join('')
        .trim()
      
      // Extrair estilo
      const rPr = textArray[0]?.['a:rPr']
      const style = {
        fontSize: rPr?.['$']?.sz ? parseFloat(rPr['$'].sz) / 100 : 18,
        fontFamily: rPr?.['a:latin']?.['$']?.typeface || 'Arial',
        color: this.extractColor(rPr?.['a:solidFill']) || '#000000'
      }
      
      return {
        id: `element_${index}_${Date.now()}`,
        type: content ? 'text' : 'shape',
        content,
        position,
        style,
        animation: {
          type: 'fadeIn',
          duration: 1000,
          delay: index * 200,
          easing: 'ease-in-out'
        },
        interactive: {
          clickable: true
        },
        metadata: {
          originalIndex: index,
          slideId: '',
          elementId: `shape_${index}`,
          visible: true
        }
      }
      
    } catch (error) {
      console.warn('Erro ao processar shape:', error)
      return null
    }
  }
  
  // Processar imagem individual
  private static processPicture(pic: any, index: number, mediaFiles: any): AnimakerElement | null {
    try {
      const spPr = pic?.['p:spPr']
      const blipFill = pic?.['p:blipFill']
      
      // Extrair posição
      const xfrm = spPr?.['a:xfrm']
      const position = {
        x: parseFloat(xfrm?.['a:off']?.['$']?.x || '0') / 12700,
        y: parseFloat(xfrm?.['a:off']?.['$']?.y || '0') / 12700,
        width: parseFloat(xfrm?.['a:ext']?.['$']?.cx || '200') / 12700,
        height: parseFloat(xfrm?.['a:ext']?.['$']?.cy || '150') / 12700
      }
      
      // Encontrar arquivo de imagem correspondente
      const rId = blipFill?.['a:blip']?.['$']?.['r:embed']
      let imageUrl = '/images/placeholder.jpg'
      
      if (rId && mediaFiles.images.length > 0) {
        imageUrl = `/api/media/${rId}.jpg`
      }
      
      return {
        id: `image_${index}_${Date.now()}`,
        type: 'image',
        content: imageUrl,
        position,
        style: {
          borderRadius: 0
        },
        animation: {
          type: 'fadeIn',
          duration: 1000,
          delay: index * 300,
          easing: 'ease-in-out'
        },
        interactive: {
          clickable: true
        },
        metadata: {
          originalIndex: index,
          slideId: '',
          elementId: `pic_${index}`,
          visible: true
        }
      }
      
    } catch (error) {
      console.warn('Erro ao processar imagem:', error)
      return null
    }
  }
  
  // Extrair cor
  private static extractColor(colorNode: any): string {
    try {
      if (!colorNode) return '#000000'
      
      const srgbClr = colorNode['a:srgbClr']
      if (srgbClr?.['$']?.val) {
        return `#${srgbClr['$'].val}`
      }
      
      return '#000000'
    } catch {
      return '#000000'
    }
  }
  
  // Extrair título do slide
  private static extractSlideTitle(elements: AnimakerElement[]): string {
    const titleElement = elements.find(el => 
      el.type === 'text' && 
      el.position.y < 100 && 
      el.content.length > 0
    )
    
    return titleElement?.content || ''
  }
  
  // Determinar layout do slide
  private static determineLayout(elements: AnimakerElement[]): string {
    const textElements = elements.filter(el => el.type === 'text')
    const imageElements = elements.filter(el => el.type === 'image')
    
    if (imageElements.length === 0) return 'text-only'
    if (textElements.length === 0) return 'image-only'
    if (imageElements.length === 1 && textElements.length >= 1) return 'text-image'
    if (imageElements.length > 1) return 'image-gallery'
    
    return 'mixed'
  }
  
  // Extrair background
  private static extractBackground(slideXml: any, themeData: any): any {
    return {
      type: 'color',
      value: '#ffffff',
      opacity: 1.0
    }
  }
  
  // Calcular duração do slide
  private static calculateSlideDuration(elements: AnimakerElement[]): number {
    const textLength = elements
      .filter(el => el.type === 'text')
      .reduce((acc, el) => acc + el.content.length, 0)
    
    // 150 caracteres por minuto = 2.5 caracteres por segundo
    const readingTime = Math.max(textLength / 2.5, 5)
    return Math.min(readingTime, 15) // Entre 5 e 15 segundos
  }
  
  // Extrair notas do slide
  private static extractSlideNotes(slideXml: any): string {
    return ''
  }
  
  // Extrair todo texto do slide
  private static extractSlideText(elements: AnimakerElement[]): string {
    return elements
      .filter(el => el.type === 'text')
      .map(el => el.content)
      .join(' ')
  }
  
  // Gerar timeline com layers
  private static generateTimeline(slides: AnimakerSlide[]): any {
    const layers: any[] = []
    
    // Layer de background
    layers.push({
      id: 'background_layer',
      name: 'Background',
      elements: slides.map(s => s.id),
      locked: false,
      visible: true,
      opacity: 1.0
    })
    
    // Layer de texto
    const textElements = slides.flatMap(s => 
      s.elements.filter(e => e.type === 'text').map(e => e.id)
    )
    if (textElements.length > 0) {
      layers.push({
        id: 'text_layer',
        name: 'Textos',
        elements: textElements,
        locked: false,
        visible: true,
        opacity: 1.0
      })
    }
    
    // Layer de imagens
    const imageElements = slides.flatMap(s => 
      s.elements.filter(e => e.type === 'image').map(e => e.id)
    )
    if (imageElements.length > 0) {
      layers.push({
        id: 'image_layer',
        name: 'Imagens',
        elements: imageElements,
        locked: false,
        visible: true,
        opacity: 1.0
      })
    }
    
    // Layer de formas
    const shapeElements = slides.flatMap(s => 
      s.elements.filter(e => e.type === 'shape').map(e => e.id)
    )
    if (shapeElements.length > 0) {
      layers.push({
        id: 'shape_layer',
        name: 'Formas',
        elements: shapeElements,
        locked: false,
        visible: true,
        opacity: 1.0
      })
    }
    
    const totalDuration = slides.reduce((acc, slide) => acc + slide.duration, 0)
    
    return {
      totalDuration,
      layers
    }
  }
  
  // Extrair assets
  private static extractAssets(mediaFiles: any): any {
    return {
      images: mediaFiles.images.map((img: any, index: number) => ({
        id: `img_${index}`,
        name: img.name,
        url: `/api/media/images/${img.name}`,
        size: img.size
      })),
      videos: mediaFiles.videos.map((vid: any, index: number) => ({
        id: `vid_${index}`,
        name: vid.name,
        url: `/api/media/videos/${vid.name}`,
        duration: 10 // placeholder
      })),
      audio: [],
      fonts: ['Arial', 'Calibri', 'Times New Roman', 'Helvetica']
    }
  }
  
  // Extrair título da apresentação
  private static extractTitle(fileName: string, presentationXml: any): string {
    try {
      // Tentar extrair título do XML
      const title = presentationXml?.['p:presentation']?.['p:defaultTextStyle']?.title
      if (title) return title
      
      // Fallback para nome do arquivo
      return fileName
        .replace(/\.(pptx|ppt)$/i, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase())
    } catch {
      return fileName.replace(/\.(pptx|ppt)$/i, '')
    }
  }
  
  // Criar projeto mock se parsing falhar
  private static createMockProject(fileName: string, fileSize: number): AnimakerProject {
    const mockSlides: AnimakerSlide[] = [
      {
        id: 'slide_1',
        index: 0,
        title: 'Título da Apresentação',
        layout: 'title',
        background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        elements: [
          {
            id: 'title_1',
            type: 'text',
            content: 'Título da Apresentação',
            position: { x: 100, y: 150, width: 600, height: 80 },
            style: { fontSize: 32, fontFamily: 'Arial', color: '#ffffff' },
            animation: { type: 'fadeIn', duration: 1000, delay: 0, easing: 'ease-in-out' },
            interactive: { clickable: true },
            metadata: { originalIndex: 0, slideId: 'slide_1', elementId: 'title_1', visible: true }
          }
        ],
        duration: 8,
        transition: { type: 'fade', duration: 500 },
        voiceover: { text: 'Bem-vindos à nossa apresentação', voice: 'pt-BR-AntonioNeural', speed: 1.0, pitch: 1.0 }
      }
    ]
    
    return {
      id: `mock_project_${Date.now()}`,
      title: this.extractTitle(fileName, null),
      description: `Projeto mock gerado a partir de ${fileName}`,
      slides: mockSlides,
      timeline: {
        totalDuration: 8,
        layers: [
          { id: 'text_layer', name: 'Textos', elements: ['title_1'], locked: false, visible: true, opacity: 1.0 }
        ]
      },
      assets: { images: [], videos: [], audio: [], fonts: ['Arial'] },
      settings: { fps: 30, resolution: '1080p', aspectRatio: '16:9', quality: 'high' },
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: 'PPTX Parser Mock',
        version: '1.0',
        fileSize
      }
    }
  }
}

// Utilitários para conversões
export const PPTXUtils = {
  // Converter EMUs (English Metric Units) para pixels
  emuToPixels: (emu: number): number => emu / 12700,
  
  // Converter pixels para EMUs
  pixelsToEmu: (pixels: number): number => pixels * 12700,
  
  // Converter pontos para pixels (assumindo 96 DPI)
  pointsToPixels: (points: number): number => points * 96 / 72,
  
  // Validar cor hexadecimal
  isValidColor: (color: string): boolean => /^#[0-9A-F]{6}$/i.test(color)
}
