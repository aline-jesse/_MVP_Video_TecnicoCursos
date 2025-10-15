import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()
const DEFAULT_STORAGE_QUOTA = 5 * 1024 * 1024 * 1024 // 5GB

async function isAdmin(userId: string | undefined) {
  if (!userId) {
    return false
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  return user?.role === 'admin'
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!await isAdmin(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const search = searchParams.get('search')
    const roleFilter = searchParams.get('role')

    const where: Parameters<typeof prisma.user.findMany>[0]['where'] = {}

    if (roleFilter && roleFilter !== 'all') {
      where.role = roleFilter
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              projects: true,
              notifications: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    const userIds = users.map((user) => user.id)

    const storageUsage = userIds.length
      ? await prisma.fileUpload.groupBy({
          by: ['userId'],
          _sum: { fileSize: true },
          where: { userId: { in: userIds } },
        })
      : []

    const storageMap = new Map(storageUsage.map((entry) => [entry.userId, entry._sum.fileSize ?? BigInt(0)]))

    const responseUsers = users.map((user) => {
      const storage = storageMap.get(user.id) ?? BigInt(0)
      const storageNumber = storage > BigInt(Number.MAX_SAFE_INTEGER)
        ? Number.MAX_SAFE_INTEGER
        : Number(storage)

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        projects: user._count.projects,
        notifications: user._count.notifications,
        storageUsed: storageNumber,
        storageUsedBytes: storage.toString(),
        storageQuota: DEFAULT_STORAGE_QUOTA,
        lastActive: user.updatedAt,
      }
    })

    return NextResponse.json({
      users: responseUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Admin Users] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
