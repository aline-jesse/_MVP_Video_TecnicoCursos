/**
 * 📄 PPTX Types - Definições TypeScript para processamento PPTX
 * FASE 1: PPTX Processing Real
 */

export interface PPTXMetadata {
  totalSlides: number
  title: string
  author: string
  created: string
  modified?: string
  fileSize: number
  dimensions: {
    width: number
    height: number
  }
  application: string
  version?: string
  theme?: string
  masterSlides?: number
}

export interface PPTXAssets {
  images: PPTXImage[]
  videos: PPTXVideo[]
  audio: PPTXAudio[]
  fonts: string[]
  themes: PPTXTheme[]
}

export interface PPTXImage {
  id: string
  filename: string
  originalName?: string
  path: string
  mimeType: string
  type?: string
  size: number
  dimensions: {
    width: number
    height: number
  }
  s3Url?: string
  s3Key?: string
  extractedAt: string
}

export interface PPTXVideo {
  id: string
  filename: string
  path: string
  mimeType: string
  size: number
  duration?: number
  s3Url?: string
  s3Key?: string
}

export interface PPTXAudio {
  id: string
  filename: string
  path: string
  mimeType: string
  size: number
  duration?: number
  s3Url?: string
  s3Key?: string
}

export interface PPTXTheme {
  name: string
  colorScheme: string[]
  fontScheme: {
    major: string
    minor: string
  }
}

export interface PPTXTimeline {
  totalDuration: number
  scenes: PPTXScene[]
  transitions: PPTXTransition[]
}

export interface PPTXScene {
  sceneId: string
  slideNumber: number
  startTime: number
  endTime: number
  duration: number
  transitions: string[]
  voiceover?: string
  backgroundMusic?: string
}

export interface PPTXTransition {
  type: string
  duration: number
  direction?: string
  easing?: string
}

export interface PPTXExtractionStats {
  textBlocks: number
  images: number
  shapes: number
  charts: number
  tables: number
  smartArt: number
  videos: number
  audio: number
  animations: number
  hyperlinks: number
}

export interface PPTXExtractionResult {
  success: boolean
  slides: PPTXSlideData[]
  metadata: PPTXMetadata
  assets: PPTXAssets
  timeline: PPTXTimeline
  extractionStats: PPTXExtractionStats
  thumbnailUrl?: string
  error?: string
  warnings?: string[]
  processingTime?: number
}

export interface PPTXSlideData {
  slideNumber: number
  title: string
  content: string
  notes: string
  layout: PPTXLayoutType
  backgroundType: 'solid' | 'gradient' | 'image' | 'video' | 'pattern'
  backgroundColor?: string
  backgroundImage?: PPTXImage
  backgroundVideo?: PPTXVideo
  images: PPTXImage[]
  shapes: PPTXShape[]
  textBoxes: PPTXTextBox[]
  charts: PPTXChart[]
  tables: PPTXTable[]
  smartArt: PPTXSmartArt[]
  animations: PPTXAnimation[]
  hyperlinks: PPTXHyperlink[]
  duration: number
  estimatedReadingTime: number
  wordCount: number
  characterCount: number
}

export type PPTXLayoutType = 
  | 'title'
  | 'content'
  | 'two-column'
  | 'comparison'
  | 'title-content'
  | 'content-caption'
  | 'picture-caption'
  | 'blank'
  | 'section-header'
  | 'title-only'
  | 'content-over-content'
  | 'four-objects'
  | 'vertical-title-text'
  | 'vertical-text'
  | 'title-vertical-text'
  | 'custom'

export interface PPTXShape {
  id: string
  type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star' | 'custom'
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  style: {
    fill?: string
    stroke?: string
    strokeWidth?: number
    opacity?: number
  }
  text?: string
  hyperlink?: string
}

export interface PPTXTextBox {
  id: string
  text: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  formatting: {
    fontFamily?: string
    fontSize?: number
    fontWeight?: string
    fontStyle?: string
    color?: string
    alignment?: 'left' | 'center' | 'right' | 'justify'
    lineHeight?: number
  }
  bulletPoints?: boolean
  listLevel?: number
}

export interface PPTXChart {
  id: string
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'column' | 'doughnut'
  title?: string
  data: any[]
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  style?: any
}

export interface PPTXTable {
  id: string
  rows: number
  columns: number
  data: string[][]
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  style?: {
    headerStyle?: any
    cellStyle?: any
    borderStyle?: any
  }
}

export interface PPTXSmartArt {
  id: string
  type: string
  title?: string
  items: string[]
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  style?: any
}

export interface PPTXAnimation {
  id: string
  type: 'entrance' | 'emphasis' | 'exit' | 'motion'
  effect: string
  target: string
  duration: number
  delay: number
  trigger: 'click' | 'with-previous' | 'after-previous'
}

export interface PPTXHyperlink {
  id: string
  text: string
  url: string
  type: 'external' | 'slide' | 'email' | 'file'
  target?: number // slide number for internal links
}

export interface PPTXProcessingOptions {
  extractImages: boolean
  extractVideos: boolean
  extractAudio: boolean
  generateThumbnails: boolean
  uploadToS3: boolean
  preserveAnimations: boolean
  extractNotes: boolean
  detectLayouts: boolean
  estimateDurations: boolean
  extractHyperlinks: boolean
  maxImageSize?: number
  imageQuality?: number
  thumbnailSize?: {
    width: number
    height: number
  }
}

export interface PPTXParsingError {
  type: 'warning' | 'error' | 'critical'
  message: string
  slideNumber?: number
  elementId?: string
  details?: any
}
