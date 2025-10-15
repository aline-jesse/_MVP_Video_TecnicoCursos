/**
 * 🎙️ TTS WORKER - Sprint 48 - FASE 2
 * Worker especializado para geração de áudio TTS
 */

import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../redis-config';
import { RenderJobData, RenderJobResult } from '../render-queue';
import { prisma } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';

// Interfaces específicas para TTS
interface TTSConfig {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  language: string;
  provider: 'azure' | 'elevenlabs' | 'google' | 'openai';
}

interface TTSJobData extends RenderJobData {
  text: string;
  ttsConfig: TTSConfig;
}

export class TTSWorker {
  private worker: Worker<TTSJobData, RenderJobResult> | null = null;
  private isRunning = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.worker = new Worker<TTSJobData, RenderJobResult>(
        'render-tts',
        this.processTTSJob.bind(this),
        {
          connection: getRedisConnection(),
          concurrency: 5, // 5 TTS simultâneos
          limiter: {
            max: 50,
            duration: 60000, // 50 jobs por minuto
          },
          settings: {
            stalledInterval: 30000,
            maxStalledCount: 1,
          },
        }
      );

      this.setupEventHandlers();
      this.isRunning = true;
      
      console.log('✅ [TTSWorker] Inicializado com sucesso');
    } catch (error) {
      console.error('❌ [TTSWorker] Erro ao inicializar:', error);
    }
  }

  private setupEventHandlers(): void {
    if (!this.worker) return;

    this.worker.on('ready', () => {
      console.log('🚀 [TTSWorker] Pronto para processar jobs');
    });

    this.worker.on('active', (job: Job) => {
      console.log(`🎙️ [TTSWorker] Processando job ${job.id} - Projeto: ${job.data.projectId}`);
    });

    this.worker.on('completed', async (job: Job, result: RenderJobResult) => {
      console.log(`✅ [TTSWorker] Job ${job.id} concluído com sucesso`);
      await this.updateProjectStatus(job.data.projectId, 'COMPLETED', result);
    });

    this.worker.on('failed', async (job: Job | undefined, err: Error) => {
      console.error(`❌ [TTSWorker] Job ${job?.id} falhou:`, err.message);
      if (job) {
        await this.updateProjectStatus(job.data.projectId, 'ERROR', { error: err.message });
      }
    });

    this.worker.on('progress', (job: Job, progress: number) => {
      console.log(`📊 [TTSWorker] Job ${job.id} progresso: ${progress}%`);
    });

    this.worker.on('stalled', (jobId: string) => {
      console.warn(`⚠️ [TTSWorker] Job ${jobId} travado, será reprocessado`);
    });

    this.worker.on('error', (err: Error) => {
      console.error('❌ [TTSWorker] Erro no worker:', err);
    });
  }

  private async processTTSJob(job: Job<TTSJobData>): Promise<RenderJobResult> {
    const { projectId, text, ttsConfig, userId } = job.data;
    const startTime = Date.now();

    try {
      console.log(`🎙️ [TTSWorker] Iniciando geração de TTS para projeto ${projectId}`);
      
      // Atualizar progresso inicial
      await job.updateProgress(5);

      // 1. Validar configuração TTS
      await this.validateTTSConfig(ttsConfig);
      await job.updateProgress(10);

      // 2. Preparar diretório de trabalho
      const workDir = await this.prepareWorkDirectory(projectId);
      await job.updateProgress(15);

      // 3. Processar texto (limpeza, SSML, etc.)
      const processedText = await this.processText(text, ttsConfig);
      await job.updateProgress(25);

      // 4. Gerar áudio com o provedor selecionado
      const audioPath = await this.generateAudio(
        processedText,
        ttsConfig,
        workDir,
        (progress) => job.updateProgress(25 + (progress * 0.6)) // 25% a 85%
      );
      await job.updateProgress(85);

      // 5. Pós-processamento do áudio (normalização, etc.)
      const finalAudioPath = await this.postProcessAudio(audioPath, workDir);
      await job.updateProgress(90);

      // 6. Upload para storage
      const audioUrl = await this.uploadAudio(finalAudioPath, projectId);
      await job.updateProgress(95);

      // 7. Obter metadados do áudio
      const audioMetadata = await this.getAudioMetadata(finalAudioPath);
      await job.updateProgress(98);

      // 8. Limpar arquivos temporários
      await this.cleanupWorkDirectory(workDir);
      await job.updateProgress(100);

      const processingTime = Date.now() - startTime;

      const result: RenderJobResult = {
        success: true,
        audioUrl,
        duration: audioMetadata.duration,
        fileSize: audioMetadata.fileSize,
        processingTime,
        metadata: {
          provider: ttsConfig.provider,
          voice: ttsConfig.voice,
          language: ttsConfig.language,
          sampleRate: audioMetadata.sampleRate,
          bitRate: audioMetadata.bitRate,
          format: 'mp3',
        },
      };

      console.log(`✅ [TTSWorker] TTS gerado com sucesso: ${projectId}`);
      return result;

    } catch (error) {
      console.error(`❌ [TTSWorker] Erro ao processar TTS ${projectId}:`, error);
      
      // Tentar limpar arquivos em caso de erro
      try {
        const workDir = path.join(process.cwd(), 'temp', 'tts', projectId);
        await this.cleanupWorkDirectory(workDir);
      } catch (cleanupError) {
        console.error('❌ [TTSWorker] Erro ao limpar arquivos:', cleanupError);
      }

      throw error;
    }
  }

  private async validateTTSConfig(config: TTSConfig): Promise<void> {
    const validProviders = ['azure', 'elevenlabs', 'google', 'openai'];
    
    if (!validProviders.includes(config.provider)) {
      throw new Error(`Provedor TTS inválido: ${config.provider}`);
    }

    if (!config.voice) {
      throw new Error('Voz não especificada');
    }

    if (!config.language) {
      throw new Error('Idioma não especificado');
    }

    console.log(`✅ [TTSWorker] Configuração TTS validada: ${config.provider}`);
  }

  private async prepareWorkDirectory(projectId: string): Promise<string> {
    const workDir = path.join(process.cwd(), 'temp', 'tts', projectId);
    
    try {
      await fs.mkdir(workDir, { recursive: true });
      console.log(`📁 [TTSWorker] Diretório de trabalho criado: ${workDir}`);
      return workDir;
    } catch (error) {
      console.error('❌ [TTSWorker] Erro ao criar diretório:', error);
      throw new Error(`Falha ao criar diretório de trabalho: ${error.message}`);
    }
  }

  private async processText(text: string, config: TTSConfig): Promise<string> {
    try {
      // Limpeza básica do texto
      let processedText = text
        .trim()
        .replace(/\s+/g, ' ') // Normalizar espaços
        .replace(/[^\w\s\.,!?;:'"()-]/g, ''); // Remover caracteres especiais

      // Adicionar pausas para pontuação (SSML básico)
      if (config.provider === 'azure' || config.provider === 'google') {
        processedText = processedText
          .replace(/\./g, '.<break time="500ms"/>')
          .replace(/,/g, ',<break time="300ms"/>')
          .replace(/;/g, ';<break time="400ms"/>');
        
        // Envolver em SSML se necessário
        processedText = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${config.language}">${processedText}</speak>`;
      }

      console.log(`📝 [TTSWorker] Texto processado (${processedText.length} caracteres)`);
      return processedText;
    } catch (error) {
      console.error('❌ [TTSWorker] Erro ao processar texto:', error);
      throw error;
    }
  }

  private async generateAudio(
    text: string,
    config: TTSConfig,
    workDir: string,
    onProgress: (progress: number) => Promise<void>
  ): Promise<string> {
    const outputPath = path.join(workDir, 'audio.mp3');

    try {
      await onProgress(10);

      switch (config.provider) {
        case 'azure':
          return await this.generateAzureTTS(text, config, outputPath, onProgress);
        case 'elevenlabs':
          return await this.generateElevenLabsTTS(text, config, outputPath, onProgress);
        case 'google':
          return await this.generateGoogleTTS(text, config, outputPath, onProgress);
        case 'openai':
          return await this.generateOpenAITTS(text, config, outputPath, onProgress);
        default:
          throw new Error(`Provedor TTS não suportado: ${config.provider}`);
      }
    } catch (error) {
      console.error('❌ [TTSWorker] Erro ao gerar áudio:', error);
      throw error;
    }
  }

  private async generateAzureTTS(
    text: string,
    config: TTSConfig,
    outputPath: string,
    onProgress: (progress: number) => Promise<void>
  ): Promise<string> {
    // Implementação Azure TTS (simulada por enquanto)
    console.log(`🔊 [TTSWorker] Gerando áudio com Azure TTS`);
    
    await onProgress(30);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await onProgress(60);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await onProgress(90);
    
    // Simular criação do arquivo de áudio
    const mockAudioData = Buffer.from('mock audio data');
    await fs.writeFile(outputPath, mockAudioData);
    
    await onProgress(100);
    
    console.log(`✅ [TTSWorker] Áudio Azure TTS gerado: ${outputPath}`);
    return outputPath;
  }

  private async generateElevenLabsTTS(
    text: string,
    config: TTSConfig,
    outputPath: string,
    onProgress: (progress: number) => Promise<void>
  ): Promise<string> {
    // Implementação ElevenLabs TTS (simulada por enquanto)
    console.log(`🔊 [TTSWorker] Gerando áudio com ElevenLabs TTS`);
    
    await onProgress(40);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await onProgress(80);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await onProgress(100);
    
    // Simular criação do arquivo de áudio
    const mockAudioData = Buffer.from('mock elevenlabs audio data');
    await fs.writeFile(outputPath, mockAudioData);
    
    console.log(`✅ [TTSWorker] Áudio ElevenLabs TTS gerado: ${outputPath}`);
    return outputPath;
  }

  private async generateGoogleTTS(
    text: string,
    config: TTSConfig,
    outputPath: string,
    onProgress: (progress: number) => Promise<void>
  ): Promise<string> {
    // Implementação Google TTS (simulada por enquanto)
    console.log(`🔊 [TTSWorker] Gerando áudio com Google TTS`);
    
    await onProgress(25);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await onProgress(70);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    await onProgress(100);
    
    // Simular criação do arquivo de áudio
    const mockAudioData = Buffer.from('mock google audio data');
    await fs.writeFile(outputPath, mockAudioData);
    
    console.log(`✅ [TTSWorker] Áudio Google TTS gerado: ${outputPath}`);
    return outputPath;
  }

  private async generateOpenAITTS(
    text: string,
    config: TTSConfig,
    outputPath: string,
    onProgress: (progress: number) => Promise<void>
  ): Promise<string> {
    // Implementação OpenAI TTS (simulada por enquanto)
    console.log(`🔊 [TTSWorker] Gerando áudio com OpenAI TTS`);
    
    await onProgress(35);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await onProgress(75);
    await new Promise(resolve => setTimeout(resolve, 900));
    
    await onProgress(100);
    
    // Simular criação do arquivo de áudio
    const mockAudioData = Buffer.from('mock openai audio data');
    await fs.writeFile(outputPath, mockAudioData);
    
    console.log(`✅ [TTSWorker] Áudio OpenAI TTS gerado: ${outputPath}`);
    return outputPath;
  }

  private async postProcessAudio(audioPath: string, workDir: string): Promise<string> {
    const processedPath = path.join(workDir, 'processed_audio.mp3');
    
    try {
      // Por enquanto, apenas copiar o arquivo (implementar normalização depois)
      await fs.copyFile(audioPath, processedPath);
      
      console.log(`🎛️ [TTSWorker] Áudio pós-processado: ${processedPath}`);
      return processedPath;
    } catch (error) {
      console.error('❌ [TTSWorker] Erro no pós-processamento:', error);
      return audioPath; // Retornar original em caso de erro
    }
  }

  private async uploadAudio(audioPath: string, projectId: string): Promise<string> {
    try {
      // Por enquanto, simular upload (implementar S3/storage real depois)
      const audioUrl = `https://storage.example.com/audio/${projectId}/tts.mp3`;
      
      console.log(`📤 [TTSWorker] Áudio "enviado" para storage: ${audioUrl}`);
      return audioUrl;
    } catch (error) {
      console.error('❌ [TTSWorker] Erro ao fazer upload:', error);
      throw error;
    }
  }

  private async getAudioMetadata(audioPath: string): Promise<{
    duration: number;
    fileSize: number;
    sampleRate: number;
    bitRate: number;
  }> {
    try {
      const stats = await fs.stat(audioPath);
      
      // Metadados simulados (implementar análise real depois)
      return {
        duration: 10, // segundos
        fileSize: stats.size,
        sampleRate: 44100,
        bitRate: 128000,
      };
    } catch (error) {
      console.error('❌ [TTSWorker] Erro ao obter metadados:', error);
      throw error;
    }
  }

  private async cleanupWorkDirectory(workDir: string): Promise<void> {
    try {
      await fs.rm(workDir, { recursive: true, force: true });
      console.log(`🧹 [TTSWorker] Diretório limpo: ${workDir}`);
    } catch (error) {
      console.error('❌ [TTSWorker] Erro ao limpar diretório:', error);
    }
  }

  private async updateProjectStatus(projectId: string, status: string, result?: any): Promise<void> {
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status,
          audioUrl: result?.audioUrl,
          duration: result?.duration,
          updatedAt: new Date(),
        },
      });

      console.log(`📊 [TTSWorker] Status do projeto ${projectId} atualizado: ${status}`);
    } catch (error) {
      console.error('❌ [TTSWorker] Erro ao atualizar projeto:', error);
    }
  }

  public async close(): Promise<void> {
    if (this.worker && this.isRunning) {
      await this.worker.close();
      this.isRunning = false;
      console.log('✅ [TTSWorker] Worker fechado');
    }
  }

  public getStatus(): { isRunning: boolean; queueName: string } {
    return {
      isRunning: this.isRunning,
      queueName: 'render-tts',
    };
  }
}

// Exportar instância singleton
export const ttsWorker = new TTSWorker();