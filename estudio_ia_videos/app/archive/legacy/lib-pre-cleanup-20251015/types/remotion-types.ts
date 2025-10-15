/**
 * 🎬 Tipos Remotion - Sistema de Renderização
 * Tipos para integração entre timeline e Remotion
 */

import { TimelineProject, TimelineElement } from './timeline-types';

// Configuração de renderização
export interface RenderConfig {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  composition: string;
}

// Props para composição Remotion
export interface VideoCompositionProps {
  project: TimelineProject;
  config: RenderConfig;
}

// Elemento renderizado
export interface RenderedElement {
  id: string;
  type: TimelineElement['type'];
  startFrame: number;
  endFrame: number;
  props: any;
  style: React.CSSProperties;
  animations: ElementAnimation[];
}

// Animação de elemento
export interface ElementAnimation {
  property: string;
  frames: AnimationFrame[];
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

// Frame de animação
export interface AnimationFrame {
  frame: number;
  value: any;
}

// Template de composição
export interface CompositionTemplate {
  id: string;
  name: string;
  component: React.ComponentType<VideoCompositionProps>;
  width: number;
  height: number;
  fps: number;
  defaultProps?: Partial<VideoCompositionProps>;
}

// Job de renderização
export interface RenderJob {
  id: string;
  projectId: string;
  compositionId: string;
  config: RenderConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Progresso de renderização
export interface RenderProgress {
  frame: number;
  totalFrames: number;
  percentage: number;
  renderedInSeconds: number;
  estimatedTimeRemaining?: number;
}

// Configurações de exportação
export interface ExportSettings {
  format: 'mp4' | 'webm' | 'gif' | 'mp3' | 'wav';
  quality: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  bitrate?: string;
  codec?: 'h264' | 'h265' | 'vp8' | 'vp9';
  audioCodec?: 'aac' | 'mp3' | 'opus';
  audioBitrate?: string;
}

// Preset de qualidade
export interface QualityPreset {
  name: string;
  width: number;
  height: number;
  fps: number;
  bitrate: string;
  audioBitrate: string;
}

// Presets padrão
export const QUALITY_PRESETS: Record<string, QualityPreset> = {
  '4k': {
    name: '4K Ultra HD',
    width: 3840,
    height: 2160,
    fps: 30,
    bitrate: '20M',
    audioBitrate: '320k'
  },
  '1080p': {
    name: 'Full HD 1080p',
    width: 1920,
    height: 1080,
    fps: 30,
    bitrate: '8M',
    audioBitrate: '192k'
  },
  '720p': {
    name: 'HD 720p',
    width: 1280,
    height: 720,
    fps: 30,
    bitrate: '5M',
    audioBitrate: '128k'
  },
  '480p': {
    name: 'SD 480p',
    width: 854,
    height: 480,
    fps: 30,
    bitrate: '2M',
    audioBitrate: '96k'
  }
};

export default {
  RenderConfig,
  VideoCompositionProps,
  RenderedElement,
  ElementAnimation,
  AnimationFrame,
  CompositionTemplate,
  RenderJob,
  RenderProgress,
  ExportSettings,
  QualityPreset,
  QUALITY_PRESETS
};