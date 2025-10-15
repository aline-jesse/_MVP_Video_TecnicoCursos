
// @ts-nocheck

/**
 * ⏹️ API de Cancelamento de Execução
 */

import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/automation/workflow-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: { executionId: string } }
) {
  try {
    const { executionId } = params;
    
    const cancelled = await workflowEngine.cancelExecution(executionId);
    
    if (cancelled) {
      return NextResponse.json({ success: true, message: 'Execução cancelada' });
    } else {
      return NextResponse.json(
        { error: 'Não foi possível cancelar a execução' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
