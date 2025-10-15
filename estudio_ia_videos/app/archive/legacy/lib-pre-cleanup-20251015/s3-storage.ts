
/**
 * 💾 S3 Storage Service
 * Gerenciamento de arquivos em produção com AWS S3
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

interface UploadResult {
  success: boolean
  key?: string
  url?: string
  error?: string
}

interface DownloadResult {
  success: boolean
  buffer?: Buffer
  contentType?: string
  error?: string
}

export class S3StorageService {
  private static client: S3Client | null = null
  private static readonly bucketName = process.env.AWS_BUCKET_NAME
  private static readonly folderPrefix = process.env.AWS_FOLDER_PREFIX || ''

  // Inicializar cliente S3
  private static getClient(): S3Client {
    if (!this.client) {
      this.client = new S3Client({
        region: process.env.AWS_REGION || 'us-west-2'
      })
    }
    return this.client
  }

  // Upload de arquivo para S3 com fallback local
  static async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string = 'application/octet-stream',
    metadata: Record<string, string> = {}
  ): Promise<UploadResult> {
    console.log(`📤 Tentando upload S3: ${key} (${buffer.length} bytes)`)
    
    if (!this.bucketName) {
      console.log('⚠️ AWS_BUCKET_NAME não configurado, usando cache local')
      return this.uploadToLocalCache(buffer, key, contentType, metadata)
    }

    try {
      const client = this.getClient()
      const fullKey = `${this.folderPrefix}${key}`
      
      await client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fullKey,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
          size: buffer.length.toString()
        }
      }))
      
      console.log(`✅ Upload S3 concluído: ${fullKey}`)
      
      return {
        success: true,
        key: fullKey,
        url: `/api/s3/serve/${encodeURIComponent(fullKey)}`
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.warn('⚠️ Erro no upload S3, usando fallback local:', errorMessage)
      return this.uploadToLocalCache(buffer, key, contentType, metadata)
    }
  }

  // Fallback: salvar no cache local
  private static async uploadToLocalCache(
    buffer: Buffer,
    key: string,
    contentType: string,
    metadata: Record<string, string>
  ): Promise<UploadResult> {
    try {
      // Determinar tipo de cache baseado no content type
      if (contentType.startsWith('audio/')) {
        const { AudioCache } = await import('./audio-cache')
        const filename = key.split('/').pop() || `audio_${Date.now()}.mp3`
        AudioCache.store(filename, buffer, contentType, 0)
        
        console.log(`✅ Áudio salvo no cache local: ${filename}`)
        return {
          success: true,
          key: filename,
          url: `/api/tts/audio/${filename}`
        }
      } else if (contentType.startsWith('video/') || contentType.startsWith('image/')) {
        const { VideoCache } = await import('./video-cache')
        const filename = key.split('/').pop() || `video_${Date.now()}.mp4`
        VideoCache.store(filename, buffer, contentType, 0)
        
        console.log(`✅ Vídeo/Imagem salvo no cache local: ${filename}`)
        return {
          success: true,
          key: filename,
          url: `/api/videos/cache/${filename}`
        }
      } else {
        // Cache genérico
        const filename = key.split('/').pop() || `file_${Date.now()}`
        const { VideoCache } = await import('./video-cache')
        VideoCache.store(filename, buffer, contentType, 0)
        
        console.log(`✅ Arquivo salvo no cache local: ${filename}`)
        return {
          success: true,
          key: filename,
          url: `/api/files/cache/${filename}`
        }
      }
    } catch (error) {
      console.error('❌ Erro no fallback local:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro no fallback local'
      }
    }
  }

  // Download de arquivo do S3
  static async downloadFile(key: string): Promise<DownloadResult> {
    console.log(`📥 Downloading from S3: ${key}`)
    
    if (!this.bucketName) {
      return { success: false, error: 'AWS_BUCKET_NAME não configurado' }
    }

    try {
      const client = this.getClient()
      
      const response = await client.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      }))
      
      if (!response.Body) {
        throw new Error('Arquivo não encontrado')
      }
      
      const buffer = Buffer.from(await response.Body.transformToByteArray())
      
      console.log(`✅ Download concluído: ${key} (${buffer.length} bytes)`)
      
      return {
        success: true,
        buffer,
        contentType: response.ContentType || 'application/octet-stream'
      }
      
    } catch (error) {
      console.error('❌ Erro no download S3:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    }
  }

  // Gerar URL assinada para acesso temporário
  static async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
    if (!this.bucketName) {
      console.error('AWS_BUCKET_NAME não configurado')
      return null
    }

    try {
      const client = this.getClient()
      
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      })
      
      const url = await getSignedUrl(client, command, { expiresIn })
      console.log(`🔗 URL assinada gerada: ${key}`)
      
      return url
      
    } catch (error) {
      console.error('❌ Erro ao gerar URL assinada:', error)
      return null
    }
  }

  // Verificar se arquivo existe
  static async fileExists(key: string): Promise<boolean> {
    if (!this.bucketName) return false

    try {
      const client = this.getClient()
      
      await client.send(new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key
      }))
      
      return true
      
    } catch (error) {
      return false
    }
  }

  // Deletar arquivo
  static async deleteFile(key: string): Promise<boolean> {
    console.log(`🗑️ Deletando do S3: ${key}`)
    
    if (!this.bucketName) {
      console.error('AWS_BUCKET_NAME não configurado')
      return false
    }

    try {
      const client = this.getClient()
      
      await client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      }))
      
      console.log(`✅ Arquivo deletado: ${key}`)
      return true
      
    } catch (error) {
      console.error('❌ Erro ao deletar:', error)
      return false
    }
  }

  // Upload específico para áudios TTS
  static async uploadTTSAudio(audioBuffer: Buffer, metadata: {
    voice: string
    text: string
    language: string
  }): Promise<UploadResult> {
    const timestamp = Date.now()
    const voiceName = metadata.voice.replace(/[^a-zA-Z0-9]/g, '_')
    const key = `tts/audio/${voiceName}_${timestamp}.mp3`
    
    return this.uploadFile(audioBuffer, key, 'audio/mpeg', {
      voice: metadata.voice,
      language: metadata.language,
      textHash: this.hashText(metadata.text),
      type: 'tts-audio'
    })
  }

  // Upload específico para vídeos talking head
  static async uploadTalkingVideo(videoBuffer: Buffer, metadata: {
    avatarId: string
    audioKey: string
    resolution: string
  }): Promise<UploadResult> {
    const timestamp = Date.now()
    const key = `videos/talking-head/${metadata.avatarId}/${timestamp}.mp4`
    
    return this.uploadFile(videoBuffer, key, 'video/mp4', {
      avatarId: metadata.avatarId,
      audioKey: metadata.audioKey,
      resolution: metadata.resolution,
      type: 'talking-video'
    })
  }

  // Upload de thumbnail
  static async uploadThumbnail(thumbnailBuffer: Buffer, videoKey: string): Promise<UploadResult> {
    const key = videoKey.replace('.mp4', '_thumb.jpg').replace('videos/', 'thumbnails/')
    
    return this.uploadFile(thumbnailBuffer, key, 'image/jpeg', {
      videoKey,
      type: 'video-thumbnail'
    })
  }

  // Utilitário para hash de texto
  private static hashText(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  // Limpar arquivos expirados (cleanup job)
  static async cleanupExpiredFiles(olderThanDays: number = 7): Promise<void> {
    // Esta funcionalidade seria implementada com AWS Lambda ou scheduled job
    console.log(`🧹 Iniciando limpeza de arquivos com mais de ${olderThanDays} dias`)
    // TODO: Implementar listagem de objetos com prefixo e data
  }

  // Obter estatísticas de uso
  static async getUsageStats(): Promise<{
    totalFiles: number
    totalSize: number
    audioFiles: number
    videoFiles: number
  }> {
    // Esta funcionalidade seria implementada com AWS CLI ou SDK avançado
    return {
      totalFiles: 0,
      totalSize: 0,
      audioFiles: 0,
      videoFiles: 0
    }
  }
}
