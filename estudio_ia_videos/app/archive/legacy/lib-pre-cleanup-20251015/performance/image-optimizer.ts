
/**
 * 🖼️ Image Optimization Utilities
 * 
 * Funções para otimização de imagens
 */

import sharp from 'sharp'
import { log } from '../monitoring/logger'

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

/**
 * Otimizar imagem com Sharp
 */
export async function optimizeImage(
  input: Buffer | string,
  options: ImageOptimizationOptions = {}
): Promise<Buffer> {
  try {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
      fit = 'cover',
    } = options
    
    let pipeline = sharp(input)
    
    // Resize
    if (width || height) {
      pipeline = pipeline.resize(width, height, { fit })
    }
    
    // Format conversion
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality })
        break
      case 'avif':
        pipeline = pipeline.avif({ quality })
        break
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, progressive: true })
        break
      case 'png':
        pipeline = pipeline.png({ quality, progressive: true })
        break
    }
    
    return await pipeline.toBuffer()
    
  } catch (error: any) {
    log.error('Image optimization failed', error)
    throw error
  }
}

/**
 * Gerar thumbnails em múltiplos tamanhos
 */
export async function generateThumbnails(
  input: Buffer | string,
  sizes: number[] = [128, 256, 512, 1024]
): Promise<Map<number, Buffer>> {
  const thumbnails = new Map<number, Buffer>()
  
  await Promise.all(
    sizes.map(async (size) => {
      try {
        const thumbnail = await optimizeImage(input, {
          width: size,
          height: size,
          format: 'webp',
          fit: 'cover',
        })
        thumbnails.set(size, thumbnail)
      } catch (error: any) {
        log.error(`Failed to generate thumbnail for size ${size}`, error)
      }
    })
  )
  
  return thumbnails
}

/**
 * Obter metadados da imagem
 */
export async function getImageMetadata(input: Buffer | string) {
  try {
    const metadata = await sharp(input).metadata()
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation,
    }
  } catch (error: any) {
    log.error('Failed to get image metadata', error)
    throw error
  }
}

/**
 * Converter imagem para base64
 */
export async function imageToBase64(
  input: Buffer | string,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  try {
    const optimized = await optimizeImage(input, {
      width: 64,
      quality: 60,
      format: 'webp',
      ...options,
    })
    
    return `data:image/webp;base64,${optimized.toString('base64')}`
  } catch (error: any) {
    log.error('Failed to convert image to base64', error)
    throw error
  }
}

/**
 * Validar tipo de imagem
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
  ]
  return validTypes.includes(mimeType.toLowerCase())
}

/**
 * Calcular tamanho ideal de imagem
 */
export function calculateOptimalSize(
  width: number,
  height: number,
  maxWidth = 1920,
  maxHeight = 1080
): { width: number; height: number } {
  const aspectRatio = width / height
  
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height }
  }
  
  if (width > maxWidth) {
    width = maxWidth
    height = Math.round(width / aspectRatio)
  }
  
  if (height > maxHeight) {
    height = maxHeight
    width = Math.round(height * aspectRatio)
  }
  
  return { width, height }
}
