/**
 * 🎥 Video Renderer - FFmpeg
 * Renderização de vídeos a partir de slides + áudio
 */

import ffmpeg from 'fluent-ffmpeg'
import { promises as fs } from 'fs'
import path from 'path'
import { nanoid } from 'nanoid'

export interface RenderOptions {
  slides: Array<{
    id: string
    index: number
    imageUrl: string
    audioUrl: string
    duration: number
  }>
  resolution: '720p' | '1080p' | '4k'
  fps: number
  format: 'mp4' | 'webm'
  quality: 'low' | 'medium' | 'high'
  transitions?: boolean
  watermark?: {
    text: string
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  }
}

export interface RenderProgress {
  percentage: number
  currentSlide: number
  totalSlides: number
  estimatedTime: number
  stage: 'downloading' | 'processing' | 'encoding' | 'finalizing'
}

export interface RenderResult {
  buffer: Buffer
  duration: number
  fileSize: number
  resolution: string
}

/**
 * Obter configurações de resolução
 */
function getResolutionConfig(resolution: string) {
  const configs = {
    '720p': { width: 1280, height: 720, bitrate: '2500k' },
    '1080p': { width: 1920, height: 1080, bitrate: '5000k' },
    '4k': { width: 3840, height: 2160, bitrate: '15000k' },
  }
  return configs[resolution as keyof typeof configs] || configs['1080p']
}

/**
 * Obter preset de qualidade
 */
function getQualityPreset(quality: string): string {
  const presets = {
    low: 'ultrafast',
    medium: 'medium',
    high: 'slow',
  }
  return presets[quality as keyof typeof presets] || 'medium'
}

/**
 * Download de arquivo remoto
 */
async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`)
  }
  const buffer = await response.arrayBuffer()
  await fs.writeFile(outputPath, Buffer.from(buffer))
}

/**
 * Renderizar vídeo a partir de slides
 */
export async function renderVideo(
  options: RenderOptions,
  onProgress?: (progress: RenderProgress) => void
): Promise<RenderResult> {
  const tempDir = path.join(process.cwd(), 'tmp', `render-${nanoid()}`)
  await fs.mkdir(tempDir, { recursive: true })

  try {
    const resConfig = getResolutionConfig(options.resolution)
    const qualityPreset = getQualityPreset(options.quality)

    // Stage 1: Download assets
    if (onProgress) {
      onProgress({
        percentage: 0,
        currentSlide: 0,
        totalSlides: options.slides.length,
        estimatedTime: options.slides.length * 10,
        stage: 'downloading',
      })
    }

    const slideFiles: Array<{ image: string; audio: string }> = []

    for (let i = 0; i < options.slides.length; i++) {
      const slide = options.slides[i]
      const imagePath = path.join(tempDir, `slide-${i}.jpg`)
      const audioPath = path.join(tempDir, `audio-${i}.mp3`)

      await Promise.all([
        downloadFile(slide.imageUrl, imagePath),
        downloadFile(slide.audioUrl, audioPath),
      ])

      slideFiles.push({ image: imagePath, audio: audioPath })

      if (onProgress) {
        onProgress({
          percentage: Math.floor(((i + 1) / options.slides.length) * 30),
          currentSlide: i + 1,
          totalSlides: options.slides.length,
          estimatedTime: (options.slides.length - i - 1) * 10,
          stage: 'downloading',
        })
      }
    }

    // Stage 2: Criar vídeos individuais por slide
    if (onProgress) {
      onProgress({
        percentage: 30,
        currentSlide: 0,
        totalSlides: options.slides.length,
        estimatedTime: options.slides.length * 5,
        stage: 'processing',
      })
    }

    const slideVideos: string[] = []

    for (let i = 0; i < slideFiles.length; i++) {
      const { image, audio } = slideFiles[i]
      const outputPath = path.join(tempDir, `segment-${i}.mp4`)

      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(image)
          .loop(options.slides[i].duration)
          .input(audio)
          .outputOptions([
            '-c:v libx264',
            `-preset ${qualityPreset}`,
            '-pix_fmt yuv420p',
            `-s ${resConfig.width}x${resConfig.height}`,
            `-b:v ${resConfig.bitrate}`,
            '-c:a aac',
            '-b:a 192k',
            '-shortest',
          ])
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run()
      })

      slideVideos.push(outputPath)

      if (onProgress) {
        onProgress({
          percentage: 30 + Math.floor(((i + 1) / options.slides.length) * 40),
          currentSlide: i + 1,
          totalSlides: options.slides.length,
          estimatedTime: (options.slides.length - i - 1) * 5,
          stage: 'processing',
        })
      }
    }

    // Stage 3: Concatenar todos os segmentos
    if (onProgress) {
      onProgress({
        percentage: 70,
        currentSlide: options.slides.length,
        totalSlides: options.slides.length,
        estimatedTime: 30,
        stage: 'encoding',
      })
    }

    const concatListPath = path.join(tempDir, 'concat.txt')
    const concatList = slideVideos
      .map((video) => `file '${path.basename(video)}'`)
      .join('\n')
    await fs.writeFile(concatListPath, concatList)

    const finalOutputPath = path.join(tempDir, `final.${options.format}`)

    await new Promise<void>((resolve, reject) => {
      let command = ffmpeg()
        .input(concatListPath)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c copy'])

      // Adicionar watermark se especificado
      if (options.watermark) {
        const { text, position } = options.watermark
        const positionMap = {
          'top-left': 'x=10:y=10',
          'top-right': 'x=W-tw-10:y=10',
          'bottom-left': 'x=10:y=H-th-10',
          'bottom-right': 'x=W-tw-10:y=H-th-10',
        }
        
        command = command.videoFilters(
          `drawtext=text='${text}':fontsize=24:fontcolor=white:${positionMap[position]}`
        )
      }

      command
        .output(finalOutputPath)
        .on('progress', (progress) => {
          if (onProgress && progress.percent) {
            onProgress({
              percentage: 70 + Math.floor(progress.percent * 0.25),
              currentSlide: options.slides.length,
              totalSlides: options.slides.length,
              estimatedTime: Math.floor((100 - progress.percent) * 0.3),
              stage: 'encoding',
            })
          }
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run()
    })

    // Stage 4: Ler arquivo final
    if (onProgress) {
      onProgress({
        percentage: 95,
        currentSlide: options.slides.length,
        totalSlides: options.slides.length,
        estimatedTime: 5,
        stage: 'finalizing',
      })
    }

    const buffer = await fs.readFile(finalOutputPath)
    const stats = await fs.stat(finalOutputPath)

    // Obter duração total
    const totalDuration = options.slides.reduce((sum, slide) => sum + slide.duration, 0)

    if (onProgress) {
      onProgress({
        percentage: 100,
        currentSlide: options.slides.length,
        totalSlides: options.slides.length,
        estimatedTime: 0,
        stage: 'finalizing',
      })
    }

    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true })

    return {
      buffer,
      duration: totalDuration,
      fileSize: stats.size,
      resolution: `${resConfig.width}x${resConfig.height}`,
    }
  } catch (error) {
    // Cleanup em caso de erro
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch {}
    
    throw error
  }
}

/**
 * Validar FFmpeg instalado
 */
export async function validateFFmpeg(): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err) => {
      resolve(!err)
    })
  })
}

/**
 * Obter informações de um vídeo
 */
export async function getVideoInfo(filePath: string): Promise<{
  duration: number
  width: number
  height: number
  size: number
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }

      const video = metadata.streams.find((s) => s.codec_type === 'video')
      
      if (!video) {
        reject(new Error('No video stream found'))
        return
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: video.width || 0,
        height: video.height || 0,
        size: metadata.format.size || 0,
      })
    })
  })
}
