/**
 * 🎨 Video Filters Types
 * Type definitions for video filters (safe for client-side)
 */

/**
 * Video filter types
 */
export enum VideoFilterType {
  BRIGHTNESS = 'brightness',
  CONTRAST = 'contrast',
  SATURATION = 'saturation',
  HUE = 'hue',
  BLUR = 'blur',
  SHARPEN = 'sharpen',
  SEPIA = 'sepia',
  GRAYSCALE = 'grayscale',
  VIGNETTE = 'vignette',
  FADE = 'fade',
  COLORIZE = 'colorize',
  NOISE = 'noise',
  DENOISE = 'denoise',
}

/**
 * Filter configuration
 */
export interface VideoFilterConfig {
  type: VideoFilterType
  value: number | string | any
  enabled: boolean
}

/**
 * Brightness/Contrast filter
 */
export interface BrightnessContrastFilter extends VideoFilterConfig {
  type: VideoFilterType.BRIGHTNESS | VideoFilterType.CONTRAST
  value: number // -1.0 to 1.0
}

/**
 * Saturation filter
 */
export interface SaturationFilter extends VideoFilterConfig {
  type: VideoFilterType.SATURATION
  value: number // 0.0 to 3.0
}

/**
 * Blur filter
 */
export interface BlurFilter extends VideoFilterConfig {
  type: VideoFilterType.BLUR
  value: number // 0 to 20 (radius)
}

/**
 * Vignette filter
 */
export interface VignetteFilter extends VideoFilterConfig {
  type: VideoFilterType.VIGNETTE
  value: {
    angle: number // 0-180
    intensity: number // 0-1
  }
}

/**
 * Fade filter
 */
export interface FadeFilter extends VideoFilterConfig {
  type: VideoFilterType.FADE
  value: {
    type: 'in' | 'out'
    startTime: number // seconds
    duration: number // seconds
  }
}

/**
 * Filter preset
 */
export interface FilterPreset {
  id: string
  name: string
  description: string
  filters: VideoFilterConfig[]
  thumbnail?: string
}

/**
 * Default filter values
 */
export const DEFAULT_FILTER_VALUES = {
  brightness: 0,
  contrast: 0,
  saturation: 1,
  hue: 0,
  blur: 0,
  sharpen: 0,
  vignetteAngle: 90,
  vignetteIntensity: 0.5,
}

/**
 * Built-in filter presets
 */
export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'none',
    name: 'Sem Filtro',
    description: 'Vídeo original sem efeitos',
    filters: [],
  },
  {
    id: 'vivid',
    name: 'Vívido',
    description: 'Cores mais intensas e saturadas',
    filters: [
      { type: VideoFilterType.SATURATION, value: 1.5, enabled: true },
      { type: VideoFilterType.CONTRAST, value: 0.1, enabled: true },
    ],
  },
  {
    id: 'cinematic',
    name: 'Cinemático',
    description: 'Look profissional de cinema',
    filters: [
      { type: VideoFilterType.CONTRAST, value: 0.15, enabled: true },
      { type: VideoFilterType.SATURATION, value: 0.9, enabled: true },
      { type: VideoFilterType.VIGNETTE, value: { angle: 90, intensity: 0.6 }, enabled: true },
    ],
  },
  {
    id: 'bw',
    name: 'Preto e Branco',
    description: 'Estilo clássico monocromático',
    filters: [
      { type: VideoFilterType.GRAYSCALE, value: 1, enabled: true },
      { type: VideoFilterType.CONTRAST, value: 0.2, enabled: true },
    ],
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Efeito retrô e nostálgico',
    filters: [
      { type: VideoFilterType.SEPIA, value: 0.7, enabled: true },
      { type: VideoFilterType.SATURATION, value: 0.8, enabled: true },
      { type: VideoFilterType.VIGNETTE, value: { angle: 90, intensity: 0.7 }, enabled: true },
    ],
  },
  {
    id: 'soft',
    name: 'Suave',
    description: 'Efeito suave e delicado',
    filters: [
      { type: VideoFilterType.BLUR, value: 1.5, enabled: true },
      { type: VideoFilterType.BRIGHTNESS, value: 0.1, enabled: true },
    ],
  },
  {
    id: 'sharp',
    name: 'Nítido',
    description: 'Realça detalhes e bordas',
    filters: [
      { type: VideoFilterType.SHARPEN, value: 1.5, enabled: true },
      { type: VideoFilterType.CONTRAST, value: 0.1, enabled: true },
    ],
  },
];
