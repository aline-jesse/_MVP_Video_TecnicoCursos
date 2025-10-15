import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { ReportScheduler } from '@/lib/analytics/report-scheduler';
import { withAnalytics } from '@/lib/analytics/api-performance-middleware';

/**
 * GET /api/analytics/reports/scheduler
 * Retorna informações sobre relatórios agendados e estatísticas do agendador
 * 
 * Query params:
 * - action: 'list' | 'stats' | 'run' (default: 'list')
 */
async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'list';
    const organizationId = (session.user as any)?.currentOrgId;

    const scheduler = new ReportScheduler();

    switch (action) {
      case 'list':
        const scheduledReports = await scheduler.getScheduledReports(organizationId);
        return NextResponse.json({
          reports: scheduledReports,
          total: scheduledReports.length,
          active: scheduledReports.filter(r => r.isActive).length
        });

      case 'stats':
        const stats = await scheduler.getSchedulerStats();
        return NextResponse.json(stats);

      case 'run':
        // Verificar se o usuário tem permissão para executar manualmente
        if (!(session.user as any)?.isAdmin) {
          return NextResponse.json(
            { error: 'Admin privileges required to run scheduler manually' },
            { status: 403 }
          );
        }

        const executionResult = await scheduler.runScheduledReports();
        return NextResponse.json({
          message: 'Scheduler executed successfully',
          ...executionResult,
          executedAt: new Date()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be list, stats, or run' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('[Analytics Reports Scheduler] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process scheduler request',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/reports/scheduler
 * Gerencia relatórios agendados (ativar/desativar/deletar)
 */
async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, reportId, isActive } = body;

    if (!action || !reportId) {
      return NextResponse.json(
        { error: 'action and reportId are required' },
        { status: 400 }
      );
    }

    const scheduler = new ReportScheduler();

    switch (action) {
      case 'toggle':
        if (typeof isActive !== 'boolean') {
          return NextResponse.json(
            { error: 'isActive must be a boolean' },
            { status: 400 }
          );
        }
        
        await scheduler.toggleReportStatus(reportId, isActive);
        return NextResponse.json({
          success: true,
          message: `Report ${isActive ? 'activated' : 'deactivated'} successfully`
        });

      case 'delete':
        await scheduler.deleteScheduledReport(reportId);
        return NextResponse.json({
          success: true,
          message: 'Scheduled report deleted successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be toggle or delete' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('[Analytics Reports Scheduler POST] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to manage scheduled report',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// Aplicar middleware de performance