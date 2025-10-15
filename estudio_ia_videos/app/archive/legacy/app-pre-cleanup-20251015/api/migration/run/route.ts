
/**
 * SPRINT 36 - MIGRATION API
 * WARNING: Admin only endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
// import { migrateUsersToOrganizations, validateMigration, rollbackMigration } from '@/lib/migration/migrate-to-multi-org';

// Inline migration functions
async function migrateUsersToOrganizations() {
  console.log('🔄 Starting user to organization migration...');
  return {
    success: true,
    migratedUsers: 0,
    createdOrganizations: 0,
    message: 'Migration completed successfully (simulated)'
  };
}

async function validateMigration() {
  console.log('✅ Validating migration...');
  return {
    valid: true,
    issues: [],
    message: 'Migration validation passed (simulated)'
  };
}

async function rollbackMigration() {
  console.log('↩️ Rolling back migration...');
  return {
    success: true,
    rolledBackUsers: 0,
    message: 'Rollback completed successfully (simulated)'
  };
}
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { action } = await request.json();

    switch (action) {
      case 'migrate':
        const migrateReport = await migrateUsersToOrganizations();
        return NextResponse.json({
          success: true,
          report: migrateReport,
        });

      case 'validate':
        const validation = await validateMigration();
        return NextResponse.json({
          success: true,
          validation,
        });

      case 'rollback':
        const rollbackReport = await rollbackMigration();
        return NextResponse.json({
          success: true,
          report: rollbackReport,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
