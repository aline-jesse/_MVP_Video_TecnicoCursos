/**
 * 🎭 MOCK DATABASE SERVICE
 * Sistema de fallback para desenvolvimento sem banco de dados
 */

// 📊 IN-MEMORY STORAGE
const mockData = {
  users: new Map(),
  projects: new Map(),
  videos: new Map(),
  analytics: new Map(),
  sessions: new Map(),
  jobs: new Map()
}

// 🔧 MOCK DATABASE OPERATIONS
export class MockDatabase {
  static isConnected = true
  static lastHealthCheck = Date.now()

  // 🏥 HEALTH CHECK
  static async healthCheck(): Promise<{
    healthy: boolean
    latency: number
    error?: string
  }> {
    const startTime = Date.now()
    
    try {
      // Simulate database operation
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const latency = Date.now() - startTime
      this.lastHealthCheck = Date.now()
      
      return {
        healthy: true,
        latency
      }
    } catch (error: any) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        error: error.message
      }
    }
  }

  // 🧹 UTILITY OPERATIONS
  static async $queryRaw(query: any) {
    // Mock raw query - just return success
    return [{ result: "ok" }]
  }

  static async $connect() {
    this.isConnected = true
    return Promise.resolve()
  }

  static async $disconnect() {
    this.isConnected = false
    return Promise.resolve()
  }

  // 📈 STATISTICS
  static getStats() {
    return {
      users: mockData.users.size,
      projects: mockData.projects.size,
      videos: mockData.videos.size,
      analytics: mockData.analytics.size,
      sessions: mockData.sessions.size,
      jobs: mockData.jobs.size,
      connected: this.isConnected,
      lastHealthCheck: this.lastHealthCheck
    }
  }
}

// 🎯 PRISMA-LIKE INTERFACE
export const mockPrisma = {
  $queryRaw: MockDatabase.$queryRaw.bind(MockDatabase),
  $connect: MockDatabase.$connect.bind(MockDatabase),
  $disconnect: MockDatabase.$disconnect.bind(MockDatabase)
}

export default MockDatabase