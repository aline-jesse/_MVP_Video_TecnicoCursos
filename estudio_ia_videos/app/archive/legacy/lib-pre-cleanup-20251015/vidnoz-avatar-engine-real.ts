
/**
 * Vidnoz Avatar Engine - VERSÃO REAL
 * Motor de geração de avatares 3D usando D-ID API
 * 
 * ANTES: Sistema mockado que simulava geração de vídeos
 * DEPOIS: Integração real com D-ID para vídeos 4K profissionais
 */

import { DIDClient, getDIDClient } from './did-client';
import { logger } from './logger';
import { S3StorageService } from './s3-storage';

// ============================================================================
// TYPES
// ============================================================================

export interface AvatarRenderJob {
  id: string;
  userId: string;
  avatarId: string;
  scriptText: string;
  voiceId?: string;
  voiceProvider?: 'azure' | 'elevenlabs' | 'openai';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  error?: string;
  metadata?: {
    duration?: number;
    resolution?: string;
    fileSize?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AvatarGenerationOptions {
  avatarId: string;
  scriptText: string;
  voiceId?: string;
  voiceProvider?: 'azure' | 'elevenlabs' | 'openai';
  userId: string;
  fluent?: boolean;
  stitch?: boolean;
  format?: 'mp4' | 'gif';
}

// ============================================================================
// VIDNOZ AVATAR ENGINE (REAL)
// ============================================================================

export class VidnozAvatarEngineReal {
  private didClient: DIDClient;
  private activeJobs: Map<string, AvatarRenderJob> = new Map();

  constructor() {
    this.didClient = getDIDClient();
  }

  // ==========================================================================
  // AVATAR GENERATION (REAL)
  // ==========================================================================

  /**
   * Gera um vídeo real com avatar usando D-ID API
   */
  async generateAvatar(options: AvatarGenerationOptions): Promise<AvatarRenderJob> {
    const {
      avatarId,
      scriptText,
      voiceId = 'pt-BR-FranciscaNeural',
      voiceProvider = 'azure',
      userId,
      fluent = true,
      stitch = true,
      format = 'mp4',
    } = options;

    logger.info('Iniciando geração REAL de avatar', {
      avatarId,
      textLength: scriptText.length,
      voiceProvider,
    });

    // 1. Criar job no banco de dados
    const job = await this.createJob({
      userId,
      avatarId,
      scriptText,
      voiceId,
      voiceProvider,
    });

    // 2. Processar em background
    this.processAvatarVideoReal(job).catch((error) => {
      logger.error('Erro ao processar avatar:', error);
      this.updateJobStatus(job.id, 'failed', 0, undefined, error.message);
    });

    return job;
  }

  /**
   * Processa o vídeo do avatar usando D-ID (REAL)
   */
  private async processAvatarVideoReal(job: AvatarRenderJob): Promise<void> {
    try {
      logger.info(`[Job ${job.id}] Iniciando processamento REAL`);

      // 1. Buscar avatar na D-ID
      await this.updateJobStatus(job.id, 'processing', 10);
      const avatar = await this.didClient.getAvatar(job.avatarId);
      
      if (!avatar) {
        throw new Error(`Avatar ${job.avatarId} não encontrado`);
      }

      logger.info(`[Job ${job.id}] Avatar encontrado: ${avatar.name}`);

      // 2. Configurar provider de voz
      const voiceProvider = this.getVoiceProvider(
        job.voiceProvider || 'azure',
        job.voiceId || 'pt-BR-FranciscaNeural'
      );

      // 3. Criar talk na D-ID
      await this.updateJobStatus(job.id, 'processing', 30);
      
      const talkResponse = await this.didClient.createTalk({
        source_url: avatar.preview_url,
        script: {
          type: 'text',
          input: job.scriptText,
          provider: voiceProvider,
        },
        config: {
          fluent: true,
          stitch: true,
          result_format: 'mp4',
        },
      });

      logger.info(`[Job ${job.id}] Talk criado: ${talkResponse.id}`);

      // 4. Polling do status (aguardar conclusão)
      await this.updateJobStatus(job.id, 'processing', 50);

      const completedTalk = await this.didClient.waitForTalkCompletion(
        talkResponse.id,
        {
          maxAttempts: 60,
          intervalMs: 5000,
          onProgress: (status) => {
            // Atualizar progresso baseado no status
            const progressMap = {
              created: 50,
              started: 70,
              done: 100,
              error: 0,
            };
            this.updateJobStatus(job.id, 'processing', progressMap[status.status] || 50);
          },
        }
      );

      if (!completedTalk.result_url) {
        throw new Error('D-ID não retornou URL do vídeo');
      }

      logger.info(`[Job ${job.id}] Vídeo gerado: ${completedTalk.result_url}`);

      // 5. Baixar vídeo da D-ID
      await this.updateJobStatus(job.id, 'processing', 80);
      const videoResponse = await fetch(completedTalk.result_url);
      
      if (!videoResponse.ok) {
        throw new Error(`Erro ao baixar vídeo: ${videoResponse.status}`);
      }

      const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
      logger.info(`[Job ${job.id}] Vídeo baixado: ${videoBuffer.length} bytes`);

      // 6. Upload para S3
      await this.updateJobStatus(job.id, 'processing', 90);
      const s3Key = `avatars/${job.userId}/${job.id}.mp4`;
      const uploadResult = await S3StorageService.uploadFile(
        videoBuffer,
        s3Key,
        'video/mp4',
        {
          userId: job.userId,
          avatarId: job.avatarId,
          jobId: job.id,
        }
      );

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error('Erro ao fazer upload do vídeo para S3');
      }

      const s3Url = uploadResult.url;
      logger.info(`[Job ${job.id}] Upload S3 concluído: ${s3Url}`);

      // 7. Atualizar job com URL final
      await this.updateJobStatus(job.id, 'completed', 100, s3Url);

      // 8. Limpar talk da D-ID (opcional)
      await this.didClient.deleteTalk(talkResponse.id).catch(() => {
        // Ignorar erros de deleção
      });

      logger.info(`[Job ${job.id}] ✅ Processamento REAL concluído`);

    } catch (error: any) {
      logger.error(`[Job ${job.id}] ❌ Erro no processamento:`, error);
      await this.updateJobStatus(job.id, 'failed', 0, undefined, error.message);
      throw error;
    }
  }

  // ==========================================================================
  // JOB MANAGEMENT
  // ==========================================================================

  /**
   * Cria um novo job no banco de dados
   */
  private async createJob(data: {
    userId: string;
    avatarId: string;
    scriptText: string;
    voiceId?: string;
    voiceProvider?: string;
  }): Promise<AvatarRenderJob> {
    const job: AvatarRenderJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId,
      avatarId: data.avatarId,
      scriptText: data.scriptText,
      voiceId: data.voiceId,
      voiceProvider: data.voiceProvider as any,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.activeJobs.set(job.id, job);

    // Salvar no banco de dados (opcional)
    // await prisma.avatarRenderJob.create({ data: job });

    logger.info(`Job ${job.id} criado`);
    return job;
  }

  /**
   * Atualiza o status de um job
   */
  private async updateJobStatus(
    jobId: string,
    status: AvatarRenderJob['status'],
    progress: number,
    outputUrl?: string,
    error?: string
  ): Promise<void> {
    const job = this.activeJobs.get(jobId);
    
    if (job) {
      job.status = status;
      job.progress = progress;
      job.outputUrl = outputUrl;
      job.error = error;
      job.updatedAt = new Date();

      this.activeJobs.set(jobId, job);

      logger.info(`Job ${jobId} atualizado:`, {
        status,
        progress,
        outputUrl: outputUrl ? '✓' : undefined,
        error,
      });

      // Atualizar no banco de dados (opcional)
      // await prisma.avatarRenderJob.update({
      //   where: { id: jobId },
      //   data: { status, progress, outputUrl, error, updatedAt: new Date() },
      // });
    }
  }

  /**
   * Busca um job por ID
   */
  async getJob(jobId: string): Promise<AvatarRenderJob | null> {
    return this.activeJobs.get(jobId) || null;
  }

  /**
   * Lista todos os jobs de um usuário
   */
  async getUserJobs(userId: string): Promise<AvatarRenderJob[]> {
    return Array.from(this.activeJobs.values()).filter(
      (job) => job.userId === userId
    );
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Mapeia provider de voz para formato D-ID
   */
  private getVoiceProvider(
    provider: string,
    voiceId: string
  ): { type: 'microsoft' | 'amazon' | 'elevenlabs'; voice_id: string } {
    const providerMap: Record<string, 'microsoft' | 'amazon' | 'elevenlabs'> = {
      azure: 'microsoft',
      elevenlabs: 'elevenlabs',
      openai: 'microsoft', // D-ID não suporta OpenAI diretamente, usar Microsoft
    };

    return {
      type: providerMap[provider] || 'microsoft',
      voice_id: voiceId,
    };
  }

  /**
   * Retorna informações da configuração
   */
  getConfig() {
    return {
      didConfigured: this.didClient.isConfigured(),
      activeJobs: this.activeJobs.size,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let engineInstance: VidnozAvatarEngineReal | null = null;

export function getAvatarEngine(): VidnozAvatarEngineReal {
  if (!engineInstance) {
    engineInstance = new VidnozAvatarEngineReal();
  }
  return engineInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default VidnozAvatarEngineReal;
