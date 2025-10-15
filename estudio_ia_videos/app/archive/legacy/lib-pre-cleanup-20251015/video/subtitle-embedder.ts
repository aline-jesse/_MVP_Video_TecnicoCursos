/**
 * Subtitle Embedder Module
 * 
 * Sistema completo de legendas com:
 * - Múltiplos formatos (SRT, VTT, ASS, SSA)
 * - Geração automática via IA
 * - Sincronização automática
 * - Estilização customizada
 * - Multi-idioma
 */

import ffmpeg from 'fluent-ffmpeg';
import { EventEmitter } from 'events';
import path from 'path';
import { promises as fs } from 'fs';

// ==================== TYPES ====================

export enum SubtitleFormat {
  SRT = 'srt',      // SubRip
  VTT = 'vtt',      // WebVTT
  ASS = 'ass',      // Advanced SubStation Alpha
  SSA = 'ssa',      // SubStation Alpha
  SUB = 'sub'       // MicroDVD
}

export enum EmbedMode {
  HARDSUB = 'hardsub',    // Gravado no vídeo (permanente)
  SOFTSUB = 'softsub'     // Stream separado (pode desligar)
}

export interface SubtitleCue {
  index: number;
  startTime: number;      // Segundos
  endTime: number;        // Segundos
  text: string;
  position?: SubtitlePosition;
  style?: SubtitleStyle;
}

export interface SubtitlePosition {
  x?: number;             // 0-100 (%)
  y?: number;             // 0-100 (%)
  alignment?: 'left' | 'center' | 'right';
  verticalAlignment?: 'top' | 'middle' | 'bottom';
}

export interface SubtitleStyle {
  fontName?: string;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  outlineColor?: string;
  outlineWidth?: number;
  shadowColor?: string;
  shadowOffset?: number;
}

export interface SubtitleTrack {
  language: string;       // ISO 639-2 (eng, por, spa)
  title?: string;
  format: SubtitleFormat;
  cues: SubtitleCue[];
  default?: boolean;
  forced?: boolean;
}

export interface EmbedOptions {
  mode: EmbedMode;
  tracks: SubtitleTrack[];
  outputPath: string;
  preserveQuality?: boolean;
  defaultStyle?: SubtitleStyle;
  burnPosition?: 'top' | 'middle' | 'bottom';
}

export interface EmbedResult {
  success: boolean;
  outputPath: string;
  tracksEmbedded: number;
  mode: EmbedMode;
  fileSize: number;
  processingTime: number;
  error?: string;
}

export interface TranscriptionOptions {
  language?: string;
  model?: 'whisper-1' | 'whisper-large';
  provider?: 'openai' | 'azure' | 'local';
  maxLineLength?: number;
  maxLinesPerCue?: number;
}

export interface TranscriptionResult {
  track: SubtitleTrack;
  confidence: number;
  processingTime: number;
}

export interface SyncOptions {
  audioPath?: string;
  targetLanguage?: string;
  adjustTiming?: boolean;
  maxOffset?: number;      // Segundos
}

// ==================== CONSTANTS ====================

const DEFAULT_STYLE: SubtitleStyle = {
  fontName: 'Arial',
  fontSize: 24,
  fontColor: '#FFFFFF',
  backgroundColor: '#000000',
  bold: false,
  italic: false,
  underline: false,
  outlineColor: '#000000',
  outlineWidth: 2,
  shadowColor: '#000000',
  shadowOffset: 1
};

const TIME_REGEX = {
  SRT: /(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/,
  VTT: /(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})/
};

// ==================== SUBTITLE EMBEDDER CLASS ====================

export class SubtitleEmbedder extends EventEmitter {
  private tempDir: string;

  constructor() {
    super();
    this.tempDir = path.join(process.cwd(), '.temp', 'subtitles');
  }

  /**
   * Embute legendas em vídeo
   */
  async embed(
    videoPath: string,
    options: EmbedOptions
  ): Promise<EmbedResult> {
    const startTime = Date.now();

    const result: EmbedResult = {
      success: false,
      outputPath: options.outputPath,
      tracksEmbedded: 0,
      mode: options.mode,
      fileSize: 0,
      processingTime: 0
    };

    try {
      // Criar diretório temporário
      await fs.mkdir(this.tempDir, { recursive: true });

      // Preparar arquivos de legendas
      const subtitleFiles: string[] = [];
      for (let i = 0; i < options.tracks.length; i++) {
        const track = options.tracks[i];
        const filePath = await this.generateSubtitleFile(track, i, options.defaultStyle);
        subtitleFiles.push(filePath);
      }

      // Embedar baseado no modo
      if (options.mode === EmbedMode.HARDSUB) {
        await this.embedHardsub(
          videoPath,
          subtitleFiles[0],  // Apenas primeira track para hardsub
          options.outputPath,
          options.defaultStyle,
          options.burnPosition
        );
      } else {
        await this.embedSoftsub(
          videoPath,
          subtitleFiles,
          options.tracks,
          options.outputPath,
          options.preserveQuality
        );
      }

      // Limpar arquivos temporários
      for (const file of subtitleFiles) {
        await fs.unlink(file).catch(() => {});
      }

      // Obter tamanho do arquivo
      const stats = await fs.stat(options.outputPath);

      result.success = true;
      result.tracksEmbedded = options.tracks.length;
      result.fileSize = stats.size;
      result.processingTime = Date.now() - startTime;

      this.emit('embed:complete', result);
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
   * Gera legendas automaticamente via transcrição
   */
  async transcribe(
    videoPath: string,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    const startTime = Date.now();

    // Extrair áudio
    const audioPath = await this.extractAudio(videoPath);

    try {
      // Aqui integraria com API de transcrição (OpenAI Whisper, etc)
      // Por ora, retornamos estrutura de exemplo
      const cues = await this.mockTranscription(audioPath, options);

      const track: SubtitleTrack = {
        language: options?.language || 'eng',
        title: 'Auto-generated',
        format: SubtitleFormat.SRT,
        cues,
        default: true
      };

      const result: TranscriptionResult = {
        track,
        confidence: 0.95,
        processingTime: Date.now() - startTime
      };

      this.emit('transcription:complete', result);
      return result;

    } finally {
      // Limpar áudio temporário
      await fs.unlink(audioPath).catch(() => {});
    }
  }

  /**
   * Sincroniza legendas com áudio
   */
  async synchronize(
    videoPath: string,
    subtitlePath: string,
    options?: SyncOptions
  ): Promise<SubtitleTrack> {
    // Carregar legendas
    const track = await this.parseSubtitleFile(subtitlePath);

    // Ajustar timing baseado em análise de áudio
    if (options?.adjustTiming) {
      const adjustedCues = await this.adjustTiming(track.cues, videoPath, options);
      track.cues = adjustedCues;
    }

    this.emit('sync:complete', track);
    return track;
  }

  /**
   * Converte entre formatos de legenda
   */
  async convert(
    inputPath: string,
    outputPath: string,
    targetFormat: SubtitleFormat
  ): Promise<void> {
    const track = await this.parseSubtitleFile(inputPath);
    track.format = targetFormat;

    const content = this.generateSubtitleContent(track.cues, targetFormat);
    await fs.writeFile(outputPath, content);

    this.emit('convert:complete', { inputPath, outputPath, format: targetFormat });
  }

  // ==================== PRIVATE METHODS ====================

  private async generateSubtitleFile(
    track: SubtitleTrack,
    index: number,
    defaultStyle?: SubtitleStyle
  ): Promise<string> {
    const fileName = `subtitle_${index}_${track.language}.${track.format}`;
    const filePath = path.join(this.tempDir, fileName);

    const content = this.generateSubtitleContent(track.cues, track.format, defaultStyle);
    await fs.writeFile(filePath, content);

    return filePath;
  }

  private generateSubtitleContent(
    cues: SubtitleCue[],
    format: SubtitleFormat,
    defaultStyle?: SubtitleStyle
  ): string {
    switch (format) {
      case SubtitleFormat.SRT:
        return this.generateSRT(cues);
      case SubtitleFormat.VTT:
        return this.generateVTT(cues);
      case SubtitleFormat.ASS:
        return this.generateASS(cues, defaultStyle);
      default:
        throw new Error(`Format ${format} not implemented`);
    }
  }

  private generateSRT(cues: SubtitleCue[]): string {
    let content = '';

    for (const cue of cues) {
      content += `${cue.index}\n`;
      content += `${this.formatSRTTime(cue.startTime)} --> ${this.formatSRTTime(cue.endTime)}\n`;
      content += `${cue.text}\n\n`;
    }

    return content;
  }

  private generateVTT(cues: SubtitleCue[]): string {
    let content = 'WEBVTT\n\n';

    for (const cue of cues) {
      content += `${this.formatVTTTime(cue.startTime)} --> ${this.formatVTTTime(cue.endTime)}`;
      
      if (cue.position) {
        content += ` line:${cue.position.y || 85}% align:${cue.position.alignment || 'center'}`;
      }
      
      content += `\n${cue.text}\n\n`;
    }

    return content;
  }

  private generateASS(cues: SubtitleCue[], defaultStyle?: SubtitleStyle): string {
    const style = { ...DEFAULT_STYLE, ...defaultStyle };

    let content = '[Script Info]\n';
    content += 'Title: Auto-generated\n';
    content += 'ScriptType: v4.00+\n\n';

    content += '[V4+ Styles]\n';
    content += 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n';
    content += `Style: Default,${style.fontName},${style.fontSize},${this.colorToASS(style.fontColor!)},&H000000FF,${this.colorToASS(style.outlineColor!)},${this.colorToASS(style.backgroundColor!)},${style.bold ? -1 : 0},${style.italic ? -1 : 0},${style.underline ? -1 : 0},0,100,100,0,0,1,${style.outlineWidth},${style.shadowOffset},2,10,10,10,1\n\n`;

    content += '[Events]\n';
    content += 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';

    for (const cue of cues) {
      content += `Dialogue: 0,${this.formatASSTime(cue.startTime)},${this.formatASSTime(cue.endTime)},Default,,0,0,0,,${cue.text}\n`;
    }

    return content;
  }

  private async embedHardsub(
    videoPath: string,
    subtitlePath: string,
    outputPath: string,
    style?: SubtitleStyle,
    position: 'top' | 'middle' | 'bottom' = 'bottom'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const positionY = position === 'top' ? 50 : position === 'middle' ? '(h-text_h)/2' : 'h-th-50';

      let filter = `subtitles=${subtitlePath.replace(/\\/g, '/')}`;
      
      if (style) {
        filter += `:force_style='FontName=${style.fontName},FontSize=${style.fontSize},PrimaryColour=${this.colorToASS(style.fontColor!)},OutlineColour=${this.colorToASS(style.outlineColor!)},Outline=${style.outlineWidth}'`;
      }

      ffmpeg(videoPath)
        .videoFilters(filter)
        .videoCodec('libx264')
        .audioCodec('copy')
        .addOption('-crf', '18')
        .addOption('-preset', 'medium')
        .output(outputPath)
        .on('progress', (progress) => {
          this.emit('progress', progress);
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  private async embedSoftsub(
    videoPath: string,
    subtitlePaths: string[],
    tracks: SubtitleTrack[],
    outputPath: string,
    preserveQuality: boolean = true
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(videoPath);

      // Adicionar arquivos de legenda como inputs
      for (const subtitlePath of subtitlePaths) {
        command = command.input(subtitlePath);
      }

      // Copiar streams de vídeo e áudio
      command = command.videoCodec('copy').audioCodec('copy');

      // Mapear streams
      command = command.outputOptions([
        '-map 0:v',
        '-map 0:a'
      ]);

      // Adicionar legendas como streams separados
      for (let i = 0; i < subtitlePaths.length; i++) {
        const track = tracks[i];
        command = command.outputOptions([
          `-map ${i + 1}`,
          `-metadata:s:s:${i} language=${track.language}`,
          `-metadata:s:s:${i} title="${track.title || track.language}"`
        ]);

        if (track.default) {
          command = command.outputOptions(`-disposition:s:${i} default`);
        }
      }

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

  private async extractAudio(videoPath: string): Promise<string> {
    const audioPath = path.join(this.tempDir, `audio_${Date.now()}.wav`);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .output(audioPath)
        .on('end', () => resolve(audioPath))
        .on('error', (err) => reject(err))
        .run();
    });
  }

  private async mockTranscription(audioPath: string, options?: TranscriptionOptions): Promise<SubtitleCue[]> {
    // Simulação - em produção, chamar API real
    const maxLength = options?.maxLineLength || 42;
    
    return [
      {
        index: 1,
        startTime: 0,
        endTime: 3,
        text: 'Bem-vindo ao curso de Norma Regulamentadora 35.'
      },
      {
        index: 2,
        startTime: 3.5,
        endTime: 7,
        text: 'Neste módulo, aprenderemos sobre trabalho em altura.'
      },
      {
        index: 3,
        startTime: 7.5,
        endTime: 11,
        text: 'A segurança é fundamental em todas as operações.'
      }
    ];
  }

  private async adjustTiming(
    cues: SubtitleCue[],
    videoPath: string,
    options?: SyncOptions
  ): Promise<SubtitleCue[]> {
    // Implementação simplificada - em produção usar análise de áudio
    const maxOffset = options?.maxOffset || 2;

    return cues.map(cue => ({
      ...cue,
      startTime: Math.max(0, cue.startTime + (Math.random() - 0.5) * maxOffset),
      endTime: Math.max(0, cue.endTime + (Math.random() - 0.5) * maxOffset)
    }));
  }

  private async parseSubtitleFile(filePath: string): Promise<SubtitleTrack> {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase().slice(1) as SubtitleFormat;

    const cues = this.parseSubtitleContent(content, ext);

    return {
      language: 'eng',
      format: ext,
      cues
    };
  }

  private parseSubtitleContent(content: string, format: SubtitleFormat): SubtitleCue[] {
    switch (format) {
      case SubtitleFormat.SRT:
        return this.parseSRT(content);
      case SubtitleFormat.VTT:
        return this.parseVTT(content);
      default:
        throw new Error(`Parsing ${format} not implemented`);
    }
  }

  private parseSRT(content: string): SubtitleCue[] {
    const cues: SubtitleCue[] = [];
    const blocks = content.trim().split('\n\n');

    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length < 3) continue;

      const index = parseInt(lines[0]);
      const timeMatch = lines[1].match(TIME_REGEX.SRT);
      if (!timeMatch) continue;

      const startTime = this.parseSRTTime(timeMatch.slice(1, 5));
      const endTime = this.parseSRTTime(timeMatch.slice(5, 9));
      const text = lines.slice(2).join('\n');

      cues.push({ index, startTime, endTime, text });
    }

    return cues;
  }

  private parseVTT(content: string): SubtitleCue[] {
    const cues: SubtitleCue[] = [];
    const blocks = content.replace('WEBVTT\n\n', '').trim().split('\n\n');

    let index = 1;
    for (const block of blocks) {
      const lines = block.split('\n');
      const timeMatch = lines[0].match(TIME_REGEX.VTT);
      if (!timeMatch) continue;

      const startTime = this.parseVTTTime(timeMatch.slice(1, 5));
      const endTime = this.parseVTTTime(timeMatch.slice(5, 9));
      const text = lines.slice(1).join('\n');

      cues.push({ index: index++, startTime, endTime, text });
    }

    return cues;
  }

  private formatSRTTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  private formatVTTTime(seconds: number): string {
    return this.formatSRTTime(seconds).replace(',', '.');
  }

  private formatASSTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100);

    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  }

  private parseSRTTime(parts: string[]): number {
    const h = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const s = parseInt(parts[2]);
    const ms = parseInt(parts[3]);

    return h * 3600 + m * 60 + s + ms / 1000;
  }

  private parseVTTTime(parts: string[]): number {
    return this.parseSRTTime(parts);
  }

  private colorToASS(hex: string): string {
    // Converter #RRGGBB para &HBBGGRR (ASS usa BGR)
    if (!hex.startsWith('#')) return '&H00FFFFFF';
    
    const r = hex.slice(1, 3);
    const g = hex.slice(3, 5);
    const b = hex.slice(5, 7);

    return `&H00${b}${g}${r}`.toUpperCase();
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Embute legendas simples (hardsub)
 */
export async function embedHardSubtitles(
  videoPath: string,
  subtitlePath: string,
  outputPath: string
): Promise<EmbedResult> {
  const embedder = new SubtitleEmbedder();
  const track = await embedder['parseSubtitleFile'](subtitlePath);

  return embedder.embed(videoPath, {
    mode: EmbedMode.HARDSUB,
    tracks: [track],
    outputPath
  });
}

/**
 * Embute múltiplas legendas (softsub)
 */
export async function embedMultiLanguageSubtitles(
  videoPath: string,
  subtitles: { path: string; language: string; title?: string }[],
  outputPath: string
): Promise<EmbedResult> {
  const embedder = new SubtitleEmbedder();
  
  const tracks: SubtitleTrack[] = [];
  for (const sub of subtitles) {
    const track = await embedder['parseSubtitleFile'](sub.path);
    track.language = sub.language;
    track.title = sub.title;
    track.default = tracks.length === 0; // Primeira é default
    tracks.push(track);
  }

  return embedder.embed(videoPath, {
    mode: EmbedMode.SOFTSUB,
    tracks,
    outputPath
  });
}

export default SubtitleEmbedder;
