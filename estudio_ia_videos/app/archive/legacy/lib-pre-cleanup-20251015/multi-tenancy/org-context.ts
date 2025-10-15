
/**
 * Organization Context & Helpers
 * Sprint 35: Multi-Tenancy + White-Label Enterprise
 */

import { prisma } from '../db';
import { Organization, OrganizationMember, OrgRole } from '@prisma/client';

export interface OrgContext {
  organization: Organization;
  member: OrganizationMember;
  role: OrgRole;
  permissions: string[];
}

/**
 * Get organization context for a user
 */
export async function getOrgContext(
  userId: string,
  orgId: string
): Promise<OrgContext | null> {
  try {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: userId,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!member || member.status !== 'ACTIVE') {
      return null;
    }

    const permissions = getPermissionsForRole(member.role);

    return {
      organization: member.organization,
      member,
      role: member.role,
      permissions,
    };
  } catch (error) {
    console.error('Error getting org context:', error);
    return null;
  }
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations(userId: string) {
  try {
    const memberships = await prisma.organizationMember.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        organization: {
          include: {
            whiteLabelSettings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return memberships.map((m) => ({
      ...m.organization,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  } catch (error) {
    console.error('Error getting user organizations:', error);
    return [];
  }
}

/**
 * Check if user has permission in organization
 */
export function hasPermission(
  role: OrgRole,
  permission: string
): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission) || permissions.includes('*');
}

/**
 * Get permissions for a role
 */
function getPermissionsForRole(role: OrgRole): string[] {
  const permissionMap: Record<OrgRole, string[]> = {
    OWNER: ['*'], // Full access
    ADMIN: [
      'org:manage',
      'members:manage',
      'billing:manage',
      'settings:manage',
      'projects:*',
      'templates:*',
    ],
    MANAGER: [
      'projects:create',
      'projects:edit',
      'projects:delete',
      'projects:view',
      'templates:use',
      'members:view',
    ],
    MEMBER: [
      'projects:create',
      'projects:edit:own',
      'projects:view',
      'templates:use',
    ],
    VIEWER: [
      'projects:view',
      'templates:view',
    ],
  };

  return permissionMap[role] || [];
}

/**
 * Validate organization limits
 */
export async function validateOrgLimits(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  return {
    canAddMember: org.currentMembers < org.maxMembers,
    canAddProject: org.currentProjects < org.maxProjects,
    canAddStorage: (size: number) => org.currentStorage + BigInt(size) <= org.maxStorage,
    remaining: {
      members: org.maxMembers - org.currentMembers,
      projects: org.maxProjects - org.currentProjects,
      storage: org.maxStorage - org.currentStorage,
    },
  };
}

/**
 * Update organization usage
 */
export async function updateOrgUsage(
  orgId: string,
  updates: {
    members?: number;
    projects?: number;
    storage?: bigint;
  }
) {
  const updateData: any = {};

  if (updates.members !== undefined) {
    updateData.currentMembers = { increment: updates.members };
  }
  if (updates.projects !== undefined) {
    updateData.currentProjects = { increment: updates.projects };
  }
  if (updates.storage !== undefined) {
    updateData.currentStorage = { increment: updates.storage };
  }

  return prisma.organization.update({
    where: { id: orgId },
    data: updateData,
  });
}

/**
 * Scope query to organization
 */
export function scopeToOrg<T extends { organizationId?: string | null }>(
  orgId: string,
  where?: any
): any {
  return {
    ...where,
    organizationId: orgId,
  };
}

/**
 * Create default organization for user (on signup)
 */
export async function createDefaultOrganization(
  userId: string,
  userName: string,
  userEmail: string
) {
  const slug = generateSlug(userName || userEmail);

  const org = await prisma.organization.create({
    data: {
      name: `${userName}'s Workspace`,
      slug,
      email: userEmail,
      status: 'ACTIVE',
      tier: 'FREE',
      members: {
        create: {
          userId,
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      },
    },
    include: {
      members: true,
    },
  });

  // Update user's currentOrgId
  await prisma.user.update({
    where: { id: userId },
    data: { currentOrgId: org.id },
  });

  return org;
}

/**
 * Generate URL-friendly slug
 */
function generateSlug(name: string): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Add random suffix to ensure uniqueness
  slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;

  return slug;
}
