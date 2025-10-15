import { prisma } from '@/lib/db';
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type ReportType = 'daily' | 'weekly' | 'monthly';
export type ReportFormat = 'json' | 'html' | 'pdf';

export interface ReportData {
  period: {
    type: ReportType;
    start: Date;
    end: Date;
    label: string;
  };
  summary: {
    totalEvents: number;
    totalUsers: number;
    totalProjects: number;
    totalVideos: number;
    errorRate: number;
    avgResponseTime: number;
    topCategories: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
  performance: {
    apiMetrics: Array<{
      endpoint: string;
      calls: number;
      avgDuration: number;
      errorRate: number;
    }>;
    slowestEndpoints: Array<{
      endpoint: string;
      avgDuration: number;
      maxDuration: number;
    }>;
    systemHealth: {
      uptime: number;
      avgCpu: number;
      avgMemory: number;
      avgResponseTime: number;
    };
  };
  userBehavior: {
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    avgSessionDuration: number;
    topPages: Array<{
      page: string;
      views: number;
      uniqueUsers: number;
    }>;
    deviceTypes: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
  };
  content: {
    projectsCreated: number;
    videosGenerated: number;
    totalProcessingTime: number;
    avgVideoLength: number;
    topTemplates: Array<{
      templateId: string;
      usage: number;
    }>;
  };
  trends: {
    eventsGrowth: number;
    usersGrowth: number;
    performanceChange: number;
    errorRateChange: number;
  };
  alerts: Array<{
    type: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    count: number;
  }>;
}

export class ReportGenerator {
  private getDateRange(type: ReportType, date: Date = new Date()) {
    switch (type) {
      case 'daily':
        return {
          start: startOfDay(date),
          end: endOfDay(date),
          label: format(date, 'dd/MM/yyyy', { locale: ptBR })
        };
      case 'weekly':
        return {
          start: startOfWeek(date, { weekStartsOn: 1 }),
          end: endOfWeek(date, { weekStartsOn: 1 }),
          label: `Semana de ${format(startOfWeek(date, { weekStartsOn: 1 }), 'dd/MM', { locale: ptBR })} a ${format(endOfWeek(date, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: ptBR })}`
        };
      case 'monthly':
        return {
          start: startOfMonth(date),
          end: endOfMonth(date),
          label: format(date, 'MMMM yyyy', { locale: ptBR })
        };
    }
  }

  private getPreviousDateRange(type: ReportType, date: Date = new Date()) {
    switch (type) {
      case 'daily':
        const prevDay = subDays(date, 1);
        return {
          start: startOfDay(prevDay),
          end: endOfDay(prevDay)
        };
      case 'weekly':
        const prevWeek = subDays(date, 7);
        return {
          start: startOfWeek(prevWeek, { weekStartsOn: 1 }),
          end: endOfWeek(prevWeek, { weekStartsOn: 1 })
        };
      case 'monthly':
        const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        return {
          start: startOfMonth(prevMonth),
          end: endOfMonth(prevMonth)
        };
    }
  }

  async generateReport(
    type: ReportType,
    organizationId?: string,
    date: Date = new Date()
  ): Promise<ReportData> {
    const period = this.getDateRange(type, date);
    const previousPeriod = this.getPreviousDateRange(type, date);

    const whereClause = {
      createdAt: {
        gte: period.start,
        lte: period.end
      },
      ...(organizationId && { organizationId })
    };

    const previousWhereClause = {
      createdAt: {
        gte: previousPeriod.start,
        lte: previousPeriod.end
      },
      ...(organizationId && { organizationId })
    };

    // Buscar dados em paralelo
    const [
      totalEvents,
      previousTotalEvents,
      uniqueUsers,
      previousUniqueUsers,
      totalProjects,
      totalVideos,
      errorEvents,
      eventsByCategory,
      apiMetrics,
      userBehaviorData,
      contentData,
      systemMetrics
    ] = await Promise.all([
      // Eventos totais
      prisma.analyticsEvent.count({ where: whereClause }),
      prisma.analyticsEvent.count({ where: previousWhereClause }),

      // Usuários únicos
      prisma.analyticsEvent.groupBy({
        by: ['userId'],
        where: { ...whereClause, userId: { not: null } }
      }),
      prisma.analyticsEvent.groupBy({
        by: ['userId'],
        where: { ...previousWhereClause, userId: { not: null } }
      }),

      // Projetos criados
      prisma.project.count({
        where: {
          createdAt: { gte: period.start, lte: period.end },
          ...(organizationId && { organizationId })
        }
      }),

      // Vídeos gerados
      prisma.videoExport.count({
        where: {
          createdAt: { gte: period.start, lte: period.end },
          status: 'completed'
        }
      }),

      // Eventos de erro
      prisma.analyticsEvent.count({
        where: { ...whereClause, status: 'error' }
      }),

      // Eventos por categoria
      prisma.analyticsEvent.groupBy({
        by: ['category'],
        where: whereClause,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }),

      // Métricas de API
      prisma.analyticsEvent.groupBy({
        by: ['action'],
        where: {
          ...whereClause,
          category: 'api'
        },
        _count: { id: true },
        _avg: { duration: true },
        orderBy: { _count: { id: 'desc' } }
      }),

      // Dados de comportamento do usuário
      this.getUserBehaviorData(whereClause),

      // Dados de conteúdo
      this.getContentData(period.start, period.end, organizationId),

      // Métricas do sistema
      this.getSystemMetrics(period.start, period.end)
    ]);

    // Calcular métricas derivadas
    const errorRate = totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;
    const avgResponseTime = await this.getAverageResponseTime(whereClause);

    // Calcular tendências
    const eventsGrowth = previousTotalEvents > 0 ? 
      ((totalEvents - previousTotalEvents) / previousTotalEvents) * 100 : 0;
    
    const usersGrowth = previousUniqueUsers.length > 0 ? 
      ((uniqueUsers.length - previousUniqueUsers.length) / previousUniqueUsers.length) * 100 : 0;

    // Detectar alertas
    const alerts = this.generateAlerts({
      errorRate,
      avgResponseTime,
      eventsGrowth,
      usersGrowth,
      totalEvents
    });

    return {
      period: {
        type,
        start: period.start,
        end: period.end,
        label: period.label
      },
      summary: {
        totalEvents,
        totalUsers: uniqueUsers.length,
        totalProjects,
        totalVideos,
        errorRate: Math.round(errorRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
        topCategories: eventsByCategory.map((item: any) => ({
          category: item.category,
          count: item._count.id,
          percentage: Math.round((item._count.id / totalEvents) * 10000) / 100
        })).slice(0, 5)
      },
      performance: {
        apiMetrics: apiMetrics.map((item: any) => ({
          endpoint: item.action,
          calls: item._count.id,
          avgDuration: Math.round(item._avg.duration || 0),
          errorRate: 0 // Calcular separadamente se necessário
        })),
        slowestEndpoints: apiMetrics
          .sort((a: any, b: any) => (b._avg.duration || 0) - (a._avg.duration || 0))
          .slice(0, 5)
          .map((item: any) => ({
            endpoint: item.action,
            avgDuration: Math.round(item._avg.duration || 0),
            maxDuration: Math.round(item._avg.duration || 0) // Simplificado
          })),
        systemHealth: systemMetrics
      },
      userBehavior: userBehaviorData,
      content: contentData,
      trends: {
        eventsGrowth: Math.round(eventsGrowth * 100) / 100,
        usersGrowth: Math.round(usersGrowth * 100) / 100,
        performanceChange: 0, // Calcular se necessário
        errorRateChange: 0 // Calcular se necessário
      },
      alerts
    };
  }

  private async getUserBehaviorData(whereClause: any) {
    // Implementação simplificada - pode ser expandida
    const pageViews = await prisma.analyticsEvent.groupBy({
      by: ['label'],
      where: {
        ...whereClause,
        category: 'page_view'
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    return {
      activeUsers: 0, // Calcular baseado em sessões
      newUsers: 0, // Calcular baseado em primeiros acessos
      returningUsers: 0, // Calcular baseado em acessos repetidos
      avgSessionDuration: 0, // Calcular baseado em eventos de sessão
      topPages: pageViews.slice(0, 10).map((item: any) => ({
        page: item.label || 'Unknown',
        views: item._count.id,
        uniqueUsers: 0 // Calcular separadamente
      })),
      deviceTypes: [] // Implementar baseado em user agent
    };
  }

  private async getContentData(start: Date, end: Date, organizationId?: string) {
    const projects = await prisma.project.count({
      where: {
        createdAt: { gte: start, lte: end },
        ...(organizationId && { organizationId })
      }
    });

    const videos = await prisma.videoExport.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'completed'
      },
      select: {
        duration: true,
        processingTime: true
      }
    });

    const totalProcessingTime = videos.reduce((sum, video) => 
      sum + (video.processingTime || 0), 0);
    
    const avgVideoLength = videos.length > 0 ? 
      videos.reduce((sum, video) => sum + (video.duration || 0), 0) / videos.length : 0;

    return {
      projectsCreated: projects,
      videosGenerated: videos.length,
      totalProcessingTime,
      avgVideoLength: Math.round(avgVideoLength),
      topTemplates: [] // Implementar baseado em dados de template
    };
  }

  private async getSystemMetrics(start: Date, end: Date) {
    // Implementação simplificada - pode integrar com métricas reais do sistema
    return {
      uptime: 99.9,
      avgCpu: 45,
      avgMemory: 60,
      avgResponseTime: 250
    };
  }

  private async getAverageResponseTime(whereClause: any): Promise<number> {
    const result = await prisma.analyticsEvent.aggregate({
      where: {
        ...whereClause,
        duration: { not: null }
      },
      _avg: { duration: true }
    });

    return result._avg.duration || 0;
  }

  private generateAlerts(metrics: {
    errorRate: number;
    avgResponseTime: number;
    eventsGrowth: number;
    usersGrowth: number;
    totalEvents: number;
  }) {
    const alerts = [];

    if (metrics.errorRate > 5) {
      alerts.push({
        type: 'high_error_rate',
        severity: 'warning' as const,
        message: `Taxa de erro elevada: ${metrics.errorRate.toFixed(2)}%`,
        count: 1
      });
    }

    if (metrics.avgResponseTime > 2000) {
      alerts.push({
        type: 'slow_response',
        severity: 'warning' as const,
        message: `Tempo de resposta lento: ${Math.round(metrics.avgResponseTime)}ms`,
        count: 1
      });
    }

    if (metrics.eventsGrowth < -20) {
      alerts.push({
        type: 'traffic_drop',
        severity: 'warning' as const,
        message: `Queda significativa no tráfego: ${metrics.eventsGrowth.toFixed(1)}%`,
        count: 1
      });
    }

    if (metrics.eventsGrowth > 100) {
      alerts.push({
        type: 'traffic_spike',
        severity: 'info' as const,
        message: `Pico de tráfego: +${metrics.eventsGrowth.toFixed(1)}%`,
        count: 1
      });
    }

    return alerts;
  }

  async generateHTMLReport(data: ReportData): Promise<string> {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Analytics - ${data.period.label}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e0e0e0; padding-bottom: 20px; }
        .header h1 { color: #333; margin: 0; }
        .header p { color: #666; margin: 5px 0; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-left: 4px solid #007bff; padding-left: 15px; margin-bottom: 15px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e0e0e0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        .table th { background: #f8f9fa; font-weight: bold; }
        .alert { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .alert.warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .alert.error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .alert.info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        .trend.up { color: #28a745; }
        .trend.down { color: #dc3545; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Relatório de Analytics</h1>
            <p><strong>${data.period.label}</strong></p>
            <p>Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
        </div>

        <div class="section">
            <h2>Resumo Executivo</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${data.summary.totalEvents.toLocaleString()}</div>
                    <div class="metric-label">Total de Eventos</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.summary.totalUsers.toLocaleString()}</div>
                    <div class="metric-label">Usuários Ativos</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.summary.totalProjects.toLocaleString()}</div>
                    <div class="metric-label">Projetos Criados</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.summary.totalVideos.toLocaleString()}</div>
                    <div class="metric-label">Vídeos Gerados</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.summary.errorRate}%</div>
                    <div class="metric-label">Taxa de Erro</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.summary.avgResponseTime}ms</div>
                    <div class="metric-label">Tempo Médio de Resposta</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Tendências</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value trend ${data.trends.eventsGrowth >= 0 ? 'up' : 'down'}">
                        ${data.trends.eventsGrowth >= 0 ? '+' : ''}${data.trends.eventsGrowth.toFixed(1)}%
                    </div>
                    <div class="metric-label">Crescimento de Eventos</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value trend ${data.trends.usersGrowth >= 0 ? 'up' : 'down'}">
                        ${data.trends.usersGrowth >= 0 ? '+' : ''}${data.trends.usersGrowth.toFixed(1)}%
                    </div>
                    <div class="metric-label">Crescimento de Usuários</div>
                </div>
            </div>
        </div>

        ${data.alerts.length > 0 ? `
        <div class="section">
            <h2>Alertas</h2>
            ${data.alerts.map(alert => `
                <div class="alert ${alert.severity}">
                    <strong>${alert.type.replace(/_/g, ' ').toUpperCase()}:</strong> ${alert.message}
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="section">
            <h2>Top Categorias de Eventos</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Categoria</th>
                        <th>Eventos</th>
                        <th>Porcentagem</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.summary.topCategories.map(cat => `
                        <tr>
                            <td>${cat.category}</td>
                            <td>${cat.count.toLocaleString()}</td>
                            <td>${cat.percentage}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Performance de APIs</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Endpoint</th>
                        <th>Chamadas</th>
                        <th>Tempo Médio (ms)</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.performance.apiMetrics.slice(0, 10).map(api => `
                        <tr>
                            <td>${api.endpoint}</td>
                            <td>${api.calls.toLocaleString()}</td>
                            <td>${api.avgDuration}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>Relatório gerado automaticamente pelo Sistema de Analytics</p>
            <p>Estúdio IA Vídeos - Analytics Dashboard</p>
        </div>
    </div>
</body>
</html>
    `;
  }
}