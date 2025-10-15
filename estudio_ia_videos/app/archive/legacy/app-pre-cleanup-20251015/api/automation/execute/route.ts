
// @ts-nocheck

/**
 * ▶️ API de Execução de Workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/automation/workflow-engine';

export async function POST(request: NextRequest) {
  try {
    const { workflowId, inputs } = await request.json();
    
    const executionId = await workflowEngine.executeWorkflow(workflowId, inputs);
    
    return NextResponse.json({ executionId, status: 'started' });
  } catch (error) {
    console.error('Erro na execução:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
