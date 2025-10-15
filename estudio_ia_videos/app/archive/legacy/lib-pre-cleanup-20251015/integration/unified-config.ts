/**
 * 🔧 UNIFIED SYSTEM CONFIGURATION
 * 
 * Configuração centralizada para todo o sistema integrado.
 * Define variáveis de ambiente, endpoints, limites e flags de features.
 * 
 * @version 1.0.0
 * @date 08/10/2025
 */

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
};

// ============================================================================
// APPLICATION CONFIGURATION
// ============================================================================

export const APP_CONFIG = {
  name: 'Estúdio IA de Vídeos',
  version: '1.0.0',
  description: 'Sistema Unificado de Produção de Vídeos com IA',
  
  // URLs
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  
  // Limites
  maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE || '104857600'), // 100MB
  maxConcurrentRenders: parseInt(process.env.MAX_CONCURRENT_RENDERS || '3'),
  maxConcurrentUploads: parseInt(process.env.MAX_CONCURRENT_UPLOADS || '5'),
  
  // Timeouts (em milissegundos)
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'), // 30s
  renderTimeout: parseInt(process.env.RENDER_TIMEOUT || '600000'), // 10min
  uploadTimeout: parseInt(process.env.UPLOAD_TIMEOUT || '120000'), // 2min
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  // Core Features (sempre ativadas)
  pptxProcessing: true,
  avatarRendering: true,
  ttsGeneration: true,
  videoRendering: true,
  
  // Advanced Features
  batchProcessing: getEnvFlag('FEATURE_BATCH_PROCESSING', true),
  autoNarration: getEnvFlag('FEATURE_AUTO_NARRATION', true),
  qualityAnalysis: getEnvFlag('FEATURE_QUALITY_ANALYSIS', true),
  animationConversion: getEnvFlag('FEATURE_ANIMATION_CONVERSION', true),
  
  // Collaboration
  realTimeCollaboration: getEnvFlag('FEATURE_COLLABORATION', false),
  commenting: getEnvFlag('FEATURE_COMMENTING', false),
  versionControl: getEnvFlag('FEATURE_VERSION_CONTROL', false),
  
  // Enterprise
  sso: getEnvFlag('FEATURE_SSO', false),
  whiteLabel: getEnvFlag('FEATURE_WHITE_LABEL', false),
  multiTenancy: getEnvFlag('FEATURE_MULTI_TENANCY', false),
  advancedAnalytics: getEnvFlag('FEATURE_ADVANCED_ANALYTICS', false),
  
  // Experimental
  voiceCloning: getEnvFlag('FEATURE_VOICE_CLONING', false),
  hyperrealAvatars: getEnvFlag('FEATURE_HYPERREAL_AVATARS', true),
  aiScriptGeneration: getEnvFlag('FEATURE_AI_SCRIPT', false),
  blockchainCertificates: getEnvFlag('FEATURE_BLOCKCHAIN', false),
};

// ============================================================================
// STORAGE CONFIGURATION (AWS S3)
// ============================================================================

export const STORAGE_CONFIG = {
  provider: 'aws-s3',
  
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    bucket: process.env.AWS_S3_BUCKET || '',
  },
  
  // Configurações de upload
  multipartThreshold: 5 * 1024 * 1024, // 5MB
  multipartPartSize: 5 * 1024 * 1024, // 5MB
  signedUrlExpiration: 3600, // 1 hora
};

// ============================================================================
// DATABASE CONFIGURATION (Supabase/PostgreSQL)
// ============================================================================

export const DATABASE_CONFIG = {
  provider: 'supabase',
  
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // Connection pool
  poolMin: parseInt(process.env.DB_POOL_MIN || '2'),
  poolMax: parseInt(process.env.DB_POOL_MAX || '10'),
  
  // Retry configuration
  retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
};

// ============================================================================
// TTS PROVIDERS CONFIGURATION
// ============================================================================

export const TTS_CONFIG = {
  defaultProvider: process.env.TTS_DEFAULT_PROVIDER || 'azure',
  
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    modelId: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
    enabled: Boolean(process.env.ELEVENLABS_API_KEY),
  },
  
  azure: {
    apiKey: process.env.AZURE_SPEECH_KEY || '',
    region: process.env.AZURE_SPEECH_REGION || 'brazilsouth',
    enabled: Boolean(process.env.AZURE_SPEECH_KEY),
  },
  
  google: {
    apiKey: process.env.GOOGLE_CLOUD_API_KEY || '',
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    enabled: Boolean(process.env.GOOGLE_CLOUD_API_KEY),
  },
};

// ============================================================================
// AVATAR ENGINES CONFIGURATION
// ============================================================================

export const AVATAR_CONFIG = {
  defaultEngine: process.env.AVATAR_DEFAULT_ENGINE || 'hyperreal',
  
  hyperreal: {
    enabled: true,
    maxQuality: '4k',
    gpuAcceleration: true,
  },
  
  vidnoz: {
    apiKey: process.env.VIDNOZ_API_KEY || '',
    enabled: Boolean(process.env.VIDNOZ_API_KEY),
  },
  
  did: {
    apiKey: process.env.DID_API_KEY || '',
    enabled: Boolean(process.env.DID_API_KEY),
  },
  
  // Audio2Face (UE5)
  audio2face: {
    enabled: getEnvFlag('AVATAR_AUDIO2FACE_ENABLED', false),
    endpoint: process.env.AUDIO2FACE_ENDPOINT || 'http://localhost:8012',
  },
};

// ============================================================================
// RENDER ENGINE CONFIGURATION
// ============================================================================

export const RENDER_CONFIG = {
  engine: process.env.RENDER_ENGINE || 'ffmpeg',
  
  ffmpeg: {
    path: process.env.FFMPEG_PATH || 'ffmpeg',
    threads: parseInt(process.env.FFMPEG_THREADS || '4'),
    preset: process.env.FFMPEG_PRESET || 'medium',
    crf: parseInt(process.env.FFMPEG_CRF || '23'),
  },
  
  // Formatos de saída
  outputFormats: ['mp4', 'webm', 'mov'],
  defaultFormat: 'mp4',
  
  // Qualidade
  qualities: {
    low: { width: 854, height: 480, bitrate: '1000k' },
    medium: { width: 1280, height: 720, bitrate: '2500k' },
    high: { width: 1920, height: 1080, bitrate: '5000k' },
    ultra: { width: 3840, height: 2160, bitrate: '15000k' },
  },
  defaultQuality: 'high',
};

// ============================================================================
// REDIS CONFIGURATION (Cache & Queue)
// ============================================================================

export const REDIS_CONFIG = {
  enabled: getEnvFlag('REDIS_ENABLED', false),
  
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB || '0'),
  
  // TTLs
  cacheTTL: parseInt(process.env.REDIS_CACHE_TTL || '3600'), // 1 hora
  sessionTTL: parseInt(process.env.REDIS_SESSION_TTL || '86400'), // 24 horas
};

// ============================================================================
// ANALYTICS CONFIGURATION
// ============================================================================

export const ANALYTICS_CONFIG = {
  enabled: getEnvFlag('ANALYTICS_ENABLED', true),
  
  // Providers
  googleAnalytics: {
    enabled: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  },
  
  segment: {
    enabled: Boolean(process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY),
    writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || '',
  },
  
  // Internal analytics
  trackEvents: true,
  trackPageViews: true,
  trackErrors: true,
};

// ============================================================================
// MONITORING & LOGGING
// ============================================================================

export const MONITORING_CONFIG = {
  // Sentry
  sentry: {
    enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    environment: ENV.NODE_ENV,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  },
  
  // Logging
  logLevel: process.env.LOG_LEVEL || (ENV.IS_PRODUCTION ? 'info' : 'debug'),
  logFormat: process.env.LOG_FORMAT || 'json',
  
  // Health checks
  healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '60000'), // 1 min
};

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

export const SECURITY_CONFIG = {
  // Rate limiting
  rateLimit: {
    enabled: getEnvFlag('RATE_LIMIT_ENABLED', true),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 min
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  // CORS
  cors: {
    enabled: true,
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
  
  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getEnvFlag(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateConfiguration(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar configurações críticas
  if (ENV.IS_PRODUCTION) {
    if (!STORAGE_CONFIG.aws.bucket) {
      errors.push('AWS S3 bucket não configurado (obrigatório em produção)');
    }
    
    if (!DATABASE_CONFIG.supabase.url) {
      errors.push('Supabase URL não configurado (obrigatório em produção)');
    }
    
    if (SECURITY_CONFIG.jwt.secret === 'change-me-in-production') {
      errors.push('JWT secret deve ser alterado em produção');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ENV,
  APP_CONFIG,
  FEATURES,
  STORAGE_CONFIG,
  DATABASE_CONFIG,
  TTS_CONFIG,
  AVATAR_CONFIG,
  RENDER_CONFIG,
  REDIS_CONFIG,
  ANALYTICS_CONFIG,
  MONITORING_CONFIG,
  SECURITY_CONFIG,
  validateConfiguration
};
