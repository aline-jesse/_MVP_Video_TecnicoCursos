
/**
 * ⚡ API - Automação Inteligente
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const workflows = [
      {
        id: 'wf-1',
        name: 'Onboarding Automático',
        description: 'Matricula novos funcionários em cursos obrigatórios',
        type: 'enrollment',
        status: 'active',
        trigger: {
          type: 'event',
          event: 'user.created'
        },
        actions: [
          { type: 'email', template: 'welcome' },
          { type: 'enrollment', courses: ['NR-35', 'NR-10'] },
          { type: 'schedule', task: 'initial_assessment', delay: '24h' }
        ],
        metrics: {
          executions: 347,
          successRate: 98.5,
          avgExecutionTime: 2.3
        },
        lastExecution: new Date(Date.now() - 1800000)
      },
      {
        id: 'wf-2',
        name: 'Notificação de Vencimento',
        description: 'Alerta sobre certificações próximas ao vencimento',
        type: 'notification',
        status: 'active',
        trigger: {
          type: 'schedule',
          cron: '0 9 * * *' // Diariamente às 9h
        },
        actions: [
          { type: 'query', target: 'certificates_expiring' },
          { type: 'notification', channels: ['email', 'push'] },
          { type: 'calendar', action: 'schedule_renewal' }
        ],
        metrics: {
          executions: 892,
          successRate: 95.2,
          avgExecutionTime: 5.7
        },
        lastExecution: new Date(Date.now() - 3600000)
      }
    ];

    return NextResponse.json({
      success: true,
      data: workflows,
      total: workflows.length,
      active: workflows.filter(w => w.status === 'active').length
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar workflows' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, type, trigger, actions } = await request.json();

    const newWorkflow = {
      id: `wf-${Date.now()}`,
      name,
      description,
      type,
      status: 'active',
      trigger,
      actions,
      metrics: {
        executions: 0,
        successRate: 0,
        avgExecutionTime: 0
      },
      createdAt: new Date(),
      lastExecution: null
    };

    return NextResponse.json({
      success: true,
      data: newWorkflow,
      message: 'Workflow criado com sucesso'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao criar workflow' },
      { status: 500 }
    );
  }
}
