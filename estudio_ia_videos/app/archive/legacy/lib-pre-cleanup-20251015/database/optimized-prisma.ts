/**
 * 🚀 OPTIMIZED PRISMA CLIENT
 * Configuração otimizada para produção com pool de conexões melhorado
 */

import { PrismaClient } from "@prisma/client"

// 🔧 ENHANCED CONNECTION CONFIGURATION
const createOptimizedPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required")
  }

  // Parse and enhance connection string for better performance
  const url = new URL(connectionString)
  
  // Add connection pool parameters if not present
  if (!url.searchParams.has("connection_limit")) {
    url.searchParams.set("connection_limit", "100") // Increased for production
  }
  
  if (!url.searchParams.has("pool_timeout")) {
    url.searchParams.set("pool_timeout", "60") // Increased for production
  }
  
  if (!url.searchParams.has("connect_timeout")) {
    url.searchParams.set("connect_timeout", "30") // Increased for production
  }
  
  if (!url.searchParams.has("socket_timeout")) {
    url.searchParams.set("socket_timeout", "60") // Increased for production
  }
  
  // Add additional production optimizations
  if (!url.searchParams.has("statement_cache_size")) {
    url.searchParams.set("statement_cache_size", "1000")
  }
  
  if (!url.searchParams.has("pgbouncer")) {
    url.searchParams.set("pgbouncer", "true")
  }
  
  if (!url.searchParams.has("schema_cache")) {
    url.searchParams.set("schema_cache", "true")
  }

  const optimizedUrl = url.toString()

  return new PrismaClient({
    datasources: {
      db: {
        url: optimizedUrl,
      },
    },
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "warn",
      },
      {
        emit: "event",
        level: "info",
      },
    ],
    errorFormat: "pretty",
    transactionOptions: {
      maxWait: 30000, // 30 seconds
      timeout: 120000, // 2 minutes (increased)
      isolationLevel: "ReadCommitted",
    },
  })
}

// 🌐 GLOBAL INSTANCE
const globalForPrisma = globalThis as unknown as {
  optimizedPrisma: PrismaClient | undefined
}

export const optimizedPrisma = globalForPrisma.optimizedPrisma ?? createOptimizedPrismaClient()

// 🔄 CONNECTION MANAGEMENT
class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager
  private isConnected = false
  private connectionAttempts = 0
  private lastHealthCheck = 0

  static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager()
    }
    return DatabaseConnectionManager.instance
  }

  async connect(): Promise<void> {
    try {
      this.connectionAttempts++
      
      await optimizedPrisma.$connect()
      
      // Health check
      await optimizedPrisma.$queryRaw`SELECT 1 as health_check`
      
      this.isConnected = true
      this.connectionAttempts = 0
      
      console.log("✅ Database connected successfully")
      
    } catch (error: any) {
      this.isConnected = false
      
      console.error("❌ Database connection failed:", error)
      
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await optimizedPrisma.$disconnect()
      this.isConnected = false
      
      console.log("✅ Database disconnected successfully")
      
    } catch (error: any) {
      console.error("❌ Database disconnection failed:", error)
      throw error
    }
  }

  async healthCheck(): Promise<{
    healthy: boolean
    latency: number
    error?: string
  }> {
    const startTime = Date.now()
    
    try {
      await optimizedPrisma.$queryRaw`SELECT 1 as health_check`
      
      const latency = Date.now() - startTime
      this.lastHealthCheck = Date.now()
      
      return {
        healthy: true,
        latency
      }
      
    } catch (error: any) {
      const latency = Date.now() - startTime
      
      return {
        healthy: false,
        latency,
        error: error.message
      }
    }
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        return result
        
      } catch (error: any) {
        lastError = error
        
        console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error.message)
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
        }
      }
    }
    
    throw lastError!
  }

  getConnectionStatus(): {
    connected: boolean
    attempts: number
    lastHealthCheck: number
  } {
    return {
      connected: this.isConnected,
      attempts: this.connectionAttempts,
      lastHealthCheck: this.lastHealthCheck
    }
  }
}

// 🚀 EXPORT MANAGER INSTANCE
export const dbManager = DatabaseConnectionManager.getInstance()

// 🔄 AUTO-CONNECT
if (!globalForPrisma.optimizedPrisma) {
  dbManager.connect().catch((error) => {
    console.error("�� Critical: Failed to establish database connection:", error)
  })
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.optimizedPrisma = optimizedPrisma
}

// 🧹 GRACEFUL SHUTDOWN
const gracefulShutdown = async () => {
  console.log("🔄 Shutting down database connections...")
  try {
    await dbManager.disconnect()
    console.log("✅ Database shutdown completed")
  } catch (error) {
    console.error("❌ Database shutdown failed:", error)
  }
}

process.on("beforeExit", gracefulShutdown)
process.on("SIGINT", gracefulShutdown)
process.on("SIGTERM", gracefulShutdown)

export default optimizedPrisma
