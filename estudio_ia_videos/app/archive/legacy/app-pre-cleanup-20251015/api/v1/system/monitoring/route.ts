
import { NextRequest, NextResponse } from 'next/server'

interface SystemMetrics {
  cpu: number
  memory: number
  gpu: number
  disk: number
  network: number
  temperature: number
}

interface ServiceStatus {
  name: string
  status: 'online' | 'offline' | 'warning'
  uptime: number
  responseTime: number
  lastCheck: string
}

// In-memory storage for metrics (use database/monitoring service in production)
let systemMetrics: SystemMetrics = {
  cpu: 45,
  memory: 62,
  gpu: 78,
  disk: 34,
  network: 23,
  temperature: 67
}

let services: ServiceStatus[] = [
  {
    name: 'API Gateway',
    status: 'online',
    uptime: 99.9,
    responseTime: 85,
    lastCheck: new Date().toISOString()
  },
  {
    name: 'Render Engine',
    status: 'online',
    uptime: 99.8,
    responseTime: 120,
    lastCheck: new Date().toISOString()
  },
  {
    name: 'TTS Service',
    status: 'online',
    uptime: 99.7,
    responseTime: 180,
    lastCheck: new Date().toISOString()
  },
  {
    name: 'Storage S3',
    status: 'online',
    uptime: 100.0,
    responseTime: 25,
    lastCheck: new Date().toISOString()
  },
  {
    name: 'Database',
    status: 'online',
    uptime: 99.9,
    responseTime: 15,
    lastCheck: new Date().toISOString()
  },
  {
    name: 'Avatar 3D Engine',
    status: 'online',
    uptime: 98.5,
    responseTime: 250,
    lastCheck: new Date().toISOString()
  }
]

// Update metrics with realistic variations
const updateMetrics = () => {
  systemMetrics = {
    cpu: Math.max(0, Math.min(100, systemMetrics.cpu + (Math.random() - 0.5) * 10)),
    memory: Math.max(0, Math.min(100, systemMetrics.memory + (Math.random() - 0.5) * 5)),
    gpu: Math.max(0, Math.min(100, systemMetrics.gpu + (Math.random() - 0.5) * 15)),
    disk: Math.max(0, Math.min(100, systemMetrics.disk + (Math.random() - 0.5) * 3)),
    network: Math.max(0, Math.min(100, systemMetrics.network + (Math.random() - 0.5) * 20)),
    temperature: Math.max(40, Math.min(85, systemMetrics.temperature + (Math.random() - 0.5) * 2))
  }

  services = services.map(service => ({
    ...service,
    responseTime: Math.max(10, service.responseTime + (Math.random() - 0.5) * 50),
    lastCheck: new Date().toISOString(),
    uptime: Math.min(100, service.uptime + Math.random() * 0.01)
  }))
}

// Update metrics every few seconds
setInterval(updateMetrics, 5000)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')
    const detailed = searchParams.get('detailed') === 'true'

    // Update metrics before returning
    updateMetrics()

    if (metric === 'system') {
      return NextResponse.json({
        success: true,
        data: {
          metrics: systemMetrics,
          status: systemMetrics.cpu > 90 || systemMetrics.memory > 85 ? 'warning' : 'healthy',
          alerts: [
            ...(systemMetrics.cpu > 90 ? [{ type: 'cpu', message: 'Alto uso de CPU', level: 'warning' }] : []),
            ...(systemMetrics.memory > 85 ? [{ type: 'memory', message: 'Alto uso de memória', level: 'warning' }] : []),
            ...(systemMetrics.temperature > 80 ? [{ type: 'temperature', message: 'Temperatura elevada', level: 'critical' }] : [])
          ]
        }
      })
    }

    if (metric === 'services') {
      return NextResponse.json({
        success: true,
        data: {
          services,
          overall: {
            status: services.every(s => s.status === 'online') ? 'healthy' : 'degraded',
            online: services.filter(s => s.status === 'online').length,
            total: services.length,
            avgResponseTime: Math.round(services.reduce((acc, s) => acc + s.responseTime, 0) / services.length),
            avgUptime: services.reduce((acc, s) => acc + s.uptime, 0) / services.length
          }
        }
      })
    }

    if (metric === 'performance') {
      // Generate performance data for the last 24 hours
      const performanceData = []
      for (let i = 23; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60 * 60 * 1000)
        performanceData.push({
          timestamp: time.toISOString(),
          hour: time.getHours(),
          cpu: Math.random() * 30 + 35,
          memory: Math.random() * 20 + 50,
          gpu: Math.random() * 40 + 60,
          responseTime: Math.random() * 100 + 50,
          throughput: Math.random() * 500 + 1000,
          errors: Math.random() * 10
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          timeSeries: performanceData,
          current: systemMetrics,
          summary: {
            avgCpu: performanceData.reduce((acc, d) => acc + d.cpu, 0) / performanceData.length,
            avgMemory: performanceData.reduce((acc, d) => acc + d.memory, 0) / performanceData.length,
            avgGpu: performanceData.reduce((acc, d) => acc + d.gpu, 0) / performanceData.length,
            totalThroughput: performanceData.reduce((acc, d) => acc + d.throughput, 0),
            totalErrors: performanceData.reduce((acc, d) => acc + d.errors, 0)
          }
        }
      })
    }

    if (metric === 'alerts') {
      const alerts = [
        ...(systemMetrics.cpu > 90 ? [{
          id: 'cpu-high',
          type: 'system',
          level: 'warning',
          message: 'Alto uso de CPU detectado',
          details: `CPU usage: ${systemMetrics.cpu.toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          resolved: false
        }] : []),
        ...(systemMetrics.memory > 85 ? [{
          id: 'memory-high',
          type: 'system',
          level: 'warning',
          message: 'Alto uso de memória',
          details: `Memory usage: ${systemMetrics.memory.toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          resolved: false
        }] : []),
        ...(systemMetrics.temperature > 80 ? [{
          id: 'temp-high',
          type: 'system',
          level: 'critical',
          message: 'Temperatura do sistema elevada',
          details: `Temperature: ${systemMetrics.temperature.toFixed(1)}°C`,
          timestamp: new Date().toISOString(),
          resolved: false
        }] : []),
        ...services.filter(s => s.responseTime > 500).map(s => ({
          id: `${s.name.toLowerCase().replace(' ', '-')}-slow`,
          type: 'performance',
          level: 'warning',
          message: `${s.name} com resposta lenta`,
          details: `Response time: ${s.responseTime.toFixed(0)}ms`,
          timestamp: new Date().toISOString(),
          resolved: false
        }))
      ]

      return NextResponse.json({
        success: true,
        data: {
          alerts,
          counts: {
            critical: alerts.filter(a => a.level === 'critical').length,
            warning: alerts.filter(a => a.level === 'warning').length,
            info: alerts.filter(a => a.level === 'info').length,
            total: alerts.length
          }
        }
      })
    }

    // Return comprehensive monitoring data
    const monitoringData = {
      system: {
        metrics: systemMetrics,
        status: systemMetrics.cpu > 90 || systemMetrics.memory > 85 ? 'warning' : 'healthy'
      },
      services: {
        services,
        overall: {
          status: services.every(s => s.status === 'online') ? 'healthy' : 'degraded',
          online: services.filter(s => s.status === 'online').length,
          total: services.length
        }
      },
      stats: {
        totalRequests: Math.floor(Math.random() * 10000) + 50000,
        activeConnections: Math.floor(Math.random() * 500) + 1000,
        queueSize: Math.floor(Math.random() * 10) + 2,
        dataProcessed: `${(Math.random() * 50 + 100).toFixed(1)} GB`,
        uptime: '99.87%',
        lastUpdate: new Date().toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      data: monitoringData
    })
  } catch (error) {
    console.error('System monitoring GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados de monitoramento' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'restart-service':
        const serviceName = data.serviceName
        const serviceIndex = services.findIndex(s => s.name === serviceName)
        if (serviceIndex !== -1) {
          services[serviceIndex].status = 'online'
          services[serviceIndex].lastCheck = new Date().toISOString()
          services[serviceIndex].responseTime = Math.random() * 50 + 50
        }
        return NextResponse.json({
          success: true,
          message: `Serviço ${serviceName} reiniciado com sucesso`
        })

      case 'clear-cache':
        // Simulate cache clearing
        systemMetrics.memory = Math.max(30, systemMetrics.memory - 20)
        return NextResponse.json({
          success: true,
          message: 'Cache limpo com sucesso'
        })

      case 'optimize-system':
        // Simulate system optimization
        systemMetrics.cpu = Math.max(20, systemMetrics.cpu - 15)
        systemMetrics.memory = Math.max(30, systemMetrics.memory - 10)
        return NextResponse.json({
          success: true,
          message: 'Sistema otimizado com sucesso'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('System monitoring POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao executar ação' },
      { status: 500 }
    )
  }
}
