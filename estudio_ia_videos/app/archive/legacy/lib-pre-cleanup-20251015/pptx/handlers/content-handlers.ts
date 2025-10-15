/**
 * 🎯 Content Handlers - Processadores específicos para cada tipo de conteúdo
 * Responsável por extrair e processar diferentes tipos de elementos do PPTX
 */

import { XMLParser } from 'fast-xml-parser';
import sharp from 'sharp';
import { createHash } from 'crypto';

export interface ContentHandlerResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface HandlerOptions {
  preserveFormatting?: boolean;
  extractMetadata?: boolean;
  maxImageSize?: number;
  imageQuality?: number;
}

/**
 * Handler base para todos os tipos de conteúdo
 */
export abstract class BaseContentHandler {
  protected xmlParser: XMLParser;
  protected options: HandlerOptions;

  constructor(options: HandlerOptions = {}) {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true,
      preserveOrder: true
    });
    this.options = options;
  }

  protected generateId(): string {
    return createHash('md5')
      .update(Date.now().toString())
      .digest('hex')
      .substring(0, 8);
  }

  abstract process(content: any): Promise<ContentHandlerResult>;
}

/**
 * Handler para processamento de texto
 */
export class TextContentHandler extends BaseContentHandler {
  async process(content: any): Promise<ContentHandlerResult> {
    try {
      if (!content) {
        return { success: false, error: 'Conteúdo de texto vazio' };
      }

      const textData = {
        id: this.generateId(),
        type: 'text',
        content: this.extractText(content),
        style: this.extractTextStyle(content),
        metadata: this.options.extractMetadata ? this.extractMetadata(content) : undefined
      };

      return {
        success: true,
        data: textData
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao processar texto: ${error.message}`
      };
    }
  }

  private extractText(content: any): string {
    let text = '';
    
    if (content.r) {
      const runs = Array.isArray(content.r) ? content.r : [content.r];
      for (const run of runs) {
        if (run.t) text += run.t + ' ';
      }
    }

    return text.trim();
  }

  private extractTextStyle(content: any): any {
    if (!this.options.preserveFormatting) return {};

    const style: any = {};
    
    if (content.rPr) {
      if (content.rPr['@_sz']) style.fontSize = content.rPr['@_sz'] / 100;
      if (content.rPr['@_b']) style.bold = content.rPr['@_b'] === '1';
      if (content.rPr['@_i']) style.italic = content.rPr['@_i'] === '1';
      if (content.rPr['@_u']) style.underline = true;
      if (content.rPr['@_strike']) style.strikethrough = true;
      if (content.rPr['@_baseline']) style.baseline = content.rPr['@_baseline'];
    }

    return style;
  }

  private extractMetadata(content: any): any {
    return {
      language: content.rPr?.['@_lang'],
      spellCheck: content.rPr?.['@_noSpell'] !== '1',
      smartTag: content.rPr?.['@_smartTag']
    };
  }
}

/**
 * Handler para processamento de imagens
 */
export class ImageContentHandler extends BaseContentHandler {
  async process(content: any): Promise<ContentHandlerResult> {
    try {
      if (!content || !content.blip) {
        return { success: false, error: 'Conteúdo de imagem inválido' };
      }

      const imageBuffer = await this.getImageBuffer(content);
      if (!imageBuffer) {
        return { success: false, error: 'Buffer de imagem não encontrado' };
      }

      const processedImage = await this.processImage(imageBuffer);
      const metadata = this.options.extractMetadata ? await this.extractImageMetadata(imageBuffer) : undefined;

      return {
        success: true,
        data: {
          id: this.generateId(),
          type: 'image',
          buffer: processedImage,
          metadata
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao processar imagem: ${error.message}`
      };
    }
  }

  private async getImageBuffer(content: any): Promise<Buffer | null> {
    // Implementar lógica para obter buffer da imagem do PPTX
    return null;
  }

  private async processImage(buffer: Buffer): Promise<Buffer> {
    if (!this.options.maxImageSize) return buffer;

    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (metadata.width && metadata.width > this.options.maxImageSize) {
        return await image
          .resize(this.options.maxImageSize, null, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({
            quality: this.options.imageQuality || 85,
            progressive: true
          })
          .toBuffer();
      }

      return buffer;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      return buffer;
    }
  }

  private async extractImageMetadata(buffer: Buffer): Promise<any> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation
      };
    } catch (error) {
      console.error('Erro ao extrair metadados da imagem:', error);
      return {};
    }
  }
}

/**
 * Handler para processamento de formas
 */
export class ShapeContentHandler extends BaseContentHandler {
  async process(content: any): Promise<ContentHandlerResult> {
    try {
      if (!content) {
        return { success: false, error: 'Conteúdo de forma vazio' };
      }

      const shapeData = {
        id: this.generateId(),
        type: 'shape',
        properties: this.extractShapeProperties(content),
        style: this.extractShapeStyle(content),
        metadata: this.options.extractMetadata ? this.extractMetadata(content) : undefined
      };

      return {
        success: true,
        data: shapeData
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao processar forma: ${error.message}`
      };
    }
  }

  private extractShapeProperties(content: any): any {
    const properties: any = {};

    if (content.spPr) {
      // Tipo de forma
      if (content.spPr.prstGeom) {
        properties.type = content.spPr.prstGeom['@_prst'];
      }

      // Transformações
      if (content.spPr.xfrm) {
        properties.transform = {
          x: content.spPr.xfrm.off?.['@_x'],
          y: content.spPr.xfrm.off?.['@_y'],
          width: content.spPr.xfrm.ext?.['@_cx'],
          height: content.spPr.xfrm.ext?.['@_cy'],
          rotation: content.spPr.xfrm['@_rot'],
          flipH: content.spPr.xfrm['@_flipH'] === '1',
          flipV: content.spPr.xfrm['@_flipV'] === '1'
        };
      }

      // Ajustes específicos da forma
      if (content.spPr.prstGeom?.avLst?.gd) {
        properties.adjustments = Array.isArray(content.spPr.prstGeom.avLst.gd)
          ? content.spPr.prstGeom.avLst.gd.map((adj: any) => ({
              name: adj['@_name'],
              val: adj['@_fmla']
            }))
          : [{
              name: content.spPr.prstGeom.avLst.gd['@_name'],
              val: content.spPr.prstGeom.avLst.gd['@_fmla']
            }];
      }
    }

    return properties;
  }

  private extractShapeStyle(content: any): any {
    if (!this.options.preserveFormatting) return {};

    const style: any = {};

    if (content.spPr) {
      // Preenchimento
      if (content.spPr.solidFill) {
        style.fill = this.extractColor(content.spPr.solidFill);
      }

      // Gradiente
      if (content.spPr.gradFill) {
        style.gradient = this.extractGradient(content.spPr.gradFill);
      }

      // Contorno
      if (content.spPr.ln) {
        style.stroke = {
          color: this.extractColor(content.spPr.ln.solidFill),
          width: content.spPr.ln['@_w'],
          type: content.spPr.ln.prstDash?.['@_val'],
          opacity: content.spPr.ln['@_alpha']
        };
      }

      // Efeitos
      if (content.spPr.effectLst) {
        style.effects = this.extractEffects(content.spPr.effectLst);
      }
    }

    return style;
  }

  private extractColor(colorData: any): string | undefined {
    if (!colorData) return undefined;

    if (colorData.srgbClr) {
      return `#${colorData.srgbClr['@_val']}`;
    }

    if (colorData.schemeClr) {
      // Mapear cores do esquema para valores reais
      const schemeColors: Record<string, string> = {
        tx1: '#000000',
        tx2: '#666666',
        bg1: '#FFFFFF',
        bg2: '#F2F2F2',
        accent1: '#4472C4',
        accent2: '#ED7D31',
        accent3: '#A5A5A5',
        accent4: '#FFC000',
        accent5: '#5B9BD5',
        accent6: '#70AD47'
      };
      return schemeColors[colorData.schemeClr['@_val']] || '#000000';
    }

    return undefined;
  }

  private extractGradient(gradientData: any): any {
    const gradient: any = {
      type: gradientData['@_rotWithShape'] === '1' ? 'radial' : 'linear',
      stops: []
    };

    if (gradientData.gsLst?.gs) {
      const stops = Array.isArray(gradientData.gsLst.gs)
        ? gradientData.gsLst.gs
        : [gradientData.gsLst.gs];

      gradient.stops = stops.map((stop: any) => ({
        position: stop['@_pos'] / 100000,
        color: this.extractColor(stop.srgbClr || stop.schemeClr)
      }));
    }

    if (gradientData.lin) {
      gradient.angle = gradientData.lin['@_ang'] / 60000;
    }

    return gradient;
  }

  private extractEffects(effectsData: any): any {
    const effects: any = {};

    // Sombra
    if (effectsData.outerShdw) {
      effects.shadow = {
        blur: effectsData.outerShdw['@_blurRad'],
        distance: effectsData.outerShdw['@_dist'],
        direction: effectsData.outerShdw['@_dir'],
        color: this.extractColor(effectsData.outerShdw.srgbClr),
        opacity: effectsData.outerShdw['@_alpha']
      };
    }

    // Brilho
    if (effectsData.glow) {
      effects.glow = {
        size: effectsData.glow['@_rad'],
        color: this.extractColor(effectsData.glow.srgbClr),
        opacity: effectsData.glow['@_alpha']
      };
    }

    // Suavização
    if (effectsData.softEdge) {
      effects.softEdge = {
        radius: effectsData.softEdge['@_rad']
      };
    }

    return effects;
  }

  private extractMetadata(content: any): any {
    return {
      name: content.nvSpPr?.cNvPr?.['@_name'],
      id: content.nvSpPr?.cNvPr?.['@_id'],
      description: content.nvSpPr?.cNvPr?.['@_descr'],
      hidden: content.nvSpPr?.cNvPr?.['@_hidden'] === '1',
      title: content.nvSpPr?.cNvPr?.['@_title']
    };
  }
}

/**
 * Factory para criar handlers específicos
 */
export class ContentHandlerFactory {
  static createHandler(type: string, options: HandlerOptions = {}): BaseContentHandler {
    switch (type.toLowerCase()) {
      case 'text':
        return new TextContentHandler(options);
      case 'image':
        return new ImageContentHandler(options);
      case 'shape':
        return new ShapeContentHandler(options);
      default:
        throw new Error(`Tipo de conteúdo não suportado: ${type}`);
    }
  }
}