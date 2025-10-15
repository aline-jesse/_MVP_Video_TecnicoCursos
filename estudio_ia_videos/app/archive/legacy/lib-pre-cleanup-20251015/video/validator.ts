/**
 * Video Validator Module
 * 
 * Validação completa de vídeos com verificação de:
 * - Formatos suportados
 * - Qualidade e resolução
 * - Metadados e conformidade NR
 * - Duração e tamanho
 */

import { promises as fs } from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

// ==================== TYPES ====================

export interface VideoMetadata {
  format: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  size: number;
  hasAudio: boolean;
  audioCodec?: string;
  videoCodec: string;
  audioChannels?: number;
  audioSampleRate?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: VideoMetadata;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  nrCompliant: boolean;
}

export interface ValidationOptions {
  maxDuration?: number;        // Duração máxima em segundos (padrão: 1800 = 30min)
  minDuration?: number;        // Duração mínima em segundos (padrão: 10)
  maxFileSize?: number;        // Tamanho máximo em bytes (padrão: 500MB)
  minWidth?: number;           // Largura mínima (padrão: 720)
  minHeight?: number;          // Altura mínima (padrão: 480)
  requiredFormats?: string[];  // Formatos aceitos
  requireAudio?: boolean;      // Exige áudio
  nrCompliance?: boolean;      // Validar conformidade NR
}

export interface NRComplianceCheck {
  hasWatermark: boolean;
  hasIntro: boolean;
  hasOutro: boolean;
  hasSubtitles: boolean;
  audioClear: boolean;
  properDuration: boolean;
  score: number; // 0-100
}

// ==================== CONSTANTS ====================

const SUPPORTED_FORMATS = [
  'mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'm4v'
];

const SUPPORTED_VIDEO_CODECS = [
  'h264', 'hevc', 'vp8', 'vp9', 'av1'
];

const SUPPORTED_AUDIO_CODECS = [
  'aac', 'mp3', 'opus', 'vorbis', 'ac3'
];

const QUALITY_THRESHOLDS = {
  ultra: { width: 3840, height: 2160, bitrate: 8000000 },  // 4K
  high: { width: 1920, height: 1080, bitrate: 5000000 },   // Full HD
  medium: { width: 1280, height: 720, bitrate: 2500000 },  // HD
  low: { width: 640, height: 480, bitrate: 1000000 }       // SD
};

const DEFAULT_OPTIONS: Required<ValidationOptions> = {
  maxDuration: 1800,      // 30 minutos
  minDuration: 10,        // 10 segundos
  maxFileSize: 500 * 1024 * 1024, // 500MB
  minWidth: 720,
  minHeight: 480,
  requiredFormats: ['mp4', 'webm'],
  requireAudio: true,
  nrCompliance: true
};

// ==================== VIDEO VALIDATOR CLASS ====================

export class VideoValidator {
  private options: Required<ValidationOptions>;

  constructor(options?: ValidationOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Valida um arquivo de vídeo
   */
  async validate(filePath: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      quality: 'medium',
      nrCompliant: false
    };

    try {
      // 1. Verificar se arquivo existe
      await this.checkFileExists(filePath, result);
      if (!result.valid) return result;

      // 2. Obter metadados
      const metadata = await this.extractMetadata(filePath);
      result.metadata = metadata;

      // 3. Validar formato
      this.validateFormat(metadata, result);

      // 4. Validar duração
      this.validateDuration(metadata, result);

      // 5. Validar tamanho
      this.validateFileSize(metadata, result);

      // 6. Validar resolução
      this.validateResolution(metadata, result);

      // 7. Validar áudio
      this.validateAudio(metadata, result);

      // 8. Determinar qualidade
      result.quality = this.determineQuality(metadata);

      // 9. Verificar conformidade NR
      if (this.options.nrCompliance) {
        const nrCheck = await this.checkNRCompliance(filePath, metadata);
        result.nrCompliant = nrCheck.score >= 70;
        
        if (!result.nrCompliant) {
          result.warnings.push(`Conformidade NR baixa (${nrCheck.score}/100)`);
        }
      }

      // 10. Definir status final
      result.valid = result.errors.length === 0;

    } catch (error) {
      result.valid = false;
      result.errors.push(`Erro durante validação: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    }

    return result;
  }

  /**
   * Valida múltiplos vídeos em batch
   */
  async validateBatch(filePaths: string[]): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    await Promise.all(
      filePaths.map(async (filePath) => {
        const result = await this.validate(filePath);
        results.set(filePath, result);
      })
    );

    return results;
  }

  // ==================== PRIVATE METHODS ====================

  private async checkFileExists(filePath: string, result: ValidationResult): Promise<void> {
    try {
      await fs.access(filePath);
    } catch {
      result.valid = false;
      result.errors.push('Arquivo não encontrado');
    }
  }

  private async extractMetadata(filePath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(new Error(`Erro ao extrair metadados: ${err.message}`));
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

        if (!videoStream) {
          reject(new Error('Stream de vídeo não encontrado'));
          return;
        }

        const stats = require('fs').statSync(filePath);

        resolve({
          format: metadata.format.format_name?.split(',')[0] || 'unknown',
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          fps: this.parseFPS(videoStream.r_frame_rate),
          bitrate: typeof metadata.format.bit_rate === 'string' 
            ? parseInt(metadata.format.bit_rate) 
            : metadata.format.bit_rate || 0,
          size: stats.size,
          hasAudio: !!audioStream,
          audioCodec: audioStream?.codec_name,
          videoCodec: videoStream.codec_name || 'unknown',
          audioChannels: audioStream?.channels,
          audioSampleRate: audioStream?.sample_rate
        });
      });
    });
  }

  private parseFPS(frameRate?: string): number {
    if (!frameRate) return 0;
    const parts = frameRate.split('/');
    if (parts.length === 2) {
      return parseInt(parts[0]) / parseInt(parts[1]);
    }
    return parseFloat(frameRate);
  }

  private validateFormat(metadata: VideoMetadata, result: ValidationResult): void {
    if (!SUPPORTED_FORMATS.includes(metadata.format.toLowerCase())) {
      result.errors.push(`Formato não suportado: ${metadata.format}`);
    }

    if (!SUPPORTED_VIDEO_CODECS.includes(metadata.videoCodec.toLowerCase())) {
      result.warnings.push(`Codec de vídeo pode ter problemas: ${metadata.videoCodec}`);
    }

    if (metadata.hasAudio && metadata.audioCodec && 
        !SUPPORTED_AUDIO_CODECS.includes(metadata.audioCodec.toLowerCase())) {
      result.warnings.push(`Codec de áudio pode ter problemas: ${metadata.audioCodec}`);
    }
  }

  private validateDuration(metadata: VideoMetadata, result: ValidationResult): void {
    if (metadata.duration < this.options.minDuration) {
      result.errors.push(`Duração muito curta: ${metadata.duration}s (mínimo: ${this.options.minDuration}s)`);
    }

    if (metadata.duration > this.options.maxDuration) {
      result.errors.push(`Duração muito longa: ${metadata.duration}s (máximo: ${this.options.maxDuration}s)`);
    }
  }

  private validateFileSize(metadata: VideoMetadata, result: ValidationResult): void {
    if (metadata.size > this.options.maxFileSize) {
      const sizeMB = (metadata.size / 1024 / 1024).toFixed(2);
      const maxSizeMB = (this.options.maxFileSize / 1024 / 1024).toFixed(2);
      result.errors.push(`Arquivo muito grande: ${sizeMB}MB (máximo: ${maxSizeMB}MB)`);
    }

    // Aviso se arquivo muito pequeno (possível problema de qualidade)
    const minExpectedSize = metadata.duration * 100000; // ~100KB/s
    if (metadata.size < minExpectedSize) {
      result.warnings.push('Arquivo muito pequeno - qualidade pode estar comprometida');
    }
  }

  private validateResolution(metadata: VideoMetadata, result: ValidationResult): void {
    if (metadata.width < this.options.minWidth) {
      result.errors.push(`Largura muito baixa: ${metadata.width}px (mínimo: ${this.options.minWidth}px)`);
    }

    if (metadata.height < this.options.minHeight) {
      result.errors.push(`Altura muito baixa: ${metadata.height}px (mínimo: ${this.options.minHeight}px)`);
    }

    // Verificar aspect ratio comum
    const aspectRatio = metadata.width / metadata.height;
    const commonRatios = [16/9, 4/3, 1/1, 9/16];
    const tolerance = 0.05;
    
    const isCommonRatio = commonRatios.some(ratio => 
      Math.abs(aspectRatio - ratio) < tolerance
    );

    if (!isCommonRatio) {
      result.warnings.push(`Aspect ratio incomum: ${aspectRatio.toFixed(2)}`);
    }
  }

  private validateAudio(metadata: VideoMetadata, result: ValidationResult): void {
    if (this.options.requireAudio && !metadata.hasAudio) {
      result.errors.push('Vídeo não possui áudio');
      return;
    }

    if (metadata.hasAudio) {
      if (metadata.audioChannels && metadata.audioChannels < 1) {
        result.errors.push('Configuração de canais de áudio inválida');
      }

      if (metadata.audioSampleRate && metadata.audioSampleRate < 22050) {
        result.warnings.push(`Sample rate de áudio baixo: ${metadata.audioSampleRate}Hz`);
      }
    }
  }

  private determineQuality(metadata: VideoMetadata): 'low' | 'medium' | 'high' | 'ultra' {
    if (metadata.width >= QUALITY_THRESHOLDS.ultra.width && 
        metadata.height >= QUALITY_THRESHOLDS.ultra.height &&
        metadata.bitrate >= QUALITY_THRESHOLDS.ultra.bitrate) {
      return 'ultra';
    }

    if (metadata.width >= QUALITY_THRESHOLDS.high.width && 
        metadata.height >= QUALITY_THRESHOLDS.high.height &&
        metadata.bitrate >= QUALITY_THRESHOLDS.high.bitrate) {
      return 'high';
    }

    if (metadata.width >= QUALITY_THRESHOLDS.medium.width && 
        metadata.height >= QUALITY_THRESHOLDS.medium.height &&
        metadata.bitrate >= QUALITY_THRESHOLDS.medium.bitrate) {
      return 'medium';
    }

    return 'low';
  }

  private async checkNRCompliance(filePath: string, metadata: VideoMetadata): Promise<NRComplianceCheck> {
    const check: NRComplianceCheck = {
      hasWatermark: false,
      hasIntro: false,
      hasOutro: false,
      hasSubtitles: false,
      audioClear: false,
      properDuration: false,
      score: 0
    };

    // Verificar duração apropriada (entre 3-20 minutos para cursos NR)
    check.properDuration = metadata.duration >= 180 && metadata.duration <= 1200;

    // Verificar qualidade de áudio (bitrate mínimo)
    check.audioClear = metadata.hasAudio && metadata.bitrate >= 128000;

    // Verificar legendas via análise de streams
    check.hasSubtitles = await this.detectSubtitles(filePath);

    // Detecção de intro/outro via análise temporal
    const temporal = await this.analyzeTemporalStructure(filePath, metadata);
    check.hasIntro = temporal.hasIntro;
    check.hasOutro = temporal.hasOutro;

    // Calcular score
    let score = 0;
    if (check.properDuration) score += 30;
    if (check.audioClear) score += 25;
    if (check.hasWatermark) score += 15;
    if (check.hasIntro) score += 10;
    if (check.hasOutro) score += 10;
    if (check.hasSubtitles) score += 10;

    check.score = score;
    return check;
  }

  /**
   * Detecta se vídeo possui legendas
   */
  private async detectSubtitles(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          resolve(false);
          return;
        }

        const hasSubtitleStream = metadata.streams.some(
          s => s.codec_type === 'subtitle'
        );

        resolve(hasSubtitleStream);
      });
    });
  }

  /**
   * Analisa estrutura temporal do vídeo (intro/outro)
   */
  private async analyzeTemporalStructure(
    filePath: string,
    metadata: VideoMetadata
  ): Promise<{ hasIntro: boolean; hasOutro: boolean }> {
    // Simplificado: assume intro nos primeiros 10s e outro nos últimos 10s
    // Em produção, usaria análise de frames ou detecção de padrões
    
    const hasIntro = metadata.duration >= 15; // Tempo suficiente para intro
    const hasOutro = metadata.duration >= 15; // Tempo suficiente para outro

    return { hasIntro, hasOutro };
  }

  /**
   * Valida bitrate ideal baseado na resolução
   */
  validateBitrateForResolution(metadata: VideoMetadata): {
    optimal: boolean;
    recommendation: string;
  } {
    const pixels = metadata.width * metadata.height;
    const fps = metadata.fps || 30;
    
    // Bitrate recomendado: (pixels * fps * 0.1) bits/segundo
    const recommendedBitrate = pixels * fps * 0.1;
    const tolerance = 0.3; // 30% tolerance
    
    const minBitrate = recommendedBitrate * (1 - tolerance);
    const maxBitrate = recommendedBitrate * (1 + tolerance);
    
    const optimal = metadata.bitrate >= minBitrate && metadata.bitrate <= maxBitrate;
    
    let recommendation = '';
    if (metadata.bitrate < minBitrate) {
      recommendation = `Bitrate muito baixo. Recomendado: ${Math.round(recommendedBitrate / 1000)} kbps`;
    } else if (metadata.bitrate > maxBitrate) {
      recommendation = `Bitrate muito alto. Recomendado: ${Math.round(recommendedBitrate / 1000)} kbps`;
    } else {
      recommendation = 'Bitrate adequado para a resolução';
    }
    
    return { optimal, recommendation };
  }

  /**
   * Detecta problemas comuns de vídeo
   */
  async detectCommonIssues(filePath: string, metadata: VideoMetadata): Promise<string[]> {
    const issues: string[] = [];

    // 1. FPS muito baixo ou muito alto
    if (metadata.fps < 24) {
      issues.push(`FPS muito baixo (${metadata.fps}). Recomendado: 24-60 fps`);
    } else if (metadata.fps > 60) {
      issues.push(`FPS muito alto (${metadata.fps}). Pode aumentar tamanho do arquivo`);
    }

    // 2. Aspect ratio não padrão
    const aspectRatio = metadata.width / metadata.height;
    if (Math.abs(aspectRatio - 16/9) > 0.1 && Math.abs(aspectRatio - 4/3) > 0.1) {
      issues.push(`Aspect ratio incomum: ${aspectRatio.toFixed(2)}:1`);
    }

    // 3. Bitrate inadequado
    const bitrateCheck = this.validateBitrateForResolution(metadata);
    if (!bitrateCheck.optimal) {
      issues.push(bitrateCheck.recommendation);
    }

    // 4. Resolução não padrão
    const standardResolutions = [
      { w: 3840, h: 2160 }, // 4K
      { w: 2560, h: 1440 }, // 2K
      { w: 1920, h: 1080 }, // Full HD
      { w: 1280, h: 720 },  // HD
      { w: 854, h: 480 },   // SD
      { w: 640, h: 360 },   // Low
    ];

    const isStandardResolution = standardResolutions.some(
      res => res.w === metadata.width && res.h === metadata.height
    );

    if (!isStandardResolution) {
      issues.push(`Resolução não padrão: ${metadata.width}x${metadata.height}`);
    }

    // 5. Áudio mono quando deveria ser estéreo
    if (metadata.hasAudio && metadata.audioChannels === 1) {
      issues.push('Áudio mono detectado. Considere usar estéreo para melhor qualidade');
    }

    // 6. Sample rate de áudio inadequado
    if (metadata.hasAudio && metadata.audioSampleRate) {
      if (metadata.audioSampleRate < 44100) {
        issues.push(`Sample rate baixo: ${metadata.audioSampleRate}Hz. Recomendado: 44100Hz ou 48000Hz`);
      }
    }

    // 7. Codec antigo
    if (metadata.videoCodec === 'mpeg4' || metadata.videoCodec === 'h263') {
      issues.push(`Codec de vídeo antigo (${metadata.videoCodec}). Recomendado: h264 ou h265`);
    }

    return issues;
  }

  /**
   * Gera relatório detalhado de validação
   */
  async generateDetailedReport(filePath: string): Promise<{
    validation: ValidationResult;
    issues: string[];
    recommendations: string[];
    score: number;
  }> {
    const validation = await this.validate(filePath);
    
    if (!validation.metadata) {
      return {
        validation,
        issues: validation.errors,
        recommendations: [],
        score: 0,
      };
    }

    const issues = await this.detectCommonIssues(filePath, validation.metadata);
    const recommendations: string[] = [];

    // Gerar recomendações baseadas na qualidade
    if (validation.quality === 'low') {
      recommendations.push('Considere aumentar a resolução para pelo menos 1280x720 (HD)');
      recommendations.push('Aumente o bitrate para melhorar a qualidade visual');
    }

    if (validation.quality === 'medium') {
      recommendations.push('Para melhor qualidade, considere Full HD (1920x1080)');
    }

    if (!validation.metadata.hasAudio && this.options.requireAudio) {
      recommendations.push('Adicione áudio ao vídeo para melhor experiência');
    }

    if (validation.metadata.duration < 60) {
      recommendations.push('Vídeos mais longos (2-5 minutos) tendem a ter melhor engajamento');
    }

    if (validation.metadata.duration > 900) {
      recommendations.push('Considere dividir em módulos menores para melhor retenção');
    }

    // Calcular score geral
    let score = 100;
    score -= validation.errors.length * 20;
    score -= validation.warnings.length * 5;
    score -= issues.length * 3;
    score = Math.max(0, Math.min(100, score));

    return {
      validation,
      issues,
      recommendations,
      score,
    };
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Cria validador com configurações padrão para NR
 */
export function createNRValidator(): VideoValidator {
  return new VideoValidator({
    maxDuration: 1200,     // 20 minutos
    minDuration: 180,      // 3 minutos
    maxFileSize: 300 * 1024 * 1024, // 300MB
    minWidth: 1280,
    minHeight: 720,
    requiredFormats: ['mp4'],
    requireAudio: true,
    nrCompliance: true
  });
}

/**
 * Cria validador com configurações para vídeos curtos
 */
export function createShortVideoValidator(): VideoValidator {
  return new VideoValidator({
    maxDuration: 300,      // 5 minutos
    minDuration: 30,       // 30 segundos
    maxFileSize: 100 * 1024 * 1024, // 100MB
    minWidth: 720,
    minHeight: 480,
    requiredFormats: ['mp4', 'webm'],
    requireAudio: false,
    nrCompliance: false
  });
}

/**
 * Cria validador rigoroso para compliance NR
 */
export function createStrictNRValidator(): VideoValidator {
  return new VideoValidator({
    minDuration: 180,    // 3 minutos
    maxDuration: 1200,   // 20 minutos
    maxFileSize: 500 * 1024 * 1024, // 500 MB
    minWidth: 1920,
    minHeight: 1080, // Full HD obrigatório
    requiredFormats: ['mp4'],
    requireAudio: true,
    nrCompliance: true
  });
}

/**
 * Cria validador para vídeos 4K
 */
export function create4KValidator(): VideoValidator {
  return new VideoValidator({
    minDuration: 60,
    maxDuration: 3600, // 1 hora
    maxFileSize: 2048 * 1024 * 1024, // 2 GB
    minWidth: 3840,
    minHeight: 2160, // 4K
    requiredFormats: ['mp4', 'mov', 'mkv'],
    requireAudio: true,
    nrCompliance: false
  });
}

/**
 * Cria validador para YouTube (otimizado)
 */
export function createYouTubeValidator(): VideoValidator {
  return new VideoValidator({
    minDuration: 60,
    maxDuration: 3600 * 2, // 2 horas
    maxFileSize: 256 * 1024 * 1024 * 1024, // 256 GB (limite YouTube)
    minWidth: 1280,
    minHeight: 720, // HD mínimo
    requiredFormats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
    requireAudio: true,
    nrCompliance: false
  });
}

/**
 * Cria validador para streaming (Twitch, Lives)
 */
export function createStreamingValidator(): VideoValidator {
  return new VideoValidator({
    minDuration: 300,    // 5 minutos
    maxDuration: 14400,  // 4 horas
    maxFileSize: 10 * 1024 * 1024 * 1024, // 10 GB
    minWidth: 1280,
    minHeight: 720,
    requiredFormats: ['mp4', 'flv', 'ts'],
    requireAudio: true,
    nrCompliance: false
  });
}

/**
 * Cria validador para arquivamento de alta qualidade
 */
export function createArchiveValidator(): VideoValidator {
  return new VideoValidator({
    minDuration: 0, // Sem mínimo
    maxDuration: Infinity, // Sem máximo
    maxFileSize: Infinity, // Sem limite
    minWidth: 1920,
    minHeight: 1080,
    requiredFormats: ['mp4', 'mov', 'mkv', 'avi'],
    requireAudio: false, // Áudio opcional
    nrCompliance: false
  });
}

/**
 * Cria validador para redes sociais (Facebook, Instagram, Twitter)
 */
export function createSocialMediaValidator(): VideoValidator {
  return new VideoValidator({
    minDuration: 3,
    maxDuration: 600, // 10 minutos
    maxFileSize: 1024 * 1024 * 1024, // 1 GB
    minWidth: 720,
    minHeight: 720, // Quadrado ou retrato
    requiredFormats: ['mp4', 'mov'],
    requireAudio: true,
    nrCompliance: false
  });
}

export default VideoValidator;
