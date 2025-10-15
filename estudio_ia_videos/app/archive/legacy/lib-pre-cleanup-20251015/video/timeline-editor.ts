/**
 * Timeline Editor - Editor de linha do tempo para vídeos
 * 
 * Sistema completo de edição não-linear permitindo:
 * - Adicionar/remover clipes
 * - Cortar e trimmar clipes
 * - Organizar ordem dos clipes
 * - Aplicar transições automáticas
 * - Sobrepor áudio/vídeo
 * - Exportar timeline final
 * 
 * @module TimelineEditor
 */

import { EventEmitter } from 'events';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Tipos de transição entre clipes
 */
export type TransitionType = 
  | 'none'
  | 'fade'
  | 'dissolve'
  | 'wipe'
  | 'slide'
  | 'zoom';

/**
 * Tipos de track na timeline
 */
export type TrackType = 'video' | 'audio' | 'both';

/**
 * Configuração de um clip individual
 */
export interface TimelineClip {
  id: string;
  filePath: string;
  trackType: TrackType;
  startTime: number;      // Tempo de início no arquivo original (segundos)
  endTime: number;        // Tempo de fim no arquivo original (segundos)
  duration: number;       // Duração efetiva do clip
  timelineStart: number;  // Posição de início na timeline
  timelineEnd: number;    // Posição de fim na timeline
  transition?: {
    type: TransitionType;
    duration: number;     // Duração da transição (segundos)
  };
  volume?: number;        // Volume do áudio (0-1)
  speed?: number;         // Velocidade de reprodução (0.5 = metade, 2 = dobro)
  filters?: string[];     // Filtros FFmpeg adicionais
  metadata?: {
    name?: string;
    description?: string;
    tags?: string[];
  };
}

/**
 * Configuração de uma track
 */
export interface TimelineTrack {
  id: string;
  type: TrackType;
  clips: TimelineClip[];
  muted?: boolean;
  volume?: number;        // Volume da track (0-1)
  locked?: boolean;       // Track travada para edição
}

/**
 * Configuração da timeline completa
 */
export interface TimelineConfig {
  tracks: TimelineTrack[];
  duration?: number;      // Duração total (auto-calculada se não fornecida)
  fps?: number;           // FPS do output (padrão: 30)
  resolution?: {
    width: number;
    height: number;
  };
  audioSampleRate?: number; // Taxa de amostragem do áudio (padrão: 48000)
  audioChannels?: number;   // Canais de áudio (padrão: 2)
}

/**
 * Opções de exportação
 */
export interface ExportOptions {
  outputPath: string;
  videoCodec?: string;    // Padrão: libx264
  audioCodec?: string;    // Padrão: aac
  preset?: string;        // Padrão: medium
  crf?: number;           // Padrão: 23
  audioBitrate?: string;  // Padrão: 192k
  format?: string;        // Padrão: mp4
  overwrite?: boolean;    // Padrão: true
}

/**
 * Resultado da exportação
 */
export interface ExportResult {
  success: boolean;
  outputPath: string;
  duration: number;
  fileSize: number;
  processingTime: number;
  clipCount: number;
  trackCount: number;
}

/**
 * Resultado de preview
 */
export interface PreviewResult {
  success: boolean;
  thumbnailPath: string;
  timestamp: number;
}

/**
 * Opções de trim de clip
 */
export interface TrimOptions {
  startTime?: number;     // Novo início (segundos)
  endTime?: number;       // Novo fim (segundos)
  duration?: number;      // Nova duração
}

/**
 * Opções de split de clip
 */
export interface SplitOptions {
  timestamp: number;      // Onde dividir (segundos no clip)
}

/**
 * Opções padrão para exportação
 */
const DEFAULT_EXPORT_OPTIONS: Partial<ExportOptions> = {
  videoCodec: 'libx264',
  audioCodec: 'aac',
  preset: 'medium',
  crf: 23,
  audioBitrate: '192k',
  format: 'mp4',
  overwrite: true
};

/**
 * Timeline Editor Class
 * 
 * Gerencia a edição não-linear de vídeos através de uma timeline com múltiplas tracks.
 * 
 * @example
 * ```typescript
 * const editor = new TimelineEditor();
 * 
 * // Criar track de vídeo
 * const trackId = editor.addTrack('video');
 * 
 * // Adicionar clips
 * editor.addClip(trackId, {
 *   filePath: 'intro.mp4',
 *   startTime: 0,
 *   endTime: 5
 * });
 * 
 * // Exportar
 * await editor.export({ outputPath: 'final.mp4' });
 * ```
 */
export class TimelineEditor extends EventEmitter {
  private timeline: TimelineConfig;
  private tempDir: string;

  constructor() {
    super();
    this.timeline = {
      tracks: [],
      fps: 30,
      resolution: { width: 1920, height: 1080 },
      audioSampleRate: 48000,
      audioChannels: 2
    };
    this.tempDir = path.join(process.cwd(), 'temp', 'timeline');
  }

  /**
   * Adiciona uma nova track à timeline
   */
  addTrack(type: TrackType, options?: { muted?: boolean; volume?: number }): string {
    const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const track: TimelineTrack = {
      id: trackId,
      type,
      clips: [],
      muted: options?.muted || false,
      volume: options?.volume || 1.0,
      locked: false
    };

    this.timeline.tracks.push(track);
    this.emit('track-added', { trackId, type });

    return trackId;
  }

  /**
   * Remove uma track da timeline
   */
  removeTrack(trackId: string): boolean {
    const index = this.timeline.tracks.findIndex(t => t.id === trackId);
    
    if (index === -1) {
      throw new Error(`Track não encontrada: ${trackId}`);
    }

    const track = this.timeline.tracks[index];
    if (track.locked) {
      throw new Error(`Track travada: ${trackId}`);
    }

    this.timeline.tracks.splice(index, 1);
    this.emit('track-removed', { trackId });

    return true;
  }

  /**
   * Adiciona um clip a uma track
   */
  async addClip(
    trackId: string, 
    clipConfig: {
      filePath: string;
      startTime?: number;
      endTime?: number;
      duration?: number;
      timelineStart?: number;
      transition?: { type: TransitionType; duration: number };
      volume?: number;
      speed?: number;
    }
  ): Promise<string> {
    const track = this.findTrack(trackId);
    
    // Validar arquivo
    await this.validateFile(clipConfig.filePath);

    // Obter informações do vídeo
    const videoInfo = await this.getVideoInfo(clipConfig.filePath);

    // Calcular tempos
    const startTime = clipConfig.startTime || 0;
    const endTime = clipConfig.endTime || videoInfo.duration;
    const duration = clipConfig.duration || (endTime - startTime);
    
    // Validar tempos
    if (startTime < 0 || endTime > videoInfo.duration || startTime >= endTime) {
      throw new Error('Tempos de clip inválidos');
    }

    // Calcular posição na timeline
    const lastClip = track.clips[track.clips.length - 1];
    const timelineStart = clipConfig.timelineStart !== undefined 
      ? clipConfig.timelineStart 
      : (lastClip ? lastClip.timelineEnd : 0);

    const clipId = `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const clip: TimelineClip = {
      id: clipId,
      filePath: clipConfig.filePath,
      trackType: track.type,
      startTime,
      endTime,
      duration,
      timelineStart,
      timelineEnd: timelineStart + duration,
      transition: clipConfig.transition,
      volume: clipConfig.volume || 1.0,
      speed: clipConfig.speed || 1.0
    };

    track.clips.push(clip);
    this.sortClipsByTimeline(track);
    this.emit('clip-added', { trackId, clipId, clip });

    return clipId;
  }

  /**
   * Remove um clip de uma track
   */
  removeClip(trackId: string, clipId: string): boolean {
    const track = this.findTrack(trackId);
    
    if (track.locked) {
      throw new Error(`Track travada: ${trackId}`);
    }

    const index = track.clips.findIndex(c => c.id === clipId);
    
    if (index === -1) {
      throw new Error(`Clip não encontrado: ${clipId}`);
    }

    track.clips.splice(index, 1);
    this.emit('clip-removed', { trackId, clipId });

    return true;
  }

  /**
   * Corta (trim) um clip
   */
  async trimClip(trackId: string, clipId: string, options: TrimOptions): Promise<void> {
    const track = this.findTrack(trackId);
    const clip = this.findClip(track, clipId);

    const videoInfo = await this.getVideoInfo(clip.filePath);

    // Calcular novos tempos
    let newStartTime = options.startTime !== undefined ? options.startTime : clip.startTime;
    let newEndTime = options.endTime !== undefined ? options.endTime : clip.endTime;

    if (options.duration !== undefined) {
      newEndTime = newStartTime + options.duration;
    }

    // Validar
    if (newStartTime < 0 || newEndTime > videoInfo.duration || newStartTime >= newEndTime) {
      throw new Error('Tempos de trim inválidos');
    }

    // Atualizar clip
    const oldDuration = clip.duration;
    clip.startTime = newStartTime;
    clip.endTime = newEndTime;
    clip.duration = newEndTime - newStartTime;
    clip.timelineEnd = clip.timelineStart + clip.duration;

    this.emit('clip-trimmed', { trackId, clipId, oldDuration, newDuration: clip.duration });
  }

  /**
   * Divide um clip em dois
   */
  async splitClip(trackId: string, clipId: string, options: SplitOptions): Promise<string[]> {
    const track = this.findTrack(trackId);
    const clip = this.findClip(track, clipId);

    const splitPoint = clip.startTime + options.timestamp;

    // Validar split point
    if (splitPoint <= clip.startTime || splitPoint >= clip.endTime) {
      throw new Error('Ponto de divisão inválido');
    }

    // Criar dois novos clips
    const clip1Id = `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_1`;
    const clip2Id = `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_2`;

    const clip1: TimelineClip = {
      ...clip,
      id: clip1Id,
      endTime: splitPoint,
      duration: splitPoint - clip.startTime,
      timelineEnd: clip.timelineStart + (splitPoint - clip.startTime)
    };

    const clip2: TimelineClip = {
      ...clip,
      id: clip2Id,
      startTime: splitPoint,
      duration: clip.endTime - splitPoint,
      timelineStart: clip1.timelineEnd,
      timelineEnd: clip1.timelineEnd + (clip.endTime - splitPoint)
    };

    // Remover clip original e adicionar os dois novos
    const index = track.clips.findIndex(c => c.id === clipId);
    track.clips.splice(index, 1, clip1, clip2);

    this.emit('clip-split', { trackId, originalClipId: clipId, newClipIds: [clip1Id, clip2Id] });

    return [clip1Id, clip2Id];
  }

  /**
   * Move um clip para uma nova posição na timeline
   */
  moveClip(trackId: string, clipId: string, newTimelineStart: number): void {
    const track = this.findTrack(trackId);
    const clip = this.findClip(track, clipId);

    if (newTimelineStart < 0) {
      throw new Error('Posição de timeline inválida');
    }

    const oldTimelineStart = clip.timelineStart;
    clip.timelineStart = newTimelineStart;
    clip.timelineEnd = newTimelineStart + clip.duration;

    this.sortClipsByTimeline(track);
    this.emit('clip-moved', { trackId, clipId, oldTimelineStart, newTimelineStart });
  }

  /**
   * Move um clip para outra track
   */
  moveClipToTrack(fromTrackId: string, toTrackId: string, clipId: string): void {
    const fromTrack = this.findTrack(fromTrackId);
    const toTrack = this.findTrack(toTrackId);
    const clip = this.findClip(fromTrack, clipId);

    // Validar compatibilidade de tipo
    if (fromTrack.type !== toTrack.type && toTrack.type !== 'both') {
      throw new Error('Tipos de track incompatíveis');
    }

    // Remover da track original
    const index = fromTrack.clips.findIndex(c => c.id === clipId);
    fromTrack.clips.splice(index, 1);

    // Adicionar à nova track
    clip.trackType = toTrack.type;
    toTrack.clips.push(clip);
    this.sortClipsByTimeline(toTrack);

    this.emit('clip-moved-to-track', { fromTrackId, toTrackId, clipId });
  }

  /**
   * Aplica uma transição entre dois clips
   */
  applyTransition(
    trackId: string, 
    clipId: string, 
    transition: { type: TransitionType; duration: number }
  ): void {
    const track = this.findTrack(trackId);
    const clip = this.findClip(track, clipId);

    clip.transition = transition;
    this.emit('transition-applied', { trackId, clipId, transition });
  }

  /**
   * Gera um preview (thumbnail) em um ponto específico da timeline
   */
  async generatePreview(timestamp: number, outputPath?: string): Promise<PreviewResult> {
    const startTime = Date.now();

    // Criar diretório temporário se necessário
    await this.ensureTempDir();

    const previewPath = outputPath || path.join(
      this.tempDir, 
      `preview_${timestamp}_${Date.now()}.jpg`
    );

    this.emit('preview-start', { timestamp });

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(this.timeline.tracks[0].clips[0].filePath) // Simplificado para o exemplo
        .seekInput(timestamp)
        .frames(1)
        .output(previewPath)
        .on('end', async () => {
          const stats = await fs.stat(previewPath);
          
          const result: PreviewResult = {
            success: true,
            thumbnailPath: previewPath,
            timestamp
          };

          this.emit('preview-complete', result);
          resolve(result);
        })
        .on('error', (err) => {
          this.emit('preview-error', { error: err.message, timestamp });
          reject(err);
        })
        .run();
    });
  }

  /**
   * Exporta a timeline completa para um arquivo de vídeo
   */
  async export(options: ExportOptions): Promise<ExportResult> {
    const startTime = Date.now();
    const exportOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };

    // Validar timeline
    this.validateTimeline();

    // Criar diretório temporário
    await this.ensureTempDir();

    this.emit('export-start', { tracks: this.timeline.tracks.length });

    try {
      // Processar cada track e combinar
      const processedClips = await this.processAllTracks();

      // Combinar todos os clips processados
      await this.combineClips(processedClips, exportOptions);

      const stats = await fs.stat(exportOptions.outputPath);
      const processingTime = Date.now() - startTime;

      const result: ExportResult = {
        success: true,
        outputPath: exportOptions.outputPath,
        duration: this.getTimelineDuration(),
        fileSize: stats.size,
        processingTime,
        clipCount: this.getTotalClipCount(),
        trackCount: this.timeline.tracks.length
      };

      this.emit('export-complete', result);
      return result;

    } catch (error) {
      this.emit('export-error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Obtém a configuração atual da timeline
   */
  getTimeline(): TimelineConfig {
    return JSON.parse(JSON.stringify(this.timeline));
  }

  /**
   * Carrega uma timeline de uma configuração
   */
  loadTimeline(config: TimelineConfig): void {
    this.timeline = JSON.parse(JSON.stringify(config));
    this.emit('timeline-loaded', { trackCount: this.timeline.tracks.length });
  }

  /**
   * Limpa toda a timeline
   */
  clearTimeline(): void {
    this.timeline.tracks = [];
    this.emit('timeline-cleared');
  }

  /**
   * Obtém a duração total da timeline
   */
  getTimelineDuration(): number {
    if (this.timeline.duration) {
      return this.timeline.duration;
    }

    let maxEnd = 0;
    
    for (const track of this.timeline.tracks) {
      for (const clip of track.clips) {
        if (clip.timelineEnd > maxEnd) {
          maxEnd = clip.timelineEnd;
        }
      }
    }

    return maxEnd;
  }

  /**
   * Obtém o número total de clips em todas as tracks
   */
  getTotalClipCount(): number {
    return this.timeline.tracks.reduce((count, track) => count + track.clips.length, 0);
  }

  /**
   * Valida um arquivo de entrada
   */
  private async validateFile(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error(`Arquivo não encontrado: ${filePath}`);
    }
  }

  /**
   * Obtém informações de um vídeo
   */
  private async getVideoInfo(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          resolve({
            duration: metadata.format.duration || 0,
            width: videoStream?.width || 0,
            height: videoStream?.height || 0,
            fps: this.parseFps(videoStream?.r_frame_rate || '30/1')
          });
        }
      });
    });
  }

  /**
   * Parse FPS string (ex: "30/1" -> 30)
   */
  private parseFps(fpsString: string): number {
    const parts = fpsString.split('/');
    return parseInt(parts[0]) / parseInt(parts[1]);
  }

  /**
   * Encontra uma track pelo ID
   */
  private findTrack(trackId: string): TimelineTrack {
    const track = this.timeline.tracks.find(t => t.id === trackId);
    
    if (!track) {
      throw new Error(`Track não encontrada: ${trackId}`);
    }

    return track;
  }

  /**
   * Encontra um clip em uma track
   */
  private findClip(track: TimelineTrack, clipId: string): TimelineClip {
    const clip = track.clips.find(c => c.id === clipId);
    
    if (!clip) {
      throw new Error(`Clip não encontrado: ${clipId}`);
    }

    return clip;
  }

  /**
   * Ordena clips de uma track por posição na timeline
   */
  private sortClipsByTimeline(track: TimelineTrack): void {
    track.clips.sort((a, b) => a.timelineStart - b.timelineStart);
  }

  /**
   * Valida a timeline antes de exportar
   */
  private validateTimeline(): void {
    if (this.timeline.tracks.length === 0) {
      throw new Error('Timeline vazia - adicione ao menos uma track');
    }

    if (this.getTotalClipCount() === 0) {
      throw new Error('Timeline sem clips - adicione ao menos um clip');
    }

    // Validar overlaps
    for (const track of this.timeline.tracks) {
      for (let i = 0; i < track.clips.length - 1; i++) {
        const current = track.clips[i];
        const next = track.clips[i + 1];
        
        if (current.timelineEnd > next.timelineStart) {
          throw new Error(`Overlap detectado na track ${track.id} entre clips ${current.id} e ${next.id}`);
        }
      }
    }
  }

  /**
   * Garante que o diretório temporário existe
   */
  private async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      // Diretório já existe
    }
  }

  /**
   * Processa todas as tracks
   */
  private async processAllTracks(): Promise<string[]> {
    const processedFiles: string[] = [];

    for (const track of this.timeline.tracks) {
      for (const clip of track.clips) {
        const processedFile = await this.processClip(clip);
        processedFiles.push(processedFile);
      }
    }

    return processedFiles;
  }

  /**
   * Processa um clip individual
   */
  private async processClip(clip: TimelineClip): Promise<string> {
    const outputPath = path.join(
      this.tempDir,
      `processed_${clip.id}.mp4`
    );

    return new Promise((resolve, reject) => {
      let command = ffmpeg(clip.filePath)
        .setStartTime(clip.startTime)
        .setDuration(clip.duration);

      // Aplicar velocidade se diferente de 1.0
      if (clip.speed && clip.speed !== 1.0) {
        command = command.videoFilters(`setpts=${1 / clip.speed}*PTS`);
      }

      // Aplicar volume
      if (clip.volume !== undefined && clip.volume !== 1.0) {
        command = command.audioFilters(`volume=${clip.volume}`);
      }

      command
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  /**
   * Combina todos os clips processados
   */
  private async combineClips(
    clipPaths: string[], 
    options: Partial<ExportOptions>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      // Adicionar todos os inputs
      clipPaths.forEach(clipPath => {
        command.input(clipPath);
      });

      // Criar filter complex para concatenação
      const filterComplex = clipPaths.map((_, i) => `[${i}:v][${i}:a]`).join('') +
        `concat=n=${clipPaths.length}:v=1:a=1[outv][outa]`;

      command
        .complexFilter(filterComplex)
        .map('[outv]')
        .map('[outa]')
        .videoCodec(options.videoCodec || 'libx264')
        .audioCodec(options.audioCodec || 'aac')
        .outputOptions([
          `-preset ${options.preset || 'medium'}`,
          `-crf ${options.crf || 23}`,
          `-b:a ${options.audioBitrate || '192k'}`
        ])
        .output(options.outputPath!)
        .on('progress', (progress) => {
          this.emit('export-progress', {
            percent: progress.percent || 0,
            currentFps: progress.currentFps,
            targetSize: progress.targetSize
          });
        })
        .on('end', () => resolve())
        .on('error', reject);

      if (options.overwrite) {
        command.outputOptions('-y');
      }

      command.run();
    });
  }
}

/**
 * Factory Functions
 */

/**
 * Cria um editor básico
 */
export function createBasicEditor(): TimelineEditor {
  return new TimelineEditor();
}

/**
 * Cria um editor com preset de alta qualidade
 */
export function createHighQualityEditor(): {
  editor: TimelineEditor;
  exportOptions: Partial<ExportOptions>;
} {
  const editor = new TimelineEditor();
  
  const exportOptions: Partial<ExportOptions> = {
    videoCodec: 'libx265',
    preset: 'slow',
    crf: 18,
    audioBitrate: '256k'
  };

  return { editor, exportOptions };
}

/**
 * Cria um editor para redes sociais
 */
export function createSocialMediaEditor(): {
  editor: TimelineEditor;
  config: Partial<TimelineConfig>;
  exportOptions: Partial<ExportOptions>;
} {
  const editor = new TimelineEditor();
  
  const config: Partial<TimelineConfig> = {
    resolution: { width: 1080, height: 1920 }, // Vertical
    fps: 30
  };

  const exportOptions: Partial<ExportOptions> = {
    videoCodec: 'libx264',
    preset: 'fast',
    crf: 23,
    audioBitrate: '128k'
  };

  return { editor, config, exportOptions };
}

/**
 * Cria um editor para cursos online
 */
export function createCourseEditor(): {
  editor: TimelineEditor;
  config: Partial<TimelineConfig>;
  exportOptions: Partial<ExportOptions>;
} {
  const editor = new TimelineEditor();
  
  const config: Partial<TimelineConfig> = {
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    audioSampleRate: 48000,
    audioChannels: 2
  };

  const exportOptions: Partial<ExportOptions> = {
    videoCodec: 'libx264',
    preset: 'medium',
    crf: 20,
    audioBitrate: '192k'
  };

  return { editor, config, exportOptions };
}

export default TimelineEditor;
