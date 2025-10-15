
// @ts-nocheck

/**
 * 🏃 API de Execuções de Workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/automation/workflow-engine';

export async function GET() {
  try {
    // Retorna todas as execuções (em produção, implementar paginação)
    const executions = Array.from((workflowEngine as any).executions.values())
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 50); // Últimas 50 execuções

    return NextResponse.json({ executions });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
