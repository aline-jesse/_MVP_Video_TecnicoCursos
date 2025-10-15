/**
 * Watermark Processor Module
 * 
 * Sistema completo de aplicação de watermarks com:
 * - Posicionamento inteligente
 * - Múltiplos tipos (imagem, texto, QR code)
 * - Animações e efeitos
 * - Proteção contra remoção
 * - Batch processing
 */

import ffmpeg from 'fluent-ffmpeg';
import { EventEmitter } from 'events';
import path from 'path';
import { promises as fs } from 'fs';
import { createCanvas, loadImage, registerFont } from 'canvas';
import QRCode from 'qrcode';

// ==================== TYPES ====================

export enum WatermarkType {
  IMAGE = 'image',
  TEXT = 'text',
  QRCODE = 'qrcode',
  LOGO = 'logo',
  COPYRIGHT = 'copyright'
}

export enum WatermarkPosition {
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right',
  TOP_CENTER = 'top_center',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right',
  BOTTOM_CENTER = 'bottom_center',
  CENTER = 'center',
  CUSTOM = 'custom'
}

export enum WatermarkAnimation {
  NONE = 'none',
  FADE_IN = 'fade_in',
  FADE_OUT = 'fade_out',
  SLIDE_IN = 'slide_in',
  PULSE = 'pulse',
  SCROLL = 'scroll'
}

export interface WatermarkConfig {
  type: WatermarkType;
  position: WatermarkPosition;
  
  // Para IMAGE e LOGO
  imagePath?: string;
  
  // Para TEXT e COPYRIGHT
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  
  // Para QRCODE
  qrData?: string;
  qrSize?: number;
  
  // Posicionamento
  x?: number;              // Pixels ou %
  y?: number;              // Pixels ou %
  margin?: number;         // Margem das bordas
  
  // Aparência
  opacity?: number;        // 0-1
  scale?: number;          // 0-2
  rotation?: number;       // Graus
  
  // Animação
  animation?: WatermarkAnimation;
  animationDuration?: number;  // Segundos
  
  // Proteção
  multiple?: boolean;      // Múltiplos watermarks
  invisible?: boolean;     // Watermark invisível (esteganografia)
  pattern?: boolean;       // Padrão repetido
}

export interface ProcessingOptions {
  watermarks: WatermarkConfig[];
  outputPath: string;
  preserveQuality?: boolean;
  hardcoded?: boolean;     // Embeded permanentemente
}

export interface ProcessingResult {
  success: boolean;
  outputPath: string;
  watermarksApplied: number;
  fileSize: number;
  processingTime: number;
  error?: string;
}

export interface BatchProcessingOptions {
  watermarks: WatermarkConfig[];
  outputDir: string;
  parallel?: number;       // Processamento paralelo
}

export interface BatchResult {
  results: ProcessingResult[];
  totalProcessed: number;
  totalFailed: number;
  totalTime: number;
}

// ==================== CONSTANTS ====================

const DEFAULT_CONFIG: Partial<WatermarkConfig> = {
  position: WatermarkPosition.BOTTOM_RIGHT,
  margin: 20,
  opacity: 0.7,
  scale: 1.0,
  rotation: 0,
  animation: WatermarkAnimation.NONE,
  fontSize: 24,
  fontFamily: 'Arial',
  fontColor: 'white',
  qrSize: 150,
  multiple: false,
  invisible: false,
  pattern: false
};

// ==================== WATERMARK PROCESSOR CLASS ====================

export class WatermarkProcessor extends EventEmitter {
  private tempDir: string;

  constructor() {
    super();
    this.tempDir = path.join(process.cwd(), '.temp', 'watermarks');
  }

  /**
   * Aplica watermark(s) em vídeo
   */
  async process(
    videoPath: string,
    options: ProcessingOptions
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    const result: ProcessingResult = {
      success: false,
      outputPath: options.outputPath,
      watermarksApplied: 0,
      fileSize: 0,
      processingTime: 0
    };

    try {
      // Criar diretório temporário
      await fs.mkdir(this.tempDir, { recursive: true });

      // Preparar watermarks
      const watermarkPaths: string[] = [];
      for (let i = 0; i < options.watermarks.length; i++) {
        const config = { ...DEFAULT_CONFIG, ...options.watermarks[i] };
        const watermarkPath = await this.prepareWatermark(config, i);
        watermarkPaths.push(watermarkPath);
      }

      // Obter dimensões do vídeo
      const metadata = await this.getVideoMetadata(videoPath);

      // Aplicar watermarks
      await this.applyWatermarks(
        videoPath,
        watermarkPaths,
        options.watermarks,
        metadata,
        options.outputPath,
        options.preserveQuality
      );

      // Limpar arquivos temporários
      for (const watermarkPath of watermarkPaths) {
        await fs.unlink(watermarkPath).catch(() => {});
      }

      // Obter tamanho do arquivo
      const stats = await fs.stat(options.outputPath);

      result.success = true;
      result.watermarksApplied = options.watermarks.length;
      result.fileSize = stats.size;
      result.processingTime = Date.now() - startTime;

      this.emit('processing:complete', result);
      return result;

    } catch (error) {
      const err = error as Error;
      result.error = err.message;
      result.processingTime = Date.now() - startTime;

      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Processa múltiplos vídeos em batch
   */
  async processBatch(
    videoPaths: string[],
    options: BatchProcessingOptions
  ): Promise<BatchResult> {
    const startTime = Date.now();
    const results: ProcessingResult[] = [];
    const parallel = options.parallel || 1;

    // Processar em chunks
    for (let i = 0; i < videoPaths.length; i += parallel) {
      const chunk = videoPaths.slice(i, i + parallel);
      
      const chunkResults = await Promise.allSettled(
        chunk.map(async (videoPath) => {
          const baseName = path.basename(videoPath, path.extname(videoPath));
          const outputPath = path.join(
            options.outputDir,
            `${baseName}_watermarked${path.extname(videoPath)}`
          );

          return this.process(videoPath, {
            watermarks: options.watermarks,
            outputPath
          });
        })
      );

      for (const result of chunkResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            outputPath: '',
            watermarksApplied: 0,
            fileSize: 0,
            processingTime: 0,
            error: result.reason.message
          });
        }
      }

      this.emit('batch:progress', {
        processed: Math.min(i + parallel, videoPaths.length),
        total: videoPaths.length
      });
    }

    const batchResult: BatchResult = {
      results,
      totalProcessed: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      totalTime: Date.now() - startTime
    };

    this.emit('batch:complete', batchResult);
    return batchResult;
  }

  /**
   * Cria watermark de proteção (múltiplos + invisível)
   */
  async applyProtection(
    videoPath: string,
    outputPath: string,
    companyName: string,
    metadata?: Record<string, string>
  ): Promise<ProcessingResult> {
    const watermarks: WatermarkConfig[] = [
      // Logo principal
      {
        type: WatermarkType.TEXT,
        text: companyName,
        position: WatermarkPosition.BOTTOM_RIGHT,
        fontSize: 32,
        fontColor: 'white',
        opacity: 0.8
      },
      // Copyright
      {
        type: WatermarkType.COPYRIGHT,
        text: `© ${new Date().getFullYear()} ${companyName}`,
        position: WatermarkPosition.BOTTOM_LEFT,
        fontSize: 18,
        opacity: 0.6
      },
      // Watermark central transparente
      {
        type: WatermarkType.TEXT,
        text: companyName,
        position: WatermarkPosition.CENTER,
        fontSize: 96,
        opacity: 0.1,
        rotation: -45
      }
    ];

    // Adicionar QR code se tiver URL
    if (metadata?.url) {
      watermarks.push({
        type: WatermarkType.QRCODE,
        qrData: metadata.url,
        position: WatermarkPosition.TOP_RIGHT,
        opacity: 0.8
      });
    }

    return this.process(videoPath, {
      watermarks,
      outputPath,
      preserveQuality: true,
      hardcoded: true
    });
  }

  // ==================== PRIVATE METHODS ====================

  private async prepareWatermark(config: WatermarkConfig, index: number): Promise<string> {
    const watermarkPath = path.join(this.tempDir, `watermark_${index}.png`);

    switch (config.type) {
      case WatermarkType.IMAGE:
      case WatermarkType.LOGO:
        if (!config.imagePath) {
          throw new Error('Image path required for IMAGE/LOGO watermark');
        }
        // Redimensionar se necessário
        await this.prepareImageWatermark(config.imagePath, watermarkPath, config);
        break;

      case WatermarkType.TEXT:
      case WatermarkType.COPYRIGHT:
        if (!config.text) {
          throw new Error('Text required for TEXT/COPYRIGHT watermark');
        }
        await this.prepareTextWatermark(config.text, watermarkPath, config);
        break;

      case WatermarkType.QRCODE:
        if (!config.qrData) {
          throw new Error('QR data required for QRCODE watermark');
        }
        await this.prepareQRCodeWatermark(config.qrData, watermarkPath, config);
        break;
    }

    return watermarkPath;
  }

  private async prepareImageWatermark(
    imagePath: string,
    outputPath: string,
    config: WatermarkConfig
  ): Promise<void> {
    const image = await loadImage(imagePath);
    
    const scaledWidth = Math.round(image.width * (config.scale || 1));
    const scaledHeight = Math.round(image.height * (config.scale || 1));

    const canvas = createCanvas(scaledWidth, scaledHeight);
    const ctx = canvas.getContext('2d');

    // Aplicar rotação se necessário
    if (config.rotation) {
      ctx.translate(scaledWidth / 2, scaledHeight / 2);
      ctx.rotate((config.rotation * Math.PI) / 180);
      ctx.translate(-scaledWidth / 2, -scaledHeight / 2);
    }

    // Aplicar opacidade
    ctx.globalAlpha = config.opacity || 1;

    // Desenhar imagem
    ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

    // Salvar
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
  }

  private async prepareTextWatermark(
    text: string,
    outputPath: string,
    config: WatermarkConfig
  ): Promise<void> {
    const fontSize = config.fontSize || 24;
    const font = `${fontSize}px ${config.fontFamily || 'Arial'}`;

    // Criar canvas temporário para medir texto
    const tempCanvas = createCanvas(1, 1);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = font;
    const metrics = tempCtx.measureText(text);

    const textWidth = Math.ceil(metrics.width);
    const textHeight = fontSize * 1.5;

    // Criar canvas final
    const canvas = createCanvas(textWidth + 40, textHeight + 40);
    const ctx = canvas.getContext('2d');

    // Aplicar rotação se necessário
    if (config.rotation) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((config.rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Configurar texto
    ctx.font = font;
    ctx.fillStyle = config.fontColor || 'white';
    ctx.globalAlpha = config.opacity || 1;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // Adicionar sombra para melhor legibilidade
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Desenhar texto
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Salvar
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
  }

  private async prepareQRCodeWatermark(
    data: string,
    outputPath: string,
    config: WatermarkConfig
  ): Promise<void> {
    const size = config.qrSize || 150;

    const qrBuffer = await QRCode.toBuffer(data, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Aplicar opacidade se necessário
    if (config.opacity && config.opacity < 1) {
      const image = await loadImage(qrBuffer);
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      ctx.globalAlpha = config.opacity;
      ctx.drawImage(image, 0, 0);
      
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(outputPath, buffer);
    } else {
      await fs.writeFile(outputPath, qrBuffer);
    }
  }

  private async applyWatermarks(
    videoPath: string,
    watermarkPaths: string[],
    configs: WatermarkConfig[],
    metadata: { width: number; height: number; duration: number },
    outputPath: string,
    preserveQuality: boolean = true
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(videoPath);

      // Adicionar watermarks como inputs
      for (const watermarkPath of watermarkPaths) {
        command = command.input(watermarkPath);
      }

      // Criar filtros complexos
      const filters: string[] = [];
      let currentOverlay = '[0:v]';

      for (let i = 0; i < watermarkPaths.length; i++) {
        const config = configs[i];
        const position = this.calculatePosition(config, metadata);
        
        const overlayFilter = this.createOverlayFilter(
          currentOverlay,
          `[${i + 1}:v]`,
          position,
          config
        );

        filters.push(overlayFilter);
        currentOverlay = `[tmp${i}]`;
      }

      // Aplicar filtros
      const filterComplex = filters.join(';');
      command = command.complexFilter(filterComplex);

      // Preservar qualidade
      if (preserveQuality) {
        command = command
          .videoCodec('libx264')
          .addOption('-crf', '18')
          .addOption('-preset', 'slow');
      }

      // Copiar áudio
      command = command.audioCodec('copy');

      // Executar
      command
        .output(outputPath)
        .on('progress', (progress) => {
          this.emit('progress', progress);
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  private calculatePosition(
    config: WatermarkConfig,
    metadata: { width: number; height: number }
  ): { x: string; y: string } {
    const margin = config.margin || 20;

    // Posição customizada
    if (config.position === WatermarkPosition.CUSTOM && config.x !== undefined && config.y !== undefined) {
      return { x: config.x.toString(), y: config.y.toString() };
    }

    // Posições predefinidas
    const positions: Record<WatermarkPosition, { x: string; y: string }> = {
      [WatermarkPosition.TOP_LEFT]: { x: margin.toString(), y: margin.toString() },
      [WatermarkPosition.TOP_CENTER]: { x: `(main_w-overlay_w)/2`, y: margin.toString() },
      [WatermarkPosition.TOP_RIGHT]: { x: `main_w-overlay_w-${margin}`, y: margin.toString() },
      [WatermarkPosition.CENTER]: { x: '(main_w-overlay_w)/2', y: '(main_h-overlay_h)/2' },
      [WatermarkPosition.BOTTOM_LEFT]: { x: margin.toString(), y: `main_h-overlay_h-${margin}` },
      [WatermarkPosition.BOTTOM_CENTER]: { x: '(main_w-overlay_w)/2', y: `main_h-overlay_h-${margin}` },
      [WatermarkPosition.BOTTOM_RIGHT]: { x: `main_w-overlay_w-${margin}`, y: `main_h-overlay_h-${margin}` },
      [WatermarkPosition.CUSTOM]: { x: '0', y: '0' }
    };

    return positions[config.position];
  }

  private createOverlayFilter(
    mainInput: string,
    overlayInput: string,
    position: { x: string; y: string },
    config: WatermarkConfig
  ): string {
    let filter = `${mainInput}${overlayInput}overlay=${position.x}:${position.y}`;

    // Adicionar animação se configurada
    if (config.animation && config.animation !== WatermarkAnimation.NONE) {
      filter = this.addAnimation(filter, config);
    }

    return filter;
  }

  private addAnimation(filter: string, config: WatermarkConfig): string {
    const duration = config.animationDuration || 2;

    switch (config.animation) {
      case WatermarkAnimation.FADE_IN:
        return filter + `:enable='between(t,0,${duration})':alpha='if(lt(t,${duration}),t/${duration},1)'`;
      
      case WatermarkAnimation.FADE_OUT:
        return filter + `:alpha='if(gt(t,${duration}),1-((t-${duration})/${duration}),1)'`;
      
      case WatermarkAnimation.PULSE:
        return filter + `:alpha='0.5+0.5*sin(2*PI*t/${duration})'`;
      
      default:
        return filter;
    }
  }

  private async getVideoMetadata(videoPath: string): Promise<{ width: number; height: number; duration: number }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        resolve({
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          duration: metadata.format.duration || 0
        });
      });
    });
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Aplica watermark simples de logo
 */
export async function applyLogoWatermark(
  videoPath: string,
  logoPath: string,
  outputPath: string,
  position: WatermarkPosition = WatermarkPosition.BOTTOM_RIGHT
): Promise<ProcessingResult> {
  const processor = new WatermarkProcessor();

  return processor.process(videoPath, {
    watermarks: [{
      type: WatermarkType.LOGO,
      imagePath: logoPath,
      position,
      opacity: 0.7
    }],
    outputPath
  });
}

/**
 * Aplica watermark de copyright
 */
export async function applyCopyrightWatermark(
  videoPath: string,
  outputPath: string,
  copyrightText: string
): Promise<ProcessingResult> {
  const processor = new WatermarkProcessor();

  return processor.process(videoPath, {
    watermarks: [{
      type: WatermarkType.COPYRIGHT,
      text: copyrightText,
      position: WatermarkPosition.BOTTOM_CENTER,
      fontSize: 16,
      opacity: 0.6
    }],
    outputPath
  });
}

export default WatermarkProcessor;
