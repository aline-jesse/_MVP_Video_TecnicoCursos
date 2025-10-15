/**
 * STORAGE API - Upload e gerenciamento de arquivos
 * POST /api/storage/upload - Upload simples
 * POST /api/storage/multipart/start - Iniciar upload multipart
 * POST /api/storage/multipart/upload - Upload de parte
 * POST /api/storage/multipart/complete - Completar upload
 * GET /api/storage/files - Listar arquivos do usuário
 * GET /api/storage/quota - Obter quota do usuário
 */

import { NextRequest, NextResponse } from 'next/server';
import { storageSystem } from '@/lib/storage-system-real';
import { auditLogger, AuditAction, getRequestMetadata } from '@/lib/audit-logging-real';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limiter-real';
import { getServerSession } from 'next-auth';

export const POST = withRateLimit(RATE_LIMITS.UPLOAD, 'user')(async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    const compress = formData.get('compress') === 'true';
    const optimize = formData.get('optimize') === 'true';
    const isPublic = formData.get('isPublic') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const result = await storageSystem.upload({
      userId: session.user.id,
      file,
      folder,
      compress,
      optimize,
      isPublic,
    });

    // Audit log
    const { ip, userAgent } = getRequestMetadata(req);
    await auditLogger.logUserAction(
      AuditAction.FILE_UPLOAD,
      session.user.id,
      ip,
      userAgent,
      true,
      { fileId: result.id, size: result.size }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor') || undefined;

    const result = await storageSystem.listUserFiles(session.user.id, {
      folder,
      limit,
      cursor,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
