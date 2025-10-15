/**
 * 🏷️ Watermark System Types
 * Type definitions for video watermark functionality
 */

/**
 * Watermark type
 */
export enum WatermarkType {
  IMAGE = 'image',
  TEXT = 'text',
  LOGO = 'logo',
}

/**
 * Watermark position on video
 */
export enum WatermarkPosition {
  TOP_LEFT = 'top-left',
  TOP_CENTER = 'top-center',
  TOP_RIGHT = 'top-right',
  CENTER_LEFT = 'center-left',
  CENTER = 'center',
  CENTER_RIGHT = 'center-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_CENTER = 'bottom-center',
  BOTTOM_RIGHT = 'bottom-right',
  CUSTOM = 'custom',
}

/**
 * Watermark animation type
 */
export enum WatermarkAnimation {
  NONE = 'none',
  FADE_IN = 'fade-in',
  FADE_OUT = 'fade-out',
  SLIDE_IN = 'slide-in',
  ZOOM_IN = 'zoom-in',
  PULSE = 'pulse',
}

/**
 * Text watermark style
 */
export interface TextWatermarkStyle {
  /** Font family */
  fontFamily: string
  
  /** Font size in pixels */
  fontSize: number
  
  /** Font weight */
  fontWeight: 'normal' | 'bold' | 'light' | number
  
  /** Text color (hex or rgba) */
  color: string
  
  /** Text shadow */
  shadow?: {
    offsetX: number
    offsetY: number
    blur: number
    color: string
  }
  
  /** Stroke/outline */
  stroke?: {
    width: number
    color: string
  }
  
  /** Background box */
  background?: {
    color: string
    padding: number
    borderRadius?: number
  }
}

/**
 * Image watermark configuration
 */
export interface ImageWatermarkConfig {
  /** Watermark type */
  type: WatermarkType.IMAGE | WatermarkType.LOGO
  
  /** Image URL or path */
  imageUrl: string
  
  /** Image width in pixels (or 'auto') */
  width: number | 'auto'
  
  /** Image height in pixels (or 'auto') */
  height: number | 'auto'
  
  /** Maintain aspect ratio */
  maintainAspectRatio: boolean
  
  /** Position on video */
  position: WatermarkPosition
  
  /** Custom position (if position is CUSTOM) */
  customPosition?: {
    x: number // Pixels from left or percentage (0-100)
    y: number // Pixels from top or percentage (0-100)
    unit: 'px' | '%'
  }
  
  /** Opacity (0-1) */
  opacity: number
  
  /** Padding from edges in pixels */
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  
  /** Animation */
  animation?: {
    type: WatermarkAnimation
    duration: number // Seconds
    delay: number // Seconds
  }
}

/**
 * Text watermark configuration
 */
export interface TextWatermarkConfig {
  /** Watermark type */
  type: WatermarkType.TEXT
  
  /** Text content */
  text: string
  
  /** Text style */
  style: TextWatermarkStyle
  
  /** Position on video */
  position: WatermarkPosition
  
  /** Custom position (if position is CUSTOM) */
  customPosition?: {
    x: number
    y: number
    unit: 'px' | '%'
  }
  
  /** Opacity (0-1) */
  opacity: number
  
  /** Padding from edges in pixels */
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  
  /** Animation */
  animation?: {
    type: WatermarkAnimation
    duration: number
    delay: number
  }
}

/**
 * Generic watermark configuration
 */
export type WatermarkConfig = ImageWatermarkConfig | TextWatermarkConfig

/**
 * Watermark preset
 */
export interface WatermarkPreset {
  /** Preset ID */
  id: string
  
  /** Preset name */
  name: string
  
  /** Preset description */
  description: string
  
  /** Watermark configuration */
  config: WatermarkConfig
  
  /** Preview thumbnail */
  thumbnail?: string
  
  /** Is premium preset */
  premium?: boolean
}

/**
 * Watermark render result
 */
export interface WatermarkRenderResult {
  /** Success status */
  success: boolean
  
  /** Output video path with watermark */
  outputPath?: string
  
  /** Error message if failed */
  error?: string
  
  /** Processing time in ms */
  processingTime: number
  
  /** Applied watermark config */
  watermarkConfig: WatermarkConfig
}

/**
 * Default watermark presets
 */
export const DEFAULT_WATERMARK_PRESETS: WatermarkPreset[] = [
  {
    id: 'simple-logo-br',
    name: 'Logo Simples - Inferior Direito',
    description: 'Logo no canto inferior direito com opacidade média',
    config: {
      type: WatermarkType.LOGO,
      imageUrl: '',
      width: 150,
      height: 'auto',
      maintainAspectRatio: true,
      position: WatermarkPosition.BOTTOM_RIGHT,
      opacity: 0.7,
      padding: { top: 0, right: 20, bottom: 20, left: 0 },
    },
  },
  {
    id: 'simple-logo-bl',
    name: 'Logo Simples - Inferior Esquerdo',
    description: 'Logo no canto inferior esquerdo com opacidade média',
    config: {
      type: WatermarkType.LOGO,
      imageUrl: '',
      width: 150,
      height: 'auto',
      maintainAspectRatio: true,
      position: WatermarkPosition.BOTTOM_LEFT,
      opacity: 0.7,
      padding: { top: 0, right: 0, bottom: 20, left: 20 },
    },
  },
  {
    id: 'centered-watermark',
    name: 'Marca D\'água Centralizada',
    description: 'Watermark grande no centro com baixa opacidade',
    config: {
      type: WatermarkType.IMAGE,
      imageUrl: '',
      width: 400,
      height: 'auto',
      maintainAspectRatio: true,
      position: WatermarkPosition.CENTER,
      opacity: 0.3,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
  },
  {
    id: 'text-copyright',
    name: 'Copyright Texto',
    description: 'Texto de copyright no canto inferior direito',
    config: {
      type: WatermarkType.TEXT,
      text: '© 2024 - Todos os direitos reservados',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'normal',
        color: '#FFFFFF',
        shadow: {
          offsetX: 2,
          offsetY: 2,
          blur: 4,
          color: '#000000',
        },
      },
      position: WatermarkPosition.BOTTOM_RIGHT,
      opacity: 0.8,
      padding: { top: 0, right: 20, bottom: 20, left: 0 },
    },
  },
  {
    id: 'text-branded',
    name: 'Texto com Marca',
    description: 'Nome da empresa com estilo destacado',
    config: {
      type: WatermarkType.TEXT,
      text: 'Sua Empresa',
      style: {
        fontFamily: 'Arial Black',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        stroke: {
          width: 2,
          color: '#000000',
        },
        background: {
          color: 'rgba(0, 0, 0, 0.5)',
          padding: 10,
          borderRadius: 5,
        },
      },
      position: WatermarkPosition.TOP_RIGHT,
      opacity: 0.9,
      padding: { top: 20, right: 20, bottom: 0, left: 0 },
    },
  },
]

/**
 * Default text watermark style
 */
export const DEFAULT_TEXT_STYLE: TextWatermarkStyle = {
  fontFamily: 'Arial',
  fontSize: 24,
  fontWeight: 'bold',
  color: '#FFFFFF',
  shadow: {
    offsetX: 2,
    offsetY: 2,
    blur: 4,
    color: '#000000',
  },
}

/**
 * Default padding
 */
export const DEFAULT_PADDING = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
}

/**
 * Position coordinates helper
 */
export const POSITION_COORDINATES: Record<WatermarkPosition, { x: string; y: string }> = {
  [WatermarkPosition.TOP_LEFT]: { x: 'left', y: 'top' },
  [WatermarkPosition.TOP_CENTER]: { x: 'center', y: 'top' },
  [WatermarkPosition.TOP_RIGHT]: { x: 'right', y: 'top' },
  [WatermarkPosition.CENTER_LEFT]: { x: 'left', y: 'center' },
  [WatermarkPosition.CENTER]: { x: 'center', y: 'center' },
  [WatermarkPosition.CENTER_RIGHT]: { x: 'right', y: 'center' },
  [WatermarkPosition.BOTTOM_LEFT]: { x: 'left', y: 'bottom' },
  [WatermarkPosition.BOTTOM_CENTER]: { x: 'center', y: 'bottom' },
  [WatermarkPosition.BOTTOM_RIGHT]: { x: 'right', y: 'bottom' },
  [WatermarkPosition.CUSTOM]: { x: 'custom', y: 'custom' },
}

/**
 * Validate watermark configuration
 */
export function validateWatermarkConfig(config: WatermarkConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Common validations
  if (config.opacity < 0 || config.opacity > 1) {
    errors.push('Opacity must be between 0 and 1')
  }

  // Type-specific validations
  if (config.type === WatermarkType.IMAGE || config.type === WatermarkType.LOGO) {
    if (!config.imageUrl) {
      errors.push('Image URL is required for image watermarks')
    }
    
    if (config.width !== 'auto' && config.width <= 0) {
      errors.push('Width must be positive or "auto"')
    }
    
    if (config.height !== 'auto' && config.height <= 0) {
      errors.push('Height must be positive or "auto"')
    }
  }

  if (config.type === WatermarkType.TEXT) {
    if (!config.text || config.text.trim() === '') {
      errors.push('Text content is required for text watermarks')
    }
    
    if (config.style.fontSize <= 0) {
      errors.push('Font size must be positive')
    }
  }

  // Custom position validation
  if (config.position === WatermarkPosition.CUSTOM && !config.customPosition) {
    errors.push('Custom position coordinates required when position is CUSTOM')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
