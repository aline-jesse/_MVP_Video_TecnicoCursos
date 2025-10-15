
export interface VideoProject {
  id: string
  title: string
  description?: string
  status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'ERROR'
  videoUrl?: string
  thumbnailUrl?: string
  duration?: number
  script?: string
  avatar?: string
  voiceSettings?: any
  createdAt: Date
  updatedAt: Date
  slides?: VideoSlide[]
  generations?: VideoGeneration[]
}

export interface VideoSlide {
  id: string
  projectId: string
  order: number
  title?: string
  content: string
  imageUrl?: string
  duration: number
  voiceText?: string
}

export interface VideoGeneration {
  id: string
  projectId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'
  progress: number
  videoUrl?: string
  errorMessage?: string
  metadata?: any
  createdAt: Date
  completedAt?: Date
}

export interface Avatar {
  id: string
  name: string
  imageUrl: string
  voiceId?: string
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL'
  style: 'PROFESSIONAL' | 'CASUAL' | 'CARTOON' | 'REALISTIC'
  isActive: boolean
}

export interface Template {
  id: string
  name: string
  description: string
  category: 'SAFETY' | 'TRAINING' | 'PRESENTATION' | 'EDUCATIONAL' | 'MARKETING'
  thumbnailUrl: string
  config: any
  isActive: boolean
}

export interface GenerationRequest {
  projectId: string
  slides: VideoSlide[]
  avatar: string
  voiceSettings: {
    language: string
    speed: number
    pitch: number
  }
}

export interface StreamingResponse {
  status: 'processing' | 'completed' | 'error'
  message?: string
  data?: any
  progress?: number
}
