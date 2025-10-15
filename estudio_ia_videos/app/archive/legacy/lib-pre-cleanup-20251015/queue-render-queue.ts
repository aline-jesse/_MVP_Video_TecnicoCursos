/**
 * 🎬 Render Queue System
 * 
 * Sistema de fila para trabalhos de renderização
 */

import { logger } from '@/lib/utils'
import { renderJobManager, RenderJob } from '../render/job-manager'

export interface QueueJob {
  id: string
  jobId: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  addedAt: Date
  estimatedProcessingTime?: number
  dependencies?: string[]
}

export interface QueueStats {
  totalJobs: number
  processingJobs: number
  waitingJobs: number
  averageWaitTime: number
  throughput: number // jobs per hour
  queueByPriority: Record<string, number>
}

export class RenderQueue {
  private queue: QueueJob[] = []
  private processing: Set<string> = new Set()
  private completed: Map<string, Date> = new Map()
  private maxConcurrent = 3

  // Add job to queue
  async addJob(
    jobId: string,
    priority: QueueJob['priority'] = 'normal',
    estimatedProcessingTime?: number,
    dependencies?: string[]
  ): Promise<QueueJob> {
    const queueJob: QueueJob = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobId,
      priority,
      addedAt: new Date(),
      estimatedProcessingTime,
      dependencies
    }

    // Insert job in priority order
    this.insertJobByPriority(queueJob)

    logger.info(`Job added to render queue: ${jobId}`, {
      queueId: queueJob.id,
      priority,
      queuePosition: this.getJobPosition(queueJob.id)
    })

    // Try to process next job
    await this.processNext()

    return queueJob
  }

  // Remove job from queue
  async removeJob(queueId: string): Promise<boolean> {
    const index = this.queue.findIndex(job => job.id === queueId)
    if (index === -1) return false

    const job = this.queue[index]
    this.queue.splice(index, 1)
    this.processing.delete(job.jobId)

    logger.info(`Job removed from render queue: ${job.jobId}`)
    
    // Try to process next job
    await this.processNext()

    return true
  }

  // Get job position in queue
  getJobPosition(queueId: string): number {
    const index = this.queue.findIndex(job => job.id === queueId && !this.processing.has(job.jobId))
    return index === -1 ? -1 : index + 1
  }

  // Get queue status
  async getQueueStatus(): Promise<QueueStats> {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    // Calculate average wait time
    const completedJobs = Array.from(this.completed.entries())
      .filter(([_, completedAt]) => completedAt >= last24h)
    
    const averageWaitTime = completedJobs.length > 0
      ? completedJobs.reduce((sum, [jobId, completedAt]) => {
          const queueJob = this.queue.find(q => q.jobId === jobId)
          if (queueJob) {
            return sum + (completedAt.getTime() - queueJob.addedAt.getTime())
          }
          return sum
        }, 0) / completedJobs.length
      : 0

    // Calculate throughput (jobs per hour)
    const throughput = completedJobs.length * (60 * 60 * 1000) / (24 * 60 * 60 * 1000)

    const queueByPriority: Record<string, number> = {
      low: 0,
      normal: 0,
      high: 0,
      urgent: 0
    }

    for (const job of this.queue) {
      if (!this.processing.has(job.jobId)) {
        queueByPriority[job.priority]++
      }
    }

    return {
      totalJobs: this.queue.length,
      processingJobs: this.processing.size,
      waitingJobs: this.queue.length - this.processing.size,
      averageWaitTime,
      throughput,
      queueByPriority
    }
  }

  // Get estimated wait time for job
  async getEstimatedWaitTime(queueId: string): Promise<number> {
    const jobIndex = this.queue.findIndex(job => job.id === queueId)
    if (jobIndex === -1) return 0

    let estimatedTime = 0
    
    // Add estimated processing time for jobs ahead in queue
    for (let i = 0; i < jobIndex; i++) {
      const job = this.queue[i]
      if (!this.processing.has(job.jobId)) {
        estimatedTime += job.estimatedProcessingTime || 300000 // Default 5 minutes
      }
    }

    // Account for concurrent processing
    estimatedTime = estimatedTime / this.maxConcurrent

    return estimatedTime
  }

  // Get jobs waiting for dependencies
  async getJobsWaitingForDependencies(): Promise<QueueJob[]> {
    return this.queue.filter(job => {
      if (!job.dependencies || job.dependencies.length === 0) return false
      
      // Check if all dependencies are completed
      return job.dependencies.some(depJobId => !this.completed.has(depJobId))
    })
  }

  // Process next job in queue
  private async processNext(): Promise<void> {
    if (this.processing.size >= this.maxConcurrent) {
      return // Already at capacity
    }

    // Find next job that can be processed (no pending dependencies)
    const nextJob = this.queue.find(job => {
      if (this.processing.has(job.jobId)) return false
      
      // Check dependencies
      if (job.dependencies && job.dependencies.length > 0) {
        return job.dependencies.every(depJobId => this.completed.has(depJobId))
      }
      
      return true
    })

    if (!nextJob) return

    // Mark as processing
    this.processing.add(nextJob.jobId)

    logger.info(`Starting to process job from queue: ${nextJob.jobId}`)

    try {
      // Get the actual render job
      const renderJob = await renderJobManager.getJob(nextJob.jobId)
      if (!renderJob) {
        throw new Error('Render job not found')
      }

      // Start processing
      await this.processJob(renderJob, nextJob)

    } catch (error) {
      logger.error(`Queue processing failed for job: ${nextJob.jobId}`, error)
      this.processing.delete(nextJob.jobId)
      
      // Remove from queue
      const index = this.queue.findIndex(job => job.id === nextJob.id)
      if (index !== -1) {
        this.queue.splice(index, 1)
      }

      // Try to process next job
      await this.processNext()
    }
  }

  // Process individual job
  private async processJob(renderJob: RenderJob, queueJob: QueueJob): Promise<void> {
    try {
      // Monitor job status
      const checkInterval = setInterval(async () => {
        const updatedJob = await renderJobManager.getJob(renderJob.id)
        if (!updatedJob) {
          clearInterval(checkInterval)
          return
        }

        if (updatedJob.status === 'completed' || updatedJob.status === 'failed' || updatedJob.status === 'cancelled') {
          clearInterval(checkInterval)
          
          // Mark as completed
          this.completed.set(renderJob.id, new Date())
          this.processing.delete(renderJob.id)
          
          // Remove from queue
          const index = this.queue.findIndex(job => job.id === queueJob.id)
          if (index !== -1) {
            this.queue.splice(index, 1)
          }

          logger.info(`Job completed in queue: ${renderJob.id}`, {
            status: updatedJob.status,
            progress: updatedJob.progress
          })

          // Process next job
          await this.processNext()
        }
      }, 1000) // Check every second

      // Set timeout to prevent infinite processing
      setTimeout(() => {
        clearInterval(checkInterval)
        this.processing.delete(renderJob.id)
        
        // Remove from queue
        const index = this.queue.findIndex(job => job.id === queueJob.id)
        if (index !== -1) {
          this.queue.splice(index, 1)
        }

        logger.warn(`Job timed out in queue: ${renderJob.id}`)
        
        // Process next job
        this.processNext()
      }, 30 * 60 * 1000) // 30 minutes timeout

    } catch (error) {
      logger.error(`Error processing job in queue: ${renderJob.id}`, error)
      this.processing.delete(renderJob.id)
      
      // Remove from queue
      const index = this.queue.findIndex(job => job.id === queueJob.id)
      if (index !== -1) {
        this.queue.splice(index, 1)
      }

      // Process next job
      await this.processNext()
    }
  }

  // Insert job in queue based on priority
  private insertJobByPriority(job: QueueJob): void {
    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
    const jobPriority = priorityOrder[job.priority]

    let insertIndex = this.queue.length

    for (let i = 0; i < this.queue.length; i++) {
      const existingJob = this.queue[i]
      const existingPriority = priorityOrder[existingJob.priority]

      if (jobPriority > existingPriority) {
        insertIndex = i
        break
      } else if (jobPriority === existingPriority && job.addedAt < existingJob.addedAt) {
        insertIndex = i
        break
      }
    }

    this.queue.splice(insertIndex, 0, job)
  }

  // Cleanup old completed jobs tracking
  async cleanup(): Promise<void> {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    const toDelete: string[] = []

    for (const [jobId, completedAt] of this.completed.entries()) {
      if (completedAt < cutoffDate) {
        toDelete.push(jobId)
      }
    }

    for (const jobId of toDelete) {
      this.completed.delete(jobId)
    }

    if (toDelete.length > 0) {
      logger.info(`Cleaned up ${toDelete.length} old completed job records`)
    }
  }

  // Set maximum concurrent jobs
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = Math.max(1, max)
    logger.info(`Queue max concurrent jobs set to: ${this.maxConcurrent}`)
    
    // Try to process more jobs if we increased the limit
    this.processNext()
  }

  // Pause queue processing
  pause(): void {
    // This would require additional state management
    logger.info('Queue processing paused')
  }

  // Resume queue processing
  resume(): void {
    logger.info('Queue processing resumed')
    this.processNext()
  }

  // Get all jobs in queue
  getAllJobs(): QueueJob[] {
    return [...this.queue]
  }

  // Clear queue (emergency stop)
  clear(): void {
    this.queue = []
    this.processing.clear()
    logger.warn('Queue cleared - all jobs removed')
  }
}

// Singleton instance
export const renderQueue = new RenderQueue()

// Start cleanup interval
setInterval(() => {
  renderQueue.cleanup().catch(error => {
    logger.error('Render queue cleanup failed', error)
  })
}, 60 * 60 * 1000) // Every hour