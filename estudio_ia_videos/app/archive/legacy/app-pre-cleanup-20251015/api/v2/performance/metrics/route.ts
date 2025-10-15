
import { NextRequest, NextResponse } from 'next/server'

// Performance Metrics API - Sprint 13
// Simplified version for compilation
export async function GET(request: NextRequest) {
  try {
    // Simulated metrics response
    const metrics = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      responseTime: Math.random() * 500,
      throughput: Math.random() * 1000,
      errorRate: Math.random() * 5
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    )
  }
}
