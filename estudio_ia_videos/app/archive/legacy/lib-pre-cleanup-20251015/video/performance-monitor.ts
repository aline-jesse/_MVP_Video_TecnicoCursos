/**
 * 📊 Video Performance Monitor
 * 
 * Sistema de monitoramento de performance para operações de vídeo:
 * - Métricas de processamento em tempo real
 * - Uso de CPU e memória
 * - FPS e throughput
 * - Alertas de performance
 * - Estatísticas agregadas
 * - Exportação de relatórios
 */

import { EventEmitter } from 'events';
import os from 'os';
import v8 from 'v8';

// ==================== TYPES ====================

export interface PerformanceMetrics {
  // Processamento
  fps: number;                    // Frames por segundo
  frameTime: number;              // Tempo por frame (ms)
  throughput: number;             // MB/s processados
  
  // Recursos do sistema
  cpuUsage: number;              // % de uso da CPU
  memoryUsed: number;            // MB de memória usada
  memoryTotal: number;           // MB total de memória
  memoryPercent: number;         // % de memória usada
  
  // GPU (se disponível)
  gpuUsage?: number;             // % de uso da GPU
  gpuMemoryUsed?: number;        // MB de memória GPU
  
  // Disco
  diskReadSpeed: number;         // MB/s leitura
  diskWriteSpeed: number;        // MB/s escrita
  
  // Rede (para processamento remoto)
  networkUpload?: number;        // MB/s upload
  networkDownload?: number;      // MB/s download
  
  // Métricas agregadas
  averageFPS: number;
  peakMemory: number;
  totalFramesProcessed: number;
  droppedFrames: number;
}

export interface ProcessingStats {
  startTime: Date;
  endTime?: Date;
  duration: number;              // Segundos
  totalFrames: number;
  processedFrames: number;
  failedFrames: number;
  averageFrameTime: number;      // ms
  peakCPU: number;              // %
  peakMemory: number;           // MB
  averageThroughput: number;    // MB/s
  efficiency: number;           // % (processedFrames / totalFrames)
}

export interface PerformanceAlert {
  type: 'cpu' | 'memory' | 'fps' | 'throughput' | 'disk';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

export interface MonitorOptions {
  sampleInterval?: number;       // ms entre samples (padrão: 1000)
  alertThresholds?: {
    cpu?: number;                // % (padrão: 80)
    memory?: number;             // % (padrão: 90)
    fps?: number;                // mínimo (padrão: 24)
    throughput?: number;         // MB/s mínimo (padrão: 10)
  };
  enableGPU?: boolean;
  enableNetwork?: boolean;
  autoReport?: boolean;          // Gerar relatório automaticamente
}

export interface PerformanceReport {
  summary: ProcessingStats;
  metrics: PerformanceMetrics[];
  alerts: PerformanceAlert[];
  recommendations: string[];
  generatedAt: Date;
}

// ==================== CONSTANTS ====================

const DEFAULT_OPTIONS: Required<MonitorOptions> = {
  sampleInterval: 1000,
  alertThresholds: {
    cpu: 80,
    memory: 90,
    fps: 24,
    throughput: 10
  },
  enableGPU: false,
  enableNetwork: false,
  autoReport: true
};

// ==================== PERFORMANCE MONITOR CLASS ====================

export class VideoPerformanceMonitor extends EventEmitter {
  private options: Required<MonitorOptions>;
  private isMonitoring: boolean = false;
  private monitoringTimer?: NodeJS.Timeout;
  
  private startTime?: Date;
  private samples: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  
  private frameCount: number = 0;
  private lastFrameTime: number = Date.now();
  private totalBytesProcessed: number = 0;
  private lastBytesProcessed: number = 0;
  private lastSampleTime: number = Date.now();
  
  private diskReadBytes: number = 0;
  private diskWriteBytes: number = 0;
  private lastDiskRead: number = 0;
  private lastDiskWrite: number = 0;

  constructor(options?: MonitorOptions) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Iniciar monitoramento
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startTime = new Date();
    this.samples = [];
    this.alerts = [];
    this.frameCount = 0;
    this.totalBytesProcessed = 0;
    this.lastFrameTime = Date.now();
    this.lastSampleTime = Date.now();

    // Iniciar coleta de métricas
    this.monitoringTimer = setInterval(
      () => this.collectMetrics(),
      this.options.sampleInterval
    );

    this.emit('monitor:started');
    console.log('📊 Performance monitoring iniciado');
  }

  /**
   * Parar monitoramento
   */
  stop(): ProcessingStats {
    if (!this.isMonitoring) {
      throw new Error('Monitor não está ativo');
    }

    this.isMonitoring = false;
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }

    const stats = this.getStats();
    
    if (this.options.autoReport) {
      const report = this.generateReport();
      this.emit('report:generated', report);
    }

    this.emit('monitor:stopped', stats);
    console.log('📊 Performance monitoring parado');
    
    return stats;
  }

  /**
   * Registrar frame processado
   */
  recordFrame(): void {
    if (!this.isMonitoring) return;

    this.frameCount++;
    const now = Date.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.emit('frame:processed', {
      frameNumber: this.frameCount,
      frameTime
    });
  }

  /**
   * Registrar bytes processados
   */
  recordBytes(bytes: number): void {
    if (!this.isMonitoring) return;

    this.totalBytesProcessed += bytes;
    this.emit('bytes:processed', bytes);
  }

  /**
   * Registrar operação de disco
   */
  recordDiskIO(read: number, write: number): void {
    if (!this.isMonitoring) return;

    this.diskReadBytes += read;
    this.diskWriteBytes += write;
  }

  /**
   * Obter métricas atuais
   */
  getCurrentMetrics(): PerformanceMetrics {
    return this.collectMetrics();
  }

  /**
   * Obter estatísticas agregadas
   */
  getStats(): ProcessingStats {
    if (!this.startTime) {
      throw new Error('Monitor não foi iniciado');
    }

    const now = new Date();
    const duration = (now.getTime() - this.startTime.getTime()) / 1000;

    const allFPS = this.samples.map(s => s.fps);
    const allCPU = this.samples.map(s => s.cpuUsage);
    const allMemory = this.samples.map(s => s.memoryUsed);
    const allThroughput = this.samples.map(s => s.throughput);

    return {
      startTime: this.startTime,
      endTime: this.isMonitoring ? undefined : now,
      duration,
      totalFrames: this.frameCount,
      processedFrames: this.frameCount,
      failedFrames: 0,
      averageFrameTime: duration > 0 ? (duration * 1000) / this.frameCount : 0,
      peakCPU: Math.max(...allCPU, 0),
      peakMemory: Math.max(...allMemory, 0),
      averageThroughput: allThroughput.length > 0 
        ? allThroughput.reduce((a, b) => a + b, 0) / allThroughput.length 
        : 0,
      efficiency: 100
    };
  }

  /**
   * Gerar relatório completo
   */
  generateReport(): PerformanceReport {
    const stats = this.getStats();
    const recommendations = this.generateRecommendations(stats);

    return {
      summary: stats,
      metrics: this.samples,
      alerts: this.alerts,
      recommendations,
      generatedAt: new Date()
    };
  }

  /**
   * Exportar relatório em formato legível
   */
  exportReport(format: 'text' | 'json' | 'markdown' = 'text'): string {
    const report = this.generateReport();

    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      
      case 'markdown':
        return this.formatReportMarkdown(report);
      
      default:
        return this.formatReportText(report);
    }
  }

  // ==================== PRIVATE METHODS ====================

  private collectMetrics(): PerformanceMetrics {
    const now = Date.now();
    const elapsed = (now - this.lastSampleTime) / 1000; // Segundos
    this.lastSampleTime = now;

    // CPU
    const cpus = os.cpus();
    const cpuUsage = this.calculateCPUUsage(cpus);

    // Memória
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsed = usedMem / 1024 / 1024; // MB
    const memoryTotal = totalMem / 1024 / 1024; // MB
    const memoryPercent = (usedMem / totalMem) * 100;

    // FPS
    const frameTime = this.frameCount > 0 
      ? (Date.now() - (this.startTime?.getTime() || Date.now())) / this.frameCount 
      : 0;
    const fps = frameTime > 0 ? 1000 / frameTime : 0;

    // Throughput
    const bytesInPeriod = this.totalBytesProcessed - this.lastBytesProcessed;
    const throughput = elapsed > 0 ? (bytesInPeriod / 1024 / 1024) / elapsed : 0;
    this.lastBytesProcessed = this.totalBytesProcessed;

    // Disco
    const diskReadSpeed = elapsed > 0 
      ? ((this.diskReadBytes - this.lastDiskRead) / 1024 / 1024) / elapsed 
      : 0;
    const diskWriteSpeed = elapsed > 0 
      ? ((this.diskWriteBytes - this.lastDiskWrite) / 1024 / 1024) / elapsed 
      : 0;
    this.lastDiskRead = this.diskReadBytes;
    this.lastDiskWrite = this.diskWriteBytes;

    // Métricas agregadas
    const averageFPS = this.samples.length > 0
      ? this.samples.reduce((sum, s) => sum + s.fps, 0) / this.samples.length
      : fps;
    const peakMemory = this.samples.length > 0
      ? Math.max(...this.samples.map(s => s.memoryUsed), memoryUsed)
      : memoryUsed;

    const metrics: PerformanceMetrics = {
      fps,
      frameTime,
      throughput,
      cpuUsage,
      memoryUsed,
      memoryTotal,
      memoryPercent,
      diskReadSpeed,
      diskWriteSpeed,
      averageFPS,
      peakMemory,
      totalFramesProcessed: this.frameCount,
      droppedFrames: 0
    };

    // Armazenar sample
    this.samples.push(metrics);

    // Verificar alertas
    this.checkAlerts(metrics);

    // Emitir evento
    this.emit('metrics:collected', metrics);

    return metrics;
  }

  private calculateCPUUsage(cpus: os.CpuInfo[]): number {
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);

    return usage;
  }

  private checkAlerts(metrics: PerformanceMetrics): void {
    const thresholds = this.options.alertThresholds;

    // CPU
    if (metrics.cpuUsage > thresholds.cpu!) {
      this.addAlert({
        type: 'cpu',
        severity: metrics.cpuUsage > 95 ? 'critical' : 'warning',
        message: `Alto uso de CPU: ${metrics.cpuUsage.toFixed(1)}%`,
        value: metrics.cpuUsage,
        threshold: thresholds.cpu!,
        timestamp: new Date()
      });
    }

    // Memória
    if (metrics.memoryPercent > thresholds.memory!) {
      this.addAlert({
        type: 'memory',
        severity: metrics.memoryPercent > 95 ? 'critical' : 'warning',
        message: `Alto uso de memória: ${metrics.memoryPercent.toFixed(1)}%`,
        value: metrics.memoryPercent,
        threshold: thresholds.memory!,
        timestamp: new Date()
      });
    }

    // FPS
    if (metrics.fps < thresholds.fps! && metrics.fps > 0) {
      this.addAlert({
        type: 'fps',
        severity: metrics.fps < 15 ? 'critical' : 'warning',
        message: `FPS baixo: ${metrics.fps.toFixed(1)}`,
        value: metrics.fps,
        threshold: thresholds.fps!,
        timestamp: new Date()
      });
    }

    // Throughput
    if (metrics.throughput < thresholds.throughput! && metrics.throughput > 0) {
      this.addAlert({
        type: 'throughput',
        severity: 'info',
        message: `Throughput baixo: ${metrics.throughput.toFixed(1)} MB/s`,
        value: metrics.throughput,
        threshold: thresholds.throughput!,
        timestamp: new Date()
      });
    }
  }

  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    this.emit('alert', alert);

    const emoji = alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} ${alert.message}`);
  }

  private generateRecommendations(stats: ProcessingStats): string[] {
    const recommendations: string[] = [];

    // CPU
    if (stats.peakCPU > 90) {
      recommendations.push('💡 CPU está sobrecarregada. Considere:');
      recommendations.push('   - Reduzir qualidade de encoding');
      recommendations.push('   - Processar em lotes menores');
      recommendations.push('   - Usar hardware acceleration (se disponível)');
    }

    // Memória
    if (stats.peakMemory > (os.totalmem() / 1024 / 1024) * 0.9) {
      recommendations.push('💡 Memória quase esgotada. Considere:');
      recommendations.push('   - Processar vídeos menores');
      recommendations.push('   - Liberar cache entre operações');
      recommendations.push('   - Aumentar memória RAM do sistema');
    }

    // FPS
    if (stats.averageFrameTime > 100) {
      recommendations.push('💡 Processamento lento. Considere:');
      recommendations.push('   - Otimizar pipeline de processamento');
      recommendations.push('   - Usar codec mais rápido (ex: H.264 fast)');
      recommendations.push('   - Processar em resolução menor');
    }

    // Throughput
    if (stats.averageThroughput < 5) {
      recommendations.push('💡 Throughput baixo. Considere:');
      recommendations.push('   - Verificar velocidade do disco');
      recommendations.push('   - Usar SSD ao invés de HDD');
      recommendations.push('   - Otimizar I/O de arquivos');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance dentro dos padrões esperados!');
    }

    return recommendations;
  }

  private formatReportText(report: PerformanceReport): string {
    const { summary, alerts, recommendations } = report;

    let text = '📊 RELATÓRIO DE PERFORMANCE\n';
    text += '═'.repeat(60) + '\n\n';

    text += '📈 RESUMO\n';
    text += `Início: ${summary.startTime.toLocaleString()}\n`;
    text += `Duração: ${summary.duration.toFixed(2)}s\n`;
    text += `Frames Processados: ${summary.processedFrames} / ${summary.totalFrames}\n`;
    text += `Tempo Médio por Frame: ${summary.averageFrameTime.toFixed(2)}ms\n`;
    text += `Pico de CPU: ${summary.peakCPU.toFixed(1)}%\n`;
    text += `Pico de Memória: ${summary.peakMemory.toFixed(0)}MB\n`;
    text += `Throughput Médio: ${summary.averageThroughput.toFixed(2)} MB/s\n`;
    text += `Eficiência: ${summary.efficiency.toFixed(1)}%\n\n`;

    if (alerts.length > 0) {
      text += '⚠️ ALERTAS\n';
      for (const alert of alerts) {
        text += `[${alert.severity.toUpperCase()}] ${alert.message}\n`;
      }
      text += '\n';
    }

    if (recommendations.length > 0) {
      text += '💡 RECOMENDAÇÕES\n';
      for (const rec of recommendations) {
        text += `${rec}\n`;
      }
    }

    text += '\n' + '═'.repeat(60) + '\n';
    text += `Gerado em: ${report.generatedAt.toLocaleString()}\n`;

    return text;
  }

  private formatReportMarkdown(report: PerformanceReport): string {
    const { summary, alerts, recommendations } = report;

    let md = '# 📊 Relatório de Performance\n\n';

    md += '## 📈 Resumo\n\n';
    md += `- **Início:** ${summary.startTime.toLocaleString()}\n`;
    md += `- **Duração:** ${summary.duration.toFixed(2)}s\n`;
    md += `- **Frames:** ${summary.processedFrames} / ${summary.totalFrames}\n`;
    md += `- **Tempo/Frame:** ${summary.averageFrameTime.toFixed(2)}ms\n`;
    md += `- **Pico CPU:** ${summary.peakCPU.toFixed(1)}%\n`;
    md += `- **Pico Memória:** ${summary.peakMemory.toFixed(0)}MB\n`;
    md += `- **Throughput:** ${summary.averageThroughput.toFixed(2)} MB/s\n`;
    md += `- **Eficiência:** ${summary.efficiency.toFixed(1)}%\n\n`;

    if (alerts.length > 0) {
      md += '## ⚠️ Alertas\n\n';
      for (const alert of alerts) {
        const emoji = alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';
        md += `- ${emoji} **${alert.severity.toUpperCase()}:** ${alert.message}\n`;
      }
      md += '\n';
    }

    if (recommendations.length > 0) {
      md += '## 💡 Recomendações\n\n';
      for (const rec of recommendations) {
        md += `${rec}\n`;
      }
      md += '\n';
    }

    md += `---\n*Gerado em: ${report.generatedAt.toLocaleString()}*\n`;

    return md;
  }
}

// ==================== SINGLETON INSTANCE ====================

export const performanceMonitor = new VideoPerformanceMonitor();

export default VideoPerformanceMonitor;
