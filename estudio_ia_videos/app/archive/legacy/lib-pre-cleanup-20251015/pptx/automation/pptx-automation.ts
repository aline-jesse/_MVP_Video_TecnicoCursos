/**
 * 🤖 Sistema de Execução Automatizada - PPTX Processing
 * Responsável por automatizar o processamento de arquivos PPTX
 */

import { PPTXProcessor } from '../pptx-processor';
import { PPTXValidator } from '../validation/pptx-validator';
import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

export interface AutomationConfig {
  inputDir: string;
  outputDir: string;
  concurrency: number;
  retryAttempts: number;
  retryDelay: number;
  s3Bucket?: string;
  s3Prefix?: string;
  saveToDatabase?: boolean;
  generateReports?: boolean;
}

export interface ProcessingJob {
  id: string;
  filePath: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  result?: any;
  startTime?: Date;
  endTime?: Date;
  attempts: number;
}

export interface ProcessingResult {
  jobId: string;
  success: boolean;
  processingTime: number;
  slides: number;
  assets: {
    images: number;
    videos: number;
    audio: number;
  };
  outputFiles: string[];
  error?: string;
}

export class PPTXAutomation extends EventEmitter {
  private config: AutomationConfig;
  private processor: PPTXProcessor;
  private validator: PPTXValidator;
  private prisma: PrismaClient;
  private s3Client?: S3Client;
  private jobs: Map<string, ProcessingJob>;
  private processing: boolean;

  constructor(config: AutomationConfig) {
    super();
    this.config = {
      concurrency: 3,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    this.processor = new PPTXProcessor();
    this.validator = new PPTXValidator();
    this.prisma = new PrismaClient();
    this.jobs = new Map();
    this.processing = false;

    if (config.s3Bucket) {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
      });
    }

    this.setupEventHandlers();
  }

  /**
   * Inicia o processamento automatizado
   */
  async start(): Promise<void> {
    if (this.processing) {
      throw new Error('Sistema já está em execução');
    }

    this.processing = true;
    await this.scanInputDirectory();
    this.processNextBatch();
  }

  /**
   * Para o processamento automatizado
   */
  stop(): void {
    this.processing = false;
    this.emit('stopped');
  }

  /**
   * Adiciona um novo arquivo para processamento
   */
  async addFile(filePath: string): Promise<string> {
    const jobId = this.generateJobId(filePath);
    
    // Validar arquivo antes de adicionar
    const buffer = await fs.promises.readFile(filePath);
    const validation = await this.validator.validatePPTX(buffer);
    
    if (!validation.isValid) {
      throw new Error(`Arquivo inválido: ${validation.errors[0].message}`);
    }

    const job: ProcessingJob = {
      id: jobId,
      filePath,
      status: 'pending',
      progress: 0,
      attempts: 0
    };

    this.jobs.set(jobId, job);
    this.emit('job:added', job);

    if (this.processing) {
      this.processNextBatch();
    }

    return jobId;
  }

  /**
   * Obtém o status de um job específico
   */
  getJobStatus(jobId: string): ProcessingJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Obtém estatísticas do processamento
   */
  getStats(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    const stats = {
      total: this.jobs.size,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    };

    for (const job of this.jobs.values()) {
      stats[job.status]++;
    }

    return stats;
  }

  private setupEventHandlers(): void {
    this.on('job:started', (job: ProcessingJob) => {
      console.log(`Iniciando processamento do job ${job.id}`);
    });

    this.on('job:progress', (job: ProcessingJob, progress: number) => {
      console.log(`Progresso do job ${job.id}: ${progress}%`);
    });

    this.on('job:completed', (job: ProcessingJob, result: ProcessingResult) => {
      console.log(`Job ${job.id} completado em ${result.processingTime}ms`);
    });

    this.on('job:failed', (job: ProcessingJob, error: Error) => {
      console.error(`Erro no job ${job.id}:`, error);
    });
  }

  private async scanInputDirectory(): Promise<void> {
    const files = await fs.promises.readdir(this.config.inputDir);
    
    for (const file of files) {
      if (file.endsWith('.pptx')) {
        const filePath = path.join(this.config.inputDir, file);
        await this.addFile(filePath);
      }
    }
  }

  private async processNextBatch(): Promise<void> {
    if (!this.processing) return;

    const pendingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'pending')
      .slice(0, this.config.concurrency);

    if (pendingJobs.length === 0) {
      if (this.getStats().processing === 0) {
        this.emit('all:completed');
      }
      return;
    }

    await Promise.all(
      pendingJobs.map(job => this.processJob(job))
    );

    // Processar próximo lote
    setImmediate(() => this.processNextBatch());
  }

  private async processJob(job: ProcessingJob): Promise<void> {
    try {
      job.status = 'processing';
      job.startTime = new Date();
      job.attempts++;

      this.emit('job:started', job);

      // Processar arquivo
      const buffer = await fs.promises.readFile(job.filePath);
      const result = await this.processor.parse(buffer, progress => {
        job.progress = progress.progress;
        this.emit('job:progress', job, progress.progress);
      });

      // Salvar resultados
      const outputFiles = await this.saveResults(job.id, result);

      // Atualizar job
      job.status = 'completed';
      job.endTime = new Date();
      job.result = {
        jobId: job.id,
        success: true,
        processingTime: job.endTime.getTime() - job.startTime!.getTime(),
        slides: result.slides.length,
        assets: {
          images: result.slides.reduce((count, slide) => 
            count + slide.elements.filter(el => el.type === 'image').length, 0
          ),
          videos: 0,
          audio: 0
        },
        outputFiles
      };

      this.emit('job:completed', job, job.result);

    } catch (error) {
      job.error = error.message;

      if (job.attempts < this.config.retryAttempts) {
        // Agendar retry
        job.status = 'pending';
        setTimeout(() => {
          this.processJob(job);
        }, this.config.retryDelay * Math.pow(2, job.attempts - 1));
      } else {
        job.status = 'failed';
        job.endTime = new Date();
        this.emit('job:failed', job, error);
      }
    }
  }

  private async saveResults(jobId: string, result: any): Promise<string[]> {
    const outputFiles: string[] = [];

    // Salvar arquivo JSON com resultados
    const jsonPath = path.join(this.config.outputDir, `${jobId}.json`);
    await fs.promises.writeFile(jsonPath, JSON.stringify(result, null, 2));
    outputFiles.push(jsonPath);

    // Upload para S3 se configurado
    if (this.s3Client && this.config.s3Bucket) {
      const s3Key = `${this.config.s3Prefix || ''}${jobId}/result.json`;
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.config.s3Bucket,
        Key: s3Key,
        Body: JSON.stringify(result),
        ContentType: 'application/json'
      }));
      outputFiles.push(`s3://${this.config.s3Bucket}/${s3Key}`);
    }

    // Salvar no banco de dados se configurado
    if (this.config.saveToDatabase) {
      await this.saveToDatabase(jobId, result);
    }

    return outputFiles;
  }

  private async saveToDatabase(jobId: string, result: any): Promise<void> {
    try {
      await this.prisma.pptxProcessing.create({
        data: {
          jobId,
          status: 'completed',
          slides: result.slides.length,
          processingTime: new Date().getTime() - new Date(result.startTime).getTime(),
          metadata: result.metadata,
          result: result
        }
      });
    } catch (error) {
      console.error('Erro ao salvar no banco de dados:', error);
      // Não falhar o processamento por erro no banco
    }
  }

  private generateJobId(filePath: string): string {
    return createHash('md5')
      .update(`${filePath}-${Date.now()}`)
      .digest('hex')
      .substring(0, 8);
  }
}