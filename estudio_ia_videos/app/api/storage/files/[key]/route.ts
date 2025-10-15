/**
 * STORAGE FILE API
 * GET /api/storage/files/[key] - Obter signed URL
 * DELETE /api/storage/files/[key] - Deletar arquivo
 */

import { NextRequest, NextResponse } from 'next/server';
import { storageSystem } from '@/lib/storage-system-real';
import { auditLogger, AuditAction, getRequestMetadata } from '@/lib/audit-logging-real';
import { getServerSession } from 'next-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600');

    const signedUrl = await storageSystem.getSignedUrl(params.key, expiresIn);

    // Audit log
    const { ip, userAgent } = getRequestMetadata(req);
    await auditLogger.logUserAction(
      AuditAction.FILE_DOWNLOAD,
      session.user.id,
      ip,
      userAgent,
      true,
      { key: params.key }
    );

    return NextResponse.json({ url: signedUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await storageSystem.delete(params.key, session.user.id);

    // Audit log
    const { ip, userAgent } = getRequestMetadata(req);
    await auditLogger.logUserAction(
      AuditAction.FILE_DELETE,
      session.user.id,
      ip,
      userAgent,
      true,
      { key: params.key }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
