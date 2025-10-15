/**
 * 🖼️ Image Parser - Extração e upload de imagens para S3
 * FASE 1: PPTX Processing Real
 */

import JSZip from 'jszip'
import sharp from 'sharp'
import { S3StorageService } from '../../s3-storage'
import { PPTXImage } from '../types/pptx-types'

export interface ImageExtractionResult {
  success: boolean
  images: PPTXImage[]
  totalImages: number
  totalSize: number
  uploadedToS3: number
  errors: string[]
  warnings: string[]
}

export interface ImageProcessingOptions {
  uploadToS3: boolean
  generateThumbnails: boolean
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'original' | 'webp' | 'jpeg' | 'png'
  thumbnailSize?: {
    width: number
    height: number
  }
}

export class PPTXImageParser {
  private readonly defaultOptions: ImageProcessingOptions

  constructor(defaultOptions: Partial<ImageProcessingOptions> = {}) {
    this.defaultOptions = {
      ...PPTXImageParser.DEFAULT_OPTIONS,
      ...defaultOptions,
    }
  }

  private static readonly DEFAULT_OPTIONS: ImageProcessingOptions = {
    uploadToS3: true,
    generateThumbnails: true,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    format: 'original',
    thumbnailSize: {
      width: 300,
      height: 200
    }
  }

  /**
   * Vers�o orientada a inst�ncia: retorna apenas a lista de imagens, para compatibilidade com clientes antigos.
   */
  async extractImages(
    zip: JSZip,
    projectId: string,
    options: Partial<ImageProcessingOptions> = {}
  ): Promise<PPTXImage[]> {
    const mergedOptions: ImageProcessingOptions = {
      ...this.defaultOptions,
      ...options,
    }

    const result = await PPTXImageParser.extractImages(zip, projectId, mergedOptions)
    const images = result.success ? result.images : []
    return images.map((image) => this.transformImageForLegacy(image))
  }

  isImageFile(filename: string): boolean {
    return PPTXImageParser.isImageFile(filename)
  }

  getImageMimeType(filePath: string): string | null {
    return PPTXImageParser.getImageMimeType(filePath)
  }

  extractFileName(filePath: string): string {
    return PPTXImageParser.extractFilename(filePath)
  }

  /**
   * Extrai todas as imagens de um arquivo PPTX
   */
  static async extractImages(
    zip: JSZip,
    projectId: string,
    options: Partial<ImageProcessingOptions> = {}
  ): Promise<ImageExtractionResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options }
    
    try {
      console.log('🖼️ Iniciando extração de imagens...')
      
      const result: ImageExtractionResult = {
        success: true,
        images: [],
        totalImages: 0,
        totalSize: 0,
        uploadedToS3: 0,
        errors: [],
        warnings: []
      }

      // Encontrar todos os arquivos de mídia
      const mediaFiles = Object.keys(zip.files).filter(name =>
        name.startsWith('ppt/media/') && this.isImageFile(name)
      )

      console.log(`📁 Encontrados ${mediaFiles.length} arquivos de imagem`)
      result.totalImages = mediaFiles.length

      if (mediaFiles.length === 0) {
        return result
      }

      // Processar cada imagem
      for (let i = 0; i < mediaFiles.length; i++) {
        const mediaFile = mediaFiles[i]
        
        try {
          console.log(`🔄 Processando imagem ${i + 1}/${mediaFiles.length}: ${mediaFile}`)
          
          const imageResult = await this.processImage(
            zip,
            mediaFile,
            projectId,
            i + 1,
            opts
          )
          
          if (imageResult.success && imageResult.image) {
            result.images.push(imageResult.image)
            result.totalSize += imageResult.image.size
            
            if (imageResult.uploadedToS3) {
              result.uploadedToS3++
            }
          } else {
            result.errors.push(imageResult.error || `Erro ao processar ${mediaFile}`)
          }
          
          if (imageResult.warnings) {
            result.warnings.push(...imageResult.warnings)
          }
        } catch (error) {
          const errorMsg = `Erro ao processar ${mediaFile}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          console.error(errorMsg)
          result.errors.push(errorMsg)
        }
      }

      console.log(`✅ Extração concluída: ${result.images.length}/${result.totalImages} imagens processadas`)
      
      return result
    } catch (error) {
      console.error('❌ Erro na extração de imagens:', error)
      return {
        success: false,
        images: [],
        totalImages: 0,
        totalSize: 0,
        uploadedToS3: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
        warnings: []
      }
    }
  }

  /**
   * Processa uma imagem individual (inst�ncia), fornecendo API simplificada.
   */
  async processImage(
    zip: JSZip,
    file: { name: string } | string,
    projectId: string,
    options: Partial<ImageProcessingOptions> = {}
  ): Promise<PPTXImage> {
    const filePath = typeof file === 'string' ? file : file?.name
    if (!filePath) {
      throw new Error('Arquivo de imagem inv�lido')
    }

    const mergedOptions: ImageProcessingOptions = {
      ...this.defaultOptions,
      ...options,
    }

    const result = await PPTXImageParser.processImage(
      zip,
      filePath,
      projectId,
      1,
      mergedOptions
    )

    if (!result.success || !result.image) {
      throw new Error(result.error || 'Falha ao processar imagem')
    }

    return this.transformImageForLegacy(result.image)
  }

  /**
   * Processa uma imagem individual
   */
  static async processImage(
    zip: JSZip,
    filePath: string,
    projectId: string,
    imageIndex: number,
    options: ImageProcessingOptions
  ): Promise<{
    success: boolean
    image?: PPTXImage
    uploadedToS3?: boolean
    error?: string
    warnings?: string[]
  }> {
    try {
      const file = zip.file(filePath)
      if (!file) {
        return {
          success: false,
          error: `Arquivo não encontrado: ${filePath}`
        }
      }

      // Ler buffer da imagem
      const buffer = await file.async('nodebuffer')
      
      // Detectar tipo de arquivo pela extensão
      const mimeType = this.getMimeTypeFromPath(filePath)
      if (!mimeType || !this.isSupportedImageType(mimeType)) {
        return {
          success: false,
          error: `Tipo de arquivo não suportado: ${mimeType || 'desconhecido'}`
        }
      }

      // Obter informações da imagem
      const imageInfo = await sharp(buffer).metadata()
      
      const filename = this.extractFilename(filePath)
      const imageId = `img_${projectId}_${imageIndex}`
      
      const image: PPTXImage = {
        id: imageId,
        filename,
        path: filePath,
        mimeType: mimeType,
        size: buffer.length,
        dimensions: {
          width: imageInfo.width || 0,
          height: imageInfo.height || 0
        },
        extractedAt: new Date().toISOString()
      }

      const warnings: string[] = []
      let uploadedToS3 = false

      // Upload para S3 se solicitado
      if (options.uploadToS3) {
        try {
          const uploadResult = await this.uploadImageToS3(
            buffer,
            image,
            projectId,
            options
          )
          
          if (uploadResult.success) {
            image.s3Key = uploadResult.s3Key
            image.s3Url = uploadResult.s3Url
            uploadedToS3 = true
            console.log(`📤 Imagem enviada para S3: ${uploadResult.s3Key}`)
          } else {
            warnings.push(`Falha no upload para S3: ${uploadResult.error}`)
          }
        } catch (error) {
          warnings.push(`Erro no upload para S3: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        }
      }

      return {
        success: true,
        image,
        uploadedToS3,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Faz upload da imagem para S3
   */
  async uploadImageToS3(
    buffer: Buffer,
    s3Key: string,
    mimeType: string,
    metadata: Record<string, string>
  ): Promise<string> {
    const uploadResult = await (S3StorageService as any).uploadFile(buffer, s3Key, mimeType, metadata)

    if (typeof uploadResult === 'string') {
      return uploadResult
    }

    if (uploadResult && typeof uploadResult === 'object') {
      const { url, key, success, error } = uploadResult as {
        url?: string
        key?: string
        success?: boolean
        error?: string
      }

      if (url) {
        return url
      }

      if (success && key) {
        return key
      }

      if (success) {
        return s3Key
      }

      throw new Error(error || 'Falha ao enviar imagem para armazenamento')
    }

    throw new Error('Falha desconhecida ao enviar imagem para armazenamento')
  }

  /**
   * Faz upload da imagem para S3
   */
  static async uploadImageToS3(
    buffer: Buffer,
    image: PPTXImage,
    projectId: string,
    options: ImageProcessingOptions
  ): Promise<{
    success: boolean
    s3Key?: string
    s3Url?: string
    thumbnailS3Key?: string
    thumbnailS3Url?: string
    error?: string
  }> {
    try {
      let processedBuffer = buffer
      let finalMimeType = image.mimeType
      let fileExtension = this.getFileExtension(image.mimeType)

      // Processar imagem se necessário
      if (options.format !== 'original' || options.maxWidth || options.maxHeight) {
        const sharpInstance = sharp(buffer)
        
        // Redimensionar se necessário
        if (options.maxWidth || options.maxHeight) {
          sharpInstance.resize(options.maxWidth, options.maxHeight, {
            fit: 'inside',
            withoutEnlargement: true
          })
        }

        // Converter formato se necessário
        if (options.format && options.format !== 'original') {
          switch (options.format) {
            case 'webp':
              sharpInstance.webp({ quality: options.quality })
              finalMimeType = 'image/webp'
              fileExtension = '.webp'
              break
            case 'jpeg':
              sharpInstance.jpeg({ quality: options.quality })
              finalMimeType = 'image/jpeg'
              fileExtension = '.jpg'
              break
            case 'png':
              sharpInstance.png()
              finalMimeType = 'image/png'
              fileExtension = '.png'
              break
          }
        }

        processedBuffer = await sharpInstance.toBuffer()
      }

      // Gerar chave S3
      const timestamp = Date.now()
      const s3Key = `projects/${projectId}/images/${image.id}_${timestamp}${fileExtension}`

      // Upload da imagem principal
      const uploadResult = await S3StorageService.uploadFile(
        processedBuffer,
        s3Key,
        finalMimeType,
        {
          type: 'pptx-image',
          projectId,
          originalFilename: image.filename,
          imageId: image.id
        }
      )

      if (!uploadResult.success) {
        return {
          success: false,
          error: uploadResult.error
        }
      }

      const s3Url = await S3StorageService.getSignedUrl(s3Key)
      
      let thumbnailS3Key: string | undefined
      let thumbnailS3Url: string | undefined

      // Gerar thumbnail se solicitado
      if (options.generateThumbnails && options.thumbnailSize) {
        try {
          const thumbnailBuffer = await sharp(buffer)
            .resize(options.thumbnailSize.width, options.thumbnailSize.height, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 80 })
            .toBuffer()

          thumbnailS3Key = `projects/${projectId}/thumbnails/${image.id}_${timestamp}_thumb.jpg`
          
          const thumbnailUpload = await S3StorageService.uploadFile(
            thumbnailBuffer,
            thumbnailS3Key,
            'image/jpeg',
            {
              type: 'pptx-image-thumbnail',
              projectId,
              originalImageId: image.id
            }
          )

          if (thumbnailUpload.success) {
            thumbnailS3Url = await S3StorageService.getSignedUrl(thumbnailS3Key)
          }
        } catch (error) {
          console.warn('Erro ao gerar thumbnail:', error)
          // Não falha o upload principal por causa do thumbnail
        }
      }

      return {
        success: true,
        s3Key,
        s3Url,
        thumbnailS3Key,
        thumbnailS3Url
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Verifica se um arquivo é uma imagem
   */
  static isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.tiff']
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    return imageExtensions.includes(ext)
  }

  /**
   * Verifica se o tipo MIME é suportado
   */
  private static isSupportedImageType(mimeType: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'image/tiff',
      'image/svg+xml'
    ]
    return supportedTypes.includes(mimeType)
  }

  /**
   * Extrai o nome do arquivo do caminho
   */
  static extractFilename(filePath: string): string {
    return filePath.split('/').pop() || filePath
  }

  static extractFileName(filePath: string): string {
    return this.extractFilename(filePath)
  }

  /**
   * Obtém o tipo MIME baseado no caminho do arquivo
   */
  private static getMimeTypeFromPath(filePath: string): string {
    const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'))
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.tiff': 'image/tiff',
      '.svg': 'image/svg+xml'
    }
    return mimeTypes[ext] || 'image/jpeg'
  }

  static getImageMimeType(filePath: string): string {
    return this.getMimeTypeFromPath(filePath)
  }

  private transformImageForLegacy(image: PPTXImage): PPTXImage {
    return {
      ...image,
      originalName: image.originalName ?? image.filename,
      type: image.type ?? image.mimeType,
    }
  }

  /**
   * Obtém a extensão do arquivo baseada no tipo MIME
   */
  private static getFileExtension(mimeType: string): string {
    const extensions: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/bmp': '.bmp',
      'image/webp': '.webp',
      'image/tiff': '.tiff',
      'image/svg+xml': '.svg'
    }
    return extensions[mimeType] || '.jpg'
  }

  /**
   * Gera thumbnail de uma imagem
   */
  static async generateThumbnail(
    buffer: Buffer,
    width: number = 300,
    height: number = 200,
    quality: number = 80
  ): Promise<Buffer> {
    return await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality })
      .toBuffer()
  }

  /**
   * Redimensiona uma imagem
   */
  static async resizeImage(
    buffer: Buffer,
    maxWidth: number,
    maxHeight: number,
    quality: number = 85
  ): Promise<Buffer> {
    return await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality })
      .toBuffer()
  }

  /**
   * Converte imagem para formato específico
   */
  static async convertImage(
    buffer: Buffer,
    format: 'webp' | 'jpeg' | 'png',
    quality: number = 85
  ): Promise<Buffer> {
    const sharpInstance = sharp(buffer)

    switch (format) {
      case 'webp':
        return await sharpInstance.webp({ quality }).toBuffer()
      case 'jpeg':
        return await sharpInstance.jpeg({ quality }).toBuffer()
      case 'png':
        return await sharpInstance.png().toBuffer()
      default:
        throw new Error(`Formato não suportado: ${format}`)
    }
  }

  /**
   * Extrai imagens de um slide específico (método estático)
   */
  static async extractSlideImages(
    zip: JSZip,
    slideNumber: number,
    projectId: string,
    options: Partial<ImageProcessingOptions> = {}
  ): Promise<ImageExtractionResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options }

    try {
      console.log(`🖼️ Extraindo imagens do slide ${slideNumber}...`)

      const result: ImageExtractionResult = {
        success: true,
        images: [],
        totalImages: 0,
        totalSize: 0,
        uploadedToS3: 0,
        errors: [],
        warnings: []
      }

      // Carregar relacionamentos do slide
      const relsPath = `ppt/slides/_rels/slide${slideNumber}.xml.rels`
      const relsFile = zip.file(relsPath)

      if (!relsFile) {
        console.log(`⚠️ Nenhum relacionamento encontrado para slide ${slideNumber}`)
        return result
      }

      const relsXml = await relsFile.async('text')
      const { parseStringPromise } = await import('xml2js')
      const relsData = await parseStringPromise(relsXml)

      const relationships = relsData['Relationships']?.['Relationship'] || []
      const imageRels = relationships.filter((rel: any) =>
        rel['$']?.Type?.includes('image')
      )

      console.log(`📸 Encontradas ${imageRels.length} imagens no slide ${slideNumber}`)

      // Processar cada imagem
      for (let i = 0; i < imageRels.length; i++) {
        const rel = imageRels[i]
        const target = rel['$']?.Target

        if (!target) continue

        // Construir caminho da imagem
        const imagePath = `ppt/slides/${target.replace('../', '')}`

        try {
          const imageResult = await this.processImage(
            zip,
            imagePath,
            projectId,
            `${slideNumber}_${i + 1}`,
            opts
          )

          if (imageResult.success && imageResult.image) {
            result.images.push(imageResult.image)
            result.totalSize += imageResult.image.size

            if (imageResult.uploadedToS3) {
              result.uploadedToS3++
            }
          } else {
            result.errors.push(imageResult.error || `Erro ao processar imagem ${i + 1}`)
          }

          if (imageResult.warnings) {
            result.warnings.push(...imageResult.warnings)
          }
        } catch (error) {
          const errorMsg = `Erro ao processar imagem ${target}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          console.error(errorMsg)
          result.errors.push(errorMsg)
        }
      }

      result.totalImages = imageRels.length
      console.log(`✅ Slide ${slideNumber}: ${result.images.length}/${result.totalImages} imagens processadas`)

      return result
    } catch (error) {
      console.error(`❌ Erro ao extrair imagens do slide ${slideNumber}:`, error)
      return {
        success: false,
        images: [],
        totalImages: 0,
        totalSize: 0,
        uploadedToS3: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
        warnings: []
      }
    }
  }
}
