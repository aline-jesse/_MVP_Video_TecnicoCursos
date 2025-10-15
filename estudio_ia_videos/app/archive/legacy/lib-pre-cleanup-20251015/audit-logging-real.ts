import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuditLogInput {
  action: string
  userId?: string
  organizationId?: string
  resource?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  status?: 'success' | 'failed'
  errorMessage?: string
  ipAddress?: string
  userAgent?: string
}

async function resolveOrganizationId(userId?: string, explicitOrgId?: string) {
  if (explicitOrgId) {
    return explicitOrgId
  }

  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentOrgId: true },
  })

  return user?.currentOrgId ?? null
}

async function log(input: AuditLogInput) {
  try {
    const organizationId = await resolveOrganizationId(input.userId, input.organizationId)

    if (!organizationId) {
      // Sem organiza��o n�o � poss�vel persistir (constraint not null)
      return
    }

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: input.userId,
        userEmail: undefined,
        userName: undefined,
        action: input.action,
        resource: input.resource ?? 'system',
        resourceId: input.resourceId,
        description: undefined,
        metadata: input.metadata ?? undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        status: input.status ?? 'success',
        errorMessage: input.errorMessage,
      },
    })
  } catch (error) {
    console.warn('[auditLogger] Failed to persist audit log:', error)
  }
}

export const auditLogger = {
  log,
}

export type AuditLogger = typeof auditLogger

// Simple logger for webhook system and other modules
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '')
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '')
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta) : '')
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '')
  },
}
