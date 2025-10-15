/**
 * 🎬 RENDER SERVICE - Sprint 48 - FASE 2
 * Serviço de renderização que integra FFmpeg com sistema de filas
 */

import { FFmpegRenderer, VideoScene, FFmpegConfig, RenderProgress } from './ffmpeg-utils';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export interface RenderRequest {
  projectId: string;
  scenes: VideoScene[];
  config: FFmpegConfig;
  outputFormat: 'mp4' | 'webm' | 'mov';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  userId?: string;
}

export interface RenderResult {
  success: boolean;
  videoPath?: string;
  thumbnailPath?: string;
  duration?: number;
  fileSize?: number;
  error?: string;
  metadata?: {
    width: number;
    height: number;
    fps: number;
    bitrate: number;
  };
}

export class RenderService {
  private renderer: FFmpegRenderer;
  private workDir: string;
  private outputDir: string;

  constructor() {
    this.workDir = path.join(process.cwd(), 'temp', 'render');
    this.outputDir = path.join(process.cwd(), 'public', 'videos');
    this.renderer = new FFmpegRenderer(this.workDir);
  }

  /**
   * Inicializa o serviço de renderização
   */
  public async initialize(): Promise<void> {
    try {
      // Verificar se FFmpeg está disponível
      const isAvailable = await FFmpegRenderer.checkFFmpegAvailability();
      if (!isAvailable) {
        console.warn('⚠️ [RenderService] FFmpeg não encontrado, usando renderização simulada');
      }

      // Criar diretórios necessários
      await this.ensureDirectories();
      
      console.log('✅ [RenderService] Serviço inicializado com sucesso');
    } catch (error) {
      console.error('❌ [RenderService] Erro na inicialização:', error);
      throw error;
    }
  }

  /**
   * Renderiza vídeo a partir de uma requisição
   */
  public async renderVideo(
    request: RenderRequest,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<RenderResult> {
    const startTime = Date.now();
    let tempFiles: string[] = [];

    try {
      console.log(`🎬 [RenderService] Iniciando renderização do projeto ${request.projectId}`);

      // 1. Atualizar status do projeto
      await this.updateProjectStatus(request.projectId, 'rendering', 0);

      // 2. Validar requisição
      await this.validateRequest(request);

      // 3. Preparar configuração otimizada
      const config = this.optimizeConfig(request.config, request.quality);

      // 4. Preparar caminhos de arquivos
      const { videoPath, thumbnailPath, workPath } = await this.preparePaths(request.projectId, request.outputFormat);
      tempFiles.push(workPath);

      // 5. Renderizar vídeo com FFmpeg (obrigatório)
      if (!(await FFmpegRenderer.checkFFmpegAvailability())) {
        throw new Error('FFmpeg não está disponível. Renderização real requer FFmpeg instalado.');
      }
      
      const result = await this.renderWithFFmpeg(request, config, workPath, videoPath, thumbnailPath, onProgress);

      // 6. Atualizar projeto com resultado
      if (result.success) {
        await this.updateProjectStatus(request.projectId, 'completed', 100, {
          videoPath: result.videoPath,
          thumbnailPath: result.thumbnailPath,
          duration: result.duration,
          fileSize: result.fileSize,
        });
      } else {
        await this.updateProjectStatus(request.projectId, 'failed', 0, { error: result.error });
      }

      const renderTime = Date.now() - startTime;
      console.log(`✅ [RenderService] Renderização concluída em ${renderTime}ms`);

      return result;

    } catch (error) {
      console.error('❌ [RenderService] Erro na renderização:', error);
      
      await this.updateProjectStatus(request.projectId, 'failed', 0, { 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    } finally {
      // Limpar arquivos temporários
      await this.cleanupTempFiles(tempFiles);
    }
  }

  /**
   * Renderização real com FFmpeg
   */
  private async renderWithFFmpeg(
    request: RenderRequest,
    config: FFmpegConfig,
    workPath: string,
    videoPath: string,
    thumbnailPath: string,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<RenderResult> {
    try {
      // Renderizar vídeo
      const outputPath = await this.renderer.renderVideo(
        request.scenes,
        config,
        workPath,
        (progress) => {
          // Atualizar progresso no banco
          this.updateProjectStatus(request.projectId, 'rendering', progress.percentage);
          
          // Callback externo
          if (onProgress) {
            onProgress(progress);
          }
        }
      );

      // Mover arquivo para diretório final
      await fs.copyFile(workPath, videoPath);

      // Gerar thumbnail
      await this.renderer.generateThumbnail(videoPath, thumbnailPath, 1);

      // Obter metadados do vídeo
      const metadata = await this.renderer.getVideoInfo(videoPath);

      return {
        success: true,
        videoPath,
        thumbnailPath,
        duration: metadata.duration,
        fileSize: metadata.size,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          fps: metadata.fps,
          bitrate: metadata.bitrate,
        },
      };

    } catch (error) {
      console.error('❌ [RenderService] Erro na renderização FFmpeg:', error);
      throw error;
    }
  }

  // Método simulateRender removido - Sistema agora requer FFmpeg real

  /**
   * Valida requisição de renderização
   */
  private async validateRequest(request: RenderRequest): Promise<void> {
    if (!request.projectId) {
      throw new Error('ID do projeto é obrigatório');
    }

    if (!request.scenes || request.scenes.length === 0) {
      throw new Error('Pelo menos uma cena é obrigatória');
    }

    if (!request.config) {
      throw new Error('Configuração de renderização é obrigatória');
    }

    if (request.config.duration <= 0) {
      throw new Error('Duração deve ser maior que zero');
    }

    // Verificar se projeto existe
    const project = await prisma.project.findUnique({
      where: { id: request.projectId },
    });

    if (!project) {
      throw new Error('Projeto não encontrado');
    }
  }

  /**
   * Otimiza configuração baseada na qualidade
   */
  private optimizeConfig(baseConfig: FFmpegConfig, quality: string): FFmpegConfig {
    const qualityPresets = {
      low: { crf: 28, preset: 'fast', fps: 24 },
      medium: { crf: 23, preset: 'medium', fps: 30 },
      high: { crf: 18, preset: 'slow', fps: 30 },
      ultra: { crf: 15, preset: 'veryslow', fps: 60 },
    };

    const preset = qualityPresets[quality as keyof typeof qualityPresets] || qualityPresets.medium;

    return {
      ...baseConfig,
      ...preset,
      codec: 'libx264',
    };
  }

  /**
   * Prepara caminhos de arquivos
   */
  private async preparePaths(projectId: string, format: string): Promise<{
    videoPath: string;
    thumbnailPath: string;
    workPath: string;
  }> {
    const filename = `${projectId}_${uuidv4()}`;
    
    const videoPath = path.join(this.outputDir, `${filename}.${format}`);
    const thumbnailPath = path.join(this.outputDir, `${filename}_thumb.jpg`);
    const workPath = path.join(this.workDir, `${filename}_work.${format}`);

    return { videoPath, thumbnailPath, workPath };
  }

  /**
   * Atualiza status do projeto
   */
  private async updateProjectStatus(
    projectId: string,
    status: string,
    progress: number,
    metadata?: any
  ): Promise<void> {
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status,
          progress,
          ...(metadata && { metadata }),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('❌ [RenderService] Erro ao atualizar status:', error);
    }
  }

  /**
   * Garante que diretórios existem
   */
  private async ensureDirectories(): Promise<void> {
    const dirs = [this.workDir, this.outputDir];
    
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 [RenderService] Diretório criado: ${dir}`);
      }
    }
  }

  /**
   * Limpa arquivos temporários
   */
  private async cleanupTempFiles(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        await fs.unlink(file);
        console.log(`🗑️ [RenderService] Arquivo temporário removido: ${file}`);
      } catch (error) {
        // Ignorar erros de limpeza
      }
    }
  }

  /**
   * Cria vídeo placeholder para renderização simulada
   */
  private createPlaceholderVideo(request: RenderRequest): Buffer {
    // Criar um arquivo MP4 mínimo válido (header básico)
    const mp4Header = Buffer.from([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // ftyp box
      0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
      0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
      0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31,
    ]);

    return mp4Header;
  }

  /**
   * Cria thumbnail placeholder (SVG)
   */
  private createPlaceholderThumbnail(request: RenderRequest): string {
    const resolution = this.parseResolution(request.config.resolution);
    
    return `<svg width="${resolution.width}" height="${resolution.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a"/>
      <text x="50%" y="50%" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dy=".3em">
        📹 Vídeo Renderizado
      </text>
      <text x="50%" y="60%" font-family="Arial" font-size="24" fill="#888" text-anchor="middle" dy=".3em">
        ${resolution.width}x${resolution.height} • ${request.config.fps}fps
      </text>
    </svg>`;
  }

  /**
   * Analisa resolução
   */
  private parseResolution(resolution: string): { width: number; height: number } {
    const resolutions: Record<string, { width: number; height: number }> = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '4k': { width: 3840, height: 2160 },
      '480p': { width: 854, height: 480 },
      '360p': { width: 640, height: 360 },
    };
    
    return resolutions[resolution] || { width: 1920, height: 1080 };
  }

  /**
   * Obtém estatísticas do serviço
   */
  public async getStats(): Promise<{
    ffmpegAvailable: boolean;
    activeRenders: number;
    completedRenders: number;
    failedRenders: number;
    totalDiskUsage: number;
  }> {
    const ffmpegAvailable = await FFmpegRenderer.checkFFmpegAvailability();
    
    const stats = await prisma.project.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      where: {
        status: {
          in: ['rendering', 'completed', 'failed'],
        },
      },
    });

    const activeRenders = stats.find(s => s.status === 'rendering')?._count.status || 0;
    const completedRenders = stats.find(s => s.status === 'completed')?._count.status || 0;
    const failedRenders = stats.find(s => s.status === 'failed')?._count.status || 0;

    // Calcular uso de disco (simulado)
    let totalDiskUsage = 0;
    try {
      const files = await fs.readdir(this.outputDir);
      for (const file of files) {
        const stat = await fs.stat(path.join(this.outputDir, file));
        totalDiskUsage += stat.size;
      }
    } catch (error) {
      // Ignorar erros de leitura
    }

    return {
      ffmpegAvailable,
      activeRenders,
      completedRenders,
      failedRenders,
      totalDiskUsage,
    };
  }
}