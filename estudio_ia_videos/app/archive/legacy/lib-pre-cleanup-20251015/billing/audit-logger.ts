
/**
 * Audit Logger
 * Sprint 35: Track all organization actions for security & compliance
 */

import { prisma } from '../db';

export interface AuditLogParams {
  organizationId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failed';
  errorMessage?: string;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        description: params.description,
        metadata: params.metadata,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        status: params.status || 'success',
        errorMessage: params.errorMessage,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should never break the main flow
  }
}

/**
 * Get audit logs for organization
 */
export async function getAuditLogs(params: {
  organizationId: string;
  limit?: number;
  offset?: number;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: any = {
    organizationId: params.organizationId,
  };

  if (params.userId) where.userId = params.userId;
  if (params.action) where.action = params.action;
  if (params.resource) where.resource = params.resource;

  if (params.startDate || params.endDate) {
    where.timestamp = {};
    if (params.startDate) where.timestamp.gte = params.startDate;
    if (params.endDate) where.timestamp.lte = params.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: params.limit || 100,
      skip: params.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}

/**
 * Common audit actions
 */
export const AuditActions = {
  // Organization
  ORG_CREATED: 'org:created',
  ORG_UPDATED: 'org:updated',
  ORG_DELETED: 'org:deleted',

  // Members
  MEMBER_INVITED: 'member:invited',
  MEMBER_JOINED: 'member:joined',
  MEMBER_ROLE_CHANGED: 'member:role_changed',
  MEMBER_REMOVED: 'member:removed',

  // Projects
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_DELETED: 'project:deleted',
  PROJECT_SHARED: 'project:shared',

  // Billing
  BILLING_PLAN_CHANGED: 'billing:plan_changed',
  BILLING_PAYMENT_SUCCESS: 'billing:payment_success',
  BILLING_PAYMENT_FAILED: 'billing:payment_failed',
  BILLING_SUBSCRIPTION_CANCELLED: 'billing:subscription_cancelled',

  // Settings
  SETTINGS_UPDATED: 'settings:updated',
  WHITELABEL_UPDATED: 'whitelabel:updated',
  SSO_CONFIGURED: 'sso:configured',
  SSO_ENABLED: 'sso:enabled',
  SSO_DISABLED: 'sso:disabled',

  // Security
  LOGIN: 'security:login',
  LOGOUT: 'security:logout',
  PASSWORD_CHANGED: 'security:password_changed',
  API_KEY_CREATED: 'security:api_key_created',
  API_KEY_REVOKED: 'security:api_key_revoked',
} as const;
