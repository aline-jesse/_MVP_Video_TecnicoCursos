
/**
 * Types para importação PPTX → Timeline
 */

export interface PPTXImportStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export interface SlidePreview {
  slideNumber: number;
  thumbnailUrl: string;
  title: string;
  duration: number; // segundos
  selected: boolean;
  notes?: string;
}

export interface ImportConfig {
  slideDuration: number; // duração padrão por slide (segundos)
  transition: 'fade' | 'slide' | 'none';
  transitionDuration: number; // segundos
  addAudio: boolean;
  audioType: 'tts' | 'upload' | 'none';
  voiceId?: string;
  audioFile?: File;
}

export interface ConversionResult {
  success: boolean;
  projectId?: string;
  timelineId?: string;
  clipsCreated?: number;
  error?: string;
}

export interface ImportProgress {
  step: string;
  progress: number; // 0-100
  message: string;
}
