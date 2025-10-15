
/**
 * PPTX Parser Avançado - REAL (não mock)
 * Extrai slides, textos, imagens, layouts de arquivos PPTX
 * Sprint 48 - FASE 2
 */

import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

export interface PPTXSlide {
  slideNumber: number;
  title: string;
  content: string[];
  notes: string;
  layout: string;
  images: PPTXImage[];
  raw: any;
}

export interface PPTXImage {
  id: string;
  name: string;
  extension: string;
  data: Buffer;
  base64: string;
}

export interface PPTXMetadata {
  title: string;
  author: string;
  subject: string;
  created: string;
  modified: string;
  slideCount: number;
}

export interface PPTXParseResult {
  slides: PPTXSlide[];
  metadata: PPTXMetadata;
  images: PPTXImage[];
  raw: {
    presentation: any;
    slideRels: any[];
  };
}

export class PPTXParserAdvanced {
  private zip: AdmZip;
  private slideRels: Map<string, any> = new Map();
  private images: Map<string, PPTXImage> = new Map();

  constructor(pptxBuffer: Buffer) {
    this.zip = new AdmZip(pptxBuffer);
  }

  /**
   * Parse completo do PPTX
   */
  async parse(): Promise<PPTXParseResult> {
    try {
      // 1. Extrai metadados
      const metadata = await this.extractMetadata();

      // 2. Extrai imagens
      await this.extractImages();

      // 3. Extrai relacionamentos de slides
      await this.extractSlideRelationships();

      // 4. Extrai slides
      const slides = await this.extractSlides();

      // 5. Extrai presentation.xml para informações extras
      const presentation = await this.extractPresentation();

      return {
        slides,
        metadata: {
          ...metadata,
          slideCount: slides.length
        },
        images: Array.from(this.images.values()),
        raw: {
          presentation,
          slideRels: Array.from(this.slideRels.values())
        }
      };
    } catch (error) {
      console.error('[PPTXParser] Erro ao parsear PPTX:', error);
      throw error;
    }
  }

  /**
   * Extrai metadados do arquivo core.xml
   */
  private async extractMetadata(): Promise<Omit<PPTXMetadata, 'slideCount'>> {
    try {
      const coreEntry = this.zip.getEntry('docProps/core.xml');
      if (!coreEntry) {
        return this.getDefaultMetadata();
      }

      const coreXml = coreEntry.getData().toString('utf8');
      const parsed = await parseStringPromise(coreXml);

      const core = parsed['cp:coreProperties'] || parsed.coreProperties;
      
      return {
        title: this.extractText(core['dc:title']) || 'Sem título',
        author: this.extractText(core['dc:creator']) || 'Desconhecido',
        subject: this.extractText(core['dc:subject']) || '',
        created: this.extractText(core['dcterms:created']) || new Date().toISOString(),
        modified: this.extractText(core['dcterms:modified']) || new Date().toISOString()
      };
    } catch (error) {
      console.error('[PPTXParser] Erro ao extrair metadados:', error);
      return this.getDefaultMetadata();
    }
  }

  private getDefaultMetadata(): Omit<PPTXMetadata, 'slideCount'> {
    return {
      title: 'Sem título',
      author: 'Desconhecido',
      subject: '',
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };
  }

  /**
   * Extrai todas as imagens do PPTX
   */
  private async extractImages(): Promise<void> {
    const entries = this.zip.getEntries();
    
    for (const entry of entries) {
      const entryName = entry.entryName;
      
      // Procura por imagens em ppt/media/
      if (entryName.startsWith('ppt/media/') && this.isImageFile(entryName)) {
        const imageData = entry.getData();
        const imageName = path.basename(entryName);
        const imageExt = path.extname(entryName).substring(1);
        
        const image: PPTXImage = {
          id: imageName.replace(`.${imageExt}`, ''),
          name: imageName,
          extension: imageExt,
          data: imageData,
          base64: imageData.toString('base64')
        };
        
        this.images.set(imageName, image);
      }
    }
  }

  private isImageFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'].includes(ext);
  }

  /**
   * Extrai relacionamentos de slides (para encontrar imagens)
   */
  private async extractSlideRelationships(): Promise<void> {
    const entries = this.zip.getEntries();
    
    for (const entry of entries) {
      const entryName = entry.entryName;
      
      // Procura por relacionamentos de slides: ppt/slides/_rels/slide1.xml.rels
      if (entryName.match(/ppt\/slides\/_rels\/slide\d+\.xml\.rels/)) {
        const relsXml = entry.getData().toString('utf8');
        const parsed = await parseStringPromise(relsXml);
        
        const slideNumber = this.extractSlideNumber(entryName);
        this.slideRels.set(`slide${slideNumber}`, parsed);
      }
    }
  }

  /**
   * Extrai todos os slides
   */
  private async extractSlides(): Promise<PPTXSlide[]> {
    const slides: PPTXSlide[] = [];
    const entries = this.zip.getEntries();
    
    // Ordena slides por número
    const slideEntries = entries
      .filter(e => e.entryName.match(/ppt\/slides\/slide\d+\.xml/))
      .sort((a, b) => {
        const numA = this.extractSlideNumber(a.entryName);
        const numB = this.extractSlideNumber(b.entryName);
        return numA - numB;
      });

    for (const entry of slideEntries) {
      const slideXml = entry.getData().toString('utf8');
      const slideNumber = this.extractSlideNumber(entry.entryName);
      
      const slide = await this.parseSlide(slideXml, slideNumber);
      slides.push(slide);
    }

    return slides;
  }

  /**
   * Parse de um slide individual
   */
  private async parseSlide(slideXml: string, slideNumber: number): Promise<PPTXSlide> {
    try {
      const parsed = await parseStringPromise(slideXml);
      const sld = parsed['p:sld'];
      
      if (!sld) {
        throw new Error('Slide inválido: não encontrou p:sld');
      }

      // Extrai textos
      const texts = this.extractSlideTexts(sld);
      const title = texts.length > 0 ? texts[0] : `Slide ${slideNumber}`;
      const content = texts.slice(1);

      // Extrai layout
      const layout = this.detectLayout(sld);

      // Extrai imagens
      const images = this.extractSlideImages(slideNumber);

      // Extrai notas
      const notes = await this.extractSlideNotes(slideNumber);

      return {
        slideNumber,
        title,
        content,
        notes,
        layout,
        images,
        raw: sld
      };
    } catch (error) {
      console.error(`[PPTXParser] Erro ao parsear slide ${slideNumber}:`, error);
      return {
        slideNumber,
        title: `Slide ${slideNumber}`,
        content: [],
        notes: '',
        layout: 'unknown',
        images: [],
        raw: null
      };
    }
  }

  /**
   * Extrai todos os textos de um slide
   */
  private extractSlideTexts(sld: any): string[] {
    const texts: string[] = [];

    const traverse = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;

      // Procura por 'a:t' (texto)
      if (obj['a:t']) {
        const textArray = Array.isArray(obj['a:t']) ? obj['a:t'] : [obj['a:t']];
        for (const t of textArray) {
          const text = typeof t === 'string' ? t : t._;
          if (text && text.trim()) {
            texts.push(text.trim());
          }
        }
      }

      // Recursivo
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item: any) => traverse(item));
        } else if (typeof obj[key] === 'object') {
          traverse(obj[key]);
        }
      }
    };

    traverse(sld);
    return texts;
  }

  /**
   * Detecta layout do slide (título, conteúdo, etc)
   */
  private detectLayout(sld: any): string {
    try {
      const cSld = sld['p:cSld']?.[0];
      if (!cSld) return 'content';

      const spTree = cSld['p:spTree']?.[0];
      if (!spTree) return 'content';

      const shapes = spTree['p:sp'] || [];
      const pics = spTree['p:pic'] || [];

      const hasTitle = shapes.some((sp: any) => {
        const nvSpPr = sp['p:nvSpPr']?.[0];
        const ph = nvSpPr?.['p:nvPr']?.[0]?.['p:ph']?.[0];
        return ph?.['$']?.type === 'title' || ph?.['$']?.type === 'ctrTitle';
      });

      const hasBody = shapes.some((sp: any) => {
        const nvSpPr = sp['p:nvSpPr']?.[0];
        const ph = nvSpPr?.['p:nvPr']?.[0]?.['p:ph']?.[0];
        return ph?.['$']?.type === 'body';
      });

      const hasImage = pics.length > 0;

      if (hasTitle && hasBody) return 'title-content';
      if (hasTitle && hasImage) return 'title-image';
      if (hasTitle) return 'title-only';
      if (hasImage) return 'image-only';
      return 'content';
    } catch (error) {
      return 'content';
    }
  }

  /**
   * Extrai imagens de um slide específico
   */
  private extractSlideImages(slideNumber: number): PPTXImage[] {
    try {
      const rels = this.slideRels.get(`slide${slideNumber}`);
      if (!rels) return [];

      const relationships = rels['Relationships']?.['Relationship'] || [];
      const imageRels = relationships.filter((rel: any) => 
        rel['$']?.Type?.includes('image')
      );

      const images: PPTXImage[] = [];
      for (const rel of imageRels) {
        const target = rel['$']?.Target;
        if (!target) continue;

        const imageName = path.basename(target);
        const image = this.images.get(imageName);
        if (image) {
          images.push(image);
        }
      }

      return images;
    } catch (error) {
      return [];
    }
  }

  /**
   * Extrai notas de um slide
   */
  private async extractSlideNotes(slideNumber: number): Promise<string> {
    try {
      const notesEntry = this.zip.getEntry(`ppt/notesSlides/notesSlide${slideNumber}.xml`);
      if (!notesEntry) return '';

      const notesXml = notesEntry.getData().toString('utf8');
      const parsed = await parseStringPromise(notesXml);

      const texts = this.extractSlideTexts(parsed['p:notes']);
      return texts.join('\n');
    } catch (error) {
      return '';
    }
  }

  /**
   * Extrai presentation.xml
   */
  private async extractPresentation(): Promise<any> {
    try {
      const presEntry = this.zip.getEntry('ppt/presentation.xml');
      if (!presEntry) return null;

      const presXml = presEntry.getData().toString('utf8');
      return await parseStringPromise(presXml);
    } catch (error) {
      return null;
    }
  }

  /**
   * Extrai número do slide do nome do arquivo
   */
  private extractSlideNumber(filename: string): number {
    const match = filename.match(/slide(\d+)\.xml/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Extrai texto de um elemento XML
   */
  private extractText(element: any): string {
    if (!element) return '';
    if (typeof element === 'string') return element;
    if (Array.isArray(element) && element.length > 0) {
      const first = element[0];
      if (typeof first === 'string') return first;
      if (first._) return first._;
    }
    if (element._) return element._;
    return '';
  }
}

/**
 * Helper para parsear PPTX de um buffer
 */
export async function parsePPTXAdvanced(pptxBuffer: Buffer): Promise<PPTXParseResult> {
  const parser = new PPTXParserAdvanced(pptxBuffer);
  return await parser.parse();
}

/**
 * Helper para parsear PPTX de um arquivo
 */
export async function parsePPTXFromFile(filePath: string): Promise<PPTXParseResult> {
  const buffer = fs.readFileSync(filePath);
  return await parsePPTXAdvanced(buffer);
}
