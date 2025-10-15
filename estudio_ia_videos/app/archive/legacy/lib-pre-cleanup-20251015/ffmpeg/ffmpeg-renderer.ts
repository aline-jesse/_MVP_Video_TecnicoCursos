/**
 * FFmpeg Renderer - Renderização de vídeo usando FFmpeg
 * 
 * Este módulo fornece funções para renderizar vídeos usando FFmpeg,
 * incluindo composição de múltiplas streams, aplicação de filtros,
 * e encoding em diferentes formatos.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execPromise = promisify(exec);

export interface FFmpegRenderOptions {
  inputFiles: string[];
  outputFile: string;
  width?: number;
  height?: number;
  fps?: number;
  videoBitrate?: string;
  audioBitrate?: string;
  codec?: string;
  audioCodec?: string;
  format?: string;
  filters?: string[];
  preset?: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow';
  crf?: number; // Quality (0-51, lower is better, 23 is default)
}

export interface RenderProgress {
  frame: number;
  fps: number;
  quality: number;
  size: string;
  time: string;
  bitrate: string;
  speed: string;
  progress: number; // 0-100
}

export class FFmpegRenderer {
  private ffmpegPath: string;
  private ffprobePath: string;

  constructor(ffmpegPath = 'ffmpeg', ffprobePath = 'ffprobe') {
    this.ffmpegPath = ffmpegPath;
    this.ffprobePath = ffprobePath;
  }

  /**
   * Renderiza um vídeo com as opções fornecidas
   */
  async render(options: FFmpegRenderOptions, onProgress?: (progress: RenderProgress) => void): Promise<string> {
    const {
      inputFiles,
      outputFile,
      width = 1920,
      height = 1080,
      fps = 30,
      videoBitrate = '5000k',
      audioBitrate = '192k',
      codec = 'libx264',
      audioCodec = 'aac',
      format = 'mp4',
      filters = [],
      preset = 'medium',
      crf = 23
    } = options;

    // Validação de inputs
    if (!inputFiles || inputFiles.length === 0) {
      throw new Error('Nenhum arquivo de entrada fornecido');
    }

    // Construir comando FFmpeg
    const filterComplex = this.buildFilterComplex(inputFiles, filters, width, height);
    
    const command = [
      this.ffmpegPath,
      ...inputFiles.flatMap(file => ['-i', file]),
      '-filter_complex', filterComplex,
      '-c:v', codec,
      '-preset', preset,
      '-crf', crf.toString(),
      '-b:v', videoBitrate,
      '-c:a', audioCodec,
      '-b:a', audioBitrate,
      '-r', fps.toString(),
      '-f', format,
      '-y', // Sobrescrever arquivo de saída
      outputFile
    ].join(' ');

    try {
      // Executar FFmpeg
      const { stdout, stderr } = await execPromise(command);
      
      // Parse progress se callback fornecido
      if (onProgress && stderr) {
        this.parseProgress(stderr, onProgress);
      }

      return outputFile;
    } catch (error: any) {
      throw new Error(`Erro ao renderizar vídeo: ${error.message}`);
    }
  }

  /**
   * Mescla múltiplos vídeos em um único arquivo
   */
  async mergeVideos(videoFiles: string[], outputFile: string): Promise<string> {
    // Criar arquivo de lista temporário
    const listFile = path.join(path.dirname(outputFile), 'filelist.txt');
    const fileContent = videoFiles.map(file => `file '${file}'`).join('\n');
    await fs.writeFile(listFile, fileContent);

    try {
      const command = [
        this.ffmpegPath,
        '-f', 'concat',
        '-safe', '0',
        '-i', listFile,
        '-c', 'copy',
        '-y',
        outputFile
      ].join(' ');

      await execPromise(command);
      
      // Remover arquivo temporário
      await fs.unlink(listFile);

      return outputFile;
    } catch (error: any) {
      // Limpar arquivo temporário em caso de erro
      try {
        await fs.unlink(listFile);
      } catch {}
      
      throw new Error(`Erro ao mesclar vídeos: ${error.message}`);
    }
  }

  /**
   * Adiciona áudio a um vídeo
   */
  async addAudio(videoFile: string, audioFile: string, outputFile: string): Promise<string> {
    const command = [
      this.ffmpegPath,
      '-i', videoFile,
      '-i', audioFile,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-shortest', // Termina quando o stream mais curto termina
      '-y',
      outputFile
    ].join(' ');

    await execPromise(command);
    return outputFile;
  }

  /**
   * Extrai frames de um vídeo
   */
  async extractFrames(videoFile: string, outputPattern: string, fps = 1): Promise<string[]> {
    const command = [
      this.ffmpegPath,
      '-i', videoFile,
      '-vf', `fps=${fps}`,
      '-y',
      outputPattern
    ].join(' ');

    await execPromise(command);

    // Listar arquivos gerados
    const outputDir = path.dirname(outputPattern);
    const files = await fs.readdir(outputDir);
    const pattern = path.basename(outputPattern).replace('%d', '\\d+');
    const regex = new RegExp(pattern);

    return files
      .filter(file => regex.test(file))
      .map(file => path.join(outputDir, file));
  }

  /**
   * Obtém informações sobre um arquivo de vídeo
   */
  async getVideoInfo(videoFile: string): Promise<any> {
    const command = [
      this.ffprobePath,
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      videoFile
    ].join(' ');

    const { stdout } = await execPromise(command);
    return JSON.parse(stdout);
  }

  /**
   * Constrói filter_complex para FFmpeg
   */
  private buildFilterComplex(inputFiles: string[], additionalFilters: string[], width: number, height: number): string {
    const filters = [
      // Escalar e formatar cada input
      ...inputFiles.map((_, index) => `[${index}:v]scale=${width}:${height},setsar=1[v${index}]`),
      // Aplicar filtros adicionais
      ...additionalFilters,
      // Concatenar todos os vídeos
      inputFiles.length > 1
        ? `${inputFiles.map((_, i) => `[v${i}]`).join('')}concat=n=${inputFiles.length}:v=1:a=0[outv]`
        : '[v0]copy[outv]'
    ];

    return filters.join(';');
  }

  /**
   * Parse do progresso do FFmpeg
   */
  private parseProgress(stderr: string, callback: (progress: RenderProgress) => void): void {
    const progressRegex = /frame=\s*(\d+)\s+fps=\s*([\d.]+)\s+q=([\d.-]+)\s+size=\s*(\S+)\s+time=(\S+)\s+bitrate=\s*(\S+)\s+speed=\s*(\S+)/;
    const matches = stderr.match(progressRegex);

    if (matches) {
      const progress: RenderProgress = {
        frame: parseInt(matches[1]),
        fps: parseFloat(matches[2]),
        quality: parseFloat(matches[3]),
        size: matches[4],
        time: matches[5],
        bitrate: matches[6],
        speed: matches[7],
        progress: 0 // Seria necessário saber a duração total para calcular porcentagem exata
      };

      callback(progress);
    }
  }
}

// Instância singleton
let rendererInstance: FFmpegRenderer | null = null;

export function getFFmpegRenderer(ffmpegPath?: string, ffprobePath?: string): FFmpegRenderer {
  if (!rendererInstance) {
    rendererInstance = new FFmpegRenderer(ffmpegPath, ffprobePath);
  }
  return rendererInstance;
}

export default FFmpegRenderer;
