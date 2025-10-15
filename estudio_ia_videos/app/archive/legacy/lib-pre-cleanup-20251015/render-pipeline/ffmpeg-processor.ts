

/**
 * FFmpeg Video Processing Pipeline - ENHANCED
 * Professional video composition and encoding with advanced features
 */

export interface FFmpegJob {
  id: string
  inputs: Array<{
    type: 'video' | 'audio' | 'image'
    url: string
    duration?: number
    start_time?: number
    metadata?: {
      resolution?: string
      fps?: number
      codec?: string
    }
  }>
  output: {
    filename: string
    resolution: string
    fps: number
    format: string
    quality: string
    bitrate?: string
    // Advanced output options
    profile?: 'baseline' | 'main' | 'high'
    level?: string
    pixel_format?: 'yuv420p' | 'yuv444p'
    color_space?: 'bt709' | 'bt2020'
  }
  effects: Array<{
    type: 'transition' | 'overlay' | 'filter' | 'watermark' | 'color_correction' | 'noise_reduction'
    config: any
    start_time?: number
    duration?: number
    layer?: number
  }>
  // Advanced processing options
  advanced_options?: {
    gpu_acceleration?: boolean
    multipass_encoding?: boolean
    adaptive_bitrate?: boolean
    hdr_processing?: boolean
    audio_normalization?: boolean
    subtitle_burn_in?: boolean
  }
}

export interface ProcessingProgress {
  stage: string
  progress: number
  current_frame: number
  total_frames: number
  fps: number
  bitrate: string
  eta_seconds: number
}

/**
 * FFmpeg Command Builder
 */
export class FFmpegProcessor {
  private tempDir = '/tmp/ffmpeg-jobs'
  private presets: Map<string, any> = new Map()

  constructor() {
    this.initializePresets()
  }

  /**
   * Process video with FFmpeg
   */
  async processVideo(job: FFmpegJob): Promise<{
    output_url: string
    file_size: number
    duration: number
    processing_time: number
  }> {
    const startTime = Date.now()
    
    try {
      console.log(`Starting FFmpeg processing for job ${job.id}`)
      
      // Build FFmpeg command
      const command = this.buildCommand(job)
      
      console.log('FFmpeg command:', command)
      
      // Execute FFmpeg (simulated)
      const result = await this.executeFFmpeg(command, job.id)
      
      const processingTime = (Date.now() - startTime) / 1000
      
      return {
        output_url: result.output_path,
        file_size: result.file_size,
        duration: result.duration,
        processing_time: processingTime
      }
      
    } catch (error) {
      console.error('FFmpeg processing error:', error)
      throw error
    }
  }

  /**
   * Build optimized FFmpeg command
   */
  private buildCommand(job: FFmpegJob): string {
    let command = 'ffmpeg -y '
    
    // Add input files
    job.inputs.forEach(input => {
      command += `-i "${input.url}" `
    })

    // Build filter graph
    const filterGraph = this.buildFilterGraph(job)
    if (filterGraph) {
      command += `-filter_complex "${filterGraph}" `
    }

    // Video encoding settings
    const preset = this.presets.get(job.output.quality) || this.presets.get('standard')
    command += preset.video_codec
    
    // Audio encoding
    command += preset.audio_codec
    
    // Output format and resolution
    command += `-s ${job.output.resolution} -r ${job.output.fps} `
    
    // Output file
    command += `"${this.tempDir}/${job.output.filename}"`

    return command
  }

  /**
   * Build complex filter graph for video composition
   */
  private buildFilterGraph(job: FFmpegJob): string {
    const filters: string[] = []
    
    // Scene concatenation
    if (job.inputs.length > 1) {
      const videoInputs = job.inputs
        .map((_, index) => `[${index}:v]`)
        .join('')
      
      const audioInputs = job.inputs
        .map((_, index) => `[${index}:a]`)
        .join('')

      filters.push(`${videoInputs}concat=n=${job.inputs.length}:v=1:a=0[video]`)
      filters.push(`${audioInputs}concat=n=${job.inputs.length}:v=0:a=1[audio]`)
    } else {
      filters.push('[0:v]copy[video]')
      filters.push('[0:a]copy[audio]')
    }

    // Apply effects
    job.effects.forEach((effect, index) => {
      switch (effect.type) {
        case 'transition':
          filters.push(this.buildTransitionFilter(effect, index))
          break
        case 'overlay':
          filters.push(this.buildOverlayFilter(effect, index))
          break
        case 'watermark':
          filters.push(this.buildWatermarkFilter(effect, index))
          break
        case 'filter':
          filters.push(this.buildCustomFilter(effect, index))
          break
      }
    })

    return filters.join(';')
  }

  /**
   * Execute FFmpeg command with progress tracking
   */
  private async executeFFmpeg(command: string, jobId: string): Promise<{
    output_path: string
    file_size: number
    duration: number
  }> {
    
    // Simulate FFmpeg execution with progress
    const totalFrames = 30 * 60 // Estimate for 60s video at 30fps
    
    for (let frame = 0; frame <= totalFrames; frame += Math.floor(totalFrames / 20)) {
      const progress = (frame / totalFrames) * 100
      
      console.log(`FFmpeg progress: ${progress.toFixed(1)}% (frame ${frame}/${totalFrames})`)
      
      // Emit progress event (in production, use WebSockets)
      this.emitProgress(jobId, {
        stage: 'encoding',
        progress,
        current_frame: frame,
        total_frames: totalFrames,
        fps: 30,
        bitrate: '2000kbps',
        eta_seconds: (totalFrames - frame) / 30
      })
      
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    const outputPath = `${this.tempDir}/output-${jobId}.mp4`
    
    return {
      output_path: outputPath,
      file_size: 25 * 1024 * 1024, // 25MB estimate
      duration: 120 // Default duration estimate
    }
  }

  /**
   * Emit progress events
   */
  private emitProgress(jobId: string, progress: ProcessingProgress): void {
    // In production, emit to WebSocket or pubsub system
    console.log(`[${jobId}] ${progress.stage}: ${progress.progress.toFixed(1)}%`)
  }

  /**
   * Build transition filter
   */
  private buildTransitionFilter(effect: any, index: number): string {
    const { type = 'fade', duration = 1.0 } = effect.config
    
    switch (type) {
      case 'fade':
        return `fade=t=in:st=${effect.start_time}:d=${duration}`
      case 'dissolve':
        return `blend=all_mode=dissolve:c0_opacity=${duration}`
      default:
        return `fade=t=in:st=${effect.start_time}:d=${duration}`
    }
  }

  /**
   * Build overlay filter  
   */
  private buildOverlayFilter(effect: any, index: number): string {
    const { x = 10, y = 10, opacity = 1.0 } = effect.config
    return `overlay=${x}:${y}:alpha=${opacity}`
  }

  /**
   * Build watermark filter
   */
  private buildWatermarkFilter(effect: any, index: number): string {
    const { text, position = 'bottom-right', opacity = 0.8 } = effect.config
    
    const positions = {
      'top-left': 'x=10:y=10',
      'top-right': 'x=w-tw-10:y=10',
      'bottom-left': 'x=10:y=h-th-10',
      'bottom-right': 'x=w-tw-10:y=h-th-10',
      'center': 'x=(w-tw)/2:y=(h-th)/2'
    }

    const pos = positions[position as keyof typeof positions] || positions['bottom-right']
    
    return `drawtext=text='${text}':fontsize=24:fontcolor=white@${opacity}:${pos}`
  }

  /**
   * Build custom filter
   */
  private buildCustomFilter(effect: any, index: number): string {
    return effect.config.filter_string || ''
  }

  /**
   * Initialize encoding presets - ENHANCED
   */
  private initializePresets(): void {
    this.presets.set('draft', {
      video_codec: '-c:v libx264 -preset ultrafast -crf 28 -tune zerolatency ',
      audio_codec: '-c:a aac -b:a 96k -ac 2 ',
      description: 'Fast encoding for previews and drafts',
      profile: 'baseline',
      level: '3.1'
    })

    this.presets.set('standard', {
      video_codec: '-c:v libx264 -preset medium -crf 23 -profile:v main ',
      audio_codec: '-c:a aac -b:a 128k -ac 2 -ar 44100 ',
      description: 'Balanced quality and speed for general use',
      profile: 'main',
      level: '4.0'
    })

    this.presets.set('high', {
      video_codec: '-c:v libx264 -preset slow -crf 18 -profile:v high -level 4.1 ',
      audio_codec: '-c:a aac -b:a 192k -ac 2 -ar 48000 ',
      description: 'High quality for professional delivery',
      profile: 'high',
      level: '4.1'
    })

    this.presets.set('premium', {
      video_codec: '-c:v libx265 -preset medium -crf 20 -profile:v main -tier main ',
      audio_codec: '-c:a aac -b:a 256k -ac 2 -ar 48000 ',
      description: 'Premium quality with HEVC/H.265 encoding',
      profile: 'main',
      level: '5.0',
      advanced: true
    })

    // New ultra preset for enterprise
    this.presets.set('ultra', {
      video_codec: '-c:v libx265 -preset veryslow -crf 16 -profile:v main -x265-params "colorprim=bt2020:transfer=smpte2084:colormatrix=bt2020nc" ',
      audio_codec: '-c:a aac -b:a 320k -ac 2 -ar 48000 ',
      description: 'Ultra quality with HDR support',
      profile: 'main',
      level: '5.1',
      advanced: true,
      hdr: true
    })
  }

  /**
   * Advanced FFmpeg command builder with GPU acceleration
   */
  private buildAdvancedCommand(job: FFmpegJob): string {
    let command = 'ffmpeg -y '
    
    // GPU acceleration (if available)
    if (job.advanced_options?.gpu_acceleration) {
      command += '-hwaccel cuda -hwaccel_output_format cuda '
    }

    // Input files with metadata
    job.inputs.forEach((input, index) => {
      command += `-i "${input.url}" `
      
      // Add input options if needed
      if (input.start_time) {
        command += `-ss ${input.start_time} `
      }
      if (input.duration) {
        command += `-t ${input.duration} `
      }
    })

    // Build advanced filter graph
    const filterGraph = this.buildAdvancedFilterGraph(job)
    if (filterGraph) {
      command += `-filter_complex "${filterGraph}" `
    }

    // Video encoding with advanced options
    const preset = this.presets.get(job.output.quality) || this.presets.get('standard')
    command += preset.video_codec
    
    // Advanced video options
    if (job.output.profile) {
      command += `-profile:v ${job.output.profile} `
    }
    if (job.output.level) {
      command += `-level ${job.output.level} `
    }
    if (job.output.pixel_format) {
      command += `-pix_fmt ${job.output.pixel_format} `
    }

    // Audio encoding with enhancement
    command += preset.audio_codec
    
    // Audio normalization
    if (job.advanced_options?.audio_normalization) {
      command += `-af "loudnorm=I=-16:TP=-1.5:LRA=11" `
    }
    
    // Output format and resolution
    command += `-s ${job.output.resolution} -r ${job.output.fps} `
    
    // Multipass encoding for premium quality
    if (job.advanced_options?.multipass_encoding && job.output.quality === 'premium') {
      command += `-pass 1 -f null /dev/null && ffmpeg -y `
      // Add inputs again for second pass
      job.inputs.forEach(input => command += `-i "${input.url}" `)
      command += preset.video_codec + `-pass 2 `
    }
    
    // Output file
    command += `"${this.tempDir}/${job.output.filename}"`

    return command
  }

  /**
   * Build advanced filter graph with professional effects
   */
  private buildAdvancedFilterGraph(job: FFmpegJob): string {
    const filters: string[] = []
    let currentVideoLabel = '[0:v]'
    let currentAudioLabel = '[0:a]'
    
    // Scene concatenation with advanced transitions
    if (job.inputs.length > 1) {
      const videoInputs = job.inputs
        .map((_, index) => `[${index}:v]`)
        .join('')
      
      const audioInputs = job.inputs
        .map((_, index) => `[${index}:a]`)
        .join('')

      // Advanced concatenation with crossfade transitions
      filters.push(`${videoInputs}concat=n=${job.inputs.length}:v=1:a=0[video_raw]`)
      filters.push(`${audioInputs}concat=n=${job.inputs.length}:v=0:a=1[audio_raw]`)
      
      currentVideoLabel = '[video_raw]'
      currentAudioLabel = '[audio_raw]'
    } else {
      filters.push('[0:v]copy[video_raw]')
      filters.push('[0:a]copy[audio_raw]')
      currentVideoLabel = '[video_raw]'
      currentAudioLabel = '[audio_raw]'
    }

    // Apply advanced effects
    job.effects.forEach((effect, index) => {
      const inputLabel = currentVideoLabel
      const outputLabel = `[video_${index}]`
      
      switch (effect.type) {
        case 'color_correction':
          filters.push(`${inputLabel}${this.buildColorCorrectionFilter(effect)}${outputLabel}`)
          break
        case 'noise_reduction':
          filters.push(`${inputLabel}${this.buildNoiseReductionFilter(effect)}${outputLabel}`)
          break
        case 'transition':
          filters.push(`${inputLabel}${this.buildAdvancedTransitionFilter(effect)}${outputLabel}`)
          break
        case 'overlay':
          filters.push(`${inputLabel}${this.buildAdvancedOverlayFilter(effect)}${outputLabel}`)
          break
        case 'watermark':
          filters.push(`${inputLabel}${this.buildAdvancedWatermarkFilter(effect)}${outputLabel}`)
          break
        case 'filter':
          filters.push(`${inputLabel}${this.buildCustomFilter(effect, index)}${outputLabel}`)
          break
      }
      
      currentVideoLabel = outputLabel
    })

    // Final output mapping
    filters.push(`${currentVideoLabel}copy[final_video]`)
    filters.push(`${currentAudioLabel}copy[final_audio]`)

    return filters.join(';')
  }

  /**
   * Advanced color correction filter
   */
  private buildColorCorrectionFilter(effect: any): string {
    const { 
      brightness = 0, 
      contrast = 1.0, 
      saturation = 1.0, 
      gamma = 1.0,
      auto_levels = false 
    } = effect.config
    
    let filter = `eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}:gamma=${gamma}`
    
    if (auto_levels) {
      filter += ',autolevels'
    }
    
    return filter
  }

  /**
   * Advanced noise reduction filter
   */
  private buildNoiseReductionFilter(effect: any): string {
    const { 
      strength = 'medium',
      temporal = true,
      chroma = true
    } = effect.config
    
    const strengthValues = {
      'light': '2:1:2',
      'medium': '4:3:6', 
      'strong': '7:5:10'
    }
    
    const params = strengthValues[strength as keyof typeof strengthValues] || strengthValues.medium
    
    let filter = `hqdn3d=${params}`
    
    if (!temporal) {
      filter = `nlmeans=s=${params.split(':')[0]}`
    }
    
    return filter
  }

  /**
   * Advanced transition effects
   */
  private buildAdvancedTransitionFilter(effect: any): string {
    const { 
      type = 'fade', 
      duration = 1.0,
      direction = 'in',
      easing = 'linear'
    } = effect.config
    
    switch (type) {
      case 'fade':
        return `fade=t=${direction}:st=${effect.start_time}:d=${duration}`
      case 'dissolve':
        return `blend=all_mode=dissolve:c0_opacity=${duration}`
      case 'slide':
        const slideDirection = effect.config.slide_direction || 'left'
        return `slide=${slideDirection}:duration=${duration}`
      case 'zoom':
        const zoomType = effect.config.zoom_type || 'in'
        return `zoompan=z='if(lte(zoom,1.0),1.5,max(1.001,zoom-0.0015))':d=${duration * 25}`
      default:
        return `fade=t=${direction}:st=${effect.start_time}:d=${duration}`
    }
  }

  /**
   * Advanced overlay system with layers
   */
  private buildAdvancedOverlayFilter(effect: any): string {
    const { 
      x = 10, 
      y = 10, 
      opacity = 1.0,
      blend_mode = 'normal',
      scale = 1.0,
      rotation = 0
    } = effect.config
    
    let filter = `overlay=${x}:${y}`
    
    if (opacity < 1.0) {
      filter += `:alpha=${opacity}`
    }
    
    if (blend_mode !== 'normal') {
      filter += `:mode=${blend_mode}`
    }
    
    return filter
  }

  /**
   * Advanced watermark with positioning and styling
   */
  private buildAdvancedWatermarkFilter(effect: any): string {
    const { 
      text, 
      position = 'bottom-right', 
      opacity = 0.8,
      font_size = 24,
      font_color = 'white',
      background = false,
      shadow = true
    } = effect.config
    
    const positions = {
      'top-left': 'x=10:y=10',
      'top-center': 'x=(w-tw)/2:y=10',
      'top-right': 'x=w-tw-10:y=10',
      'center-left': 'x=10:y=(h-th)/2',
      'center': 'x=(w-tw)/2:y=(h-th)/2',
      'center-right': 'x=w-tw-10:y=(h-th)/2',
      'bottom-left': 'x=10:y=h-th-10',
      'bottom-center': 'x=(w-tw)/2:y=h-th-10',
      'bottom-right': 'x=w-tw-10:y=h-th-10'
    }

    const pos = positions[position as keyof typeof positions] || positions['bottom-right']
    
    let filter = `drawtext=text='${text}':fontsize=${font_size}:fontcolor=${font_color}@${opacity}:${pos}`
    
    if (background) {
      filter += `:box=1:boxcolor=black@0.5:boxborderw=5`
    }
    
    if (shadow) {
      filter += `:shadowcolor=black:shadowx=2:shadowy=2`
    }
    
    return filter
  }

  /**
   * Process video with advanced monitoring
   */
  async processVideoAdvanced(
    job: FFmpegJob, 
    progressCallback?: (progress: ProcessingProgress) => void
  ): Promise<{
    output_url: string
    file_size: number
    duration: number
    processing_time: number
    metadata: any
  }> {
    const startTime = Date.now()
    
    try {
      console.log(`🎬 Starting advanced FFmpeg processing for job ${job.id}`)
      
      // Pre-process analysis
      const inputAnalysis = await this.analyzeInputs(job.inputs)
      
      // Build optimized command based on analysis
      const command = this.buildAdvancedCommand(job)
      
      console.log('Advanced FFmpeg command:', command)
      
      // Execute with real-time progress monitoring
      const result = await this.executeAdvancedFFmpeg(command, job.id, progressCallback)
      
      // Post-process analysis
      const metadata = await this.analyzeOutput(result.output_path)
      
      const processingTime = (Date.now() - startTime) / 1000
      
      console.log(`✅ Advanced processing completed in ${processingTime}s`)
      
      return {
        output_url: result.output_path,
        file_size: result.file_size,
        duration: result.duration,
        processing_time: processingTime,
        metadata
      }
      
    } catch (error) {
      console.error('Advanced FFmpeg processing error:', error)
      throw error
    }
  }

  /**
   * Analyze input files for optimization
   */
  private async analyzeInputs(inputs: FFmpegJob['inputs']): Promise<any> {
    console.log(`🔍 Analyzing ${inputs.length} input files`)
    
    const analysis = {
      total_duration: 0,
      max_resolution: '',
      codecs: new Set<string>(),
      fps_variations: new Set<number>(),
      audio_channels: new Set<number>(),
      complexity_score: 0
    }

    for (const input of inputs) {
      // Simulate file analysis
      analysis.total_duration += input.duration || 0
      analysis.codecs.add(input.metadata?.codec || 'h264')
      analysis.fps_variations.add(input.metadata?.fps || 30)
      
      if (input.type === 'video') {
        analysis.complexity_score += 2
      } else if (input.type === 'audio') {
        analysis.complexity_score += 1
      }
    }

    return analysis
  }

  /**
   * Execute FFmpeg with advanced progress tracking
   */
  private async executeAdvancedFFmpeg(
    command: string, 
    jobId: string,
    progressCallback?: (progress: ProcessingProgress) => void
  ): Promise<{
    output_path: string
    file_size: number
    duration: number
  }> {
    
    console.log(`⚡ Executing advanced FFmpeg command`)
    
    // Simulate advanced FFmpeg execution with detailed progress
    const totalFrames = 30 * 180 // Estimate for 3-minute video at 30fps
    const stages = [
      { name: 'Input Analysis', frames: totalFrames * 0.05 },
      { name: 'Video Decoding', frames: totalFrames * 0.15 },
      { name: 'Filter Processing', frames: totalFrames * 0.30 },
      { name: 'Encoding', frames: totalFrames * 0.40 },
      { name: 'Output Writing', frames: totalFrames * 0.10 }
    ]

    let processedFrames = 0
    
    for (const stage of stages) {
      console.log(`📊 Stage: ${stage.name}`)
      
      const stageFrames = Math.floor(stage.frames)
      for (let frame = 0; frame < stageFrames; frame += Math.floor(stageFrames / 10)) {
        processedFrames += Math.floor(stageFrames / 10)
        const progress = (processedFrames / totalFrames) * 100
        
        const progressData: ProcessingProgress = {
          stage: stage.name,
          progress,
          current_frame: processedFrames,
          total_frames: totalFrames,
          fps: 30,
          bitrate: '2500kbps',
          eta_seconds: (totalFrames - processedFrames) / 30
        }
        
        if (progressCallback) {
          progressCallback(progressData)
        }
        
        this.emitProgress(jobId, progressData)
        
        await new Promise(resolve => setTimeout(resolve, 150))
      }
    }

    const outputPath = `${this.tempDir}/output-${jobId}.mp4`
    
    return {
      output_path: outputPath,
      file_size: 45 * 1024 * 1024, // 45MB estimate for higher quality
      duration: 180 // 3 minutes
    }
  }

  /**
   * Analyze output video quality
   */
  private async analyzeOutput(outputPath: string): Promise<any> {
    console.log(`📈 Analyzing output quality: ${outputPath}`)
    
    // Simulate quality analysis
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      video_quality: {
        resolution: '1920x1080',
        fps: 30,
        bitrate: '2500kbps',
        codec: 'h264',
        profile: 'high',
        level: '4.1'
      },
      audio_quality: {
        codec: 'aac',
        bitrate: '192kbps',
        sample_rate: '48000',
        channels: 2
      },
      file_info: {
        container: 'mp4',
        duration: 180,
        file_size: 45 * 1024 * 1024
      },
      quality_metrics: {
        video_score: 0.92,
        audio_score: 0.89,
        overall_score: 0.91,
        compression_ratio: 0.65
      }
    }
  }

  /**
   * Batch process multiple videos
   */
  async batchProcess(jobs: FFmpegJob[]): Promise<any[]> {
    console.log(`🔄 Starting batch processing of ${jobs.length} jobs`)
    
    const results = []
    const maxConcurrent = 2
    
    for (let i = 0; i < jobs.length; i += maxConcurrent) {
      const batch = jobs.slice(i, i + maxConcurrent)
      
      const batchPromises = batch.map(job => 
        this.processVideoAdvanced(job)
      )
      
      const batchResults = await Promise.allSettled(batchPromises)
      results.push(...batchResults)
      
      console.log(`📦 Batch ${Math.floor(i / maxConcurrent) + 1} completed`)
    }
    
    return results
  }

  /**
   * Optimize command for hardware capabilities
   */
  private optimizeForHardware(command: string): string {
    // Check available hardware acceleration
    if (this.isNvidiaGPUAvailable()) {
      command = command.replace('-c:v libx264', '-c:v h264_nvenc')
      command = command.replace('-c:v libx265', '-c:v hevc_nvenc')
    }
    
    // Optimize for CPU cores
    const cpuCores = this.getCPUCoreCount()
    if (cpuCores > 4) {
      command += ` -threads ${Math.min(cpuCores, 8)}`
    }
    
    return command
  }

  /**
   * Hardware capability detection
   */
  private isNvidiaGPUAvailable(): boolean {
    // In production, check for NVIDIA GPU
    return process.env.NVIDIA_GPU_AVAILABLE === 'true'
  }

  private getCPUCoreCount(): number {
    // In production, detect actual CPU cores
    return parseInt(process.env.CPU_CORES || '4')
  }

  /**
   * Generate thumbnail from video
   */
  async generateThumbnail(videoPath: string, timeOffset = 2.0): Promise<string> {
    const thumbnailPath = videoPath.replace(/\.[^.]+$/, '-thumb.jpg')
    
    const command = `ffmpeg -i "${videoPath}" -ss ${timeOffset} -vframes 1 -q:v 2 "${thumbnailPath}"`
    
    console.log('Generating thumbnail:', command)
    
    // Simulate thumbnail generation
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return thumbnailPath
  }

  /**
   * Get video metadata
   */
  async getVideoMetadata(videoPath: string): Promise<{
    duration: number
    resolution: string
    fps: number
    bitrate: string
    file_size: number
  }> {
    
    // Simulate ffprobe
    return {
      duration: 60.5,
      resolution: '1920x1080',
      fps: 30,
      bitrate: '2000kbps', 
      file_size: 25 * 1024 * 1024 // 25MB
    }
  }
}

export const ffmpegProcessor = new FFmpegProcessor()
