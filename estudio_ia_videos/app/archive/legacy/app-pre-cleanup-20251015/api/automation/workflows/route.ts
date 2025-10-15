
// @ts-nocheck

/**
 * 📋 API de Workflows
 */

import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/automation/workflow-engine';

export async function GET() {
  try {
    const workflows = workflowEngine.getAvailableWorkflows();
    return NextResponse.json({ workflows });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const workflow = await request.json();
    workflowEngine.registerWorkflow(workflow);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
