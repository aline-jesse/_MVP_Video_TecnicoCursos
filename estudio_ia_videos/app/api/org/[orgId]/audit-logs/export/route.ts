
/**
 * 📥 API: Export Audit Logs (CSV)
 * GET /api/org/{orgId}/audit-logs/export
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { getOrgContext, hasPermission } from '@/lib/multi-tenancy/org-context';
import { getAuditLogs } from '@/lib/billing/audit-logger';
// @ts-ignore - json2csv será instalado em produção
import { Parser } from 'json2csv';

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const orgContext = await getOrgContext(session.user.id, params.orgId);
    if (!orgContext) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    if (!hasPermission(orgContext.role, 'org:manage')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    const result = await getAuditLogs({
      organizationId: params.orgId,
      startDate,
      endDate,
      limit: 10000, // Export até 10k logs
    });

    // Formata dados para CSV
    const csvData = result.logs.map((log: any) => ({
      timestamp: log.timestamp.toISOString(),
      user: log.userEmail || log.userName || 'Sistema',
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId || '',
      status: log.status,
      description: log.description || '',
      ipAddress: log.ipAddress || '',
    }));

    // Gera CSV
    const parser = new Parser({ delimiter: ';' });
    const csv = parser.parse(csvData);

    // Retorna arquivo
    const fileName = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse('\ufeff' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar audit logs:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar logs' },
      { status: 500 }
    );
  }
}

