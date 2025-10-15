
/**
 * 🚀 REAL QUEUE SETUP - FASE 2 IMPLEMENTATION
 * Real Redis-based queue system with BullMQ - NO MOCKS
 */

import { Queue, Worker } from 'bullmq'
import { getRedisConnection, isRedisReady } from './redis-config'

export interface QueueJob {
  id: string
  data: any
  status: 'waiting' | 'active' | 'completed' | 'failed'
  progress?: number
  result?: any
  error?: string
}

export interface VideoRenderJobData {
  projectId: string
  userId: string
  slides: Array<{
    id: string
    title: string
    content: string
    layout?: string
  }>
  settings: {
    voice_id: string
    avatar_id: string
    resolution: string
    format: string
  }
}

export interface QueueStats {
  waiting: number
  active: number
  completed: number
  failed: number
  processing: number
}

export interface JobProgress {
  percentage: number
  currentStep: string
  currentSlide?: number
  totalSlides?: number
  estimatedTimeRemaining?: number
}

// Real Redis-based queues
let renderQueue: Queue | null = null
let ttsQueue: Queue | null = null

/**
 * Initialize real Redis queues
 */
export async function initializeQueues(): Promise<void> {
  const redisReady = await isRedisReady()
  
  if (!redisReady) {
    throw new Error('Redis connection required for queue operations. Please ensure Redis is running.')
  }
  
  const connection = await getRedisConnection()
  
  renderQueue = new Queue('video-render', { connection })
  ttsQueue = new Queue('tts-generation', { connection })
  
  console.log('✅ [QueueSetup] Real Redis queues initialized')
}

// Export queue functions
export async function addVideoRenderJob(name: string, data: VideoRenderJobData): Promise<QueueJob> {
  if (!renderQueue) {
    await initializeQueues()
  }
  
  if (!renderQueue) {
    throw new Error('Failed to initialize render queue')
  }
  
  const job = await renderQueue.add(name, data)
  
  return {
    id: job.id!,
    data: job.data,
    status: 'waiting'
  }
}

export async function getJobStatus(id: string): Promise<QueueJob | null> {
  if (!renderQueue) {
    throw new Error('Render queue not initialized')
  }
  
  const job = await renderQueue.getJob(id)
  
  if (!job) {
    return null
  }
  
  const state = await job.getState()
  
  return {
    id: job.id!,
    data: job.data,
    status: state as any,
    progress: job.progress as number,
    result: job.returnvalue,
    error: job.failedReason
  }
}

// Real Redis connection
export const redis = {
  connect: async () => {
    const redisReady = await isRedisReady()
    if (!redisReady) {
      throw new Error('Redis connection failed')
    }
  },
  disconnect: async () => {
    if (renderQueue) await renderQueue.close()
    if (ttsQueue) await ttsQueue.close()
  }
}

// Initialize queues on module load
initializeQueues().catch(console.error)

