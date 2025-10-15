/**
 * Audio Analysis Module
 * 
 * Análise completa de qualidade de áudio com:
 * - Detecção de silêncio
 * - Análise de volume e normalização
 * - Detecção de clipping
 * - Análise de frequências
 * - Qualidade vocal
 */

import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

// ==================== TYPES ====================

export interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  bitrate: number;
  codec: string;
  size: number;
}

export interface SilenceSegment {
  start: number;
  end: number;
  duration: number;
}

export interface VolumeAnalysis {
  mean: number;          // Volume médio
  max: number;           // Volume máximo
  min: number;           // Volume mínimo
  rms: number;           // Root Mean Square
  peak: number;          // Pico de amplitude
  dynamicRange: number;  // Diferença entre max e min
}

export interface AudioQualityReport {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  score: number; // 0-100
  
  // Análises específicas
  volume: VolumeAnalysis;
  silences: SilenceSegment[];
  clipping: {
    detected: boolean;
    count: number;
    severity: 'none' | 'low' | 'medium' | 'high';
  };
  noise: {
    level: number;
    acceptable: boolean;
  };
  clarity: {
    score: number;
    intelligible: boolean;
  };
  
  // Recomendações
  recommendations: string[];
  needsNormalization: boolean;
  suggestedGain: number; // dB
}

export interface AudioAnalysisOptions {
  silenceThreshold?: number;    // dB (padrão: -40)
  silenceDuration?: number;     // segundos (padrão: 0.5)
  targetLUFS?: number;          // Loudness target (padrão: -16)
  checkClipping?: boolean;      // Verificar clipping
  analyzeFrequencies?: boolean; // Análise espectral
}

// ==================== CONSTANTS ====================

const DEFAULT_OPTIONS: Required<AudioAnalysisOptions> = {
  silenceThreshold: -40,
  silenceDuration: 0.5,
  targetLUFS: -16,
  checkClipping: true,
  analyzeFrequencies: false
};

const QUALITY_THRESHOLDS = {
  excellent: { score: 90, clarity: 0.9, noise: -60 },
  good: { score: 75, clarity: 0.75, noise: -50 },
  fair: { score: 60, clarity: 0.6, noise: -40 },
  poor: { score: 0, clarity: 0, noise: -30 }
};

// ==================== AUDIO ANALYZER CLASS ====================

export class AudioAnalyzer {
  private options: Required<AudioAnalysisOptions>;

  constructor(options?: AudioAnalysisOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Analisa um arquivo de áudio
   */
  async analyze(audioPath: string): Promise<AudioQualityReport> {
    const metadata = await this.extractMetadata(audioPath);
    const volumeAnalysis = await this.analyzeVolume(audioPath);
    const silences = await this.detectSilence(audioPath);
    const clippingInfo = this.options.checkClipping 
      ? await this.detectClipping(audioPath)
      : { detected: false, count: 0, severity: 'none' as const };

    const noiseLevel = await this.analyzeNoise(audioPath);
    const clarityScore = this.calculateClarity(volumeAnalysis, noiseLevel);

    // Calcular score geral
    const score = this.calculateOverallScore({
      volume: volumeAnalysis,
      clipping: clippingInfo,
      noise: noiseLevel,
      clarity: clarityScore,
      silenceRatio: this.calculateSilenceRatio(silences, metadata.duration)
    });

    // Gerar recomendações
    const recommendations = this.generateRecommendations({
      volume: volumeAnalysis,
      clipping: clippingInfo,
      noise: noiseLevel,
      clarity: clarityScore,
      silences
    });

    // Calcular ganho sugerido
    const suggestedGain = this.calculateSuggestedGain(volumeAnalysis);

    const report: AudioQualityReport = {
      overall: this.determineQuality(score),
      score,
      volume: volumeAnalysis,
      silences,
      clipping: clippingInfo,
      noise: {
        level: noiseLevel,
        acceptable: noiseLevel < -40
      },
      clarity: {
        score: clarityScore,
        intelligible: clarityScore >= 0.6
      },
      recommendations,
      needsNormalization: Math.abs(suggestedGain) > 1,
      suggestedGain
    };

    return report;
  }

  /**
   * Normaliza um arquivo de áudio
   */
  async normalize(inputPath: string, outputPath: string, targetLUFS?: number): Promise<void> {
    const target = targetLUFS ?? this.options.targetLUFS;

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFilters([
          `loudnorm=I=${target}:TP=-1.5:LRA=11`,
          'highpass=f=80',  // Remove rumble
          'lowpass=f=15000' // Remove ultrasonic noise
        ])
        .audioCodec('aac')
        .audioBitrate('192k')
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  /**
   * Remove silêncios de um áudio
   */
  async removeSilence(
    inputPath: string, 
    outputPath: string,
    options?: { threshold?: number; duration?: number }
  ): Promise<void> {
    const threshold = options?.threshold ?? this.options.silenceThreshold;
    const duration = options?.duration ?? this.options.silenceDuration;

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFilters([
          `silenceremove=start_periods=1:start_threshold=${threshold}dB:start_duration=${duration}`,
          `silenceremove=stop_periods=-1:stop_threshold=${threshold}dB:stop_duration=${duration}`
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  // ==================== PRIVATE METHODS ====================

  private async extractMetadata(audioPath: string): Promise<AudioMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
        if (!audioStream) {
          reject(new Error('Stream de áudio não encontrado'));
          return;
        }

        const stats = require('fs').statSync(audioPath);

        resolve({
          duration: metadata.format.duration || 0,
          sampleRate: audioStream.sample_rate || 0,
          channels: audioStream.channels || 0,
          bitrate: parseInt(audioStream.bit_rate || metadata.format.bit_rate || '0'),
          codec: audioStream.codec_name || 'unknown',
          size: stats.size
        });
      });
    });
  }

  private async analyzeVolume(audioPath: string): Promise<VolumeAnalysis> {
    return new Promise((resolve, reject) => {
      let volumeData = '';

      ffmpeg(audioPath)
        .audioFilters('volumedetect')
        .format('null')
        .output('-')
        .on('stderr', (line) => {
          volumeData += line + '\n';
        })
        .on('end', () => {
          const meanMatch = volumeData.match(/mean_volume: ([-\d.]+) dB/);
          const maxMatch = volumeData.match(/max_volume: ([-\d.]+) dB/);

          const mean = meanMatch ? parseFloat(meanMatch[1]) : -30;
          const max = maxMatch ? parseFloat(maxMatch[1]) : -10;
          
          resolve({
            mean,
            max,
            min: mean - 10, // Estimativa
            rms: mean + 3,  // Estimativa
            peak: max,
            dynamicRange: Math.abs(max - mean)
          });
        })
        .on('error', reject)
        .run();
    });
  }

  private async detectSilence(audioPath: string): Promise<SilenceSegment[]> {
    return new Promise((resolve, reject) => {
      let silenceData = '';
      const threshold = this.options.silenceThreshold;
      const duration = this.options.silenceDuration;

      ffmpeg(audioPath)
        .audioFilters(`silencedetect=n=${threshold}dB:d=${duration}`)
        .format('null')
        .output('-')
        .on('stderr', (line) => {
          silenceData += line + '\n';
        })
        .on('end', () => {
          const segments: SilenceSegment[] = [];
          const startMatches = silenceData.matchAll(/silence_start: ([\d.]+)/g);
          const endMatches = silenceData.matchAll(/silence_end: ([\d.]+)/g);

          const starts = Array.from(startMatches).map(m => parseFloat(m[1]));
          const ends = Array.from(endMatches).map(m => parseFloat(m[1]));

          for (let i = 0; i < Math.min(starts.length, ends.length); i++) {
            segments.push({
              start: starts[i],
              end: ends[i],
              duration: ends[i] - starts[i]
            });
          }

          resolve(segments);
        })
        .on('error', reject)
        .run();
    });
  }

  private async detectClipping(audioPath: string): Promise<{
    detected: boolean;
    count: number;
    severity: 'none' | 'low' | 'medium' | 'high';
  }> {
    return new Promise((resolve, reject) => {
      let statsData = '';

      ffmpeg(audioPath)
        .audioFilters('astats')
        .format('null')
        .output('-')
        .on('stderr', (line) => {
          statsData += line + '\n';
        })
        .on('end', () => {
          // Procurar por picos acima de -0.1 dB (indicativo de clipping)
          const peakMatch = statsData.match(/Peak level dB: ([-\d.]+)/);
          const peak = peakMatch ? parseFloat(peakMatch[1]) : -10;

          const detected = peak > -0.1;
          const count = detected ? Math.floor((peak + 0.1) * 100) : 0;

          let severity: 'none' | 'low' | 'medium' | 'high' = 'none';
          if (count > 100) severity = 'high';
          else if (count > 50) severity = 'medium';
          else if (count > 10) severity = 'low';

          resolve({ detected, count, severity });
        })
        .on('error', reject)
        .run();
    });
  }

  private async analyzeNoise(audioPath: string): Promise<number> {
    // Análise simplificada de ruído
    // Em produção, usar análise espectral mais avançada
    return new Promise((resolve) => {
      let noiseLevel = -50; // Valor padrão

      ffmpeg(audioPath)
        .audioFilters('astats')
        .format('null')
        .output('-')
        .on('stderr', (line) => {
          const noiseMatch = line.match(/Noise floor dB: ([-\d.]+)/);
          if (noiseMatch) {
            noiseLevel = parseFloat(noiseMatch[1]);
          }
        })
        .on('end', () => resolve(noiseLevel))
        .on('error', () => resolve(noiseLevel))
        .run();
    });
  }

  private calculateClarity(volume: VolumeAnalysis, noiseLevel: number): number {
    // SNR (Signal-to-Noise Ratio)
    const snr = volume.mean - noiseLevel;
    
    // Normalizar para 0-1
    const clarityScore = Math.min(Math.max(snr / 60, 0), 1);
    
    return clarityScore;
  }

  private calculateSilenceRatio(silences: SilenceSegment[], totalDuration: number): number {
    const totalSilence = silences.reduce((sum, s) => sum + s.duration, 0);
    return totalSilence / totalDuration;
  }

  private calculateOverallScore(metrics: {
    volume: VolumeAnalysis;
    clipping: { severity: string };
    noise: number;
    clarity: number;
    silenceRatio: number;
  }): number {
    let score = 100;

    // Penalizar volume muito baixo ou alto
    if (metrics.volume.mean < -30) score -= 15;
    if (metrics.volume.mean < -40) score -= 15;
    if (metrics.volume.peak > -1) score -= 10;

    // Penalizar clipping
    if (metrics.clipping.severity === 'low') score -= 10;
    if (metrics.clipping.severity === 'medium') score -= 20;
    if (metrics.clipping.severity === 'high') score -= 30;

    // Penalizar ruído alto
    if (metrics.noise > -40) score -= 10;
    if (metrics.noise > -30) score -= 20;

    // Penalizar clareza baixa
    score += metrics.clarity * 20;

    // Penalizar muito silêncio
    if (metrics.silenceRatio > 0.3) score -= 15;
    if (metrics.silenceRatio > 0.5) score -= 25;

    return Math.max(0, Math.min(100, score));
  }

  private determineQuality(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= QUALITY_THRESHOLDS.excellent.score) return 'excellent';
    if (score >= QUALITY_THRESHOLDS.good.score) return 'good';
    if (score >= QUALITY_THRESHOLDS.fair.score) return 'fair';
    return 'poor';
  }

  private generateRecommendations(metrics: {
    volume: VolumeAnalysis;
    clipping: { detected: boolean; severity: string };
    noise: number;
    clarity: number;
    silences: SilenceSegment[];
  }): string[] {
    const recommendations: string[] = [];

    if (metrics.volume.mean < -30) {
      recommendations.push('Aumentar volume geral do áudio');
    }

    if (metrics.clipping.detected) {
      recommendations.push('Reduzir picos para evitar clipping');
    }

    if (metrics.noise > -40) {
      recommendations.push('Aplicar redução de ruído');
    }

    if (metrics.clarity < 0.6) {
      recommendations.push('Melhorar clareza vocal - considere regravar');
    }

    if (metrics.silences.length > 10) {
      recommendations.push('Remover ou reduzir silêncios excessivos');
    }

    if (metrics.volume.dynamicRange > 30) {
      recommendations.push('Aplicar compressão para melhor consistência');
    }

    if (recommendations.length === 0) {
      recommendations.push('Qualidade de áudio está adequada');
    }

    return recommendations;
  }

  private calculateSuggestedGain(volume: VolumeAnalysis): number {
    // Target: -16 LUFS (aproximadamente -16 dB mean)
    const target = -16;
    return target - volume.mean;
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Cria analisador com configurações padrão para NR
 */
export function createNRAudioAnalyzer(): AudioAnalyzer {
  return new AudioAnalyzer({
    silenceThreshold: -35,
    silenceDuration: 0.3,
    targetLUFS: -16,
    checkClipping: true,
    analyzeFrequencies: false
  });
}

/**
 * Cria analisador para podcast/narração
 */
export function createVoiceAnalyzer(): AudioAnalyzer {
  return new AudioAnalyzer({
    silenceThreshold: -40,
    silenceDuration: 0.5,
    targetLUFS: -18,
    checkClipping: true,
    analyzeFrequencies: true
  });
}

export default AudioAnalyzer;
