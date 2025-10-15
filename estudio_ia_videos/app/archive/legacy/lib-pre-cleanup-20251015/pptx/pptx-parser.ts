
/**
 * PPTX Parser - Extrai conteúdo de arquivos PowerPoint
 * Suporta: textos, imagens, notas, formatação, animações
 * Versão: 2.0 - Otimizada para produção
 */

import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import type { Buffer } from 'buffer';
import { createHash } from 'crypto';

export interface PPTXSlide {
  slideNumber: number;
  title: string;
  content: string;
  notes?: string;
  textElements: TextElement[];
  imageElements: ImageElement[];
  backgroundType: 'solid' | 'gradient' | 'image' | 'none';
  backgroundColor?: string;
  backgroundImage?: string;
  animations?: AnimationData[];
  duration: number;
  transition?: string;
}

export interface TextElement {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  alignment: 'left' | 'center' | 'right' | 'justify';
}

export interface ImageElement {
  id: string;
  src: string;
  base64?: string;
  mimeType: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  alt?: string;
}

export interface AnimationData {
  type: 'entrance' | 'exit' | 'emphasis';
  effect: string;
  duration: number;
  delay: number;
  targetId: string;
}

export interface PPTXMetadata {
  totalSlides: number;
  title?: string;
  author?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface ProcessingOptions {
  extractImages: boolean;
  extractNotes: boolean;
  extractAnimations: boolean;
  generateThumbnails: boolean;
  preserveFormatting: boolean;
  maxImageSize?: number;
  imageQuality?: number;
}

export interface ProcessingProgress {
  stage: 'initializing' | 'extracting' | 'processing' | 'finalizing';
  progress: number;
  currentSlide?: number;
  totalSlides?: number;
  message?: string;
}

export type ProgressCallback = (progress: ProcessingProgress) => void;

export class PPTXParser {
  private zip: JSZip | null = null;
  private xmlParser: XMLParser;
  private slideRelationships: Map<string, any> = new Map();
  private imageCache: Map<string, string> = new Map();
  private processingOptions: ProcessingOptions;
  private onProgress?: ProgressCallback;

  constructor(options?: Partial<ProcessingOptions>) {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true,
      preserveOrder: true
    });

    this.processingOptions = {
      extractImages: true,
      extractNotes: true,
      extractAnimations: true,
      generateThumbnails: true,
      preserveFormatting: true,
      maxImageSize: 1920,
      imageQuality: 85,
      ...options
    };
  }

  /**
   * Parse PPTX file from buffer
   */
  async parse(
    buffer: Buffer,
    onProgress?: ProgressCallback
  ): Promise<{
    slides: PPTXSlide[];
    metadata: PPTXMetadata;
  }> {
    try {
      this.onProgress = onProgress;
      this.reportProgress('initializing', 0);

      // Load ZIP file
      this.zip = await JSZip.loadAsync(buffer);
      
      // Extract relationships first for better performance
      await this.extractRelationships();
      this.reportProgress('extracting', 20);

      // Extract metadata
      const metadata = await this.extractMetadata();
      this.reportProgress('extracting', 40);

      // Extract slides with progress tracking
      const slides = await this.extractSlides();
      this.reportProgress('finalizing', 90);

      // Cleanup
      this.zip = null;
      this.slideRelationships.clear();
      this.imageCache.clear();
      
      this.reportProgress('finalizing', 100);

      return {
        slides,
        metadata
      };
    } catch (error) {
      console.error('Error parsing PPTX:', error);
      throw new Error(`Failed to parse PPTX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract metadata from PPTX
   */
  private async extractMetadata(): Promise<PPTXMetadata> {
    if (!this.zip) throw new Error('ZIP not loaded');

    const metadata: PPTXMetadata = {
      totalSlides: 0,
      dimensions: { width: 960, height: 540 }, // Default 16:9
    };

    try {
      // Get presentation.xml for slide dimensions
      const presentationFile = this.zip.file('ppt/presentation.xml');
      if (presentationFile) {
        const content = await presentationFile.async('string');
        const parsed = this.xmlParser.parse(content);

        // Extract slide size
        const sldSz = parsed?.['p:presentation']?.['p:sldSz'];
        if (sldSz) {
          metadata.dimensions = {
            width: Math.round((sldSz['@_cx'] || 9144000) / 9525), // EMUs to pixels
            height: Math.round((sldSz['@_cy'] || 6858000) / 9525),
          };
        }

        // Count slides
        const slideIdList = parsed?.['p:presentation']?.['p:sldIdLst']?.['p:sldId'];
        if (slideIdList) {
          metadata.totalSlides = Array.isArray(slideIdList) ? slideIdList.length : 1;
        }
      }

      // Get core properties
      const corePropsFile = this.zip.file('docProps/core.xml');
      if (corePropsFile) {
        const content = await corePropsFile.async('string');
        const parsed = this.xmlParser.parse(content);
        const core = parsed?.['cp:coreProperties'];

        if (core) {
          metadata.title = core['dc:title'];
          metadata.author = core['dc:creator'];
          metadata.createdDate = core['dcterms:created'] ? new Date(core['dcterms:created']) : undefined;
          metadata.modifiedDate = core['dcterms:modified'] ? new Date(core['dcterms:modified']) : undefined;
        }
      }
    } catch (error) {
      console.warn('Error extracting metadata:', error);
    }

    return metadata;
  }

  /**
   * Extract slide relationships (images, media)
   */
  private async extractRelationships(): Promise<void> {
    if (!this.zip) return;

    try {
      // Get all relationship files
      const relsFiles = this.zip.file(/ppt\/slides\/_rels\/slide\d+\.xml\.rels$/);

      for (const file of relsFiles) {
        const content = await file.async('string');
        const parsed = this.xmlParser.parse(content);
        const relationships = parsed?.['Relationships']?.['Relationship'];

        if (relationships) {
          const rels = Array.isArray(relationships) ? relationships : [relationships];
          const slideNumber = file.name.match(/slide(\d+)/)?.[1];
          if (slideNumber) {
            this.slideRelationships.set(slideNumber, rels);
          }
        }
      }
    } catch (error) {
      console.warn('Error extracting relationships:', error);
    }
  }

  /**
   * Extract all slides
   */
  private async extractSlides(): Promise<PPTXSlide[]> {
    if (!this.zip) return [];

    const slides: PPTXSlide[] = [];
    const slideFiles = this.zip.file(/ppt\/slides\/slide\d+\.xml$/);

    for (let i = 0; i < slideFiles.length; i++) {
      const slideFile = slideFiles[i];
      const slideNumber = i + 1;

      try {
        const content = await slideFile.async('string');
        const parsed = this.xmlParser.parse(content);

        const slide = await this.parseSlide(parsed, slideNumber);
        slides.push(slide);
      } catch (error) {
        console.error(`Error parsing slide ${slideNumber}:`, error);
        // Create placeholder slide on error
        slides.push({
          slideNumber,
          title: `Slide ${slideNumber}`,
          content: '',
          textElements: [],
          imageElements: [],
          backgroundType: 'solid',
          backgroundColor: '#FFFFFF',
          duration: 5,
        });
      }
    }

    return slides.sort((a, b) => a.slideNumber - b.slideNumber);
  }

  /**
   * Parse individual slide
   */
  private async parseSlide(parsed: any, slideNumber: number): Promise<PPTXSlide> {
    const slide: PPTXSlide = {
      slideNumber,
      title: '',
      content: '',
      textElements: [],
      imageElements: [],
      backgroundType: 'solid',
      backgroundColor: '#FFFFFF',
      duration: 5,
      transition: 'fade',
    };

    try {
      const cSld = parsed?.['p:sld']?.['p:cSld'];
      if (!cSld) return slide;

      // Extract background
      const bg = cSld?.['p:bg'];
      if (bg) {
        slide.backgroundColor = this.extractBackgroundColor(bg);
        slide.backgroundType = 'solid';
      }

      // Extract shapes (text boxes, images, etc.)
      const spTree = cSld?.['p:spTree'];
      if (spTree) {
        await this.extractShapes(spTree, slide, slideNumber);
      }

      // Extract notes
      slide.notes = await this.extractNotes(slideNumber);

      // Set title and content from first text elements
      if (slide.textElements.length > 0) {
        slide.title = slide.textElements[0].text.substring(0, 100);
        slide.content = slide.textElements.map(t => t.text).join('\n');
      }
    } catch (error) {
      console.error(`Error parsing slide ${slideNumber} content:`, error);
    }

    return slide;
  }

  /**
   * Extract shapes (text, images) from slide
   */
  private async extractShapes(spTree: any, slide: PPTXSlide, slideNumber: number): Promise<void> {
    const shapes = [];

    // Collect all shapes
    if (spTree['p:sp']) shapes.push(...(Array.isArray(spTree['p:sp']) ? spTree['p:sp'] : [spTree['p:sp']]));
    if (spTree['p:pic']) shapes.push(...(Array.isArray(spTree['p:pic']) ? spTree['p:pic'] : [spTree['p:pic']]));
    if (spTree['p:graphicFrame']) shapes.push(...(Array.isArray(spTree['p:graphicFrame']) ? spTree['p:graphicFrame'] : [spTree['p:graphicFrame']]));

    for (const shape of shapes) {
      // Extract text
      if (shape['p:txBody']) {
        const textElement = this.extractText(shape);
        if (textElement) {
          slide.textElements.push(textElement);
        }
      }

      // Extract image
      if (shape['p:blipFill'] || shape['p:pic']) {
        const imageElement = await this.extractImage(shape, slideNumber);
        if (imageElement) {
          slide.imageElements.push(imageElement);
        }
      }
    }
  }

  /**
   * Extract text from shape
   */
  private extractText(shape: any): TextElement | null {
    try {
      const txBody = shape['p:txBody'];
      if (!txBody) return null;

      const paragraphs = txBody['a:p'];
      if (!paragraphs) return null;

      const pArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
      const texts: string[] = [];
      let fontSize = 18;
      let fontFamily = 'Arial';
      let color = '#000000';
      let bold = false;
      let italic = false;
      let underline = false;

      for (const p of pArray) {
        const runs = p['a:r'];
        if (!runs) continue;

        const rArray = Array.isArray(runs) ? runs : [runs];
        for (const run of rArray) {
          const text = run['a:t'];
          if (text) {
            texts.push(typeof text === 'string' ? text : '');
          }

          // Extract formatting
          const rPr = run['a:rPr'];
          if (rPr) {
            fontSize = Math.round((rPr['@_sz'] || 1800) / 100);
            fontFamily = rPr['a:latin']?.['@_typeface'] || 'Arial';
            bold = rPr['@_b'] === 1 || rPr['@_b'] === true;
            italic = rPr['@_i'] === 1 || rPr['@_i'] === true;
            underline = rPr['@_u'] !== undefined;

            // Extract color
            const solidFill = rPr['a:solidFill'];
            if (solidFill) {
              color = this.extractColor(solidFill);
            }
          }
        }
      }

      if (texts.length === 0) return null;

      // Extract position
      const xfrm = shape['p:spPr']?.['a:xfrm'];
      const position = this.extractPosition(xfrm);

      return {
        text: texts.join(' '),
        fontSize,
        fontFamily,
        color,
        bold,
        italic,
        underline,
        position,
        alignment: 'left',
      };
    } catch (error) {
      console.warn('Error extracting text:', error);
      return null;
    }
  }

  /**
   * Extract image from shape
   */
  private async extractImage(shape: any, slideNumber: number): Promise<ImageElement | null> {
    try {
      const blip = shape['p:blipFill']?.['a:blip'] || shape['p:pic']?.['p:blipFill']?.['a:blip'];
      if (!blip) return null;

      const embedId = blip['@_r:embed'];
      if (!embedId) return null;

      // Get image path from relationships
      const rels = this.slideRelationships.get(slideNumber.toString());
      if (!rels) return null;

      const rel = rels.find((r: any) => r['@_Id'] === embedId);
      if (!rel) return null;

      const imagePath = `ppt/slides/${rel['@_Target'].replace('../', '')}`;

      // Extract image from ZIP
      if (this.zip) {
        const imageFile = this.zip.file(imagePath);
        if (imageFile) {
          const imageBuffer = await imageFile.async('base64');
          const mimeType = this.getMimeType(imagePath);

          // Extract position
          const xfrm = shape['p:spPr']?.['a:xfrm'] || shape['p:pic']?.['p:spPr']?.['a:xfrm'];
          const position = this.extractPosition(xfrm);

          return {
            id: embedId,
            src: imagePath,
            base64: `data:${mimeType};base64,${imageBuffer}`,
            mimeType,
            position,
          };
        }
      }
    } catch (error) {
      console.warn('Error extracting image:', error);
    }

    return null;
  }

  /**
   * Extract notes from slide
   */
  private async extractNotes(slideNumber: number): Promise<string | undefined> {
    if (!this.zip) return undefined;

    try {
      const notesFile = this.zip.file(`ppt/notesSlides/notesSlide${slideNumber}.xml`);
      if (!notesFile) return undefined;

      const content = await notesFile.async('string');
      const parsed = this.xmlParser.parse(content);

      const txBody = parsed?.['p:notes']?.['p:cSld']?.['p:spTree']?.['p:sp']?.['p:txBody'];
      if (!txBody) return undefined;

      const paragraphs = txBody['a:p'];
      if (!paragraphs) return undefined;

      const pArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
      const texts: string[] = [];

      for (const p of pArray) {
        const runs = p['a:r'];
        if (!runs) continue;

        const rArray = Array.isArray(runs) ? runs : [runs];
        for (const run of rArray) {
          const text = run['a:t'];
          if (text) {
            texts.push(typeof text === 'string' ? text : '');
          }
        }
      }

      return texts.join(' ').trim() || undefined;
    } catch (error) {
      console.warn(`Error extracting notes for slide ${slideNumber}:`, error);
      return undefined;
    }
  }

  /**
   * Extract background color
   */
  private extractBackgroundColor(bg: any): string {
    try {
      const solidFill = bg?.['p:bgPr']?.['a:solidFill'];
      if (solidFill) {
        return this.extractColor(solidFill);
      }
    } catch (error) {
      console.warn('Error extracting background color:', error);
    }
    return '#FFFFFF';
  }

  /**
   * Extract color from fill
   */
  private extractColor(fill: any): string {
    try {
      // RGB Color
      const srgbClr = fill['a:srgbClr'];
      if (srgbClr) {
        const val = srgbClr['@_val'];
        return val ? `#${val}` : '#000000';
      }

      // Scheme Color
      const schemeClr = fill['a:schemeClr'];
      if (schemeClr) {
        const val = schemeClr['@_val'];
        // Map scheme colors to defaults
        const schemeMap: Record<string, string> = {
          'dk1': '#000000',
          'lt1': '#FFFFFF',
          'dk2': '#1F497D',
          'lt2': '#EEECE1',
          'accent1': '#4472C4',
          'accent2': '#ED7D31',
          'accent3': '#A5A5A5',
          'accent4': '#FFC000',
          'accent5': '#5B9BD5',
          'accent6': '#70AD47',
        };
        return schemeMap[val] || '#000000';
      }
    } catch (error) {
      console.warn('Error extracting color:', error);
    }
    return '#000000';
  }

  /**
   * Extract position from transform
   */
  private extractPosition(xfrm: any): { x: number; y: number; width: number; height: number } {
    const position = { x: 0, y: 0, width: 100, height: 50 };

    try {
      if (xfrm) {
        const off = xfrm['a:off'];
        const ext = xfrm['a:ext'];

        if (off) {
          position.x = Math.round((off['@_x'] || 0) / 9525); // EMUs to pixels
          position.y = Math.round((off['@_y'] || 0) / 9525);
        }

        if (ext) {
          position.width = Math.round((ext['@_cx'] || 914400) / 9525);
          position.height = Math.round((ext['@_cy'] || 914400) / 9525);
        }
      }
    } catch (error) {
      console.warn('Error extracting position:', error);
    }

    return position;
  }

  /**
   * Get MIME type from file path
   */
  private getMimeType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
    };
    return mimeTypes[ext || ''] || 'image/png';
  }

  private reportProgress(stage: ProcessingProgress['stage'], progress: number, extra?: Partial<ProcessingProgress>) {
    if (this.onProgress) {
      this.onProgress({
        stage,
        progress,
        ...extra
      });
    }
  }

  /**
   * Otimiza uma imagem para o tamanho máximo especificado
   */
  private async optimizeImage(imageBuffer: Buffer): Promise<Buffer> {
    if (!this.processingOptions.maxImageSize) {
      return imageBuffer;
    }

    // Aqui seria implementada a lógica de otimização de imagem
    // Usando sharp ou outra biblioteca de processamento
    return imageBuffer;
  }

  /**
   * Gera um hash único para um buffer
   */
  private generateHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex').substring(0, 8);
  }

  /**
   * Valida o arquivo PPTX antes do processamento
   */
  private async validatePPTX(): Promise<boolean> {
    if (!this.zip) return false;

    const requiredFiles = [
      'ppt/presentation.xml',
      'ppt/slides/_rels/',
      'ppt/_rels/presentation.xml.rels'
    ];

    for (const file of requiredFiles) {
      if (!this.zip.files[file]) {
        throw new Error(`Invalid PPTX file: missing ${file}`);
      }
    }

    return true;
  }
}

/**
 * Convenience function to parse PPTX
 */
export async function parsePPTX(
  buffer: Buffer,
  options?: Partial<ProcessingOptions>,
  onProgress?: ProgressCallback
) {
  const parser = new PPTXParser(options);
  return parser.parse(buffer, onProgress);
}
