

import { NextRequest, NextResponse } from 'next/server'
import { PPTXMetricsCollector } from '../../../../lib/pptx/pptx-metrics'


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const daysBack = parseInt(searchParams.get('days') || '30')
    const type = searchParams.get('type') || 'performance'

    let data
    
    switch (type) {
      case 'performance':
        data = PPTXMetricsCollector.getPerformanceStats(daysBack)
        break
      case 'quality':
        data = PPTXMetricsCollector.getQualityMetrics(daysBack)
        break
      case 'export':
        data = PPTXMetricsCollector.exportMetrics('json')
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de métrica inválido' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data,
      type,
      period: `${daysBack} dias`,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching PPTX metrics:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar métricas PPTX' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const metrics = await request.json()
    
    // Validate required fields
    if (!metrics.conversionId || !metrics.fileName || !metrics.slideCount) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes' },
        { status: 400 }
      )
    }

    // Record the conversion metrics
    PPTXMetricsCollector.recordConversion(metrics)

    return NextResponse.json({
      success: true,
      message: 'Métricas registradas com sucesso'
    })

  } catch (error) {
    console.error('Error recording PPTX metrics:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar métricas' },
      { status: 500 }
    )
  }
}
