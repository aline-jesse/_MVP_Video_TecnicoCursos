
/**
 * 🧪 API para execução de testes em produção
 */

import { NextRequest, NextResponse } from 'next/server'
import { testRunner, TestHelpers } from '@/lib/production/testing-framework'
import { productionLogger as logger } from '@/lib/production/logger'
import { rateLimiters } from '@/lib/production/rate-limiter'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimiters.strict(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  
  try {
    logger.info('Starting production tests execution')
    
    // Executar todos os testes
    const results = await testRunner.runAll()
    
    const response = {
      status: results.failed === 0 ? 'success' : 'partial_failure',
      timestamp: new Date().toISOString(),
      summary: {
        total: results.totalTests,
        passed: results.passed,
        failed: results.failed,
        successRate: Math.round((results.passed / results.totalTests) * 100),
        duration: results.duration
      },
      results: results.results.map(r => ({
        name: r.name,
        type: r.type,
        passed: r.passed,
        duration: r.duration,
        error: r.error
      }))
    }
    
    return NextResponse.json(response, {
      status: results.failed === 0 ? 200 : 206
    })
    
  } catch (error: any) {
    logger.error('Tests execution failed', { error: error.message })
    
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimiters.strict(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  
  try {
    const body = await request.json()
    const { suite, test } = body
    
    if (suite && test) {
      // Executar teste específico
      logger.info('Running specific test', { suite, test })
      // Implementar execução de teste específico
      
      return NextResponse.json({
        status: 'success',
        message: 'Specific test execution not implemented yet'
      })
    }
    
    if (suite) {
      // Executar suite específica
      logger.info('Running test suite', { suite })
      // Implementar execução de suite específica
      
      return NextResponse.json({
        status: 'success',
        message: 'Suite execution not implemented yet'
      })
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Invalid request body'
    }, { status: 400 })
    
  } catch (error: any) {
    logger.error('Test API error', { error: error.message })
    
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}
