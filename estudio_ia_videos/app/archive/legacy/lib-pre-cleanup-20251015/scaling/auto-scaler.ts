
/**
 * 📊 SPRINT 39 - Auto Scaler
 * Sistema de auto-scaling para workers FFmpeg/TTS
 */

interface WorkerMetrics {
  activeJobs: number;
  queuedJobs: number;
  cpuUsage: number;
  memoryUsage: number;
  avgProcessTime: number;
  throughput: number;
}

interface ScalingConfig {
  minWorkers: number;
  maxWorkers: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownPeriod: number; // ms
}

export class AutoScaler {
  private config: ScalingConfig = {
    minWorkers: 2,
    maxWorkers: 10,
    scaleUpThreshold: 0.7, // 70% de utilização
    scaleDownThreshold: 0.3, // 30% de utilização
    cooldownPeriod: 60000, // 1 minuto
  };

  private currentWorkers: number = 2;
  private lastScaleTime: number = 0;
  private metrics: WorkerMetrics = {
    activeJobs: 0,
    queuedJobs: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    avgProcessTime: 0,
    throughput: 0,
  };

  constructor(config?: Partial<ScalingConfig>) {
    this.config = { ...this.config, ...config };
    this.currentWorkers = this.config.minWorkers;
  }

  async updateMetrics(metrics: Partial<WorkerMetrics>): Promise<void> {
    this.metrics = { ...this.metrics, ...metrics };
    await this.evaluateScaling();
  }

  private async evaluateScaling(): Promise<void> {
    const now = Date.now();
    
    // Verificar cooldown
    if (now - this.lastScaleTime < this.config.cooldownPeriod) {
      return;
    }

    const utilization = this.calculateUtilization();

    if (utilization > this.config.scaleUpThreshold && this.currentWorkers < this.config.maxWorkers) {
      await this.scaleUp();
    } else if (utilization < this.config.scaleDownThreshold && this.currentWorkers > this.config.minWorkers) {
      await this.scaleDown();
    }
  }

  private calculateUtilization(): number {
    // Cálculo simplificado de utilização
    const jobLoad = (this.metrics.activeJobs + this.metrics.queuedJobs) / (this.currentWorkers * 10);
    const resourceLoad = (this.metrics.cpuUsage + this.metrics.memoryUsage) / 2;
    
    return Math.min((jobLoad + resourceLoad) / 2, 1);
  }

  private async scaleUp(): Promise<void> {
    const newCount = Math.min(this.currentWorkers + 1, this.config.maxWorkers);
    
    console.log(`📈 Scaling up: ${this.currentWorkers} → ${newCount} workers`);
    
    // Em produção, fazer chamada API para provisionar workers
    // await fetch('/api/workers/scale', { method: 'POST', body: JSON.stringify({ count: newCount }) });
    
    this.currentWorkers = newCount;
    this.lastScaleTime = Date.now();
  }

  private async scaleDown(): Promise<void> {
    const newCount = Math.max(this.currentWorkers - 1, this.config.minWorkers);
    
    console.log(`📉 Scaling down: ${this.currentWorkers} → ${newCount} workers`);
    
    // Em produção, fazer chamada API para desprovisionar workers
    // await fetch('/api/workers/scale', { method: 'POST', body: JSON.stringify({ count: newCount }) });
    
    this.currentWorkers = newCount;
    this.lastScaleTime = Date.now();
  }

  getStatus(): {
    currentWorkers: number;
    utilization: number;
    metrics: WorkerMetrics;
    canScaleUp: boolean;
    canScaleDown: boolean;
  } {
    return {
      currentWorkers: this.currentWorkers,
      utilization: this.calculateUtilization(),
      metrics: this.metrics,
      canScaleUp: this.currentWorkers < this.config.maxWorkers,
      canScaleDown: this.currentWorkers > this.config.minWorkers,
    };
  }
}

export const autoScaler = new AutoScaler();
