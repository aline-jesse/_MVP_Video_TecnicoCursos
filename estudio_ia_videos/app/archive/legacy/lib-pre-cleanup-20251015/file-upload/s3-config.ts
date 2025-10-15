

// Mock S3 configuration for TTS system testing
export interface S3Config {
  bucketName: string
  region: string
  folderPrefix: string
}

export interface UploadResult {
  url: string
  key: string
  fileName: string
  fileSize: number
}

export function getBucketConfig(): S3Config {
  return {
    bucketName: process.env.AWS_BUCKET_NAME || 'demo-bucket',
    region: process.env.AWS_REGION || 'us-east-1',
    folderPrefix: process.env.AWS_FOLDER_PREFIX || 'uploads/'
  }
}

export function createS3Client() {
  // Mock S3 client for demo
  return {
    send: async () => ({ Key: 'demo-key' })
  }
}

export async function uploadFileToS3(
  buffer: Buffer,
  fileName: string,
  contentType?: string,
  folder?: string
): Promise<UploadResult> {
  // Mock implementation for demo
  const config = getBucketConfig()
  const key = `${config.folderPrefix}${folder ? folder + '/' : ''}${fileName}`
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    url: `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`,
    key,
    fileName,
    fileSize: buffer.length
  }
}

