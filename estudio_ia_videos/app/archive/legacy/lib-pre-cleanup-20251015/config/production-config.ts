/**
 * 🚀 CONFIGURAÇÃO DE PRODUÇÃO - FASE 5
 * Configurações robustas para ambiente de produção
 */

export interface ProductionConfig {
  // Configurações básicas
  nodeEnv: string
  port: number
  logLevel: string
  deploymentVersion: string

  // Next.js
  nextAuthSecret: string
  nextAuthUrl: string
  nextTelemetryDisabled: boolean

  // Database
  databaseUrl: string
  supabaseUrl?: string
  supabaseAnonKey?: string
  supabaseServiceRoleKey?: string

  // Redis
  redisUrl?: string
  redisPassword?: string
  redisHost: string
  redisPort: number
  redisDb: number
  redisMaxRetries: number
  redisRetryDelay: number

  // Storage
  minioEndpoint?: string
  minioAccessKey?: string
  minioSecretKey?: string
  minioBucket?: string
  awsAccessKeyId?: string
  awsSecretAccessKey?: string
  awsRegion?: string
  awsS3Bucket?: string

  // Audio2Face
  audio2faceUrl: string
  audio2faceApiKey?: string
  audio2faceTimeout: number
  audio2faceMaxRetries: number

  // Segurança
  jwtSecret: string
  encryptionKey: string
  corsOrigin: string
  rateLimitWindow: number
  rateLimitMax: number

  // Monitoramento
  prometheusUrl?: string
  grafanaUrl?: string
  sentryDsn?: string
  newRelicLicenseKey?: string

  // Performance
  maxFileSize: string
  uploadTimeout: number
  renderTimeout: number
  cacheTtl: number
  compressionEnabled: boolean

  // Feature flags
  enableAnalytics: boolean
  enableMonitoring: boolean
  enableCaching: boolean
  enableCompression: boolean
  enableRateLimiting: boolean

  // Backup
  backupEnabled: boolean
  backupSchedule: string
  backupRetentionDays: number
  backupS3Bucket?: string

  // Notificações
  slackWebhookUrl?: string
  emailService?: string
  sendgridApiKey?: string
  alertEmail?: string
}

/**
 * Carrega configuração de produção das variáveis de ambiente
 */
export function loadProductionConfig(): ProductionConfig {
  // Validar variáveis obrigatórias
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ Variáveis de ambiente não configuradas: ${missingVars.join(', ')}`)
  }

  return {
    // Configurações básicas
    nodeEnv: process.env.NODE_ENV || 'production',
    port: parseInt(process.env.PORT || '3000'),
    logLevel: process.env.LOG_LEVEL || 'warn',
    deploymentVersion: process.env.DEPLOYMENT_VERSION || '5.0.0',

    // Next.js
    nextAuthSecret: process.env.NEXTAUTH_SECRET || 'default-secret-change-in-production',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    nextTelemetryDisabled: process.env.NEXT_TELEMETRY_DISABLED === '1',

    // Database
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/estudio_ia',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // Redis
    redisUrl: process.env.REDIS_URL,
    redisPassword: process.env.REDIS_PASSWORD,
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379'),
    redisDb: parseInt(process.env.REDIS_DB || '0'),
    redisMaxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
    redisRetryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000'),

    // Storage
    minioEndpoint: process.env.MINIO_ENDPOINT,
    minioAccessKey: process.env.MINIO_ACCESS_KEY,
    minioSecretKey: process.env.MINIO_SECRET_KEY,
    minioBucket: process.env.MINIO_BUCKET,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION,
    awsS3Bucket: process.env.AWS_S3_BUCKET,

    // Audio2Face
    audio2faceUrl: process.env.AUDIO2FACE_URL || 'http://localhost:8011',
    audio2faceApiKey: process.env.AUDIO2FACE_API_KEY,
    audio2faceTimeout: parseInt(process.env.AUDIO2FACE_TIMEOUT || '30000'),
    audio2faceMaxRetries: parseInt(process.env.AUDIO2FACE_MAX_RETRIES || '3'),

    // Segurança
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars!!',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),

    // Monitoramento
    prometheusUrl: process.env.PROMETHEUS_URL,
    grafanaUrl: process.env.GRAFANA_URL,
    sentryDsn: process.env.SENTRY_DSN,
    newRelicLicenseKey: process.env.NEW_RELIC_LICENSE_KEY,

    // Performance
    maxFileSize: process.env.MAX_FILE_SIZE || '100MB',
    uploadTimeout: parseInt(process.env.UPLOAD_TIMEOUT || '300000'),
    renderTimeout: parseInt(process.env.RENDER_TIMEOUT || '600000'),
    cacheTtl: parseInt(process.env.CACHE_TTL || '3600'),
    compressionEnabled: process.env.COMPRESSION_ENABLED === 'true',

    // Feature flags
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    enableMonitoring: process.env.ENABLE_MONITORING === 'true',
    enableCaching: process.env.ENABLE_CACHING === 'true',
    enableCompression: process.env.ENABLE_COMPRESSION === 'true',
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING === 'true',

    // Backup
    backupEnabled: process.env.BACKUP_ENABLED === 'true',
    backupSchedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
    backupRetentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    backupS3Bucket: process.env.BACKUP_S3_BUCKET,

    // Notificações
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    emailService: process.env.EMAIL_SERVICE,
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    alertEmail: process.env.ALERT_EMAIL
  }
}

/**
 * Configuração singleton
 */
let productionConfig: ProductionConfig | null = null

export function getProductionConfig(): ProductionConfig {
  if (!productionConfig) {
    productionConfig = loadProductionConfig()
  }
  return productionConfig
}

/**
 * Utilitários de configuração
 */
export const configUtils = {
  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isTest: () => process.env.NODE_ENV === 'test',
  
  getLogLevel: () => {
    const config = getProductionConfig()
    return config.logLevel
  },
  
  isFeatureEnabled: (feature: keyof Pick<ProductionConfig, 
    'enableAnalytics' | 'enableMonitoring' | 'enableCaching' | 
    'enableCompression' | 'enableRateLimiting'>) => {
    const config = getProductionConfig()
    return config[feature]
  },
  
  getRedisConfig: () => {
    const config = getProductionConfig()
    return {
      url: config.redisUrl,
      password: config.redisPassword,
      host: config.redisHost,
      port: config.redisPort,
      db: config.redisDb,
      maxRetries: config.redisMaxRetries,
      retryDelay: config.redisRetryDelay
    }
  },
  
  getDatabaseConfig: () => {
    const config = getProductionConfig()
    return {
      url: config.databaseUrl,
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
      supabaseServiceRoleKey: config.supabaseServiceRoleKey
    }
  }
}

export default getProductionConfig