

/**
 * AWS Configuration for S3 Upload
 */

export const UPLOAD_CONFIG = {
  allowedTypes: ['.pptx', '.ppt', '.pdf', '.docx'],
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
}

// AWS S3 Configuration
export function getBucketConfig() {
  return {
    bucketName: process.env.AWS_BUCKET_NAME || 'estudio-ia-videos-uploads',
    folderPrefix: process.env.AWS_FOLDER_PREFIX || 'pptx-uploads/'
  }
}

// S3 Client Factory
import { S3Client } from "@aws-sdk/client-s3"

export function createS3Client() {
  // Use the configured region from environment
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-west-2'
  
  // For hosted environment, use AWS profile authentication
  if (process.env.AWS_PROFILE) {
    return new S3Client({ 
      region 
    })
  }
  
  // Fallback to explicit credentials if provided
  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  })
}

