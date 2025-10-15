
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  HeadObjectCommand 
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createS3Client, getBucketConfig } from "./aws-s3-config"

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
  error?: string
}

export class S3UploadEngine {
  private client: S3Client
  private config = getBucketConfig()

  constructor() {
    this.client = createS3Client()
  }

  /**
   * Upload file to S3 with progress tracking
   */
  async uploadFile(
    file: File | Buffer,
    fileName: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      const key = `${this.config.folderPrefix}${Date.now()}-${fileName}`
      const buffer = file instanceof File ? await this.fileToBuffer(file) : file
      const contentType = this.getContentType(fileName)

      // Validate file size (100MB limit)
      const maxFileSize = 100 * 1024 * 1024 // 100MB
      if (buffer.length > maxFileSize) {
        throw new Error(`File size exceeds ${maxFileSize / 1024 / 1024}MB limit`)
      }

      // Validate file type
      if (!this.isValidFileType(fileName)) {
        const allowedTypes = ['.pptx', '.ppt', '.pdf', '.docx']
        throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`)
      }

      const startTime = Date.now()
      
      // Simulate progress for single upload (S3 doesn't provide real upload progress for PutObject)
      const progressInterval = setInterval(() => {
        if (onProgress) {
          const elapsed = Date.now() - startTime
          const estimatedTotal = Math.max(elapsed * 2, 1000) // Estimate total time
          const percentage = Math.min((elapsed / estimatedTotal) * 100, 95) // Cap at 95% until complete
          
          onProgress({
            loaded: Math.floor((buffer.length * percentage) / 100),
            total: buffer.length,
            percentage: Math.round(percentage),
            speed: buffer.length / (elapsed / 1000) || 0,
            timeRemaining: Math.max(0, estimatedTotal - elapsed)
          })
        }
      }, 100)

      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
          size: buffer.length.toString()
        }
      })

      await this.client.send(command)
      
      clearInterval(progressInterval)
      
      // Final progress update
      if (onProgress) {
        onProgress({
          loaded: buffer.length,
          total: buffer.length,
          percentage: 100,
          speed: buffer.length / ((Date.now() - startTime) / 1000),
          timeRemaining: 0
        })
      }

      // Generate signed URL for access
      const url = await this.getSignedUrl(key)

      return {
        success: true,
        key,
        url,
        size: buffer.length,
        contentType
      }

    } catch (error) {
      console.error('S3 Upload Error:', error)
      return {
        success: false,
        key: '',
        url: '',
        size: 0,
        contentType: '',
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  /**
   * Get signed URL for file access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: key
    })

    return await getSignedUrl(this.client, command, { expiresIn })
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key
      })

      await this.client.send(command)
      return true
    } catch (error) {
      console.error('S3 Delete Error:', error)
      return false
    }
  }

  /**
   * Check if file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: key
      })

      await this.client.send(command)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: key
      })

      const response = await this.client.send(command)
      return {
        size: response.ContentLength,
        contentType: response.ContentType,
        lastModified: response.LastModified,
        metadata: response.Metadata
      }
    } catch (error) {
      console.error('Get Metadata Error:', error)
      return null
    }
  }

  // Helper methods
  private async fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  private getContentType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop()
    const mimeTypes: Record<string, string> = {
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'ppt': 'application/vnd.ms-powerpoint',
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    return mimeTypes[extension || ''] || 'application/octet-stream'
  }

  private isValidFileType(fileName: string): boolean {
    const extension = '.' + fileName.toLowerCase().split('.').pop()
    const allowedTypes = ['.pptx', '.ppt', '.pdf', '.docx']
    return allowedTypes.includes(extension)
  }
}

// Export singleton instance
export const s3UploadEngine = new S3UploadEngine()
