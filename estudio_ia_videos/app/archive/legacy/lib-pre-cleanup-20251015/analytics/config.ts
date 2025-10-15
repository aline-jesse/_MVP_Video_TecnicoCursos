/**
 * Configurações centralizadas do sistema de analytics
 */

export const ANALYTICS_CONFIG = {
  // Configurações gerais
  ENABLED: process.env.ANALYTICS_ENABLED !== 'false',
  RETENTION_DAYS: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '90'),
  
  // Configurações de cache
  CACHE: {
    DEFAULT_TTL: 5 * 60, // 5 minutos
    REALTIME_TTL: 30, // 30 segundos
    REPORTS_TTL: 60 * 60, // 1 hora
    EXPORT_TTL: 10 * 60, // 10 minutos
  },

  // Configurações de rate limiting
  RATE_LIMIT: {
    EVENTS_PER_MINUTE: 1000,
    EXPORTS_PER_HOUR: 10,
    ALERTS_PER_MINUTE: 5,
  },

  // Configurações de alertas
  ALERTS: {
    EMAIL_FROM: process.env.ALERT_EMAIL_FROM || 'alerts@estudioiavideos.com',
    WEBHOOK_URL: process.env.ALERT_WEBHOOK_URL,
    SMS_API_KEY: process.env.ALERT_SMS_API_KEY,
    DEFAULT_COOLDOWN: 300, // 5 minutos
    MAX_ALERTS_PER_HOUR: 20,
  },

  // Configurações de relatórios
  REPORTS: {
    STORAGE_PATH: process.env.REPORTS_STORAGE_PATH || '/tmp/reports',
    EMAIL_FROM: process.env.REPORTS_EMAIL_FROM || 'reports@estudioiavideos.com',
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    CLEANUP_AFTER_DAYS: 30,
  },

  // Configurações de exportação
  EXPORT: {
    MAX_RECORDS: 100000,
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_FORMATS: ['csv', 'json', 'xlsx', 'pdf', 'xml'],
    COMPRESSION_THRESHOLD: 1024 * 1024, // 1MB
  },

  // Configurações de performance
  PERFORMANCE: {
    SLOW_QUERY_THRESHOLD: 1000, // 1 segundo
    HIGH_ERROR_RATE_THRESHOLD: 5, // 5%
    HIGH_MEMORY_THRESHOLD: 80, // 80%
    HIGH_CPU_THRESHOLD: 80, // 80%
  },

  // Configurações de tempo real
  REALTIME: {
    UPDATE_INTERVAL: 5000, // 5 segundos
    MAX_EVENTS_BUFFER: 1000,
    WEBSOCKET_ENABLED: false, // Para futuras implementações
  },

  // Configurações de segurança
  SECURITY: {
    REQUIRE_AUTH: true,
    ADMIN_ONLY_ENDPOINTS: [
      '/api/analytics/alerts/evaluate',
      '/api/analytics/reports/scheduler',
    ],
    RATE_LIMIT_ENABLED: true,
    IP_WHITELIST: process.env.ANALYTICS_IP_WHITELIST?.split(',') || [],
  },

  // Configurações de logging
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    ENABLE_CONSOLE: process.env.NODE_ENV === 'development',
    ENABLE_FILE: true,
    MAX_LOG_SIZE: 10 * 1024 * 1024, // 10MB
  },

  // Configurações de banco de dados
  DATABASE: {
    BATCH_SIZE: 1000,
    CONNECTION_TIMEOUT: 30000, // 30 segundos
    QUERY_TIMEOUT: 60000, // 1 minuto
    MAX_CONNECTIONS: 10,
  },

  // Configurações de métricas padrão
  DEFAULT_METRICS: {
    EVENTS: ['page_view', 'click', 'form_submit', 'video_play', 'video_complete'],
    PERFORMANCE: ['response_time', 'throughput', 'error_rate', 'cpu_usage', 'memory_usage'],
    USER_BEHAVIOR: ['session_duration', 'bounce_rate', 'conversion_rate', 'retention_rate'],
  },

  // Configurações de agregação
  AGGREGATION: {
    INTERVALS: {
      MINUTE: 60 * 1000,
      HOUR: 60 * 60 * 1000,
      DAY: 24 * 60 * 60 * 1000,
      WEEK: 7 * 24 * 60 * 60 * 1000,
      MONTH: 30 * 24 * 60 * 60 * 1000,
    },
    BATCH_PROCESSING: true,
    MAX_BATCH_SIZE: 10000,
  },

  // URLs e endpoints
  ENDPOINTS: {
    BASE_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    WEBHOOK_BASE: process.env.WEBHOOK_BASE_URL,
    CDN_URL: process.env.CDN_URL,
  },

  // Configurações de notificações
  NOTIFICATIONS: {
    SLACK_WEBHOOK: process.env.SLACK_WEBHOOK_URL,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK_URL,
    TEAMS_WEBHOOK: process.env.TEAMS_WEBHOOK_URL,
    EMAIL_TEMPLATES_PATH: '/templates/emails',
  },

  // Configurações de backup
  BACKUP: {
    ENABLED: process.env.BACKUP_ENABLED === 'true',
    INTERVAL_HOURS: 24,
    RETENTION_DAYS: 30,
    STORAGE_TYPE: process.env.BACKUP_STORAGE_TYPE || 'local',
    S3_BUCKET: process.env.BACKUP_S3_BUCKET,
  },

  // Configurações de desenvolvimento
  DEVELOPMENT: {
    MOCK_DATA: process.env.NODE_ENV === 'development',
    DEBUG_MODE: process.env.DEBUG === 'true',
    VERBOSE_LOGGING: process.env.VERBOSE_LOGS === 'true',
    SKIP_AUTH: process.env.SKIP_AUTH === 'true',
  },
} as const;

// Tipos para TypeScript
export type AnalyticsConfig = typeof ANALYTICS_CONFIG;

// Validação de configuração
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar configurações obrigatórias
  if (!ANALYTICS_CONFIG.ALERTS.EMAIL_FROM) {
    errors.push('ALERT_EMAIL_FROM é obrigatório');
  }

  if (!ANALYTICS_CONFIG.REPORTS.EMAIL_FROM) {
    errors.push('REPORTS_EMAIL_FROM é obrigatório');
  }

  // Validar valores numéricos
  if (ANALYTICS_CONFIG.RETENTION_DAYS < 1) {
    errors.push('ANALYTICS_RETENTION_DAYS deve ser maior que 0');
  }

  if (ANALYTICS_CONFIG.EXPORT.MAX_RECORDS < 1000) {
    errors.push('MAX_RECORDS deve ser pelo menos 1000');
  }

  // Validar formatos de exportação
  const validFormats = ['csv', 'json', 'xlsx', 'pdf', 'xml'];
  const invalidFormats = ANALYTICS_CONFIG.EXPORT.ALLOWED_FORMATS.filter(
    format => !validFormats.includes(format)
  );
  if (invalidFormats.length > 0) {
    errors.push(`Formatos inválidos: ${invalidFormats.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Utilitários de configuração
export function getConfig<T extends keyof AnalyticsConfig>(section: T): AnalyticsConfig[T] {
  return ANALYTICS_CONFIG[section];
}

export function isFeatureEnabled(feature: string): boolean {
  switch (feature) {
    case 'analytics':
      return ANALYTICS_CONFIG.ENABLED;
    case 'alerts':
      return ANALYTICS_CONFIG.ENABLED && !!ANALYTICS_CONFIG.ALERTS.EMAIL_FROM;
    case 'reports':
      return ANALYTICS_CONFIG.ENABLED && !!ANALYTICS_CONFIG.REPORTS.EMAIL_FROM;
    case 'exports':
      return ANALYTICS_CONFIG.ENABLED;
    case 'realtime':
      return ANALYTICS_CONFIG.ENABLED;
    case 'backup':
      return ANALYTICS_CONFIG.BACKUP.ENABLED;
    default:
      return false;
  }
}

export function getEnvironmentInfo() {
  return {
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    features: {
      analytics: isFeatureEnabled('analytics'),
      alerts: isFeatureEnabled('alerts'),
      reports: isFeatureEnabled('reports'),
      exports: isFeatureEnabled('exports'),
      realtime: isFeatureEnabled('realtime'),
      backup: isFeatureEnabled('backup'),
    },
    config: {
      retentionDays: ANALYTICS_CONFIG.RETENTION_DAYS,
      maxRecords: ANALYTICS_CONFIG.EXPORT.MAX_RECORDS,
      cacheEnabled: ANALYTICS_CONFIG.CACHE.DEFAULT_TTL > 0,
      rateLimitEnabled: ANALYTICS_CONFIG.SECURITY.RATE_LIMIT_ENABLED,
    }
  };
}