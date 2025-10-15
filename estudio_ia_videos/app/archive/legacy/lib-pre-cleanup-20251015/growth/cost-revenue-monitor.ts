
/**
 * Sprint 41: Cost & Revenue Monitor
 * Monitoramento de custos vs receita em tempo real
 */

export interface CostBreakdown {
  ttsMinutes: number;
  ttsCost: number;
  renderMinutes: number;
  renderCost: number;
  storageMB: number;
  storageCost: number;
  apiCalls: number;
  apiCost: number;
  totalCost: number;
  period: 'hour' | 'day' | 'month';
  timestamp: Date;
}

export interface RevenueBreakdown {
  subscriptionRevenue: number;
  oneTimePayments: number;
  upgrades: number;
  downgrades: number;
  churn: number;
  netRevenue: number;
  period: 'hour' | 'day' | 'month';
  timestamp: Date;
}

export interface ProfitabilityMetrics {
  grossRevenue: number;
  totalCosts: number;
  grossProfit: number;
  profitMargin: number;
  ltv: number; // Customer Lifetime Value
  cac: number; // Customer Acquisition Cost
  ltvCacRatio: number;
  paybackPeriodMonths: number;
}

export interface CostAlert {
  severity: 'info' | 'warning' | 'critical';
  type: 'spike' | 'threshold' | 'trend' | 'anomaly';
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
}

export class CostRevenueMonitor {
  private static readonly COST_THRESHOLDS = {
    ttsPerMinute: 0.005, // $0.005 por minuto TTS
    renderPerMinute: 0.02, // $0.02 por minuto de renderização
    storagePerGB: 0.023, // $0.023 por GB/mês (S3 pricing)
    apiCallPer1000: 0.001, // $0.001 por 1000 chamadas
  };

  /**
   * Calcula custos em tempo real
   */
  static calculateCosts(
    usage: {
      ttsMinutes: number;
      renderMinutes: number;
      storageMB: number;
      apiCalls: number;
    },
    period: CostBreakdown['period'] = 'day'
  ): CostBreakdown {
    const ttsCost = usage.ttsMinutes * this.COST_THRESHOLDS.ttsPerMinute;
    const renderCost = usage.renderMinutes * this.COST_THRESHOLDS.renderPerMinute;
    const storageCost =
      (usage.storageMB / 1024) * this.COST_THRESHOLDS.storagePerGB;
    const apiCost = (usage.apiCalls / 1000) * this.COST_THRESHOLDS.apiCallPer1000;

    return {
      ...usage,
      ttsCost,
      renderCost,
      storageCost,
      apiCost,
      totalCost: ttsCost + renderCost + storageCost + apiCost,
      period,
      timestamp: new Date(),
    };
  }

  /**
   * Calcula receita do período
   */
  static calculateRevenue(
    transactions: {
      subscriptions: number;
      oneTime: number;
      upgrades: number;
      downgrades: number;
      refunds: number;
    },
    period: RevenueBreakdown['period'] = 'day'
  ): RevenueBreakdown {
    const netRevenue =
      transactions.subscriptions +
      transactions.oneTime +
      transactions.upgrades -
      transactions.downgrades -
      transactions.refunds;

    return {
      subscriptionRevenue: transactions.subscriptions,
      oneTimePayments: transactions.oneTime,
      upgrades: transactions.upgrades,
      downgrades: transactions.downgrades,
      churn: transactions.refunds,
      netRevenue,
      period,
      timestamp: new Date(),
    };
  }

  /**
   * Calcula métricas de lucratividade
   */
  static calculateProfitability(
    revenue: RevenueBreakdown,
    costs: CostBreakdown,
    customerData: {
      totalCustomers: number;
      newCustomers: number;
      marketingSpend: number;
      avgCustomerLifespanMonths: number;
    }
  ): ProfitabilityMetrics {
    const grossRevenue = revenue.netRevenue;
    const totalCosts = costs.totalCost + customerData.marketingSpend;
    const grossProfit = grossRevenue - totalCosts;
    const profitMargin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

    // CAC = Marketing Spend / New Customers
    const cac =
      customerData.newCustomers > 0
        ? customerData.marketingSpend / customerData.newCustomers
        : 0;

    // LTV = (Average Revenue per Customer per Month) * Average Lifespan
    const avgRevenuePerCustomer =
      customerData.totalCustomers > 0
        ? grossRevenue / customerData.totalCustomers
        : 0;
    const ltv = avgRevenuePerCustomer * customerData.avgCustomerLifespanMonths;

    // LTV:CAC Ratio (ideal > 3)
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;

    // Payback Period (meses para recuperar CAC)
    const paybackPeriodMonths =
      avgRevenuePerCustomer > 0 ? cac / avgRevenuePerCustomer : 0;

    return {
      grossRevenue,
      totalCosts,
      grossProfit,
      profitMargin,
      ltv,
      cac,
      ltvCacRatio,
      paybackPeriodMonths,
    };
  }

  /**
   * Detecta anomalias de custo
   */
  static detectCostAnomalies(
    currentCosts: CostBreakdown,
    historicalAverage: CostBreakdown,
    thresholdPercentage: number = 50
  ): CostAlert[] {
    const alerts: CostAlert[] = [];

    // TTS spike
    if (currentCosts.ttsCost > historicalAverage.ttsCost * (1 + thresholdPercentage / 100)) {
      alerts.push({
        severity: 'warning',
        type: 'spike',
        message: 'Custo de TTS acima do esperado',
        currentValue: currentCosts.ttsCost,
        threshold: historicalAverage.ttsCost,
        timestamp: new Date(),
      });
    }

    // Render spike
    if (currentCosts.renderCost > historicalAverage.renderCost * (1 + thresholdPercentage / 100)) {
      alerts.push({
        severity: 'warning',
        type: 'spike',
        message: 'Custo de renderização acima do esperado',
        currentValue: currentCosts.renderCost,
        threshold: historicalAverage.renderCost,
        timestamp: new Date(),
      });
    }

    // Storage threshold
    if (currentCosts.storageCost > 100) {
      // > $100/day
      alerts.push({
        severity: 'critical',
        type: 'threshold',
        message: 'Custo de storage crítico',
        currentValue: currentCosts.storageCost,
        threshold: 100,
        timestamp: new Date(),
      });
    }

    // Total cost critical
    if (currentCosts.totalCost > 500) {
      // > $500/day
      alerts.push({
        severity: 'critical',
        type: 'threshold',
        message: 'Custo total diário acima de $500',
        currentValue: currentCosts.totalCost,
        threshold: 500,
        timestamp: new Date(),
      });
    }

    return alerts;
  }

  /**
   * Gera recomendações de otimização de custos
   */
  static generateCostOptimizations(
    costs: CostBreakdown
  ): Array<{ area: string; recommendation: string; potentialSavings: number }> {
    const optimizations: Array<{
      area: string;
      recommendation: string;
      potentialSavings: number;
    }> = [];

    // TTS optimization
    if (costs.ttsCost > 50) {
      optimizations.push({
        area: 'TTS',
        recommendation: 'Implementar cache de áudios gerados para reduzir regenerações',
        potentialSavings: costs.ttsCost * 0.3, // 30% de economia
      });
    }

    // Storage optimization
    if (costs.storageCost > 20) {
      optimizations.push({
        area: 'Storage',
        recommendation: 'Implementar lifecycle policy para arquivar vídeos antigos no Glacier',
        potentialSavings: costs.storageCost * 0.4, // 40% de economia
      });
    }

    // Render optimization
    if (costs.renderCost > 100) {
      optimizations.push({
        area: 'Render',
        recommendation: 'Otimizar pipeline de renderização e usar spot instances',
        potentialSavings: costs.renderCost * 0.25, // 25% de economia
      });
    }

    return optimizations;
  }

  /**
   * Calcula projeção de custos
   */
  static projectCosts(
    currentCosts: CostBreakdown,
    growthRate: number, // % de crescimento mensal
    months: number
  ): CostBreakdown[] {
    const projections: CostBreakdown[] = [];

    for (let i = 1; i <= months; i++) {
      const multiplier = Math.pow(1 + growthRate / 100, i);

      projections.push({
        ttsMinutes: currentCosts.ttsMinutes * multiplier,
        ttsCost: currentCosts.ttsCost * multiplier,
        renderMinutes: currentCosts.renderMinutes * multiplier,
        renderCost: currentCosts.renderCost * multiplier,
        storageMB: currentCosts.storageMB * multiplier,
        storageCost: currentCosts.storageCost * multiplier,
        apiCalls: currentCosts.apiCalls * multiplier,
        apiCost: currentCosts.apiCost * multiplier,
        totalCost: currentCosts.totalCost * multiplier,
        period: 'month',
        timestamp: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000),
      });
    }

    return projections;
  }

  /**
   * Gera relatório mensal para admins
   */
  static generateMonthlyReport(
    costs: CostBreakdown,
    revenue: RevenueBreakdown,
    profitability: ProfitabilityMetrics
  ): string {
    let report = '# Monthly Cost & Revenue Report\n\n';

    report += '## Revenue\n';
    report += `- Gross Revenue: $${revenue.netRevenue.toFixed(2)}\n`;
    report += `- Subscriptions: $${revenue.subscriptionRevenue.toFixed(2)}\n`;
    report += `- Upgrades: $${revenue.upgrades.toFixed(2)}\n`;
    report += `- Churn: $${revenue.churn.toFixed(2)}\n\n`;

    report += '## Costs\n';
    report += `- Total: $${costs.totalCost.toFixed(2)}\n`;
    report += `- TTS: $${costs.ttsCost.toFixed(2)} (${costs.ttsMinutes.toFixed(0)} min)\n`;
    report += `- Render: $${costs.renderCost.toFixed(2)} (${costs.renderMinutes.toFixed(0)} min)\n`;
    report += `- Storage: $${costs.storageCost.toFixed(2)} (${(costs.storageMB / 1024).toFixed(2)} GB)\n`;
    report += `- API: $${costs.apiCost.toFixed(2)} (${costs.apiCalls} calls)\n\n`;

    report += '## Profitability\n';
    report += `- Gross Profit: $${profitability.grossProfit.toFixed(2)}\n`;
    report += `- Profit Margin: ${profitability.profitMargin.toFixed(2)}%\n`;
    report += `- LTV: $${profitability.ltv.toFixed(2)}\n`;
    report += `- CAC: $${profitability.cac.toFixed(2)}\n`;
    report += `- LTV:CAC Ratio: ${profitability.ltvCacRatio.toFixed(2)}x\n`;
    report += `- Payback Period: ${profitability.paybackPeriodMonths.toFixed(1)} months\n`;

    return report;
  }
}
