
/**
 * SPRINT 34 - ROLE-BASED ACCESS CONTROL (RBAC)
 * Granular permission management system
 */

export type Permission =
  // Project permissions
  | 'projects.create'
  | 'projects.read'
  | 'projects.update'
  | 'projects.delete'
  | 'projects.share'
  | 'projects.publish'
  // Template permissions
  | 'templates.read'
  | 'templates.create'
  | 'templates.update'
  | 'templates.delete'
  // User management
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  // Analytics
  | 'analytics.read'
  | 'analytics.export'
  // Settings
  | 'settings.read'
  | 'settings.update'
  // Admin
  | 'admin.access'
  | 'admin.audit-logs'
  | 'admin.system-settings'
  // Render
  | 'render.submit'
  | 'render.priority'
  | 'render.batch';

export type Role = 'viewer' | 'editor' | 'admin' | 'superadmin';

export interface RoleDefinition {
  name: Role;
  displayName: string;
  description: string;
  permissions: Permission[];
  inherits?: Role;
}

/**
 * Role definitions with permissions
 */
export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  viewer: {
    name: 'viewer',
    displayName: 'Visualizador',
    description: 'Pode visualizar projetos e templates, mas não pode editar',
    permissions: [
      'projects.read',
      'templates.read',
      'analytics.read',
    ],
  },
  editor: {
    name: 'editor',
    displayName: 'Editor',
    description: 'Pode criar e editar projetos, mas não pode gerenciar usuários',
    permissions: [
      'projects.create',
      'projects.read',
      'projects.update',
      'projects.share',
      'templates.read',
      'templates.create',
      'analytics.read',
      'render.submit',
    ],
    inherits: 'viewer',
  },
  admin: {
    name: 'admin',
    displayName: 'Administrador',
    description: 'Controle total sobre projetos e usuários da organização',
    permissions: [
      'projects.create',
      'projects.read',
      'projects.update',
      'projects.delete',
      'projects.share',
      'projects.publish',
      'templates.read',
      'templates.create',
      'templates.update',
      'templates.delete',
      'users.read',
      'users.create',
      'users.update',
      'analytics.read',
      'analytics.export',
      'settings.read',
      'settings.update',
      'admin.access',
      'admin.audit-logs',
      'render.submit',
      'render.priority',
      'render.batch',
    ],
    inherits: 'editor',
  },
  superadmin: {
    name: 'superadmin',
    displayName: 'Super Administrador',
    description: 'Acesso completo ao sistema, incluindo configurações críticas',
    permissions: [
      'projects.create',
      'projects.read',
      'projects.update',
      'projects.delete',
      'projects.share',
      'projects.publish',
      'templates.read',
      'templates.create',
      'templates.update',
      'templates.delete',
      'users.read',
      'users.create',
      'users.update',
      'users.delete',
      'analytics.read',
      'analytics.export',
      'settings.read',
      'settings.update',
      'admin.access',
      'admin.audit-logs',
      'admin.system-settings',
      'render.submit',
      'render.priority',
      'render.batch',
    ],
    inherits: 'admin',
  },
};

/**
 * RBAC Service
 */
export class RBACService {
  /**
   * Check if a role has a specific permission
   */
  static hasPermission(role: Role, permission: Permission): boolean {
    const roleDef = ROLE_DEFINITIONS[role];
    if (!roleDef) return false;

    // Check direct permissions
    if (roleDef.permissions.includes(permission)) {
      return true;
    }

    // Check inherited permissions
    if (roleDef.inherits) {
      return this.hasPermission(roleDef.inherits, permission);
    }

    return false;
  }

  /**
   * Get all permissions for a role (including inherited)
   */
  static getPermissions(role: Role): Permission[] {
    const roleDef = ROLE_DEFINITIONS[role];
    if (!roleDef) return [];

    const permissions = new Set<Permission>(roleDef.permissions);

    // Add inherited permissions
    if (roleDef.inherits) {
      const inheritedPerms = this.getPermissions(roleDef.inherits);
      inheritedPerms.forEach((perm) => permissions.add(perm));
    }

    return Array.from(permissions);
  }

  /**
   * Check if user can access resource
   */
  static canAccessResource(
    userRole: Role,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete'
  ): boolean {
    const permission = `${resource}.${action}` as Permission;
    return this.hasPermission(userRole, permission);
  }

  /**
   * Get role hierarchy level (higher = more permissions)
   */
  static getRoleLevel(role: Role): number {
    const levels: Record<Role, number> = {
      viewer: 1,
      editor: 2,
      admin: 3,
      superadmin: 4,
    };
    return levels[role] || 0;
  }

  /**
   * Check if roleA has higher or equal privileges than roleB
   */
  static hasHigherOrEqualRole(roleA: Role, roleB: Role): boolean {
    return this.getRoleLevel(roleA) >= this.getRoleLevel(roleB);
  }

  /**
   * Validate if a user can assign a role to another user
   */
  static canAssignRole(assignerRole: Role, targetRole: Role): boolean {
    // Only superadmin can assign superadmin role
    if (targetRole === 'superadmin') {
      return assignerRole === 'superadmin';
    }

    // Admins and superadmins can assign roles lower than theirs
    return this.getRoleLevel(assignerRole) > this.getRoleLevel(targetRole);
  }
}

/**
 * Middleware helper for RBAC checks
 */
export function requirePermission(permission: Permission) {
  return (userRole: Role): boolean => {
    return RBACService.hasPermission(userRole, permission);
  };
}

/**
 * Middleware helper for role checks
 */
export function requireRole(minimumRole: Role) {
  return (userRole: Role): boolean => {
    return RBACService.hasHigherOrEqualRole(userRole, minimumRole);
  };
}
