
/**
 * 📊 API de Estatísticas de Auditoria SSO
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data para demonstração
    const mockStats = {
      activeSessions: 127,
      totalLogins24h: 245,
      failedLogins24h: 12,
      providersUsed: 2,
      averageSessionDuration: 45,
      topGroups: [
        { group: 'funcionarios', count: 189 },
        { group: 'instrutores', count: 28 },
        { group: 'gerentes', count: 12 },
        { group: 'admin', count: 5 }
      ],
      securityAlerts: [
        {
          type: 'brute_force',
          severity: 'high',
          message: '7 tentativas de login falhadas do IP 192.168.1.100',
          timestamp: '2025-08-30T14:25:00Z'
        },
        {
          type: 'unusual_location',
          severity: 'medium',
          message: 'Login de localização incomum detectado para usuario@empresa.com',
          timestamp: '2025-08-30T12:15:00Z'
        }
      ],
      loginTrend: [
        { hour: 8, count: 45 },
        { hour: 9, count: 67 },
        { hour: 10, count: 52 },
        { hour: 11, count: 38 },
        { hour: 12, count: 23 },
        { hour: 13, count: 41 },
        { hour: 14, count: 55 },
        { hour: 15, count: 48 },
        { hour: 16, count: 62 },
        { hour: 17, count: 34 }
      ],
      providerDistribution: [
        { provider: 'Azure AD', users: 234, percentage: 60.1 },
        { provider: 'Google Workspace', users: 156, percentage: 39.9 }
      ]
    };

    return NextResponse.json(mockStats);

  } catch (error) {
    console.error('Erro ao buscar estatísticas de auditoria:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
