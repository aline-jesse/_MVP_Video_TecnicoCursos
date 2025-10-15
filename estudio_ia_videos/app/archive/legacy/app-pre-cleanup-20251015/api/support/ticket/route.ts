
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { HelpCenterAI } from '@/lib/support/help-center-ai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, description, userPlan } = body

    const userId = (session.user as any).id || session.user.email || 'unknown'

    const ticket = HelpCenterAI.createSupportTicket(
      userId,
      subject,
      description,
      userPlan || 'free'
    )

    // Em produção, salvar no banco
    // await prisma.supportTicket.create({ data: ticket })

    // Enviar notificação para equipe de suporte
    // await sendSlackNotification(ticket)

    return NextResponse.json({
      success: true,
      ticket,
    })
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock tickets - em produção, buscar do banco
    const mockTickets = [
      {
        id: 'TICK-1001',
        userId: 'user1',
        subject: 'Problema com renderização',
        description: 'Vídeo não renderiza',
        status: 'open' as const,
        priority: 'high' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        sla: {
          responseTime: 240,
          resolutionTime: 1440,
          breached: false,
        },
      },
    ]

    const reportData = HelpCenterAI.generateSupportReport(mockTickets)

    return NextResponse.json({
      success: true,
      tickets: mockTickets,
      report: reportData,
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}
