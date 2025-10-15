
/**
 * GET /api/metrics
 * Prometheus-style metrics endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { metricsCollector } from '@/lib/monitoring/metrics'

export async function GET(req: NextRequest) {
  const metrics = metricsCollector.getMetrics()

  // Format as Prometheus metrics
  let output = ''

  // Group metrics by name
  const grouped = metrics.reduce((acc, m) => {
    if (!acc[m.name]) acc[m.name] = []
    acc[m.name].push(m)
    return acc
  }, {} as Record<string, typeof metrics>)

  for (const [name, metricsList] of Object.entries(grouped)) {
    output += `# TYPE ${name} gauge\n`
    
    for (const metric of metricsList) {
      const labels = metric.labels 
        ? Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',')
        : ''
      
      output += `${name}${labels ? `{${labels}}` : ''} ${metric.value}\n`
    }
  }

  return new NextResponse(output, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}
