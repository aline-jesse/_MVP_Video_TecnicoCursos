
/**
 * Data Retention & LGPD Compliance - Sprint 40
 * Gerenciamento de retenção e expurgo de dados
 */

import { prisma } from '@/lib/db';

interface RetentionPolicy {
  resource: string;
  retentionDays: number;
  autoDelete: boolean;
  exportBeforeDelete: boolean;
}

export class DataRetentionManager {
  // Políticas de retenção
  private static policies: RetentionPolicy[] = [
    {
      resource: 'audit_logs',
      retentionDays: 90,
      autoDelete: true,
      exportBeforeDelete: true,
    },
    {
      resource: 'analytics',
      retentionDays: 365,
      autoDelete: true,
      exportBeforeDelete: true,
    },
    {
      resource: 'render_jobs',
      retentionDays: 30,
      autoDelete: true,
      exportBeforeDelete: false,
    },
    {
      resource: 'video_exports',
      retentionDays: 90,
      autoDelete: false,
      exportBeforeDelete: true,
    },
    {
      resource: 'projects_archived',
      retentionDays: 180,
      autoDelete: false,
      exportBeforeDelete: true,
    },
  ];

  // Executar limpeza automática
  static async runCleanup(): Promise<{
    deleted: Record<string, number>;
    exported: Record<string, number>;
    errors: string[];
  }> {
    const deleted: Record<string, number> = {};
    const exported: Record<string, number> = {};
    const errors: string[] = [];

    for (const policy of this.policies) {
      if (!policy.autoDelete) continue;

      try {
        const count = await this.cleanupResource(policy);
        deleted[policy.resource] = count;
      } catch (error) {
        errors.push(`Failed to cleanup ${policy.resource}: ${error}`);
      }
    }

    return { deleted, exported, errors };
  }

  // Limpar recurso específico
  private static async cleanupResource(policy: RetentionPolicy): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    switch (policy.resource) {
      case 'audit_logs':
        const auditResult = await prisma.auditLog.deleteMany({
          where: { timestamp: { lt: cutoffDate } },
        });
        return auditResult.count;

      case 'analytics':
        const analyticsResult = await prisma.analytics.deleteMany({
          where: { timestamp: { lt: cutoffDate } },
        });
        return analyticsResult.count;

      case 'render_jobs':
        const renderResult = await prisma.renderJob.deleteMany({
          where: {
            createdAt: { lt: cutoffDate },
            status: 'completed',
          },
        });
        return renderResult.count;

      default:
        return 0;
    }
  }

  // Exportar dados antes de excluir (LGPD compliance)
  static async exportUserData(userId: string): Promise<{
    user: unknown;
    projects: unknown[];
    analytics: unknown[];
    auditLogs: unknown[];
  }> {
    const [user, projects, analytics, auditLogs] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.project.findMany({ where: { userId } }),
      prisma.analytics.findMany({ where: { userId } }),
      prisma.auditLog.findMany({ where: { userId } }),
    ]);

    return {
      user: user || {},
      projects,
      analytics,
      auditLogs,
    };
  }

  // Excluir dados de usuário (direito ao esquecimento - LGPD)
  static async deleteUserData(userId: string): Promise<{
    success: boolean;
    deleted: Record<string, number>;
  }> {
    const deleted: Record<string, number> = {};

    try {
      // Deletar em ordem (devido a foreign keys)
      const analyticsResult = await prisma.analytics.deleteMany({ where: { userId } });
      deleted.analytics = analyticsResult.count;

      const projectsResult = await prisma.project.deleteMany({ where: { userId } });
      deleted.projects = projectsResult.count;

      // Anonimizar audit logs ao invés de deletar (compliance)
      const auditLogsResult = await prisma.auditLog.updateMany({
        where: { userId },
        data: {
          userId: null,
          userEmail: '[REDACTED]',
          userName: '[REDACTED]',
        },
      });
      deleted.auditLogs = auditLogsResult.count;

      // Por último, deletar usuário
      await prisma.user.delete({ where: { id: userId } });
      deleted.user = 1;

      return { success: true, deleted };
    } catch (error) {
      console.error('Error deleting user data:', error);
      return { success: false, deleted };
    }
  }

  // Obter políticas de retenção
  static getPolicies(): RetentionPolicy[] {
    return this.policies;
  }

  // Calcular storage que será liberado
  static async estimateCleanupImpact(): Promise<{
    estimatedRecords: Record<string, number>;
    estimatedStorage: number;
  }> {
    const estimatedRecords: Record<string, number> = {};
    let estimatedStorage = 0;

    for (const policy of this.policies) {
      if (!policy.autoDelete) continue;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

      switch (policy.resource) {
        case 'audit_logs':
          const auditCount = await prisma.auditLog.count({
            where: { timestamp: { lt: cutoffDate } },
          });
          estimatedRecords.audit_logs = auditCount;
          estimatedStorage += auditCount * 1024; // ~1KB por registro
          break;

        case 'analytics':
          const analyticsCount = await prisma.analytics.count({
            where: { timestamp: { lt: cutoffDate } },
          });
          estimatedRecords.analytics = analyticsCount;
          estimatedStorage += analyticsCount * 2048; // ~2KB por registro
          break;

        case 'render_jobs':
          const renderCount = await prisma.renderJob.count({
            where: {
              createdAt: { lt: cutoffDate },
              status: 'completed',
            },
          });
          estimatedRecords.render_jobs = renderCount;
          estimatedStorage += renderCount * 4096; // ~4KB por registro
          break;
      }
    }

    return { estimatedRecords, estimatedStorage };
  }
}
