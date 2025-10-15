/**
 * 📄 Parser PPTX Core - Sistema de Análise Avançada
 * Extração completa com PptxGenJS e processamento otimizado
 */

import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import sharp from 'sharp';
import {
  PPTXDocument,
  PPTXSlide,
  PPTXElement,
  PPTXElementType,
  PPTXPosition,
  PPTXElementStyle,
  PPTXBackground,
  PPTXLayout,
  PPTXSlideMetadata,
  PPTXMasterSlide,
  PPTXDocumentMetadata,
  PPTXDocumentSettings,
  PPTXMedia,
  PPTXAnimation,
  PPTXTheme,
  PPTXProcessingJob,
  PPTXJobStatus
} from '../../types/pptx-types';

const parseXML = promisify(parseString);

export class PPTXCoreParser {
  private zip: JSZip | null = null;
  private relationships: Map<string, string> = new Map();
  private themes: Map<string, PPTXTheme> = new Map();
  private jobId: string;

  constructor(jobId?: string) {
    this.jobId = jobId || this.generateId();
  }

  /**
   * Parse principal - entrada única para processamento
   */
  async parseFile(
    fileBuffer: Buffer, 
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<PPTXDocument> {
    
    console.log(`[PPTX Parser] Iniciating parsing for ${filename}`);
    onProgress?.(10);

    try {
      // Cargar ZIP
      this.zip = await JSZip.loadAsync(fileBuffer);
      onProgress?.(20);

      // Extrair componentes base
      await Promise.all([
        this.extractRelationships(),
        this.extractThemes()
      ]);
      onProgress?.(40);
      
      // Extrair metadados e configurações
      const [metadata, settings] = await Promise.all([
        this.extractDocumentMetadata(filename, fileBuffer.length),
        this.extractDocumentSettings()
      ]);
      onProgress?.(60);
      
      // Extrair slides (operação mais pesada)
      const slides = await this.extractSlides((slideProgress) => {
        onProgress?.(60 + (slideProgress * 0.35));
      });
      onProgress?.(95);
      
      const document: PPTXDocument = {
        id: this.generateId(),
        filename,
        title: metadata.subject || this.extractTitleFromFilename(filename),
        author: 'Desconhecido',
        slides,
        masterSlides: [] as PPTXMasterSlide[],
        metadata: {
          ...metadata,
          slideCount: slides.length
        },
        settings
      };

      onProgress?.(100);
      console.log(`[PPTX Parser] Successfully parsed ${slides.length} slides`);
      
      return document;
    } catch (error) {
      console.error(`[PPTX Parser] Error parsing ${filename}:`, error);
      throw new Error(`Falha no parsing PPTX: ${error.message}`);
    } finally {
      this.cleanup();
    }
  }

  /**
   * Gerar preview rápido sem parsing completo
   */
  async generateQuickPreview(fileBuffer: Buffer): Promise<{
    slideCount: number;
    title: string;
    thumbnails: string[];
  }> {
    try {
      this.zip = await JSZip.loadAsync(fileBuffer);
      
      // Extrair contagem de slides
      const slideFiles = this.zip.file(/ppt\/slides\/slide\d+\.xml/);
      const slideCount = slideFiles?.length || 0;
      
      // Extrair título básico
      const metadata = await this.extractDocumentMetadata('preview.pptx', fileBuffer.length);
      const title = metadata.subject || 'Apresentação';
      
      // Gerar thumbnails básicos (placeholder por enquanto)
      const thumbnails = Array(Math.min(slideCount, 3)).fill(0).map((_, i) => 
        `/api/pptx/thumbnail/placeholder-${i + 1}.png`
      );

      return { slideCount, title, thumbnails };
    } catch (error) {
      console.error('Erro no preview rápido:', error);
      return { slideCount: 0, title: 'Erro', thumbnails: [] };
    }
  }

  /**
   * Extrair apenas texto de todos os slides
   */
  async extractAllText(fileBuffer: Buffer): Promise<string[]> {
    try {
      this.zip = await JSZip.loadAsync(fileBuffer);
      const slideFiles = this.zip.file(/ppt\/slides\/slide\d+\.xml/);
      
      if (!slideFiles) return [];

      const textContents: string[] = [];

      for (const file of slideFiles) {
        const content = await file.async('text');
        const result = await parseXML(content);
        const slideData = result['p:sld'];
        
        let slideText = '';
        if (slideData?.['p:cSld']?.[0]?.['p:spTree']) {
          const shapes = slideData['p:cSld'][0]['p:spTree'][0];
          slideText = this.extractTextFromShapes(shapes);
        }
        
        textContents.push(slideText);
      }

      return textContents;
    } catch (error) {
      console.error('Erro ao extrair texto:', error);
      return [];
    }
  }

  /**
   * Extrair relações do documento
   */
  private async extractRelationships(): Promise<void> {
    try {
      const relsFile = this.zip?.file('_rels/.rels');
      if (relsFile) {
        const content = await relsFile.async('text');
        const result = await parseXML(content);
        
        if (result.Relationships?.Relationship) {
          for (const rel of result.Relationships.Relationship) {
            this.relationships.set(rel.$.Id, rel.$.Target);
          }
        }
      }

      // Relações dos slides
      const slideRelsFiles = this.zip?.file(/ppt\/slides\/_rels\/slide\d+\.xml\.rels/);
      if (slideRelsFiles) {
        for (const file of slideRelsFiles) {
          const content = await file.async('text');
          const result = await parseXML(content);
          
          if (result.Relationships?.Relationship) {
            for (const rel of result.Relationships.Relationship) {
              const slideId = this.extractSlideIdFromRelsPath(file.name);
              this.relationships.set(`${slideId}_${rel.$.Id}`, rel.$.Target);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao extrair relationships:', error);
    }
  }

  /**
   * Extrair temas
   */
  private async extractThemes(): Promise<void> {
    try {
      const themeFiles = this.zip?.file(/ppt\/theme\/theme\d+\.xml/);
      if (!themeFiles) return;

      for (const file of themeFiles) {
        const content = await file.async('text');
        const result = await parseXML(content);
        
        if (result['a:theme']) {
          const theme = this.parseThemeFromXML(result['a:theme']);
          this.themes.set(file.name, theme);
        }
      }
    } catch (error) {
      console.warn('Erro ao extrair temas:', error);
    }
  }

  /**
   * Parse tema do XML
   */
  private parseThemeFromXML(themeData: any): PPTXTheme {
    return {
      name: themeData.$.name || 'Tema Padrão',
      colorScheme: {
        name: 'Padrão',
        colors: {
          background1: '#FFFFFF',
          background2: '#F2F2F2',
          text1: '#000000',
          text2: '#333333',
          accent1: '#4472C4',
          accent2: '#E7E6E6',
          accent3: '#A5A5A5',
          accent4: '#FFC000',
          accent5: '#5B9BD5',
          accent6: '#70AD47',
          hyperlink: '#0563C1',
          followedHyperlink: '#954F72'
        }
      },
      fontScheme: {
        name: 'Padrão',
        majorFont: 'Arial',
        minorFont: 'Arial'
      }
    };
  }

  /**
   * Extrair metadados do documento
   */
  private async extractDocumentMetadata(filename: string, fileSize: number): Promise<PPTXDocumentMetadata> {
    const metadata: PPTXDocumentMetadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0',
      slideCount: 0,
      fileSize,
      checksum: this.generateChecksum(filename),
      language: 'pt-BR'
    };

    try {
      // Core properties
      const coreProps = this.zip?.file('docProps/core.xml');
      if (coreProps) {
        const content = await coreProps.async('text');
        const result = await parseXML(content);
        const props = result['cp:coreProperties'];

        if (props) {
          metadata.subject = props['dc:subject']?.[0];
          metadata.description = props['dc:description']?.[0];
          
          if (props['dcterms:created']?.[0]) {
            metadata.createdAt = new Date(props['dcterms:created'][0]);
          }
          if (props['dcterms:modified']?.[0]) {
            metadata.updatedAt = new Date(props['dcterms:modified'][0]);
          }
        }
      }

      // App properties
      const appProps = this.zip?.file('docProps/app.xml');
      if (appProps) {
        const content = await appProps.async('text');
        const result = await parseXML(content);
        const props = result['Properties'];

        if (props) {
          metadata.slideCount = parseInt(props['Slides']?.[0] || '0');
          metadata.version = props['AppVersion']?.[0] || '1.0';
        }
      }
    } catch (error) {
      console.warn('Erro ao extrair metadados:', error);
    }

    return metadata;
  }

  /**
   * Extrair configurações do documento
   */
  private async extractDocumentSettings(): Promise<PPTXDocumentSettings> {
    const settings: PPTXDocumentSettings = {
      slideSize: { width: 10, height: 7.5, units: 'inches' },
      orientation: 'landscape',
      startSlide: 1,
      showSlideNumbers: false,
      showNotes: false,
      readOnly: false
    };

    try {
      const presentation = this.zip?.file('ppt/presentation.xml');
      if (presentation) {
        const content = await presentation.async('text');
        const result = await parseXML(content);
        const pres = result['p:presentation'];

        if (pres?.['p:sldSz']) {
          const sldSz = pres['p:sldSz'][0].$;
          settings.slideSize = {
            width: parseInt(sldSz.cx) / 914400,
            height: parseInt(sldSz.cy) / 914400,
            units: 'inches'
          };
        }
      }
    } catch (error) {
      console.warn('Erro ao extrair configurações:', error);
    }

    return settings;
  }

  /**
   * Extrair todos os slides
   */
  private async extractSlides(onProgress?: (progress: number) => void): Promise<PPTXSlide[]> {
    const slideFiles = this.zip?.file(/ppt\/slides\/slide\d+\.xml/);
    if (!slideFiles) return [];

    const slides: PPTXSlide[] = [];
    const totalSlides = slideFiles.length;

    for (let i = 0; i < slideFiles.length; i++) {
      const file = slideFiles[i];
      const slideNumber = this.extractSlideNumber(file.name);
      
      try {
        const slide = await this.parseSlide(file, slideNumber);
        slides.push(slide);
        
        onProgress?.((i + 1) / totalSlides);
      } catch (error) {
        console.warn(`Erro ao processar slide ${slideNumber}:`, error);
        // Criar slide básico em caso de erro
        slides.push(this.createFallbackSlide(slideNumber));
      }
    }

    return slides.sort((a, b) => a.slideNumber - b.slideNumber);
  }

  /**
   * Parse de slide individual
   */
  private async parseSlide(file: JSZip.JSZipObject, slideNumber: number): Promise<PPTXSlide> {
    const content = await file.async('text');
    const result = await parseXML(content);
    const slideData = result['p:sld'];

    const slide: PPTXSlide = {
      id: this.generateId(),
      slideNumber,
      content: [],
      layout: { name: 'Padrão', type: 'content', placeholders: [] },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Extrair elementos
    if (slideData?.['p:cSld']?.[0]?.['p:spTree']) {
      const shapes = slideData['p:cSld'][0]['p:spTree'][0];
      slide.content = this.parseShapes(shapes);
    }

    // Extrair título
    slide.title = this.extractSlideTitle(slide.content);

    return slide;
  }

  /**
   * Parse de shapes do slide
   */
  private parseShapes(shapesData: any): PPTXElement[] {
    const elements: PPTXElement[] = [];
    const shapeTypes = ['p:sp', 'p:pic', 'p:grpSp', 'p:graphicFrame'];
    
    for (const shapeType of shapeTypes) {
      const shapes = shapesData[shapeType];
      if (shapes) {
        for (const shape of shapes) {
          const element = this.parseIndividualShape(shape, shapeType);
          if (element) {
            elements.push(element);
          }
        }
      }
    }

    return elements;
  }

  /**
   * Parse de shape individual
   */
  private parseIndividualShape(shapeData: any, shapeType: string): PPTXElement | null {
    try {
      const element: PPTXElement = {
        id: this.generateId(),
        type: this.getElementType(shapeType),
        content: this.extractShapeContent(shapeData, shapeType),
        position: this.extractPosition(shapeData),
        style: this.extractStyle(shapeData)
      };

      return element;
    } catch (error) {
      console.warn('Erro ao processar shape:', error);
      return null;
    }
  }

  /**
   * Determinar tipo de elemento
   */
  private getElementType(shapeType: string): PPTXElementType {
    switch (shapeType) {
      case 'p:sp': return 'text';
      case 'p:pic': return 'image';
      case 'p:graphicFrame': return 'chart';
      default: return 'shape';
    }
  }

  /**
   * Extrair conteúdo do shape
   */
  private extractShapeContent(shapeData: any, shapeType: string): string | PPTXMedia {
    switch (shapeType) {
      case 'p:sp':
        return this.extractTextFromShape(shapeData);
      case 'p:pic':
        return this.extractImageFromShape(shapeData);
      default:
        return '';
    }
  }

  /**
   * Extrair texto de shape
   */
  private extractTextFromShape(shapeData: any): string {
    try {
      const textBody = shapeData['p:txBody']?.[0];
      if (!textBody) return '';

      let content = '';
      const paragraphs = textBody['a:p'];
      
      if (paragraphs) {
        for (const paragraph of paragraphs) {
          const runs = paragraph['a:r'];
          if (runs) {
            for (const run of runs) {
              content += run['a:t']?.[0] || '';
            }
          }
          content += '\n';
        }
      }

      return content.trim();
    } catch (error) {
      return '';
    }
  }

  /**
   * Extrair imagem de shape
   */
  private extractImageFromShape(shapeData: any): PPTXMedia {
    const defaultMedia: PPTXMedia = {
      id: this.generateId(),
      type: 'image',
      url: '',
      filename: 'image.png',
      size: 0
    };

    try {
      const blipFill = shapeData['p:blipFill']?.[0];
      if (blipFill?.['a:blip']?.[0]?.$?.['r:embed']) {
        const relationId = blipFill['a:blip'][0].$['r:embed'];
        const imagePath = this.relationships.get(relationId);
        
        if (imagePath) {
          defaultMedia.url = imagePath;
          defaultMedia.filename = imagePath.split('/').pop() || 'image.png';
        }
      }
    } catch (error) {
      console.warn('Erro ao extrair imagem:', error);
    }

    return defaultMedia;
  }

  /**
   * Extrair posição do elemento
   */
  private extractPosition(shapeData: any): PPTXPosition {
    try {
      const transform = shapeData['p:spPr']?.[0]?.['a:xfrm']?.[0];
      if (!transform) return { x: 0, y: 0, w: 100, h: 100 };

      const off = transform['a:off']?.[0]?.$;
      const ext = transform['a:ext']?.[0]?.$;

      if (off && ext) {
        return {
          x: parseInt(off.x) / 914400,
          y: parseInt(off.y) / 914400,
          w: parseInt(ext.cx) / 914400,
          h: parseInt(ext.cy) / 914400
        };
      }
    } catch (error) {
      // Noop
    }

    return { x: 0, y: 0, w: 100, h: 100 };
  }

  /**
   * Extrair estilo do elemento
   */
  private extractStyle(shapeData: any): PPTXElementStyle {
    const style: PPTXElementStyle = {};

    try {
      const textProps = shapeData['p:txBody']?.[0]?.['a:p']?.[0]?.['a:r']?.[0]?.['a:rPr']?.[0];
      if (textProps) {
        if (textProps.$.sz) style.fontSize = parseInt(textProps.$.sz) / 100;
        if (textProps.$.b) style.bold = textProps.$.b === '1';
        if (textProps.$.i) style.italic = textProps.$.i === '1';
      }
    } catch (error) {
      // Noop
    }

    return style;
  }

  /**
   * Utilitários
   */
  private extractTextFromShapes(shapes: any): string {
    let text = '';
    const shapeTypes = ['p:sp'];
    
    for (const shapeType of shapeTypes) {
      const shapeList = shapes[shapeType];
      if (shapeList) {
        for (const shape of shapeList) {
          text += this.extractTextFromShape(shape) + ' ';
        }
      }
    }
    
    return text.trim();
  }

  private extractSlideTitle(elements: PPTXElement[]): string {
    for (const element of elements) {
      if (element.type === 'text' && typeof element.content === 'string') {
        const text = element.content.trim();
        if (text.length > 0 && text.length < 150) {
          return text.split('\n')[0];
        }
      }
    }
    return '';
  }

  private extractTitleFromFilename(filename: string): string {
    return filename.replace('.pptx', '').replace(/[-_]/g, ' ');
  }

  private extractSlideNumber(filename: string): number {
    const match = filename.match(/slide(\d+)\.xml/);
    return match ? parseInt(match[1]) : 1;
  }

  private extractSlideIdFromRelsPath(path: string): string {
    const match = path.match(/slide(\d+)\.xml\.rels/);
    return match ? match[1] : '1';
  }

  private createFallbackSlide(slideNumber: number): PPTXSlide {
    return {
      id: this.generateId(),
      slideNumber,
      title: `Slide ${slideNumber}`,
      content: [{
        id: this.generateId(),
        type: 'text',
        content: `Conteúdo do slide ${slideNumber} (erro no parsing)`,
        position: { x: 1, y: 1, w: 8, h: 1 },
        style: { fontSize: 24 }
      }],
      layout: { name: 'Erro', type: 'content', placeholders: [] },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateChecksum(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private cleanup(): void {
    this.zip = null;
    this.relationships.clear();
    this.themes.clear();
  }
}