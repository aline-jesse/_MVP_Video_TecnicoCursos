/**
 * 📝 Subtitle System Types
 * Type definitions for subtitle functionality
 */

/**
 * Subtitle format
 */
export enum SubtitleFormat {
  SRT = 'srt', // SubRip
  VTT = 'vtt', // WebVTT
  ASS = 'ass', // Advanced SubStation Alpha
}

/**
 * Subtitle entry/cue
 */
export interface SubtitleCue {
  /** Cue index/number */
  index: number
  
  /** Start time in seconds */
  startTime: number
  
  /** End time in seconds */
  endTime: number
  
  /** Subtitle text (can be multi-line) */
  text: string
  
  /** Optional speaker/character name */
  speaker?: string
  
  /** Optional styling (for ASS format) */
  style?: SubtitleStyle
}

/**
 * Subtitle style configuration
 */
export interface SubtitleStyle {
  /** Font name */
  fontName: string
  
  /** Font size */
  fontSize: number
  
  /** Primary color (hex) */
  primaryColor: string
  
  /** Secondary color (hex) */
  secondaryColor?: string
  
  /** Outline color (hex) */
  outlineColor?: string
  
  /** Back/shadow color (hex) */
  backColor?: string
  
  /** Bold */
  bold: boolean
  
  /** Italic */
  italic: boolean
  
  /** Underline */
  underline: boolean
  
  /** Alignment (1-9, numpad style) */
  alignment: number
  
  /** Margin left */
  marginL: number
  
  /** Margin right */
  marginR: number
  
  /** Margin vertical */
  marginV: number
  
  /** Outline width */
  outline: number
  
  /** Shadow depth */
  shadow: number
}

/**
 * Subtitle file
 */
export interface SubtitleFile {
  /** File format */
  format: SubtitleFormat
  
  /** Subtitle cues */
  cues: SubtitleCue[]
  
  /** Default style (for ASS) */
  defaultStyle?: SubtitleStyle
  
  /** Metadata */
  metadata?: {
    title?: string
    language?: string
    author?: string
  }
}

/**
 * Subtitle render options
 */
export interface SubtitleRenderOptions {
  /** Burn subtitles into video */
  burnIn: boolean
  
  /** Subtitle file path or content */
  subtitleSource: string | SubtitleFile
  
  /** Font settings (for burn-in) */
  font?: {
    family: string
    size: number
    color: string
    outlineColor: string
    outlineWidth: number
  }
  
  /** Position settings */
  position?: {
    alignment: 'bottom' | 'top' | 'center'
    marginV: number // Vertical margin from edge
  }
  
  /** Shadow/outline */
  shadow?: {
    enabled: boolean
    offsetX: number
    offsetY: number
    blur: number
  }
}

/**
 * Default subtitle style
 */
export const DEFAULT_SUBTITLE_STYLE: SubtitleStyle = {
  fontName: 'Arial',
  fontSize: 24,
  primaryColor: '#FFFFFF',
  secondaryColor: '#FFFFFF',
  outlineColor: '#000000',
  backColor: '#000000',
  bold: true,
  italic: false,
  underline: false,
  alignment: 2, // Bottom center
  marginL: 10,
  marginR: 10,
  marginV: 20,
  outline: 2,
  shadow: 2,
}

/**
 * Default subtitle render options
 */
export const DEFAULT_SUBTITLE_RENDER_OPTIONS: SubtitleRenderOptions = {
  burnIn: true,
  subtitleSource: '',
  font: {
    family: 'Arial',
    size: 24,
    color: '#FFFFFF',
    outlineColor: '#000000',
    outlineWidth: 2,
  },
  position: {
    alignment: 'bottom',
    marginV: 20,
  },
  shadow: {
    enabled: true,
    offsetX: 2,
    offsetY: 2,
    blur: 4,
  },
}

/**
 * Time utilities
 */
export class SubtitleTimeUtils {
  /**
   * Convert seconds to SRT timestamp (HH:MM:SS,mmm)
   */
  static secondsToSRT(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const millis = Math.floor((seconds % 1) * 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis
      .toString()
      .padStart(3, '0')}`
  }

  /**
   * Convert seconds to VTT timestamp (HH:MM:SS.mmm)
   */
  static secondsToVTT(seconds: number): string {
    return this.secondsToSRT(seconds).replace(',', '.')
  }

  /**
   * Convert SRT timestamp to seconds
   */
  static srtToSeconds(timestamp: string): number {
    const [time, millis] = timestamp.split(',')
    const [hours, minutes, seconds] = time.split(':').map(Number)
    return hours * 3600 + minutes * 60 + seconds + Number(millis) / 1000
  }

  /**
   * Convert VTT timestamp to seconds
   */
  static vttToSeconds(timestamp: string): number {
    const [time, millis] = timestamp.split('.')
    const [hours, minutes, seconds] = time.split(':').map(Number)
    return hours * 3600 + minutes * 60 + seconds + Number(millis) / 1000
  }
}

/**
 * Validate subtitle cue
 */
export function validateSubtitleCue(cue: SubtitleCue): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (cue.index < 0) {
    errors.push('Index must be non-negative')
  }

  if (cue.startTime < 0) {
    errors.push('Start time must be non-negative')
  }

  if (cue.endTime <= cue.startTime) {
    errors.push('End time must be greater than start time')
  }

  if (!cue.text || cue.text.trim() === '') {
    errors.push('Text content is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate subtitle file
 */
export function validateSubtitleFile(file: SubtitleFile): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!file.cues || file.cues.length === 0) {
    errors.push('Subtitle file must contain at least one cue')
  }

  // Validate each cue
  file.cues.forEach((cue, index) => {
    const validation = validateSubtitleCue(cue)
    if (!validation.valid) {
      errors.push(`Cue ${index + 1}: ${validation.errors.join(', ')}`)
    }
  })

  // Check for overlapping cues
  for (let i = 0; i < file.cues.length - 1; i++) {
    if (file.cues[i].endTime > file.cues[i + 1].startTime) {
      errors.push(`Cues ${i + 1} and ${i + 2} overlap`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
