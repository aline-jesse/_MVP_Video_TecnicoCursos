/**
 * Thumbnail Generator Module
 * 
 * Sistema inteligente de geração de thumbnails com:
 * - Detecção automática de cenas
 * - Extração de frames representativos
 * - Análise de qualidade visual
 * - Geração de sprites/storyboards
 * - Múltiplos tamanhos
 */

import ffmpeg from 'fluent-ffmpeg';
import { EventEmitter } from 'events';
import path from 'path';
import { promises as fs } from 'fs';
import { createCanvas, loadImage, Image } from 'canvas';

// ==================== TYPES ====================

export interface ThumbnailSize {
  width: number;
  height: number;
  name: string;
}

export interface ThumbnailOptions {
  timestamp?: number;           // Segundo específico
  count?: number;               // Número de thumbnails
  sizes?: ThumbnailSize[];      // Tamanhos de saída
  format?: 'png' | 'jpg';
  quality?: number;             // 1-100 para JPEG
  detectScenes?: boolean;       // Detecção automática de cenas
  generateSprite?: boolean;     // Gerar sprite sheet
  analyzeQuality?: boolean;     // Analisar qualidade visual
  avoidBlack?: boolean;         // Evitar frames pretos
  outputDir?: string;
}

export interface ThumbnailResult {
  success: boolean;
  path: string;
  size: ThumbnailSize;
  timestamp: number;
  quality?: QualityAnalysis;
  fileSize: number;
}

export interface QualityAnalysis {
  brightness: number;       // 0-255
  contrast: number;         // 0-1
  sharpness: number;        // 0-1
  isBlack: boolean;
  isBlurred: boolean;
  score: number;            // 0-100
}

export interface SceneDetection {
  timestamp: number;
  duration: number;
  sceneNumber: number;
  confidence: number;
}

export interface SpriteSheet {
  path: string;
  columns: number;
  rows: number;
  thumbnailWidth: number;
  thumbnailHeight: number;
  totalThumbnails: number;
  vttPath?: string;         // WebVTT para players
}

export interface GenerationResult {
  thumbnails: ThumbnailResult[];
  sprite?: SpriteSheet;
  scenes?: SceneDetection[];
  processingTime: number;
  bestThumbnail?: ThumbnailResult;
}

// ==================== CONSTANTS ====================

export const STANDARD_SIZES: Record<string, ThumbnailSize> = {
  'large': { width: 1280, height: 720, name: 'large' },
  'medium': { width: 640, height: 360, name: 'medium' },
  'small': { width: 320, height: 180, name: 'small' },
  'preview': { width: 160, height: 90, name: 'preview' }
};

const DEFAULT_OPTIONS: Required<Omit<ThumbnailOptions, 'timestamp' | 'outputDir'>> = {
  count: 10,
  sizes: [STANDARD_SIZES.medium],
  format: 'jpg',
  quality: 85,
  detectScenes: true,
  generateSprite: false,
  analyzeQuality: true,
  avoidBlack: true
};

// ==================== THUMBNAIL GENERATOR CLASS ====================

export class ThumbnailGenerator extends EventEmitter {
  
  constructor() {
    super();
  }

  /**
   * Gera thumbnails para um vídeo
   */
  async generate(
    videoPath: string,
    options?: Partial<ThumbnailOptions>
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const outputDir = opts.outputDir || path.join(path.dirname(videoPath), 'thumbnails');

    await fs.mkdir(outputDir, { recursive: true });

    const result: GenerationResult = {
      thumbnails: [],
      processingTime: 0
    };

    try {
      // Obter metadados do vídeo
      const metadata = await this.getVideoMetadata(videoPath);
      const duration = metadata.duration;

      // Detectar cenas se solicitado
      if (opts.detectScenes) {
        result.scenes = await this.detectScenes(videoPath, duration);
        this.emit('scenes:detected', result.scenes);
      }

      // Determinar timestamps para thumbnails
      const timestamps = this.calculateTimestamps(
        duration,
        opts.count,
        options?.timestamp,
        result.scenes
      );

      // Gerar thumbnails
      for (let i = 0; i < timestamps.length; i++) {
        const timestamp = timestamps[i];
        const framePath = await this.extractFrame(videoPath, timestamp, outputDir, i);

        // Analisar qualidade se solicitado
        let quality: QualityAnalysis | undefined;
        if (opts.analyzeQuality) {
          quality = await this.analyzeImageQuality(framePath);

          // Pular frames de baixa qualidade
          if (opts.avoidBlack && quality.isBlack) {
            await fs.unlink(framePath);
            this.emit('thumbnail:skipped', { timestamp, reason: 'black frame' });
            continue;
          }
        }

        // Gerar em múltiplos tamanhos
        for (const size of opts.sizes) {
          const thumbnailPath = await this.resizeImage(
            framePath,
            size,
            outputDir,
            i,
            opts.format,
            opts.quality
          );

          const stats = await fs.stat(thumbnailPath);

          const thumbnailResult: ThumbnailResult = {
            success: true,
            path: thumbnailPath,
            size,
            timestamp,
            quality,
            fileSize: stats.size
          };

          result.thumbnails.push(thumbnailResult);
          this.emit('thumbnail:generated', thumbnailResult);
        }

        // Remover frame original
        await fs.unlink(framePath);
      }

      // Encontrar melhor thumbnail
      if (opts.analyzeQuality && result.thumbnails.length > 0) {
        result.bestThumbnail = this.findBestThumbnail(result.thumbnails);
        this.emit('best:selected', result.bestThumbnail);
      }

      // Gerar sprite sheet se solicitado
      if (opts.generateSprite && result.thumbnails.length > 0) {
        result.sprite = await this.generateSpriteSheet(
          result.thumbnails,
          outputDir,
          duration
        );
        this.emit('sprite:generated', result.sprite);
      }

      result.processingTime = Date.now() - startTime;
      this.emit('generation:complete', result);

      return result;

    } catch (error) {
      const err = error as Error;
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Gera thumbnail de timestamp específico
   */
  async generateSingle(
    videoPath: string,
    timestamp: number,
    outputPath: string,
    size?: ThumbnailSize
  ): Promise<ThumbnailResult> {
    const result = await this.generate(videoPath, {
      timestamp,
      count: 1,
      sizes: size ? [size] : [STANDARD_SIZES.medium],
      detectScenes: false,
      generateSprite: false,
      outputDir: path.dirname(outputPath)
    });

    return result.thumbnails[0];
  }

  /**
   * Gera storyboard (sprite sheet) de vídeo
   */
  async generateStoryboard(
    videoPath: string,
    outputPath: string,
    options?: {
      columns?: number;
      rows?: number;
      thumbnailSize?: ThumbnailSize;
    }
  ): Promise<SpriteSheet> {
    const cols = options?.columns || 10;
    const rows = options?.rows || 10;
    const totalThumbs = cols * rows;

    const result = await this.generate(videoPath, {
      count: totalThumbs,
      sizes: [options?.thumbnailSize || STANDARD_SIZES.preview],
      detectScenes: false,
      generateSprite: true,
      outputDir: path.dirname(outputPath)
    });

    if (!result.sprite) {
      throw new Error('Failed to generate sprite sheet');
    }

    return result.sprite;
  }

  // ==================== PRIVATE METHODS ====================

  private async getVideoMetadata(videoPath: string): Promise<{ duration: number; width: number; height: number }> {
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
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0
        });
      });
    });
  }

  private async detectScenes(videoPath: string, duration: number): Promise<SceneDetection[]> {
    return new Promise((resolve, reject) => {
      const scenes: SceneDetection[] = [];
      let sceneNumber = 0;
      let lastTimestamp = 0;

      ffmpeg(videoPath)
        .videoFilters('select=\'gt(scene,0.3)\',showinfo')
        .outputOptions('-f null')
        .on('stderr', (line) => {
          // Parsear output do showinfo
          const match = line.match(/pts_time:(\d+\.?\d*)/);
          if (match) {
            const timestamp = parseFloat(match[1]);
            const scene: SceneDetection = {
              timestamp,
              duration: timestamp - lastTimestamp,
              sceneNumber: sceneNumber++,
              confidence: 0.3 // Threshold usado
            };
            scenes.push(scene);
            lastTimestamp = timestamp;
          }
        })
        .on('end', () => resolve(scenes))
        .on('error', (err) => reject(err))
        .output('-')
        .run();
    });
  }

  private calculateTimestamps(
    duration: number,
    count: number,
    specificTimestamp?: number,
    scenes?: SceneDetection[]
  ): number[] {
    // Se timestamp específico fornecido
    if (specificTimestamp !== undefined) {
      return [Math.min(specificTimestamp, duration)];
    }

    // Se cenas detectadas, usar início de cada cena
    if (scenes && scenes.length > 0) {
      return scenes
        .slice(0, count)
        .map(scene => scene.timestamp);
    }

    // Distribuir uniformemente
    const timestamps: number[] = [];
    const interval = duration / (count + 1);

    for (let i = 1; i <= count; i++) {
      timestamps.push(interval * i);
    }

    return timestamps;
  }

  private async extractFrame(
    videoPath: string,
    timestamp: number,
    outputDir: string,
    index: number
  ): Promise<string> {
    const outputPath = path.join(outputDir, `frame_${index}_${timestamp.toFixed(2)}.png`);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .frames(1)
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .run();
    });
  }

  private async analyzeImageQuality(imagePath: string): Promise<QualityAnalysis> {
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    // Calcular brightness médio
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalBrightness += (r + g + b) / 3;
    }
    const brightness = totalBrightness / (data.length / 4);

    // Calcular contraste
    let variance = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const pixelBrightness = (r + g + b) / 3;
      variance += Math.pow(pixelBrightness - brightness, 2);
    }
    const contrast = Math.sqrt(variance / (data.length / 4)) / 255;

    // Detectar frame preto
    const isBlack = brightness < 20;

    // Detectar blur (simplificado)
    const isBlurred = contrast < 0.1;

    // Calcular sharpness (simplificado)
    const sharpness = Math.min(contrast * 2, 1);

    // Score geral (0-100)
    let score = 50;
    score += (brightness / 255) * 20;  // Preferir frames mais claros
    score += contrast * 30;             // Preferir alto contraste
    if (isBlack) score -= 50;
    if (isBlurred) score -= 20;

    return {
      brightness,
      contrast,
      sharpness,
      isBlack,
      isBlurred,
      score: Math.max(0, Math.min(100, score))
    };
  }

  private async resizeImage(
    imagePath: string,
    size: ThumbnailSize,
    outputDir: string,
    index: number,
    format: 'png' | 'jpg',
    quality: number
  ): Promise<string> {
    const ext = format === 'jpg' ? 'jpg' : 'png';
    const outputPath = path.join(outputDir, `thumbnail_${index}_${size.name}.${ext}`);

    return new Promise((resolve, reject) => {
      let command = ffmpeg(imagePath)
        .size(`${size.width}x${size.height}`)
        .output(outputPath);

      if (format === 'jpg') {
        command = command.outputOptions(`-q:v ${Math.round((100 - quality) / 10)}`);
      }

      command
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .run();
    });
  }

  private findBestThumbnail(thumbnails: ThumbnailResult[]): ThumbnailResult {
    return thumbnails.reduce((best, current) => {
      const bestScore = best.quality?.score || 0;
      const currentScore = current.quality?.score || 0;
      return currentScore > bestScore ? current : best;
    });
  }

  private async generateSpriteSheet(
    thumbnails: ThumbnailResult[],
    outputDir: string,
    videoDuration: number
  ): Promise<SpriteSheet> {
    // Agrupar por tamanho (usar medium por padrão)
    const mediumThumbs = thumbnails.filter(t => t.size.name === 'medium');
    if (mediumThumbs.length === 0) {
      throw new Error('No medium thumbnails for sprite generation');
    }

    // Calcular grid
    const total = mediumThumbs.length;
    const columns = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / columns);

    const thumbWidth = mediumThumbs[0].size.width;
    const thumbHeight = mediumThumbs[0].size.height;

    // Criar canvas
    const canvas = createCanvas(thumbWidth * columns, thumbHeight * rows);
    const ctx = canvas.getContext('2d');

    // Desenhar thumbnails
    for (let i = 0; i < mediumThumbs.length; i++) {
      const thumb = mediumThumbs[i];
      const col = i % columns;
      const row = Math.floor(i / columns);

      const image = await loadImage(thumb.path);
      ctx.drawImage(
        image,
        col * thumbWidth,
        row * thumbHeight,
        thumbWidth,
        thumbHeight
      );
    }

    // Salvar sprite
    const spritePath = path.join(outputDir, 'sprite.jpg');
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
    await fs.writeFile(spritePath, buffer);

    // Gerar WebVTT
    const vttPath = path.join(outputDir, 'sprite.vtt');
    await this.generateWebVTT(mediumThumbs, columns, thumbWidth, thumbHeight, vttPath);

    return {
      path: spritePath,
      columns,
      rows,
      thumbnailWidth: thumbWidth,
      thumbnailHeight: thumbHeight,
      totalThumbnails: mediumThumbs.length,
      vttPath
    };
  }

  private async generateWebVTT(
    thumbnails: ThumbnailResult[],
    columns: number,
    thumbWidth: number,
    thumbHeight: number,
    outputPath: string
  ): Promise<void> {
    let vtt = 'WEBVTT\n\n';

    for (let i = 0; i < thumbnails.length; i++) {
      const thumb = thumbnails[i];
      const col = i % columns;
      const row = Math.floor(i / columns);

      const startTime = this.formatVTTTime(thumb.timestamp);
      const endTime = this.formatVTTTime(
        i < thumbnails.length - 1 ? thumbnails[i + 1].timestamp : thumb.timestamp + 1
      );

      vtt += `${startTime} --> ${endTime}\n`;
      vtt += `sprite.jpg#xywh=${col * thumbWidth},${row * thumbHeight},${thumbWidth},${thumbHeight}\n\n`;
    }

    await fs.writeFile(outputPath, vtt);
  }

  private formatVTTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Gera thumbnail de alta qualidade para capa de vídeo
 */
export async function generateCoverThumbnail(
  videoPath: string,
  outputPath: string
): Promise<ThumbnailResult> {
  const generator = new ThumbnailGenerator();

  // Buscar no meio do vídeo
  const metadata = await generator['getVideoMetadata'](videoPath);
  const timestamp = metadata.duration / 2;

  return generator.generateSingle(
    videoPath,
    timestamp,
    outputPath,
    STANDARD_SIZES.large
  );
}

/**
 * Gera thumbnails para preview hover
 */
export async function generateHoverPreviews(
  videoPath: string,
  outputDir: string,
  count: number = 10
): Promise<GenerationResult> {
  const generator = new ThumbnailGenerator();

  return generator.generate(videoPath, {
    count,
    sizes: [STANDARD_SIZES.small],
    detectScenes: true,
    analyzeQuality: true,
    avoidBlack: true,
    outputDir
  });
}

export default ThumbnailGenerator;
