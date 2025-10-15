
import { prisma } from '@/lib/database/prisma'

export interface Avatar3D {
  id: string
  name: string
  gender: 'male' | 'female' | 'neutral'
  age: 'young' | 'adult' | 'senior'
  ethnicity: string
  profession: string
  description: string
  thumbnailUrl: string
  modelUrl: string
  animationsUrl: string
  isPremium: boolean
  category: 'business' | 'industrial' | 'healthcare' | 'education' | 'general'
  emotions: string[]
  gestures: string[]
}

// Professional 3D Avatars for Brazilian corporate training
export const AVATAR_LIBRARY: Avatar3D[] = [
  {
    id: 'avatar-carlos-engineer',
    name: 'Carlos - Engenheiro',
    gender: 'male',
    age: 'adult',
    ethnicity: 'brasileiro',
    profession: 'Engenheiro de Segurança',
    description: 'Avatar masculino profissional, especializado em treinamentos de segurança industrial',
    thumbnailUrl: '/avatars/thumbnails/carlos-engineer.jpg',
    modelUrl: '/avatars/models/carlos-engineer.glb',
    animationsUrl: '/avatars/animations/carlos-engineer.json',
    isPremium: false,
    category: 'industrial',
    emotions: ['neutro', 'sério', 'preocupado', 'satisfeito'],
    gestures: ['apontar', 'explicar', 'alertar', 'cumprimentar']
  },
  {
    id: 'avatar-maria-supervisor',
    name: 'Maria - Supervisora',
    gender: 'female',
    age: 'adult',
    ethnicity: 'brasileira',
    profession: 'Supervisora de SST',
    description: 'Avatar feminino experiente em segurança do trabalho e treinamentos corporativos',
    thumbnailUrl: '/avatars/thumbnails/maria-supervisor.jpg',
    modelUrl: '/avatars/models/maria-supervisor.glb',
    animationsUrl: '/avatars/animations/maria-supervisor.json',
    isPremium: false,
    category: 'industrial',
    emotions: ['amigável', 'profissional', 'encorajador', 'atento'],
    gestures: ['explicar', 'demonstrar', 'aprovar', 'orientar']
  },
  {
    id: 'avatar-joao-doctor',
    name: 'João - Médico',
    gender: 'male',
    age: 'young',
    ethnicity: 'brasileiro',
    profession: 'Médico do Trabalho',
    description: 'Avatar jovem e dinâmico para treinamentos em saúde ocupacional',
    thumbnailUrl: '/avatars/thumbnails/joao-doctor.jpg',
    modelUrl: '/avatars/models/joao-doctor.glb',
    animationsUrl: '/avatars/animations/joao-doctor.json',
    isPremium: true,
    category: 'healthcare',
    emotions: ['confiante', 'cuidadoso', 'empático', 'educativo'],
    gestures: ['examinar', 'explicar', 'demonstrar', 'tranquilizar']
  },
  {
    id: 'avatar-ana-trainer',
    name: 'Ana - Instrutora',
    gender: 'female',
    age: 'young',
    ethnicity: 'brasileira',
    profession: 'Instrutora Corporativa',
    description: 'Avatar jovem e energética para treinamentos dinâmicos e interativos',
    thumbnailUrl: '/avatars/thumbnails/ana-trainer.jpg',
    modelUrl: '/avatars/models/ana-trainer.glb',
    animationsUrl: '/avatars/animations/ana-trainer.json',
    isPremium: true,
    category: 'education',
    emotions: ['energética', 'motivadora', 'positiva', 'inspiradora'],
    gestures: ['apresentar', 'animar', 'incentivar', 'celebrar']
  },
  {
    id: 'avatar-roberto-manager',
    name: 'Roberto - Gestor',
    gender: 'male',
    age: 'senior',
    ethnicity: 'brasileiro',
    profession: 'Gestor de RH',
    description: 'Avatar sênior e experiente para treinamentos de liderança e gestão',
    thumbnailUrl: '/avatars/thumbnails/roberto-manager.jpg',
    modelUrl: '/avatars/models/roberto-manager.glb',
    animationsUrl: '/avatars/animations/roberto-manager.json',
    isPremium: true,
    category: 'business',
    emotions: ['autoridade', 'sabedoria', 'paciência', 'liderança'],
    gestures: ['liderar', 'orientar', 'decidir', 'apoiar']
  },
  {
    id: 'avatar-lucia-specialist',
    name: 'Lúcia - Especialista',
    gender: 'female',
    age: 'senior',
    ethnicity: 'brasileira',
    profession: 'Especialista em Normas',
    description: 'Avatar sênior especializada em regulamentações e compliance',
    thumbnailUrl: '/avatars/thumbnails/lucia-specialist.jpg',
    modelUrl: '/avatars/models/lucia-specialist.glb',
    animationsUrl: '/avatars/animations/lucia-specialist.json',
    isPremium: true,
    category: 'business',
    emotions: ['conhecedora', 'detalhista', 'precisa', 'confiável'],
    gestures: ['analisar', 'explicar', 'documentar', 'validar']
  }
]

export interface AvatarAnimation {
  id: string
  name: string
  type: 'idle' | 'speaking' | 'gesture' | 'emotion'
  duration: number
  loopable: boolean
  description: string
}

export interface AvatarConfiguration {
  avatarId: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: number
  animations: AvatarAnimation[]
  lipSync: boolean
  eyeTracking: boolean
  blinkRate: number
  clothing?: string
  accessories?: string[]
}

class AvatarSystem {
  
  async getAllAvatars(): Promise<Avatar3D[]> {
    return AVATAR_LIBRARY
  }

  async getAvatarById(id: string): Promise<Avatar3D | null> {
    return AVATAR_LIBRARY.find(avatar => avatar.id === id) || null
  }

  async getAvatarsByCategory(category: string): Promise<Avatar3D[]> {
    return AVATAR_LIBRARY.filter(avatar => avatar.category === category)
  }

  async getAvatarsByFilter(filter: {
    gender?: 'male' | 'female' | 'neutral'
    age?: 'young' | 'adult' | 'senior'
    category?: string
    isPremium?: boolean
    profession?: string
  }): Promise<Avatar3D[]> {
    return AVATAR_LIBRARY.filter(avatar => {
      if (filter.gender && avatar.gender !== filter.gender) return false
      if (filter.age && avatar.age !== filter.age) return false
      if (filter.category && avatar.category !== filter.category) return false
      if (filter.isPremium !== undefined && avatar.isPremium !== filter.isPremium) return false
      if (filter.profession && !avatar.profession.toLowerCase().includes(filter.profession.toLowerCase())) return false
      return true
    })
  }

  async configureAvatarForProject(projectId: string, config: AvatarConfiguration): Promise<void> {
    try {
      // Save avatar configuration to project
      await prisma.project.update({
        where: { id: projectId },
        data: {
          settings: {
            ...await this.getProjectSettings(projectId),
            avatar: config
          }
        }
      })
    } catch (error) {
      console.error('Error configuring avatar:', error)
      throw new Error('Failed to configure avatar')
    }
  }

  private async getProjectSettings(projectId: string): Promise<any> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { settings: true }
    })
    return project?.settings || {}
  }

  async generateAvatarAnimation(avatarId: string, script: string): Promise<AvatarAnimation[]> {
    try {
      // In production, this would analyze the script and generate appropriate animations
      // For demo, return predefined animation sequence
      
      const sentences = script.split(/[.!?]+/).filter(s => s.trim())
      const animations: AvatarAnimation[] = []
      
      sentences.forEach((sentence, index) => {
        // Determine animation type based on content
        let animationType: AvatarAnimation['type'] = 'speaking'
        let gesture = 'explicar'
        
        if (sentence.toLowerCase().includes('atenção') || sentence.toLowerCase().includes('cuidado')) {
          gesture = 'alertar'
        } else if (sentence.toLowerCase().includes('exemplo') || sentence.toLowerCase().includes('veja')) {
          gesture = 'demonstrar'
        } else if (sentence.toLowerCase().includes('importante')) {
          gesture = 'enfatizar'
        }
        
        animations.push({
          id: `anim_${index}`,
          name: `${gesture}_${index}`,
          type: animationType,
          duration: sentence.length * 0.1, // Rough estimate
          loopable: false,
          description: `Animation for: "${sentence.substring(0, 50)}..."`
        })
      })
      
      return animations
    } catch (error) {
      console.error('Error generating avatar animation:', error)
      return []
    }
  }

  async renderAvatarScene(config: AvatarConfiguration, script: string): Promise<string> {
    try {
      // In production, this would use a 3D rendering engine (Three.js, Babylon.js, etc.)
      // to render the avatar with the script and animations
      
      // For demo, simulate rendering process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Return mock rendered video URL
      return `/rendered-scenes/avatar_${config.avatarId}_${Date.now()}.mp4`
      
    } catch (error) {
      console.error('Error rendering avatar scene:', error)
      throw new Error('Failed to render avatar scene')
    }
  }

  async generateLipSync(audioUrl: string, avatarId: string): Promise<any> {
    try {
      // In production, would use AI-based lip sync technology
      // like Wav2Lip, SadTalker, or commercial solutions
      
      // For demo, return mock lip sync data
      return {
        avatarId,
        audioUrl,
        lipSyncData: {
          phonemes: [], // Would contain phoneme timing data
          visemes: [], // Visual mouth shapes
          duration: 30, // Audio duration
          fps: 30
        },
        generatedAt: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('Error generating lip sync:', error)
      return null
    }
  }

  async getAvatarCapabilities(avatarId: string): Promise<{
    emotions: string[]
    gestures: string[]
    languages: string[]
    accessories: string[]
    customization: string[]
  }> {
    const avatar = await this.getAvatarById(avatarId)
    
    if (!avatar) {
      throw new Error('Avatar not found')
    }
    
    return {
      emotions: avatar.emotions,
      gestures: avatar.gestures,
      languages: ['pt-BR', 'en-US'], // Most avatars support multiple languages
      accessories: ['glasses', 'helmet', 'uniform', 'badge'],
      customization: ['clothing', 'hair', 'skin_tone', 'height', 'build']
    }
  }

  async createCustomAvatar(userId: string, avatarData: {
    name: string
    gender: 'male' | 'female' | 'neutral'
    profession: string
    customizations: any
  }): Promise<string> {
    try {
      // In production, would use avatar creation APIs (Ready Player Me, etc.)
      
      // For demo, create a custom avatar record
      const customAvatar: Avatar3D = {
        id: `custom_${Date.now()}`,
        name: avatarData.name,
        gender: avatarData.gender,
        age: 'adult',
        ethnicity: 'personalizado',
        profession: avatarData.profession,
        description: `Avatar personalizado criado para ${userId}`,
        thumbnailUrl: `/avatars/custom/${userId}/thumbnail.jpg`,
        modelUrl: `/avatars/custom/${userId}/model.glb`,
        animationsUrl: `/avatars/custom/${userId}/animations.json`,
        isPremium: true,
        category: 'general',
        emotions: ['neutro', 'profissional', 'amigável'],
        gestures: ['explicar', 'apontar', 'cumprimentar']
      }
      
      // In production, would save to database and start avatar generation process
      return customAvatar.id
      
    } catch (error) {
      console.error('Error creating custom avatar:', error)
      throw new Error('Failed to create custom avatar')
    }
  }
}

export const avatarSystem = new AvatarSystem()
