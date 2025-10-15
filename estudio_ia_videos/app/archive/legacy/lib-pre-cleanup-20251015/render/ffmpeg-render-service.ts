
/**
 * 🎬 FFmpeg Render Service - Professional Video Rendering
 * FASE 2: Sistema real de renderização com FFmpeg
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { uploadToS3 } from '@/lib/aws/s3-service';

export interface RenderSlide {
  id: string;
  imageUrl: string;
  audioUrl?: string;
  duration: number;
  transition?: 'fade' | 'slide' | 'zoom' | 'none';
  transitionDuration?: number;
  title?: string;
  content?: string;
}

export interface RenderConfig {
  width: number;
  height: number;
  fps: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  format: 'mp4' | 'webm';
  codec?: 'h264' | 'vp9';
  bitrate?: string;
  audioCodec?: 'aac' | 'opus';
  audioBitrate?: string;
}

export interface RenderProgress {
  phase: 'initializing' | 'downloading' | 'rendering' | 'encoding' | 'uploading' | 'complete';
  progress: number;
  currentSlide?: number;
  totalSlides?: number;
  timeElapsed: number;
  timeRemaining?: number;
  message: string;
}

export interface RenderResult {
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  fileSize?: number;
  error?: string;
  metadata?: {
    width: number;
    height: number;
    fps: number;
    bitrate: number;
  };
}

export class FFmpegRenderService {
  private ffmpeg: FFmpeg;
  private loaded = false;
  private onProgress?: (progress: RenderProgress) => void;
  private startTime = 0;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  /**
   * Initialize FFmpeg
   */
  async initialize(): Promise<void> {
    if (this.loaded) return;

    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.loaded = true;
      console.log('✅ FFmpeg initialized successfully');
    } catch (error) {
      console.error('❌ FFmpeg initialization failed:', error);
      throw new Error('Failed to initialize FFmpeg');
    }
  }

  /**
   * Set progress callback
   */
  setProgressCallback(callback: (progress: RenderProgress) => void): void {
    this.onProgress = callback;
  }

  /**
   * Report progress
   */
  private reportProgress(phase: RenderProgress['phase'], progress: number, message: string, currentSlide?: number, totalSlides?: number): void {
    if (this.onProgress) {
      const timeElapsed = Date.now() - this.startTime;
      const timeRemaining = progress > 0 ? (timeElapsed / progress * (100 - progress)) : undefined;

      this.onProgress({
        phase,
        progress,
        currentSlide,
        totalSlides,
        timeElapsed,
        timeRemaining,
        message
      });
    }
  }

  /**
   * Render video from slides - REAL IMPLEMENTATION
   */
  async renderVideo(
    slides: RenderSlide[],
    config: RenderConfig,
    projectId: string
  ): Promise<RenderResult> {
    this.startTime = Date.now();

    if (!this.loaded) {
      await this.initialize();
    }

    try {
      this.reportProgress('initializing', 0, 'Inicializando renderização...', 0, slides.length);
      
      // 1. Download all assets
      this.reportProgress('downloading', 5, 'Baixando assets...', 0, slides.length);
      await this.downloadAssets(slides);
      
      // 2. Render individual slides
      this.reportProgress('rendering', 20, 'Renderizando slides...', 0, slides.length);
      await this.renderSlides(slides, config);
      
      // 3. Concatenate slides
      this.reportProgress('encoding', 60, 'Concatenando vídeo...', slides.length, slides.length);
      const finalVideo = await this.concatenateSlides(slides, config);
      
      // 4. Generate thumbnail
      this.reportProgress('encoding', 80, 'Gerando thumbnail...', slides.length, slides.length);
      const thumbnail = await this.generateThumbnail();
      
      // 5. Upload to S3
      this.reportProgress('uploading', 90, 'Fazendo upload...', slides.length, slides.length);
      const videoUrl = await this.uploadVideo(finalVideo, config.format, projectId);
      const thumbnailUrl = await this.uploadThumbnail(thumbnail, projectId);
      
      // 6. Calculate metadata
      const duration = slides.reduce((sum, slide) => sum + slide.duration, 0);
      const fileSize = finalVideo.length;
      
      this.reportProgress('complete', 100, 'Renderização concluída!', slides.length, slides.length);
      
      return {
        success: true,
        videoUrl,
        thumbnailUrl,
        duration,
        fileSize,
        metadata: {
          width: config.width,
          height: config.height,
          fps: config.fps,
          bitrate: this.calculateBitrate(config)
        }
      };
      
    } catch (error: any) {
      console.error('❌ Render failed:', error);
      return {
        success: false,
        error: `Render failed: ${error.message}`,
        duration: 0
      };
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Download all assets (images and audio)
   */
  private async downloadAssets(slides: RenderSlide[]): Promise<void> {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      // Download image
      if (slide.imageUrl) {
        try {
          const imageData = await fetchFile(slide.imageUrl);
          await this.ffmpeg.writeFile(`slide_${i}.jpg`, imageData);
        } catch (error) {
          console.warn(`⚠️ Failed to download image for slide ${i}:`, error);
          // Create placeholder image
          await this.createPlaceholderImage(i, slide.title || `Slide ${i + 1}`);
        }
      } else {
        // Create placeholder if no image
        await this.createPlaceholderImage(i, slide.title || `Slide ${i + 1}`);
      }
      
      // Download audio if exists
      if (slide.audioUrl) {
        try {
          const audioData = await fetchFile(slide.audioUrl);
          await this.ffmpeg.writeFile(`audio_${i}.mp3`, audioData);
        } catch (error) {
          console.warn(`⚠️ Failed to download audio for slide ${i}:`, error);
        }
      }
      
      const progress = 5 + (i / slides.length) * 15; // 5-20%
      this.reportProgress('downloading', progress, `Baixado slide ${i + 1}/${slides.length}`, i + 1, slides.length);
    }
  }

  /**
   * Create placeholder image for slides without images
   */
  private async createPlaceholderImage(index: number, title: string): Promise<void> {
    // Create SVG placeholder
    const svg = `
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#2563eb"/>
        <text x="50%" y="40%" text-anchor="middle" fill="white" font-size="72" font-family="Arial, sans-serif">
          ${title}
        </text>
        <text x="50%" y="60%" text-anchor="middle" fill="#e2e8f0" font-size="48" font-family="Arial, sans-serif">
          Slide ${index + 1}
        </text>
      </svg>
    `;
    
    // Convert SVG to image using FFmpeg
    await this.ffmpeg.writeFile(`placeholder_${index}.svg`, new TextEncoder().encode(svg));
    await this.ffmpeg.exec([
      '-i', `placeholder_${index}.svg`,
      '-vf', 'scale=1920:1080',
      `slide_${index}.jpg`
    ]);
  }

  /**
   * Render individual slides
   */
  private async renderSlides(slides: RenderSlide[], config: RenderConfig): Promise<void> {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      // Build FFmpeg command for this slide
      const commands = [
        '-loop', '1',
        '-i', `slide_${i}.jpg`,
        '-t', slide.duration.toString(),
        '-vf', `scale=${config.width}:${config.height}:force_original_aspect_ratio=decrease,pad=${config.width}:${config.height}:(ow-iw)/2:(oh-ih)/2`,
        '-c:v', config.codec || 'libx264',
        '-r', config.fps.toString(),
        '-pix_fmt', 'yuv420p'
      ];
      
      // Add audio if exists
      if (slide.audioUrl) {
        commands.push('-i', `audio_${i}.mp3`);
        commands.push('-c:a', config.audioCodec || 'aac');
        commands.push('-b:a', config.audioBitrate || '128k');
        commands.push('-shortest');
      } else {
        commands.push('-an'); // No audio
      }
      
      // Add transition effect
      if (slide.transition && slide.transition !== 'none') {
        commands.push('-vf', this.getTransitionFilter(slide.transition));
      }
      
      // Quality settings
      commands.push(...this.getQualitySettings(config));
      
      commands.push(`slide_${i}_rendered.${config.format}`);
      
      await this.ffmpeg.exec(commands);
      
      const progress = 20 + (i / slides.length) * 40; // 20-60%
      this.reportProgress('rendering', progress, `Renderizado slide ${i + 1}/${slides.length}`, i + 1, slides.length);
    }
  }

  /**
   * Concatenate all slides into final video
   */
  private async concatenateSlides(slides: RenderSlide[], config: RenderConfig): Promise<Uint8Array> {
    this.reportProgress('encoding', 60, 'Concatenando slides...');
    
    // Create input list for FFmpeg
    const inputList = slides.map((_, i) => `file 'slide_${i}.mp4'`).join('\n');
    await this.ffmpeg.writeFile('input.txt', inputList);
    
    const qualitySettings = this.getQualitySettings(config);
    
    const commands = [
      '-f', 'concat',
      '-safe', '0',
      '-i', 'input.txt',
      ...qualitySettings,
      '-y',
      'final_video.mp4'
    ];
    
    await this.ffmpeg.exec(commands);
    
    this.reportProgress('encoding', 80, 'Vídeo concatenado com sucesso');
    
    const data = await this.ffmpeg.readFile('final_video.mp4');
    return new Uint8Array(data as ArrayBuffer);
  }

  /**
   * Generate thumbnail from first frame
   */
  private async generateThumbnail(): Promise<Uint8Array> {
    await this.ffmpeg.exec([
      '-i', 'slide_0.jpg',
      '-vf', 'scale=320:180',
      '-frames:v', '1',
      'thumbnail.jpg'
    ]);
    
    const data = await this.ffmpeg.readFile('thumbnail.jpg');
    return new Uint8Array(data as ArrayBuffer);
  }

  /**
   * Upload video to S3
   */
  private async uploadVideo(videoData: Uint8Array, format: string, projectId: string): Promise<string> {
    const fileName = `videos/${projectId}/video.${format}`;
    const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm';
    
    return await uploadToS3(
      Buffer.from(videoData),
      fileName,
      mimeType
    );
  }

  /**
   * Upload thumbnail to S3
   */
  private async uploadThumbnail(thumbnailData: Uint8Array, projectId: string): Promise<string> {
    const fileName = `videos/${projectId}/thumbnail.jpg`;
    
    return await uploadToS3(
      Buffer.from(thumbnailData),
      fileName,
      'image/jpeg'
    );
  }

  /**
   * Get transition filter
   */
  private getTransitionFilter(transition: string): string {
    switch (transition) {
      case 'fade':
        return 'fade=t=in:st=0:d=0.5,fade=t=out:st=4.5:d=0.5';
      case 'slide':
        return 'slide=in:left';
      case 'zoom':
        return 'zoompan=z=\'min(zoom+0.0015,1.5)\':d=125';
      default:
        return '';
    }
  }

  /**
   * Get quality settings
   */
  private getQualitySettings(config: RenderConfig): string[] {
    const settings: Record<string, string[]> = {
      low: ['-crf', '28', '-preset', 'ultrafast'],
      medium: ['-crf', '23', '-preset', 'fast'],
      high: ['-crf', '18', '-preset', 'medium'],
      ultra: ['-crf', '15', '-preset', 'slow']
    };
    
    return settings[config.quality] || settings.medium;
  }

  /**
   * Clean up temporary files
   */
  async cleanup(): Promise<void> {
    try {
      // FFmpeg.wasm cleans up automatically when instance is destroyed
      console.log('✅ Cleanup complete');
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error);
    }
  }
}

// Export singleton
let renderService: FFmpegRenderService | null = null;

export function getRenderService(): FFmpegRenderService {
  if (!renderService) {
    renderService = new FFmpegRenderService();
  }
  return renderService;
}
