import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 🚀 ENHANCED PRISMA CONFIGURATION - PRODUCTION OPTIMIZED
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  // 🔧 PRODUCTION OPTIMIZATIONS
  transactionOptions: {
    maxWait: 60000, // 60 seconds (increased)
    timeout: 120000, // 120 seconds (increased)
    isolationLevel: 'ReadCommitted',
  },
})

// 🏊‍♂️ CONNECTION POOL OPTIMIZATION
if (!globalForPrisma.prisma) {
  // Don't auto-connect, let individual operations handle connection
  console.log('📦 Prisma client initialized (lazy connection)')
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 🧹 GRACEFUL SHUTDOWN
const gracefulShutdown = async () => {
  console.log('🔄 Gracefully shutting down database connections...')
  try {
    stopConnectionMonitoring()
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Error during database disconnect:', error)
  }
}

// 📡 PROCESS EVENT HANDLERS
process.on('beforeExit', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)

// 📊 CONNECTION MONITORING
let connectionMonitorInterval: NodeJS.Timeout | null = null

export const startConnectionMonitoring = () => {
  if (connectionMonitorInterval) return
  
  connectionMonitorInterval = setInterval(async () => {
    try {
      const health = await checkDatabaseHealth()
      if (health.status === 'unhealthy') {
        console.error('🚨 Database health check failed:', health.error)
      } else if (health.latency > 5000) {
        console.warn(`⚠️ High database latency detected: ${health.latency}ms`)
      }
    } catch (error) {
      console.error('❌ Connection monitoring error:', error)
    }
  }, 30000) // Check every 30 seconds
}

export const stopConnectionMonitoring = () => {
  if (connectionMonitorInterval) {
    clearInterval(connectionMonitorInterval)
    connectionMonitorInterval = null
  }
}

// 🚀 AUTO-START MONITORING IN PRODUCTION
if (process.env.NODE_ENV === 'production') {
  startConnectionMonitoring()
}

// 🏥 ENHANCED HEALTH CHECK FUNCTION
export const checkDatabaseHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy'
  latency: number
  error?: string
}> => {
  const startTime = Date.now()
  
  try {
    await executeWithRetry(async () => {
      await prisma.$queryRaw`SELECT 1 as health_check`
    })
    
    const latency = Date.now() - startTime
    return { status: 'healthy', latency }
  } catch (error: any) {
    const latency = Date.now() - startTime
    return { 
      status: 'unhealthy', 
      latency, 
      error: error.message 
    }
  }
}

// Legacy function for backward compatibility
export async function checkDatabaseHealthLegacy(): Promise<boolean> {
  const health = await checkDatabaseHealth()
  return health.status === 'healthy'
}

// 🔄 ENHANCED QUERY WRAPPER WITH RETRY LOGIC
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Check if it's a connection/timeout error
      const isRetryableError = 
        error.code === 'P1001' || // Can't reach database server
        error.code === 'P2024' || // Timed out fetching a new connection
        error.message?.includes('connection pool') ||
        error.message?.includes('timeout')
      
      if (isRetryableError && attempt < maxRetries) {
        console.warn(`⚠️ Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      } else {
        break
      }
    }
  }
  
  throw lastError
}

// Legacy wrapper for backward compatibility
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  return executeWithRetry(operation, maxRetries, delay)
}
