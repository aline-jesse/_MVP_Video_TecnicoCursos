import { prisma } from '@/lib/db';
import { ReportGenerator, ReportType } from './report-generator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ScheduledReport {
  id: string;
  type: ReportType;
  schedule: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'json' | 'html' | 'pdf';
  organizationId?: string;
  userId: string;
  lastRun?: Date;
  nextRun: Date;
  isActive: boolean;
  customFilters?: any;
}

export class ReportScheduler {
  private reportGenerator: ReportGenerator;

  constructor() {
    this.reportGenerator = new ReportGenerator();
  }

  /**
   * Executa todos os relatórios agendados que estão prontos para execução
   */
  async runScheduledReports(): Promise<{
    executed: number;
    failed: number;
    results: Array<{
      reportId: string;
      type: ReportType;
      status: 'success' | 'error';
      message?: string;
    }>;
  }> {
    console.log('[ReportScheduler] Starting scheduled reports execution...');
    
    const now = new Date();
    const results = [];
    let executed = 0;
    let failed = 0;

    try {
      // Buscar relatórios agendados que precisam ser executados
      const scheduledReports = await this.getReportsToRun(now);
      
      console.log(`[ReportScheduler] Found ${scheduledReports.length} reports to execute`);

      for (const report of scheduledReports) {
        try {
          console.log(`[ReportScheduler] Executing report ${report.id} (${report.type})`);
          
          await this.executeScheduledReport(report);
          
          // Atualizar próxima execução
          await this.updateNextRun(report.id, report.schedule);
          
          results.push({
            reportId: report.id,
            type: report.type,
            status: 'success'
          });
          
          executed++;
          
        } catch (error: any) {
          console.error(`[ReportScheduler] Failed to execute report ${report.id}:`, error);
          
          // Registrar erro
          await this.logReportError(report.id, error.message);
          
          results.push({
            reportId: report.id,
            type: report.type,
            status: 'error',
            message: error.message
          });
          
          failed++;
        }
      }

      console.log(`[ReportScheduler] Execution completed. Success: ${executed}, Failed: ${failed}`);
      
      return { executed, failed, results };

    } catch (error: any) {
      console.error('[ReportScheduler] Critical error during execution:', error);
      throw error;
    }
  }

  /**
   * Busca relatórios que precisam ser executados
   */
  private async getReportsToRun(now: Date): Promise<ScheduledReport[]> {
    const scheduledEvents = await prisma.analyticsEvent.findMany({
      where: {
        category: 'report_scheduled',
        status: 'pending',
        // Buscar relatórios onde nextRun <= now
        metadata: {
          path: ['nextRun'],
          lte: now.toISOString()
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return scheduledEvents.map(event => {
      const metadata = event.metadata as any;
      return {
        id: event.id,
        type: event.action as ReportType,
        schedule: metadata.schedule,
        recipients: metadata.recipients || [],
        format: metadata.format || 'html',
        organizationId: event.organizationId,
        userId: event.userId,
        lastRun: metadata.lastRun ? new Date(metadata.lastRun) : undefined,
        nextRun: new Date(metadata.nextRun),
        isActive: true,
        customFilters: metadata.customFilters
      };
    });
  }

  /**
   * Executa um relatório específico
   */
  private async executeScheduledReport(report: ScheduledReport): Promise<void> {
    // Gerar relatório
    const reportData = await this.reportGenerator.generateReport(
      report.type,
      report.organizationId,
      new Date()
    );

    // Salvar relatório gerado
    const savedReport = await prisma.analyticsEvent.create({
      data: {
        organizationId: report.organizationId,
        userId: report.userId,
        category: 'report_generated',
        action: report.type,
        label: `${reportData.period.label} (Automático)`,
        status: 'success',
        metadata: {
          ...reportData,
          scheduledReportId: report.id,
          generatedAt: new Date(),
          format: report.format,
          isScheduled: true
        }
      }
    });

    // Se há destinatários, simular envio (aqui você integraria com serviço de email)
    if (report.recipients && report.recipients.length > 0) {
      await this.sendReportToRecipients(reportData, report);
    }

    console.log(`[ReportScheduler] Report ${report.id} executed successfully. Saved as ${savedReport.id}`);
  }

  /**
   * Simula envio de relatório para destinatários
   * Em uma implementação real, integraria com serviço de email
   */
  private async sendReportToRecipients(reportData: any, report: ScheduledReport): Promise<void> {
    console.log(`[ReportScheduler] Sending report to ${report.recipients.length} recipients`);
    
    // Gerar conteúdo do email baseado no formato
    let content = '';
    let subject = `Relatório ${report.type} - ${reportData.period.label}`;
    
    if (report.format === 'html') {
      content = await this.reportGenerator.generateHTMLReport(reportData);
    } else {
      content = JSON.stringify(reportData, null, 2);
    }

    // Registrar tentativa de envio
    await prisma.analyticsEvent.create({
      data: {
        organizationId: report.organizationId,
        userId: report.userId,
        category: 'report_sent',
        action: 'email',
        label: `${report.type} report sent to ${report.recipients.length} recipients`,
        status: 'success',
        metadata: {
          reportId: report.id,
          recipients: report.recipients,
          subject,
          format: report.format,
          sentAt: new Date()
        }
      }
    });

    // Aqui você integraria com um serviço real de email como:
    // - SendGrid
    // - AWS SES
    // - Nodemailer
    // - Resend
    
    console.log(`[ReportScheduler] Report sent successfully to: ${report.recipients.join(', ')}`);
  }

  /**
   * Atualiza a próxima execução do relatório
   */
  private async updateNextRun(reportId: string, schedule: string): Promise<void> {
    const nextRun = this.calculateNextRun(schedule);
    
    await prisma.analyticsEvent.update({
      where: { id: reportId },
      data: {
        metadata: {
          path: ['nextRun'],
          set: nextRun.toISOString()
        }
      }
    });

    // Também atualizar lastRun
    await prisma.analyticsEvent.update({
      where: { id: reportId },
      data: {
        metadata: {
          path: ['lastRun'],
          set: new Date().toISOString()
        }
      }
    });
  }

  /**
   * Calcula a próxima execução baseada no agendamento
   */
  private calculateNextRun(schedule: string): Date {
    const now = new Date();
    
    switch (schedule) {
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(8, 0, 0, 0); // 8:00 AM
        return tomorrow;
        
      case 'weekly':
        const nextWeek = new Date(now);
        const daysUntilMonday = (7 - nextWeek.getDay() + 1) % 7 || 7;
        nextWeek.setDate(nextWeek.getDate() + daysUntilMonday);
        nextWeek.setHours(8, 0, 0, 0);
        return nextWeek;
        
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(8, 0, 0, 0);
        return nextMonth;
        
      default:
        // Default para 24 horas
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Registra erro na execução do relatório
   */
  private async logReportError(reportId: string, errorMessage: string): Promise<void> {
    await prisma.analyticsEvent.create({
      data: {
        organizationId: null,
        userId: 'system',
        category: 'report_error',
        action: 'execution_failed',
        label: `Report ${reportId} failed`,
        status: 'error',
        errorMessage,
        metadata: {
          reportId,
          error: errorMessage,
          timestamp: new Date()
        }
      }
    });
  }

  /**
   * Lista todos os relatórios agendados
   */
  async getScheduledReports(organizationId?: string): Promise<ScheduledReport[]> {
    const scheduledEvents = await prisma.analyticsEvent.findMany({
      where: {
        category: 'report_scheduled',
        ...(organizationId && { organizationId })
      },
      orderBy: { createdAt: 'desc' }
    });

    return scheduledEvents.map(event => {
      const metadata = event.metadata as any;
      return {
        id: event.id,
        type: event.action as ReportType,
        schedule: metadata.schedule,
        recipients: metadata.recipients || [],
        format: metadata.format || 'html',
        organizationId: event.organizationId,
        userId: event.userId,
        lastRun: metadata.lastRun ? new Date(metadata.lastRun) : undefined,
        nextRun: new Date(metadata.nextRun || new Date()),
        isActive: event.status === 'pending',
        customFilters: metadata.customFilters
      };
    });
  }

  /**
   * Ativa ou desativa um relatório agendado
   */
  async toggleReportStatus(reportId: string, isActive: boolean): Promise<void> {
    await prisma.analyticsEvent.update({
      where: { id: reportId },
      data: {
        status: isActive ? 'pending' : 'paused'
      }
    });
  }

  /**
   * Remove um relatório agendado
   */
  async deleteScheduledReport(reportId: string): Promise<void> {
    await prisma.analyticsEvent.delete({
      where: { id: reportId }
    });
  }

  /**
   * Estatísticas dos relatórios agendados
   */
  async getSchedulerStats(): Promise<{
    totalScheduled: number;
    activeReports: number;
    reportsToday: number;
    lastExecution: Date | null;
    nextExecution: Date | null;
    errorRate: number;
  }> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const [
      totalScheduled,
      activeReports,
      reportsToday,
      lastExecution,
      nextExecution,
      totalExecutions,
      failedExecutions
    ] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { category: 'report_scheduled' }
      }),
      
      prisma.analyticsEvent.count({
        where: { 
          category: 'report_scheduled',
          status: 'pending'
        }
      }),
      
      prisma.analyticsEvent.count({
        where: {
          category: 'report_generated',
          createdAt: { gte: startOfDay, lt: endOfDay }
        }
      }),
      
      prisma.analyticsEvent.findFirst({
        where: { category: 'report_generated' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }),
      
      prisma.analyticsEvent.findFirst({
        where: { 
          category: 'report_scheduled',
          status: 'pending'
        },
        orderBy: { 
          metadata: { path: ['nextRun'], sort: 'asc' }
        },
        select: { metadata: true }
      }),
      
      prisma.analyticsEvent.count({
        where: { category: 'report_generated' }
      }),
      
      prisma.analyticsEvent.count({
        where: { category: 'report_error' }
      })
    ]);

    const errorRate = totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0;
    const nextRun = nextExecution?.metadata ? 
      new Date((nextExecution.metadata as any).nextRun) : null;

    return {
      totalScheduled,
      activeReports,
      reportsToday,
      lastExecution: lastExecution?.createdAt || null,
      nextExecution: nextRun,
      errorRate: Math.round(errorRate * 100) / 100
    };
  }
}