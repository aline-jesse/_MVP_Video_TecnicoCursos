
/**
 * 🎬 RENDER QUEUE REAL - Sprint 48 - FASE 2
 * Sistema real de fila de renderização com BullMQ e workers especializados
 */

import { Queue, Worker, Job } from 'bullmq';
import { getRedisConnection, isRedisReady, getRedisStatus } from './redis-config';
import { prisma } from '@/lib/db';
import { 
  updateRenderJobStatus, 
  updateRenderProgress, 
  completeRenderJob, 
  failRenderJob 
} from '@/lib/notifications/render-notifications';

// Interfaces
export interface RenderJobData {
  projectId: string;
  userId: string;
  type: 'video' | 'avatar' | 'pptx' | 'tts';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  config: {
    resolution?: string;
    fps?: number;
    format?: string;
    quality?: string;
    duration?: number;
    scenes?: any[];
    voiceConfig?: any;
    avatarConfig?: any;
  };
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

export interface RenderJobResult {
  success: boolean;
  videoUrl?: string;
  audioUrl?: string;
  duration?: number;
  fileSize?: number;
  thumbnailUrl?: string;
  error?: string;
  processingTime?: number;
  metadata?: any;
}

// Configurações das filas
const QUEUE_CONFIG = {
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 20,
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 2000,
    },
  },
  connection: () => getRedisConnection(),
};

// Filas especializadas
let renderQueue: Queue<RenderJobData, RenderJobResult> | null = null;
let ttsQueue: Queue<RenderJobData, RenderJobResult> | null = null;
let avatarQueue: Queue<RenderJobData, RenderJobResult> | null = null;

// Workers
let videoWorker: Worker<RenderJobData, RenderJobResult> | null = null;
let ttsWorker: Worker<RenderJobData, RenderJobResult> | null = null;
let avatarWorker: Worker<RenderJobData, RenderJobResult> | null = null;

// Redis connection is required - no fallback to mock
// All render operations require Redis to be available

/**
 * Inicializa as filas de renderização
 */
export async function initializeRenderQueues(): Promise<void> {
  try {
    const redisReady = await isRedisReady();
    
    if (!redisReady) {
      throw new Error('Redis connection required for render queues - no fallback available');
    }
    
    console.log('🚀 [RenderQueue] Inicializando filas BullMQ com Redis REAL');
    
    // Criar filas reais
    renderQueue = new Queue<RenderJobData, RenderJobResult>('render-video', QUEUE_CONFIG);
    ttsQueue = new Queue<RenderJobData, RenderJobResult>('render-tts', QUEUE_CONFIG);
    avatarQueue = new Queue<RenderJobData, RenderJobResult>('render-avatar', QUEUE_CONFIG);
    
    // Inicializar workers
    await initializeWorkers();
    
    console.log('✅ [RenderQueue] Filas BullMQ REAIS inicializadas com sucesso');
  } catch (error) {
    console.error('❌ [RenderQueue] Erro ao inicializar filas:', error);
    throw error; // Falha se não conseguir conectar ao Redis
  }
}

/**
 * Inicializa os workers especializados
 */
async function initializeWorkers(): Promise<void> {
  if (!renderQueue || !ttsQueue || !avatarQueue) return;

  try {
    // Worker de vídeo
    videoWorker = new Worker<RenderJobData, RenderJobResult>(
      'render-video',
      processVideoJob,
      {
        connection: getRedisConnection(),
        concurrency: 2,
        limiter: {
          max: 10,
          duration: 60000, // 10 jobs por minuto
        },
      }
    );

    // Worker de TTS
    ttsWorker = new Worker<RenderJobData, RenderJobResult>(
      'render-tts',
      processTTSJob,
      {
        connection: getRedisConnection(),
        concurrency: 5,
        limiter: {
          max: 50,
          duration: 60000, // 50 jobs por minuto
        },
      }
    );

    // Worker de Avatar
    avatarWorker = new Worker<RenderJobData, RenderJobResult>(
      'render-avatar',
      processAvatarJob,
      {
        connection: getRedisConnection(),
        concurrency: 1,
        limiter: {
          max: 5,
          duration: 60000, // 5 jobs por minuto
        },
      }
    );

    // Event handlers para todos os workers
    [videoWorker, ttsWorker, avatarWorker].forEach((worker, index) => {
      const workerName = ['Video', 'TTS', 'Avatar'][index];
      
      worker.on('ready', () => {
        console.log(`✅ [${workerName}Worker] Pronto`);
      });

      worker.on('active', (job: Job) => {
        console.log(`🎬 [${workerName}Worker] Processando job ${job.id}`);
        // Enviar notificação de início do processamento
        updateRenderJobStatus({
          jobId: job.id!,
          userId: job.data.userId,
          status: 'processing',
          progress: 0
        }).catch(console.error);
      });

      worker.on('completed', (job: Job, result: RenderJobResult) => {
        console.log(`✅ [${workerName}Worker] Job ${job.id} concluído`);
        updateProjectStatus(job.data.projectId, 'COMPLETED', result);
        
        // Enviar notificação de conclusão
        completeRenderJob(
          job.id!,
          job.data.userId,
          result.videoUrl || result.audioUrl || '',
          result.metadata
        ).catch(console.error);
      });

      worker.on('failed', (job: Job | undefined, err: Error) => {
        console.error(`❌ [${workerName}Worker] Job ${job?.id} falhou:`, err.message);
        if (job) {
          updateProjectStatus(job.data.projectId, 'ERROR', { error: err.message });
          
          // Enviar notificação de erro
          failRenderJob(
            job.id!,
            job.data.userId,
            err.message
          ).catch(console.error);
        }
      });

      worker.on('progress', (job: Job, progress: number) => {
        console.log(`📊 [${workerName}Worker] Job ${job.id} progresso: ${progress}%`);
        
        // Enviar notificação de progresso
        updateRenderProgress(
          job.id!,
          job.data.userId,
          progress
        ).catch(console.error);
      });
    });

    console.log('✅ [RenderQueue] Workers inicializados com sucesso');
  } catch (error) {
    console.error('❌ [RenderQueue] Erro ao inicializar workers:', error);
  }
}

/**
 * Adiciona job de renderização à fila
 * Redis é obrigatório - sem fallback para mock
 */
export async function addRenderJob(jobData: RenderJobData): Promise<string> {
  const redisReady = await isRedisReady();
  
  if (!redisReady) {
    throw new Error('Redis connection required for render queue operations. Please ensure Redis is running.');
  }
  
  if (!renderQueue) {
    throw new Error('Render queue not initialized. Call initializeRenderQueues() first.');
  }
  
  try {
    const priority = getPriorityScore(jobData.priority);
    const jobId = `${jobData.projectId}-${Date.now()}`;
    
    const job = await renderQueue.add(
      `render-${jobData.type}`,
      jobData,
      {
        priority,
        delay: jobData.priority === 'urgent' ? 0 : 1000,
        jobId,
      }
    );

    // Criar registro no banco de dados e enviar notificação
    await updateRenderJobStatus({
      jobId: job.id!,
      userId: jobData.userId,
      status: 'queued',
      progress: 0,
      metadata: {
        type: jobData.type,
        priority: jobData.priority,
        title: jobData.metadata?.title || `Render Job ${job.id}`
      }
    });

    console.log(`📋 [RenderQueue] Job adicionado: ${job.id} (tipo: ${jobData.type})`);
    return job.id!;
  } catch (error) {
    console.error('❌ [RenderQueue] Erro ao adicionar job:', error);
    throw error;
  }
}

/**
 * Adiciona job de TTS à fila
 * Redis é obrigatório - sem fallback para mock
 */
export async function addTTSJob(jobData: RenderJobData): Promise<string> {
  const redisReady = await isRedisReady();
  
  if (!redisReady) {
    throw new Error('Redis connection required for TTS queue operations. Please ensure Redis is running.');
  }
  
  if (!ttsQueue) {
    throw new Error('TTS queue not initialized. Call initializeRenderQueues() first.');
  }
  
  try {
    const jobId = `tts-${jobData.projectId}-${Date.now()}`;
    
    const job = await ttsQueue.add(
      'generate-tts',
      jobData,
      {
        priority: getPriorityScore(jobData.priority),
        jobId,
      }
    );

    // Criar registro no banco de dados e enviar notificação
    await updateRenderJobStatus({
      jobId: job.id!,
      userId: jobData.userId,
      status: 'queued',
      progress: 0,
      metadata: {
        type: 'tts',
        priority: jobData.priority,
        title: jobData.metadata?.title || `TTS Job ${job.id}`
      }
    });

    console.log(`🎤 [TTSQueue] Job adicionado: ${job.id}`);
    return job.id!;
  } catch (error) {
    console.error('❌ [TTSQueue] Erro ao adicionar job:', error);
    throw error;
  }
}

/**
 * Adiciona job de Avatar à fila
 * Redis é obrigatório - sem fallback para mock
 */
export async function addAvatarJob(jobData: RenderJobData): Promise<string> {
  const redisReady = await isRedisReady();
  
  if (!redisReady) {
    throw new Error('Redis connection required for avatar queue operations. Please ensure Redis is running.');
  }
  
  if (!avatarQueue) {
    throw new Error('Avatar queue not initialized. Call initializeRenderQueues() first.');
  }
  
  try {
    const jobId = `avatar-${jobData.projectId}-${Date.now()}`;
    
    const job = await avatarQueue.add(
      'render-avatar',
      jobData,
      {
        priority: getPriorityScore(jobData.priority),
        jobId,
      }
    );

    // Criar registro no banco de dados e enviar notificação
    await updateRenderJobStatus({
      jobId: job.id!,
      userId: jobData.userId,
      status: 'queued',
      progress: 0,
      metadata: {
        type: 'avatar',
        priority: jobData.priority,
        title: jobData.metadata?.title || `Avatar Job ${job.id}`
      }
    });

    console.log(`🎭 [AvatarQueue] Job adicionado: ${job.id}`);
    return job.id!;
  } catch (error) {
    console.error('❌ [AvatarQueue] Erro ao adicionar job:', error);
    throw error;
  }
}

/**
 * Obtém status de um job
 * Redis é obrigatório - sem fallback para mock
 */
export async function getRenderJobStatus(jobId: string): Promise<{
  status: string;
  progress: number;
  result?: RenderJobResult;
  error?: string;
}> {
  const redisReady = await isRedisReady();
  
  if (!redisReady) {
    throw new Error('Redis connection required for job status operations. Please ensure Redis is running.');
  }
  
  if (!renderQueue) {
    throw new Error('Render queue not initialized. Call initializeRenderQueues() first.');
  }
  
  try {
    const job = await renderQueue.getJob(jobId);
    
    if (!job) {
      return { status: 'not_found', progress: 0 };
    }

    const state = await job.getState();
    const progress = job.progress as number || 0;
    
    return {
      status: state,
      progress,
      result: job.returnvalue,
      error: job.failedReason,
    };
  } catch (error) {
    console.error('❌ [RenderQueue] Erro ao obter status:', error);
    throw error;
  }
}

/**
 * Adiciona job de vídeo específico para FFmpeg
 */
export async function addVideoJob(
  projectId: string,
  slides: any[],
  config: any,
  userId: string
): Promise<string> {
  const jobData: RenderJobData = {
    projectId,
    userId,
    type: 'video',
    priority: 'normal',
    config: {
      ...config,
      scenes: slides
    },
    metadata: {
      title: `Video Render - Project ${projectId}`,
      description: `FFmpeg video rendering with ${slides.length} slides`
    }
  };

  return addRenderJob(jobData);
}

/**
 * Obtém status específico de job de vídeo
 */
export async function getVideoJobStatus(jobId: string): Promise<{
  status: string;
  progress: number;
  result?: RenderJobResult;
  error?: string;
  createdAt?: string;
  processedAt?: string;
  finishedAt?: string;
} | null> {
  const redisReady = await isRedisReady();
  
  if (!redisReady) {
    throw new Error('Redis connection required for video job status operations. Please ensure Redis is running.');
  }
  
  if (!renderQueue) {
    throw new Error('Render queue not initialized. Call initializeRenderQueues() first.');
  }
  
  try {
    const job = await renderQueue.getJob(jobId);
    
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress as number || 0;
    
    return {
      status: state,
      progress,
      result: job.returnvalue,
      error: job.failedReason,
      createdAt: new Date(job.timestamp).toISOString(),
      processedAt: job.processedOn ? new Date(job.processedOn).toISOString() : undefined,
      finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : undefined,
    };
  } catch (error) {
    console.error('❌ [RenderQueue] Erro ao obter status do vídeo:', error);
    throw error;
  }
}

/**
 * Obtém estatísticas das filas
 */
export async function getQueueStats(): Promise<{
  render: { waiting: number; active: number; completed: number; failed: number };
  tts: { waiting: number; active: number; completed: number; failed: number };
  avatar: { waiting: number; active: number; completed: number; failed: number };
  redis: { available: boolean; status: string };
}> {
  try {
    const redisStatus = getRedisStatus();
    
    if (redisStatus.available && renderQueue && ttsQueue && avatarQueue) {
      const [renderStats, ttsStats, avatarStats] = await Promise.all([
        getQueueCounts(renderQueue),
        getQueueCounts(ttsQueue),
        getQueueCounts(avatarQueue),
      ]);

      return {
        render: renderStats,
        tts: ttsStats,
        avatar: avatarStats,
        redis: redisStatus,
      };
    } else {
      return {
        render: { waiting: mockJobs.size, active: 0, completed: 0, failed: 0 },
        tts: { waiting: 0, active: 0, completed: 0, failed: 0 },
        avatar: { waiting: 0, active: 0, completed: 0, failed: 0 },
        redis: redisStatus,
      };
    }
  } catch (error) {
    console.error('❌ [RenderQueue] Erro ao obter estatísticas:', error);
    return {
      render: { waiting: 0, active: 0, completed: 0, failed: 0 },
      tts: { waiting: 0, active: 0, completed: 0, failed: 0 },
      avatar: { waiting: 0, active: 0, completed: 0, failed: 0 },
      redis: { available: false, status: 'error' },
    };
  }
}

// Funções auxiliares

function getPriorityScore(priority: string): number {
  const scores = { urgent: 1, high: 2, normal: 3, low: 4 };
  return scores[priority] || 3;
}

async function getQueueCounts(queue: Queue) {
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaiting(),
    queue.getActive(),
    queue.getCompleted(),
    queue.getFailed(),
  ]);

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
  };
}

// Processadores de jobs

async function processVideoJob(job: Job<RenderJobData>): Promise<RenderJobResult> {
  const { projectId, config, userId } = job.data;
  const startTime = Date.now();
  
  try {
    console.log(`🎬 [VideoWorker] Iniciando renderização REAL para projeto ${projectId}`);
    
    // Atualizar progresso inicial
    await job.updateProgress(5);
    
    // Importar o serviço de renderização FFmpeg
    const { getRenderService } = await import('@/lib/render/ffmpeg-render-service');
    const renderService = getRenderService();
    
    // Inicializar FFmpeg
    await job.updateProgress(10);
    await renderService.initialize();
    
    // Buscar dados do projeto no banco
    await job.updateProgress(15);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        slides: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (!project || !project.slides.length) {
      throw new Error('Projeto não encontrado ou sem slides');
    }
    
    // Converter slides para formato do renderizador
    const renderSlides = project.slides.map(slide => ({
      id: slide.id,
      imageUrl: slide.imageUrl || '',
      audioUrl: slide.audioUrl || undefined,
      duration: slide.duration || 3,
      transition: (slide.transition as any) || 'fade',
      transitionDuration: slide.transitionDuration || 0.5,
      title: slide.title || '',
      content: slide.content || ''
    }));
    
    // Configuração de renderização
    const renderConfig = {
      width: config.resolution === '4k' ? 3840 : config.resolution === '1080p' ? 1920 : 1280,
      height: config.resolution === '4k' ? 2160 : config.resolution === '1080p' ? 1080 : 720,
      fps: config.fps || 30,
      quality: (config.quality as any) || 'high',
      format: (config.format as any) || 'mp4',
      codec: 'h264',
      bitrate: config.quality === 'ultra' ? '8000k' : config.quality === 'high' ? '5000k' : '3000k',
      audioCodec: 'aac',
      audioBitrate: '192k'
    };
    
    // Configurar callback de progresso
    renderService.setProgressCallback((progress) => {
      const totalProgress = 15 + (progress.progress * 0.8); // 15% inicial + 80% para renderização
      job.updateProgress(Math.round(totalProgress));
    });
    
    // Renderizar vídeo com FFmpeg REAL
    console.log(`🎬 [VideoWorker] Renderizando ${renderSlides.length} slides com FFmpeg`);
    const renderResult = await renderService.renderVideo(renderSlides, renderConfig, projectId);
    
    await job.updateProgress(95);
    
    // Atualizar projeto no banco com resultado
    if (renderResult.success) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'completed',
          videoUrl: renderResult.videoUrl,
          thumbnailUrl: renderResult.thumbnailUrl,
          duration: renderResult.duration,
          fileSize: renderResult.fileSize,
          updatedAt: new Date()
        }
      });
    }
    
    await job.updateProgress(100);
    
    const processingTime = Date.now() - startTime;
    
    const result: RenderJobResult = {
      success: renderResult.success,
      videoUrl: renderResult.videoUrl,
      duration: renderResult.duration,
      fileSize: renderResult.fileSize,
      thumbnailUrl: renderResult.thumbnailUrl,
      error: renderResult.error,
      processingTime,
      metadata: renderResult.metadata
    };
    
    console.log(`✅ [VideoWorker] Vídeo renderizado com FFmpeg REAL: ${projectId} (${processingTime}ms)`);
    return result;
    
  } catch (error: any) {
    console.error(`❌ [VideoWorker] Erro na renderização FFmpeg ${projectId}:`, error);
    
    // Atualizar projeto com erro
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'error',
        error: error.message,
        updatedAt: new Date()
      }
    }).catch(console.error);
    
    throw error;
  }
}

async function processTTSJob(job: Job<RenderJobData>): Promise<RenderJobResult> {
  const { projectId, config, userId } = job.data;
  const startTime = Date.now();
  
  try {
    console.log(`🎙️ [TTSWorker] Iniciando síntese TTS REAL para projeto ${projectId}`);
    
    await job.updateProgress(10);
    
    // Importar o serviço de TTS real
    const { GoogleTTSService } = await import('@/lib/google-tts-service');
    
    // Buscar dados do projeto no banco
    await job.updateProgress(20);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        slides: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (!project || !project.slides.length) {
      throw new Error('Projeto não encontrado ou sem slides para TTS');
    }
    
    // Configuração do TTS
    const voiceConfig = config.voiceConfig || {};
    const ttsConfig = {
      text: project.slides.map(slide => slide.content || slide.title || '').join(' '),
      voice: voiceConfig.voice || 'pt-BR-Neural2-A',
      language: voiceConfig.language || 'pt-BR',
      audioEncoding: 'MP3' as const,
      speakingRate: voiceConfig.speed || 1.0,
      pitch: voiceConfig.pitch || 0.0,
      volumeGainDb: voiceConfig.volume || 0.0
    };
    
    await job.updateProgress(40);
    
    // Gerar áudio com Google TTS REAL
    console.log(`🎙️ [TTSWorker] Sintetizando com Google TTS: ${ttsConfig.text.substring(0, 100)}...`);
    const ttsResult = await GoogleTTSService.synthesizeSpeech(ttsConfig);
    
    if (!ttsResult.success) {
      throw new Error(ttsResult.error || 'Falha na síntese de voz');
    }
    
    await job.updateProgress(80);
    
    // Atualizar projeto no banco com resultado
    if (ttsResult.success && ttsResult.audioUrl) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          audioUrl: ttsResult.audioUrl,
          duration: ttsResult.duration,
          updatedAt: new Date()
        }
      });
    }
    
    await job.updateProgress(100);
    
    const processingTime = Date.now() - startTime;
    
    const result: RenderJobResult = {
      success: ttsResult.success,
      audioUrl: ttsResult.audioUrl,
      duration: ttsResult.duration,
      fileSize: ttsResult.audioContent?.length || 0,
      processingTime,
      metadata: {
        voice: ttsConfig.voice,
        language: ttsConfig.language,
        speakingRate: ttsConfig.speakingRate
      }
    };
    
    console.log(`✅ [TTSWorker] TTS sintetizado com Google TTS REAL: ${projectId} (${processingTime}ms)`);
    return result;
    
  } catch (error: any) {
    console.error(`❌ [TTSWorker] Erro na síntese TTS ${projectId}:`, error);
    
    // Atualizar projeto com erro
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'error',
        error: error.message,
        updatedAt: new Date()
      }
    }).catch(console.error);
    
    throw error;
  }
}

async function processAvatarJob(job: Job<RenderJobData>): Promise<RenderJobResult> {
  const { projectId, config, userId } = job.data;
  const startTime = Date.now();
  
  try {
    console.log(`🤖 [AvatarWorker] Iniciando renderização de avatar REAL para projeto ${projectId}`);
    
    // Import avatar 3D renderer
    await job.updateProgress(10);
    const { avatar3DRenderer } = await import('@/lib/avatars/avatar-3d-renderer');
    
    // Fetch project data from database
    await job.updateProgress(20);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: true,
        slides: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (!project) {
      throw new Error(`Projeto ${projectId} não encontrado`);
    }
    
    // Configure avatar render settings
    const avatarConfig = {
      avatarId: project.avatarId || config.avatarConfig?.avatarId || 'default-avatar',
      audioPath: project.audioUrl || '',
      duration: project.duration || config.duration || 30,
      slideContent: project.slides.map(s => s.content || s.title || '').join(' '),
      slideTitle: project.title,
      background: config.avatarConfig?.background || 'office',
      lighting: 'studio' as const,
      cameraAngle: 'front' as const,
      resolution: config.resolution || '1080p',
      quality: config.quality || 'high'
    };
    
    await job.updateProgress(40);
    
    // Render 3D avatar with lip-sync
    console.log(`🎭 [AvatarWorker] Renderizando avatar 3D com lip-sync para projeto ${projectId}`);
    const renderResult = await avatar3DRenderer.render3DAvatar(avatarConfig);
    
    if (!renderResult.success) {
      throw new Error(renderResult.error || 'Falha na renderização do avatar');
    }
    
    await job.updateProgress(80);
    
    // Update project in database
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'completed',
        videoUrl: renderResult.videoPath,
        thumbnailUrl: renderResult.thumbnailPath,
        duration: renderResult.duration,
        fileSize: renderResult.fileSize,
        updatedAt: new Date()
      }
    });
    
    await job.updateProgress(100);
    
    const processingTime = Date.now() - startTime;
    
    const result: RenderJobResult = {
      success: true,
      videoUrl: renderResult.videoPath,
      duration: renderResult.duration,
      fileSize: renderResult.fileSize,
      thumbnailUrl: renderResult.thumbnailPath,
      processingTime,
      metadata: {
        avatarId: avatarConfig.avatarId,
        resolution: avatarConfig.resolution,
        format: 'mp4',
        lipSyncAccuracy: renderResult.lipSyncAccuracy,
        background: avatarConfig.background
      }
    };
    
    console.log(`✅ [AvatarWorker] Avatar renderizado com sucesso: ${projectId} (${processingTime}ms)`);
    return result;
  } catch (error: any) {
    console.error(`❌ [AvatarWorker] Erro na renderização do avatar ${projectId}:`, error);
    
    // Update project status to error
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'error',
        error: error.message,
        updatedAt: new Date()
      }
    }).catch(console.error);
    
    throw error;
  }
}

// All mock functions removed - Redis is required for all operations

async function updateProjectStatus(projectId: string, status: string, result?: any): Promise<void> {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status,
        videoUrl: result?.videoUrl,
        duration: result?.duration,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('❌ [RenderQueue] Erro ao atualizar projeto:', error);
  }
}

/**
 * Fecha todas as filas e workers
 */
export async function closeRenderQueues(): Promise<void> {
  try {
    const workers = [videoWorker, ttsWorker, avatarWorker].filter(Boolean);
    const queues = [renderQueue, ttsQueue, avatarQueue].filter(Boolean);
    
    // Fechar workers
    await Promise.all(workers.map(worker => worker?.close()));
    
    // Fechar filas
    await Promise.all(queues.map(queue => queue?.close()));
    
    console.log('✅ [RenderQueue] Filas e workers fechados');
  } catch (error) {
    console.error('❌ [RenderQueue] Erro ao fechar filas:', error);
  }
}

// Inicializar automaticamente
initializeRenderQueues().catch(console.error);
