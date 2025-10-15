import { NextRequest, NextResponse } from 'next/server'

// Performance Alerts API - Sprint 13
// Simplified version for compilation
export async function GET(request: NextRequest) {
  try {
    // Simulated alerts data
    const alerts = [
      {
        id: 'alert-1',
        type: 'performance',
        severity: 'medium',
        message: 'Tempo de resposta elevado detectado',
        timestamp: new Date().toISOString()
      },
      {
        id: 'alert-2',
        type: 'security',
        severity: 'low',
        message: 'Tentativa de acesso inválido',
        timestamp: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        summary: {
          total: alerts.length,
          critical: 0,
          high: 0,
          medium: 1,
          low: 1
        }
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get alerts' },
      { status: 500 }
    )
  }
}