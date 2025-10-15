
/**
 * Cost Monitoring & Alerting - Sprint 40
 * Monitoramento de custos por serviço
 */

interface CostMetric {
  service: string;
  category: 'compute' | 'storage' | 'api' | 'cdn' | 'other';
  amount: number;
  currency: string;
  period: string;
  unit: string;
  details: Record<string, unknown>;
}

interface CostAlert {
  threshold: number;
  current: number;
  service: string;
  severity: 'warning' | 'critical';
}

export class CostMonitor {
  // Thresholds de alerta (em USD por dia)
  private static thresholds = {
    workers: 100,
    cdn: 50,
    tts_elevenlabs: 200,
    tts_azure: 150,
    storage_s3: 75,
    database: 50,
    total_daily: 500,
  };

  // Calcular custos de workers
  static calculateWorkerCosts(metrics: {
    totalJobs: number;
    totalMinutes: number;
    avgConcurrency: number;
  }): CostMetric {
    // Assumindo $0.0002 por minuto de processamento
    const costPerMinute = 0.0002;
    const amount = metrics.totalMinutes * costPerMinute;

    return {
      service: 'workers',
      category: 'compute',
      amount,
      currency: 'USD',
      period: '24h',
      unit: 'minutes',
      details: metrics,
    };
  }

  // Calcular custos de TTS
  static calculateTTSCosts(metrics: {
    elevenlabs_characters: number;
    azure_characters: number;
    google_characters: number;
  }): CostMetric[] {
    const costs: CostMetric[] = [];

    // ElevenLabs: $0.30 per 1K characters
    if (metrics.elevenlabs_characters > 0) {
      costs.push({
        service: 'tts_elevenlabs',
        category: 'api',
        amount: (metrics.elevenlabs_characters / 1000) * 0.30,
        currency: 'USD',
        period: '24h',
        unit: 'characters',
        details: { characters: metrics.elevenlabs_characters },
      });
    }

    // Azure: $0.016 per 1K characters
    if (metrics.azure_characters > 0) {
      costs.push({
        service: 'tts_azure',
        category: 'api',
        amount: (metrics.azure_characters / 1000) * 0.016,
        currency: 'USD',
        period: '24h',
        unit: 'characters',
        details: { characters: metrics.azure_characters },
      });
    }

    return costs;
  }

  // Calcular custos de storage
  static calculateStorageCosts(metrics: {
    totalGB: number;
    bandwidth_GB: number;
    requests: number;
  }): CostMetric {
    // S3 Pricing (aproximado)
    const storageCost = metrics.totalGB * 0.023; // $0.023 per GB
    const bandwidthCost = metrics.bandwidth_GB * 0.09; // $0.09 per GB
    const requestsCost = (metrics.requests / 1000) * 0.0004; // $0.0004 per 1K requests

    const total = storageCost + bandwidthCost + requestsCost;

    return {
      service: 'storage_s3',
      category: 'storage',
      amount: total,
      currency: 'USD',
      period: '24h',
      unit: 'GB',
      details: {
        storage: storageCost,
        bandwidth: bandwidthCost,
        requests: requestsCost,
      },
    };
  }

  // Calcular custos de CDN
  static calculateCDNCosts(metrics: {
    bandwidth_GB: number;
    requests: number;
  }): CostMetric {
    const bandwidthCost = metrics.bandwidth_GB * 0.085;
    const requestsCost = (metrics.requests / 10000) * 0.0075;

    return {
      service: 'cdn',
      category: 'cdn',
      amount: bandwidthCost + requestsCost,
      currency: 'USD',
      period: '24h',
      unit: 'GB',
      details: metrics,
    };
  }

  // Verificar alertas de custo
  static checkCostAlerts(costs: CostMetric[]): CostAlert[] {
    const alerts: CostAlert[] = [];

    for (const cost of costs) {
      const threshold = this.thresholds[cost.service as keyof typeof this.thresholds];
      
      if (threshold && cost.amount > threshold) {
        const severity = cost.amount > threshold * 1.5 ? 'critical' : 'warning';
        
        alerts.push({
          threshold,
          current: cost.amount,
          service: cost.service,
          severity,
        });
      }
    }

    // Verificar custo total
    const totalCost = costs.reduce((sum, c) => sum + c.amount, 0);
    if (totalCost > this.thresholds.total_daily) {
      alerts.push({
        threshold: this.thresholds.total_daily,
        current: totalCost,
        service: 'total',
        severity: totalCost > this.thresholds.total_daily * 1.5 ? 'critical' : 'warning',
      });
    }

    return alerts;
  }

  // Gerar dashboard de custos
  static generateCostDashboard(costs: CostMetric[]): {
    total: number;
    byCategory: Record<string, number>;
    byService: Record<string, number>;
    alerts: CostAlert[];
    trend: 'increasing' | 'stable' | 'decreasing';
  } {
    const total = costs.reduce((sum, c) => sum + c.amount, 0);
    
    const byCategory = costs.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + c.amount;
      return acc;
    }, {} as Record<string, number>);

    const byService = costs.reduce((acc, c) => {
      acc[c.service] = (acc[c.service] || 0) + c.amount;
      return acc;
    }, {} as Record<string, number>);

    const alerts = this.checkCostAlerts(costs);

    // Trend simplificado - em produção, comparar com períodos anteriores
    const trend = 'stable';

    return {
      total,
      byCategory,
      byService,
      alerts,
      trend,
    };
  }

  // Projetar custos mensais
  static projectMonthlyCosts(dailyCosts: CostMetric[]): {
    projected: number;
    confidence: number;
    breakdown: Record<string, number>;
  } {
    const dailyTotal = dailyCosts.reduce((sum, c) => sum + c.amount, 0);
    const projected = dailyTotal * 30;

    const breakdown = dailyCosts.reduce((acc, c) => {
      acc[c.service] = (acc[c.service] || 0) + c.amount * 30;
      return acc;
    }, {} as Record<string, number>);

    // Confiança baseada em variabilidade histórica
    const confidence = 0.85; // 85% - em produção, calcular baseado em histórico

    return {
      projected,
      confidence,
      breakdown,
    };
  }
}
