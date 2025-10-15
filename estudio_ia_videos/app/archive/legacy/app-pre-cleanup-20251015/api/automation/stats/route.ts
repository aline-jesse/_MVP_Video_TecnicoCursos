
// @ts-nocheck

/**
 * 📊 API de Estatísticas de Workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/automation/workflow-engine';

export async function GET() {
  try {
    const stats = workflowEngine.getExecutionStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
