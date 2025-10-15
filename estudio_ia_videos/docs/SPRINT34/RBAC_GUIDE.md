
# ROLE-BASED ACCESS CONTROL (RBAC) GUIDE
## Sprint 34 - Enterprise Security

### Visão Geral

Sistema de controle de acesso baseado em roles com permissões granulares.

### Roles Disponíveis

#### 1. Viewer (Visualizador)
**Descrição:** Pode visualizar projetos e templates, mas não pode editar.

**Permissões:**
- `projects.read`
- `templates.read`
- `analytics.read`

**Casos de Uso:**
- Stakeholders que precisam revisar projetos
- Auditores internos
- Clientes (acesso limitado)

#### 2. Editor
**Descrição:** Pode criar e editar projetos, mas não pode gerenciar usuários.

**Permissões:**
- Herda todas de Viewer
- `projects.create`
- `projects.update`
- `projects.share`
- `templates.create`
- `render.submit`

**Casos de Uso:**
- Designers de conteúdo
- Criadores de treinamento
- Equipe de produção

#### 3. Admin (Administrador)
**Descrição:** Controle total sobre projetos e usuários da organização.

**Permissões:**
- Herda todas de Editor
- `projects.delete`
- `projects.publish`
- `templates.update`
- `templates.delete`
- `users.read`
- `users.create`
- `users.update`
- `settings.read`
- `settings.update`
- `admin.access`
- `admin.audit-logs`
- `render.priority`
- `render.batch`

**Casos de Uso:**
- Gerentes de equipe
- Administradores de TI
- Responsáveis por compliance

#### 4. SuperAdmin (Super Administrador)
**Descrição:** Acesso completo ao sistema, incluindo configurações críticas.

**Permissões:**
- Herda todas de Admin
- `users.delete`
- `admin.system-settings`

**Casos de Uso:**
- CTO / Tech Lead
- DevOps
- Support team (troubleshooting)

### Implementação

#### Verificar Permissão

```typescript
import { RBACService } from '@/lib/auth/rbac';

// Verificar se usuário tem permissão
const canDelete = RBACService.hasPermission(userRole, 'projects.delete');

if (!canDelete) {
  throw new Error('Permission denied');
}
```

#### Middleware de API

```typescript
// app/api/projects/[id]/route.ts
import { getServerSession } from 'next-auth';
import { RBACService } from '@/lib/auth/rbac';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  const userRole = session?.user?.role || 'viewer';
  
  if (!RBACService.hasPermission(userRole, 'projects.delete')) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // Proceed with deletion
}
```

#### Component-Level Protection

```typescript
'use client';
import { useSession } from 'next-auth/react';
import { RBACService } from '@/lib/auth/rbac';

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const { data: session } = useSession() || {};
  const userRole = session?.user?.role || 'viewer';
  
  const canDelete = RBACService.hasPermission(userRole, 'projects.delete');
  
  if (!canDelete) {
    return null; // Hide button
  }
  
  return (
    <button onClick={() => deleteProject(projectId)}>
      Delete Project
    </button>
  );
}
```

### Permission Matrix

| Resource | Viewer | Editor | Admin | SuperAdmin |
|----------|--------|--------|-------|------------|
| **Projects** |
| Create | ❌ | ✅ | ✅ | ✅ |
| Read | ✅ | ✅ | ✅ | ✅ |
| Update | ❌ | ✅ | ✅ | ✅ |
| Delete | ❌ | ❌ | ✅ | ✅ |
| Publish | ❌ | ❌ | ✅ | ✅ |
| **Templates** |
| Create | ❌ | ✅ | ✅ | ✅ |
| Read | ✅ | ✅ | ✅ | ✅ |
| Update | ❌ | ❌ | ✅ | ✅ |
| Delete | ❌ | ❌ | ✅ | ✅ |
| **Users** |
| Create | ❌ | ❌ | ✅ | ✅ |
| Read | ❌ | ❌ | ✅ | ✅ |
| Update | ❌ | ❌ | ✅ | ✅ |
| Delete | ❌ | ❌ | ❌ | ✅ |
| **Admin** |
| Access Panel | ❌ | ❌ | ✅ | ✅ |
| View Audit Logs | ❌ | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ✅ |

### Atribuir Roles

#### Via Admin Panel

```typescript
// app/admin/users/[id]/change-role.ts
export async function changeUserRole(
  userId: string,
  newRole: Role,
  currentAdminRole: Role
) {
  // Validate permission
  if (!RBACService.canAssignRole(currentAdminRole, newRole)) {
    throw new Error('Cannot assign this role');
  }
  
  // Update user
  await db.user.update({
    where: { id: userId },
    data: { role: newRole },
  });
  
  // Log action
  await auditLog.roleChange(
    session.user.id,
    userId,
    user.role,
    newRole
  );
}
```

#### Bulk Role Assignment

```typescript
// scripts/bulk-assign-roles.ts
async function assignRolesByDomain() {
  await db.user.updateMany({
    where: {
      email: { endsWith: '@company.com' },
      role: 'user',
    },
    data: {
      role: 'editor',
    },
  });
}
```

### Custom Permissions

Adicionar permissões personalizadas por organização:

```typescript
// lib/auth/custom-permissions.ts
interface OrganizationPermissions {
  orgId: string;
  customPermissions: Permission[];
}

export async function getOrgPermissions(orgId: string): Promise<Permission[]> {
  const org = await db.organization.findUnique({
    where: { id: orgId },
    include: { permissions: true },
  });
  
  return org?.permissions.map(p => p.name as Permission) || [];
}

export function hasOrgPermission(
  userRole: Role,
  orgPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  // Check standard role permissions
  if (RBACService.hasPermission(userRole, requiredPermission)) {
    return true;
  }
  
  // Check org-specific permissions
  return orgPermissions.includes(requiredPermission);
}
```

### Testing

#### Unit Tests

```typescript
// __tests__/rbac.test.ts
import { RBACService } from '@/lib/auth/rbac';

describe('RBAC Service', () => {
  test('viewer cannot delete projects', () => {
    expect(
      RBACService.hasPermission('viewer', 'projects.delete')
    ).toBe(false);
  });
  
  test('admin can delete projects', () => {
    expect(
      RBACService.hasPermission('admin', 'projects.delete')
    ).toBe(true);
  });
  
  test('editor inherits viewer permissions', () => {
    expect(
      RBACService.hasPermission('editor', 'projects.read')
    ).toBe(true);
  });
});
```

### Migration

#### Migrar usuários existentes

```typescript
// scripts/migrate-to-rbac.ts
async function migrateToRBAC() {
  // Todos os usuários existentes viram 'editor'
  await db.user.updateMany({
    where: { role: 'user' },
    data: { role: 'editor' },
  });
  
  // Promover admins existentes
  const adminEmails = [
    'admin@company.com',
    'manager@company.com',
  ];
  
  await db.user.updateMany({
    where: { email: { in: adminEmails } },
    data: { role: 'admin' },
  });
}
```

### Best Practices

1. **Princípio do Menor Privilégio**
   - Sempre atribua o menor role necessário
   - Promova apenas quando necessário

2. **Revisão Periódica**
   - Revise roles trimestralmente
   - Remova permissões não utilizadas

3. **Documentação**
   - Documente mudanças de role
   - Justifique elevações de privilégio

4. **Auditoria**
   - Log todas as mudanças de role
   - Monitor ações de alto privilégio

5. **Separação de Ambientes**
   - Roles diferentes em prod vs staging
   - SuperAdmin apenas em produção

### Troubleshooting

#### "Permission denied" inesperado

```typescript
// Debugar permissões do usuário
const userRole = session?.user?.role;
const allPermissions = RBACService.getPermissions(userRole);
console.log('User permissions:', allPermissions);
```

#### Role não sendo aplicado

Verificar:
1. Session está atualizada?
2. JWT token tem o role correto?
3. Database foi atualizado?

### Support

- Documentação: https://treinx.abacusai.app/docs/rbac
- Suporte: support@treinx.abacusai.app
