
/**
 * 🎬 Timeline Composer - FFmpeg Integration
 * Compõe vídeo final a partir da timeline
 */

import type { Timeline, Clip, Track } from '@/lib/types/timeline';

interface CompositionOptions {
  timeline: Timeline;
  outputPath: string;
  onProgress?: (progress: number) => void;
}

export class TimelineComposer {
  private timeline: Timeline;
  private outputPath: string;
  private onProgress?: (progress: number) => void;
  
  constructor(options: CompositionOptions) {
    this.timeline = options.timeline;
    this.outputPath = options.outputPath;
    this.onProgress = options.onProgress;
  }
  
  /**
   * Compõe o vídeo final
   */
  async compose(): Promise<string> {
    console.log('Starting timeline composition...');
    
    // 1. Preparar tracks
    const videoTracks = this.timeline.tracks.filter(t => t.type === 'video' || t.type === 'image' || t.type === 'avatar');
    const audioTracks = this.timeline.tracks.filter(t => t.type === 'audio');
    const textTracks = this.timeline.tracks.filter(t => t.type === 'text');
    
    // 2. Gerar filterComplex para FFmpeg
    const filterComplex = this.generateFilterComplex(videoTracks, audioTracks, textTracks);
    
    // 3. Construir comando FFmpeg
    const command = this.buildFFmpegCommand(filterComplex);
    
    // 4. Executar (simulado por enquanto)
    console.log('FFmpeg Command:', command);
    
    // Simular progresso
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      this.onProgress?.(i);
    }
    
    console.log('Composition complete!');
    return this.outputPath;
  }
  
  /**
   * Gera o filterComplex do FFmpeg
   */
  private generateFilterComplex(
    videoTracks: Track[],
    audioTracks: Track[],
    textTracks: Track[]
  ): string {
    const filters: string[] = [];
    let inputIndex = 0;
    
    // Processar tracks de vídeo
    videoTracks.forEach((track, trackIndex) => {
      track.clips.forEach((clip, clipIndex) => {
        const input = `[${inputIndex++}:v]`;
        
        // Aplicar trim baseado no startTime e duration
        filters.push(
          `${input}trim=start=${clip.startTime}:duration=${clip.duration},setpts=PTS-STARTPTS[v${trackIndex}_${clipIndex}]`
        );
        
        // Aplicar opacity se necessário
        if (clip.opacity && clip.opacity < 100) {
          filters.push(
            `[v${trackIndex}_${clipIndex}]format=yuva444p,colorchannelmixer=aa=${clip.opacity / 100}[v${trackIndex}_${clipIndex}_opacity]`
          );
        }
        
        // Aplicar scale se necessário
        if (clip.scale && clip.scale !== 1) {
          filters.push(
            `[v${trackIndex}_${clipIndex}]scale=iw*${clip.scale}:ih*${clip.scale}[v${trackIndex}_${clipIndex}_scaled]`
          );
        }
      });
    });
    
    // Processar tracks de áudio
    audioTracks.forEach((track, trackIndex) => {
      track.clips.forEach((clip, clipIndex) => {
        const input = `[${inputIndex++}:a]`;
        
        // Aplicar trim
        filters.push(
          `${input}atrim=start=${clip.startTime}:duration=${clip.duration},asetpts=PTS-STARTPTS[a${trackIndex}_${clipIndex}]`
        );
        
        // Aplicar volume
        if (clip.volume && clip.volume !== 100) {
          filters.push(
            `[a${trackIndex}_${clipIndex}]volume=${clip.volume / 100}[a${trackIndex}_${clipIndex}_vol]`
          );
        }
      });
    });
    
    // Overlay de vídeos (se houver múltiplos)
    if (videoTracks.length > 1) {
      let overlayChain = '[v0_0]';
      for (let i = 1; i < videoTracks.length; i++) {
        filters.push(
          `${overlayChain}[v${i}_0]overlay=x=0:y=0[overlay${i}]`
        );
        overlayChain = `[overlay${i}]`;
      }
    }
    
    // Mix de áudios (se houver múltiplos)
    if (audioTracks.length > 1) {
      const audioInputs = audioTracks.map((_, i) => `[a${i}_0]`).join('');
      filters.push(
        `${audioInputs}amix=inputs=${audioTracks.length}:duration=longest[aout]`
      );
    }
    
    return filters.join(';');
  }
  
  /**
   * Constrói o comando completo do FFmpeg
   */
  private buildFFmpegCommand(filterComplex: string): string {
    const { width, height } = this.timeline.resolution;
    const fps = this.timeline.fps;
    
    // Inputs (simplificado)
    const inputs: string[] = [];
    
    this.timeline.tracks.forEach(track => {
      track.clips.forEach(clip => {
        if (clip.content.url) {
          inputs.push(`-i ${clip.content.url}`);
        }
      });
    });
    
    // Comando completo
    return `
      ffmpeg
      ${inputs.join(' ')}
      -filter_complex "${filterComplex}"
      -map "[vout]"
      -map "[aout]"
      -c:v libx264
      -preset medium
      -crf 23
      -c:a aac
      -b:a 192k
      -r ${fps}
      -s ${width}x${height}
      -movflags +faststart
      ${this.outputPath}
    `.trim().replace(/\s+/g, ' ');
  }
  
  /**
   * Valida a timeline antes da composição
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (this.timeline.tracks.length === 0) {
      errors.push('Timeline has no tracks');
    }
    
    const hasContent = this.timeline.tracks.some(t => t.clips.length > 0);
    if (!hasContent) {
      errors.push('Timeline has no clips');
    }
    
    // Verificar overlaps (clips sobrepostos na mesma track)
    this.timeline.tracks.forEach(track => {
      const sortedClips = [...track.clips].sort((a, b) => a.startTime - b.startTime);
      
      for (let i = 0; i < sortedClips.length - 1; i++) {
        const current = sortedClips[i];
        const next = sortedClips[i + 1];
        
        if (current.startTime + current.duration > next.startTime) {
          errors.push(
            `Clips overlap in track "${track.name}": "${current.name}" and "${next.name}"`
          );
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Estima a duração do processo de render
   */
  estimateRenderTime(): number {
    // Estimativa simples: ~2x a duração do vídeo em tempo de processamento
    // Depende de: complexidade, resolução, hardware, etc
    return this.timeline.duration * 2;
  }
  
  /**
   * Gera um preview de baixa qualidade (rápido)
   */
  async generatePreview(previewPath: string): Promise<string> {
    console.log('Generating preview...');
    
    // Preview em resolução reduzida e taxa de frames menor
    const previewTimeline = {
      ...this.timeline,
      resolution: {
        width: 640,
        height: 360,
      },
      fps: 15,
    };
    
    const composer = new TimelineComposer({
      timeline: previewTimeline,
      outputPath: previewPath,
      onProgress: this.onProgress,
    });
    
    return composer.compose();
  }
}

/**
 * Helper para criar um compositor a partir de um projectId
 */
export async function createTimelineComposer(
  projectId: string,
  outputPath: string,
  onProgress?: (progress: number) => void
): Promise<TimelineComposer> {
  // Buscar timeline do projeto
  const response = await fetch(`/api/timeline/${projectId}`);
  
  if (!response.ok) {
    throw new Error('Failed to load timeline');
  }
  
  const timeline = await response.json();
  
  return new TimelineComposer({
    timeline,
    outputPath,
    onProgress,
  });
}
