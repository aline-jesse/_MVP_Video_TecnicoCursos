/**
 * 🎬 FFMPEG UTILS - Sprint 48 - FASE 2
 * Utilitários para renderização de vídeo com FFmpeg
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export interface FFmpegConfig {
  resolution: string;
  fps: number;
  format: string;
  quality: string;
  duration: number;
  codec?: string;
  preset?: string;
  crf?: number;
}

export interface VideoScene {
  id: string;
  duration: number;
  background: string;
  elements: VideoElement[];
}

export interface VideoElement {
  type: 'text' | 'image' | 'audio' | 'shape' | 'animation';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  style?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    opacity?: number;
  };
  animation?: {
    type: 'fadeIn' | 'fadeOut' | 'slideIn' | 'slideOut' | 'zoom' | 'rotate';
    duration: number;
    delay?: number;
    easing?: string;
  };
  timing: {
    start: number;
    end: number;
  };
}

export interface RenderProgress {
  percentage: number;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  speed: number;
  time: string;
  bitrate: string;
}

export class FFmpegRenderer {
  private ffmpegPath: string;
  private workDir: string;

  constructor(workDir: string, ffmpegPath: string = 'ffmpeg') {
    this.workDir = workDir;
    this.ffmpegPath = ffmpegPath;
  }

  /**
   * Verifica se FFmpeg está disponível
   */
  public static async checkFFmpegAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      const ffmpeg = spawn('ffmpeg', ['-version']);
      
      ffmpeg.on('close', (code) => {
        resolve(code === 0);
      });
      
      ffmpeg.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Renderiza vídeo a partir de cenas
   */
  public async renderVideo(
    scenes: VideoScene[],
    config: FFmpegConfig,
    outputPath: string,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<string> {
    try {
      console.log(`🎬 [FFmpeg] Iniciando renderização de ${scenes.length} cenas`);
      
      // 1. Preparar assets e filtros
      const filterComplex = await this.buildFilterComplex(scenes, config);
      
      // 2. Preparar argumentos do FFmpeg
      const args = await this.buildFFmpegArgs(scenes, config, outputPath, filterComplex);
      
      // 3. Executar FFmpeg
      return await this.executeFFmpeg(args, config.duration, onProgress);
      
    } catch (error) {
      console.error('❌ [FFmpeg] Erro na renderização:', error);
      throw error;
    }
  }

  /**
   * Constrói filtros complexos para FFmpeg
   */
  private async buildFilterComplex(scenes: VideoScene[], config: FFmpegConfig): Promise<string> {
    const filters: string[] = [];
    const resolution = this.parseResolution(config.resolution);
    
    // Filtro base: criar canvas vazio
    filters.push(`color=c=black:size=${resolution.width}x${resolution.height}:duration=${config.duration}:rate=${config.fps}[base]`);
    
    let inputIndex = 1; // 0 é o canvas base
    
    for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
      const scene = scenes[sceneIndex];
      const sceneStart = sceneIndex * scene.duration;
      
      // Filtro de background da cena
      if (scene.background && scene.background !== '#000000') {
        filters.push(
          `color=c=${scene.background}:size=${resolution.width}x${resolution.height}:duration=${scene.duration}:rate=${config.fps}[bg${sceneIndex}]`
        );
      }
      
      // Filtros para elementos da cena
      for (const element of scene.elements) {
        const elementFilters = await this.buildElementFilters(
          element,
          sceneIndex,
          inputIndex,
          resolution,
          config.fps,
          sceneStart
        );
        filters.push(...elementFilters);
        inputIndex++;
      }
    }
    
    // Filtro final: combinar todas as camadas
    const overlayChain = this.buildOverlayChain(scenes);
    filters.push(overlayChain);
    
    return filters.join(';');
  }

  /**
   * Constrói filtros para elementos individuais
   */
  private async buildElementFilters(
    element: VideoElement,
    sceneIndex: number,
    inputIndex: number,
    resolution: { width: number; height: number },
    fps: number,
    sceneStart: number
  ): Promise<string[]> {
    const filters: string[] = [];
    const elementStart = sceneStart + element.timing.start;
    const elementDuration = element.timing.end - element.timing.start;
    
    switch (element.type) {
      case 'text':
        filters.push(this.buildTextFilter(element, inputIndex, resolution, fps, elementStart, elementDuration));
        break;
        
      case 'image':
        filters.push(this.buildImageFilter(element, inputIndex, resolution, fps, elementStart, elementDuration));
        break;
        
      case 'shape':
        filters.push(this.buildShapeFilter(element, inputIndex, resolution, fps, elementStart, elementDuration));
        break;
    }
    
    // Adicionar animações se especificadas
    if (element.animation) {
      const animationFilter = this.buildAnimationFilter(element, inputIndex);
      if (animationFilter) {
        filters.push(animationFilter);
      }
    }
    
    return filters;
  }

  /**
   * Constrói filtro de texto
   */
  private buildTextFilter(
    element: VideoElement,
    inputIndex: number,
    resolution: { width: number; height: number },
    fps: number,
    start: number,
    duration: number
  ): string {
    const style = element.style || {};
    const fontSize = style.fontSize || 24;
    const fontColor = style.color || 'white';
    const fontFamily = style.fontFamily || 'Arial';
    
    return `drawtext=text='${element.content}':fontfile='${fontFamily}':fontsize=${fontSize}:fontcolor=${fontColor}:x=${element.position.x}:y=${element.position.y}:enable='between(t,${start},${start + duration})'[text${inputIndex}]`;
  }

  /**
   * Constrói filtro de imagem
   */
  private buildImageFilter(
    element: VideoElement,
    inputIndex: number,
    resolution: { width: number; height: number },
    fps: number,
    start: number,
    duration: number
  ): string {
    const size = element.size || { width: 100, height: 100 };
    
    return `[${inputIndex}:v]scale=${size.width}:${size.height}[img${inputIndex}]`;
  }

  /**
   * Constrói filtro de forma geométrica
   */
  private buildShapeFilter(
    element: VideoElement,
    inputIndex: number,
    resolution: { width: number; height: number },
    fps: number,
    start: number,
    duration: number
  ): string {
    const style = element.style || {};
    const color = style.backgroundColor || 'white';
    const size = element.size || { width: 100, height: 100 };
    
    return `color=c=${color}:size=${size.width}x${size.height}:duration=${duration}[shape${inputIndex}]`;
  }

  /**
   * Constrói filtro de animação
   */
  private buildAnimationFilter(element: VideoElement, inputIndex: number): string | null {
    if (!element.animation) return null;
    
    const { type, duration, delay = 0, easing = 'linear' } = element.animation;
    
    switch (type) {
      case 'fadeIn':
        return `fade=t=in:st=${delay}:d=${duration}[anim${inputIndex}]`;
        
      case 'fadeOut':
        return `fade=t=out:st=${delay}:d=${duration}[anim${inputIndex}]`;
        
      case 'zoom':
        return `scale=w='if(lt(t,${delay}),iw,iw*(1+0.1*sin(2*PI*(t-${delay})/${duration})))':h='if(lt(t,${delay}),ih,ih*(1+0.1*sin(2*PI*(t-${delay})/${duration})))'[anim${inputIndex}]`;
        
      default:
        return null;
    }
  }

  /**
   * Constrói cadeia de overlay
   */
  private buildOverlayChain(scenes: VideoScene[]): string {
    let chain = '[base]';
    let overlayIndex = 0;
    
    for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
      const scene = scenes[sceneIndex];
      
      for (const element of scene.elements) {
        chain += `[${overlayIndex}:v]overlay=${element.position.x}:${element.position.y}:enable='between(t,${element.timing.start},${element.timing.end})'`;
        overlayIndex++;
        
        if (overlayIndex < this.getTotalElements(scenes)) {
          chain += `[tmp${overlayIndex}];[tmp${overlayIndex}]`;
        }
      }
    }
    
    return chain + '[out]';
  }

  /**
   * Conta total de elementos em todas as cenas
   */
  private getTotalElements(scenes: VideoScene[]): number {
    return scenes.reduce((total, scene) => total + scene.elements.length, 0);
  }

  /**
   * Constrói argumentos do FFmpeg
   */
  private async buildFFmpegArgs(
    scenes: VideoScene[],
    config: FFmpegConfig,
    outputPath: string,
    filterComplex: string
  ): Promise<string[]> {
    const args: string[] = [];
    
    // Inputs
    args.push('-f', 'lavfi');
    
    // Adicionar inputs de imagens/vídeos se necessário
    for (const scene of scenes) {
      for (const element of scene.elements) {
        if (element.type === 'image' && element.content.startsWith('http')) {
          args.push('-i', element.content);
        }
      }
    }
    
    // Filtro complexo
    args.push('-filter_complex', filterComplex);
    
    // Mapeamento de saída
    args.push('-map', '[out]');
    
    // Configurações de vídeo
    args.push('-c:v', config.codec || 'libx264');
    args.push('-preset', config.preset || 'medium');
    args.push('-crf', (config.crf || 23).toString());
    args.push('-pix_fmt', 'yuv420p');
    args.push('-r', config.fps.toString());
    
    // Duração
    args.push('-t', config.duration.toString());
    
    // Sobrescrever arquivo existente
    args.push('-y');
    
    // Arquivo de saída
    args.push(outputPath);
    
    return args;
  }

  /**
   * Executa FFmpeg com monitoramento de progresso
   */
  private async executeFFmpeg(
    args: string[],
    duration: number,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(`🎬 [FFmpeg] Executando: ${this.ffmpegPath} ${args.join(' ')}`);
      
      const ffmpeg = spawn(this.ffmpegPath, args);
      let stderrData = '';
      
      ffmpeg.stderr.on('data', (data) => {
        stderrData += data.toString();
        
        if (onProgress) {
          const progress = this.parseProgress(stderrData, duration);
          if (progress) {
            onProgress(progress);
          }
        }
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log('✅ [FFmpeg] Renderização concluída com sucesso');
          resolve(args[args.length - 1]); // Retorna o caminho do arquivo de saída
        } else {
          console.error(`❌ [FFmpeg] Falhou com código: ${code}`);
          console.error('Stderr:', stderrData);
          reject(new Error(`FFmpeg falhou com código ${code}`));
        }
      });
      
      ffmpeg.on('error', (error) => {
        console.error('❌ [FFmpeg] Erro ao executar:', error);
        reject(error);
      });
    });
  }

  /**
   * Analisa progresso do FFmpeg
   */
  private parseProgress(stderr: string, totalDuration: number): RenderProgress | null {
    const timeMatch = stderr.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    const fpsMatch = stderr.match(/fps=\s*(\d+\.?\d*)/);
    const speedMatch = stderr.match(/speed=\s*(\d+\.?\d*)x/);
    const bitrateMatch = stderr.match(/bitrate=\s*(\d+\.?\d*kbits\/s)/);
    
    if (!timeMatch) return null;
    
    const [, hours, minutes, seconds] = timeMatch;
    const currentTime = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
    const percentage = Math.min((currentTime / totalDuration) * 100, 100);
    
    return {
      percentage,
      currentFrame: 0, // Seria necessário parsing adicional
      totalFrames: Math.floor(totalDuration * 30), // Estimativa
      fps: fpsMatch ? parseFloat(fpsMatch[1]) : 0,
      speed: speedMatch ? parseFloat(speedMatch[1]) : 0,
      time: `${hours}:${minutes}:${seconds}`,
      bitrate: bitrateMatch ? bitrateMatch[1] : '0kbits/s',
    };
  }

  /**
   * Analisa resolução
   */
  private parseResolution(resolution: string): { width: number; height: number } {
    const resolutions: Record<string, { width: number; height: number }> = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '4k': { width: 3840, height: 2160 },
      '480p': { width: 854, height: 480 },
      '360p': { width: 640, height: 360 },
    };
    
    if (resolutions[resolution]) {
      return resolutions[resolution];
    }
    
    // Tentar parsing manual (ex: "1920x1080")
    const match = resolution.match(/(\d+)x(\d+)/);
    if (match) {
      return {
        width: parseInt(match[1]),
        height: parseInt(match[2]),
      };
    }
    
    // Fallback para 1080p
    return { width: 1920, height: 1080 };
  }

  /**
   * Gera thumbnail do vídeo
   */
  public async generateThumbnail(
    videoPath: string,
    thumbnailPath: string,
    timeOffset: number = 1
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = [
        '-i', videoPath,
        '-ss', timeOffset.toString(),
        '-vframes', '1',
        '-q:v', '2',
        '-y',
        thumbnailPath
      ];
      
      const ffmpeg = spawn(this.ffmpegPath, args);
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(`📸 [FFmpeg] Thumbnail gerado: ${thumbnailPath}`);
          resolve(thumbnailPath);
        } else {
          reject(new Error(`Erro ao gerar thumbnail, código ${code}`));
        }
      });
      
      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Obtém informações do vídeo
   */
  public async getVideoInfo(videoPath: string): Promise<{
    duration: number;
    width: number;
    height: number;
    fps: number;
    bitrate: number;
    size: number;
  }> {
    return new Promise((resolve, reject) => {
      const args = [
        '-i', videoPath,
        '-f', 'null',
        '-'
      ];
      
      const ffmpeg = spawn(this.ffmpegPath, args);
      let stderr = '';
      
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      ffmpeg.on('close', async () => {
        try {
          const durationMatch = stderr.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
          const resolutionMatch = stderr.match(/(\d{4})x(\d{4})/);
          const fpsMatch = stderr.match(/(\d+\.?\d*) fps/);
          const bitrateMatch = stderr.match(/bitrate: (\d+) kb\/s/);
          
          const stats = await fs.stat(videoPath);
          
          resolve({
            duration: durationMatch ? 
              parseInt(durationMatch[1]) * 3600 + parseInt(durationMatch[2]) * 60 + parseFloat(durationMatch[3]) : 0,
            width: resolutionMatch ? parseInt(resolutionMatch[1]) : 1920,
            height: resolutionMatch ? parseInt(resolutionMatch[2]) : 1080,
            fps: fpsMatch ? parseFloat(fpsMatch[1]) : 30,
            bitrate: bitrateMatch ? parseInt(bitrateMatch[1]) : 0,
            size: stats.size,
          });
        } catch (error) {
          reject(error);
        }
      });
      
      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }
}