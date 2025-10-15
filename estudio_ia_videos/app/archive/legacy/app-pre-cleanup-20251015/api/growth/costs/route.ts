
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { CostRevenueMonitor } from '@/lib/growth/cost-revenue-monitor'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock usage data - em produção, buscar do banco
    const usage = {
      ttsMinutes: 1500,
      renderMinutes: 800,
      storageMB: 25000,
      apiCalls: 50000,
    }

    const costs = CostRevenueMonitor.calculateCosts(usage, 'month')

    const revenue = CostRevenueMonitor.calculateRevenue(
      {
        subscriptions: 45000,
        oneTime: 5000,
        upgrades: 8000,
        downgrades: 2000,
        refunds: 1000,
      },
      'month'
    )

    const profitability = CostRevenueMonitor.calculateProfitability(
      revenue,
      costs,
      {
        totalCustomers: 1250,
        newCustomers: 85,
        marketingSpend: 5000,
        avgCustomerLifespanMonths: 18,
      }
    )

    const optimizations = CostRevenueMonitor.generateCostOptimizations(costs)
    const projections = CostRevenueMonitor.projectCosts(costs, 10, 6)

    return NextResponse.json({
      success: true,
      costs,
      revenue,
      profitability,
      optimizations,
      projections,
    })
  } catch (error) {
    console.error('Error fetching cost data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cost data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { usage, period } = body

    const costs = CostRevenueMonitor.calculateCosts(usage, period)

    // Em produção, salvar no banco
    // await prisma.costMetrics.create({ data: costs })

    return NextResponse.json({
      success: true,
      costs,
    })
  } catch (error) {
    console.error('Error calculating costs:', error)
    return NextResponse.json(
      { error: 'Failed to calculate costs' },
      { status: 500 }
    )
  }
}
