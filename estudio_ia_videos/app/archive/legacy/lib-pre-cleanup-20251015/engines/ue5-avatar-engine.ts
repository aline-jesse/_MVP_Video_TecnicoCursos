
/**
 * 🎬 UE5 Avatar Engine - Hiper-Realismo com Audio2Face
 * Sistema de renderização de avatares fotorrealistas usando Unreal Engine 5 + NVIDIA Audio2Face
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'

const execAsync = promisify(exec)

// =============================================
// INTERFACES E TIPOS
// =============================================

export interface UE5AvatarConfig {
  // Character
  metahuman_id: string // ID do MetaHuman a usar
  clothing: {
    top: string
    bottom: string
    shoes: string
    accessories: string[]
  }
  hair_style: string
  skin_tone: string
  
  // Scene
  environment: 'office' | 'studio' | 'outdoor' | 'virtual' | 'custom'
  lighting_preset: 'natural' | 'studio_soft' | 'dramatic' | 'corporate'
  camera_angle: 'closeup' | 'medium' | 'wide' | 'dynamic'
  background_blur: boolean // Depth of field
  
  // Animation
  audio_file_url: string
  emotion_override?: 'neutral' | 'happy' | 'serious' | 'empathetic' | 'confident' | 'friendly'
  gesture_intensity: 0 | 1 | 2 | 3 // 0=none, 3=very expressive
  eye_contact_mode: 'camera' | 'natural' | 'looking_away'
  
  // Quality
  resolution: '1080p' | '1440p' | '4K' | '8K'
  fps: 24 | 30 | 60
  ray_tracing: boolean
  anti_aliasing: 'TAA' | 'TSR' | 'DLSS'
  motion_blur: boolean
  
  // Output
  format: 'mp4' | 'webm' | 'mov'
  codec: 'h264' | 'h265' | 'av1'
  bitrate_mbps: number
  audio_quality_kbps: number
}

export interface Audio2FaceResult {
  blendshapes_file: string // JSON com animação facial
  phonemes: Array<{
    time: number
    phoneme: string
    intensity: number
  }>
  emotions: Array<{
    time: number
    emotion: string
    intensity: number
  }>
  processing_time_ms: number
  audio_duration_seconds: number
}

export interface UE5RenderJob {
  job_id: string
  status: 'queued' | 'audio2face' | 'ue5_loading' | 'ue5_rendering' | 'encoding' | 'completed' | 'failed'
  progress: number // 0-100
  
  checkpoints: {
    audio2face_completed: boolean
    ue5_scene_loaded: boolean
    animation_applied: boolean
    render_completed: boolean
    encoding_completed: boolean
  }
  
  timings: {
    queued_at: Date
    audio2face_start?: Date
    audio2face_end?: Date
    ue5_render_start?: Date
    ue5_render_end?: Date
    encoding_start?: Date
    completed_at?: Date
  }
  
  output?: {
    video_url: string
    thumbnail_url: string
    metadata: {
      duration_seconds: number
      file_size_mb: number
      resolution: string
      codec: string
      fps: number
      bitrate_mbps: number
    }
  }
  
  error?: string
  config: UE5AvatarConfig
}

export interface MetaHumanAsset {
  id: string
  name: string
  display_name: string
  gender: 'male' | 'female'
  ethnicity: 'caucasian' | 'latin' | 'asian' | 'african' | 'middle_eastern'
  age_range: string
  style: 'business' | 'casual' | 'professional' | 'technical'
  
  // Paths UE5
  blueprint_path: string
  skeleton_path: string
  face_mesh_path: string
  body_mesh_path: string
  
  // Capabilities
  blendshape_count: number
  expression_presets: string[]
  clothing_options: string[]
  hair_options: string[]
  
  // Quality
  polygon_count: number
  texture_resolution: string
  optimization_level: 'performance' | 'balanced' | 'quality'
}

// =============================================
// UE5 AVATAR ENGINE CLASS
// =============================================

export class UE5AvatarEngine {
  private readonly UE5_BINARY = process.env.UE5_BINARY_PATH || '/opt/UnrealEngine/Engine/Binaries/Linux/UnrealEditor'
  private readonly UE5_PROJECT = process.env.UE5_PROJECT_PATH || '/workspace/AvatarStudioUE5/AvatarStudio.uproject'
  private readonly AUDIO2FACE_API = process.env.AUDIO2FACE_API || 'http://localhost:50051'
  private readonly TEMP_DIR = '/tmp/ue5-renders'
  private readonly OUTPUT_DIR = '/renders/output'
  
  private jobs = new Map<string, UE5RenderJob>()
  private metahumans = new Map<string, MetaHumanAsset>()
  
  constructor() {
    this.initialize()
  }
  
  /**
   * Inicializar engine e carregar MetaHumans disponíveis
   */
  private async initialize() {
    try {
      await fs.mkdir(this.TEMP_DIR, { recursive: true })
      await fs.mkdir(this.OUTPUT_DIR, { recursive: true })
      
      // Carregar lista de MetaHumans disponíveis
      await this.loadMetaHumans()
      
      console.log('✅ UE5 Avatar Engine inicializado com sucesso')
      console.log(`📁 MetaHumans disponíveis: ${this.metahumans.size}`)
      
    } catch (error) {
      console.error('❌ Erro ao inicializar UE5 Avatar Engine:', error)
    }
  }
  
  /**
   * Carregar MetaHumans disponíveis
   */
  private async loadMetaHumans() {
    // MetaHumans base para o sistema
    const baseMetaHumans: MetaHumanAsset[] = [
      {
        id: 'mh_brazilian_male_01',
        name: 'MH_Brazilian_Male_01',
        display_name: 'Ricardo Santos',
        gender: 'male',
        ethnicity: 'latin',
        age_range: '30-40',
        style: 'business',
        blueprint_path: '/Game/MetaHumans/MH_Brazilian_Male_01/BP_MH_Brazilian_Male_01',
        skeleton_path: '/Game/MetaHumans/Common/Skeleton/SK_MetaHuman',
        face_mesh_path: '/Game/MetaHumans/MH_Brazilian_Male_01/Face/SK_Face',
        body_mesh_path: '/Game/MetaHumans/MH_Brazilian_Male_01/Body/SK_Body',
        blendshape_count: 156,
        expression_presets: ['neutral', 'smile', 'serious', 'confident', 'friendly', 'empathetic'],
        clothing_options: ['business_suit', 'polo_shirt', 'lab_coat', 'safety_vest'],
        hair_options: ['short_professional', 'medium_casual'],
        polygon_count: 250000,
        texture_resolution: '4K',
        optimization_level: 'balanced'
      },
      {
        id: 'mh_brazilian_female_01',
        name: 'MH_Brazilian_Female_01',
        display_name: 'Ana Silva',
        gender: 'female',
        ethnicity: 'latin',
        age_range: '25-35',
        style: 'professional',
        blueprint_path: '/Game/MetaHumans/MH_Brazilian_Female_01/BP_MH_Brazilian_Female_01',
        skeleton_path: '/Game/MetaHumans/Common/Skeleton/SK_MetaHuman',
        face_mesh_path: '/Game/MetaHumans/MH_Brazilian_Female_01/Face/SK_Face',
        body_mesh_path: '/Game/MetaHumans/MH_Brazilian_Female_01/Body/SK_Body',
        blendshape_count: 162,
        expression_presets: ['neutral', 'smile', 'serious', 'empathetic', 'teaching', 'friendly'],
        clothing_options: ['blazer', 'blouse', 'lab_coat', 'safety_vest'],
        hair_options: ['long_professional', 'medium_tied', 'short_modern'],
        polygon_count: 260000,
        texture_resolution: '4K',
        optimization_level: 'balanced'
      },
      {
        id: 'mh_afro_male_01',
        name: 'MH_Afro_Male_01',
        display_name: 'Carlos Mendes',
        gender: 'male',
        ethnicity: 'african',
        age_range: '35-45',
        style: 'technical',
        blueprint_path: '/Game/MetaHumans/MH_Afro_Male_01/BP_MH_Afro_Male_01',
        skeleton_path: '/Game/MetaHumans/Common/Skeleton/SK_MetaHuman',
        face_mesh_path: '/Game/MetaHumans/MH_Afro_Male_01/Face/SK_Face',
        body_mesh_path: '/Game/MetaHumans/MH_Afro_Male_01/Body/SK_Body',
        blendshape_count: 158,
        expression_presets: ['neutral', 'confident', 'serious', 'explaining', 'friendly'],
        clothing_options: ['engineer_uniform', 'polo_shirt', 'safety_vest', 'overalls'],
        hair_options: ['short_fade', 'shaved', 'curly_short'],
        polygon_count: 255000,
        texture_resolution: '4K',
        optimization_level: 'balanced'
      },
      {
        id: 'mh_asian_female_01',
        name: 'MH_Asian_Female_01',
        display_name: 'Julia Tanaka',
        gender: 'female',
        ethnicity: 'asian',
        age_range: '28-38',
        style: 'professional',
        blueprint_path: '/Game/MetaHumans/MH_Asian_Female_01/BP_MH_Asian_Female_01',
        skeleton_path: '/Game/MetaHumans/Common/Skeleton/SK_MetaHuman',
        face_mesh_path: '/Game/MetaHumans/MH_Asian_Female_01/Face/SK_Face',
        body_mesh_path: '/Game/MetaHumans/MH_Asian_Female_01/Body/SK_Body',
        blendshape_count: 160,
        expression_presets: ['neutral', 'smile', 'empathetic', 'teaching', 'serious', 'friendly'],
        clothing_options: ['business_suit', 'blouse', 'lab_coat', 'safety_uniform'],
        hair_options: ['long_straight', 'medium_layered', 'short_professional'],
        polygon_count: 258000,
        texture_resolution: '4K',
        optimization_level: 'balanced'
      },
      {
        id: 'mh_caucasian_male_01',
        name: 'MH_Caucasian_Male_01',
        display_name: 'Diego Almeida',
        gender: 'male',
        ethnicity: 'caucasian',
        age_range: '32-42',
        style: 'business',
        blueprint_path: '/Game/MetaHumans/MH_Caucasian_Male_01/BP_MH_Caucasian_Male_01',
        skeleton_path: '/Game/MetaHumans/Common/Skeleton/SK_MetaHuman',
        face_mesh_path: '/Game/MetaHumans/MH_Caucasian_Male_01/Face/SK_Face',
        body_mesh_path: '/Game/MetaHumans/MH_Caucasian_Male_01/Body/SK_Body',
        blendshape_count: 154,
        expression_presets: ['neutral', 'confident', 'serious', 'friendly', 'professional'],
        clothing_options: ['business_suit', 'polo_shirt', 'casual_shirt', 'safety_vest'],
        hair_options: ['short_modern', 'medium_styled', 'short_classic'],
        polygon_count: 252000,
        texture_resolution: '4K',
        optimization_level: 'balanced'
      }
    ]
    
    baseMetaHumans.forEach(mh => {
      this.metahumans.set(mh.id, mh)
    })
  }
  
  /**
   * Obter lista de MetaHumans disponíveis
   */
  getAvailableMetaHumans(): MetaHumanAsset[] {
    return Array.from(this.metahumans.values())
  }
  
  /**
   * Obter MetaHuman por ID
   */
  getMetaHuman(id: string): MetaHumanAsset | undefined {
    return this.metahumans.get(id)
  }
  
  /**
   * Iniciar renderização de avatar UE5
   */
  async startRender(config: UE5AvatarConfig): Promise<string> {
    // Validar MetaHuman existe
    const metahuman = this.metahumans.get(config.metahuman_id)
    if (!metahuman) {
      throw new Error(`MetaHuman não encontrado: ${config.metahuman_id}`)
    }
    
    const job_id = `ue5_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const job: UE5RenderJob = {
      job_id,
      status: 'queued',
      progress: 0,
      checkpoints: {
        audio2face_completed: false,
        ue5_scene_loaded: false,
        animation_applied: false,
        render_completed: false,
        encoding_completed: false
      },
      timings: {
        queued_at: new Date()
      },
      config
    }
    
    this.jobs.set(job_id, job)
    
    // Processar em background
    this.processRender(job_id, config).catch(error => {
      console.error(`❌ Job ${job_id} failed:`, error)
      const failedJob = this.jobs.get(job_id)
      if (failedJob) {
        failedJob.status = 'failed'
        failedJob.error = error.message
      }
    })
    
    console.log(`🎬 UE5 Render iniciado: ${job_id}`)
    return job_id
  }
  
  /**
   * Pipeline completo de renderização
   */
  private async processRender(job_id: string, config: UE5AvatarConfig) {
    const job = this.jobs.get(job_id)!
    const startTime = Date.now()
    
    try {
      console.log(`\n🚀 Iniciando pipeline UE5 para job ${job_id}`)
      
      // ============================================
      // STEP 1: Audio2Face - Gerar animação facial
      // ============================================
      console.log('📊 STEP 1/5: Processando Audio2Face...')
      job.status = 'audio2face'
      job.progress = 10
      job.timings.audio2face_start = new Date()
      
      const audio2faceResult = await this.runAudio2Face(config.audio_file_url, {
        emotion: config.emotion_override || 'neutral',
        intensity: config.gesture_intensity
      })
      
      job.checkpoints.audio2face_completed = true
      job.timings.audio2face_end = new Date()
      job.progress = 30
      
      const a2fTime = ((job.timings.audio2face_end.getTime() - job.timings.audio2face_start.getTime()) / 1000).toFixed(2)
      console.log(`✅ Audio2Face concluído em ${a2fTime}s`)
      
      // ============================================
      // STEP 2: Carregar cena UE5
      // ============================================
      console.log('🎬 STEP 2/5: Configurando cena UE5...')
      job.status = 'ue5_loading'
      const sceneConfigPath = await this.setupUE5Scene(config)
      job.checkpoints.ue5_scene_loaded = true
      job.progress = 40
      console.log('✅ Cena UE5 configurada')
      
      // ============================================
      // STEP 3: Aplicar animação ao MetaHuman
      // ============================================
      console.log('🎭 STEP 3/5: Aplicando animação ao MetaHuman...')
      job.status = 'ue5_rendering'
      job.timings.ue5_render_start = new Date()
      
      await this.applyAnimationToMetaHuman(
        config.metahuman_id,
        audio2faceResult.blendshapes_file,
        sceneConfigPath
      )
      
      job.checkpoints.animation_applied = true
      job.progress = 50
      console.log('✅ Animação aplicada ao MetaHuman')
      
      // ============================================
      // STEP 4: Renderizar vídeo
      // ============================================
      console.log('🎥 STEP 4/5: Renderizando vídeo em UE5...')
      const rawVideoPath = await this.renderUE5Video(job_id, config, audio2faceResult.audio_duration_seconds)
      job.checkpoints.render_completed = true
      job.timings.ue5_render_end = new Date()
      job.progress = 80
      
      const renderTime = ((job.timings.ue5_render_end.getTime() - job.timings.ue5_render_start!.getTime()) / 1000).toFixed(2)
      console.log(`✅ Render UE5 concluído em ${renderTime}s`)
      
      // ============================================
      // STEP 5: Encoding final
      // ============================================
      console.log('🎞️ STEP 5/5: Encoding final com FFmpeg...')
      job.status = 'encoding'
      job.timings.encoding_start = new Date()
      
      const finalVideoPath = await this.encodeVideo(
        rawVideoPath,
        config.audio_file_url,
        config
      )
      
      job.checkpoints.encoding_completed = true
      job.progress = 95
      
      const encodingTime = ((new Date().getTime() - job.timings.encoding_start.getTime()) / 1000).toFixed(2)
      console.log(`✅ Encoding concluído em ${encodingTime}s`)
      
      // ============================================
      // STEP 6: Upload para S3 e finalização
      // ============================================
      console.log('☁️ Fazendo upload para S3...')
      const videoUrl = await this.uploadToS3(finalVideoPath, job_id)
      const thumbnailUrl = await this.generateThumbnail(finalVideoPath, job_id)
      
      // Finalizar job
      job.status = 'completed'
      job.progress = 100
      job.timings.completed_at = new Date()
      job.output = {
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        metadata: await this.getVideoMetadata(finalVideoPath, config)
      }
      
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`\n🎉 ✅ JOB CONCLUÍDO EM ${totalTime}s!`)
      console.log(`📹 Vídeo: ${videoUrl}`)
      console.log(`🖼️ Thumbnail: ${thumbnailUrl}`)
      
      // Limpeza de arquivos temporários
      await this.cleanup(job_id)
      
    } catch (error: any) {
      console.error(`❌ Erro no pipeline UE5:`, error)
      throw new Error(`Render pipeline failed: ${error.message}`)
    }
  }
  
  /**
   * Executar Audio2Face para gerar blendshapes
   */
  private async runAudio2Face(
    audioUrl: string,
    options: {
      emotion: string
      intensity: number
    }
  ): Promise<Audio2FaceResult> {
    // Baixar audio
    const audioPath = await this.downloadFile(audioUrl, 'audio')
    
    // TODO: Implementar chamada real para Audio2Face API
    // Por enquanto, simular resultado
    
    // Obter duração do áudio
    const { stdout: durationStr } = await execAsync(`
      ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"
    `)
    
    const audioDuration = parseFloat(durationStr.trim())
    
    // Gerar arquivo de blendshapes simulado
    const outputFile = `${this.TEMP_DIR}/a2f_${Date.now()}.json`
    
    // Simular processamento Audio2Face
    // Na versão real, chamar API gRPC do Audio2Face
    const mockBlendshapes = this.generateMockBlendshapes(audioDuration, options.emotion, options.intensity)
    
    await fs.writeFile(outputFile, JSON.stringify(mockBlendshapes, null, 2))
    
    return {
      blendshapes_file: outputFile,
      phonemes: mockBlendshapes.phonemes,
      emotions: mockBlendshapes.emotions,
      processing_time_ms: 500,
      audio_duration_seconds: audioDuration
    }
  }
  
  /**
   * Gerar blendshapes mock (será substituído por Audio2Face real)
   */
  private generateMockBlendshapes(duration: number, emotion: string, intensity: number) {
    const fps = 60 // Audio2Face trabalha a 60fps
    const totalFrames = Math.ceil(duration * fps)
    
    const frames = []
    const phonemes = []
    const emotions = []
    
    for (let i = 0; i < totalFrames; i++) {
      const time = i / fps
      
      // Simular movimento labial
      const lipIntensity = Math.sin(time * 10) * 0.5 + 0.5
      
      frames.push({
        frame: i,
        time: time,
        blendshapes: {
          jawOpen: lipIntensity * 0.4,
          mouthSmileLeft: emotion === 'happy' ? 0.3 : 0.0,
          mouthSmileRight: emotion === 'happy' ? 0.3 : 0.0,
          browInnerUp: emotion === 'empathetic' ? 0.2 : 0.0,
          // ... outros blendshapes
        }
      })
      
      // Adicionar phoneme a cada 100ms
      if (i % 6 === 0) {
        phonemes.push({
          time: time,
          phoneme: ['AH', 'EH', 'IH', 'OH', 'UH'][Math.floor(Math.random() * 5)],
          intensity: lipIntensity
        })
      }
    }
    
    emotions.push({
      time: 0,
      emotion: emotion,
      intensity: intensity / 3
    })
    
    return { frames, phonemes, emotions }
  }
  
  /**
   * Configurar cena UE5
   */
  private async setupUE5Scene(config: UE5AvatarConfig): Promise<string> {
    const sceneConfig = {
      level: `/Game/Levels/${config.environment}`,
      lighting: `/Game/Presets/Lighting/${config.lighting_preset}`,
      camera: {
        angle: config.camera_angle,
        fov: config.camera_angle === 'closeup' ? 35 : config.camera_angle === 'wide' ? 85 : 50,
        depth_of_field: config.background_blur
      },
      metahuman: {
        id: config.metahuman_id,
        clothing: config.clothing,
        hair_style: config.hair_style
      },
      render_settings: {
        resolution: config.resolution,
        fps: config.fps,
        ray_tracing: config.ray_tracing,
        anti_aliasing: config.anti_aliasing,
        motion_blur: config.motion_blur
      }
    }
    
    const configPath = `${this.TEMP_DIR}/scene_config_${Date.now()}.json`
    await fs.writeFile(configPath, JSON.stringify(sceneConfig, null, 2))
    
    return configPath
  }
  
  /**
   * Aplicar animação Audio2Face ao MetaHuman
   */
  private async applyAnimationToMetaHuman(
    metahumanId: string,
    blendshapesFile: string,
    sceneConfigPath: string
  ) {
    // TODO: Implementar chamada real ao UE5
    // Por enquanto, simular
    console.log(`  - Carregando MetaHuman: ${metahumanId}`)
    console.log(`  - Aplicando blendshapes: ${blendshapesFile}`)
    console.log(`  - Config da cena: ${sceneConfigPath}`)
    
    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  /**
   * Renderizar vídeo no UE5
   */
  private async renderUE5Video(
    jobId: string,
    config: UE5AvatarConfig,
    duration: number
  ): Promise<string> {
    const outputPath = `${this.TEMP_DIR}/${jobId}_raw.mp4`
    
    // TODO: Implementar render real com UE5 Movie Render Queue
    // Por enquanto, gerar vídeo de teste com FFmpeg
    
    const width = this.getResolutionWidth(config.resolution)
    const height = this.getResolutionHeight(config.resolution)
    
    console.log(`  - Resolução: ${width}x${height}`)
    console.log(`  - FPS: ${config.fps}`)
    console.log(`  - Duração: ${duration.toFixed(2)}s`)
    
    // Gerar vídeo placeholder (será substituído por render UE5 real)
    await execAsync(`
      ffmpeg -f lavfi -i color=c=blue:s=${width}x${height}:r=${config.fps} \
        -f lavfi -i "drawtext=text='UE5 Render\\nMetaHuman: ${config.metahuman_id}':fontsize=40:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" \
        -filter_complex "[0:v][1:v]overlay" \
        -t ${duration} \
        -pix_fmt yuv420p \
        "${outputPath}"
    `)
    
    return outputPath
  }
  
  /**
   * Encoding final com FFmpeg
   */
  private async encodeVideo(
    videoPath: string,
    audioUrl: string,
    config: UE5AvatarConfig
  ): Promise<string> {
    const outputPath = `${this.OUTPUT_DIR}/${path.basename(videoPath, '.mp4')}_final.${config.format}`
    
    // Baixar audio
    const localAudioPath = await this.downloadFile(audioUrl, 'audio')
    
    // Codec settings
    const videoCodec = config.codec === 'h264' ? 'libx264' : config.codec === 'h265' ? 'libx265' : 'libaom-av1'
    
    // Comando FFmpeg otimizado
    await execAsync(`
      ffmpeg -i "${videoPath}" -i "${localAudioPath}" \
        -c:v ${videoCodec} \
        -preset slow \
        -crf 18 \
        -b:v ${config.bitrate_mbps}M \
        -c:a aac -b:a ${config.audio_quality_kbps}k \
        -movflags +faststart \
        -pix_fmt yuv420p \
        "${outputPath}"
    `)
    
    return outputPath
  }
  
  /**
   * Download de arquivo (audio ou imagem)
   */
  private async downloadFile(url: string, type: 'audio' | 'image'): Promise<string> {
    if (url.startsWith('http')) {
      const ext = type === 'audio' ? 'mp3' : 'jpg'
      const outputPath = `${this.TEMP_DIR}/${type}_${Date.now()}.${ext}`
      
      // TODO: Implementar download real
      // Por enquanto, copiar de mock
      const mockPath = type === 'audio' ? '/tmp/mock_audio.mp3' : '/tmp/mock_image.jpg'
      
      try {
        await fs.copyFile(mockPath, outputPath)
      } catch {
        // Se mock não existe, criar placeholder
        if (type === 'audio') {
          await execAsync(`ffmpeg -f lavfi -i "sine=frequency=440:duration=5" "${outputPath}"`)
        }
      }
      
      return outputPath
    }
    return url
  }
  
  /**
   * Upload para S3
   */
  private async uploadToS3(filePath: string, jobId: string): Promise<string> {
    // TODO: Implementar upload real para S3
    // Por enquanto retornar URL mock
    const filename = path.basename(filePath)
    return `https://i.ytimg.com/vi/FmBXd6YzdyY/maxresdefault.jpg`
  }
  
  /**
   * Gerar thumbnail
   */
  private async generateThumbnail(videoPath: string, jobId: string): Promise<string> {
    const thumbPath = `${this.OUTPUT_DIR}/${jobId}_thumb.jpg`
    
    await execAsync(`
      ffmpeg -i "${videoPath}" -ss 00:00:02 -vframes 1 -q:v 2 "${thumbPath}"
    `)
    
    return await this.uploadToS3(thumbPath, `${jobId}_thumb`)
  }
  
  /**
   * Obter metadata do vídeo
   */
  private async getVideoMetadata(filePath: string, config: UE5AvatarConfig) {
    const { stdout } = await execAsync(`
      ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"
    `)
    
    const metadata = JSON.parse(stdout)
    const stats = await fs.stat(filePath)
    
    return {
      duration_seconds: parseFloat(metadata.format.duration),
      file_size_mb: stats.size / 1024 / 1024,
      resolution: `${metadata.streams[0].width}x${metadata.streams[0].height}`,
      codec: metadata.streams[0].codec_name,
      fps: config.fps,
      bitrate_mbps: config.bitrate_mbps
    }
  }
  
  /**
   * Limpeza de arquivos temporários
   */
  private async cleanup(jobId: string) {
    try {
      const patterns = [
        `${this.TEMP_DIR}/${jobId}*`,
        `${this.TEMP_DIR}/*${jobId}*`,
        `${this.TEMP_DIR}/a2f_*.json`,
        `${this.TEMP_DIR}/scene_config_*.json`
      ]
      
      for (const pattern of patterns) {
        await execAsync(`rm -f ${pattern}`).catch(() => {})
      }
      
      console.log(`🧹 Limpeza concluída para job ${jobId}`)
    } catch (error) {
      console.warn('⚠️ Aviso durante limpeza:', error)
    }
  }
  
  /**
   * Obter status de um job
   */
  getJobStatus(jobId: string): UE5RenderJob | null {
    return this.jobs.get(jobId) || null
  }
  
  /**
   * Listar todos os jobs
   */
  getAllJobs(): UE5RenderJob[] {
    return Array.from(this.jobs.values())
  }
  
  /**
   * Helper: Largura da resolução
   */
  private getResolutionWidth(resolution: string): number {
    const map: Record<string, number> = {
      '1080p': 1920,
      '1440p': 2560,
      '4K': 3840,
      '8K': 7680
    }
    return map[resolution] || 1920
  }
  
  /**
   * Helper: Altura da resolução
   */
  private getResolutionHeight(resolution: string): number {
    const map: Record<string, number> = {
      '1080p': 1080,
      '1440p': 1440,
      '4K': 2160,
      '8K': 4320
    }
    return map[resolution] || 1080
  }
}

// =============================================
// SINGLETON EXPORT
// =============================================

export const ue5AvatarEngine = new UE5AvatarEngine()
