import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

async function isAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) {
    return false
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  return user?.role === 'admin'
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!await isAdmin(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      activeSessions,
      totalProjects,
      projectsLast24h,
      storageAggregate,
      renderSummary,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.session.count({ where: { expires: { gte: now } } }),
      prisma.project.count(),
      prisma.project.count({ where: { updatedAt: { gte: last24h } } }),
      prisma.fileUpload.aggregate({ _sum: { fileSize: true } }),
      getRenderJobSummary(last24h),
    ])

    const usedStorage = storageAggregate._sum.fileSize ?? BigInt(0)
    const totalStorageBytes = BigInt(500) * BigInt(1024) * BigInt(1024) * BigInt(1024) // 500GB default quota

    const usedStorageNumber = usedStorage > BigInt(Number.MAX_SAFE_INTEGER)
      ? Number.MAX_SAFE_INTEGER
      : Number(usedStorage)

    const storageUtilization = totalStorageBytes > 0
      ? Number(((Number(usedStorage) / Number(totalStorageBytes)) * 100).toFixed(2))
      : 0

    return NextResponse.json({
      totalUsers,
      activeSessions,
      totalProjects,
      projectsLast24h,
      usedStorage: usedStorageNumber,
      usedStorageBytes: usedStorage.toString(),
      totalStorageBytes: totalStorageBytes.toString(),
      storageUtilization,
      renderJobs: renderSummary,
      generatedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('[Admin Stats] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

async function getRenderJobSummary(since: Date) {
  const [total, processing, failed, completed] = await Promise.all([
    prisma.renderJob.count(),
    prisma.renderJob.count({ where: { status: { in: ['pending', 'processing', 'queued'] } } }),
    prisma.renderJob.count({ where: { status: 'failed', updatedAt: { gte: since } } }),
    prisma.renderJob.count({ where: { status: 'completed', updatedAt: { gte: since } } }),
  ])

  return {
    total,
    processing,
    failedLast24h: failed,
    completedLast24h: completed,
  }
}
