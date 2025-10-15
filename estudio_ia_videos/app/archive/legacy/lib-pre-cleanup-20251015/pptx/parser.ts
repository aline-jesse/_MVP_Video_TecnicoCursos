
import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'

interface SlideContent {
  id: string
  title: string
  content: string[]
  notes: string
  images: PPTXImage[]
  order: number
  layout: string
  animations: PPTXAnimation[]
}

interface PPTXImage {
  id: string
  name: string
  extension: string
  data: Buffer
  width?: number
  height?: number
  position?: {
    x: number
    y: number
  }
}

interface PPTXAnimation {
  type: string
  target: string
  duration: number
  delay: number
}

interface PPTXData {
  slides: SlideContent[]
  metadata: {
    title: string
    author: string
    subject: string
    created: Date
    modified: Date
    slideCount: number
  }
}

export class PPTXParser {
  private xmlParser: XMLParser

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true
    })
  }

  async parsePPTX(fileBuffer: Buffer): Promise<PPTXData> {
    try {
      const zip = await JSZip.loadAsync(fileBuffer)
      
      // Validate PPTX structure
      if (!await this.validatePPTXStructure(zip)) {
        throw new Error('Invalid PPTX file structure')
      }
      
      // Extract slides
      const slides: SlideContent[] = []
      const slideFiles = Object.keys(zip.files).filter(
        name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      )
      
      // Sort slides by number
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0')
        const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0')
        return numA - numB
      })
      
      for (let i = 0; i < slideFiles.length; i++) {
        try {
          const slideFile = slideFiles[i]
          const slideFileObj = zip.file(slideFile)
          if (slideFileObj) {
            const slideXml = await slideFileObj.async('text')
            const slide = await this.parseSlideXML(slideXml, i + 1, zip)
            slides.push(slide)
          }
        } catch (error) {
          console.warn(`Failed to process slide ${i + 1}:`, error)
          // Continue processing other slides even if one fails
        }
      }
      
      // Extract metadata
      const metadata = await this.extractMetadata(zip)
      
      return {
        slides: slides.sort((a, b) => a.order - b.order),
        metadata
      }
    } catch (error) {
      throw new Error(`Failed to parse PPTX: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validates PPTX file structure
   */
  private async validatePPTXStructure(zip: JSZip): Promise<boolean> {
    const requiredFiles = [
      '[Content_Types].xml',
      'ppt/presentation.xml'
    ]

    for (const file of requiredFiles) {
      if (!zip.file(file)) {
        return false
      }
    }

    return true
  }
  
  private async parseSlideXML(xml: string, order: number, zip: JSZip): Promise<SlideContent> {
    const slideData = this.xmlParser.parse(xml)
    
    const slide: SlideContent = {
      id: `slide-${order}`,
      title: '',
      content: [],
      notes: '',
      images: [],
      order,
      layout: 'default',
      animations: []
    }

    // Extract content from slide
    if (slideData['p:sld'] && slideData['p:sld']['p:cSld']) {
      const cSld = slideData['p:sld']['p:cSld']
      
      if (cSld['p:spTree'] && cSld['p:spTree']['p:sp']) {
        const shapes = Array.isArray(cSld['p:spTree']['p:sp']) 
          ? cSld['p:spTree']['p:sp'] 
          : [cSld['p:spTree']['p:sp']]

        for (const shape of shapes) {
          const text = this.extractTextFromShape(shape)
          if (text) {
            if (!slide.title && text.length > 0) {
              slide.title = text
            } else if (text !== slide.title) {
              slide.content.push(text)
            }
          }
        }
      }

      // Extract images
      slide.images = await this.extractImages(cSld, zip)
      
      // Extract animations
      slide.animations = this.extractAnimations(slideData['p:sld'])
    }

    // Extract slide notes
    slide.notes = await this.extractSlideNotes(order, zip)

    return slide
  }

  /**
   * Extracts text from a shape element
   */
  private extractTextFromShape(shape: any): string {
    if (!shape['p:txBody']) return ''

    const txBody = shape['p:txBody']
    let text = ''

    if (txBody['a:p']) {
      const paragraphs = Array.isArray(txBody['a:p']) ? txBody['a:p'] : [txBody['a:p']]
      
      for (const paragraph of paragraphs) {
        if (paragraph['a:r']) {
          const runs = Array.isArray(paragraph['a:r']) ? paragraph['a:r'] : [paragraph['a:r']]
          
          for (const run of runs) {
            if (run['a:t']) {
              text += run['a:t'] + ' '
            }
          }
        }
      }
    }

    return text.trim()
  }

  /**
   * Extracts images from slide
   */
  private async extractImages(cSld: any, zip: JSZip): Promise<PPTXImage[]> {
    const images: PPTXImage[] = []

    if (cSld['p:spTree'] && cSld['p:spTree']['p:pic']) {
      const pictures = Array.isArray(cSld['p:spTree']['p:pic']) 
        ? cSld['p:spTree']['p:pic'] 
        : [cSld['p:spTree']['p:pic']]

      for (const picture of pictures) {
        if (picture['p:blipFill'] && picture['p:blipFill']['a:blip']) {
          const blip = picture['p:blipFill']['a:blip']
          const embedId = blip['@_r:embed']
          
          if (embedId) {
            const imageData = await this.getImageFromEmbed(embedId, zip)
            if (imageData) {
              images.push(imageData)
            }
          }
        }
      }
    }

    return images
  }

  /**
   * Gets image data from embed ID
   */
  private async getImageFromEmbed(embedId: string, zip: JSZip): Promise<PPTXImage | null> {
    const relsFiles = Object.keys(zip.files).filter(name => 
      name.includes('_rels') && name.endsWith('.xml.rels')
    )

    for (const relsFile of relsFiles) {
      const relsXml = await zip.file(relsFile)?.async('text')
      if (relsXml) {
        const rels = this.xmlParser.parse(relsXml)
        
        if (rels.Relationships && rels.Relationships.Relationship) {
          const relationships = Array.isArray(rels.Relationships.Relationship) 
            ? rels.Relationships.Relationship 
            : [rels.Relationships.Relationship]

          for (const rel of relationships) {
            if (rel['@_Id'] === embedId) {
              const target = rel['@_Target']
              const imagePath = target.startsWith('../') 
                ? `ppt/${target.substring(3)}` 
                : `ppt/slides/${target}`

              const imageFile = zip.file(imagePath)
              if (imageFile) {
                const imageBuffer = await imageFile.async('nodebuffer')
                const extension = imagePath.split('.').pop() || 'png'
                
                return {
                  id: embedId,
                  name: imagePath.split('/').pop() || 'image',
                  extension,
                  data: imageBuffer
                }
              }
            }
          }
        }
      }
    }

    return null
  }

  /**
   * Extracts animations from slide
   */
  private extractAnimations(slideData: any): PPTXAnimation[] {
    const animations: PPTXAnimation[] = []

    if (slideData['p:timing'] && slideData['p:timing']['p:tnLst']) {
      const tnLst = slideData['p:timing']['p:tnLst']
      
      if (tnLst['p:par'] && tnLst['p:par']['p:cTn']) {
        const cTn = tnLst['p:par']['p:cTn']
        
        if (cTn['p:childTnLst']) {
          animations.push({
            type: 'fade',
            target: 'slide',
            duration: 1000,
            delay: 0
          })
        }
      }
    }

    return animations
  }

  /**
   * Extracts slide notes
   */
  private async extractSlideNotes(slideNumber: number, zip: JSZip): Promise<string> {
    const notesFile = zip.file(`ppt/notesSlides/notesSlide${slideNumber}.xml`)
    
    if (notesFile) {
      const notesXml = await notesFile.async('text')
      const notesData = this.xmlParser.parse(notesXml)
      
      if (notesData['p:notes'] && notesData['p:notes']['p:cSld']) {
        const cSld = notesData['p:notes']['p:cSld']
        
        if (cSld['p:spTree'] && cSld['p:spTree']['p:sp']) {
          const shapes = Array.isArray(cSld['p:spTree']['p:sp']) 
            ? cSld['p:spTree']['p:sp'] 
            : [cSld['p:spTree']['p:sp']]

          for (const shape of shapes) {
            const text = this.extractTextFromShape(shape)
            if (text) {
              return text
            }
          }
        }
      }
    }

    return ''
  }
  
  private async extractMetadata(zip: JSZip): Promise<PPTXData['metadata']> {
    const metadata: PPTXData['metadata'] = {
      title: 'Untitled Presentation',
      author: 'Unknown',
      subject: '',
      created: new Date(),
      modified: new Date(),
      slideCount: 0
    }

    try {
      // Extract from core properties
      const corePropsFile = zip.file('docProps/core.xml')
      if (corePropsFile) {
        const corePropsXml = await corePropsFile.async('text')
        const coreProps = this.xmlParser.parse(corePropsXml)
        
        if (coreProps['cp:coreProperties']) {
          const props = coreProps['cp:coreProperties']
          metadata.title = props['dc:title'] || metadata.title
          metadata.author = props['dc:creator'] || metadata.author
          metadata.subject = props['dc:subject'] || metadata.subject
          metadata.created = props['dcterms:created'] ? new Date(props['dcterms:created']) : metadata.created
          metadata.modified = props['dcterms:modified'] ? new Date(props['dcterms:modified']) : metadata.modified
        }
      }

      // Extract from app properties
      const appPropsFile = zip.file('docProps/app.xml')
      if (appPropsFile) {
        const appPropsXml = await appPropsFile.async('text')
        const appProps = this.xmlParser.parse(appPropsXml)
        
        if (appProps.Properties && appProps.Properties.Slides) {
          metadata.slideCount = parseInt(appProps.Properties.Slides) || 0
        }
      }

      // Count slides if not found in app properties
      if (metadata.slideCount === 0) {
        const slideFiles = Object.keys(zip.files).filter(
          name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
        )
        metadata.slideCount = slideFiles.length
      }

    } catch (error) {
      console.warn('Failed to extract metadata:', error)
    }

    return metadata
  }

  /**
   * Static method to validate PPTX file
   */
  static async validatePPTX(buffer: Buffer): Promise<boolean> {
    try {
      const zip = await JSZip.loadAsync(buffer)
      
      const requiredFiles = [
        '[Content_Types].xml',
        'ppt/presentation.xml'
      ]

      for (const file of requiredFiles) {
        if (!zip.file(file)) {
          return false
        }
      }

      return true
    } catch {
      return false
    }
  }
}
