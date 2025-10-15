/**
 * STORAGE QUOTA API
 * GET /api/storage/quota - Obter quota do usuário
 * PUT /api/storage/quota - Atualizar quota (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { storageSystem } from '@/lib/storage-system-real';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quota = await storageSystem.getQuota(session.user.id);

    return NextResponse.json(quota);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, newLimit } = await req.json();

    if (!userId || !newLimit) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await storageSystem.setQuota(userId, newLimit);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
