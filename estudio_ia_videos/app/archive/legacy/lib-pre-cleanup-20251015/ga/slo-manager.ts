
/**
 * SLO Manager - Sprint 40
 * Gerenciamento de Service Level Objectives e Error Budgets
 */

interface SLO {
  name: string;
  description: string;
  target: number; // Porcentagem ou valor absoluto
  current: number;
  window: '1h' | '24h' | '7d' | '30d';
  type: 'availability' | 'latency' | 'throughput' | 'quality';
  unit: 'percentage' | 'ms' | 'requests' | 'seconds';
}

interface ErrorBudget {
  service: string;
  period: string;
  budget: number;
  consumed: number;
  remaining: number;
  status: 'healthy' | 'warning' | 'critical' | 'exhausted';
}

export class SLOManager {
  // SLOs Definidos
  private static SLOs: SLO[] = [
    {
      name: 'API Response Time P95',
      description: '95% das requisições de API devem responder em menos de 800ms',
      target: 800,
      current: 0,
      window: '24h',
      type: 'latency',
      unit: 'ms',
    },
    {
      name: 'Render Queue Wait Time',
      description: 'Tempo médio de espera na fila de renderização',
      target: 120,
      current: 0,
      window: '24h',
      type: 'latency',
      unit: 'seconds',
    },
    {
      name: 'TTS Generation Time',
      description: 'Tempo de geração de TTS por minuto de áudio',
      target: 12,
      current: 0,
      window: '24h',
      type: 'latency',
      unit: 'seconds',
    },
    {
      name: 'API Availability',
      description: 'Disponibilidade geral da API',
      target: 99.9,
      current: 0,
      window: '30d',
      type: 'availability',
      unit: 'percentage',
    },
    {
      name: 'Video Render Success Rate',
      description: 'Taxa de sucesso de renderização de vídeos',
      target: 98.0,
      current: 0,
      window: '7d',
      type: 'quality',
      unit: 'percentage',
    },
    {
      name: 'TTS Success Rate',
      description: 'Taxa de sucesso de geração de TTS',
      target: 99.5,
      current: 0,
      window: '7d',
      type: 'quality',
      unit: 'percentage',
    },
  ];

  // Calcular Error Budgets
  static calculateErrorBudget(slo: SLO): ErrorBudget {
    const windowHours = this.getWindowHours(slo.window);
    
    let budget = 0;
    let consumed = 0;

    if (slo.type === 'availability') {
      // Para disponibilidade: budget é o tempo de downtime permitido
      const allowedDowntimePercentage = 100 - slo.target;
      budget = (windowHours * 3600 * allowedDowntimePercentage) / 100; // em segundos
      const actualDowntimePercentage = 100 - slo.current;
      consumed = (windowHours * 3600 * actualDowntimePercentage) / 100;
    } else if (slo.type === 'quality') {
      // Para qualidade: budget é a taxa de erro permitida
      budget = 100 - slo.target;
      consumed = 100 - slo.current;
    } else {
      // Para latência: budget baseado em desvio do target
      budget = slo.target * 0.2; // 20% de margem
      consumed = Math.max(0, slo.current - slo.target);
    }

    const remaining = Math.max(0, budget - consumed);
    const consumedPercentage = budget > 0 ? (consumed / budget) * 100 : 0;

    let status: ErrorBudget['status'] = 'healthy';
    if (consumedPercentage >= 100) status = 'exhausted';
    else if (consumedPercentage >= 80) status = 'critical';
    else if (consumedPercentage >= 60) status = 'warning';

    return {
      service: slo.name,
      period: slo.window,
      budget,
      consumed,
      remaining,
      status,
    };
  }

  private static getWindowHours(window: string): number {
    switch (window) {
      case '1h': return 1;
      case '24h': return 24;
      case '7d': return 168;
      case '30d': return 720;
      default: return 24;
    }
  }

  // Obter todos os SLOs
  static getSLOs(): SLO[] {
    return this.SLOs;
  }

  // Atualizar valor atual de um SLO
  static async updateSLO(name: string, currentValue: number): Promise<void> {
    const slo = this.SLOs.find(s => s.name === name);
    if (slo) {
      slo.current = currentValue;
    }
  }

  // Verificar se algum SLO está violado
  static checkViolations(): { slo: SLO; errorBudget: ErrorBudget }[] {
    const violations: { slo: SLO; errorBudget: ErrorBudget }[] = [];

    for (const slo of this.SLOs) {
      const errorBudget = this.calculateErrorBudget(slo);
      
      if (errorBudget.status === 'critical' || errorBudget.status === 'exhausted') {
        violations.push({ slo, errorBudget });
      }
    }

    return violations;
  }

  // Gerar relatório de SLOs
  static generateReport(): {
    slos: SLO[];
    errorBudgets: ErrorBudget[];
    violations: number;
    overallHealth: 'healthy' | 'warning' | 'critical';
  } {
    const errorBudgets = this.SLOs.map(slo => this.calculateErrorBudget(slo));
    const violations = errorBudgets.filter(
      eb => eb.status === 'critical' || eb.status === 'exhausted'
    ).length;

    let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (violations > 0) overallHealth = 'critical';
    else if (errorBudgets.some(eb => eb.status === 'warning')) overallHealth = 'warning';

    return {
      slos: this.SLOs,
      errorBudgets,
      violations,
      overallHealth,
    };
  }

  // Trigger de rollback automático
  static shouldTriggerRollback(): boolean {
    const violations = this.checkViolations();
    
    // Trigger rollback se houver SLOs críticos violados
    const criticalViolations = violations.filter(
      v => v.errorBudget.status === 'exhausted'
    );

    return criticalViolations.length >= 2; // 2+ SLOs exhausted = rollback
  }
}
