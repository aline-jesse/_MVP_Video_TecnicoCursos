/**
 * 📤 API EXPORT SYSTEM - Integrada ao Workflow Unificado
 * Sistema de exportação de vídeos em múltiplos formatos
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { workflowManager } from '../../unified/route'
import { z } from 'zod'

// Schemas de validação
const ExportConfigSchema = z.object({
  projectId: z.string(),
  exportConfig: z.object({
    format: z.enum(['mp4', 'webm', 'mov', 'avi']).default('mp4'),
    quality: z.enum(['480p', '720p', '1080p', '4k']).default('1080p'),
    compression: z.enum(['low', 'medium', 'high']).default('medium'),
    includeSubtitles: z.boolean().default(false),
    watermark: z.object({
      enabled: z.boolean().default(false),
      text: z.string().optional(),
      position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right']).optional()
    }).optional(),
    metadata: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      author: z.string().optional(),
      tags: z.array(z.string()).optional()
    }).optional()
  }).optional()
})

// Interface para configuração de exportação
interface ExportConfig {
  format: string
  quality: string
  compression: string
  includeSubtitles: boolean
  watermark?: {
    enabled: boolean
    text?: string
    position?: string
  }
  metadata?: {
    title?: string
    description?: string
    author?: string
    tags?: string[]
  }
}

interface ExportJob {
  id: string
  projectId: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  progress: number
  config: ExportConfig
  outputUrl?: string
  downloadUrl?: string
  fileSize?: number
  errorMessage?: string
  startedAt: string
  completedAt?: string
}

class ExportSystem {
  private exportJobs: Map<string, ExportJob> = new Map()

  async startExport(projectId: string, config: ExportConfig): Promise<ExportJob> {
    try {
      const jobId = `export_${projectId}_${Date.now()}`
      
      const exportJob: ExportJob = {
        id: jobId,
        projectId,
        status: 'queued',
        progress: 0,
        config,
        startedAt: new Date().toISOString()
      }

      this.exportJobs.set(jobId, exportJob)

      // Iniciar processo de exportação em background
      this.processExportJob(jobId).catch(error => {
        console.error('Export job failed:', error)
        this.updateJobStatus(jobId, 'error', 0, error.message)
      })

      return exportJob

    } catch (error) {
      console.error('Error starting export:', error)
      throw new Error('Failed to start export job')
    }
  }

  private async processExportJob(jobId: string): Promise<void> {
    const job = this.exportJobs.get(jobId)
    if (!job) throw new Error('Export job not found')

    try {
      // Atualizar status para processing
      this.updateJobStatus(jobId, 'processing', 0)

      // Obter dados do projeto
      const project = await prisma.project.findUnique({
        where: { id: job.projectId }
      })

      if (!project) throw new Error('Project not found')

      // Verificar se o vídeo foi renderizado
      if (!project.metadata?.render?.outputUrl) {
        throw new Error('Project not rendered yet. Please render the video first.')
      }

      // Etapas da exportação
      await this.prepareExport(job, project.metadata)
      this.updateJobStatus(jobId, 'processing', 25)

      await this.processVideo(job, project.metadata)
      this.updateJobStatus(jobId, 'processing', 50)

      await this.addWatermark(job)
      this.updateJobStatus(jobId, 'processing', 75)

      const result = await this.finalizeExport(job)
      this.updateJobStatus(jobId, 'completed', 100, undefined, result.outputUrl, result.downloadUrl, result.fileSize)

      // Salvar resultado no banco
      await prisma.project.update({
        where: { id: job.projectId },
        data: {
          metadata: {
            ...project.metadata,
            export: {
              jobId,
              status: 'completed',
              outputUrl: result.outputUrl,
              downloadUrl: result.downloadUrl,
              fileSize: result.fileSize,
              completedAt: new Date().toISOString()
            }
          }
        }
      })

    } catch (error) {
      this.updateJobStatus(jobId, 'error', job.progress, error.message)
      throw error
    }
  }

  private updateJobStatus(
    jobId: string, 
    status: ExportJob['status'], 
    progress: number, 
    errorMessage?: string,
    outputUrl?: string,
    downloadUrl?: string,
    fileSize?: number
  ): void {
    const job = this.exportJobs.get(jobId)
    if (!job) return

    job.status = status
    job.progress = progress
    if (errorMessage) job.errorMessage = errorMessage
    if (outputUrl) job.outputUrl = outputUrl
    if (downloadUrl) job.downloadUrl = downloadUrl
    if (fileSize) job.fileSize = fileSize
    if (status === 'completed' || status === 'error') {
      job.completedAt = new Date().toISOString()
    }

    this.exportJobs.set(jobId, job)
  }

  private async prepareExport(job: ExportJob, metadata: any): Promise<void> {
    // Preparar arquivos para exportação
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Export prepared for job:', job.id)
  }

  private async processVideo(job: ExportJob, metadata: any): Promise<void> {
    // Processar vídeo de acordo com as configurações
    const renderOutput = metadata.render.outputUrl
    
    // Simular processamento com FFmpeg
    await this.simulateVideoProcessing(job, renderOutput)
  }

  private async simulateVideoProcessing(job: ExportJob, inputUrl: string): Promise<void> {
    const { format, quality, compression } = job.config
    
    // Simular comando FFmpeg para exportação
    const ffmpegCommand = this.buildExportCommand(inputUrl, job.config)
    console.log('Export FFmpeg command:', ffmpegCommand)
    
    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  private buildExportCommand(inputUrl: string, config: ExportConfig): string {
    let command = `ffmpeg -i "${inputUrl}"`
    
    // Configurações de qualidade
    const qualitySettings = this.getQualitySettings(config.quality, config.compression)
    command += ` ${qualitySettings}`
    
    // Formato de saída
    command += ` -f ${config.format}`
    
    // Metadados
    if (config.metadata) {
      if (config.metadata.title) command += ` -metadata title="${config.metadata.title}"`
      if (config.metadata.description) command += ` -metadata description="${config.metadata.description}"`
      if (config.metadata.author) command += ` -metadata author="${config.metadata.author}"`
    }
    
    command += ` output.${config.format}`
    
    return command
  }

  private getQualitySettings(quality: string, compression: string): string {
    const settings = {
      '480p': '-s 854x480',
      '720p': '-s 1280x720',
      '1080p': '-s 1920x1080',
      '4k': '-s 3840x2160'
    }

    const compressionSettings = {
      'low': '-crf 28',
      'medium': '-crf 23',
      'high': '-crf 18'
    }

    return `${settings[quality as keyof typeof settings]} ${compressionSettings[compression as keyof typeof compressionSettings]}`
  }

  private async addWatermark(job: ExportJob): Promise<void> {
    if (!job.config.watermark?.enabled) return

    // Simular adição de marca d'água
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Watermark added for job:', job.id)
  }

  private async finalizeExport(job: ExportJob): Promise<{ outputUrl: string, downloadUrl: string, fileSize: number }> {
    // Finalizar exportação e gerar URLs
    const outputUrl = `/api/export/output/${job.id}.${job.config.format}`
    const downloadUrl = `/api/export/download/${job.id}.${job.config.format}`
    
    // Simular tamanho do arquivo (MB)
    const fileSize = Math.floor(Math.random() * 100) + 50
    
    // Simular finalização
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return { outputUrl, downloadUrl, fileSize }
  }

  getExportJob(jobId: string): ExportJob | null {
    return this.exportJobs.get(jobId) || null
  }

  getProjectExportJobs(projectId: string): ExportJob[] {
    return Array.from(this.exportJobs.values()).filter(job => job.projectId === projectId)
  }

  async cancelExport(jobId: string): Promise<boolean> {
    const job = this.exportJobs.get(jobId)
    if (!job || job.status === 'completed') return false

    this.updateJobStatus(jobId, 'error', job.progress, 'Export cancelled by user')
    return true
  }

  async getExportFormats(): Promise<any[]> {
    return [
      {
        id: 'mp4',
        name: 'MP4',
        description: 'Formato mais compatível, recomendado para web e dispositivos móveis',
        extension: '.mp4',
        mimeType: 'video/mp4'
      },
      {
        id: 'webm',
        name: 'WebM',
        description: 'Formato otimizado para web, menor tamanho de arquivo',
        extension: '.webm',
        mimeType: 'video/webm'
      },
      {
        id: 'mov',
        name: 'MOV',
        description: 'Formato Apple QuickTime, alta qualidade',
        extension: '.mov',
        mimeType: 'video/quicktime'
      },
      {
        id: 'avi',
        name: 'AVI',
        description: 'Formato clássico, compatível com sistemas antigos',
        extension: '.avi',
        mimeType: 'video/x-msvideo'
      }
    ]
  }
}

const exportSystem = new ExportSystem()

// POST - Iniciar exportação
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = ExportConfigSchema.parse(body)

    // Verificar se o projeto existe e pertence ao usuário
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verificar se o projeto foi renderizado
    if (!project.metadata?.render?.outputUrl) {
      return NextResponse.json({ 
        error: 'Project not rendered yet. Please render the video first.' 
      }, { status: 400 })
    }

    // Atualizar workflow para "processing"
    await workflowManager.updateWorkflowStep(validatedData.projectId, 'export', 'processing')

    // Iniciar exportação
    const exportJob = await exportSystem.startExport(
      validatedData.projectId,
      validatedData.exportConfig || {
        format: 'mp4',
        quality: '1080p',
        compression: 'medium',
        includeSubtitles: false
      }
    )

    return NextResponse.json({
      success: true,
      exportJob,
      message: 'Export job started successfully'
    })

  } catch (error) {
    console.error('Export API Error:', error)
    
    // Atualizar workflow para "error"
    const body = await request.json().catch(() => ({}))
    if (body.projectId) {
      await workflowManager.updateWorkflowStep(body.projectId, 'export', 'error', { error: error.message })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Obter status da exportação ou formatos disponíveis
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const jobId = searchParams.get('jobId')
    const projectId = searchParams.get('projectId')

    if (action === 'formats') {
      const formats = await exportSystem.getExportFormats()
      return NextResponse.json({ formats })
    }

    if (jobId) {
      const exportJob = exportSystem.getExportJob(jobId)
      if (!exportJob) {
        return NextResponse.json({ error: 'Export job not found' }, { status: 404 })
      }

      return NextResponse.json({ exportJob })
    }

    if (projectId) {
      // Verificar se o projeto pertence ao usuário
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: session.user.id
        }
      })

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      const exportJobs = exportSystem.getProjectExportJobs(projectId)
      return NextResponse.json({ exportJobs })
    }

    return NextResponse.json({ error: 'Action, Job ID or Project ID required' }, { status: 400 })

  } catch (error) {
    console.error('Export GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Cancelar exportação
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    const cancelled = await exportSystem.cancelExport(jobId)
    
    if (!cancelled) {
      return NextResponse.json({ error: 'Cannot cancel export job' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Export job cancelled' 
    })

  } catch (error) {
    console.error('Export DELETE Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export { exportSystem }