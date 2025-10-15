
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import JSZip from 'jszip'

export interface PPTXSlide {
  id: string
  slideNumber: number
  title: string
  content: string
  notes?: string
  imageUrl?: string
  duration: number
  transition: string
}

export interface PPTXMetadata {
  title: string
  author: string
  slideCount: number
  createdAt: Date
  modifiedAt: Date
  fileSize: number
  theme: string
}

export interface PPTXProcessingResult {
  metadata: PPTXMetadata
  slides: PPTXSlide[]
  thumbnails: string[]
  success: boolean
  error?: string
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export async function processPPTXFile(filePath: string, fileName: string): Promise<PPTXProcessingResult> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('Arquivo PPTX não encontrado')
    }

    const fileBuffer = fs.readFileSync(filePath)
    const zip = await JSZip.loadAsync(fileBuffer)
    
    // Extrair metadados do core.xml
    const coreXml = await zip.file('docProps/core.xml')?.async('text')
    const metadata = await extractMetadata(coreXml, fileName, fileBuffer.length)
    
    // Extrair slides
    const slides = await extractSlides(zip)
    
    // Atualizar contagem de slides
    metadata.slideCount = slides.length
    
    // Gerar thumbnails (placeholder por enquanto)
    const thumbnails = await generateThumbnails(slides, fileName)
    
    return {
      metadata,
      slides,
      thumbnails,
      success: true
    }
  } catch (error) {
    return {
      metadata: getDefaultMetadata(fileName),
      slides: [],
      thumbnails: [],
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

async function extractMetadata(coreXml: string | undefined, fileName: string, fileSize: number): Promise<PPTXMetadata> {
  if (!coreXml) {
    return getDefaultMetadata(fileName, fileSize)
  }

  // Parse simples do XML para extrair metadados básicos
  const titleMatch = coreXml.match(/<dc:title[^>]*>([^<]*)<\/dc:title>/)
  const authorMatch = coreXml.match(/<dc:creator[^>]*>([^<]*)<\/dc:creator>/)
  const createdMatch = coreXml.match(/<dcterms:created[^>]*>([^<]*)<\/dcterms:created>/)
  const modifiedMatch = coreXml.match(/<dcterms:modified[^>]*>([^<]*)<\/dcterms:modified>/)

  return {
    title: titleMatch?.[1] || path.basename(fileName, '.pptx'),
    author: authorMatch?.[1] || 'Desconhecido',
    slideCount: 0, // Será atualizado após extrair slides
    createdAt: createdMatch?.[1] ? new Date(createdMatch[1]) : new Date(),
    modifiedAt: modifiedMatch?.[1] ? new Date(modifiedMatch[1]) : new Date(),
    fileSize,
    theme: 'Default'
  }
}

function getDefaultMetadata(fileName: string, fileSize: number = 0): PPTXMetadata {
  return {
    title: path.basename(fileName, '.pptx'),
    author: 'Desconhecido',
    slideCount: 0,
    createdAt: new Date(),
    modifiedAt: new Date(),
    fileSize,
    theme: 'Default'
  }
}

async function extractSlides(zip: JSZip): Promise<PPTXSlide[]> {
  const slides: PPTXSlide[] = []
  const slideFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  ).sort()

  for (let i = 0; i < slideFiles.length; i++) {
    const slideFile = zip.files[slideFiles[i]]
    const slideXml = await slideFile.async('text')
    
    const slide = await parseSlideXml(slideXml, i + 1)
    slides.push(slide)
  }

  return slides
}

async function parseSlideXml(slideXml: string, slideNumber: number): Promise<PPTXSlide> {
  // Parse simples para extrair texto dos slides
  const textMatches = slideXml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || []
  const texts = textMatches.map(match => {
    const textMatch = match.match(/<a:t[^>]*>([^<]*)<\/a:t>/)
    return textMatch?.[1] || ''
  }).filter(text => text.trim())

  const title = texts[0] || `Slide ${slideNumber}`
  const content = texts.slice(1).join(' ') || ''

  return {
    id: `slide-${slideNumber}`,
    slideNumber,
    title,
    content,
    duration: 5, // 5 segundos padrão
    transition: 'fade'
  }
}

async function generateThumbnails(slides: PPTXSlide[], fileName: string): Promise<string[]> {
  // Por enquanto, retorna placeholders
  // Em uma implementação real, usaria bibliotecas como Sharp ou Canvas para gerar imagens
  const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails')
  ensureDir(thumbnailsDir)
  
  const baseHash = crypto.createHash('md5').update(fileName).digest('hex').slice(0, 8)
  
  return slides.map((slide, index) => {
    const thumbnailName = `${baseHash}_slide_${index + 1}.png`
    return `/thumbnails/${thumbnailName}`
  })
}

export async function validatePPTXFile(filePath: string): Promise<{ valid: boolean; error?: string }> {
  try {
    if (!fs.existsSync(filePath)) {
      return { valid: false, error: 'Arquivo não encontrado' }
    }

    const stats = fs.statSync(filePath)
    if (stats.size > 100 * 1024 * 1024) { // 100MB
      return { valid: false, error: 'Arquivo muito grande (máximo 100MB)' }
    }

    const fileBuffer = fs.readFileSync(filePath)
    const zip = await JSZip.loadAsync(fileBuffer)
    
    // Verificar se é um arquivo PPTX válido
    if (!zip.files['[Content_Types].xml']) {
      return { valid: false, error: 'Não é um arquivo PPTX válido' }
    }

    return { valid: true }
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Erro de validação' 
    }
  }
}
