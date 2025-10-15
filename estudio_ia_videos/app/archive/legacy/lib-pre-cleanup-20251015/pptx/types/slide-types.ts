/**
 * 📄 Slide Types - Definições específicas para slides
 * FASE 1: PPTX Processing Real
 */

export interface SlideElement {
  id: string
  type: SlideElementType
  position: ElementPosition
  style: ElementStyle
  content?: any
  animations?: SlideAnimation[]
  hyperlink?: string
}

export type SlideElementType = 
  | 'text'
  | 'image'
  | 'shape'
  | 'chart'
  | 'table'
  | 'video'
  | 'audio'
  | 'smartart'
  | 'placeholder'
  | 'group'

export interface ElementPosition {
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  zIndex?: number
}

export interface ElementStyle {
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  shadow?: ShadowStyle
  border?: BorderStyle
  effects?: VisualEffect[]
}

export interface ShadowStyle {
  color: string
  blur: number
  offsetX: number
  offsetY: number
  opacity: number
}

export interface BorderStyle {
  color: string
  width: number
  style: 'solid' | 'dashed' | 'dotted' | 'double'
}

export interface VisualEffect {
  type: 'glow' | 'reflection' | '3d' | 'bevel'
  properties: any
}

export interface SlideAnimation {
  id: string
  type: AnimationType
  effect: string
  target: string
  duration: number
  delay: number
  trigger: AnimationTrigger
  direction?: string
  speed?: 'slow' | 'medium' | 'fast'
  repeat?: number
  autoReverse?: boolean
}

export type AnimationType = 'entrance' | 'emphasis' | 'exit' | 'motion'
export type AnimationTrigger = 'click' | 'with-previous' | 'after-previous' | 'auto'

export interface SlideTransition {
  type: TransitionType
  duration: number
  direction?: string
  sound?: string
  advanceOnClick?: boolean
  advanceAfterTime?: number
}

export type TransitionType = 
  | 'none'
  | 'fade'
  | 'push'
  | 'wipe'
  | 'split'
  | 'reveal'
  | 'random'
  | 'dissolve'
  | 'checkerboard'
  | 'blinds'
  | 'clock'
  | 'ripple'
  | 'honeycomb'
  | 'glitter'
  | 'vortex'
  | 'shred'
  | 'switch'
  | 'flip'
  | 'gallery'
  | 'cube'
  | 'doors'
  | 'box'
  | 'orbit'
  | 'pan'
  | 'curtains'
  | 'window'
  | 'ferris'
  | 'conveyor'
  | 'rotate'
  | 'zoom'

export interface SlideBackground {
  type: 'solid' | 'gradient' | 'image' | 'video' | 'pattern' | 'texture'
  color?: string
  gradient?: GradientBackground
  image?: ImageBackground
  video?: VideoBackground
  pattern?: PatternBackground
}

export interface GradientBackground {
  type: 'linear' | 'radial' | 'rectangular' | 'path'
  colors: GradientStop[]
  angle?: number
  centerX?: number
  centerY?: number
}

export interface GradientStop {
  color: string
  position: number // 0-1
  opacity?: number
}

export interface ImageBackground {
  url: string
  s3Key?: string
  fit: 'fill' | 'stretch' | 'tile' | 'center'
  opacity?: number
  blur?: number
}

export interface VideoBackground {
  url: string
  s3Key?: string
  startTime?: number
  endTime?: number
  loop?: boolean
  muted?: boolean
  opacity?: number
}

export interface PatternBackground {
  type: string
  color: string
  backgroundColor: string
  scale?: number
  opacity?: number
}

export interface SlideNote {
  text: string
  formatting?: TextFormatting
  speakerNotes?: boolean
  privateNotes?: boolean
}

export interface TextFormatting {
  fontFamily?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder'
  fontStyle?: 'normal' | 'italic' | 'oblique'
  color?: string
  backgroundColor?: string
  alignment?: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: number
  letterSpacing?: number
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through'
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  verticalAlign?: 'baseline' | 'sub' | 'super' | 'top' | 'middle' | 'bottom'
}

export interface SlideLayout {
  name: string
  type: SlideLayoutType
  placeholders: LayoutPlaceholder[]
  masterSlideId?: string
  customProperties?: any
}

export type SlideLayoutType = 
  | 'title'
  | 'content'
  | 'section-header'
  | 'two-content'
  | 'comparison'
  | 'title-content'
  | 'content-caption'
  | 'picture-caption'
  | 'blank'
  | 'title-only'
  | 'four-objects'
  | 'vertical-title-text'
  | 'vertical-text'
  | 'title-vertical-text'
  | 'panoramic-picture-caption'
  | 'quote-name-title'
  | 'name-title'
  | 'title-subtitle'
  | 'custom'

export interface LayoutPlaceholder {
  id: string
  type: PlaceholderType
  position: ElementPosition
  defaultText?: string
  formatting?: TextFormatting
  required?: boolean
}

export type PlaceholderType = 
  | 'title'
  | 'subtitle'
  | 'content'
  | 'text'
  | 'object'
  | 'chart'
  | 'table'
  | 'media'
  | 'picture'
  | 'clip-art'
  | 'date'
  | 'footer'
  | 'header'
  | 'slide-number'
  | 'body'

export interface SlideTiming {
  duration: number // seconds
  estimatedReadingTime: number
  estimatedSpeakingTime: number
  pauseAfter?: number
  autoAdvance?: boolean
  clickToAdvance?: boolean
}

export interface SlideMetrics {
  wordCount: number
  characterCount: number
  elementCount: number
  imageCount: number
  animationCount: number
  hyperlinkCount: number
  complexity: 'low' | 'medium' | 'high'
  readabilityScore?: number
}

export interface SlideAccessibility {
  altText: string[]
  hasAltText: boolean
  colorContrast: 'good' | 'poor' | 'unknown'
  fontSize: 'adequate' | 'small' | 'large'
  readingOrder: number[]
  screenReaderFriendly: boolean
}

export interface SlideValidation {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
}

export interface ValidationError {
  type: string
  message: string
  elementId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface ValidationWarning {
  type: string
  message: string
  elementId?: string
  recommendation?: string
}

export interface ValidationSuggestion {
  type: string
  message: string
  elementId?: string
  action?: string
}