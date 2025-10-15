
// Serviço de Avatares Falantes
export interface Avatar {
  id: string
  name: string
  description: string
  thumbnail: string
  style: 'professional' | 'casual' | 'technical' | 'instructor'
  gender: 'male' | 'female' | 'neutral'
}

export interface AvatarVideoRequest {
  avatarId: string
  audioUrl: string
  text: string
  background?: string
  duration: number
}

export interface AvatarVideoResult {
  videoUrl: string
  thumbnail: string
  duration: number
  avatarId: string
  success: boolean
}

export class AvatarService {
  
  // Avatares disponíveis (3 pré-definidos conforme requisito)
  static readonly AVAILABLE_AVATARS: Avatar[] = [
    {
      id: 'instructor-male',
      name: 'Instrutor Carlos',
      description: 'Instrutor profissional masculino, ideal para treinamentos técnicos',
      thumbnail: '/avatars/instructor-male-thumb.jpg',
      style: 'instructor',
      gender: 'male'
    },
    {
      id: 'instructor-female', 
      name: 'Instrutora Ana',
      description: 'Instrutora profissional feminina, especialista em segurança do trabalho',
      thumbnail: '/avatars/instructor-female-thumb.jpg',
      style: 'professional',
      gender: 'female'
    },
    {
      id: 'mascot-friendly',
      name: 'Mascote SafeBot',
      description: 'Mascote amigável e didático, perfeito para engajar a audiência',
      thumbnail: '/avatars/mascot-friendly-thumb.jpg',
      style: 'casual',
      gender: 'neutral'
    }
  ]

  // Backgrounds disponíveis
  static readonly BACKGROUNDS = [
    { id: 'office', name: 'Escritório', thumbnail: '/backgrounds/office.jpg' },
    { id: 'industrial', name: 'Ambiente Industrial', thumbnail: '/backgrounds/industrial.jpg' },
    { id: 'training-room', name: 'Sala de Treinamento', thumbnail: '/backgrounds/training-room.jpg' },
    { id: 'neutral', name: 'Fundo Neutro', thumbnail: '/backgrounds/neutral.jpg' }
  ]

  // Obter avatar por ID
  static getAvatar(avatarId: string): Avatar | null {
    return this.AVAILABLE_AVATARS.find(avatar => avatar.id === avatarId) || null
  }

  // Obter todos os avatares
  static getAllAvatars(): Avatar[] {
    return this.AVAILABLE_AVATARS
  }

  // Gerar vídeo com avatar falante
  static async generateAvatarVideo(request: AvatarVideoRequest): Promise<AvatarVideoResult> {
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Tentar provedor primário (Hugging Face ou similar)
        const result = await this.tryHuggingFaceAPI(request)
        if (result.success) return result

        // Fallback para geração local/simulada
        if (attempt === maxRetries) {
          return await this.generateFallbackVideo(request)
        }
      } catch (error) {
        lastError = error as Error
        console.warn(`Avatar generation attempt ${attempt} failed:`, error)
        
        // Delay exponencial
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw new Error(`Avatar video generation failed after ${maxRetries} attempts. Last error: ${lastError?.message}`)
  }

  // Provedor primário: Hugging Face Talking Head API
  private static async tryHuggingFaceAPI(request: AvatarVideoRequest): Promise<AvatarVideoResult> {
    try {
      const response = await fetch('/api/avatars/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`Avatar API error: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        videoUrl: result.videoUrl,
        thumbnail: result.thumbnail,
        duration: request.duration,
        avatarId: request.avatarId,
        success: true
      }
    } catch (error) {
      console.warn('Hugging Face Avatar API failed:', error)
      throw error
    }
  }

  // Fallback: Vídeo simulado para MVP
  private static async generateFallbackVideo(request: AvatarVideoRequest): Promise<AvatarVideoResult> {
    return new Promise((resolve) => {
      console.log('Generating fallback avatar video for:', request.avatarId)
      
      // Simular processamento
      setTimeout(() => {
        const avatar = this.getAvatar(request.avatarId)
        
        resolve({
          videoUrl: `/api/avatars/fallback/${request.avatarId}/${Date.now()}.mp4`,
          thumbnail: avatar?.thumbnail || '/avatars/default-thumb.jpg',
          duration: request.duration,
          avatarId: request.avatarId,
          success: true
        })
      }, 2000 + Math.random() * 3000) // 2-5 segundos de processamento simulado
    })
  }

  // Validar configuração de avatar
  static validateAvatarRequest(request: AvatarVideoRequest): string[] {
    const errors: string[] = []

    if (!request.avatarId) {
      errors.push('Avatar ID é obrigatório')
    } else if (!this.getAvatar(request.avatarId)) {
      errors.push('Avatar ID inválido')
    }

    if (!request.audioUrl) {
      errors.push('URL do áudio é obrigatória')
    }

    if (!request.text || request.text.trim().length === 0) {
      errors.push('Texto é obrigatório')
    }

    if (request.duration <= 0) {
      errors.push('Duração deve ser maior que zero')
    }

    if (request.text && request.text.length > 2000) {
      errors.push('Texto muito longo (máximo 2000 caracteres)')
    }

    return errors
  }

  // Estimar tempo de processamento baseado na duração
  static estimateProcessingTime(duration: number): number {
    // Fórmula baseada na duração do vídeo
    // Processamento típico: 2-3x a duração do vídeo final
    const baseTime = duration * 2.5 // 2.5x a duração
    const overhead = 10000 // 10 segundos de overhead base
    
    return Math.ceil(baseTime + overhead)
  }

  // Otimizar parâmetros para performance
  static optimizeForPreview(request: AvatarVideoRequest): AvatarVideoRequest {
    return {
      ...request,
      // Para preview, usar configurações mais rápidas
      background: request.background || 'neutral',
      duration: Math.min(request.duration, 30000) // Máximo 30 segundos para preview
    }
  }

  // Otimizar para renderização final
  static optimizeForFinalRender(request: AvatarVideoRequest): AvatarVideoRequest {
    return {
      ...request,
      // Configurações de alta qualidade para render final
      background: request.background || 'office'
    }
  }

  // Gerar thumbnail baseado no avatar e background
  static generateThumbnail(avatarId: string, background?: string): string {
    const avatar = this.getAvatar(avatarId)
    if (!avatar) return '/avatars/default-thumb.jpg'

    // Combinar avatar com background se especificado
    if (background) {
      return `/api/thumbnails/generate?avatar=${avatarId}&background=${background}`
    }

    return avatar.thumbnail
  }
}
