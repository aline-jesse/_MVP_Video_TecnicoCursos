
/**
 * SPRINT 36 - DATA MIGRATION
 * Migrate existing users and projects to multi-org model
 */

import { prisma } from '../db';

interface MigrationReport {
  usersProcessed: number;
  projectsProcessed: number;
  organizationsCreated: number;
  errors: string[];
  warnings: string[];
}

/**
 * Migrate all existing users to their own organizations
 */
export async function migrateUsersToOrganizations(): Promise<MigrationReport> {
  const report: MigrationReport = {
    usersProcessed: 0,
    projectsProcessed: 0,
    organizationsCreated: 0,
    errors: [],
    warnings: [],
  };

  try {
    console.log('🚀 Starting migration to multi-org model...');

    // Get all users without currentOrgId
    const usersToMigrate = await prisma.user.findMany({
      where: {
        OR: [
          { currentOrgId: null },
          {
            organizationMemberships: {
              none: {},
            },
          },
        ],
      },
      include: {
        projects: {
          where: {
            organizationId: null,
          },
        },
      },
    });

    console.log(`Found ${usersToMigrate.length} users to migrate`);

    for (const user of usersToMigrate) {
      try {
        // Create personal organization for user
        const orgName = user.name 
          ? `${user.name}'s Organization` 
          : `Organization - ${user.email.split('@')[0]}`;
        
        const orgSlug = generateSlug(orgName, user.id);

        const organization = await prisma.organization.create({
          data: {
            name: orgName,
            slug: orgSlug,
            email: user.email,
            status: 'ACTIVE',
            tier: 'FREE', // Start with FREE tier
            maxMembers: 5,
            maxProjects: 10,
            maxStorage: BigInt(1073741824), // 1GB
            currentMembers: 1,
            currentProjects: user.projects.length,
          },
        });

        report.organizationsCreated++;

        // Add user as OWNER of the organization
        await prisma.organizationMember.create({
          data: {
            organizationId: organization.id,
            userId: user.id,
            role: 'OWNER',
            status: 'ACTIVE',
            joinedAt: new Date(),
          },
        });

        // Update user's currentOrgId
        await prisma.user.update({
          where: { id: user.id },
          data: {
            currentOrgId: organization.id,
          },
        });

        report.usersProcessed++;

        // Migrate user's projects to the organization
        if (user.projects.length > 0) {
          await prisma.project.updateMany({
            where: {
              userId: user.id,
              organizationId: null,
            },
            data: {
              organizationId: organization.id,
            },
          });

          report.projectsProcessed += user.projects.length;
        }

        console.log(`✅ Migrated user ${user.email} → Organization ${organization.name} (${user.projects.length} projects)`);

      } catch (error) {
        const errorMsg = `Failed to migrate user ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        report.errors.push(errorMsg);
      }
    }

    // Check for orphaned projects (projects without organizationId)
    const orphanedProjects = await prisma.project.findMany({
      where: {
        organizationId: null,
      },
      include: {
        user: true,
      },
    });

    if (orphanedProjects.length > 0) {
      report.warnings.push(`Found ${orphanedProjects.length} orphaned projects`);
      
      for (const project of orphanedProjects) {
        try {
          // Try to assign to user's organization
          const userOrg = await prisma.organizationMember.findFirst({
            where: {
              userId: project.userId,
            },
            select: {
              organizationId: true,
            },
          });

          if (userOrg) {
            await prisma.project.update({
              where: { id: project.id },
              data: {
                organizationId: userOrg.organizationId,
              },
            });
            report.projectsProcessed++;
          } else {
            report.warnings.push(`Project ${project.id} could not be assigned to any organization`);
          }
        } catch (error) {
          report.errors.push(`Failed to fix orphaned project ${project.id}`);
        }
      }
    }

    console.log('✅ Migration completed!');
    console.log(`  Users migrated: ${report.usersProcessed}`);
    console.log(`  Organizations created: ${report.organizationsCreated}`);
    console.log(`  Projects migrated: ${report.projectsProcessed}`);
    console.log(`  Errors: ${report.errors.length}`);
    console.log(`  Warnings: ${report.warnings.length}`);

    return report;

  } catch (error) {
    console.error('Migration failed:', error);
    report.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return report;
  }
}

/**
 * Generate unique slug for organization
 */
function generateSlug(name: string, userId: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const userSuffix = userId.slice(0, 8);
  return `${baseSlug}-${userSuffix}`;
}

/**
 * Rollback migration (emergency use only)
 */
export async function rollbackMigration(): Promise<MigrationReport> {
  const report: MigrationReport = {
    usersProcessed: 0,
    projectsProcessed: 0,
    organizationsCreated: 0,
    errors: [],
    warnings: [],
  };

  try {
    console.log('⚠️ Starting migration rollback...');
    report.warnings.push('ROLLBACK: This is an emergency operation!');

    // DO NOT DELETE ORGANIZATIONS - just unlink users
    // This preserves data integrity

    const users = await prisma.user.findMany({
      where: {
        currentOrgId: {
          not: null,
        },
      },
    });

    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          currentOrgId: null,
        },
      });
      report.usersProcessed++;
    }

    console.log(`✅ Rollback completed: ${report.usersProcessed} users unlinked`);
    report.warnings.push('Organizations and memberships preserved. Manual cleanup may be required.');

    return report;

  } catch (error) {
    console.error('Rollback failed:', error);
    report.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return report;
  }
}

/**
 * Validate migration (check data integrity)
 */
export async function validateMigration(): Promise<{
  valid: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  try {
    // Check for users without organizations
    const usersWithoutOrg = await prisma.user.count({
      where: {
        currentOrgId: null,
      },
    });

    if (usersWithoutOrg > 0) {
      issues.push(`${usersWithoutOrg} users without currentOrgId`);
    }

    // Check for projects without organizationId
    const projectsWithoutOrg = await prisma.project.count({
      where: {
        organizationId: null,
      },
    });

    if (projectsWithoutOrg > 0) {
      issues.push(`${projectsWithoutOrg} projects without organizationId`);
    }

    // Check for orphaned organization members
    const orphanedMembers = await prisma.organizationMember.findMany({
      where: {
        user: {
          is: null as any,
        },
      },
    });

    if (orphanedMembers.length > 0) {
      issues.push(`${orphanedMembers.length} orphaned organization members`);
    }

    const valid = issues.length === 0;

    if (valid) {
      console.log('✅ Migration validation passed!');
    } else {
      console.warn('⚠️ Migration validation found issues:');
      issues.forEach(issue => console.warn(`  - ${issue}`));
    }

    return { valid, issues };

  } catch (error) {
    console.error('Validation failed:', error);
    return {
      valid: false,
      issues: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}
