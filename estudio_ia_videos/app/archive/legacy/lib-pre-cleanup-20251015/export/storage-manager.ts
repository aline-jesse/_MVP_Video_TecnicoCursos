/**
 * Storage Manager
 * Gerencia armazenamento de vídeos exportados (Supabase + fallback local)
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'

export interface StorageConfig {
  provider: 'supabase' | 'local'
  supabaseUrl?: string
  supabaseKey?: string
  localPath?: string
}

export interface UploadResult {
  url: string
  publicUrl?: string
  signedUrl?: string
  fileSize: number
  bucket?: string
  path?: string
}

export class StorageManager {
  private config: StorageConfig
  private supabase?: any

  constructor(config: StorageConfig) {
    this.config = config

    if (config.provider === 'supabase' && config.supabaseUrl && config.supabaseKey) {
      this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
      console.log('[StorageManager] Supabase client initialized')
    } else {
      console.log('[StorageManager] Using local storage')
    }
  }

  /**
   * Upload de vídeo exportado
   */
  async uploadExport(
    filePath: string,
    userId: string,
    projectId: string,
    filename: string
  ): Promise<UploadResult> {
    const fileStats = await fs.stat(filePath)

    if (this.config.provider === 'supabase' && this.supabase) {
      return this.uploadToSupabase(filePath, userId, projectId, filename, fileStats.size)
    } else {
      return this.uploadToLocal(filePath, userId, projectId, filename, fileStats.size)
    }
  }

  /**
   * Upload para Supabase Storage
   */
  private async uploadToSupabase(
    filePath: string,
    userId: string,
    projectId: string,
    filename: string,
    fileSize: number
  ): Promise<UploadResult> {
    try {
      const fileBuffer = await fs.readFile(filePath)
      const storagePath = `exports/${userId}/${projectId}/${filename}`
      const bucket = 'videos' // Bucket configurado no Supabase

      // Upload
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(storagePath, fileBuffer, {
          contentType: this.getContentType(filename),
          upsert: true,
        })

      if (error) {
        throw new Error(`Supabase upload error: ${error.message}`)
      }

      // Obter URL pública
      const { data: publicUrlData } = this.supabase.storage.from(bucket).getPublicUrl(storagePath)

      // Obter URL assinada (7 dias)
      const { data: signedUrlData, error: signedError } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(storagePath, 60 * 60 * 24 * 7)

      console.log(`[StorageManager] Uploaded to Supabase: ${storagePath}`)

      return {
        url: publicUrlData.publicUrl,
        publicUrl: publicUrlData.publicUrl,
        signedUrl: signedUrlData?.signedUrl,
        fileSize,
        bucket,
        path: storagePath,
      }
    } catch (error) {
      console.error('[StorageManager] Supabase upload failed:', error)
      // Fallback para local
      console.log('[StorageManager] Falling back to local storage')
      return this.uploadToLocal(filePath, userId, projectId, filename, fileSize)
    }
  }

  /**
   * Upload para sistema de arquivos local
   */
  private async uploadToLocal(
    filePath: string,
    userId: string,
    projectId: string,
    filename: string,
    fileSize: number
  ): Promise<UploadResult> {
    const localDir = this.config.localPath || path.join(process.cwd(), 'public', 'exports', userId)
    await fs.mkdir(localDir, { recursive: true })

    const destPath = path.join(localDir, filename)
    await fs.copyFile(filePath, destPath)

    const url = `/exports/${userId}/${filename}`
    console.log(`[StorageManager] Uploaded to local: ${destPath}`)

    return {
      url,
      fileSize,
      path: destPath,
    }
  }

  /**
   * Delete vídeo exportado
   */
  async deleteExport(exportPath: string): Promise<boolean> {
    if (this.config.provider === 'supabase' && this.supabase) {
      return this.deleteFromSupabase(exportPath)
    } else {
      return this.deleteFromLocal(exportPath)
    }
  }

  /**
   * Delete do Supabase
   */
  private async deleteFromSupabase(storagePath: string): Promise<boolean> {
    try {
      const bucket = 'videos'
      const { error } = await this.supabase.storage.from(bucket).remove([storagePath])

      if (error) {
        console.error('[StorageManager] Supabase delete error:', error)
        return false
      }

      console.log(`[StorageManager] Deleted from Supabase: ${storagePath}`)
      return true
    } catch (error) {
      console.error('[StorageManager] Delete failed:', error)
      return false
    }
  }

  /**
   * Delete do local
   */
  private async deleteFromLocal(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath)
      console.log(`[StorageManager] Deleted from local: ${filePath}`)
      return true
    } catch (error) {
      console.error('[StorageManager] Delete failed:', error)
      return false
    }
  }

  /**
   * Cleanup de exports antigos (mais de 7 dias)
   */
  async cleanupOldExports(userId: string, days: number = 7): Promise<number> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    let deleted = 0

    if (this.config.provider === 'supabase' && this.supabase) {
      deleted = await this.cleanupSupabase(userId, cutoffDate)
    } else {
      deleted = await this.cleanupLocal(userId, cutoffDate)
    }

    console.log(`[StorageManager] Cleaned up ${deleted} old exports for user ${userId}`)
    return deleted
  }

  /**
   * Cleanup Supabase
   */
  private async cleanupSupabase(userId: string, cutoffDate: Date): Promise<number> {
    try {
      const bucket = 'videos'
      const prefix = `exports/${userId}/`

      const { data: files, error } = await this.supabase.storage.from(bucket).list(prefix)

      if (error || !files) return 0

      const toDelete = files
        .filter((file: any) => new Date(file.created_at) < cutoffDate)
        .map((file: any) => `${prefix}${file.name}`)

      if (toDelete.length === 0) return 0

      const { error: deleteError } = await this.supabase.storage.from(bucket).remove(toDelete)

      if (deleteError) {
        console.error('[StorageManager] Cleanup error:', deleteError)
        return 0
      }

      return toDelete.length
    } catch (error) {
      console.error('[StorageManager] Cleanup failed:', error)
      return 0
    }
  }

  /**
   * Cleanup local
   */
  private async cleanupLocal(userId: string, cutoffDate: Date): Promise<number> {
    try {
      const localDir = path.join(process.cwd(), 'public', 'exports', userId)
      const files = await fs.readdir(localDir)

      let deleted = 0
      for (const file of files) {
        const filePath = path.join(localDir, file)
        const stats = await fs.stat(filePath)

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath)
          deleted++
        }
      }

      return deleted
    } catch (error) {
      console.error('[StorageManager] Cleanup failed:', error)
      return 0
    }
  }

  /**
   * Obtém content type por extensão
   */
  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase()
    const contentTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
    }
    return contentTypes[ext] || 'application/octet-stream'
  }

  /**
   * Obtém storage statistics
   */
  async getStorageStats(userId: string): Promise<{
    totalFiles: number
    totalSize: number
    oldestFile?: Date
    newestFile?: Date
  }> {
    if (this.config.provider === 'supabase' && this.supabase) {
      return this.getSupabaseStats(userId)
    } else {
      return this.getLocalStats(userId)
    }
  }

  /**
   * Stats do Supabase
   */
  private async getSupabaseStats(userId: string): Promise<any> {
    try {
      const bucket = 'videos'
      const prefix = `exports/${userId}/`

      const { data: files } = await this.supabase.storage.from(bucket).list(prefix)

      if (!files || files.length === 0) {
        return { totalFiles: 0, totalSize: 0 }
      }

      const totalSize = files.reduce((sum: number, file: any) => sum + (file.metadata?.size || 0), 0)
      const dates = files.map((f: any) => new Date(f.created_at))

      return {
        totalFiles: files.length,
        totalSize,
        oldestFile: new Date(Math.min(...dates.map((d) => d.getTime()))),
        newestFile: new Date(Math.max(...dates.map((d) => d.getTime()))),
      }
    } catch (error) {
      console.error('[StorageManager] Stats failed:', error)
      return { totalFiles: 0, totalSize: 0 }
    }
  }

  /**
   * Stats do local
   */
  private async getLocalStats(userId: string): Promise<any> {
    try {
      const localDir = path.join(process.cwd(), 'public', 'exports', userId)
      const files = await fs.readdir(localDir)

      if (files.length === 0) {
        return { totalFiles: 0, totalSize: 0 }
      }

      let totalSize = 0
      const dates: Date[] = []

      for (const file of files) {
        const stats = await fs.stat(path.join(localDir, file))
        totalSize += stats.size
        dates.push(stats.mtime)
      }

      return {
        totalFiles: files.length,
        totalSize,
        oldestFile: new Date(Math.min(...dates.map((d) => d.getTime()))),
        newestFile: new Date(Math.max(...dates.map((d) => d.getTime()))),
      }
    } catch (error) {
      return { totalFiles: 0, totalSize: 0 }
    }
  }
}

// Factory function
export function createStorageManager(config?: Partial<StorageConfig>): StorageManager {
  const defaultConfig: StorageConfig = {
    provider: process.env.STORAGE_PROVIDER === 'supabase' ? 'supabase' : 'local',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_KEY,
    localPath: path.join(process.cwd(), 'public', 'exports'),
  }

  return new StorageManager({ ...defaultConfig, ...config })
}
