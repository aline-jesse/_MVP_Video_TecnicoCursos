
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '24h'

    // Calculate time range
    const now = new Date()
    const timeRanges = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const startTime = timeRanges[range as keyof typeof timeRanges] || timeRanges['24h']

    // System metrics
    const systemHealth = await getSystemHealth()

    // User metrics
    const userMetrics = await getUserMetrics(startTime)

    // Content metrics
    const contentMetrics = await getContentMetrics(startTime)

    // API metrics
    const apiMetrics = await getApiMetrics(startTime)

    // Business metrics
    const businessMetrics = await getBusinessMetrics(startTime)

    const analytics = {
      system: systemHealth,
      users: userMetrics,
      content: contentMetrics,
      api: apiMetrics,
      business: businessMetrics,
      timestamp: new Date(),
      range
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching enterprise analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

async function getSystemHealth() {
  try {
    // Database health check
    const dbStart = performance.now()
    await prisma.$queryRaw`SELECT 1`
    const dbResponseTime = performance.now() - dbStart

    // Mock system metrics (in production, get from monitoring service)
    return {
      cpu: Math.random() * 60 + 20, // 20-80%
      memory: Math.random() * 40 + 40, // 40-80%
      disk: Math.random() * 50 + 20, // 20-70%
      database: dbResponseTime,
      uptime: 99.9 + Math.random() * 0.09 // 99.9-99.99%
    }
  } catch (error) {
    console.error('Error getting system health:', error)
    return {
      cpu: 0,
      memory: 0,
      disk: 0,
      database: 0,
      uptime: 0
    }
  }
}

async function getUserMetrics(startTime: Date) {
  try {
    const totalUsers = await prisma.user.count()
    
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: startTime
        }
      }
    })

    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24h
        }
      }
    })

    const engagement = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0

    return {
      total: totalUsers,
      active: activeUsers,
      newToday: newUsers,
      engagement: Math.round(engagement)
    }
  } catch (error) {
    console.error('Error getting user metrics:', error)
    return {
      total: 0,
      active: 0,
      newToday: 0,
      engagement: 0
    }
  }
}

async function getContentMetrics(startTime: Date) {
  try {
    const totalVideos = await prisma.videoExport.count()
    
    const recentVideos = await prisma.videoExport.findMany({
      where: {
        createdAt: {
          gte: startTime
        }
      },
      select: {
        duration: true,
        status: true,
        fileSize: true
      }
    })

    const avgRenderingTime = recentVideos.length > 0 
      ? recentVideos.reduce((sum: number, v: any) => sum + (v.duration || 0), 0) / recentVideos.length
      : 0

    const successfulVideos = recentVideos.filter((v: any) => v.status === 'completed').length
    const successRate = recentVideos.length > 0 
      ? (successfulVideos / recentVideos.length) * 100 
      : 100

    const totalStorage = recentVideos.reduce((sum: number, v: any) => sum + (v.fileSize || 0), 0) / (1024 * 1024 * 1024) // GB

    return {
      totalVideos,
      renderingTime: Math.round(avgRenderingTime),
      successRate: Math.round(successRate * 10) / 10,
      storageUsed: Math.round(totalStorage * 10) / 10
    }
  } catch (error) {
    console.error('Error getting content metrics:', error)
    return {
      totalVideos: 0,
      renderingTime: 0,
      successRate: 100,
      storageUsed: 0
    }
  }
}

async function getApiMetrics(startTime: Date) {
  // Mock API metrics (in production, get from APM service)
  return {
    totalRequests: Math.floor(Math.random() * 100000) + 50000,
    avgResponseTime: Math.floor(Math.random() * 300) + 100, // 100-400ms
    errorRate: Math.random() * 2, // 0-2%
    throughput: Math.floor(Math.random() * 200) + 300 // 300-500 req/min
  }
}

async function getBusinessMetrics(startTime: Date) {
  try {
    const recentProjects = await prisma.project.count({
      where: {
        createdAt: {
          gte: startTime
        }
      }
    })

    // Mock business metrics (integrate with payment/analytics systems)
    return {
      revenue: Math.floor(Math.random() * 20000) + 20000, // R$ 20k-40k
      conversions: Math.random() * 10 + 10, // 10-20%
      retention: Math.random() * 20 + 70, // 70-90%
      satisfaction: 4.5 + Math.random() * 0.5 // 4.5-5.0
    }
  } catch (error) {
    console.error('Error getting business metrics:', error)
    return {
      revenue: 0,
      conversions: 0,
      retention: 0,
      satisfaction: 0
    }
  }
}
