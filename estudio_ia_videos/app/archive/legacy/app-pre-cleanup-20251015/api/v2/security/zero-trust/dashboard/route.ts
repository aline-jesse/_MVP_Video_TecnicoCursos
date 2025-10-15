

/**
 * 🔒 Security Zero Trust API - Dashboard Data
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    
    const metrics = [
      {
        id: 'security-score',
        name: 'Overall Security Score',
        value: 98,
        status: 'excellent' as const,
        trend: 'stable' as const,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'threats-blocked',
        name: 'Threats Blocked Today',
        value: 0,
        status: 'excellent' as const,
        trend: 'down' as const,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'compliance-score',
        name: 'Compliance Score',
        value: 97,
        status: 'excellent' as const,
        trend: 'up' as const,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'vulnerabilities',
        name: 'Critical Vulnerabilities',
        value: 0,
        status: 'excellent' as const,
        trend: 'stable' as const,
        lastUpdated: new Date().toISOString()
      }
    ];

    const events = [
      {
        id: 'event_1',
        type: 'compliance_check' as const,
        severity: 'low' as const,
        description: 'Verificação automática de conformidade LGPD executada',
        source: 'Compliance Engine',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        resolved: true
      },
      {
        id: 'event_2',
        type: 'vulnerability_scan' as const,
        severity: 'medium' as const,
        description: 'Scan de vulnerabilidades concluído - 2 issues low-risk encontrados',
        source: 'Security Scanner',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        resolved: true
      }
    ];

    const auditLogs = [
      {
        id: 'audit_1',
        userId: 'user_123',
        userName: 'Ana Silva',
        action: 'LOGIN',
        resource: 'Dashboard',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        result: 'success' as const
      },
      {
        id: 'audit_2',
        userId: 'user_456',
        userName: 'Carlos Santos',
        action: 'VIDEO_EXPORT',
        resource: 'Project_1247',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        result: 'success' as const
      }
    ];

    return NextResponse.json({
      success: true,
      metrics,
      events,
      auditLogs,
      summary: {
        overallStatus: 'secure',
        lastScan: new Date().toISOString(),
        nextScan: new Date(Date.now() + 3600000).toISOString()
      }
    });

  } catch (error) {
    console.error('Security dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load security data' },
      { status: 500 }
    );
  }
}

