/**
 * FASE 2: S3 Service Real
 * Serviço de upload para AWS S3 com funcionalidade completa
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configuração do cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'estudio-ia-videos';

/**
 * Upload de arquivo para S3
 */
export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: {
        uploadedAt: new Date().toISOString(),
        size: buffer.length.toString()
      }
    });

    await s3Client.send(command);
    
    // Retornar URL público
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    
  } catch (error) {
    console.error('Erro no upload para S3:', error);
    throw new Error(`Falha no upload para S3: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Upload de vídeo com metadados específicos
 */
export async function uploadVideoToS3(
  buffer: Buffer,
  projectId: string,
  format: string = 'mp4'
): Promise<string> {
  const key = `videos/${projectId}/video.${format}`;
  const contentType = format === 'mp4' ? 'video/mp4' : 'video/webm';
  
  return uploadToS3(buffer, key, contentType);
}

/**
 * Upload de thumbnail
 */
export async function uploadThumbnailToS3(
  buffer: Buffer,
  projectId: string
): Promise<string> {
  const key = `videos/${projectId}/thumbnail.jpg`;
  
  return uploadToS3(buffer, key, 'image/jpeg');
}