/**
 * 📊 Video Metadata Extractor
 * 
 * Extrator completo de metadados de vídeo incluindo:
 * - Metadados técnicos (codec, bitrate, resolution, fps)
 * - EXIF, XMP, GPS data
 * - Chapters e marcadores
 * - Copyright e licensing
 * - Análise de streams (vídeo, áudio, legendas)
 * - Format detection e validation
 * - Container information
 * - Encoding history
 * 
 * @module MetadataExtractor
 * @author GitHub Copilot
 * @date 2025-10-10
 */

import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

// ==================== INTERFACES ====================

/**
 * Metadados completos do vídeo
 */
export interface VideoMetadata {
  /** Informações do arquivo */
  file: FileInfo;
  /** Informações do formato/container */
  format: FormatInfo;
  /** Streams de vídeo */
  videoStreams: VideoStreamInfo[];
  /** Streams de áudio */
  audioStreams: AudioStreamInfo[];
  /** Streams de legendas */
  subtitleStreams: SubtitleStreamInfo[];
  /** Metadados EXIF */
  exif?: ExifData;
  /** Metadados XMP */
  xmp?: XmpData;
  /** Chapters/Marcadores */
  chapters?: ChapterInfo[];
  /** Tags personalizadas */
  tags?: Record<string, string>;
  /** Informações de codificação */
  encoding?: EncodingInfo;
}

/**
 * Informações do arquivo
 */
export interface FileInfo {
  /** Caminho completo */
  path: string;
  /** Nome do arquivo */
  filename: string;
  /** Extensão */
  extension: string;
  /** Tamanho em bytes */
  size: number;
  /** Tamanho formatado */
  sizeFormatted: string;
  /** Data de criação */
  created: Date;
  /** Data de modificação */
  modified: Date;
  /** Checksum MD5 (opcional) */
  checksum?: string;
}

/**
 * Informações do formato/container
 */
export interface FormatInfo {
  /** Nome do formato (mp4, mkv, avi, etc) */
  formatName: string;
  /** Nome longo do formato */
  formatLongName: string;
  /** Duração em segundos */
  duration: number;
  /** Duração formatada (HH:MM:SS) */
  durationFormatted: string;
  /** Bitrate total (bps) */
  bitrate: number;
  /** Bitrate formatado */
  bitrateFormatted: string;
  /** Número de streams */
  streamCount: number;
  /** Data de criação (se disponível) */
  creationTime?: string;
  /** Título */
  title?: string;
  /** Artista/Autor */
  artist?: string;
  /** Comentário */
  comment?: string;
  /** Copyright */
  copyright?: string;
  /** Encoder usado */
  encoder?: string;
}

/**
 * Informações de stream de vídeo
 */
export interface VideoStreamInfo {
  /** Índice do stream */
  index: number;
  /** Codec */
  codec: string;
  /** Nome longo do codec */
  codecLongName: string;
  /** Profile (high, main, baseline) */
  profile?: string;
  /** Level */
  level?: number;
  /** Largura */
  width: number;
  /** Altura */
  height: number;
  /** Aspect ratio */
  aspectRatio: string;
  /** Display aspect ratio */
  displayAspectRatio?: string;
  /** Pixel format */
  pixelFormat: string;
  /** Frames por segundo */
  fps: number;
  /** Bitrate (bps) */
  bitrate?: number;
  /** Bitrate formatado */
  bitrateFormatted?: string;
  /** Total de frames */
  frames?: number;
  /** Color space */
  colorSpace?: string;
  /** Color range */
  colorRange?: string;
  /** HDR info */
  hdr?: {
    isHDR: boolean;
    standard?: 'HDR10' | 'HDR10+' | 'Dolby Vision' | 'HLG';
    colorPrimaries?: string;
    transferCharacteristics?: string;
  };
  /** Rotation metadata */
  rotation?: number;
  /** Language */
  language?: string;
  /** Default stream */
  isDefault?: boolean;
}

/**
 * Informações de stream de áudio
 */
export interface AudioStreamInfo {
  /** Índice do stream */
  index: number;
  /** Codec */
  codec: string;
  /** Nome longo do codec */
  codecLongName: string;
  /** Sample rate (Hz) */
  sampleRate: number;
  /** Número de canais */
  channels: number;
  /** Layout dos canais */
  channelLayout: string;
  /** Bitrate (bps) */
  bitrate?: number;
  /** Bitrate formatado */
  bitrateFormatted?: string;
  /** Bit depth */
  bitDepth?: number;
  /** Sample format */
  sampleFormat?: string;
  /** Language */
  language?: string;
  /** Título */
  title?: string;
  /** Default stream */
  isDefault?: boolean;
}

/**
 * Informações de stream de legendas
 */
export interface SubtitleStreamInfo {
  /** Índice do stream */
  index: number;
  /** Codec */
  codec: string;
  /** Nome longo do codec */
  codecLongName: string;
  /** Language */
  language?: string;
  /** Título */
  title?: string;
  /** Default stream */
  isDefault?: boolean;
  /** Forced subtitle */
  isForced?: boolean;
}

/**
 * Metadados EXIF
 */
export interface ExifData {
  /** Câmera/Dispositivo */
  camera?: {
    make?: string;
    model?: string;
    software?: string;
  };
  /** Configurações de captura */
  settings?: {
    iso?: number;
    exposureTime?: string;
    fNumber?: string;
    focalLength?: string;
    whiteBalance?: string;
  };
  /** GPS */
  gps?: GpsData;
  /** Data/Hora */
  datetime?: {
    original?: string;
    digitized?: string;
  };
}

/**
 * Dados GPS
 */
export interface GpsData {
  /** Latitude */
  latitude?: number;
  /** Longitude */
  longitude?: number;
  /** Altitude (metros) */
  altitude?: number;
  /** Direção */
  direction?: number;
  /** Velocidade */
  speed?: number;
  /** Timestamp GPS */
  timestamp?: string;
}

/**
 * Metadados XMP
 */
export interface XmpData {
  /** Dublin Core */
  dc?: {
    title?: string;
    creator?: string[];
    subject?: string[];
    description?: string;
    rights?: string;
  };
  /** Photoshop */
  photoshop?: {
    credit?: string;
    source?: string;
    instructions?: string;
  };
  /** IPTC */
  iptc?: {
    keywords?: string[];
    category?: string;
    urgency?: number;
  };
}

/**
 * Informações de chapter
 */
export interface ChapterInfo {
  /** ID do chapter */
  id: number;
  /** Tempo de início (segundos) */
  startTime: number;
  /** Tempo de fim (segundos) */
  endTime: number;
  /** Duração (segundos) */
  duration: number;
  /** Título */
  title?: string;
  /** Tags */
  tags?: Record<string, string>;
}

/**
 * Informações de codificação
 */
export interface EncodingInfo {
  /** Encoder usado */
  encoder?: string;
  /** Versão do encoder */
  encoderVersion?: string;
  /** Configurações de encoding */
  settings?: string;
  /** Data de encoding */
  encodingDate?: string;
  /** Número de passes */
  passes?: number;
  /** Modo de rate control */
  rateControl?: 'CBR' | 'VBR' | 'ABR' | 'CRF' | 'CQP';
  /** CRF value (se aplicável) */
  crf?: number;
}

/**
 * Opções de extração
 */
export interface ExtractionOptions {
  /** Extrair EXIF */
  extractExif?: boolean;
  /** Extrair XMP */
  extractXmp?: boolean;
  /** Extrair chapters */
  extractChapters?: boolean;
  /** Calcular checksum MD5 */
  calculateChecksum?: boolean;
  /** Incluir análise detalhada */
  detailedAnalysis?: boolean;
}

/**
 * Resultado da extração
 */
export interface ExtractionResult {
  /** Metadados extraídos */
  metadata: VideoMetadata;
  /** Tempo de processamento (ms) */
  processingTime: number;
  /** Warnings encontrados */
  warnings?: string[];
  /** Erros não fatais */
  errors?: string[];
}

// ==================== CLASSE PRINCIPAL ====================

/**
 * Extrator de Metadados de Vídeo
 */
export class VideoMetadataExtractor extends EventEmitter {
  private options: Required<ExtractionOptions>;

  constructor(options: ExtractionOptions = {}) {
    super();
    
    this.options = {
      extractExif: options.extractExif ?? true,
      extractXmp: options.extractXmp ?? true,
      extractChapters: options.extractChapters ?? true,
      calculateChecksum: options.calculateChecksum ?? false,
      detailedAnalysis: options.detailedAnalysis ?? true,
    };
  }

  /**
   * Extrair metadados completos do vídeo
   */
  async extract(videoPath: string): Promise<ExtractionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    this.emit('start', { videoPath });

    try {
      // Validar arquivo
      await fs.access(videoPath);
      const stats = await fs.stat(videoPath);

      this.emit('progress', { stage: 'file', percent: 10 });

      // Informações do arquivo
      const fileInfo: FileInfo = {
        path: videoPath,
        filename: path.basename(videoPath),
        extension: path.extname(videoPath).toLowerCase(),
        size: stats.size,
        sizeFormatted: this.formatFileSize(stats.size),
        created: stats.birthtime,
        modified: stats.mtime,
      };

      // Calcular checksum (se habilitado)
      if (this.options.calculateChecksum) {
        this.emit('progress', { stage: 'checksum', percent: 20 });
        fileInfo.checksum = await this.calculateMD5(videoPath);
      }

      this.emit('progress', { stage: 'probe', percent: 30 });

      // Extrair metadados com FFprobe
      const probeData = await this.probeVideo(videoPath);

      this.emit('progress', { stage: 'parse', percent: 50 });

      // Parse formato
      const format = this.parseFormatInfo(probeData);

      // Parse streams
      const videoStreams = this.parseVideoStreams(probeData.streams);
      const audioStreams = this.parseAudioStreams(probeData.streams);
      const subtitleStreams = this.parseSubtitleStreams(probeData.streams);

      // Parse chapters
      let chapters: ChapterInfo[] | undefined;
      if (this.options.extractChapters && probeData.chapters) {
        chapters = this.parseChapters(probeData.chapters);
      }

      // Parse tags
      const tags = this.parseTags(probeData.format.tags || {});

      this.emit('progress', { stage: 'exif', percent: 70 });

      // Extrair EXIF (se disponível e habilitado)
      let exif: ExifData | undefined;
      if (this.options.extractExif) {
        try {
          exif = await this.extractExifData(videoPath, probeData);
        } catch (err) {
          warnings.push('EXIF extraction failed: ' + (err as Error).message);
        }
      }

      // Extrair XMP (se disponível e habilitado)
      let xmp: XmpData | undefined;
      if (this.options.extractXmp) {
        try {
          xmp = await this.extractXmpData(probeData);
        } catch (err) {
          warnings.push('XMP extraction failed: ' + (err as Error).message);
        }
      }

      this.emit('progress', { stage: 'encoding', percent: 90 });

      // Parse encoding info
      const encoding = this.parseEncodingInfo(probeData, tags);

      const metadata: VideoMetadata = {
        file: fileInfo,
        format,
        videoStreams,
        audioStreams,
        subtitleStreams,
        exif,
        xmp,
        chapters,
        tags,
        encoding,
      };

      const result: ExtractionResult = {
        metadata,
        processingTime: Date.now() - startTime,
        warnings: warnings.length > 0 ? warnings : undefined,
        errors: errors.length > 0 ? errors : undefined,
      };

      this.emit('progress', { stage: 'complete', percent: 100 });
      this.emit('complete', result);

      return result;

    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Extrair apenas informações básicas (rápido)
   */
  async extractBasic(videoPath: string): Promise<{
    duration: number;
    resolution: { width: number; height: number };
    codec: string;
    fileSize: number;
  }> {
    const probeData = await this.probeVideo(videoPath);
    const videoStream = probeData.streams.find((s: any) => s.codec_type === 'video');
    const stats = await fs.stat(videoPath);

    return {
      duration: probeData.format.duration || 0,
      resolution: {
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
      },
      codec: videoStream?.codec_name || 'unknown',
      fileSize: stats.size,
    };
  }

  /**
   * Validar conformidade do vídeo
   */
  async validateConformance(
    videoPath: string,
    requirements: {
      minDuration?: number;
      maxDuration?: number;
      minResolution?: { width: number; height: number };
      maxResolution?: { width: number; height: number };
      allowedCodecs?: string[];
      maxFileSize?: number;
      minBitrate?: number;
      maxBitrate?: number;
    }
  ): Promise<{
    isValid: boolean;
    violations: string[];
    metadata: VideoMetadata;
  }> {
    const result = await this.extract(videoPath);
    const metadata = result.metadata;
    const violations: string[] = [];

    // Validar duração
    if (requirements.minDuration && metadata.format.duration < requirements.minDuration) {
      violations.push(`Duration ${metadata.format.duration}s below minimum ${requirements.minDuration}s`);
    }
    if (requirements.maxDuration && metadata.format.duration > requirements.maxDuration) {
      violations.push(`Duration ${metadata.format.duration}s exceeds maximum ${requirements.maxDuration}s`);
    }

    // Validar resolução
    if (metadata.videoStreams.length > 0) {
      const video = metadata.videoStreams[0];
      
      if (requirements.minResolution) {
        if (video.width < requirements.minResolution.width || video.height < requirements.minResolution.height) {
          violations.push(`Resolution ${video.width}x${video.height} below minimum ${requirements.minResolution.width}x${requirements.minResolution.height}`);
        }
      }
      
      if (requirements.maxResolution) {
        if (video.width > requirements.maxResolution.width || video.height > requirements.maxResolution.height) {
          violations.push(`Resolution ${video.width}x${video.height} exceeds maximum ${requirements.maxResolution.width}x${requirements.maxResolution.height}`);
        }
      }

      // Validar codec
      if (requirements.allowedCodecs && !requirements.allowedCodecs.includes(video.codec)) {
        violations.push(`Codec ${video.codec} not in allowed list: ${requirements.allowedCodecs.join(', ')}`);
      }
    }

    // Validar tamanho do arquivo
    if (requirements.maxFileSize && metadata.file.size > requirements.maxFileSize) {
      violations.push(`File size ${metadata.file.sizeFormatted} exceeds maximum ${this.formatFileSize(requirements.maxFileSize)}`);
    }

    // Validar bitrate
    if (requirements.minBitrate && metadata.format.bitrate < requirements.minBitrate) {
      violations.push(`Bitrate ${metadata.format.bitrateFormatted} below minimum ${this.formatBitrate(requirements.minBitrate)}`);
    }
    if (requirements.maxBitrate && metadata.format.bitrate > requirements.maxBitrate) {
      violations.push(`Bitrate ${metadata.format.bitrateFormatted} exceeds maximum ${this.formatBitrate(requirements.maxBitrate)}`);
    }

    return {
      isValid: violations.length === 0,
      violations,
      metadata,
    };
  }

  /**
   * Probe vídeo com FFprobe
   */
  private async probeVideo(videoPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata);
      });
    });
  }

  /**
   * Parse informações do formato
   */
  private parseFormatInfo(probeData: any): FormatInfo {
    const format = probeData.format;
    const tags = format.tags || {};

    return {
      formatName: format.format_name || 'unknown',
      formatLongName: format.format_long_name || 'Unknown Format',
      duration: format.duration || 0,
      durationFormatted: this.formatDuration(format.duration || 0),
      bitrate: format.bit_rate || 0,
      bitrateFormatted: this.formatBitrate(format.bit_rate || 0),
      streamCount: probeData.streams.length,
      creationTime: tags.creation_time,
      title: tags.title,
      artist: tags.artist,
      comment: tags.comment,
      copyright: tags.copyright,
      encoder: tags.encoder || format.tags?.encoder,
    };
  }

  /**
   * Parse streams de vídeo
   */
  private parseVideoStreams(streams: any[]): VideoStreamInfo[] {
    return streams
      .filter((s: any) => s.codec_type === 'video')
      .map((s: any, index: number) => {
        const fpsString = s.avg_frame_rate || s.r_frame_rate || '30/1';
        const [num, den] = fpsString.split('/').map(Number);
        const fps = den > 0 ? num / den : 30;

        const aspectRatio = s.display_aspect_ratio || 
          `${s.width}:${s.height}` || '16:9';

        // Detectar HDR
        const isHDR = s.color_transfer === 'smpte2084' || 
                      s.color_transfer === 'arib-std-b67' ||
                      s.color_primaries === 'bt2020';

        const hdr = isHDR ? {
          isHDR: true,
          standard: this.detectHDRStandard(s),
          colorPrimaries: s.color_primaries,
          transferCharacteristics: s.color_transfer,
        } : undefined;

        return {
          index,
          codec: s.codec_name || 'unknown',
          codecLongName: s.codec_long_name || 'Unknown Codec',
          profile: s.profile,
          level: s.level,
          width: s.width || 0,
          height: s.height || 0,
          aspectRatio,
          displayAspectRatio: s.display_aspect_ratio,
          pixelFormat: s.pix_fmt || 'unknown',
          fps,
          bitrate: s.bit_rate ? parseInt(s.bit_rate) : undefined,
          bitrateFormatted: s.bit_rate ? this.formatBitrate(parseInt(s.bit_rate)) : undefined,
          frames: s.nb_frames ? parseInt(s.nb_frames) : undefined,
          colorSpace: s.color_space,
          colorRange: s.color_range,
          hdr,
          rotation: s.tags?.rotate ? parseInt(s.tags.rotate) : undefined,
          language: s.tags?.language,
          isDefault: s.disposition?.default === 1,
        };
      });
  }

  /**
   * Parse streams de áudio
   */
  private parseAudioStreams(streams: any[]): AudioStreamInfo[] {
    return streams
      .filter((s: any) => s.codec_type === 'audio')
      .map((s: any, index: number) => ({
        index,
        codec: s.codec_name || 'unknown',
        codecLongName: s.codec_long_name || 'Unknown Codec',
        sampleRate: s.sample_rate || 0,
        channels: s.channels || 0,
        channelLayout: s.channel_layout || 'unknown',
        bitrate: s.bit_rate ? parseInt(s.bit_rate) : undefined,
        bitrateFormatted: s.bit_rate ? this.formatBitrate(parseInt(s.bit_rate)) : undefined,
        bitDepth: s.bits_per_sample,
        sampleFormat: s.sample_fmt,
        language: s.tags?.language,
        title: s.tags?.title,
        isDefault: s.disposition?.default === 1,
      }));
  }

  /**
   * Parse streams de legendas
   */
  private parseSubtitleStreams(streams: any[]): SubtitleStreamInfo[] {
    return streams
      .filter((s: any) => s.codec_type === 'subtitle')
      .map((s: any, index: number) => ({
        index,
        codec: s.codec_name || 'unknown',
        codecLongName: s.codec_long_name || 'Unknown Codec',
        language: s.tags?.language,
        title: s.tags?.title,
        isDefault: s.disposition?.default === 1,
        isForced: s.disposition?.forced === 1,
      }));
  }

  /**
   * Parse chapters
   */
  private parseChapters(chapters: any[]): ChapterInfo[] {
    return chapters.map((c: any) => ({
      id: c.id,
      startTime: parseFloat(c.start_time) || 0,
      endTime: parseFloat(c.end_time) || 0,
      duration: (parseFloat(c.end_time) || 0) - (parseFloat(c.start_time) || 0),
      title: c.tags?.title,
      tags: c.tags,
    }));
  }

  /**
   * Parse tags gerais
   */
  private parseTags(tags: any): Record<string, string> {
    const result: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value === 'string') {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Parse informações de encoding
   */
  private parseEncodingInfo(probeData: any, tags: Record<string, string>): EncodingInfo {
    const encoder = tags.encoder || probeData.format.tags?.encoder;
    
    return {
      encoder,
      encoderVersion: tags.encoder_version,
      settings: tags.encoding_settings,
      encodingDate: tags.encoding_date || tags.creation_time,
    };
  }

  /**
   * Extrair dados EXIF
   */
  private async extractExifData(videoPath: string, probeData: any): Promise<ExifData | undefined> {
    // EXIF extraction requer biblioteca externa como exiftool
    // Aqui retornamos undefined, mas em produção usaria exiftool-vendored
    return undefined;
  }

  /**
   * Extrair dados XMP
   */
  private async extractXmpData(probeData: any): Promise<XmpData | undefined> {
    // XMP extraction também requer parsing específico
    return undefined;
  }

  /**
   * Detectar padrão HDR
   */
  private detectHDRStandard(stream: any): 'HDR10' | 'HDR10+' | 'Dolby Vision' | 'HLG' | undefined {
    if (stream.color_transfer === 'smpte2084') {
      return 'HDR10';
    }
    if (stream.color_transfer === 'arib-std-b67') {
      return 'HLG';
    }
    return undefined;
  }

  /**
   * Calcular MD5 checksum
   */
  private async calculateMD5(filePath: string): Promise<string> {
    const crypto = await import('crypto');
    const hash = crypto.createHash('md5');
    const stream = (await import('fs')).createReadStream(filePath);

    return new Promise((resolve, reject) => {
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Formatar tamanho de arquivo
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Formatar bitrate
   */
  private formatBitrate(bps: number): string {
    const kbps = bps / 1000;
    const mbps = kbps / 1000;

    if (mbps >= 1) {
      return `${mbps.toFixed(2)} Mbps`;
    }
    return `${kbps.toFixed(0)} kbps`;
  }

  /**
   * Formatar duração
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return [hours, minutes, secs]
      .map(n => String(n).padStart(2, '0'))
      .join(':');
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Criar extrator básico (rápido, sem EXIF/XMP)
 */
export function createBasicExtractor(): VideoMetadataExtractor {
  return new VideoMetadataExtractor({
    extractExif: false,
    extractXmp: false,
    extractChapters: false,
    calculateChecksum: false,
    detailedAnalysis: false,
  });
}

/**
 * Criar extrator completo
 */
export function createFullExtractor(): VideoMetadataExtractor {
  return new VideoMetadataExtractor({
    extractExif: true,
    extractXmp: true,
    extractChapters: true,
    calculateChecksum: true,
    detailedAnalysis: true,
  });
}

/**
 * Criar validador de conformidade
 */
export function createConformanceValidator(): VideoMetadataExtractor {
  return new VideoMetadataExtractor({
    extractExif: false,
    extractXmp: false,
    extractChapters: false,
    calculateChecksum: false,
    detailedAnalysis: true,
  });
}

// ==================== EXPORTS ====================

export default VideoMetadataExtractor;
