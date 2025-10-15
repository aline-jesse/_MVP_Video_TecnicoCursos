/**
 * Video Effects Engine
 * 
 * Sistema profissional de aplicação de efeitos visuais em vídeos:
 * - Filtros de cor (grayscale, sepia, vintage, cinema)
 * - Transições (fade, dissolve, wipe, slide)
 * - Efeitos especiais (blur, sharpen, glow, vignette)
 * - Correção de cor (brightness, contrast, saturation, hue)
 * - Efeitos temporais (slow motion, time lapse, reverse)
 * - Composição (picture-in-picture, split screen, green screen)
 * 
 * @module video-effects
 * @author GitHub Copilot
 * @version 1.0.0
 */

import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { EventEmitter } from 'events';
import path from 'path';

// ==================== TYPES & INTERFACES ====================

/**
 * Tipos de filtros de cor disponíveis
 */
export type ColorFilter = 
  | 'grayscale'
  | 'sepia'
  | 'vintage'
  | 'cinema'
  | 'warm'
  | 'cool'
  | 'vibrant'
  | 'faded'
  | 'noir';

/**
 * Tipos de transições entre cenas
 */
export type TransitionType =
  | 'fade'
  | 'dissolve'
  | 'wipe-left'
  | 'wipe-right'
  | 'wipe-up'
  | 'wipe-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'circle';

/**
 * Tipos de efeitos especiais
 */
export type SpecialEffect =
  | 'blur'
  | 'sharpen'
  | 'glow'
  | 'vignette'
  | 'edge-detect'
  | 'emboss'
  | 'cartoon'
  | 'oil-paint'
  | 'noise';

/**
 * Configuração de filtro de cor
 */
export interface ColorFilterConfig {
  type: ColorFilter;
  intensity?: number; // 0-1
}

/**
 * Configuração de correção de cor
 */
export interface ColorCorrectionConfig {
  brightness?: number;  // -1 to 1
  contrast?: number;    // -1 to 1
  saturation?: number;  // 0 to 2
  hue?: number;         // -180 to 180
  gamma?: number;       // 0.1 to 10
}

/**
 * Configuração de transição
 */
export interface TransitionConfig {
  type: TransitionType;
  duration: number;     // seconds
  offset?: number;      // start time in seconds
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Configuração de efeito especial
 */
export interface SpecialEffectConfig {
  type: SpecialEffect;
  intensity?: number;   // 0-1
  radius?: number;      // For blur, glow
  threshold?: number;   // For edge detection
}

/**
 * Configuração de efeito temporal
 */
export interface TemporalEffectConfig {
  type: 'slow-motion' | 'time-lapse' | 'freeze' | 'reverse';
  speed?: number;       // 0.1 to 10 (0.5 = half speed, 2 = double speed)
  startTime?: number;   // seconds
  duration?: number;    // seconds
}

/**
 * Configuração de picture-in-picture
 */
export interface PictureInPictureConfig {
  overlayPath: string;
  x: number | string;   // pixel or percentage
  y: number | string;
  width?: number;
  height?: number;
  opacity?: number;     // 0-1
  startTime?: number;
  duration?: number;
}

/**
 * Configuração de split screen
 */
export interface SplitScreenConfig {
  videos: string[];
  layout: '2-horizontal' | '2-vertical' | '3-grid' | '4-grid';
  gap?: number;         // pixels between videos
}

/**
 * Configuração completa de efeitos
 */
export interface EffectsConfig {
  colorFilter?: ColorFilterConfig;
  colorCorrection?: ColorCorrectionConfig;
  transitions?: TransitionConfig[];
  specialEffects?: SpecialEffectConfig[];
  temporalEffect?: TemporalEffectConfig;
  pictureInPicture?: PictureInPictureConfig;
}

/**
 * Opções de processamento
 */
export interface ProcessingOptions {
  outputPath?: string;
  videoCodec?: string;
  audioCodec?: string;
  preset?: string;
  crf?: number;
  fps?: number;
  resolution?: { width: number; height: number };
}

/**
 * Resultado do processamento
 */
export interface EffectResult {
  success: boolean;
  outputPath: string;
  processingTime: number;
  effectsApplied: string[];
  errors?: string[];
}

/**
 * Evento de progresso
 */
export interface ProgressEvent {
  percent: number;
  fps: number;
  speed: string;
  timeProcessed: number;
  totalTime: number;
}

// ==================== MAIN CLASS ====================

/**
 * Motor de efeitos visuais para vídeos
 * 
 * @example
 * ```typescript
 * const effects = new VideoEffects();
 * 
 * await effects.applyEffects('input.mp4', {
 *   colorFilter: { type: 'vintage', intensity: 0.7 },
 *   colorCorrection: { brightness: 0.1, contrast: 0.2 },
 *   specialEffects: [{ type: 'vignette', intensity: 0.5 }]
 * });
 * ```
 */
export class VideoEffects extends EventEmitter {
  private defaultOptions: ProcessingOptions = {
    videoCodec: 'libx264',
    audioCodec: 'copy',
    preset: 'medium',
    crf: 23
  };

  /**
   * Aplica efeitos a um vídeo
   */
  async applyEffects(
    inputPath: string,
    config: EffectsConfig,
    options?: ProcessingOptions
  ): Promise<EffectResult> {
    const startTime = Date.now();
    const effectsApplied: string[] = [];

    try {
      // Validar entrada
      await this.validateInput(inputPath, config);

      // Merge options
      const opts = { ...this.defaultOptions, ...options };
      const outputPath = opts.outputPath || this.generateOutputPath(inputPath);

      // Gerar filtros FFmpeg
      const filters: string[] = [];

      if (config.colorFilter) {
        filters.push(this.buildColorFilter(config.colorFilter));
        effectsApplied.push(`Color Filter: ${config.colorFilter.type}`);
      }

      if (config.colorCorrection) {
        filters.push(this.buildColorCorrection(config.colorCorrection));
        effectsApplied.push('Color Correction');
      }

      if (config.specialEffects) {
        for (const effect of config.specialEffects) {
          filters.push(this.buildSpecialEffect(effect));
          effectsApplied.push(`Special Effect: ${effect.type}`);
        }
      }

      if (config.temporalEffect) {
        filters.push(this.buildTemporalEffect(config.temporalEffect));
        effectsApplied.push(`Temporal Effect: ${config.temporalEffect.type}`);
      }

      // Processar vídeo
      await this.processVideo(inputPath, outputPath, filters, opts, config);

      const result: EffectResult = {
        success: true,
        outputPath,
        processingTime: Date.now() - startTime,
        effectsApplied
      };

      this.emit('complete', result);
      return result;

    } catch (error) {
      const errorResult: EffectResult = {
        success: false,
        outputPath: '',
        processingTime: Date.now() - startTime,
        effectsApplied,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };

      this.emit('error', error);
      return errorResult;
    }
  }

  /**
   * Cria split screen com múltiplos vídeos
   */
  async createSplitScreen(
    config: SplitScreenConfig,
    outputPath: string,
    options?: ProcessingOptions
  ): Promise<EffectResult> {
    const startTime = Date.now();

    try {
      if (config.videos.length < 2) {
        throw new Error('Split screen requires at least 2 videos');
      }

      const filter = this.buildSplitScreenFilter(config);
      const opts = { ...this.defaultOptions, ...options };

      await this.processSplitScreen(config.videos, outputPath, filter, opts);

      return {
        success: true,
        outputPath,
        processingTime: Date.now() - startTime,
        effectsApplied: [`Split Screen: ${config.layout}`]
      };

    } catch (error) {
      return {
        success: false,
        outputPath,
        processingTime: Date.now() - startTime,
        effectsApplied: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Adiciona transição entre dois vídeos
   */
  async addTransition(
    video1: string,
    video2: string,
    transition: TransitionConfig,
    outputPath: string,
    options?: ProcessingOptions
  ): Promise<EffectResult> {
    const startTime = Date.now();

    try {
      const filter = this.buildTransitionFilter(transition);
      const opts = { ...this.defaultOptions, ...options };

      await this.processTransition(video1, video2, outputPath, filter, opts);

      return {
        success: true,
        outputPath,
        processingTime: Date.now() - startTime,
        effectsApplied: [`Transition: ${transition.type}`]
      };

    } catch (error) {
      return {
        success: false,
        outputPath,
        processingTime: Date.now() - startTime,
        effectsApplied: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Valida entrada
   */
  private async validateInput(
    inputPath: string,
    config: EffectsConfig
  ): Promise<void> {
    // Verificar se arquivo existe
    try {
      await fs.access(inputPath);
    } catch {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Validar picture-in-picture overlay
    if (config.pictureInPicture) {
      try {
        await fs.access(config.pictureInPicture.overlayPath);
      } catch {
        throw new Error(`Overlay file not found: ${config.pictureInPicture.overlayPath}`);
      }
    }
  }

  /**
   * Constrói filtro de cor
   */
  private buildColorFilter(config: ColorFilterConfig): string {
    const intensity = config.intensity || 1.0;

    const filters: Record<ColorFilter, string> = {
      grayscale: `hue=s=0`,
      sepia: `colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`,
      vintage: `curves=vintage,fade=in:0:30`,
      cinema: `colorbalance=rs=0.1:gs=0:bs=-0.1,curves=strong_contrast`,
      warm: `colortemperature=temperature=6500`,
      cool: `colortemperature=temperature=4500`,
      vibrant: `eq=saturation=1.5:contrast=1.2`,
      faded: `eq=saturation=0.6:brightness=0.05`,
      noir: `hue=s=0,curves=strong_contrast,eq=contrast=1.3`
    };

    let filter = filters[config.type];

    // Aplicar intensidade
    if (intensity < 1.0) {
      filter = `${filter},colorchannelmixer=aa=${intensity}`;
    }

    return filter;
  }

  /**
   * Constrói filtro de correção de cor
   */
  private buildColorCorrection(config: ColorCorrectionConfig): string {
    const parts: string[] = [];

    if (config.brightness !== undefined) {
      parts.push(`brightness=${config.brightness}`);
    }

    if (config.contrast !== undefined) {
      parts.push(`contrast=${config.contrast}`);
    }

    if (config.saturation !== undefined) {
      parts.push(`saturation=${config.saturation}`);
    }

    if (config.gamma !== undefined) {
      parts.push(`gamma=${config.gamma}`);
    }

    let filter = `eq=${parts.join(':')}`;

    if (config.hue !== undefined) {
      filter += `,hue=h=${config.hue}`;
    }

    return filter;
  }

  /**
   * Constrói filtro de efeito especial
   */
  private buildSpecialEffect(config: SpecialEffectConfig): string {
    const intensity = config.intensity || 0.5;
    const radius = config.radius || 5;

    const filters: Record<SpecialEffect, string> = {
      blur: `boxblur=${radius}:${radius}`,
      sharpen: `unsharp=5:5:${intensity}:5:5:0`,
      glow: `boxblur=${radius}:${radius},eq=brightness=${intensity}`,
      vignette: `vignette=angle=PI/4:mode=forward`,
      'edge-detect': `edgedetect=low=0.1:high=0.4`,
      emboss: `convolution='0 -1 0 -1 4 -1 0 -1 0:0 -1 0 -1 4 -1 0 -1 0:0 -1 0 -1 4 -1 0 -1 0:0 -1 0 -1 4 -1 0 -1 0'`,
      cartoon: `bilateral=sigmaS=5:sigmaR=0.1,edgedetect=mode=colormix`,
      'oil-paint': `smartblur=lr=3:ls=-1.0`,
      noise: `noise=alls=${intensity * 20}:allf=t+u`
    };

    return filters[config.type];
  }

  /**
   * Constrói filtro de efeito temporal
   */
  private buildTemporalEffect(config: TemporalEffectConfig): string {
    const speed = config.speed || 1.0;

    switch (config.type) {
      case 'slow-motion':
        return `setpts=${1/speed}*PTS`;
      case 'time-lapse':
        return `setpts=${speed}*PTS`;
      case 'reverse':
        return `reverse`;
      case 'freeze':
        return `tpad=stop_mode=clone:stop_duration=${config.duration || 2}`;
      default:
        return `setpts=PTS`;
    }
  }

  /**
   * Constrói filtro de transição
   */
  private buildTransitionFilter(config: TransitionConfig): string {
    const duration = config.duration || 1;
    const offset = config.offset || 0;

    const transitions: Record<TransitionType, string> = {
      fade: `xfade=transition=fade:duration=${duration}:offset=${offset}`,
      dissolve: `xfade=transition=dissolve:duration=${duration}:offset=${offset}`,
      'wipe-left': `xfade=transition=wipeleft:duration=${duration}:offset=${offset}`,
      'wipe-right': `xfade=transition=wiperight:duration=${duration}:offset=${offset}`,
      'wipe-up': `xfade=transition=wipeup:duration=${duration}:offset=${offset}`,
      'wipe-down': `xfade=transition=wipedown:duration=${duration}:offset=${offset}`,
      'slide-left': `xfade=transition=slideleft:duration=${duration}:offset=${offset}`,
      'slide-right': `xfade=transition=slideright:duration=${duration}:offset=${offset}`,
      'zoom-in': `xfade=transition=zoomin:duration=${duration}:offset=${offset}`,
      'zoom-out': `xfade=transition=fadeblack:duration=${duration}:offset=${offset}`,
      circle: `xfade=transition=circleopen:duration=${duration}:offset=${offset}`
    };

    return transitions[config.type];
  }

  /**
   * Constrói filtro de split screen
   */
  private buildSplitScreenFilter(config: SplitScreenConfig): string {
    const gap = config.gap || 0;

    switch (config.layout) {
      case '2-horizontal':
        return `[0:v]scale=iw/2:-1[left];[1:v]scale=iw/2:-1[right];[left][right]hstack=inputs=2`;
      
      case '2-vertical':
        return `[0:v]scale=-1:ih/2[top];[1:v]scale=-1:ih/2[bottom];[top][bottom]vstack=inputs=2`;
      
      case '3-grid':
        return `[0:v]scale=iw/2:-1[v0];[1:v]scale=iw/2:-1[v1];[2:v]scale=-1:ih/2[v2];[v0][v1]hstack[top];[top][v2]vstack`;
      
      case '4-grid':
        return `[0:v]scale=iw/2:ih/2[v0];[1:v]scale=iw/2:ih/2[v1];[2:v]scale=iw/2:ih/2[v2];[3:v]scale=iw/2:ih/2[v3];[v0][v1]hstack[top];[v2][v3]hstack[bottom];[top][bottom]vstack`;
      
      default:
        return '';
    }
  }

  /**
   * Processa vídeo com filtros
   */
  private async processVideo(
    inputPath: string,
    outputPath: string,
    filters: string[],
    options: ProcessingOptions,
    config: EffectsConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      // Adicionar overlay se picture-in-picture
      if (config.pictureInPicture) {
        command = command.input(config.pictureInPicture.overlayPath);
        const pipFilter = this.buildPictureInPictureFilter(config.pictureInPicture);
        filters.push(pipFilter);
      }

      // Configurar codec e opções
      command = command
        .videoCodec(options.videoCodec!)
        .audioCodec(options.audioCodec!)
        .outputOptions([
          `-preset ${options.preset}`,
          `-crf ${options.crf}`
        ]);

      // Aplicar filtros
      if (filters.length > 0) {
        const filterComplex = filters.join(',');
        command = command.videoFilters(filterComplex);
      }

      // Aplicar resolução se especificada
      if (options.resolution) {
        command = command.size(`${options.resolution.width}x${options.resolution.height}`);
      }

      // Aplicar FPS se especificado
      if (options.fps) {
        command = command.fps(options.fps);
      }

      command
        .on('start', (commandLine) => {
          this.emit('start', { command: commandLine });
        })
        .on('progress', (progress: any) => {
          const progressEvent: ProgressEvent = {
            percent: progress.percent || 0,
            fps: progress.currentFps || 0,
            speed: progress.currentKbps ? `${progress.currentKbps}kbps` : '0kbps',
            timeProcessed: 0,
            totalTime: 0
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
   * Processa split screen
   */
  private async processSplitScreen(
    videos: string[],
    outputPath: string,
    filter: string,
    options: ProcessingOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg();

      // Adicionar todos os vídeos como inputs
      videos.forEach(video => {
        command = command.input(video);
      });

      command
        .complexFilter(filter)
        .videoCodec(options.videoCodec!)
        .audioCodec(options.audioCodec!)
        .outputOptions([
          `-preset ${options.preset}`,
          `-crf ${options.crf}`
        ])
        .on('end', () => resolve())
        .on('error', (error) => reject(error))
        .save(outputPath);
    });
  }

  /**
   * Processa transição entre vídeos
   */
  private async processTransition(
    video1: string,
    video2: string,
    outputPath: string,
    filter: string,
    options: ProcessingOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(video1)
        .input(video2)
        .complexFilter(filter)
        .videoCodec(options.videoCodec!)
        .audioCodec(options.audioCodec!)
        .outputOptions([
          `-preset ${options.preset}`,
          `-crf ${options.crf}`
        ])
        .on('end', () => resolve())
        .on('error', (error) => reject(error))
        .save(outputPath);
    });
  }

  /**
   * Constrói filtro de picture-in-picture
   */
  private buildPictureInPictureFilter(config: PictureInPictureConfig): string {
    const x = typeof config.x === 'string' ? config.x : `${config.x}`;
    const y = typeof config.y === 'string' ? config.y : `${config.y}`;
    const opacity = config.opacity || 1.0;

    let filter = `[1:v]`;

    if (config.width || config.height) {
      filter += `scale=${config.width || -1}:${config.height || -1},`;
    }

    if (opacity < 1.0) {
      filter += `format=rgba,colorchannelmixer=aa=${opacity},`;
    }

    filter += `[pip];[0:v][pip]overlay=${x}:${y}`;

    if (config.startTime !== undefined) {
      filter += `:enable='between(t,${config.startTime},${config.startTime + (config.duration || 999)})'`;
    }

    return filter;
  }

  /**
   * Gera caminho de saída automaticamente
   */
  private generateOutputPath(inputPath: string): string {
    const ext = path.extname(inputPath);
    const base = path.basename(inputPath, ext);
    const dir = path.dirname(inputPath);
    return path.join(dir, `${base}_effects${ext}`);
  }

  /**
   * Obtém informações do vídeo
   */
  async getVideoInfo(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Cria motor de efeitos básico
 */
export function createBasicEffects(): VideoEffects {
  return new VideoEffects();
}

/**
 * Cria preset vintage/retrô
 */
export function createVintageEffects(): {
  effects: VideoEffects;
  config: EffectsConfig;
} {
  return {
    effects: new VideoEffects(),
    config: {
      colorFilter: { type: 'vintage', intensity: 0.8 },
      colorCorrection: {
        brightness: 0.05,
        contrast: 0.15,
        saturation: 0.7
      },
      specialEffects: [
        { type: 'vignette', intensity: 0.6 }
      ]
    }
  };
}

/**
 * Cria preset cinematográfico
 */
export function createCinematicEffects(): {
  effects: VideoEffects;
  config: EffectsConfig;
} {
  return {
    effects: new VideoEffects(),
    config: {
      colorFilter: { type: 'cinema', intensity: 1.0 },
      colorCorrection: {
        contrast: 0.2,
        saturation: 1.1
      },
      specialEffects: [
        { type: 'vignette', intensity: 0.4 }
      ]
    }
  };
}

/**
 * Cria preset noir/preto e branco
 */
export function createNoirEffects(): {
  effects: VideoEffects;
  config: EffectsConfig;
} {
  return {
    effects: new VideoEffects(),
    config: {
      colorFilter: { type: 'noir', intensity: 1.0 },
      colorCorrection: {
        contrast: 0.3,
        brightness: -0.05
      }
    }
  };
}

/**
 * Cria preset vibrante/colorido
 */
export function createVibrantEffects(): {
  effects: VideoEffects;
  config: EffectsConfig;
} {
  return {
    effects: new VideoEffects(),
    config: {
      colorFilter: { type: 'vibrant', intensity: 1.0 },
      colorCorrection: {
        saturation: 1.4,
        contrast: 0.1,
        brightness: 0.05
      }
    }
  };
}

/**
 * Cria preset slow motion
 */
export function createSlowMotionEffects(speed: number = 0.5): {
  effects: VideoEffects;
  config: EffectsConfig;
} {
  return {
    effects: new VideoEffects(),
    config: {
      temporalEffect: {
        type: 'slow-motion',
        speed
      }
    }
  };
}

export default VideoEffects;
