
/**
 * S3 Upload Service
 * Handles file uploads to AWS S3
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

/**
 * Upload file to S3
 */
export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  const s3Client = createS3Client();
  const { bucketName, folderPrefix } = getBucketConfig();
  
  const fullKey = folderPrefix ? `${folderPrefix}${key}` : key;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fullKey,
    Body: buffer,
    ContentType: contentType,
  });
  
  await s3Client.send(command);
  
  // Return public URL
  return `https://${bucketName}.s3.amazonaws.com/${fullKey}`;
}

/**
 * Download file from S3
 */
export async function downloadFile(key: string): Promise<Buffer> {
  const s3Client = createS3Client();
  const { bucketName, folderPrefix } = getBucketConfig();
  
  const fullKey = folderPrefix ? `${folderPrefix}${key}` : key;
  
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fullKey,
  });
  
  const response = await s3Client.send(command);
  const chunks: any[] = [];
  
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}

/**
 * Delete file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  const s3Client = createS3Client();
  const { bucketName, folderPrefix } = getBucketConfig();
  
  const fullKey = folderPrefix ? `${folderPrefix}${key}` : key;
  
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fullKey,
  });
  
  await s3Client.send(command);
}

/**
 * Get signed URL for temporary access
 */
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const s3Client = createS3Client();
  const { bucketName, folderPrefix } = getBucketConfig();
  
  const fullKey = folderPrefix ? `${folderPrefix}${key}` : key;
  
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fullKey,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Rename file in S3
 */
export async function renameFile(oldKey: string, newKey: string): Promise<string> {
  // Download old file
  const buffer = await downloadFile(oldKey);
  
  // Upload with new key
  const contentType = getContentType(newKey);
  const newUrl = await uploadFile(buffer, newKey, contentType);
  
  // Delete old file
  await deleteFile(oldKey);
  
  return newUrl;
}

/**
 * Get content type from file extension
 */
function getContentType(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase();
  
  const types: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'pdf': 'application/pdf',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  
  return types[ext || ''] || 'application/octet-stream';
}
