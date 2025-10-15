/**
 * 🤖 AVATAR WORKER - Sprint 48 - FASE 2
 * Worker especializado para renderização de avatares com IA
 */

import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../redis-config';
import { RenderJobData, RenderJobResult } from '../render-queue';
import { prisma } from '@/lib/db';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

// Interfaces específicas para Avatar
interface AvatarConfig {
  avatarId: string;
  voice: string;
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'excited';
  pose: 'standing' | 'sitting' | 'presenting' | 'gesturing';
  background: string;
  lighting: 'natural' | 'studio' | 'dramatic' | 'soft';
  quality: 'standard' | 'high' | 'ultra';
  provider: 'azure' | 'vidnoz' | 'synthesia' | 'heygen';
}

interface AvatarJobData extends RenderJobData {
  script: string;
  avatarConfig: AvatarConfig;
  audioUrl?: string; // URL do áudio TTS já gerado
}

export class AvatarWorker {
  private worker: Worker<AvatarJobData, RenderJobResult> | null = null;
  private isRunning = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.worker = new Worker<AvatarJobData, RenderJobResult>(
        'render-avatar',
        this.processAvatarJob.bind(this),
        {
          connection: getRedisConnection(),
          concurrency: 1, // 1 avatar por vez (processo intensivo)
          limiter: {
            max: 5,
            duration: 60000, // 5 jobs por minuto
          },
          settings: {
            stalledInterval: 60000, // 1 minuto
            maxStalledCount: 1,
          },
        }
      );

      this.setupEventHandlers();
      this.isRunning = true;
      
      console.log('✅ [AvatarWorker] Inicializado com sucesso');
    } catch (error) {
      console.error('❌ [AvatarWorker] Erro ao inicializar:', error);
    }
  }

  private setupEventHandlers(): void {
    if (!this.worker) return;

    this.worker.on('ready', () => {
      console.log('🚀 [AvatarWorker] Pronto para processar jobs');
    });

    this.worker.on('active', (job: Job) => {
      console.log(`🤖 [AvatarWorker] Processando job ${job.id} - Projeto: ${job.data.projectId}`);
    });

    this.worker.on('completed', async (job: Job, result: RenderJobResult) => {
      console.log(`✅ [AvatarWorker] Job ${job.id} concluído com sucesso`);
      await this.updateProjectStatus(job.data.projectId, 'COMPLETED', result);
    });

    this.worker.on('failed', async (job: Job | undefined, err: Error) => {
      console.error(`❌ [AvatarWorker] Job ${job?.id} falhou:`, err.message);
      if (job) {
        await this.updateProjectStatus(job.data.projectId, 'ERROR', { error: err.message });
      }
    });

    this.worker.on('progress', (job: Job, progress: number) => {
      console.log(`📊 [AvatarWorker] Job ${job.id} progresso: ${progress}%`);
    });

    this.worker.on('stalled', (jobId: string) => {
      console.warn(`⚠️ [AvatarWorker] Job ${jobId} travado, será reprocessado`);
    });

    this.worker.on('error', (err: Error) => {
      console.error('❌ [AvatarWorker] Erro no worker:', err);
    });
  }

  private async processAvatarJob(job: Job<AvatarJobData>): Promise<RenderJobResult> {
    const { projectId, script, avatarConfig, audioUrl, userId } = job.data;
    const startTime = Date.now();

    try {
      console.log(`🤖 [AvatarWorker] Iniciando renderização de avatar para projeto ${projectId}`);
      
      // Atualizar progresso inicial
      await job.updateProgress(5);

      // 1. Validar configuração do avatar
      await this.validateAvatarConfig(avatarConfig);
      await job.updateProgress(10);

      // 2. Preparar diretório de trabalho
      const workDir = await this.prepareWorkDirectory(projectId);
      await job.updateProgress(15);

      // 3. Baixar/preparar áudio se fornecido
      const audioPath = audioUrl ? await this.downloadAudio(audioUrl, workDir) : null;
      await job.updateProgress(20);

      // 4. Preparar script e configurações
      const configPath = await this.prepareAvatarConfig(script, avatarConfig, audioPath, workDir);
      await job.updateProgress(25);

      // 5. Renderizar avatar com o provedor selecionado
      const videoPath = await this.renderAvatar(
        configPath,
        avatarConfig,
        workDir,
        (progress) => job.updateProgress(25 + (progress * 0.6)) // 25% a 85%
      );
      await job.updateProgress(85);

      // 6. Pós-processamento do vídeo
      const finalVideoPath = await this.postProcessVideo(videoPath, workDir);
      await job.updateProgress(90);

      // 7. Gerar thumbnail
      const thumbnailPath = await this.generateThumbnail(finalVideoPath, workDir);
      await job.updateProgress(93);

      // 8. Upload para storage
      const { videoUrl: finalVideoUrl, thumbnailUrl } = await this.uploadFiles(finalVideoPath, thumbnailPath, projectId);
      await job.updateProgress(97);

      // 9. Obter metadados do vídeo
      const videoMetadata = await this.getVideoMetadata(finalVideoPath);
      await job.updateProgress(99);

      // 10. Limpar arquivos temporários
      await this.cleanupWorkDirectory(workDir);
      await job.updateProgress(100);

      const processingTime = Date.now() - startTime;

      const result: RenderJobResult = {
        success: true,
        videoUrl: finalVideoUrl,
        thumbnailUrl,
        duration: videoMetadata.duration,
        fileSize: videoMetadata.fileSize,
        processingTime,
        metadata: {
          provider: avatarConfig.provider,
          avatarId: avatarConfig.avatarId,
          emotion: avatarConfig.emotion,
          pose: avatarConfig.pose,
          quality: avatarConfig.quality,
          resolution: videoMetadata.resolution,
          fps: videoMetadata.fps,
          format: 'mp4',
        },
      };

      console.log(`✅ [AvatarWorker] Avatar renderizado com sucesso: ${projectId}`);
      return result;

    } catch (error) {
      console.error(`❌ [AvatarWorker] Erro ao processar avatar ${projectId}:`, error);
      
      // Tentar limpar arquivos em caso de erro
      try {
        const workDir = path.join(process.cwd(), 'temp', 'avatar', projectId);
        await this.cleanupWorkDirectory(workDir);
      } catch (cleanupError) {
        console.error('❌ [AvatarWorker] Erro ao limpar arquivos:', cleanupError);
      }

      throw error;
    }
  }

  private async validateAvatarConfig(config: AvatarConfig): Promise<void> {
    const validProviders = ['azure', 'vidnoz', 'synthesia', 'heygen'];
    const validEmotions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'excited'];
    const validPoses = ['standing', 'sitting', 'presenting', 'gesturing'];
    const validQualities = ['standard', 'high', 'ultra'];
    
    if (!validProviders.includes(config.provider)) {
      throw new Error(`Provedor de avatar inválido: ${config.provider}`);
    }

    if (!config.avatarId) {
      throw new Error('ID do avatar não especificado');
    }

    if (!validEmotions.includes(config.emotion)) {
      throw new Error(`Emoção inválida: ${config.emotion}`);
    }

    if (!validPoses.includes(config.pose)) {
      throw new Error(`Pose inválida: ${config.pose}`);
    }

    if (!validQualities.includes(config.quality)) {
      throw new Error(`Qualidade inválida: ${config.quality}`);
    }

    console.log(`✅ [AvatarWorker] Configuração de avatar validada: ${config.provider}`);
  }

  private async prepareWorkDirectory(projectId: string): Promise<string> {
    const workDir = path.join(process.cwd(), 'temp', 'avatar', projectId);
    
    try {
      await fs.mkdir(workDir, { recursive: true });
      console.log(`📁 [AvatarWorker] Diretório de trabalho criado: ${workDir}`);
      return workDir;
    } catch (error) {
      console.error('❌ [AvatarWorker] Erro ao criar diretório:', error);
      throw new Error(`Falha ao criar diretório de trabalho: ${error.message}`);
    }
  }

  private async downloadAudio(audioUrl: string, workDir: string): Promise<string> {
    const audioPath = path.join(workDir, 'audio.mp3');
    
    try {
      // Por enquanto, simular download (implementar download real depois)
      const mockAudioData = Buffer.from('mock audio data for avatar');
      await fs.writeFile(audioPath, mockAudioData);
      
      console.log(`📥 [AvatarWorker] Áudio "baixado": ${audioPath}`);
      return audioPath;
    } catch (error) {
      console.error('❌ [AvatarWorker] Erro ao baixar áudio:', error);
      throw error;
    }
  }

  private async prepareAvatarConfig(
    script: string,
    config: AvatarConfig,
    audioPath: string | null,
    workDir: string
  ): Promise<string> {
    const configPath = path.join(workDir, 'avatar-config.json');
    
    try {
      const avatarConfig = {
        script,
        avatar: {
          id: config.avatarId,
          emotion: config.emotion,
          pose: config.pose,
          voice: config.voice,
        },
        video: {
          quality: config.quality,
          background: config.background,
          lighting: config.lighting,
        },
        audio: audioPath ? {
          path: audioPath,
          sync: true,
        } : null,
        output: {
          format: 'mp4',
          resolution: config.quality === 'ultra' ? '4k' : config.quality === 'high' ? '1080p' : '720p',
          fps: 30,
        },
      };

      await fs.writeFile(configPath, JSON.stringify(avatarConfig, null, 2));
      console.log(`📝 [AvatarWorker] Configuração preparada: ${configPath}`);
      
      return configPath;
    } catch (error) {
      console.error('❌ [AvatarWorker] Erro ao preparar configuração:', error);
      throw error;
    }
  }

  private async renderAvatar(
    configPath: string,
    config: AvatarConfig,
    workDir: string,
    onProgress: (progress: number) => Promise<void>
  ): Promise<string> {
    const outputPath = path.join(workDir, 'avatar_output.mp4');

    try {
      await onProgress(10);

      switch (config.provider) {
        case 'azure':
          return await this.renderAzureAvatar(configPath, outputPath, onProgress);
        case 'vidnoz':
          return await this.renderVidnozAvatar(configPath, outputPath, onProgress);
        case 'synthesia':
          return await this.renderSynthesiaAvatar(configPath, outputPath, onProgress);
        case 'heygen':
          return await this.renderHeyGenAvatar(configPath, outputPath, onProgress);
        default:
          throw new Error(`Provedor de avatar não suportado: ${config.provider}`);
      }
    } catch (error) {
      console.error('❌ [AvatarWorker] Erro ao renderizar avatar:', error);
      throw error;
    }
  }

  private async renderAzureAvatar(
    configPath: string,
    outputPath: string,
    onProgress: (progress: number) => Promise<void>
  ): Promise<string> {
    console.log(`🤖 [AvatarWorker] Renderizando avatar com Azure`);
    
    // Simular processo de renderização Azure
    await onProgress(20);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await onProgress(50);
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    await onProgress(80);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await onProgress(100);
    
    // Simular criação do vídeo
    const mockVideoData = Buffer.from('mock azure avatar video data');
    await fs.writeFile(outputPath, mockVideoData);
    
    console.log(`✅ [AvatarWorker] Avatar Azure renderizado: ${outputPath}`);
    return outputPath;
  }

  private async renderVidnozAvatar(
    configPath: string,
    outputPath: string,
    onProgress: (progress: number) => Promise<void>
  ): Promise<string> {
    console.log(`🤖 [AvatarWorker] Renderizando avatar com Vidnoz`);
    
    // Simular processo de renderização Vidnoz
    await onProgress(15);
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    await onProgress(45);
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    await onProgress(75);
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    await onProgress(100);
    
    // Simular criação do vídeo
    const mockVideoData = Buffer.from('mock vidnoz avatar video data');
    await fs.writeFile(outputPath, mockVideoData);
    
    console.log(`✅ [AvatarWorker] Avatar Vidnoz renderizado: ${outputPath}`);
    return outputPath;
  }

  private async renderSynthesiaAvatar(
    configPath: string,
    outputPath: string,
    onProgress: (progress: number) => Promise<void>
  ): Promise<string> {
    console.log(`🤖 [AvatarWorker] Renderizando avatar com Synthesia`);
    
    // Simular processo de renderização Synthesia
    await onProgress(25);
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    await onProgress(60);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await onProgress(90);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await onProgress(100);
    
    // Simular criação do vídeo
    const mockVideoData = Buffer.from('mock synthesia avatar video data');
    await fs.writeFile(outputPath, mockVideoData);
    
    console.log(`✅ [AvatarWorker] Avatar Synthesia renderizado: ${outputPath}`);
    return outputPath;
  }

  private async renderHeyGenAvatar(
    configPath: string,
    outputPath: string,
    onProgress: (progress: number) => Promise<void>
  ): Promise<string> {
    console.log(`🤖 [AvatarWorker] Renderizando avatar com HeyGen`);
    
    // Simular processo de renderização HeyGen
    await onProgress(30);
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    await onProgress(65);
    await new Promise(resolve => setTimeout(resolve, 4500));
    
    await onProgress(95);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await onProgress(100);
    
    // Simular criação do vídeo
    const mockVideoData = Buffer.from('mock heygen avatar video data');
    await fs.writeFile(outputPath, mockVideoData);
    
    console.log(`✅ [AvatarWorker] Avatar HeyGen renderizado: ${outputPath}`);
    return outputPath;
  }

  private async postProcessVideo(videoPath: string, workDir: string): Promise<string> {
    const processedPath = path.join(workDir, 'processed_video.mp4');
    
    try {
      // Por enquanto, apenas copiar o arquivo (implementar pós-processamento depois)
      await fs.copyFile(videoPath, processedPath);
      
      console.log(`🎛️ [AvatarWorker] Vídeo pós-processado: ${processedPath}`);
      return processedPath;
    } catch (error) {
      console.error('❌ [AvatarWorker] Erro no pós-processamento:', error);
      return videoPath; // Retornar original em caso de erro
    }
  }

  private async generateThumbnail(videoPath: string, workDir: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const thumbnailPath = path.join(workDir, 'thumbnail.jpg');
      
      const ffmpegArgs = [
        '-i', videoPath,
        '-ss', '00:00:02', // Capturar no segundo 2
        '-vframes', '1',
        '-q:v', '2',
        '-y',
        thumbnailPath
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(`📸 [AvatarWorker] Thumbnail gerado: ${thumbnailPath}`);
          resolve(thumbnailPath);
        } else {
          console.error(`❌ [AvatarWorker] Erro ao gerar thumbnail, código: ${code}`);
          reject(new Error(`Erro ao gerar thumbnail, código ${code}`));
        }
      });

      ffmpeg.on('error', (error) => {
        console.error('❌ [AvatarWorker] Erro ao gerar thumbnail:', error);
        reject(error);
      });
    });
  }

  private async uploadFiles(videoPath: string, thumbnailPath: string, projectId: string): Promise<{
    videoUrl: string;
    thumbnailUrl: string;
  }> {
    try {
      // Por enquanto, simular upload (implementar S3/storage real depois)
      const videoUrl = `https://storage.example.com/avatars/${projectId}/avatar.mp4`;
      const thumbnailUrl = `https://storage.example.com/avatars/${projectId}/thumbnail.jpg`;

      console.log(`📤 [AvatarWorker] Arquivos "enviados" para storage`);
      
      return { videoUrl, thumbnailUrl };
    } catch (error) {
      console.error('❌ [AvatarWorker] Erro ao fazer upload:', error);
      throw error;
    }
  }

  private async getVideoMetadata(videoPath: string): Promise<{
    duration: number;
    fileSize: number;
    resolution: string;
    fps: number;
  }> {
    try {
      const stats = await fs.stat(videoPath);
      
      // Metadados simulados (implementar análise real depois)
      return {
        duration: 20, // segundos
        fileSize: stats.size,
        resolution: '1080p',
        fps: 30,
      };
    } catch (error) {
      console.error('❌ [AvatarWorker] Erro ao obter metadados:', error);
      throw error;
    }
  }

  private async cleanupWorkDirectory(workDir: string): Promise<void> {
    try {
      await fs.rm(workDir, { recursive: true, force: true });
      console.log(`🧹 [AvatarWorker] Diretório limpo: ${workDir}`);
    } catch (error) {
      console.error('❌ [AvatarWorker] Erro ao limpar diretório:', error);
    }
  }

  private async updateProjectStatus(projectId: string, status: string, result?: any): Promise<void> {
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

      console.log(`📊 [AvatarWorker] Status do projeto ${projectId} atualizado: ${status}`);
    } catch (error) {
      console.error('❌ [AvatarWorker] Erro ao atualizar projeto:', error);
    }
  }

  public async close(): Promise<void> {
    if (this.worker && this.isRunning) {
      await this.worker.close();
      this.isRunning = false;
      console.log('✅ [AvatarWorker] Worker fechado');
    }
  }

  public getStatus(): { isRunning: boolean; queueName: string } {
    return {
      isRunning: this.isRunning,
      queueName: 'render-avatar',
    };
  }
}

// Exportar instância singleton
export const avatarWorker = new AvatarWorker();