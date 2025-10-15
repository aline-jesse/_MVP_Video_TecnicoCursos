
/**
 * 🎬 Timeline Types - REAL (não mock)
 * Sistema de timeline multi-track para edição de vídeo
 */

export type TrackType = 'video' | 'audio' | 'text' | 'image' | 'avatar';

export interface Clip {
  id: string;
  trackId: string;
  type: TrackType;
  name: string;
  
  // Posicionamento temporal
  startTime: number;  // em segundos
  duration: number;   // em segundos
  
  // Conteúdo
  content: {
    url?: string;           // URL do arquivo (vídeo/áudio/imagem)
    text?: string;          // Para clipes de texto
    avatarId?: string;      // Para clipes de avatar
    thumbnail?: string;     // Thumbnail do clipe
  };
  
  // Propriedades de edição
  volume?: number;          // 0-100
  opacity?: number;         // 0-100
  position?: {              // Para clipes de texto/imagem
    x: number;
    y: number;
  };
  scale?: number;           // Para zoom
  
  // Transições
  transition?: {
    type: 'fade' | 'slide' | 'zoom' | 'none';
    duration: number;
  };
  
  // Metadados
  locked?: boolean;
  hidden?: boolean;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  clips: Clip[];
  
  // Propriedades da track
  volume: number;           // 0-100
  muted: boolean;
  locked: boolean;
  hidden: boolean;
  
  // Visual
  color?: string;
  height?: number;          // Altura da track em pixels
}

export interface Timeline {
  id: string;
  projectId: string;
  tracks: Track[];
  
  // Configurações globais
  duration: number;         // Duração total em segundos
  fps: number;              // Frames por segundo (default: 30)
  resolution: {
    width: number;
    height: number;
  };
  
  // Estado de reprodução
  currentTime: number;
  playing: boolean;
  loop: boolean;
  
  // Zoom e navegação
  zoom: number;             // 1 = 100%, 2 = 200%, etc
  scrollPosition: number;   // Posição do scroll horizontal
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineManipulation {
  // Tracks
  addTrack: (track: Omit<Track, 'id' | 'clips'>) => Track;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, data: Partial<Track>) => void;
  reorderTracks: (trackIds: string[]) => void;
  
  // Clips
  addClip: (trackId: string, clip: Omit<Clip, 'id' | 'trackId'>) => Clip;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, data: Partial<Clip>) => void;
  moveClip: (clipId: string, newTrackId: string, newStartTime: number) => void;
  splitClip: (clipId: string, splitTime: number) => [Clip, Clip] | null;
  duplicateClip: (clipId: string) => Clip | null;
  
  // Playback
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  
  // Zoom e navegação
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (zoom: number) => void;
  
  // Persistência
  save: () => Promise<void>;
  load: () => Promise<void>;
}

export interface TimelineConfig {
  minTrackHeight: number;
  maxTrackHeight: number;
  defaultTrackHeight: number;
  pixelsPerSecond: number;  // Quantos pixels representam 1 segundo
  snapToGrid: boolean;
  gridSize: number;         // Em segundos
}

export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  minTrackHeight: 50,
  maxTrackHeight: 200,
  defaultTrackHeight: 80,
  pixelsPerSecond: 100,
  snapToGrid: true,
  gridSize: 0.1, // 100ms
};
