
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/db';

/**
 * ✅ API DE ANALYTICS DE EVENTOS REAL - Sprint 43
 * Tracking de eventos para análise comportamental
 */

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    const body = await request.json();
    const { category, action, label, metadata, projectId, duration, fileSize, errorCode, errorMessage } = body;

    if (!category || !action) {
      return NextResponse.json(
        { error: 'category e action são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário se autenticado
    let userId: string | null = null;
    let organizationId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, currentOrgId: true }
      });

      if (user) {
        userId = user.id;
        organizationId = user.currentOrgId;
      }
    }

    // Gerar sessionId baseado em headers
    const userAgent = request.headers.get('user-agent') || undefined;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Determinar status
    const status = errorCode ? 'error' : 'success';

    // Criar evento
    const event = await prisma.analyticsEvent.create({
      data: {
        organizationId,
        userId,
        sessionId,
        category,
        action,
        label: label || null,
        metadata: metadata || null,
        duration: duration || null,
        fileSize: fileSize || null,
        errorCode: errorCode || null,
        errorMessage: errorMessage || null,
        projectId: projectId || null,
        status
      }
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        category: event.category,
        action: event.action,
        timestamp: event.createdAt.toISOString()
      },
      source: 'DATABASE_REAL'
    });

  } catch (error) {
    console.error('❌ Erro ao registrar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar evento', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const projectId = searchParams.get('projectId');
    const limit = parseInt(searchParams.get('limit') || '100');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, currentOrgId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Construir filtros
    const where: any = {};
    
    if (user.currentOrgId) {
      where.organizationId = user.currentOrgId;
    } else {
      where.userId = user.id;
    }

    if (category) where.category = category;
    if (projectId) where.projectId = projectId;

    // Buscar eventos
    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        category: true,
        action: true,
        label: true,
        metadata: true,
        duration: true,
        fileSize: true,
        status: true,
        projectId: true,
        createdAt: true
      }
    });

    // Calcular estatísticas
    const stats = await prisma.analyticsEvent.groupBy({
      by: ['category', 'action'],
      where,
      _count: { id: true },
      _avg: { duration: true }
    });

    return NextResponse.json({
      success: true,
      events: events.map((e: any) => ({
        id: e.id,
        category: e.category,
        action: e.action,
        label: e.label,
        metadata: e.metadata,
        duration: e.duration,
        fileSize: e.fileSize,
        status: e.status,
        projectId: e.projectId,
        timestamp: e.createdAt.toISOString()
      })),
      stats: stats.map((s: any) => ({
        category: s.category,
        action: s.action,
        count: s._count.id,
        avgDuration: s._avg.duration
      })),
      source: 'DATABASE_REAL'
    });

  } catch (error) {
    console.error('❌ Erro ao buscar eventos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar eventos', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
