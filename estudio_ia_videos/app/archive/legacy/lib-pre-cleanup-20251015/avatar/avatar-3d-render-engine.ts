/**
 * 🎭 Avatar 3D Render Engine - Fase 1
 * Sistema avançado de renderização 3D com Three.js
 * Suporte Ready Player Me + Blend Shapes + Lip-Sync
 * Performance otimizada para renderização em tempo real
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { MonitoringService } from '../monitoring-service'
import { BlendShapeFrame, BlendShapeTarget, VisemeFrame } from '../audio/advanced-lipsync-processor'

// =====================================================
// INTERFACES E TIPOS
// =====================================================

export interface Avatar3DConfig {
  // Configurações do avatar
  avatar_id: string
  model_url?: string
  ready_player_me_url?: string
  
  // Configurações de renderização
  resolution: {
    width: number
    height: number
  }
  quality: 'draft' | 'standard' | 'high' | 'ultra'
  frame_rate: number // 24, 30, 60
  
  // Configurações de câmera
  camera: {
    position: { x: number, y: number, z: number }
    target: { x: number, y: number, z: number }
    fov: number // Field of view
    near: number
    far: number
  }
  
  // Configurações de iluminação
  lighting: {
    ambient_intensity: number
    directional_intensity: number
    directional_position: { x: number, y: number, z: number }
    shadows: boolean
    shadow_quality: 'low' | 'medium' | 'high'
  }
  
  // Configurações de animação
  animation: {
    enable_eye_tracking: boolean
    enable_head_movement: boolean
    enable_breathing: boolean
    enable_idle_animations: boolean
    lip_sync_intensity: number // 0.0 - 1.0
  }
  
  // Configurações de performance
  performance: {
    enable_lod: boolean // Level of Detail
    enable_frustum_culling: boolean
    enable_occlusion_culling: boolean
    max_bones: number
    texture_quality: 'low' | 'medium' | 'high'
  }
  
  // Configurações de background
  background: {
    type: 'color' | 'gradient' | 'image' | 'video' | 'environment'
    color?: string
    gradient?: { top: string, bottom: string }
    image_url?: string
    video_url?: string
    environment_url?: string // HDR environment map
  }
}

export interface Avatar3DResult {
  // Identificação
  job_id: string
  avatar_id: string
  
  // Resultados
  rendered_frames: RenderedFrame[]
  video_url?: string
  thumbnail_url?: string
  
  // Métricas
  total_frames: number
  rendering_time: number // ms
  average_frame_time: number // ms
  memory_usage: number // MB
  
  // Qualidade
  quality_score: number // 0.0 - 1.0
  lip_sync_accuracy: number // 0.0 - 1.0
  
  // Status
  success: boolean
  error_message?: string
}

export interface RenderedFrame {
  frame_number: number
  timestamp: number // segundos
  image_data?: ImageData
  image_url?: string
  blend_shape_values: Record<string, number>
  camera_transform: Transform3D
  render_time: number // ms
}

export interface Transform3D {
  position: { x: number, y: number, z: number }
  rotation: { x: number, y: number, z: number, w: number } // Quaternion
  scale: { x: number, y: number, z: number }
}

export interface AvatarModel {
  // Identificação
  id: string
  name: string
  type: 'ready_player_me' | 'custom' | 'vroid'
  
  // URLs
  model_url: string
  thumbnail_url: string
  
  // Características
  gender: 'male' | 'female' | 'neutral'
  age_range: 'child' | 'teen' | 'adult' | 'elderly'
  ethnicity: string
  style: 'realistic' | 'cartoon' | 'anime' | 'stylized'
  
  // Capacidades
  supports_blend_shapes: boolean
  supports_eye_tracking: boolean
  supports_full_body: boolean
  bone_count: number
  
  // Metadados
  file_size: number // bytes
  polygon_count: number
  texture_resolution: number
  created_at: Date
  updated_at: Date
}

export interface BlendShapeMapping {
  // Mapeamento de blend shapes padrão para específicos do modelo
  standard_name: BlendShapeTarget
  model_specific_name: string
  weight_multiplier: number // Ajuste de intensidade
  invert: boolean // Inverter valores
}

// =====================================================
// CONFIGURAÇÕES PADRÃO
// =====================================================

const DEFAULT_CONFIG: Required<Avatar3DConfig> = {
  avatar_id: 'default',
  model_url: '',
  ready_player_me_url: '',
  resolution: {
    width: 1920,
    height: 1080
  },
  quality: 'standard',
  frame_rate: 30,
  camera: {
    position: { x: 0, y: 1.6, z: 2 },
    target: { x: 0, y: 1.6, z: 0 },
    fov: 50,
    near: 0.1,
    far: 100
  },
  lighting: {
    ambient_intensity: 0.4,
    directional_intensity: 0.8,
    directional_position: { x: 5, y: 10, z: 5 },
    shadows: true,
    shadow_quality: 'medium'
  },
  animation: {
    enable_eye_tracking: true,
    enable_head_movement: true,
    enable_breathing: true,
    enable_idle_animations: true,
    lip_sync_intensity: 1.0
  },
  performance: {
    enable_lod: true,
    enable_frustum_culling: true,
    enable_occlusion_culling: false,
    max_bones: 100,
    texture_quality: 'medium'
  },
  background: {
    type: 'gradient',
    gradient: { top: '#87CEEB', bottom: '#E0F6FF' }
  }
}

// =====================================================
// AVATARES PRÉ-DEFINIDOS
// =====================================================

const PREDEFINED_AVATARS: AvatarModel[] = [
  {
    id: 'rpm_female_01',
    name: 'Ana - Professora',
    type: 'ready_player_me',
    model_url: 'https://models.readyplayer.me/64f8c5c8b4c5a8001f8b4567.glb',
    thumbnail_url: '/avatars/thumbnails/ana.jpg',
    gender: 'female',
    age_range: 'adult',
    ethnicity: 'brazilian',
    style: 'realistic',
    supports_blend_shapes: true,
    supports_eye_tracking: true,
    supports_full_body: true,
    bone_count: 65,
    file_size: 2.5 * 1024 * 1024, // 2.5MB
    polygon_count: 15000,
    texture_resolution: 1024,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'rpm_male_01',
    name: 'Carlos - Instrutor',
    type: 'ready_player_me',
    model_url: 'https://models.readyplayer.me/64f8c5c8b4c5a8001f8b4568.glb',
    thumbnail_url: '/avatars/thumbnails/carlos.jpg',
    gender: 'male',
    age_range: 'adult',
    ethnicity: 'brazilian',
    style: 'realistic',
    supports_blend_shapes: true,
    supports_eye_tracking: true,
    supports_full_body: true,
    bone_count: 65,
    file_size: 2.3 * 1024 * 1024,
    polygon_count: 14500,
    texture_resolution: 1024,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'custom_female_01',
    name: 'Maria - Apresentadora',
    type: 'custom',
    model_url: '/avatars/models/maria.glb',
    thumbnail_url: '/avatars/thumbnails/maria.jpg',
    gender: 'female',
    age_range: 'adult',
    ethnicity: 'brazilian',
    style: 'stylized',
    supports_blend_shapes: true,
    supports_eye_tracking: false,
    supports_full_body: false,
    bone_count: 45,
    file_size: 1.8 * 1024 * 1024,
    polygon_count: 12000,
    texture_resolution: 512,
    created_at: new Date(),
    updated_at: new Date()
  }
]

// =====================================================
// MAPEAMENTO DE BLEND SHAPES
// =====================================================

const READY_PLAYER_ME_BLEND_SHAPES: BlendShapeMapping[] = [
  // Boca
  { standard_name: BlendShapeTarget.JAW_OPEN, model_specific_name: 'jawOpen', weight_multiplier: 1.0, invert: false },
  { standard_name: BlendShapeTarget.MOUTH_SMILE_LEFT, model_specific_name: 'mouthSmileLeft', weight_multiplier: 1.0, invert: false },
  { standard_name: BlendShapeTarget.MOUTH_SMILE_RIGHT, model_specific_name: 'mouthSmileRight', weight_multiplier: 1.0, invert: false },
  { standard_name: BlendShapeTarget.MOUTH_FROWN_LEFT, model_specific_name: 'mouthFrownLeft', weight_multiplier: 1.0, invert: false },
  { standard_name: BlendShapeTarget.MOUTH_FROWN_RIGHT, model_specific_name: 'mouthFrownRight', weight_multiplier: 1.0, invert: false },
  { standard_name: BlendShapeTarget.MOUTH_PUCKER, model_specific_name: 'mouthPucker', weight_multiplier: 1.0, invert: false },
  { standard_name: BlendShapeTarget.MOUTH_STRETCH, model_specific_name: 'mouthStretch', weight_multiplier: 1.0, invert: false },
  
  // Lábios
  { standard_name: BlendShapeTarget.MOUTH_UPPER_UP_LEFT, model_specific_name: 'mouthUpperUpLeft', weight_multiplier: 1.0, invert: false },
  { standard_name: BlendShapeTarget.MOUTH_UPPER_UP_RIGHT, model_specific_name: 'mouthUpperUpRight', weight_multiplier: 1.0, invert: false },
  { standard_name: BlendShapeTarget.MOUTH_LOWER_DOWN_LEFT, model_specific_name: 'mouthLowerDownLeft', weight_multiplier: 1.0, invert: false },
  { standard_name: BlendShapeTarget.MOUTH_LOWER_DOWN_RIGHT, model_specific_name: 'mouthLowerDownRight', weight_multiplier: 1.0, invert: false },
  
  // Bochechas
  { standard_name: BlendShapeTarget.CHEEK_PUFF, model_specific_name: 'cheekPuff', weight_multiplier: 1.0, invert: false },
  { standard_name: BlendShapeTarget.CHEEK_SQUINT_LEFT, model_specific_name: 'cheekSquintLeft', weight_multiplier: 1.0, invert: false },
  { standard_name: BlendShapeTarget.CHEEK_SQUINT_RIGHT, model_specific_name: 'cheekSquintRight', weight_multiplier: 1.0, invert: false }
]

// =====================================================
// AVATAR 3D RENDER ENGINE
// =====================================================

export class Avatar3DRenderEngine {
  private static instance: Avatar3DRenderEngine
  private monitoring: MonitoringService
  
  // Three.js core
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private canvas: HTMLCanvasElement
  
  // Loaders
  private gltfLoader: GLTFLoader
  private dracoLoader: DRACOLoader
  
  // Avatar state
  private currentAvatar: THREE.Group | null = null
  private blendShapeMesh: THREE.SkinnedMesh | null = null
  private blendShapeMapping: Map<string, number> = new Map()
  
  // Animation
  private animationMixer: THREE.AnimationMixer | null = null
  private idleAction: THREE.AnimationAction | null = null
  private breathingAction: THREE.AnimationAction | null = null
  
  // Performance
  private frameCount = 0
  private lastFrameTime = 0
  private renderStats = {
    averageFrameTime: 0,
    minFrameTime: Infinity,
    maxFrameTime: 0,
    droppedFrames: 0
  }

  private constructor() {
    this.monitoring = MonitoringService.getInstance()
    this.initializeThreeJS()
    this.setupLoaders()
  }

  static getInstance(): Avatar3DRenderEngine {
    if (!Avatar3DRenderEngine.instance) {
      Avatar3DRenderEngine.instance = new Avatar3DRenderEngine()
    }
    return Avatar3DRenderEngine.instance
  }

  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================

  private initializeThreeJS(): void {
    // Criar canvas off-screen para renderização
    this.canvas = document.createElement('canvas')
    
    // Configurar renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    })
    
    this.renderer.setSize(1920, 1080)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    
    // Criar cena
    this.scene = new THREE.Scene()
    
    // Configurar câmera
    this.camera = new THREE.PerspectiveCamera(50, 16/9, 0.1, 100)
    this.camera.position.set(0, 1.6, 2)
    this.camera.lookAt(0, 1.6, 0)
    
    // Configurar iluminação padrão
    this.setupDefaultLighting()
  }

  private setupLoaders(): void {
    // Configurar DRACO loader para compressão
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath('/draco/')
    
    // Configurar GLTF loader
    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(this.dracoLoader)
  }

  private setupDefaultLighting(): void {
    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)
    
    // Luz direcional principal
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 50
    this.scene.add(directionalLight)
    
    // Luz de preenchimento
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-5, 5, 5)
    this.scene.add(fillLight)
  }

  // =====================================================
  // CARREGAMENTO DE AVATARES
  // =====================================================

  async loadAvatar(avatarId: string, config: Partial<Avatar3DConfig> = {}): Promise<void> {
    const startTime = Date.now()
    
    this.monitoring.log('info', 'avatar_load_start', `Carregando avatar ${avatarId}`, {
      avatarId,
      config
    })

    try {
      // Encontrar modelo do avatar
      const avatarModel = this.findAvatarModel(avatarId)
      if (!avatarModel) {
        throw new Error(`Avatar não encontrado: ${avatarId}`)
      }

      // Limpar avatar anterior
      if (this.currentAvatar) {
        this.scene.remove(this.currentAvatar)
        this.currentAvatar = null
        this.blendShapeMesh = null
        this.blendShapeMapping.clear()
      }

      // Carregar modelo GLTF
      const gltf = await this.loadGLTFModel(avatarModel.model_url)
      
      // Processar modelo carregado
      this.currentAvatar = gltf.scene
      this.scene.add(this.currentAvatar)
      
      // Configurar blend shapes
      await this.setupBlendShapes(gltf, avatarModel)
      
      // Configurar animações
      await this.setupAnimations(gltf, config)
      
      // Otimizar performance
      this.optimizeModel(this.currentAvatar, config)

      const loadTime = Date.now() - startTime
      
      this.monitoring.log('info', 'avatar_load_success', `Avatar carregado com sucesso`, {
        avatarId,
        loadTime,
        polygonCount: avatarModel.polygon_count,
        boneCount: avatarModel.bone_count
      })

    } catch (error) {
      const loadTime = Date.now() - startTime
      
      this.monitoring.log('error', 'avatar_load_error', `Erro ao carregar avatar: ${error}`, {
        avatarId,
        loadTime,
        error: error instanceof Error ? error.message : String(error)
      })

      throw error
    }
  }

  private findAvatarModel(avatarId: string): AvatarModel | null {
    return PREDEFINED_AVATARS.find(avatar => avatar.id === avatarId) || null
  }

  private async loadGLTFModel(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => resolve(gltf),
        (progress) => {
          // Log de progresso opcional
        },
        (error) => reject(error)
      )
    })
  }

  private async setupBlendShapes(gltf: any, avatarModel: AvatarModel): Promise<void> {
    // Encontrar mesh com blend shapes
    gltf.scene.traverse((child: any) => {
      if (child.isMesh && child.morphTargetDictionary) {
        this.blendShapeMesh = child
        
        // Mapear blend shapes
        const morphTargets = child.morphTargetDictionary
        for (const [name, index] of Object.entries(morphTargets)) {
          this.blendShapeMapping.set(name, index as number)
        }
        
        this.monitoring.log('info', 'blend_shapes_found', `Blend shapes encontrados`, {
          avatarId: avatarModel.id,
          blendShapeCount: Object.keys(morphTargets).length,
          blendShapeNames: Object.keys(morphTargets)
        })
      }
    })
  }

  private async setupAnimations(gltf: any, config: Partial<Avatar3DConfig>): Promise<void> {
    if (gltf.animations && gltf.animations.length > 0) {
      this.animationMixer = new THREE.AnimationMixer(gltf.scene)
      
      // Configurar animações idle
      const idleAnimation = gltf.animations.find((anim: any) => 
        anim.name.toLowerCase().includes('idle')
      )
      
      if (idleAnimation) {
        this.idleAction = this.animationMixer.clipAction(idleAnimation)
        this.idleAction.loop = THREE.LoopRepeat
        this.idleAction.play()
      }
      
      // Configurar animação de respiração
      const breathingAnimation = gltf.animations.find((anim: any) => 
        anim.name.toLowerCase().includes('breathing')
      )
      
      if (breathingAnimation) {
        this.breathingAction = this.animationMixer.clipAction(breathingAnimation)
        this.breathingAction.loop = THREE.LoopRepeat
        this.breathingAction.weight = 0.3
        this.breathingAction.play()
      }
    }
  }

  private optimizeModel(model: THREE.Group, config: Partial<Avatar3DConfig>): void {
    const finalConfig = { ...DEFAULT_CONFIG, ...config }
    
    model.traverse((child: any) => {
      if (child.isMesh) {
        // Configurar shadows
        child.castShadow = finalConfig.lighting.shadows
        child.receiveShadow = finalConfig.lighting.shadows
        
        // Otimizar materiais
        if (child.material) {
          this.optimizeMaterial(child.material, finalConfig)
        }
        
        // Configurar frustum culling
        child.frustumCulled = finalConfig.performance.enable_frustum_culling
      }
    })
  }

  private optimizeMaterial(material: any, config: Required<Avatar3DConfig>): void {
    // Ajustar qualidade de textura
    if (material.map) {
      this.optimizeTexture(material.map, config.performance.texture_quality)
    }
    
    if (material.normalMap) {
      this.optimizeTexture(material.normalMap, config.performance.texture_quality)
    }
    
    if (material.roughnessMap) {
      this.optimizeTexture(material.roughnessMap, config.performance.texture_quality)
    }
  }

  private optimizeTexture(texture: THREE.Texture, quality: string): void {
    switch (quality) {
      case 'low':
        texture.generateMipmaps = false
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        break
      case 'medium':
        texture.generateMipmaps = true
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.magFilter = THREE.LinearFilter
        break
      case 'high':
        texture.generateMipmaps = true
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
        break
    }
  }

  // =====================================================
  // APLICAÇÃO DE BLEND SHAPES
  // =====================================================

  applyBlendShapes(blendShapeFrame: BlendShapeFrame): void {
    if (!this.blendShapeMesh || !this.blendShapeMesh.morphTargetInfluences) {
      return
    }

    // Aplicar blend shapes mapeados
    for (const mapping of READY_PLAYER_ME_BLEND_SHAPES) {
      const standardValue = blendShapeFrame.blend_shapes[mapping.standard_name] || 0
      const finalValue = mapping.invert ? 1 - standardValue : standardValue
      const weightedValue = finalValue * mapping.weight_multiplier
      
      const morphIndex = this.blendShapeMapping.get(mapping.model_specific_name)
      if (morphIndex !== undefined) {
        this.blendShapeMesh.morphTargetInfluences[morphIndex] = weightedValue
      }
    }

    // Aplicar jaw open diretamente se disponível
    const jawIndex = this.blendShapeMapping.get('jawOpen')
    if (jawIndex !== undefined) {
      this.blendShapeMesh.morphTargetInfluences[jawIndex] = blendShapeFrame.jaw_open
    }
  }

  applyVisemeFrame(visemeFrame: VisemeFrame): void {
    if (!this.blendShapeMesh) return

    // Converter visema para blend shapes básicos
    const blendShapeFrame: BlendShapeFrame = {
      timestamp: visemeFrame.timestamp,
      blend_shapes: this.visemeToBlendShapes(visemeFrame),
      jaw_open: this.calculateJawOpenFromViseme(visemeFrame),
      tongue_position: { x: 0, y: 0, z: 0 },
      lip_compression: 0
    }

    this.applyBlendShapes(blendShapeFrame)
  }

  private visemeToBlendShapes(viseme: VisemeFrame): Record<BlendShapeTarget, number> {
    // Implementação simplificada - converter visemas para blend shapes
    const blendShapes: Record<BlendShapeTarget, number> = {} as any
    
    // Inicializar todos com 0
    Object.values(BlendShapeTarget).forEach(target => {
      blendShapes[target] = 0
    })

    const intensity = viseme.intensity

    // Mapear visemas específicos
    switch (viseme.viseme) {
      case 'A':
        blendShapes[BlendShapeTarget.JAW_OPEN] = intensity * 0.8
        blendShapes[BlendShapeTarget.MOUTH_STRETCH] = intensity * 0.3
        break
      case 'E':
        blendShapes[BlendShapeTarget.JAW_OPEN] = intensity * 0.4
        blendShapes[BlendShapeTarget.MOUTH_STRETCH] = intensity * 0.6
        break
      case 'I':
        blendShapes[BlendShapeTarget.MOUTH_STRETCH] = intensity * 0.8
        break
      case 'O':
      case 'U':
        blendShapes[BlendShapeTarget.MOUTH_PUCKER] = intensity * 0.7
        break
      case 'M':
        blendShapes[BlendShapeTarget.MOUTH_ROLL_UPPER] = intensity * 0.8
        blendShapes[BlendShapeTarget.MOUTH_ROLL_LOWER] = intensity * 0.8
        break
    }

    return blendShapes
  }

  private calculateJawOpenFromViseme(viseme: VisemeFrame): number {
    const openVisemes = ['A', 'O', 'U']
    if (openVisemes.includes(viseme.viseme)) {
      return viseme.intensity * 0.8
    }
    return viseme.intensity * 0.2
  }

  // =====================================================
  // RENDERIZAÇÃO
  // =====================================================

  async renderFrame(timestamp: number, config: Partial<Avatar3DConfig> = {}): Promise<RenderedFrame> {
    const frameStartTime = performance.now()
    const finalConfig = { ...DEFAULT_CONFIG, ...config }

    try {
      // Atualizar animações
      if (this.animationMixer) {
        this.animationMixer.update(0.016) // ~60fps
      }

      // Configurar resolução
      this.renderer.setSize(finalConfig.resolution.width, finalConfig.resolution.height)
      this.camera.aspect = finalConfig.resolution.width / finalConfig.resolution.height
      this.camera.updateProjectionMatrix()

      // Renderizar frame
      this.renderer.render(this.scene, this.camera)

      // Capturar dados da imagem
      const imageData = this.captureFrameData()

      // Coletar blend shape values atuais
      const blendShapeValues = this.getCurrentBlendShapeValues()

      // Coletar transform da câmera
      const cameraTransform = this.getCameraTransform()

      const renderTime = performance.now() - frameStartTime

      // Atualizar estatísticas
      this.updateRenderStats(renderTime)

      return {
        frame_number: this.frameCount++,
        timestamp,
        image_data: imageData,
        blend_shape_values: blendShapeValues,
        camera_transform: cameraTransform,
        render_time: renderTime
      }

    } catch (error) {
      this.monitoring.log('error', 'render_frame_error', `Erro na renderização: ${error}`, {
        timestamp,
        frameNumber: this.frameCount,
        error: error instanceof Error ? error.message : String(error)
      })

      throw error
    }
  }

  private captureFrameData(): ImageData {
    const canvas = this.renderer.domElement
    const context = canvas.getContext('2d')
    
    if (context) {
      return context.getImageData(0, 0, canvas.width, canvas.height)
    }
    
    // Fallback: criar ImageData vazio
    return new ImageData(canvas.width, canvas.height)
  }

  private getCurrentBlendShapeValues(): Record<string, number> {
    const values: Record<string, number> = {}
    
    if (this.blendShapeMesh && this.blendShapeMesh.morphTargetInfluences) {
      this.blendShapeMapping.forEach((index, name) => {
        values[name] = this.blendShapeMesh!.morphTargetInfluences![index] || 0
      })
    }
    
    return values
  }

  private getCameraTransform(): Transform3D {
    return {
      position: {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z
      },
      rotation: {
        x: this.camera.quaternion.x,
        y: this.camera.quaternion.y,
        z: this.camera.quaternion.z,
        w: this.camera.quaternion.w
      },
      scale: { x: 1, y: 1, z: 1 }
    }
  }

  private updateRenderStats(renderTime: number): void {
    this.renderStats.averageFrameTime = 
      (this.renderStats.averageFrameTime * (this.frameCount - 1) + renderTime) / this.frameCount
    
    this.renderStats.minFrameTime = Math.min(this.renderStats.minFrameTime, renderTime)
    this.renderStats.maxFrameTime = Math.max(this.renderStats.maxFrameTime, renderTime)
    
    // Detectar frames perdidos (>33ms para 30fps)
    if (renderTime > 33) {
      this.renderStats.droppedFrames++
    }
  }

  // =====================================================
  // CONFIGURAÇÃO DE CENA
  // =====================================================

  updateCamera(cameraConfig: Avatar3DConfig['camera']): void {
    this.camera.position.set(
      cameraConfig.position.x,
      cameraConfig.position.y,
      cameraConfig.position.z
    )
    
    this.camera.lookAt(
      cameraConfig.target.x,
      cameraConfig.target.y,
      cameraConfig.target.z
    )
    
    this.camera.fov = cameraConfig.fov
    this.camera.near = cameraConfig.near
    this.camera.far = cameraConfig.far
    this.camera.updateProjectionMatrix()
  }

  updateLighting(lightingConfig: Avatar3DConfig['lighting']): void {
    // Limpar luzes existentes
    const lights = this.scene.children.filter(child => child.isLight)
    lights.forEach(light => this.scene.remove(light))
    
    // Recriar luzes com nova configuração
    const ambientLight = new THREE.AmbientLight(0xffffff, lightingConfig.ambient_intensity)
    this.scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, lightingConfig.directional_intensity)
    directionalLight.position.set(
      lightingConfig.directional_position.x,
      lightingConfig.directional_position.y,
      lightingConfig.directional_position.z
    )
    directionalLight.castShadow = lightingConfig.shadows
    this.scene.add(directionalLight)
  }

  updateBackground(backgroundConfig: Avatar3DConfig['background']): void {
    switch (backgroundConfig.type) {
      case 'color':
        this.scene.background = new THREE.Color(backgroundConfig.color || '#ffffff')
        break
        
      case 'gradient':
        if (backgroundConfig.gradient) {
          // Criar gradiente usando shader material
          const gradientGeometry = new THREE.PlaneGeometry(2, 2)
          const gradientMaterial = new THREE.ShaderMaterial({
            uniforms: {
              topColor: { value: new THREE.Color(backgroundConfig.gradient.top) },
              bottomColor: { value: new THREE.Color(backgroundConfig.gradient.bottom) }
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform vec3 topColor;
              uniform vec3 bottomColor;
              varying vec2 vUv;
              void main() {
                gl_FragColor = vec4(mix(bottomColor, topColor, vUv.y), 1.0);
              }
            `,
            depthTest: false,
            depthWrite: false
          })
          
          const gradientMesh = new THREE.Mesh(gradientGeometry, gradientMaterial)
          gradientMesh.renderOrder = -1
          this.scene.add(gradientMesh)
        }
        break
        
      case 'image':
        if (backgroundConfig.image_url) {
          const loader = new THREE.TextureLoader()
          loader.load(backgroundConfig.image_url, (texture) => {
            this.scene.background = texture
          })
        }
        break
    }
  }

  // =====================================================
  // MÉTODOS PÚBLICOS DE CONSULTA
  // =====================================================

  getAvailableAvatars(): AvatarModel[] {
    return PREDEFINED_AVATARS
  }

  getCurrentAvatar(): AvatarModel | null {
    if (!this.currentAvatar) return null
    
    // Encontrar modelo atual baseado no avatar carregado
    return PREDEFINED_AVATARS[0] // Placeholder
  }

  getRenderStats(): typeof this.renderStats {
    return { ...this.renderStats }
  }

  getBlendShapeNames(): string[] {
    return Array.from(this.blendShapeMapping.keys())
  }

  getDefaultConfig(): Required<Avatar3DConfig> {
    return DEFAULT_CONFIG
  }

  // =====================================================
  // LIMPEZA
  // =====================================================

  dispose(): void {
    // Limpar recursos Three.js
    if (this.currentAvatar) {
      this.scene.remove(this.currentAvatar)
    }
    
    this.renderer.dispose()
    this.dracoLoader.dispose()
    
    // Limpar referências
    this.currentAvatar = null
    this.blendShapeMesh = null
    this.animationMixer = null
    this.blendShapeMapping.clear()
  }
}

export default Avatar3DRenderEngine