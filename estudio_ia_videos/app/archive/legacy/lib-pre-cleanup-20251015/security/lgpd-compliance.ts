
/**
 * 🔒 LGPD COMPLIANCE - Sprint 44
 * Exportação e exclusão de dados pessoais
 */

import { prisma } from '@/lib/db'
import { AuditLogger } from './audit-logger'

export class LGPDCompliance {
  /**
   * Exportar todos os dados de um usuário
   */
  static async exportUserData(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: true,
        sessions: true
      }
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Buscar comentários
    const comments = await prisma.projectComment.findMany({
      where: { userId }
    })

    // Buscar vozes customizadas (metadata)
    // const voices = await getCustomVoices(userId)

    // Buscar relatórios de compliance
    // const complianceReports = await getComplianceReports(userId)

    const exportData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      projects: user.projects,
      comments,
      // voices,
      // complianceReports,
      exportedAt: new Date().toISOString()
    }

    await AuditLogger.log({
      action: 'data_exported',
      userId,
      metadata: { exportedEntities: Object.keys(exportData).length }
    })

    return exportData
  }

  /**
   * Deletar todos os dados de um usuário (LGPD Right to Erasure)
   */
  static async deleteUserData(
    userId: string,
    requestedBy: string
  ): Promise<void> {
    // Verificar permissão (deve ser o próprio usuário ou admin)
    if (userId !== requestedBy) {
      // Check if requestedBy is admin
      const requester = await prisma.user.findUnique({
        where: { id: requestedBy }
      })

      if (!requester || requester.role !== 'admin') {
        throw new Error('Não autorizado')
      }
    }

    // Deletar em cascata
    await prisma.$transaction(async (tx) => {
      // Deletar comentários
      await tx.projectComment.deleteMany({
        where: { userId }
      })

      // Deletar sessões
      await tx.session.deleteMany({
        where: { userId }
      })

      // Anonimizar projetos (não deletar, manter para histórico)
      await tx.project.updateMany({
        where: { userId },
        data: {
          userId: 'deleted-user'
          // Note: Project model doesn't have metadata field
        }
      })

      // Deletar conta
      await tx.user.delete({
        where: { id: userId }
      })
    })

    await AuditLogger.log({
      action: 'data_deleted',
      userId: requestedBy,
      resourceId: userId,
      resourceType: 'user'
    })
  }
}
