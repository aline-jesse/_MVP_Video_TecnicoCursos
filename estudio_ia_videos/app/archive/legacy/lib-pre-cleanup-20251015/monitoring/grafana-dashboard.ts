
/**
 * 📊 GRAFANA DASHBOARD CONFIGURATION
 * Dashboards de monitoramento avançado
 */

export interface GrafanaDashboard {
  id: string
  title: string
  panels: GrafanaPanel[]
  refresh: string
  time: {
    from: string
    to: string
  }
}

export interface GrafanaPanel {
  id: number
  title: string
  type: 'graph' | 'stat' | 'gauge' | 'table' | 'heatmap'
  targets: GrafanaTarget[]
  gridPos: {
    x: number
    y: number
    w: number
    h: number
  }
}

export interface GrafanaTarget {
  expr: string
  legendFormat: string
}

/**
 * Dashboard Principal - Performance & Uso
 */
export const PERFORMANCE_DASHBOARD: GrafanaDashboard = {
  id: 'performance-main',
  title: 'Estúdio IA - Performance & Uso',
  refresh: '30s',
  time: {
    from: 'now-6h',
    to: 'now'
  },
  panels: [
    // Core Web Vitals
    {
      id: 1,
      title: 'LCP (Largest Contentful Paint)',
      type: 'gauge',
      targets: [
        {
          expr: 'histogram_quantile(0.95, rate(lcp_seconds_bucket[5m]))',
          legendFormat: 'LCP P95'
        }
      ],
      gridPos: { x: 0, y: 0, w: 6, h: 6 }
    },
    {
      id: 2,
      title: 'FID (First Input Delay)',
      type: 'gauge',
      targets: [
        {
          expr: 'histogram_quantile(0.95, rate(fid_milliseconds_bucket[5m]))',
          legendFormat: 'FID P95'
        }
      ],
      gridPos: { x: 6, y: 0, w: 6, h: 6 }
    },
    {
      id: 3,
      title: 'CLS (Cumulative Layout Shift)',
      type: 'gauge',
      targets: [
        {
          expr: 'histogram_quantile(0.95, rate(cls_score_bucket[5m]))',
          legendFormat: 'CLS P95'
        }
      ],
      gridPos: { x: 12, y: 0, w: 6, h: 6 }
    },
    {
      id: 4,
      title: 'FCP (First Contentful Paint)',
      type: 'gauge',
      targets: [
        {
          expr: 'histogram_quantile(0.95, rate(fcp_seconds_bucket[5m]))',
          legendFormat: 'FCP P95'
        }
      ],
      gridPos: { x: 18, y: 0, w: 6, h: 6 }
    },

    // Requests & Errors
    {
      id: 5,
      title: 'Taxa de Requisições',
      type: 'graph',
      targets: [
        {
          expr: 'rate(http_requests_total[5m])',
          legendFormat: '{{method}} {{path}}'
        }
      ],
      gridPos: { x: 0, y: 6, w: 12, h: 8 }
    },
    {
      id: 6,
      title: 'Taxa de Erros',
      type: 'graph',
      targets: [
        {
          expr: 'rate(http_requests_total{status=~"5.."}[5m])',
          legendFormat: 'Erros 5xx'
        },
        {
          expr: 'rate(http_requests_total{status=~"4.."}[5m])',
          legendFormat: 'Erros 4xx'
        }
      ],
      gridPos: { x: 12, y: 6, w: 12, h: 8 }
    },

    // Render Pipeline
    {
      id: 7,
      title: 'Fila de Renderização',
      type: 'stat',
      targets: [
        {
          expr: 'render_queue_size',
          legendFormat: 'Vídeos na fila'
        }
      ],
      gridPos: { x: 0, y: 14, w: 6, h: 4 }
    },
    {
      id: 8,
      title: 'Tempo Médio de Renderização',
      type: 'stat',
      targets: [
        {
          expr: 'avg(render_duration_seconds)',
          legendFormat: 'Tempo médio (s)'
        }
      ],
      gridPos: { x: 6, y: 14, w: 6, h: 4 }
    },
    {
      id: 9,
      title: 'Taxa de Sucesso de Renderização',
      type: 'gauge',
      targets: [
        {
          expr: 'rate(render_success_total[5m]) / rate(render_total[5m]) * 100',
          legendFormat: 'Sucesso %'
        }
      ],
      gridPos: { x: 12, y: 14, w: 6, h: 4 }
    },

    // TTS & AI
    {
      id: 10,
      title: 'TTS Requests por Provider',
      type: 'graph',
      targets: [
        {
          expr: 'rate(tts_requests_total[5m])',
          legendFormat: '{{provider}}'
        }
      ],
      gridPos: { x: 0, y: 18, w: 12, h: 8 }
    },
    {
      id: 11,
      title: 'TTS Error Rate por Provider',
      type: 'graph',
      targets: [
        {
          expr: 'rate(tts_errors_total[5m]) / rate(tts_requests_total[5m]) * 100',
          legendFormat: '{{provider}}'
        }
      ],
      gridPos: { x: 12, y: 18, w: 12, h: 8 }
    },

    // Collaboration
    {
      id: 12,
      title: 'Usuários Simultâneos',
      type: 'graph',
      targets: [
        {
          expr: 'collaboration_active_users',
          legendFormat: 'Usuários ativos'
        }
      ],
      gridPos: { x: 0, y: 26, w: 12, h: 6 }
    },
    {
      id: 13,
      title: 'Projetos em Colaboração',
      type: 'stat',
      targets: [
        {
          expr: 'collaboration_active_projects',
          legendFormat: 'Projetos ativos'
        }
      ],
      gridPos: { x: 12, y: 26, w: 6, h: 6 }
    },
    {
      id: 14,
      title: 'Mensagens de Colaboração/min',
      type: 'stat',
      targets: [
        {
          expr: 'rate(collaboration_messages_total[1m]) * 60',
          legendFormat: 'Mensagens/min'
        }
      ],
      gridPos: { x: 18, y: 26, w: 6, h: 6 }
    },

    // Sistema
    {
      id: 15,
      title: 'CPU Usage',
      type: 'graph',
      targets: [
        {
          expr: '100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
          legendFormat: 'CPU %'
        }
      ],
      gridPos: { x: 0, y: 32, w: 8, h: 6 }
    },
    {
      id: 16,
      title: 'Memory Usage',
      type: 'graph',
      targets: [
        {
          expr: '(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100',
          legendFormat: 'Memory %'
        }
      ],
      gridPos: { x: 8, y: 32, w: 8, h: 6 }
    },
    {
      id: 17,
      title: 'Disk I/O',
      type: 'graph',
      targets: [
        {
          expr: 'rate(node_disk_read_bytes_total[5m])',
          legendFormat: 'Read'
        },
        {
          expr: 'rate(node_disk_written_bytes_total[5m])',
          legendFormat: 'Write'
        }
      ],
      gridPos: { x: 16, y: 32, w: 8, h: 6 }
    },

    // Database
    {
      id: 18,
      title: 'Database Connections',
      type: 'stat',
      targets: [
        {
          expr: 'pg_stat_database_numbackends',
          legendFormat: 'Conexões ativas'
        }
      ],
      gridPos: { x: 0, y: 38, w: 6, h: 4 }
    },
    {
      id: 19,
      title: 'Query Response Time',
      type: 'graph',
      targets: [
        {
          expr: 'histogram_quantile(0.95, rate(pg_query_duration_seconds_bucket[5m]))',
          legendFormat: 'P95'
        }
      ],
      gridPos: { x: 6, y: 38, w: 12, h: 6 }
    },

    // Redis
    {
      id: 20,
      title: 'Redis Memory Usage',
      type: 'gauge',
      targets: [
        {
          expr: 'redis_memory_used_bytes / redis_memory_max_bytes * 100',
          legendFormat: 'Memory %'
        }
      ],
      gridPos: { x: 18, y: 38, w: 6, h: 6 }
    }
  ]
}

/**
 * Alertas Proativos
 */
export const GRAFANA_ALERTS = [
  {
    name: 'LCP Alto',
    condition: 'histogram_quantile(0.95, rate(lcp_seconds_bucket[5m])) > 2.5',
    message: '⚠️ LCP acima de 2.5s - Performance degradada',
    severity: 'warning'
  },
  {
    name: 'Taxa de Erro Elevada',
    condition: 'rate(http_requests_total{status=~"5.."}[5m]) > 0.05',
    message: '🚨 Taxa de erro acima de 5% - Verificar logs',
    severity: 'critical'
  },
  {
    name: 'Fila de Renderização Grande',
    condition: 'render_queue_size > 100',
    message: '⚠️ Mais de 100 vídeos na fila - Considerar escalar',
    severity: 'warning'
  },
  {
    name: 'CPU Alto',
    condition: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80',
    message: '🚨 CPU acima de 80% - Sistema sobrecarregado',
    severity: 'critical'
  },
  {
    name: 'Memory Alto',
    condition: '(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 90',
    message: '🚨 Memória acima de 90% - Risco de OOM',
    severity: 'critical'
  },
  {
    name: 'TTS Error Rate Alto',
    condition: 'rate(tts_errors_total[5m]) / rate(tts_requests_total[5m]) > 0.1',
    message: '⚠️ Taxa de erro TTS acima de 10% - Verificar providers',
    severity: 'warning'
  },
  {
    name: 'Database Connections Alto',
    condition: 'pg_stat_database_numbackends > 80',
    message: '⚠️ Mais de 80 conexões no banco - Pool quase esgotado',
    severity: 'warning'
  },
  {
    name: 'Disk Space Baixo',
    condition: '(node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10',
    message: '🚨 Menos de 10% de espaço em disco disponível',
    severity: 'critical'
  }
]

/**
 * Configuração do Prometheus
 */
export const PROMETHEUS_CONFIG = `
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'estudio-ia-videos'
    environment: 'production'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - 'alertmanager:9093'

rule_files:
  - 'alerts.yml'

scrape_configs:
  # Next.js App
  - job_name: 'nextjs'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'

  # Node Exporter (Sistema)
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']

  # PostgreSQL Exporter
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  # Redis Exporter
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']

  # Custom App Metrics
  - job_name: 'app-metrics'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics/custom'
`

/**
 * Helpers para integração com Grafana
 */
export class GrafanaClient {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  async createDashboard(dashboard: GrafanaDashboard) {
    const response = await fetch(`${this.baseUrl}/api/dashboards/db`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dashboard,
        overwrite: true
      })
    })

    return response.json()
  }

  async createAlert(alert: any) {
    const response = await fetch(`${this.baseUrl}/api/alert-notifications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(alert)
    })

    return response.json()
  }

  async getMetrics(query: string) {
    const response = await fetch(
      `${this.baseUrl}/api/datasources/proxy/1/api/v1/query?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    )

    return response.json()
  }
}

/**
 * Setup inicial do Grafana
 */
export async function setupGrafana() {
  const client = new GrafanaClient(
    process.env.GRAFANA_URL || 'http://localhost:3000',
    process.env.GRAFANA_API_KEY || ''
  )

  try {
    // Criar dashboard principal
    await client.createDashboard(PERFORMANCE_DASHBOARD)

    // Criar alertas
    for (const alert of GRAFANA_ALERTS) {
      await client.createAlert(alert)
    }

    console.log('✅ Grafana configurado com sucesso')
  } catch (error) {
    console.error('❌ Erro ao configurar Grafana:', error)
    throw error
  }
}
