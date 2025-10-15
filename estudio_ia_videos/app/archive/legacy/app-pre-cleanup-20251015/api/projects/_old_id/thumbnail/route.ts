
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[id]/thumbnail - Get or generate project thumbnail
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        user: { email: session.user.email }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // For now, generate a simple SVG thumbnail
    // In production, this would generate from the actual video or first slide
    const svg = `
      <svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="320" height="180" fill="url(#bg)"/>
        <circle cx="160" cy="90" r="30" fill="white" opacity="0.9"/>
        <polygon points="150,75 150,105 175,90" fill="#3b82f6"/>
        <text x="160" y="130" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" opacity="0.8">
          ${project.name.substring(0, 30)}${project.name.length > 30 ? '...' : ''}
        </text>
        <text x="160" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" opacity="0.6">
          ${project.totalSlides} slides • ${Math.floor(project.duration / 60)}:${(project.duration % 60).toString().padStart(2, '0')}
        </text>
      </svg>
    `

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Error generating thumbnail:', error)
    return NextResponse.json({ error: 'Failed to generate thumbnail' }, { status: 500 })
  }
}
