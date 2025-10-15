
/**
 * 🗂️ AWS S3 CONFIG - Configuração Real para Upload e Gerenciamento
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export interface S3Config {
  bucketName: string
  folderPrefix: string
  region: string
}

// Configuração do S3
export function getBucketConfig(): S3Config {
  return {
    bucketName: process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET || '',
    folderPrefix: process.env.AWS_FOLDER_PREFIX || '',
    region: process.env.AWS_REGION || 'us-west-2'
  }
}

// Cliente S3
export function createS3Client(): S3Client {
  return new S3Client({
    region: getBucketConfig().region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  })
}

/**
 * Upload de arquivo para S3
 */
export async function uploadFileToS3(file: File, key?: string): Promise<string> {
  const s3Client = createS3Client()
  const config = getBucketConfig()
  
  // Gerar chave única se não fornecida
  const fileKey = key || `${config.folderPrefix}uploads/${Date.now()}-${sanitizeFilename(file.name)}`
  
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    })
    
    await s3Client.send(command)
    
    // Retornar a chave completa do S3
    return fileKey
    
  } catch (error) {
    console.error('Erro no upload para S3:', error)
    throw new Error(`Erro no upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

/**
 * Upload de buffer para S3
 */
export async function uploadBufferToS3(buffer: Buffer, filename: string, contentType?: string): Promise<string> {
  const s3Client = createS3Client()
  const config = getBucketConfig()
  
  const fileKey = `${config.folderPrefix}${filename}`
  
  try {
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      Metadata: {
        uploadedAt: new Date().toISOString()
      }
    })
    
    await s3Client.send(command)
    return fileKey
    
  } catch (error) {
    console.error('Erro no upload de buffer para S3:', error)
    throw new Error(`Erro no upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

/**
 * Gerar URL assinada para download
 */
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const s3Client = createS3Client()
  const config = getBucketConfig()
  
  try {
    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key
    })
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })
    return signedUrl
    
  } catch (error) {
    console.error('Erro ao gerar URL assinada:', error)
    throw new Error(`Erro ao gerar URL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

/**
 * Deletar arquivo do S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const s3Client = createS3Client()
  const config = getBucketConfig()
  
  try {
    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key
    })
    
    await s3Client.send(command)
    
  } catch (error) {
    console.error('Erro ao deletar do S3:', error)
    throw new Error(`Erro ao deletar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

/**
 * Verificar se arquivo existe no S3
 */
export async function fileExistsInS3(key: string): Promise<boolean> {
  const s3Client = createS3Client()
  const config = getBucketConfig()
  
  try {
    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key
    })
    
    await s3Client.send(command)
    return true
    
  } catch (error) {
    return false
  }
}

/**
 * Validação de arquivo
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 100 * 1024 * 1024 // 100MB
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/vnd.ms-powerpoint', // PPT
    'text/plain',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/webm'
  ]
  
  if (file.size > maxSize) {
    return { valid: false, error: `Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB` }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de arquivo não permitido' }
  }
  
  return { valid: true }
}

/**
 * Sanitizar nome de arquivo
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9\-_.]/g, '_') // Substitui caracteres especiais
    .replace(/_{2,}/g, '_') // Remove underscores duplos
    .toLowerCase()
}

/**
 * Gerar URL pública do S3 (se bucket for público)
 */
export function getPublicS3Url(key: string): string {
  const config = getBucketConfig()
  return `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`
}

/**
 * Listar arquivos em um prefixo
 */
export async function listS3Files(prefix: string, maxKeys: number = 100): Promise<Array<{
  key: string
  size: number
  lastModified: Date
}>> {
  const s3Client = createS3Client()
  const config = getBucketConfig()
  
  try {
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3')
    
    const command = new ListObjectsV2Command({
      Bucket: config.bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys
    })
    
    const response = await s3Client.send(command)
    
    return response.Contents?.map(obj => ({
      key: obj.Key || '',
      size: obj.Size || 0,
      lastModified: obj.LastModified || new Date()
    })) || []
    
  } catch (error) {
    console.error('Erro ao listar arquivos S3:', error)
    return []
  }
}

/**
 * Obter metadados do arquivo
 */
export async function getS3FileMetadata(key: string): Promise<{
  size: number
  contentType: string
  lastModified: Date
  metadata: Record<string, string>
} | null> {
  const s3Client = createS3Client()
  const config = getBucketConfig()
  
  try {
    const { HeadObjectCommand } = await import('@aws-sdk/client-s3')
    
    const command = new HeadObjectCommand({
      Bucket: config.bucketName,
      Key: key
    })
    
    const response = await s3Client.send(command)
    
    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType || '',
      lastModified: response.LastModified || new Date(),
      metadata: response.Metadata || {}
    }
    
  } catch (error) {
    console.error('Erro ao obter metadados S3:', error)
    return null
  }
}

export default {
  uploadFileToS3,
  uploadBufferToS3,
  getSignedDownloadUrl,
  deleteFromS3,
  fileExistsInS3,
  validateFile,
  sanitizeFilename,
  getPublicS3Url,
  listS3Files,
  getS3FileMetadata,
  getBucketConfig,
  createS3Client
}
