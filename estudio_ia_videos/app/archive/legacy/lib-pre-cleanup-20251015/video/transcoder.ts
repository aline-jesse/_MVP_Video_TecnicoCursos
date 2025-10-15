/**
 * Video Transcoder Module
 * 
 * Sistema completo de transcodificação com:
 * - Múltiplos formatos de saída
 * - Adaptive bitrate streaming (HLS/DASH)
 * - Otimização automática
 * - Múltiplas resoluções simultâneas
 * - Progress tracking
 */

import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { EventEmitter } from 'events';
import path from 'path';
import { promises as fs } from 'fs';

// ==================== TYPES ====================

export enum VideoFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  AVI = 'avi',
  MOV = 'mov',
  MKV = 'mkv',
  HLS = 'hls',      // HTTP Live Streaming
  DASH = 'dash'     // Dynamic Adaptive Streaming
}

export enum VideoCodec {
  H264 = 'libx264',
  H265 = 'libx265',
  VP8 = 'libvpx',
  VP9 = 'libvpx-vp9',
  AV1 = 'libaom-av1'
}

export enum AudioCodec {
  AAC = 'aac',
  MP3 = 'libmp3lame',
  OPUS = 'libopus',
  VORBIS = 'libvorbis'
}

export enum VideoPreset {
  ULTRAFAST = 'ultrafast',  // Rápido, maior tamanho
  SUPERFAST = 'superfast',
  VERYFAST = 'veryfast',
  FASTER = 'faster',
  FAST = 'fast',
  MEDIUM = 'medium',        // Balanceado (padrão)
  SLOW = 'slow',
  SLOWER = 'slower',
  VERYSLOW = 'veryslow'     // Lento, menor tamanho
}

export interface Resolution {
  width: number;
  height: number;
  bitrate: number;
  name: string;
}

export interface TranscodeOptions {
  format: VideoFormat;
  videoCodec?: VideoCodec;
  audioCodec?: AudioCodec;
  preset?: VideoPreset;
  quality?: number;          // CRF: 0-51 (menor = melhor)
  resolution?: Resolution;
  fps?: number;
  audioBitrate?: string;     // Ex: '128k', '192k'
  videoBitrate?: string;     // Ex: '2M', '5M'
  twoPass?: boolean;         // Encoding de 2 passes
  optimize?: boolean;        // Otimização automática
  customFilters?: string[];  // Filtros FFmpeg customizados
}

export interface TranscodeProgress {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
  percent: number;
}

export interface TranscodeResult {
  success: boolean;
  outputPath: string;
  format: VideoFormat;
  resolution: Resolution;
  fileSize: number;
  duration: number;
  bitrate: number;
  codec: string;
  processingTime: number;
  error?: string;
}

export interface MultiResolutionOutput {
  resolutions: Resolution[];
  outputDir: string;
  hlsPlaylist?: string;      // Path para m3u8
  dashManifest?: string;     // Path para MPD
}

// ==================== CONSTANTS ====================

export const STANDARD_RESOLUTIONS: Record<string, Resolution> = {
  '4K': { width: 3840, height: 2160, bitrate: 15000, name: '4K' },
  '1080p': { width: 1920, height: 1080, bitrate: 5000, name: '1080p' },
  '720p': { width: 1280, height: 720, bitrate: 2500, name: '720p' },
  '480p': { width: 854, height: 480, bitrate: 1000, name: '480p' },
  '360p': { width: 640, height: 360, bitrate: 500, name: '360p' }
};

const DEFAULT_OPTIONS: Required<Omit<TranscodeOptions, 'resolution' | 'customFilters'>> = {
  format: VideoFormat.MP4,
  videoCodec: VideoCodec.H264,
  audioCodec: AudioCodec.AAC,
  preset: VideoPreset.MEDIUM,
  quality: 23,              // CRF 23 = boa qualidade
  fps: 30,
  audioBitrate: '128k',
  videoBitrate: '2M',
  twoPass: false,
  optimize: true
};

// ==================== VIDEO TRANSCODER CLASS ====================

export class VideoTranscoder extends EventEmitter {
  private activeTranscodes: Map<string, FfmpegCommand>;

  constructor() {
    super();
    this.activeTranscodes = new Map();
  }

  /**
   * Transcodifica vídeo para formato específico
   */
  async transcode(
    inputPath: string,
    outputPath: string,
    options?: Partial<TranscodeOptions>
  ): Promise<TranscodeResult> {
    const startTime = Date.now();
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const transcodeId = this.generateTranscodeId();

    return new Promise((resolve, reject) => {
      const result: TranscodeResult = {
        success: false,
        outputPath,
        format: opts.format,
        resolution: options?.resolution || { width: 0, height: 0, bitrate: 0, name: 'original' },
        fileSize: 0,
        duration: 0,
        bitrate: 0,
        codec: opts.videoCodec,
        processingTime: 0
      };

      try {
        let command = ffmpeg(inputPath);

        // Configurar codec de vídeo
        command = command.videoCodec(opts.videoCodec);

        // Configurar codec de áudio
        command = command.audioCodec(opts.audioCodec);

        // Configurar preset
        if (opts.videoCodec === VideoCodec.H264 || opts.videoCodec === VideoCodec.H265) {
          command = command.addOption('-preset', opts.preset);
          command = command.addOption('-crf', opts.quality.toString());
        }

        // Configurar resolução
        if (options?.resolution) {
          command = command.size(`${options.resolution.width}x${options.resolution.height}`);
          command = command.videoBitrate(options.resolution.bitrate + 'k');
        } else if (opts.videoBitrate) {
          command = command.videoBitrate(opts.videoBitrate);
        }

        // Configurar FPS
        if (opts.fps) {
          command = command.fps(opts.fps);
        }

        // Configurar áudio
        command = command.audioBitrate(opts.audioBitrate);
        command = command.audioChannels(2);
        command = command.audioFrequency(48000);

        // Otimizações
        if (opts.optimize) {
          command = this.applyOptimizations(command, opts);
        }

        // Filtros customizados
        if (options?.customFilters) {
          command = command.videoFilters(options.customFilters);
        }

        // Configurar formato de saída
        if (opts.format === VideoFormat.HLS) {
          command = this.configureHLS(command, outputPath);
        } else if (opts.format === VideoFormat.DASH) {
          command = this.configureDASH(command, outputPath);
        } else {
          command = command.format(opts.format);
        }

        // Progress tracking
        command = command.on('progress', (progress) => {
          const transcodeProgress: TranscodeProgress = {
            frames: progress.frames || 0,
            currentFps: progress.currentFps || 0,
            currentKbps: progress.currentKbps || 0,
            targetSize: progress.targetSize || 0,
            timemark: progress.timemark || '00:00:00',
            percent: this.calculatePercent(progress.timemark)
          };

          this.emit('progress', transcodeId, transcodeProgress);
        });

        // Salvar comando ativo
        this.activeTranscodes.set(transcodeId, command);

        // Executar
        command
          .output(outputPath)
          .on('end', async () => {
            this.activeTranscodes.delete(transcodeId);

            // Obter informações do arquivo de saída
            const stats = await fs.stat(outputPath);
            const metadata = await this.getMetadata(outputPath);

            result.success = true;
            result.fileSize = stats.size;
            result.duration = metadata.duration;
            result.bitrate = metadata.bitrate;
            result.processingTime = Date.now() - startTime;

            this.emit('complete', transcodeId, result);
            resolve(result);
          })
          .on('error', (err) => {
            this.activeTranscodes.delete(transcodeId);
            result.error = err.message;
            result.processingTime = Date.now() - startTime;

            this.emit('error', transcodeId, err);
            reject(err);
          })
          .run();

      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error';
        result.processingTime = Date.now() - startTime;
        reject(error);
      }
    });
  }

  /**
   * Transcodifica para múltiplas resoluções (Adaptive Bitrate)
   */
  async transcodeMultiResolution(
    inputPath: string,
    outputDir: string,
    resolutions: Resolution[] = Object.values(STANDARD_RESOLUTIONS),
    options?: Partial<TranscodeOptions>
  ): Promise<MultiResolutionOutput> {
    // Criar diretório de saída
    await fs.mkdir(outputDir, { recursive: true });

    const results: TranscodeResult[] = [];
    const baseName = path.basename(inputPath, path.extname(inputPath));

    // Transcodificar para cada resolução
    for (const resolution of resolutions) {
      const outputPath = path.join(outputDir, `${baseName}_${resolution.name}.mp4`);

      const result = await this.transcode(inputPath, outputPath, {
        ...options,
        resolution
      });

      results.push(result);
      this.emit('resolution:complete', resolution.name, result);
    }

    const output: MultiResolutionOutput = {
      resolutions,
      outputDir
    };

    // Gerar HLS playlist se solicitado
    if (options?.format === VideoFormat.HLS) {
      output.hlsPlaylist = await this.generateHLSPlaylist(outputDir, results);
    }

    // Gerar DASH manifest se solicitado
    if (options?.format === VideoFormat.DASH) {
      output.dashManifest = await this.generateDASHManifest(outputDir, results);
    }

    return output;
  }

  /**
   * Cancela transcodificação em andamento
   */
  async cancelTranscode(transcodeId: string): Promise<boolean> {
    const command = this.activeTranscodes.get(transcodeId);
    if (!command) return false;

    return new Promise((resolve) => {
      command.on('error', () => {
        this.activeTranscodes.delete(transcodeId);
        resolve(true);
      });
      command.kill('SIGKILL');
    });
  }

  /**
   * Obtém lista de transcodificações ativas
   */
  getActiveTranscodes(): string[] {
    return Array.from(this.activeTranscodes.keys());
  }

  // ==================== PRIVATE METHODS ====================

  private applyOptimizations(command: FfmpegCommand, opts: typeof DEFAULT_OPTIONS): FfmpegCommand {
    // Otimizações para H.264
    if (opts.videoCodec === VideoCodec.H264) {
      command = command
        .addOption('-movflags', '+faststart')  // Fast start para web
        .addOption('-profile:v', 'main')       // Perfil main
        .addOption('-level', '4.0');           // Level 4.0
    }

    // Otimizações para VP9
    if (opts.videoCodec === VideoCodec.VP9) {
      command = command
        .addOption('-deadline', 'good')
        .addOption('-cpu-used', '2')
        .addOption('-row-mt', '1');
    }

    return command;
  }

  private configureHLS(command: FfmpegCommand, outputPath: string): FfmpegCommand {
    const dir = path.dirname(outputPath);
    const basename = path.basename(outputPath, path.extname(outputPath));

    return command
      .addOption('-hls_time', '10')                          // 10s segments
      .addOption('-hls_playlist_type', 'vod')
      .addOption('-hls_segment_filename', path.join(dir, `${basename}_%03d.ts`))
      .format('hls');
  }

  private configureDASH(command: FfmpegCommand, outputPath: string): FfmpegCommand {
    return command
      .addOption('-seg_duration', '10')
      .addOption('-use_template', '1')
      .addOption('-use_timeline', '1')
      .format('dash');
  }

  private async generateHLSPlaylist(outputDir: string, results: TranscodeResult[]): Promise<string> {
    const playlistPath = path.join(outputDir, 'master.m3u8');
    let content = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

    for (const result of results) {
      if (result.success) {
        content += `#EXT-X-STREAM-INF:BANDWIDTH=${result.bitrate},RESOLUTION=${result.resolution.width}x${result.resolution.height}\n`;
        content += `${path.basename(result.outputPath)}\n`;
      }
    }

    await fs.writeFile(playlistPath, content);
    return playlistPath;
  }

  private async generateDASHManifest(outputDir: string, results: TranscodeResult[]): Promise<string> {
    const manifestPath = path.join(outputDir, 'manifest.mpd');
    
    // Implementação simplificada - em produção usar biblioteca XML
    let content = '<?xml version="1.0" encoding="UTF-8"?>\n';
    content += '<MPD xmlns="urn:mpeg:dash:schema:mpd:2011">\n';
    content += '  <Period>\n';
    
    for (const result of results) {
      if (result.success) {
        content += `    <AdaptationSet>\n`;
        content += `      <Representation bandwidth="${result.bitrate}" width="${result.resolution.width}" height="${result.resolution.height}">\n`;
        content += `        <BaseURL>${path.basename(result.outputPath)}</BaseURL>\n`;
        content += `      </Representation>\n`;
        content += `    </AdaptationSet>\n`;
      }
    }
    
    content += '  </Period>\n';
    content += '</MPD>';

    await fs.writeFile(manifestPath, content);
    return manifestPath;
  }

  private async getMetadata(filePath: string): Promise<{ duration: number; bitrate: number }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          duration: metadata.format.duration || 0,
          bitrate: parseInt(metadata.format.bit_rate || '0')
        });
      });
    });
  }

  private calculatePercent(timemark: string): number {
    // Converter timemark para segundos
    const parts = timemark.split(':');
    if (parts.length !== 3) return 0;

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseFloat(parts[2]);

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    // Estimativa básica - em produção, usar duração total do vídeo
    return Math.min(totalSeconds / 100, 100);
  }

  private generateTranscodeId(): string {
    return `transcode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Cria transcoder otimizado para web
 */
export function createWebTranscoder(): VideoTranscoder {
  return new VideoTranscoder();
}

/**
 * Transcodifica para formato otimizado para NR
 */
export async function transcodeForNR(
  inputPath: string,
  outputPath: string
): Promise<TranscodeResult> {
  const transcoder = new VideoTranscoder();

  return transcoder.transcode(inputPath, outputPath, {
    format: VideoFormat.MP4,
    videoCodec: VideoCodec.H264,
    audioCodec: AudioCodec.AAC,
    preset: VideoPreset.MEDIUM,
    quality: 23,
    resolution: STANDARD_RESOLUTIONS['720p'],
    optimize: true
  });
}

/**
 * Cria múltiplas resoluções para streaming adaptativo
 */
export async function createAdaptiveStream(
  inputPath: string,
  outputDir: string
): Promise<MultiResolutionOutput> {
  const transcoder = new VideoTranscoder();

  const resolutions = [
    STANDARD_RESOLUTIONS['1080p'],
    STANDARD_RESOLUTIONS['720p'],
    STANDARD_RESOLUTIONS['480p'],
    STANDARD_RESOLUTIONS['360p']
  ];

  return transcoder.transcodeMultiResolution(inputPath, outputDir, resolutions, {
    format: VideoFormat.HLS,
    optimize: true
  });
}

export default VideoTranscoder;
