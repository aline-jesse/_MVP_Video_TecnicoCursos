
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')
    const timeRange = searchParams.get('timeRange') || '7d'

    // Generate real-time mock data
    const generateTimeSeriesData = (days: number) => {
      const data = []
      for (let i = days; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        data.push({
          timestamp: date.toISOString(),
          date: date.toLocaleDateString('pt-BR'),
          usuarios: Math.floor(Math.random() * 200) + 800,
          sessoes: Math.floor(Math.random() * 300) + 1000,
          videos: Math.floor(Math.random() * 50) + 100,
          pageViews: Math.floor(Math.random() * 500) + 2000,
          bounceRate: Math.random() * 10 + 15,
          avgSessionDuration: Math.random() * 5 + 5,
          conversionRate: Math.random() * 5 + 10
        })
      }
      return data
    }

    const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1
    const timeSeriesData = generateTimeSeriesData(days)

    const analyticsData = {
      // Current metrics
      current: {
        activeUsers: Math.floor(Math.random() * 500) + 1000,
        totalSessions: Math.floor(Math.random() * 1000) + 3000,
        avgSessionDuration: Math.random() * 5 + 6,
        bounceRate: Math.random() * 10 + 20,
        pageViews: Math.floor(Math.random() * 2000) + 10000,
        videosCreated: Math.floor(Math.random() * 200) + 500,
        videosCompleted: Math.floor(Math.random() * 150) + 450,
        totalWatchTime: Math.floor(Math.random() * 20000) + 40000,
        avgCompletionRate: Math.random() * 10 + 80,
        renderTime: Math.random() * 2 + 1.5,
        uploadSuccess: Math.random() * 5 + 95,
        errorRate: Math.random() * 2 + 0.5,
        systemUptime: Math.random() * 0.5 + 99.5,
        conversionRate: Math.random() * 5 + 10,
        nrComplianceScore: Math.random() * 5 + 92,
        userSatisfaction: Math.random() * 0.5 + 4.5,
        revenueImpact: Math.floor(Math.random() * 50000) + 100000
      },
      
      // Time series data
      timeSeries: timeSeriesData,
      
      // User behavior by page
      userBehavior: [
        { page: 'Dashboard', sessions: Math.floor(Math.random() * 500) + 1000, avgDuration: 4.2, bounceRate: 15.3, conversionRate: 23.1 },
        { page: 'PPTX Studio', sessions: Math.floor(Math.random() * 300) + 700, avgDuration: 12.7, bounceRate: 8.2, conversionRate: 67.4 },
        { page: 'Avatar Studio', sessions: Math.floor(Math.random() * 200) + 500, avgDuration: 8.9, bounceRate: 12.1, conversionRate: 45.2 },
        { page: 'Templates NR', sessions: Math.floor(Math.random() * 200) + 400, avgDuration: 6.3, bounceRate: 18.7, conversionRate: 34.6 },
        { page: 'Timeline Editor', sessions: Math.floor(Math.random() * 100) + 350, avgDuration: 15.4, bounceRate: 5.9, conversionRate: 78.3 }
      ],
      
      // Performance metrics
      performance: [
        { name: 'Upload Success', value: Math.random() * 5 + 95, color: '#10B981' },
        { name: 'Render Speed', value: 100 - (Math.random() * 2 + 1.5) * 10, color: '#3B82F6' },
        { name: 'System Uptime', value: Math.random() * 0.5 + 99.5, color: '#8B5CF6' },
        { name: 'User Satisfaction', value: (Math.random() * 0.5 + 4.5) * 20, color: '#F59E0B' }
      ],
      
      // Business metrics
      business: {
        customerLifetimeValue: Math.floor(Math.random() * 1000) + 2500,
        acquisitionCost: Math.floor(Math.random() * 50) + 120,
        churnRate: Math.random() * 2 + 1.5,
        monthlyRecurringRevenue: Math.floor(Math.random() * 20000) + 80000,
        roi: Math.floor(Math.random() * 50) + 100
      },
      
      // System status
      systemStatus: {
        services: [
          { name: 'API Gateway', status: 'online', uptime: 99.9, responseTime: Math.floor(Math.random() * 50) + 50 },
          { name: 'Render Engine', status: 'online', uptime: 99.8, responseTime: Math.floor(Math.random() * 100) + 100 },
          { name: 'TTS Service', status: 'online', uptime: 99.7, responseTime: Math.floor(Math.random() * 200) + 150 },
          { name: 'Storage S3', status: 'online', uptime: 100.0, responseTime: Math.floor(Math.random() * 30) + 20 },
          { name: 'Database', status: 'online', uptime: 99.9, responseTime: Math.floor(Math.random() * 20) + 10 }
        ]
      },
      
      // Timestamps
      lastUpdated: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 30000).toISOString() // Next update in 30 seconds
    }

    // Filter by specific metric if requested
    if (metric) {
      const filteredData = { [metric]: analyticsData[metric as keyof typeof analyticsData] }
      return NextResponse.json({
        success: true,
        data: filteredData,
        lastUpdated: analyticsData.lastUpdated
      })
    }

    return NextResponse.json({
      success: true,
      data: analyticsData
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados de analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()
    
    // Log analytics event
    const loggedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      id: `event_${Date.now()}`,
      processed: true
    }

    return NextResponse.json({
      success: true,
      data: loggedEvent,
      message: 'Evento de analytics registrado com sucesso'
    })
  } catch (error) {
    console.error('Analytics event logging error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao registrar evento' },
      { status: 500 }
    )
  }
}
