
/**
 * Production S3 Upload Engine
 * Handles file uploads with progress tracking, validation, and error handling
 */

import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createS3Client, getBucketConfig } from "./aws-config"
import crypto from 'crypto'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
  speed: number
  timeRemaining: number
}

export interface UploadResult {
  success: boolean
  key: string
  url: string
  size: number
  contentType: string
  uploadTime: number
  error?: string
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void
  onError?: (error: Error) => void
  abortSignal?: AbortSignal
  generateThumbnail?: boolean
}

class S3UploadEngine {
  private s3Client: S3Client
  private bucketConfig: ReturnType<typeof getBucketConfig>

  constructor() {
    this.s3Client = createS3Client()
    this.bucketConfig = getBucketConfig()
  }

  /**
   * Upload file to S3 with progress tracking
   */
  async uploadFile(
    file: File, 
    keyPrefix: string = 'uploads/',
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const startTime = Date.now()

    try {
      // Validate file
      this.validateFile(file)

      // Generate unique key
      const key = this.generateFileKey(keyPrefix, file.name)
      
      // Convert file to buffer for upload
      const buffer = Buffer.from(await file.arrayBuffer())

      // Create upload command
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketConfig.bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          fileSize: file.size.toString()
        }
      })

      // Simulate progress tracking (since AWS SDK doesn't provide built-in progress for small files)
      if (options.onProgress) {
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime
          const progress = Math.min((elapsed / 2000) * 100, 95) // Simulate 2s upload to 95%
          
          options.onProgress!({
            loaded: Math.floor((file.size * progress) / 100),
            total: file.size,
            percentage: Math.round(progress),
            speed: file.size / Math.max(elapsed / 1000, 0.1),
            timeRemaining: Math.max(0, (2000 - elapsed) / 1000)
          })

          if (progress >= 95) {
            clearInterval(progressInterval)
          }
        }, 100)

        // Execute upload
        await this.s3Client.send(uploadCommand)
        clearInterval(progressInterval)

        // Final progress update
        options.onProgress({
          loaded: file.size,
          total: file.size,
          percentage: 100,
          speed: file.size / ((Date.now() - startTime) / 1000),
          timeRemaining: 0
        })
      } else {
        await this.s3Client.send(uploadCommand)
      }

      // Generate signed URL for access
      const url = await this.getSignedUrl(key)

      return {
        success: true,
        key,
        url,
        size: file.size,
        contentType: file.type,
        uploadTime: Date.now() - startTime
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error(errorMessage))
      }

      return {
        success: false,
        key: '',
        url: '',
        size: 0,
        contentType: '',
        uploadTime: Date.now() - startTime,
        error: errorMessage
      }
    }
  }

  /**
   * Get signed URL for file access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketConfig.bucketName,
      Key: key
    })

    return await getSignedUrl(this.s3Client, command, { expiresIn })
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketConfig.bucketName,
        Key: key
      })

      await this.s3Client.send(command)
      return true
    } catch (error) {
      console.error('Failed to delete file from S3:', error)
      return false
    }
  }

  /**
   * Check if file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketConfig.bucketName,
        Key: key
      })

      await this.s3Client.send(command)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    // Check file size (100MB limit)
    const maxFileSize = 100 * 1024 * 1024
    if (file.size > maxFileSize) {
      throw new Error(`Arquivo muito grande. Máximo: ${maxFileSize / 1024 / 1024}MB`)
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    const allowedTypes = ['.pptx', '.ppt', '.pdf', '.docx']
    if (!allowedTypes.includes(extension)) {
      throw new Error(`Tipo de arquivo não suportado. Permitidos: ${allowedTypes.join(', ')}`)
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
      throw new Error('Nome do arquivo é obrigatório')
    }
  }

  /**
   * Generate unique file key
   */
  private generateFileKey(prefix: string, originalName: string): string {
    const timestamp = Date.now()
    const randomId = crypto.randomBytes(8).toString('hex')
    const extension = originalName.split('.').pop()
    const cleanName = originalName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace special chars
      .toLowerCase()

    return `${this.bucketConfig.folderPrefix}${prefix}${timestamp}-${randomId}-${cleanName}.${extension}`
  }
}

// Export singleton instance
export const s3Upload = new S3UploadEngine()

// Export helper functions
export async function uploadFileToS3(
  file: File, 
  keyPrefix?: string, 
  options?: UploadOptions
): Promise<UploadResult> {
  return s3Upload.uploadFile(file, keyPrefix, options)
}

export async function getFileUrl(key: string, expiresIn?: number): Promise<string> {
  return s3Upload.getSignedUrl(key, expiresIn)
}

export async function deleteFileFromS3(key: string): Promise<boolean> {
  return s3Upload.deleteFile(key)
}
