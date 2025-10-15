
/**
 * SPRINT 34 - KIBANA DASHBOARD CONFIGURATION
 * Pre-configured dashboards for monitoring and analytics
 */

export interface KibanaDashboard {
  id: string;
  title: string;
  description: string;
  visualizations: KibanaVisualization[];
}

export interface KibanaVisualization {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'table' | 'metric';
  title: string;
  query: string;
  aggregation?: string;
  field?: string;
}

export const kibanaDashboards: KibanaDashboard[] = [
  {
    id: 'performance-monitoring',
    title: 'Performance Monitoring',
    description: 'Application performance metrics and response times',
    visualizations: [
      {
        id: 'avg-response-time',
        type: 'line',
        title: 'Average Response Time',
        query: 'service:"estudio-ia-videos" AND metadata.responseTime:*',
        aggregation: 'avg',
        field: 'metadata.responseTime',
      },
      {
        id: 'error-rate',
        type: 'line',
        title: 'Error Rate',
        query: 'level:error OR level:fatal',
        aggregation: 'count',
      },
      {
        id: 'requests-by-endpoint',
        type: 'bar',
        title: 'Requests by Endpoint',
        query: 'metadata.endpoint:*',
        aggregation: 'count',
        field: 'metadata.endpoint',
      },
      {
        id: 'status-codes',
        type: 'pie',
        title: 'HTTP Status Codes',
        query: 'metadata.statusCode:*',
        aggregation: 'count',
        field: 'metadata.statusCode',
      },
    ],
  },
  {
    id: 'ai-operations',
    title: 'AI Operations Dashboard',
    description: 'TTS, AI generation, and processing metrics',
    visualizations: [
      {
        id: 'tts-provider-usage',
        type: 'pie',
        title: 'TTS Provider Usage',
        query: 'service:"estudio-ia-videos" AND metadata.ttsProvider:*',
        aggregation: 'count',
        field: 'metadata.ttsProvider',
      },
      {
        id: 'ai-generation-time',
        type: 'line',
        title: 'AI Generation Time',
        query: 'metadata.aiGenerationTime:*',
        aggregation: 'avg',
        field: 'metadata.aiGenerationTime',
      },
      {
        id: 'processing-queue-size',
        type: 'metric',
        title: 'Processing Queue Size',
        query: 'metadata.queueSize:*',
        aggregation: 'avg',
        field: 'metadata.queueSize',
      },
    ],
  },
  {
    id: 'user-activity',
    title: 'User Activity Dashboard',
    description: 'User engagement and activity metrics',
    visualizations: [
      {
        id: 'active-users',
        type: 'metric',
        title: 'Active Users',
        query: 'metadata.eventType:"user_active"',
        aggregation: 'cardinality',
        field: 'userId',
      },
      {
        id: 'projects-created',
        type: 'line',
        title: 'Projects Created Over Time',
        query: 'metadata.eventType:"project_created"',
        aggregation: 'count',
      },
      {
        id: 'user-actions',
        type: 'bar',
        title: 'User Actions',
        query: 'metadata.eventType:*',
        aggregation: 'count',
        field: 'metadata.eventType',
      },
    ],
  },
  {
    id: 'security-audit',
    title: 'Security & Audit Dashboard',
    description: 'Security events and audit logs',
    visualizations: [
      {
        id: 'failed-logins',
        type: 'line',
        title: 'Failed Login Attempts',
        query: 'metadata.eventType:"auth_failed"',
        aggregation: 'count',
      },
      {
        id: 'permission-changes',
        type: 'table',
        title: 'Recent Permission Changes',
        query: 'metadata.eventType:"permission_change"',
        aggregation: 'count',
      },
      {
        id: 'api-access-by-user',
        type: 'bar',
        title: 'API Access by User',
        query: 'metadata.apiAccess:true',
        aggregation: 'count',
        field: 'userId',
      },
    ],
  },
];

/**
 * Export Kibana dashboard configuration as JSON
 */
export function exportKibanaDashboard(dashboardId: string): string {
  const dashboard = kibanaDashboards.find((d) => d.id === dashboardId);
  if (!dashboard) {
    throw new Error(`Dashboard ${dashboardId} not found`);
  }

  return JSON.stringify(
    {
      version: '8.0.0',
      objects: [
        {
          type: 'dashboard',
          id: dashboard.id,
          attributes: {
            title: dashboard.title,
            description: dashboard.description,
            panelsJSON: JSON.stringify(
              dashboard.visualizations.map((viz, index) => ({
                panelIndex: index,
                gridData: {
                  x: (index % 2) * 24,
                  y: Math.floor(index / 2) * 12,
                  w: 24,
                  h: 12,
                  i: viz.id,
                },
                version: '8.0.0',
                panelRefName: `panel_${index}`,
              }))
            ),
          },
        },
        ...dashboard.visualizations.map((viz, index) => ({
          type: 'visualization',
          id: viz.id,
          attributes: {
            title: viz.title,
            visState: JSON.stringify({
              type: viz.type,
              params: {
                type: viz.type,
                addTooltip: true,
                addLegend: true,
              },
              aggs: [
                {
                  id: '1',
                  enabled: true,
                  type: viz.aggregation || 'count',
                  schema: 'metric',
                  params: {
                    field: viz.field,
                  },
                },
              ],
            }),
            uiStateJSON: '{}',
            description: '',
            version: 1,
            kibanaSavedObjectMeta: {
              searchSourceJSON: JSON.stringify({
                index: 'logs-*',
                query: {
                  query: viz.query,
                  language: 'lucene',
                },
              }),
            },
          },
        })),
      ],
    },
    null,
    2
  );
}
