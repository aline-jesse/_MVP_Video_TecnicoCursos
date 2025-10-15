

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

import { BackupManager } from '@/lib/ga/backup-manager';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const backupManager = new BackupManager();

    if (action === 'list') {
      const backups = await backupManager.listBackups();
      return NextResponse.json({ backups });
    }

    if (action === 'test') {
      const backupId = searchParams.get('backupId');
      if (!backupId) {
        return NextResponse.json({ error: 'backupId required' }, { status: 400 });
      }

      const result = await backupManager.testRestore(backupId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in backups API:', error);
    return NextResponse.json(
      { error: 'Failed to process backup request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, backupId } = body;

    const backupManager = new BackupManager();

    if (action === 'create') {
      const backup = await backupManager.backupDatabase();
      return NextResponse.json({ success: true, backup });
    }

    if (action === 'restore') {
      if (!backupId) {
        return NextResponse.json({ error: 'backupId required' }, { status: 400 });
      }

      const success = await backupManager.restoreBackup(backupId);
      return NextResponse.json({ success });
    }

    if (action === 'cleanup') {
      const retentionDays = body.retentionDays || 30;
      const deletedCount = await backupManager.cleanupOldBackups(retentionDays);
      return NextResponse.json({ success: true, deletedCount });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in backups API:', error);
    return NextResponse.json(
      { error: 'Failed to process backup request' },
      { status: 500 }
    );
  }
}
