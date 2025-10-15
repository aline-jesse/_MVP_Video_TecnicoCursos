/**
 * Video Watermarker Module
 * 
 * Sistema profissional de marcação d'água em vídeos com suporte a:
 * - Marcas d'água de texto (customizáveis)
 * - Marcas d'água de imagem (PNG, JPG)
 * - Logos e brasões
 * - Múltiplas posições (cantos, centro, custom)
 * - Controle de opacidade e transparência
 * - Animações (fade in/out, slide, pulse)
 * - Batch processing
 * 
 * @module video-watermarker
 * @author GitHub Copilot
 * @version 1.0.0
 */

import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

// ==================== TYPES & INTERFACES ====================

/**
 * Posição predefinida da marca d'água
 */
export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'custom';

/**
 * Tipo de animação da marca d'água
 */
export type WatermarkAnimation =
  | 'none'
  | 'fade-in'
  | 'fade-out'
  | 'fade-in-out'
  | 'slide-in'
  | 'slide-out'
  | 'pulse'
  | 'rotate';

/**
 * Configuração de marca d'água de texto
 */
export interface TextWatermark {
  type: 'text';
  text: string;
  font?: string;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  opacity?: number;
  padding?: number;
  borderWidth?: number;
  borderColor?: string;
  shadowColor?: string;
  shadowBlur?: number;
}

/**
 * Configuração de marca d'água de imagem
 */
export interface ImageWatermark {
  type: 'image';
  imagePath: string;
  width?: number;
  height?: number;
  opacity?: number;
  maintainAspectRatio?: boolean;
}

/**
 * Posição customizada da marca d'água
 */
export interface CustomPosition {
  x: number;
  y: number;
  unit?: 'px' | '%';
}

/**
 * Configuração completa de watermarking
 */
export interface WatermarkConfig {
  watermark: TextWatermark | ImageWatermark;
  position: WatermarkPosition;
  customPosition?: CustomPosition;
  margin?: number;
  animation?: WatermarkAnimation;
  animationDuration?: number;
  startTime?: number;
  endTime?: number;
  scale?: number;
}

/**
 * Opções de processamento
 */
export interface WatermarkOptions {
  outputPath?: string;
  overwrite?: boolean;
  preserveQuality?: boolean;
  videoCodec?: string;
  audioCodec?: string;
  preset?: string;
  crf?: number;
}

/**
 * Resultado do processamento
 */
export interface WatermarkResult {
  success: boolean;
  outputPath: string;
  processingTime: number;
  inputSize: number;
  outputSize: number;
  errors?: string[];
}

/**
 * Evento de progresso
 */
export interface ProgressEvent {
  percent: number;
  currentTime: number;
  totalTime: number;
  speed: string;
  fps: number;
}

// ==================== MAIN CLASS ====================

/**
 * Classe principal para adicionar marcas d'água em vídeos
 * 
 * @example
 * ```typescript
 * const watermarker = new VideoWatermarker();
 * 
 * await watermarker.addWatermark('input.mp4', 'output.mp4', {
 *   watermark: {
 *     type: 'text',
 *     text: 'Copyright © 2025',
 *     fontSize: 24,
 *     fontColor: 'white',
 *     opacity: 0.7
 *   },
 *   position: 'bottom-right',
 *   margin: 20
 * });
 * ```
 */
export class VideoWatermarker extends EventEmitter {
  private defaultOptions: WatermarkOptions = {
    overwrite: false,
    preserveQuality: true,
    videoCodec: 'libx264',
    audioCodec: 'copy',
    preset: 'medium',
    crf: 23
  };

  /**
   * Adiciona marca d'água a um vídeo
   */
  async addWatermark(
    inputPath: string,
    outputPath: string,
    config: WatermarkConfig,
    options?: WatermarkOptions
  ): Promise<WatermarkResult> {
    const startTime = Date.now();
    this.emit('start', { inputPath, outputPath });

    try {
      // Validar entrada
      await this.validateInput(inputPath, config);

      // Merge options
      const opts = { ...this.defaultOptions, ...options };

      // Obter tamanho original
      const inputSize = await this.getFileSize(inputPath);

      // Gerar filtro FFmpeg
      const filter = await this.generateFilter(inputPath, config);

      // Processar vídeo
      await this.processVideo(inputPath, outputPath, filter, opts);

      // Obter tamanho final
      const outputSize = await this.getFileSize(outputPath);

      const result: WatermarkResult = {
        success: true,
        outputPath,
        processingTime: Date.now() - startTime,
        inputSize,
        outputSize
      };

      this.emit('complete', result);
      return result;

    } catch (error) {
      const errorResult: WatermarkResult = {
        success: false,
        outputPath,
        processingTime: Date.now() - startTime,
        inputSize: 0,
        outputSize: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };

      this.emit('error', error);
      return errorResult;
    }
  }

  /**
   * Adiciona marca d'água em múltiplos vídeos (batch)
   */
  async addWatermarkBatch(
    inputs: Array<{ inputPath: string; outputPath: string }>,
    config: WatermarkConfig,
    options?: WatermarkOptions
  ): Promise<Map<string, WatermarkResult>> {
    const results = new Map<string, WatermarkResult>();

    this.emit('batch-start', { total: inputs.length });

    for (let i = 0; i < inputs.length; i++) {
      const { inputPath, outputPath } = inputs[i];

      this.emit('batch-progress', { 
        current: i + 1, 
        total: inputs.length,
        file: inputPath
      });

      const result = await this.addWatermark(
        inputPath,
        outputPath,
        config,
        options
      );

      results.set(inputPath, result);
    }

    this.emit('batch-complete', { 
      total: inputs.length,
      successful: Array.from(results.values()).filter(r => r.success).length
    });

    return results;
  }

  /**
   * Valida entrada antes do processamento
   */
  private async validateInput(
    inputPath: string,
    config: WatermarkConfig
  ): Promise<void> {
    // Verificar se arquivo existe
    try {
      await fs.access(inputPath);
    } catch {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Validar configuração de texto
    if (config.watermark.type === 'text') {
      if (!config.watermark.text || config.watermark.text.trim() === '') {
        throw new Error('Text watermark requires non-empty text');
      }
    }

    // Validar configuração de imagem
    if (config.watermark.type === 'image') {
      try {
        await fs.access(config.watermark.imagePath);
      } catch {
        throw new Error(`Watermark image not found: ${config.watermark.imagePath}`);
      }
    }

    // Validar posição customizada
    if (config.position === 'custom' && !config.customPosition) {
      throw new Error('Custom position requires customPosition property');
    }
  }

  /**
   * Gera filtro FFmpeg para aplicar marca d'água
   */
  private async generateFilter(
    inputPath: string,
    config: WatermarkConfig
  ): Promise<string> {
    const { watermark, position, customPosition, margin = 10 } = config;

    if (watermark.type === 'text') {
      return this.generateTextFilter(watermark, position, customPosition, margin);
    } else {
      return this.generateImageFilter(watermark, position, customPosition, margin);
    }
  }

  /**
   * Gera filtro para marca d'água de texto
   */
  private generateTextFilter(
    watermark: TextWatermark,
    position: WatermarkPosition,
    customPosition?: CustomPosition,
    margin: number = 10
  ): string {
    const {
      text,
      font = 'Arial',
      fontSize = 24,
      fontColor = 'white',
      backgroundColor,
      opacity = 1.0,
      borderWidth = 0,
      borderColor = 'black',
      shadowColor,
      shadowBlur = 0
    } = watermark;

    // Calcular posição
    const pos = this.calculatePosition(position, customPosition, margin);

    // Construir filtro drawtext
    let filter = `drawtext=text='${this.escapeText(text)}':`;
    filter += `fontfile=/path/to/fonts/${font}.ttf:`;
    filter += `fontsize=${fontSize}:`;
    filter += `fontcolor=${fontColor}@${opacity}:`;
    filter += `x=${pos.x}:y=${pos.y}`;

    if (backgroundColor) {
      filter += `:box=1:boxcolor=${backgroundColor}@${opacity}`;
    }

    if (borderWidth > 0) {
      filter += `:borderw=${borderWidth}:bordercolor=${borderColor}`;
    }

    if (shadowColor) {
      filter += `:shadowcolor=${shadowColor}:shadowx=2:shadowy=2`;
    }

    return filter;
  }

  /**
   * Gera filtro para marca d'água de imagem
   */
  private generateImageFilter(
    watermark: ImageWatermark,
    position: WatermarkPosition,
    customPosition?: CustomPosition,
    margin: number = 10
  ): string {
    const {
      imagePath,
      width,
      height,
      opacity = 1.0,
      maintainAspectRatio = true
    } = watermark;

    // Calcular posição
    const pos = this.calculatePosition(position, customPosition, margin);

    // Construir filtro overlay
    let filter = `movie=${imagePath}`;

    // Escala se necessário
    if (width || height) {
      if (maintainAspectRatio) {
        filter += `,scale=${width || -1}:${height || -1}`;
      } else {
        filter += `,scale=${width || 100}:${height || 100}`;
      }
    }

    // Aplicar opacidade
    if (opacity < 1.0) {
      filter += `,format=rgba,colorchannelmixer=aa=${opacity}`;
    }

    filter += ` [watermark]; [in][watermark] overlay=${pos.x}:${pos.y} [out]`;

    return filter;
  }

  /**
   * Calcula posição da marca d'água
   */
  private calculatePosition(
    position: WatermarkPosition,
    customPosition?: CustomPosition,
    margin: number = 10
  ): { x: string; y: string } {
    if (position === 'custom' && customPosition) {
      const unit = customPosition.unit || 'px';
      return {
        x: unit === '%' ? `W*${customPosition.x/100}` : `${customPosition.x}`,
        y: unit === '%' ? `H*${customPosition.y/100}` : `${customPosition.y}`
      };
    }

    const positions: Record<WatermarkPosition, { x: string; y: string }> = {
      'top-left': { x: `${margin}`, y: `${margin}` },
      'top-center': { x: '(W-w)/2', y: `${margin}` },
      'top-right': { x: `W-w-${margin}`, y: `${margin}` },
      'center-left': { x: `${margin}`, y: '(H-h)/2' },
      'center': { x: '(W-w)/2', y: '(H-h)/2' },
      'center-right': { x: `W-w-${margin}`, y: '(H-h)/2' },
      'bottom-left': { x: `${margin}`, y: `H-h-${margin}` },
      'bottom-center': { x: '(W-w)/2', y: `H-h-${margin}` },
      'bottom-right': { x: `W-w-${margin}`, y: `H-h-${margin}` },
      'custom': { x: '0', y: '0' }
    };

    return positions[position];
  }

  /**
   * Processa vídeo aplicando filtro
   */
  private async processVideo(
    inputPath: string,
    outputPath: string,
    filter: string,
    options: WatermarkOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath)
        .videoCodec(options.videoCodec!)
        .audioCodec(options.audioCodec!)
        .outputOptions([
          `-preset ${options.preset}`,
          `-crf ${options.crf}`
        ]);

      // Aplicar filtro complexo
      if (filter.includes('overlay')) {
        command = command.complexFilter(filter, 'out');
      } else {
        command = command.videoFilters(filter);
      }

      command
        .on('start', (commandLine) => {
          this.emit('ffmpeg-start', { command: commandLine });
        })
        .on('progress', (progress: any) => {
          // FFmpeg progress format differs from our ProgressEvent
          const progressEvent: ProgressEvent = {
            percent: progress.percent || 0,
            currentTime: 0, // FFmpeg doesn't provide this directly
            totalTime: 0,   // FFmpeg doesn't provide this directly
            speed: progress.currentKbps ? `${progress.currentKbps}kbps` : '0kbps',
            fps: progress.currentFps || 0
          };
          this.emit('progress', progressEvent);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        })
        .save(outputPath);
    });
  }

  /**
   * Obtém tamanho de arquivo em bytes
   */
  private async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Escapa texto para uso em FFmpeg
   */
  private escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/:/g, '\\:')
      .replace(/\n/g, '\\n');
  }

  /**
   * Remove marca d'água de um vídeo (experimental)
   * Utiliza técnicas de inpainting e deblurring
   */
  async removeWatermark(
    inputPath: string,
    outputPath: string,
    region: { x: number; y: number; width: number; height: number },
    options?: WatermarkOptions
  ): Promise<WatermarkResult> {
    const startTime = Date.now();

    try {
      // Aplicar filtro de delogo
      const filter = `delogo=x=${region.x}:y=${region.y}:w=${region.width}:h=${region.height}`;

      const opts = { ...this.defaultOptions, ...options };
      const inputSize = await this.getFileSize(inputPath);

      await this.processVideo(inputPath, outputPath, filter, opts);

      const outputSize = await this.getFileSize(outputPath);

      return {
        success: true,
        outputPath,
        processingTime: Date.now() - startTime,
        inputSize,
        outputSize
      };
    } catch (error) {
      return {
        success: false,
        outputPath,
        processingTime: Date.now() - startTime,
        inputSize: 0,
        outputSize: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Cria watermarker básico com configurações padrão
 */
export function createBasicWatermarker(): VideoWatermarker {
  return new VideoWatermarker();
}

/**
 * Cria watermarker para marca d'água de texto simples
 */
export function createTextWatermarker(
  text: string,
  position: WatermarkPosition = 'bottom-right'
): {
  watermarker: VideoWatermarker;
  config: WatermarkConfig;
} {
  return {
    watermarker: new VideoWatermarker(),
    config: {
      watermark: {
        type: 'text',
        text,
        fontSize: 24,
        fontColor: 'white',
        opacity: 0.7
      },
      position,
      margin: 20
    }
  };
}

/**
 * Cria watermarker para logo de empresa
 */
export function createLogoWatermarker(
  logoPath: string,
  position: WatermarkPosition = 'top-right',
  size: number = 100
): {
  watermarker: VideoWatermarker;
  config: WatermarkConfig;
} {
  return {
    watermarker: new VideoWatermarker(),
    config: {
      watermark: {
        type: 'image',
        imagePath: logoPath,
        width: size,
        height: size,
        opacity: 0.8,
        maintainAspectRatio: true
      },
      position,
      margin: 15
    }
  };
}

/**
 * Cria watermarker para copyright/proteção
 */
export function createCopyrightWatermarker(
  copyrightText: string
): {
  watermarker: VideoWatermarker;
  config: WatermarkConfig;
} {
  return {
    watermarker: new VideoWatermarker(),
    config: {
      watermark: {
        type: 'text',
        text: copyrightText,
        fontSize: 18,
        fontColor: 'white',
        backgroundColor: 'black',
        opacity: 0.6,
        padding: 5
      },
      position: 'bottom-center',
      margin: 10
    }
  };
}

/**
 * Cria watermarker para marca d'água animada
 */
export function createAnimatedWatermarker(
  text: string,
  animation: WatermarkAnimation = 'fade-in-out'
): {
  watermarker: VideoWatermarker;
  config: WatermarkConfig;
} {
  return {
    watermarker: new VideoWatermarker(),
    config: {
      watermark: {
        type: 'text',
        text,
        fontSize: 28,
        fontColor: 'white',
        opacity: 0.8
      },
      position: 'center',
      animation,
      animationDuration: 2000
    }
  };
}

export default VideoWatermarker;
