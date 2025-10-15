/**
 * STORAGE SYSTEM - Implementação Real Completa
 * Sistema de upload e gerenciamento de arquivos com S3
 * 
 * Features:
 * - Upload para AWS S3
 * - Signed URLs
 * - Multipart upload (arquivos grandes)
 * - Compressão automática
 * - Validação de tipos
 * - Controle de quota por usuário
 * - Limpeza automática de arquivos temporários
 * - CDN integration
 * - Metadata e tags
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createReadStream, createWriteStream, statSync, unlinkSync } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip } from 'zlib';
import sharp from 'sharp';
import path from 'path';
import crypto from 'crypto';
import { prisma } from './prisma';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface UploadOptions {
  userId: string;
  file: File | Buffer | string; // File object, Buffer ou path
  folder?: string;
  filename?: string;
  compress?: boolean;
  optimize?: boolean; // Para imagens
  isPublic?: boolean;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
  contentType?: string;
}

export interface StorageFile {
  id: string;
  key: string;
  bucket: string;
  url: string;
  signedUrl?: string;
  size: number;
  contentType: string;
  metadata: Record<string, string>;
  tags: Record<string, string>;
  etag: string;
  uploadedAt: Date;
  expiresAt?: Date;
}

export interface StorageQuota {
  userId: string;
  used: number;
  limit: number;
  available: number;
  percentage: number;
  files: number;
}

export interface MultipartUpload {
  uploadId: string;
  key: string;
  parts: Array<{ partNumber: number; etag: string }>;
}

// ============================================
// CONFIGURAÇÃO S3
// ============================================

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  endpoint: process.env.AWS_ENDPOINT, // Para LocalStack ou MinIO
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'estudio-ia-videos';
const CDN_URL = process.env.CDN_URL || '';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '524288000'); // 500MB
const MULTIPART_THRESHOLD = 100 * 1024 * 1024; // 100MB
const DEFAULT_QUOTA = 5 * 1024 * 1024 * 1024; // 5GB por usuário

// ============================================
// STORAGE SYSTEM CLASS
// ============================================

export class StorageSystem {
  private bucket: string;
  private cdnUrl: string;

  constructor(bucket?: string, cdnUrl?: string) {
    this.bucket = bucket || BUCKET_NAME;
    this.cdnUrl = cdnUrl || CDN_URL;
  }

  // ========================================
  // UPLOAD SIMPLES
  // ========================================

  async upload(options: UploadOptions): Promise<StorageFile> {
    const { userId, file, folder = 'uploads', filename, compress = false, optimize = false, isPublic = false, metadata = {}, tags = {}, contentType } = options;

    // Validar quota
    await this.checkQuota(userId);

    // Processar arquivo
    let buffer: Buffer;
    let originalSize: number;
    let detectedContentType: string;

    if (typeof file === 'string') {
      // Path para arquivo
      buffer = await this.readFile(file);
      originalSize = statSync(file).size;
      detectedContentType = this.getContentType(file);
    } else if (file instanceof Buffer) {
      buffer = file;
      originalSize = buffer.length;
      detectedContentType = contentType || 'application/octet-stream';
    } else {
      // File object (browser)
      buffer = Buffer.from(await file.arrayBuffer());
      originalSize = file.size;
      detectedContentType = file.type || contentType || 'application/octet-stream';
    }

    // Validar tamanho
    if (originalSize > MAX_FILE_SIZE) {
      throw new Error(`File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Otimizar imagem se necessário
    if (optimize && this.isImage(detectedContentType)) {
      buffer = await this.optimizeImage(buffer, detectedContentType);
    }

    // Comprimir se necessário
    if (compress) {
      buffer = await this.compressFile(buffer);
      detectedContentType = 'application/gzip';
    }

    // Gerar key única
    const finalFilename = filename || this.generateFilename(detectedContentType);
    const key = `${folder}/${userId}/${Date.now()}-${finalFilename}`;

    // Upload para S3
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: detectedContentType,
      Metadata: {
        ...metadata,
        originalSize: originalSize.toString(),
        uploadedBy: userId,
      },
      Tagging: this.formatTags({ ...tags, userId }),
      ACL: isPublic ? 'public-read' : 'private',
    });

    const response = await s3Client.send(command);

    // Salvar no banco de dados
    const fileRecord = await prisma.storageFile.create({
      data: {
        key,
        bucket: this.bucket,
        size: buffer.length,
        originalSize,
        contentType: detectedContentType,
        metadata,
        tags,
        etag: response.ETag || '',
        userId,
        isPublic,
        isCompressed: compress,
        isOptimized: optimize,
      },
    });

    // Atualizar quota do usuário
    await this.updateQuota(userId, buffer.length);

    // Retornar informações do arquivo
    return {
      id: fileRecord.id,
      key,
      bucket: this.bucket,
      url: this.getPublicUrl(key),
      size: buffer.length,
      contentType: detectedContentType,
      metadata,
      tags,
      etag: response.ETag || '',
      uploadedAt: fileRecord.createdAt,
    };
  }

  // ========================================
  // MULTIPART UPLOAD (arquivos grandes)
  // ========================================

  async createMultipartUpload(options: Omit<UploadOptions, 'file'>): Promise<MultipartUpload> {
    const { userId, folder = 'uploads', filename, contentType = 'application/octet-stream', metadata = {}, tags = {} } = options;

    const key = `${folder}/${userId}/${Date.now()}-${filename}`;

    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      Metadata: {
        ...metadata,
        uploadedBy: userId,
      },
      Tagging: this.formatTags({ ...tags, userId }),
    });

    const response = await s3Client.send(command);

    return {
      uploadId: response.UploadId!,
      key,
      parts: [],
    };
  }

  async uploadPart(uploadId: string, key: string, partNumber: number, data: Buffer): Promise<string> {
    const command = new UploadPartCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: data,
    });

    const response = await s3Client.send(command);
    return response.ETag!;
  }

  async completeMultipartUpload(upload: MultipartUpload, userId: string): Promise<StorageFile> {
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucket,
      Key: upload.key,
      UploadId: upload.uploadId,
      MultipartUpload: {
        Parts: upload.parts.map(p => ({
          PartNumber: p.partNumber,
          ETag: p.etag,
        })),
      },
    });

    const response = await s3Client.send(command);

    // Obter informações do arquivo
    const headCommand = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: upload.key,
    });

    const headResponse = await s3Client.send(headCommand);

    // Salvar no banco de dados
    const fileRecord = await prisma.storageFile.create({
      data: {
        key: upload.key,
        bucket: this.bucket,
        size: headResponse.ContentLength || 0,
        originalSize: headResponse.ContentLength || 0,
        contentType: headResponse.ContentType || 'application/octet-stream',
        metadata: headResponse.Metadata || {},
        tags: {},
        etag: response.ETag || '',
        userId,
        isPublic: false,
      },
    });

    // Atualizar quota
    await this.updateQuota(userId, headResponse.ContentLength || 0);

    return {
      id: fileRecord.id,
      key: upload.key,
      bucket: this.bucket,
      url: this.getPublicUrl(upload.key),
      size: headResponse.ContentLength || 0,
      contentType: headResponse.ContentType || 'application/octet-stream',
      metadata: headResponse.Metadata || {},
      tags: {},
      etag: response.ETag || '',
      uploadedAt: fileRecord.createdAt,
    };
  }

  async abortMultipartUpload(uploadId: string, key: string): Promise<void> {
    const command = new AbortMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
    });

    await s3Client.send(command);
  }

  // ========================================
  // DOWNLOAD E SIGNED URLS
  // ========================================

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  async getSignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  async download(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await s3Client.send(command);
    const stream = response.Body as any;

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  // ========================================
  // DELETE
  // ========================================

  async delete(key: string, userId: string): Promise<void> {
    // Verificar permissão
    const file = await prisma.storageFile.findFirst({
      where: { key, userId },
    });

    if (!file) {
      throw new Error('File not found or unauthorized');
    }

    // Delete do S3
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await s3Client.send(command);

    // Atualizar quota
    await this.updateQuota(userId, -file.size);

    // Delete do banco
    await prisma.storageFile.delete({
      where: { id: file.id },
    });
  }

  async bulkDelete(keys: string[], userId: string): Promise<void> {
    for (const key of keys) {
      await this.delete(key, userId);
    }
  }

  // ========================================
  // LISTAGEM
  // ========================================

  async listUserFiles(userId: string, options?: { folder?: string; limit?: number; cursor?: string }): Promise<{ files: StorageFile[]; nextCursor?: string }> {
    const { folder, limit = 50, cursor } = options || {};

    const where: any = { userId };
    if (folder) {
      where.key = { startsWith: folder };
    }

    const files = await prisma.storageFile.findMany({
      where,
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = files.length > limit;
    const results = hasMore ? files.slice(0, -1) : files;

    return {
      files: results.map(f => ({
        id: f.id,
        key: f.key,
        bucket: f.bucket,
        url: this.getPublicUrl(f.key),
        size: f.size,
        contentType: f.contentType,
        metadata: f.metadata as Record<string, string>,
        tags: f.tags as Record<string, string>,
        etag: f.etag,
        uploadedAt: f.createdAt,
      })),
      nextCursor: hasMore ? results[results.length - 1].id : undefined,
    };
  }

  // ========================================
  // QUOTA MANAGEMENT
  // ========================================

  async checkQuota(userId: string): Promise<void> {
    const quota = await this.getQuota(userId);
    if (quota.used >= quota.limit) {
      throw new Error(`Storage quota exceeded. Used: ${this.formatBytes(quota.used)} / ${this.formatBytes(quota.limit)}`);
    }
  }

  async getQuota(userId: string): Promise<StorageQuota> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { storageFiles: true },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const used = await prisma.storageFile.aggregate({
      where: { userId },
      _sum: { size: true },
    });

    const totalUsed = used._sum.size || 0;
    const limit = user.storageQuota || DEFAULT_QUOTA;

    return {
      userId,
      used: totalUsed,
      limit,
      available: Math.max(0, limit - totalUsed),
      percentage: (totalUsed / limit) * 100,
      files: user._count.storageFiles,
    };
  }

  async updateQuota(userId: string, sizeChange: number): Promise<void> {
    // Quota é calculada dinamicamente, então não precisa atualizar
    // Mas podemos adicionar verificação aqui
    if (sizeChange > 0) {
      await this.checkQuota(userId);
    }
  }

  async setQuota(userId: string, newLimit: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { storageQuota: newLimit },
    });
  }

  // ========================================
  // LIMPEZA E MANUTENÇÃO
  // ========================================

  async cleanupExpiredFiles(): Promise<number> {
    const expiredFiles = await prisma.storageFile.findMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });

    for (const file of expiredFiles) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: file.key,
        });
        await s3Client.send(command);

        await prisma.storageFile.delete({
          where: { id: file.id },
        });

        await this.updateQuota(file.userId, -file.size);
      } catch (error) {
        console.error(`Error deleting expired file ${file.key}:`, error);
      }
    }

    return expiredFiles.length;
  }

  async cleanupOrphanedFiles(): Promise<number> {
    // Arquivos no S3 que não estão no banco
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      MaxKeys: 1000,
    });

    const response = await s3Client.send(command);
    const s3Keys = new Set((response.Contents || []).map(obj => obj.Key!));

    const dbKeys = await prisma.storageFile.findMany({
      select: { key: true },
    });

    const dbKeySet = new Set(dbKeys.map(f => f.key));

    let deleted = 0;
    for (const key of s3Keys) {
      if (!dbKeySet.has(key)) {
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
          });
          await s3Client.send(deleteCommand);
          deleted++;
        } catch (error) {
          console.error(`Error deleting orphaned file ${key}:`, error);
        }
      }
    }

    return deleted;
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  private async readFile(filePath: string): Promise<Buffer> {
    const { readFile } = await import('fs/promises');
    return await readFile(filePath);
  }

  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  private generateFilename(contentType: string): string {
    const ext = this.getExtension(contentType);
    const hash = crypto.randomBytes(16).toString('hex');
    return `${hash}${ext}`;
  }

  private getExtension(contentType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
      'application/pdf': '.pdf',
      'application/zip': '.zip',
      'application/json': '.json',
    };

    return extensions[contentType] || '';
  }

  private isImage(contentType: string): boolean {
    return contentType.startsWith('image/');
  }

  private async optimizeImage(buffer: Buffer, contentType: string): Promise<Buffer> {
    const sharpInstance = sharp(buffer);

    // Otimizar baseado no tipo
    if (contentType === 'image/jpeg') {
      return await sharpInstance.jpeg({ quality: 85, progressive: true }).toBuffer();
    } else if (contentType === 'image/png') {
      return await sharpInstance.png({ quality: 85, progressive: true }).toBuffer();
    } else if (contentType === 'image/webp') {
      return await sharpInstance.webp({ quality: 85 }).toBuffer();
    }

    return buffer;
  }

  private async compressFile(buffer: Buffer): Promise<Buffer> {
    const { promisify } = await import('util');
    const { gzip } = await import('zlib');
    const gzipAsync = promisify(gzip);
    return await gzipAsync(buffer) as Buffer;
  }

  private formatTags(tags: Record<string, string>): string {
    return Object.entries(tags)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  }

  private getPublicUrl(key: string): string {
    if (this.cdnUrl) {
      return `${this.cdnUrl}/${key}`;
    }
    return `https://${this.bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const storageSystem = new StorageSystem();

// ============================================
// EXEMPLO DE USO
// ============================================

/*
// Upload simples
const file = await storageSystem.upload({
  userId: 'user-123',
  file: buffer,
  folder: 'videos',
  filename: 'my-video.mp4',
  optimize: true,
  metadata: { project: 'project-123' },
});

// Upload multipart (arquivo grande)
const upload = await storageSystem.createMultipartUpload({
  userId: 'user-123',
  folder: 'videos',
  filename: 'large-video.mp4',
  contentType: 'video/mp4',
});

// Upload parts
const part1Etag = await storageSystem.uploadPart(upload.uploadId, upload.key, 1, chunk1);
const part2Etag = await storageSystem.uploadPart(upload.uploadId, upload.key, 2, chunk2);

upload.parts = [
  { partNumber: 1, etag: part1Etag },
  { partNumber: 2, etag: part2Etag },
];

// Complete
const file = await storageSystem.completeMultipartUpload(upload, 'user-123');

// Signed URL
const signedUrl = await storageSystem.getSignedUrl(file.key, 3600);

// Listar arquivos
const { files, nextCursor } = await storageSystem.listUserFiles('user-123', {
  folder: 'videos',
  limit: 20,
});

// Quota
const quota = await storageSystem.getQuota('user-123');
console.log(`Used: ${quota.used}/${quota.limit} (${quota.percentage}%)`);

// Limpeza
await storageSystem.cleanupExpiredFiles();
await storageSystem.cleanupOrphanedFiles();
*/
