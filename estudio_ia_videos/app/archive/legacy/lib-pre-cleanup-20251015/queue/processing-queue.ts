
import { prisma } from '@/lib/database/prisma'

export type QueueJobType = 'video_export' | 'voice_training' | 'ai_generation' | 'avatar_render'

export interface QueueJob {
  id?: string
  type: QueueJobType
  payload: any
  priority?: number
  maxAttempts?: number
  delay?: number
}

export interface JobResult {
  success: boolean
  result?: any
  error?: string
}

class ProcessingQueue {
  private workers = new Map<string, NodeJS.Timeout>()
  private isProcessing = false

  async addJob(job: QueueJob): Promise<string> {
    try {
      const queueItem = await prisma.processingQueue.create({
        data: {
          jobType: job.type,
          jobData: job.payload,
          priority: job.priority || 1,
          maxAttempts: job.maxAttempts || 3,
          status: 'pending'
        }
      })

      // Start processing if not already running
      if (!this.isProcessing) {
        this.startProcessing()
      }

      return queueItem.id

    } catch (error) {
      console.error('Error adding job to queue:', error)
      throw new Error('Failed to add job to queue')
    }
  }

  private async startProcessing() {
    if (this.isProcessing) return

    this.isProcessing = true

    try {
      while (true) {
        const job = await this.getNextJob()
        
        if (!job) {
          // No jobs available, wait a bit
          await new Promise(resolve => setTimeout(resolve, 5000))
          continue
        }

        await this.processJob(job)
      }
    } catch (error) {
      console.error('Processing queue error:', error)
    } finally {
      this.isProcessing = false
    }
  }

  private async getNextJob(): Promise<any> {
    try {
      const job = await prisma.processingQueue.findFirst({
        where: {
          status: 'pending',
          attempts: {
            lt: 3  // Default max attempts
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      })

      return job
    } catch (error) {
      console.error('Error getting next job:', error)
      return null
    }
  }

  private async processJob(job: any) {
    try {
      // Mark job as processing
      await prisma.processingQueue.update({
        where: { id: job.id },
        data: {
          status: 'processing',
          startedAt: new Date(),
          attempts: (job.attempts || 0) + 1
        }
      })

      let result: JobResult

      // Process based on job type
      switch (job.type) {
        case 'video_export':
          result = await this.processVideoExport(job.payload)
          break
        case 'voice_training':
          result = await this.processVoiceTraining(job.payload)
          break
        case 'ai_generation':
          result = await this.processAIGeneration(job.payload)
          break
        case 'avatar_render':
          result = await this.processAvatarRender(job.payload)
          break
        default:
          result = { success: false, error: 'Unknown job type' }
      }

      // Update job with result
      if (result.success) {
        await prisma.processingQueue.update({
          where: { id: job.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            result: result.result
          }
        })
      } else {
        // Check if should retry
        const shouldRetry = job.attempts < job.maxAttempts

        await prisma.processingQueue.update({
          where: { id: job.id },
          data: {
            status: shouldRetry ? 'queued' : 'error',
            errorMessage: result.error || 'Unknown error',
            ...(shouldRetry ? {} : { completedAt: new Date() })
          }
        })
      }

    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error)
      
      await prisma.processingQueue.update({
        where: { id: job.id },
        data: {
          status: 'error',
          errorMessage: (error as Error).message,
          completedAt: new Date()
        }
      })
    }
  }

  private async processVideoExport(payload: any): Promise<JobResult> {
    try {
      // Import video renderer and process
      const { videoRenderer } = await import('@/lib/video/video-renderer')
      
      // Simulate video processing
      await new Promise(resolve => setTimeout(resolve, 10000)) // 10 seconds
      
      return {
        success: true,
        result: {
          videoUrl: '/processed/video.mp4',
          duration: 120,
          fileSize: 25600000
        }
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  private async processVoiceTraining(payload: any): Promise<JobResult> {
    try {
      // Simulate voice training process
      await new Promise(resolve => setTimeout(resolve, 30000)) // 30 seconds
      
      return {
        success: true,
        result: {
          voiceModelUrl: '/voices/trained/model.json',
          quality: 0.85 + Math.random() * 0.1
        }
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  private async processAIGeneration(payload: any): Promise<JobResult> {
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 5000)) // 5 seconds
      
      return {
        success: true,
        result: {
          generatedContent: payload.prompt + ' [AI Generated]',
          tokens: payload.prompt.length * 2,
          quality: 0.9
        }
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  private async processAvatarRender(payload: any): Promise<JobResult> {
    try {
      // Simulate avatar rendering
      await new Promise(resolve => setTimeout(resolve, 15000)) // 15 seconds
      
      return {
        success: true,
        result: {
          renderedSceneUrl: '/avatars/rendered/scene.mp4',
          duration: payload.duration || 60
        }
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  async getJobStatus(jobId: string) {
    return prisma.processingQueue.findUnique({
      where: { id: jobId }
    })
  }

  async getQueueStats() {
    const stats = await prisma.processingQueue.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const result = {
      queued: 0,
      processing: 0,
      completed: 0,
      error: 0,
      total: 0
    }

    stats.forEach((stat: any) => {
      result[stat.status as keyof typeof result] = stat._count.id
      result.total += stat._count.id
    })

    return result
  }

  async clearCompletedJobs(olderThanHours = 24) {
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    
    return prisma.processingQueue.deleteMany({
      where: {
        status: 'completed',
        completedAt: {
          lt: cutoffDate
        }
      }
    })
  }
}

export const processingQueue = new ProcessingQueue()
