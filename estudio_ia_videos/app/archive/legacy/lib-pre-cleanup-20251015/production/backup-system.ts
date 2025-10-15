
/**
 * 💾 Sistema de Backup Production-Ready
 * Backup automático de database e arquivos críticos
 */

import { productionLogger as logger, metricsCollector } from './logger'
import { S3StorageService } from '../s3-storage'
import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'

// Importação condicional do node-cron
let cron: any = null;
try {
  cron = require('node-cron');
} catch (error) {
  console.warn('⚠️ node-cron não instalado. Backups automáticos agendados desabilitados.');
}

interface BackupConfig {
  enabled: boolean
  schedule: string // Cron expression
  retentionDays: number
  s3Bucket?: string
  localPath?: string
  encryptionKey?: string
}

interface BackupResult {
  success: boolean
  backupId: string
  size: number
  duration: number
  location: string
  error?: string
}

class BackupSystem {
  private config: BackupConfig
  private isRunning: boolean = false
  
  constructor(config: BackupConfig) {
    this.config = {
      ...config,
      enabled: config.enabled !== undefined ? config.enabled : true,
      schedule: config.schedule || '0 2 * * *', // Todo dia às 2h da manhã
      retentionDays: config.retentionDays || 30,
      localPath: config.localPath || './backups'
    }
    
    if (this.config.enabled) {
      this.initializeScheduler()
    }
  }
  
  // Inicializar agendador de backup
  private initializeScheduler() {
    if (!cron) {
      logger.warn('Scheduler de backup não disponível (node-cron não instalado)');
      return;
    }

    logger.info('Initializing backup scheduler', {
      schedule: this.config.schedule,
      retentionDays: this.config.retentionDays
    })
    
    cron.schedule(this.config.schedule, async () => {
      await this.performFullBackup()
    })
    
    // Limpeza de backups antigos - diário às 3h
    cron.schedule('0 3 * * *', async () => {
      await this.cleanupOldBackups()
    })
  }
  
  // Backup completo
  async performFullBackup(): Promise<BackupResult[]> {
    if (this.isRunning) {
      logger.warn('Backup already running, skipping')
      return []
    }
    
    this.isRunning = true
    const startTime = Date.now()
    const backupId = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`
    
    logger.info('Starting full backup', { backupId })
    
    const results: BackupResult[] = []
    
    try {
      // 1. Backup do database
      const dbResult = await this.backupDatabase(backupId)
      results.push(dbResult)
      
      // 2. Backup de arquivos críticos
      const filesResult = await this.backupFiles(backupId)
      results.push(filesResult)
      
      // 3. Backup de configurações
      const configResult = await this.backupConfigurations(backupId)
      results.push(configResult)
      
      // 4. Backup de logs
      const logsResult = await this.backupLogs(backupId)
      results.push(logsResult)
      
      const totalDuration = Date.now() - startTime
      const successCount = results.filter(r => r.success).length
      
      logger.info('Full backup completed', {
        backupId,
        duration: totalDuration,
        totalBackups: results.length,
        successCount,
        failureCount: results.length - successCount
      })
      
      metricsCollector.timing('backup_full_duration', totalDuration)
      metricsCollector.increment('backup_completed', 1)
      
    } catch (error: any) {
      logger.error('Full backup failed', { backupId, error: error.message })
      metricsCollector.increment('backup_failed', 1)
    } finally {
      this.isRunning = false
    }
    
    return results
  }
  
  // Backup do database
  async backupDatabase(backupId: string): Promise<BackupResult> {
    const startTime = Date.now()
    
    try {
      if (!process.env.DATABASE_URL) {
        return {
          success: false,
          backupId,
          size: 0,
          duration: Date.now() - startTime,
          location: '',
          error: 'DATABASE_URL not configured'
        }
      }
      
      const backupPath = path.join(this.config.localPath || './backups', `${backupId}_database.sql`)
      
      // Criar diretório se não existir
      await fs.mkdir(path.dirname(backupPath), { recursive: true })
      
      // Executar pg_dump
      const result = await this.executePgDump(process.env.DATABASE_URL, backupPath)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      const stats = await fs.stat(backupPath)
      const size = stats.size
      
      // Upload para S3 se configurado
      let finalLocation = backupPath
      if (this.config.s3Bucket) {
        const s3Key = `backups/database/${backupId}_database.sql`
        const buffer = await fs.readFile(backupPath)
        
        const uploadResult = await S3StorageService.uploadFile(buffer, s3Key, 'application/sql')
        
        if (uploadResult.success && uploadResult.url) {
          finalLocation = uploadResult.url
          // Remover arquivo local após upload
          await fs.unlink(backupPath)
        }
      }
      
      const duration = Date.now() - startTime
      
      logger.info('Database backup completed', {
        backupId,
        size,
        duration,
        location: finalLocation
      })
      
      return {
        success: true,
        backupId,
        size,
        duration,
        location: finalLocation
      }
      
    } catch (error: any) {
      logger.error('Database backup failed', { backupId, error: error.message })
      
      return {
        success: false,
        backupId,
        size: 0,
        duration: Date.now() - startTime,
        location: '',
        error: error.message
      }
    }
  }
  
  // Executar pg_dump
  private async executePgDump(databaseUrl: string, outputPath: string): Promise<{success: boolean; error?: string}> {
    return new Promise((resolve) => {
      const pgDump = spawn('pg_dump', [databaseUrl, '-f', outputPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      })
      
      let errorOutput = ''
      
      pgDump.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })
      
      pgDump.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true })
        } else {
          resolve({ success: false, error: errorOutput || `pg_dump exited with code ${code}` })
        }
      })
      
      pgDump.on('error', (error) => {
        resolve({ success: false, error: error.message })
      })
      
      // Timeout de 10 minutos
      setTimeout(() => {
        pgDump.kill()
        resolve({ success: false, error: 'pg_dump timeout' })
      }, 10 * 60 * 1000)
    })
  }
  
  // Backup de arquivos críticos
  async backupFiles(backupId: string): Promise<BackupResult> {
    const startTime = Date.now()
    
    try {
      const filesToBackup = [
        '.env',
        'package.json',
        'next.config.js',
        'tailwind.config.js',
        'prisma/schema.prisma'
      ]
      
      const backupDir = path.join(this.config.localPath || './backups', `${backupId}_files`)
      await fs.mkdir(backupDir, { recursive: true })
      
      let totalSize = 0
      
      for (const file of filesToBackup) {
        try {
          const sourcePath = path.join(process.cwd(), file)
          const destPath = path.join(backupDir, file.replace('/', '_'))
          
          // Criar diretório se necessário
          await fs.mkdir(path.dirname(destPath), { recursive: true })
          
          // Copiar arquivo
          const content = await fs.readFile(sourcePath)
          await fs.writeFile(destPath, content)
          
          totalSize += content.length
        } catch (error) {
          logger.warn('Failed to backup file', { file, error: (error as Error).message })
        }
      }
      
      // Criar arquivo tar.gz
      const tarPath = `${backupDir}.tar.gz`
      await this.createTarGz(backupDir, tarPath)
      
      const stats = await fs.stat(tarPath)
      totalSize = stats.size
      
      // Upload para S3 se configurado
      let finalLocation = tarPath
      if (this.config.s3Bucket) {
        const s3Key = `backups/files/${backupId}_files.tar.gz`
        const buffer = await fs.readFile(tarPath)
        
        const uploadResult = await S3StorageService.uploadFile(buffer, s3Key, 'application/gzip')
        
        if (uploadResult.success && uploadResult.url) {
          finalLocation = uploadResult.url
          // Remover arquivos locais
          await fs.rm(backupDir, { recursive: true, force: true })
          await fs.unlink(tarPath)
        }
      }
      
      const duration = Date.now() - startTime
      
      logger.info('Files backup completed', {
        backupId,
        size: totalSize,
        duration,
        location: finalLocation
      })
      
      return {
        success: true,
        backupId,
        size: totalSize,
        duration,
        location: finalLocation
      }
      
    } catch (error: any) {
      logger.error('Files backup failed', { backupId, error: error.message })
      
      return {
        success: false,
        backupId,
        size: 0,
        duration: Date.now() - startTime,
        location: '',
        error: error.message
      }
    }
  }
  
  // Backup de configurações
  async backupConfigurations(backupId: string): Promise<BackupResult> {
    const startTime = Date.now()
    
    try {
      const configurations = {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
        nodeVersion: process.version,
        // Não incluir secrets, apenas estrutura
        envKeys: Object.keys(process.env).filter(key => 
          !key.includes('SECRET') && 
          !key.includes('PASSWORD') && 
          !key.includes('API_KEY')
        ),
        packageInfo: {
          name: 'estudio-ia-videos',
          version: '1.0.0'
        }
      }
      
      const configJson = JSON.stringify(configurations, null, 2)
      const backupPath = path.join(this.config.localPath || './backups', `${backupId}_config.json`)
      
      await fs.mkdir(path.dirname(backupPath), { recursive: true })
      await fs.writeFile(backupPath, configJson)
      
      const size = Buffer.byteLength(configJson)
      
      // Upload para S3 se configurado
      let finalLocation = backupPath
      if (this.config.s3Bucket) {
        const s3Key = `backups/config/${backupId}_config.json`
        const buffer = Buffer.from(configJson)
        
        const uploadResult = await S3StorageService.uploadFile(buffer, s3Key, 'application/json')
        
        if (uploadResult.success && uploadResult.url) {
          finalLocation = uploadResult.url
          await fs.unlink(backupPath)
        }
      }
      
      const duration = Date.now() - startTime
      
      return {
        success: true,
        backupId,
        size,
        duration,
        location: finalLocation
      }
      
    } catch (error: any) {
      return {
        success: false,
        backupId,
        size: 0,
        duration: Date.now() - startTime,
        location: '',
        error: error.message
      }
    }
  }
  
  // Backup de logs
  async backupLogs(backupId: string): Promise<BackupResult> {
    const startTime = Date.now()
    
    try {
      const logDir = process.env.LOG_DIR || './logs'
      const backupPath = path.join(this.config.localPath || './backups', `${backupId}_logs.tar.gz`)
      
      // Verificar se diretório de logs existe
      try {
        await fs.access(logDir)
      } catch {
        // Sem logs para backup
        return {
          success: true,
          backupId,
          size: 0,
          duration: Date.now() - startTime,
          location: 'no-logs'
        }
      }
      
      // Criar tar.gz dos logs
      await this.createTarGz(logDir, backupPath)
      
      const stats = await fs.stat(backupPath)
      const size = stats.size
      
      // Upload para S3 se configurado
      let finalLocation = backupPath
      if (this.config.s3Bucket) {
        const s3Key = `backups/logs/${backupId}_logs.tar.gz`
        const buffer = await fs.readFile(backupPath)
        
        const uploadResult = await S3StorageService.uploadFile(buffer, s3Key, 'application/gzip')
        
        if (uploadResult.success && uploadResult.url) {
          finalLocation = uploadResult.url
          await fs.unlink(backupPath)
        }
      }
      
      const duration = Date.now() - startTime
      
      return {
        success: true,
        backupId,
        size,
        duration,
        location: finalLocation
      }
      
    } catch (error: any) {
      return {
        success: false,
        backupId,
        size: 0,
        duration: Date.now() - startTime,
        location: '',
        error: error.message
      }
    }
  }
  
  // Criar arquivo tar.gz
  private async createTarGz(sourceDir: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tar = spawn('tar', ['-czf', outputPath, '-C', path.dirname(sourceDir), path.basename(sourceDir)], {
        stdio: ['pipe', 'pipe', 'pipe']
      })
      
      let errorOutput = ''
      
      tar.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })
      
      tar.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(errorOutput || `tar exited with code ${code}`))
        }
      })
      
      tar.on('error', (error) => {
        reject(error)
      })
    })
  }
  
  // Limpeza de backups antigos
  async cleanupOldBackups(): Promise<void> {
    try {
      logger.info('Starting backup cleanup', { retentionDays: this.config.retentionDays })
      
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays)
      
      // Limpeza local
      if (this.config.localPath) {
        await this.cleanupLocalBackups(cutoffDate)
      }
      
      // Limpeza S3
      if (this.config.s3Bucket) {
        await this.cleanupS3Backups(cutoffDate)
      }
      
      logger.info('Backup cleanup completed')
      
    } catch (error: any) {
      logger.error('Backup cleanup failed', { error: error.message })
    }
  }
  
  // Limpeza local
  private async cleanupLocalBackups(cutoffDate: Date): Promise<void> {
    try {
      const backupDir = this.config.localPath || './backups'
      const files = await fs.readdir(backupDir)
      
      let deletedCount = 0
      
      for (const file of files) {
        const filePath = path.join(backupDir, file)
        const stats = await fs.stat(filePath)
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath)
          deletedCount++
          logger.debug('Deleted old backup', { file, age: stats.mtime })
        }
      }
      
      logger.info('Local backup cleanup completed', { deletedCount })
      
    } catch (error: any) {
      logger.error('Local backup cleanup failed', { error: error.message })
    }
  }
  
  // Limpeza S3
  private async cleanupS3Backups(cutoffDate: Date): Promise<void> {
    try {
      // Implementar limpeza S3
      logger.info('S3 backup cleanup - not implemented yet')
    } catch (error: any) {
      logger.error('S3 backup cleanup failed', { error: error.message })
    }
  }
  
  // Backup manual
  async manualBackup(type: 'database' | 'files' | 'config' | 'logs' | 'full'): Promise<BackupResult[]> {
    const backupId = `manual_${type}_${new Date().toISOString().replace(/[:.]/g, '-')}`
    
    logger.info('Starting manual backup', { type, backupId })
    
    switch (type) {
      case 'database':
        return [await this.backupDatabase(backupId)]
      
      case 'files':
        return [await this.backupFiles(backupId)]
      
      case 'config':
        return [await this.backupConfigurations(backupId)]
      
      case 'logs':
        return [await this.backupLogs(backupId)]
      
      case 'full':
        return await this.performFullBackup()
      
      default:
        throw new Error(`Unknown backup type: ${type}`)
    }
  }
  
  // Estatísticas de backup
  getStats() {
    return {
      enabled: this.config.enabled,
      schedule: this.config.schedule,
      retentionDays: this.config.retentionDays,
      isRunning: this.isRunning,
      lastRun: 'tracking-not-implemented' // TODO: implementar tracking
    }
  }
}

// Criar instância global
const backupConfig: BackupConfig = {
  enabled: process.env.BACKUP_ENABLED === 'true' || process.env.NODE_ENV === 'production',
  schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // 2h da manhã
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  s3Bucket: process.env.BACKUP_S3_BUCKET,
  localPath: process.env.BACKUP_LOCAL_PATH || './backups'
}

export const backupSystem = new BackupSystem(backupConfig)

export { BackupSystem, type BackupConfig, type BackupResult }
