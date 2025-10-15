/**
 * 📝 Text Parser - Extração real de texto de slides PPTX
 * FASE 1: PPTX Processing Real
 */

import JSZip from 'jszip'
import { parseStringPromise } from 'xml2js'
import { PPTXTextBox, TextFormatting } from '../types/slide-types'

export interface TextExtractionResult {
  success: boolean
  textBoxes: PPTXTextBox[]
  plainText: string
  formattedText: string
  wordCount: number
  characterCount: number
  bulletPoints: string[]
  hyperlinks: Array<{
    text: string
    url: string
    type: 'external' | 'slide' | 'email' | 'file'
  }>
  error?: string
}

export class PPTXTextParser {
  /**
   * Extrai todo o texto de um slide específico
   */
  static async extractSlideText(
    zip: JSZip,
    slideNumber: number
  ): Promise<TextExtractionResult> {
    try {
      const slideFile = `ppt/slides/slide${slideNumber}.xml`
      const slideXml = await zip.file(slideFile)?.async('text')
      
      if (!slideXml) {
        return {
          success: false,
          textBoxes: [],
          plainText: '',
          formattedText: '',
          wordCount: 0,
          characterCount: 0,
          bulletPoints: [],
          hyperlinks: [],
          error: `Slide ${slideNumber} não encontrado`
        }
      }

      const slideData = await parseStringPromise(slideXml)
      
      // Extrair text boxes com formatação
      const textBoxes = await this.extractTextBoxes(slideData)
      
      // Extrair texto simples
      const plainText = this.extractPlainText(slideData)
      
      // Extrair texto formatado
      const formattedText = this.extractFormattedText(slideData)
      
      // Extrair bullet points
      const bulletPoints = this.extractBulletPoints(slideData)
      
      // Extrair hyperlinks
      const hyperlinks = this.extractHyperlinks(slideData)
      
      // Calcular métricas
      const wordCount = this.countWords(plainText)
      const characterCount = plainText.length

      return {
        success: true,
        textBoxes,
        plainText,
        formattedText,
        wordCount,
        characterCount,
        bulletPoints,
        hyperlinks
      }
    } catch (error) {
      console.error(`Erro ao extrair texto do slide ${slideNumber}:`, error)
      return {
        success: false,
        textBoxes: [],
        plainText: '',
        formattedText: '',
        wordCount: 0,
        characterCount: 0,
        bulletPoints: [],
        hyperlinks: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Extrai text boxes com posição e formatação
   */
  private static async extractTextBoxes(slideData: any): Promise<PPTXTextBox[]> {
    const textBoxes: PPTXTextBox[] = []
    let textBoxId = 1

    const traverse = (obj: any, path: string[] = []) => {
      if (typeof obj !== 'object' || obj === null) return

      // Procurar por shapes com texto (p:sp)
      if (obj['p:sp']) {
        const shapes = Array.isArray(obj['p:sp']) ? obj['p:sp'] : [obj['p:sp']]
        
        shapes.forEach((shape: any) => {
          const textBox = this.extractTextFromShape(shape, textBoxId++)
          if (textBox) {
            textBoxes.push(textBox)
          }
        })
      }

      // Procurar por text boxes diretos
      if (obj['p:txBody'] || obj['a:txBody']) {
        const textBody = obj['p:txBody'] || obj['a:txBody']
        const textBox = this.extractTextFromTextBody(textBody, textBoxId++)
        if (textBox) {
          textBoxes.push(textBox)
        }
      }

      // Continuar traversal
      Object.values(obj).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((item) => traverse(item, [...path]))
        } else {
          traverse(value, [...path])
        }
      })
    }

    traverse(slideData)
    return textBoxes
  }

  /**
   * Extrai texto de um shape
   */
  private static extractTextFromShape(shape: any, id: number): PPTXTextBox | null {
    try {
      const textBody = shape['p:txBody']
      if (!textBody) return null

      const text = this.extractTextFromTextBody(textBody, id)
      if (!text) return null

      // Extrair posição do shape
      const spPr = shape['p:spPr']
      const position = this.extractPosition(spPr)

      return {
        ...text,
        position
      }
    } catch (error) {
      console.error('Erro ao extrair texto do shape:', error)
      return null
    }
  }

  /**
   * Extrai texto de um text body
   */
  private static extractTextFromTextBody(textBody: any, id: number): PPTXTextBox | null {
    try {
      let text = ''
      let formatting: TextFormatting = {}
      let bulletPoints = false
      let listLevel = 0

      const paragraphs = textBody['a:p'] || []
      const pArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs]

      pArray.forEach((paragraph: any) => {
        // Verificar se é bullet point
        const pPr = paragraph['a:pPr']
        if (pPr && (pPr['a:buChar'] || pPr['a:buAutoNum'])) {
          bulletPoints = true
          listLevel = parseInt(pPr['$']?.lvl || '0', 10)
        }

        // Extrair runs de texto
        const runs = paragraph['a:r'] || []
        const runArray = Array.isArray(runs) ? runs : [runs]

        runArray.forEach((run: any) => {
          const runText = run['a:t']
          if (runText) {
            const textContent = Array.isArray(runText) ? runText.join('') : runText
            text += textContent

            // Extrair formatação do run
            const runFormatting = this.extractTextFormatting(run['a:rPr'])
            formatting = { ...formatting, ...runFormatting }
          }
        })

        text += '\n'
      })

      if (!text.trim()) return null

      return {
        id: `textbox_${id}`,
        text: text.trim(),
        position: { x: 0, y: 0, width: 0, height: 0 }, // Será preenchido pelo shape
        formatting,
        bulletPoints,
        listLevel
      }
    } catch (error) {
      console.error('Erro ao extrair texto do textBody:', error)
      return null
    }
  }

  /**
   * Extrai posição de um elemento
   */
  private static extractPosition(spPr: any): { x: number; y: number; width: number; height: number } {
    const defaultPosition = { x: 0, y: 0, width: 0, height: 0 }
    
    try {
      const xfrm = spPr?.['a:xfrm']
      if (!xfrm) return defaultPosition

      const off = xfrm['a:off']?.[0]?.$
      const ext = xfrm['a:ext']?.[0]?.$

      return {
        x: parseInt(off?.x || '0', 10),
        y: parseInt(off?.y || '0', 10),
        width: parseInt(ext?.cx || '0', 10),
        height: parseInt(ext?.cy || '0', 10)
      }
    } catch (error) {
      return defaultPosition
    }
  }

  /**
   * Extrai formatação de texto
   */
  private static extractTextFormatting(rPr: any): TextFormatting {
    const formatting: TextFormatting = {}
    
    try {
      if (!rPr) return formatting

      // Font family
      const latin = rPr['a:latin']?.[0]?.$?.typeface
      if (latin) formatting.fontFamily = latin

      // Font size (em half-points, converter para points)
      const sz = rPr.$?.sz
      if (sz) formatting.fontSize = parseInt(sz, 10) / 100

      // Bold
      if (rPr.$?.b === '1') formatting.fontWeight = 'bold'

      // Italic
      if (rPr.$?.i === '1') formatting.fontStyle = 'italic'

      // Underline
      if (rPr.$?.u) formatting.textDecoration = 'underline'

      // Color
      const solidFill = rPr['a:solidFill']
      if (solidFill) {
        const color = this.extractColor(solidFill)
        if (color) formatting.color = color
      }

      return formatting
    } catch (error) {
      return formatting
    }
  }

  /**
   * Extrai cor de um elemento
   */
  private static extractColor(solidFill: any): string | undefined {
    try {
      // RGB Color
      const srgbClr = solidFill['a:srgbClr']?.[0]?.$?.val
      if (srgbClr) return `#${srgbClr}`

      // Scheme Color
      const schemeClr = solidFill['a:schemeClr']?.[0]?.$?.val
      if (schemeClr) {
        // Mapear cores do esquema para valores RGB
        const schemeColors: { [key: string]: string } = {
          'dk1': '#000000',
          'lt1': '#FFFFFF',
          'dk2': '#1F497D',
          'lt2': '#EEECE1',
          'accent1': '#4F81BD',
          'accent2': '#F79646',
          'accent3': '#9BBB59',
          'accent4': '#8064A2',
          'accent5': '#4BACC6',
          'accent6': '#F24C4C'
        }
        return schemeColors[schemeClr] || '#000000'
      }

      return undefined
    } catch (error) {
      return undefined
    }
  }

  /**
   * Extrai texto simples (sem formatação)
   */
  private static extractPlainText(slideData: any): string {
    const texts: string[] = []

    const traverse = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return

      // Text content is usually in 'a:t' tags
      if (obj['a:t']) {
        const textContent = Array.isArray(obj['a:t'])
          ? obj['a:t'].join(' ')
          : obj['a:t']
        if (textContent && typeof textContent === 'string') {
          texts.push(textContent.trim())
        }
      }

      // Traverse children
      Object.values(obj).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((item) => traverse(item))
        } else {
          traverse(value)
        }
      })
    }

    traverse(slideData)
    return texts.filter(t => t.length > 0).join(' ')
  }

  /**
   * Extrai texto formatado (com marcação)
   */
  private static extractFormattedText(slideData: any): string {
    // Por enquanto, retorna o texto simples
    // Em uma implementação mais avançada, incluiria marcação HTML/Markdown
    return this.extractPlainText(slideData)
  }

  /**
   * Extrai bullet points
   */
  private static extractBulletPoints(slideData: any): string[] {
    const bulletPoints: string[] = []

    const traverse = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return

      // Procurar por parágrafos com bullets
      if (obj['a:p']) {
        const paragraphs = Array.isArray(obj['a:p']) ? obj['a:p'] : [obj['a:p']]
        
        paragraphs.forEach((paragraph: any) => {
          const pPr = paragraph['a:pPr']
          if (pPr && (pPr['a:buChar'] || pPr['a:buAutoNum'])) {
            const text = this.extractTextFromParagraph(paragraph)
            if (text.trim()) {
              bulletPoints.push(text.trim())
            }
          }
        })
      }

      Object.values(obj).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((item) => traverse(item))
        } else {
          traverse(value)
        }
      })
    }

    traverse(slideData)
    return bulletPoints
  }

  /**
   * Extrai texto de um parágrafo
   */
  private static extractTextFromParagraph(paragraph: any): string {
    let text = ''
    
    const runs = paragraph['a:r'] || []
    const runArray = Array.isArray(runs) ? runs : [runs]

    runArray.forEach((run: any) => {
      const runText = run['a:t']
      if (runText) {
        const textContent = Array.isArray(runText) ? runText.join('') : runText
        text += textContent
      }
    })

    return text
  }

  /**
   * Extrai hyperlinks
   */
  private static extractHyperlinks(slideData: any): Array<{
    text: string
    url: string
    type: 'external' | 'slide' | 'email' | 'file'
  }> {
    const hyperlinks: Array<{
      text: string
      url: string
      type: 'external' | 'slide' | 'email' | 'file'
    }> = []

    const traverse = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return

      // Procurar por hyperlinks
      if (obj['a:hlinkClick']) {
        const hlink = obj['a:hlinkClick'][0]
        const url = hlink.$?.['r:id'] || hlink.$?.action
        const text = this.extractTextFromElement(obj)
        
        if (url && text) {
          let type: 'external' | 'slide' | 'email' | 'file' = 'external'
          
          if (url.startsWith('mailto:')) type = 'email'
          else if (url.startsWith('slide')) type = 'slide'
          else if (url.includes('file://')) type = 'file'
          
          hyperlinks.push({ text, url, type })
        }
      }

      Object.values(obj).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((item) => traverse(item))
        } else {
          traverse(value)
        }
      })
    }

    traverse(slideData)
    return hyperlinks
  }

  /**
   * Extrai texto de um elemento
   */
  private static extractTextFromElement(element: any): string {
    let text = ''

    const traverse = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return

      if (obj['a:t']) {
        const textContent = Array.isArray(obj['a:t'])
          ? obj['a:t'].join(' ')
          : obj['a:t']
        if (textContent && typeof textContent === 'string') {
          text += textContent
        }
      }

      Object.values(obj).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((item) => traverse(item))
        } else {
          traverse(value)
        }
      })
    }

    traverse(element)
    return text.trim()
  }

  /**
   * Conta palavras em um texto
   */
  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }
}