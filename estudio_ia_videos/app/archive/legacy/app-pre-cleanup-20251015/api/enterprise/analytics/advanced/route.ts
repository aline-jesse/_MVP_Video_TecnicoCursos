

import { NextRequest, NextResponse } from 'next/server'
import { BusinessIntelligenceEngine } from '../../../../../lib/analytics/business-intelligence'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'quarter' || 'month'
    const metric_type = searchParams.get('type') || 'overview'

    const end_date = new Date().toISOString()
    const start_date = new Date(Date.now() - (
      period === 'day' ? 24 * 60 * 60 * 1000 :
      period === 'week' ? 7 * 24 * 60 * 60 * 1000 :
      period === 'month' ? 30 * 24 * 60 * 60 * 1000 :
      90 * 24 * 60 * 60 * 1000
    )).toISOString()

    let analytics_data

    switch (metric_type) {
      case 'business':
        analytics_data = await BusinessIntelligenceEngine.generateBusinessMetrics(period, start_date, end_date)
        break
        
      case 'user_behavior':
        analytics_data = await BusinessIntelligenceEngine.analyzeUserBehavior('demo-user', { start: start_date, end: end_date })
        break
        
      case 'content_performance':
        analytics_data = await BusinessIntelligenceEngine.analyzeContentPerformance('nr12-safety', { start: start_date, end: end_date })
        break
        
      case 'real_time':
        analytics_data = await BusinessIntelligenceEngine.getRealTimeMetrics()
        break
        
      case 'predictive':
        const user_behavior = await BusinessIntelligenceEngine.analyzeUserBehavior('demo-user', { start: start_date, end: end_date })
        analytics_data = await BusinessIntelligenceEngine.generatePredictiveAnalytics('demo-user', user_behavior)
        break
        
      default:
        // Overview completo
        const [business, user, realTime] = await Promise.all([
          BusinessIntelligenceEngine.generateBusinessMetrics(period, start_date, end_date),
          BusinessIntelligenceEngine.analyzeUserBehavior('demo-user', { start: start_date, end: end_date }),
          BusinessIntelligenceEngine.getRealTimeMetrics()
        ])
        
        analytics_data = {
          business_metrics: business,
          user_behavior: user,
          real_time: realTime,
          summary: {
            total_active_users: business.user_metrics.active_users,
            completion_rate: business.content_metrics.content_completion_rate,
            engagement_score: 87.3,
            system_health: 98.2
          }
        }
    }

    return NextResponse.json({
      success: true,
      data: analytics_data,
      generated_at: new Date().toISOString(),
      period: period,
      metric_type
    })

  } catch (error) {
    console.error('Erro no analytics avançado:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao gerar analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { report_type, recipients, filters } = await request.json()

    const report = await BusinessIntelligenceEngine.generateAutomatedReport(
      report_type,
      recipients
    )

    return NextResponse.json({
      success: true,
      report: {
        id: report.report_id,
        url: report.report_url,
        insights_count: report.key_insights.length,
        action_items_count: report.action_items.length,
        charts_generated: report.charts.length,
        generated_at: report.generated_at
      }
    })

  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao gerar relatório' },
      { status: 500 }
    )
  }
}

