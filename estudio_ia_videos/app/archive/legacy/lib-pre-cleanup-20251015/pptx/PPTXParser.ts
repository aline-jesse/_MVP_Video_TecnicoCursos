'use client';

import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

export interface PPTXSlide {
  id: string;
  slideNumber: number;
  title: string;
  content: string[];
  images: PPTXImage[];
  shapes: PPTXShape[];
  layout: string;
  notes: string;
  duration: number; // duração estimada em segundos
  animations: PPTXAnimation[];
}

export interface PPTXImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface PPTXShape {
  id: string;
  type: 'textbox' | 'rectangle' | 'circle' | 'line' | 'arrow';
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: {
    fillColor: string;
    borderColor: string;
    borderWidth: number;
    fontSize: number;
    fontFamily: string;
    fontColor: string;
  };
}

export interface PPTXAnimation {
  id: string;
  type: 'fadeIn' | 'slideIn' | 'zoom' | 'rotate' | 'custom';
  element: string; // ID do elemento
  delay: number;
  duration: number;
  easing: string;
}

export interface PPTXDocument {
  title: string;
  author: string;
  createdDate: Date;
  modifiedDate: Date;
  slideCount: number;
  slides: PPTXSlide[];
  theme: {
    name: string;
    colors: string[];
    fonts: string[];
  };
  totalDuration: number;
  metadata: {
    application: string;
    version: string;
    language: string;
  };
}

export class PPTXParser {
  private xmlParser: XMLParser;
  
  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      allowBooleanAttributes: true,
      parseAttributeValue: true,
      parseTrueNumberOnly: false,
      arrayMode: false,
      removeNSPrefix: true
    });
  }

  /**
   * Parse completo de arquivo PPTX
   */
  async parseFile(file: File): Promise<PPTXDocument> {
    try {
      const zip = await JSZip.loadAsync(file);
      
      // Extrair metadados
      const metadata = await this.extractMetadata(zip);
      
      // Extrair slides
      const slides = await this.extractSlides(zip);
      
      // Extrair tema
      const theme = await this.extractTheme(zip);
      
      // Calcular duração total
      const totalDuration = slides.reduce((sum, slide) => sum + slide.duration, 0);
      
      const document: PPTXDocument = {
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
        author: metadata.author || 'Unknown',
        createdDate: metadata.createdDate || new Date(),
        modifiedDate: metadata.modifiedDate || new Date(),
        slideCount: slides.length,
        slides,
        theme,
        totalDuration,
        metadata: {
          application: metadata.application || 'PowerPoint',
          version: metadata.version || 'Unknown',
          language: metadata.language || 'pt-BR'
        }
      };
      
      return document;
      
    } catch (error) {
      console.error('Erro ao fazer parse do PPTX:', error);
      throw new Error(`Falha ao processar arquivo PPTX: ${error}`);
    }
  }

  /**
   * Extrair metadados do documento
   */
  private async extractMetadata(zip: JSZip): Promise<any> {
    try {
      const corePropsFile = zip.file('docProps/core.xml');
      const appPropsFile = zip.file('docProps/app.xml');
      
      let metadata: any = {};
      
      if (corePropsFile) {
        const corePropsXml = await corePropsFile.async('string');
        const coreProps = this.xmlParser.parse(corePropsXml);
        
        const props = coreProps['cp:coreProperties'] || coreProps.coreProperties;
        if (props) {
          metadata.title = props['dc:title'] || props.title;
          metadata.author = props['dc:creator'] || props.creator;
          metadata.createdDate = props['dcterms:created'] ? new Date(props['dcterms:created']) : new Date();
          metadata.modifiedDate = props['dcterms:modified'] ? new Date(props['dcterms:modified']) : new Date();
        }
      }
      
      if (appPropsFile) {
        const appPropsXml = await appPropsFile.async('string');
        const appProps = this.xmlParser.parse(appPropsXml);
        
        const props = appProps.Properties;
        if (props) {
          metadata.application = props.Application;
          metadata.version = props.AppVersion;
          metadata.slides = props.Slides;
        }
      }
      
      return metadata;
      
    } catch (error) {
      console.warn('Erro ao extrair metadados:', error);
      return {};
    }
  }

  /**
   * Extrair todos os slides
   */
  private async extractSlides(zip: JSZip): Promise<PPTXSlide[]> {
    const slides: PPTXSlide[] = [];
    
    try {
      // Encontrar todos os arquivos de slide
      const slideFiles = Object.keys(zip.files)
        .filter(path => path.match(/ppt\/slides\/slide\d+\.xml$/))
        .sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || '0');
          const numB = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || '0');
          return numA - numB;
        });
      
      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = zip.file(slideFiles[i]);
        if (slideFile) {
          const slide = await this.parseSlide(slideFile, i + 1, zip);
          slides.push(slide);
        }
      }
      
    } catch (error) {
      console.error('Erro ao extrair slides:', error);
    }
    
    return slides;
  }

  /**
   * Parse de um slide individual
   */
  private async parseSlide(slideFile: JSZip.JSZipObject, slideNumber: number, zip: JSZip): Promise<PPTXSlide> {
    try {
      const slideXml = await slideFile.async('string');
      const slideData = this.xmlParser.parse(slideXml);
      
      const slide = slideData['p:sld'] || slideData.sld;
      const cSld = slide['p:cSld'] || slide.cSld;
      const spTree = cSld['p:spTree'] || cSld.spTree;
      
      // Extrair textos e formas
      const { texts, shapes } = this.extractTextAndShapes(spTree);
      
      // Extrair imagens
      const images = await this.extractSlideImages(spTree, zip, slideNumber);
      
      // Extrair animações
      const animations = this.extractAnimations(slide);
      
      // Determinar título (primeiro texto ou texto maior)
      const title = this.determineSlideTitle(texts);
      
      // Estimar duração baseada no conteúdo
      const duration = this.estimateSlideDuration(texts, images, animations);
      
      return {
        id: `slide_${slideNumber}`,
        slideNumber,
        title,
        content: texts,
        images,
        shapes,
        layout: 'standard', // TODO: extrair layout real
        notes: '', // TODO: extrair notas do slide
        duration,
        animations
      };
      
    } catch (error) {
      console.error(`Erro ao processar slide ${slideNumber}:`, error);
      
      return {
        id: `slide_${slideNumber}`,
        slideNumber,
        title: `Slide ${slideNumber}`,
        content: [],
        images: [],
        shapes: [],
        layout: 'standard',
        notes: '',
        duration: 30, // duração padrão
        animations: []
      };
    }
  }

  /**
   * Extrair textos e formas de um slide
   */
  private extractTextAndShapes(spTree: any): { texts: string[], shapes: PPTXShape[] } {
    const texts: string[] = [];
    const shapes: PPTXShape[] = [];
    
    if (!spTree) return { texts, shapes };
    
    const shapes_array = Array.isArray(spTree['p:sp']) ? spTree['p:sp'] : [spTree['p:sp']].filter(Boolean);
    
    shapes_array.forEach((shape: any, index: number) => {
      try {
        // Extrair texto
        const txBody = shape['p:txBody'] || shape.txBody;
        if (txBody) {
          const text = this.extractTextFromTxBody(txBody);
          if (text.trim()) {
            texts.push(text.trim());
          }
        }
        
        // Extrair propriedades da forma
        const spPr = shape['p:spPr'] || shape.spPr;
        const nvSpPr = shape['p:nvSpPr'] || shape.nvSpPr;
        
        if (spPr) {
          const shapeObj: PPTXShape = {
            id: `shape_${index}`,
            type: 'textbox', // TODO: determinar tipo real
            text: txBody ? this.extractTextFromTxBody(txBody) : '',
            x: 0, // TODO: extrair posição real
            y: 0,
            width: 100,
            height: 50,
            style: {
              fillColor: '#FFFFFF',
              borderColor: '#000000',
              borderWidth: 1,
              fontSize: 14,
              fontFamily: 'Arial',
              fontColor: '#000000'
            }
          };
          
          shapes.push(shapeObj);
        }
        
      } catch (error) {
        console.warn('Erro ao processar forma:', error);
      }
    });
    
    return { texts, shapes };
  }

  /**
   * Extrair texto de txBody
   */
  private extractTextFromTxBody(txBody: any): string {
    let text = '';
    
    try {
      const paragraphs = Array.isArray(txBody['a:p']) ? txBody['a:p'] : [txBody['a:p']].filter(Boolean);
      
      paragraphs.forEach((paragraph: any) => {
        const runs = Array.isArray(paragraph['a:r']) ? paragraph['a:r'] : [paragraph['a:r']].filter(Boolean);
        
        runs.forEach((run: any) => {
          const t = run['a:t'];
          if (typeof t === 'string') {
            text += t;
          }
        });
        
        text += '\n';
      });
      
    } catch (error) {
      console.warn('Erro ao extrair texto:', error);
    }
    
    return text;
  }

  /**
   * Extrair imagens do slide
   */
  private async extractSlideImages(spTree: any, zip: JSZip, slideNumber: number): Promise<PPTXImage[]> {
    const images: PPTXImage[] = [];
    
    // TODO: Implementar extração real de imagens
    // Por enquanto, retorna array vazio
    
    return images;
  }

  /**
   * Extrair animações
   */
  private extractAnimations(slide: any): PPTXAnimation[] {
    const animations: PPTXAnimation[] = [];
    
    // TODO: Implementar extração de animações
    
    return animations;
  }

  /**
   * Determinar título do slide
   */
  private determineSlideTitle(texts: string[]): string {
    if (texts.length === 0) return 'Slide sem título';
    
    // Primeiro texto é geralmente o título
    const firstText = texts[0].trim();
    
    // Se for muito longo, truncar
    if (firstText.length > 50) {
      return firstText.substring(0, 47) + '...';
    }
    
    return firstText || 'Slide sem título';
  }

  /**
   * Estimar duração do slide baseado no conteúdo
   */
  private estimateSlideDuration(texts: string[], images: PPTXImage[], animations: PPTXAnimation[]): number {
    let duration = 15; // duração base
    
    // Adicionar tempo baseado na quantidade de texto
    const totalText = texts.join(' ');
    const wordCount = totalText.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 150 * 60); // 150 palavras por minuto
    
    duration += readingTime;
    
    // Adicionar tempo para imagens
    duration += images.length * 5;
    
    // Adicionar tempo para animações
    duration += animations.reduce((sum, anim) => sum + anim.duration, 0);
    
    return Math.max(10, Math.min(duration, 120)); // entre 10s e 2min
  }

  /**
   * Extrair tema da apresentação
   */
  private async extractTheme(zip: JSZip): Promise<any> {
    const defaultTheme = {
      name: 'Default',
      colors: ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF'],
      fonts: ['Arial', 'Calibri', 'Times New Roman']
    };
    
    try {
      const themeFile = zip.file('ppt/theme/theme1.xml');
      if (themeFile) {
        const themeXml = await themeFile.async('string');
        const themeData = this.xmlParser.parse(themeXml);
        
        // TODO: Implementar extração real do tema
        return defaultTheme;
      }
    } catch (error) {
      console.warn('Erro ao extrair tema:', error);
    }
    
    return defaultTheme;
  }

  /**
   * Converter PPTX para dados de timeline
   */
  convertToTimelineData(pptxDoc: PPTXDocument): any {
    const timelineElements = pptxDoc.slides.map((slide, index) => ({
      id: slide.id,
      type: 'slide',
      startTime: pptxDoc.slides.slice(0, index).reduce((sum, s) => sum + s.duration, 0),
      duration: slide.duration,
      content: {
        title: slide.title,
        texts: slide.content,
        images: slide.images,
        shapes: slide.shapes
      },
      style: {
        background: '#FFFFFF',
        textColor: '#000000',
        fontSize: 24
      }
    }));

    return {
      id: `timeline_${Date.now()}`,
      name: pptxDoc.title,
      duration: pptxDoc.totalDuration,
      elements: timelineElements,
      settings: {
        fps: 30,
        resolution: { width: 1920, height: 1080 },
        format: 'mp4'
      }
    };
  }
}