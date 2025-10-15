/**
 * 🚀 DATABASE PERFORMANCE CONFIGURATION
 * Configurações avançadas de performance para produção
 */

export interface DatabasePerformanceConfig {
  connectionPool: {
    min: number
    max: number
    acquireTimeoutMillis: number
    createTimeoutMillis: number
    destroyTimeoutMillis: number
    idleTimeoutMillis: number
    reapIntervalMillis: number
    createRetryIntervalMillis: number
  }
  query: {
    timeout: number
    retries: number
    slowQueryThreshold: number
    enableQueryCache: boolean
    cacheSize: number
    cacheTTL: number
  }
  transaction: {
    maxWait: number
    timeout: number
    isolationLevel: 'ReadCommitted' | 'Serializable' | 'ReadUncommitted' | 'RepeatableRead'
    retries: number
  }
  monitoring: {
    enableMetrics: boolean
    enableSlowQueryLog: boolean
    enableConnectionPoolMetrics: boolean
    metricsInterval: number
  }
}

export const getProductionConfig = (): DatabasePerformanceConfig => ({
  connectionPool: {
    min: 10,                        // Minimum connections
    max: 100,                       // Maximum connections
    acquireTimeoutMillis: 60000,    // 60 seconds
    createTimeoutMillis: 30000,     // 30 seconds
    destroyTimeoutMillis: 5000,     // 5 seconds
    idleTimeoutMillis: 300000,      // 5 minutes
    reapIntervalMillis: 1000,       // 1 second
    createRetryIntervalMillis: 200, // 200ms
  },
  query: {
    timeout: 30000,                 // 30 seconds
    retries: 3,
    slowQueryThreshold: 1000,       // 1 second
    enableQueryCache: true,
    cacheSize: 1000,                // Number of cached queries
    cacheTTL: 300000,               // 5 minutes
  },
  transaction: {
    maxWait: 60000,                 // 60 seconds
    timeout: 300000,                // 5 minutes
    isolationLevel: 'ReadCommitted',
    retries: 3,
  },
  monitoring: {
    enableMetrics: true,
    enableSlowQueryLog: true,
    enableConnectionPoolMetrics: true,
    metricsInterval: 30000,         // 30 seconds
  }
})

export const getDevelopmentConfig = (): DatabasePerformanceConfig => ({
  connectionPool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 10000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 60000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  query: {
    timeout: 10000,
    retries: 2,
    slowQueryThreshold: 500,
    enableQueryCache: false,
    cacheSize: 100,
    cacheTTL: 60000,
  },
  transaction: {
    maxWait: 30000,
    timeout: 60000,
    isolationLevel: 'ReadCommitted',
    retries: 2,
  },
  monitoring: {
    enableMetrics: true,
    enableSlowQueryLog: true,
    enableConnectionPoolMetrics: false,
    metricsInterval: 60000,
  }
})

export const getConfig = (): DatabasePerformanceConfig => {
  return process.env.NODE_ENV === 'production' 
    ? getProductionConfig() 
    : getDevelopmentConfig()
}

// 📊 Performance Metrics Interface
export interface DatabaseMetrics {
  connectionPool: {
    active: number
    idle: number
    total: number
    waiting: number
  }
  queries: {
    total: number
    slow: number
    failed: number
    averageTime: number
  }
  transactions: {
    active: number
    committed: number
    rolledBack: number
    averageTime: number
  }
  cache: {
    hits: number
    misses: number
    hitRate: number
    size: number
  }
}

// 🔧 Database Health Check
export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  connectionPool: {
    available: number
    used: number
    utilization: number
  }
  lastCheck: Date
  errors: string[]
}

// 🚨 Alert Thresholds
export const ALERT_THRESHOLDS = {
  connectionPoolUtilization: 0.8,    // 80%
  queryLatency: 5000,                 // 5 seconds
  slowQueryCount: 10,                 // per minute
  errorRate: 0.05,                    // 5%
  diskUsage: 0.9,                     // 90%
  memoryUsage: 0.85,                  // 85%
} as const

// 🔄 Retry Configuration
export const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,                    // 1 second
  maxDelay: 10000,                    // 10 seconds
  backoffMultiplier: 2,
  jitter: true,
} as const

// 📈 Query Optimization Hints
export const QUERY_HINTS = {
  // Use for large result sets
  streaming: {
    batchSize: 1000,
    timeout: 30000,
  },
  // Use for complex aggregations
  aggregation: {
    timeout: 60000,
    memoryLimit: '256MB',
  },
  // Use for bulk operations
  bulk: {
    batchSize: 500,
    timeout: 120000,
  },
} as const

export default {
  getConfig,
  getProductionConfig,
  getDevelopmentConfig,
  ALERT_THRESHOLDS,
  RETRY_CONFIG,
  QUERY_HINTS,
}