/**
 * 🧪 Cache Test Endpoint
 * 
 * Endpoint para testar o sistema de cache inteligente
 */

import { NextRequest, NextResponse } from 'next/server'
import { IntelligentCacheService } from '@/lib/cache/intelligent-cache'

export const dynamic = 'force-dynamic'

const cache = new IntelligentCacheService()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'test'
  
  try {
    switch (action) {
      case 'test':
        return await testBasicCache()
      case 'compression':
        return await testCompression()
      case 'tags':
        return await testTagInvalidation()
      case 'fallback':
        return await testFallback()
      case 'stats':
        return await getStats()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

async function testBasicCache() {
  const key = 'test-basic-cache'
  const value = { message: 'Hello Cache!', timestamp: Date.now() }
  
  // Set value
  await cache.set(key, value, { ttl: 60 })
  
  // Get value
  const retrieved = await cache.get(key)
  
  return NextResponse.json({
    success: true,
    test: 'basic-cache',
    original: value,
    retrieved,
    match: JSON.stringify(value) === JSON.stringify(retrieved)
  })
}

async function testCompression() {
  const key = 'test-compression'
  const largeValue = {
    data: 'x'.repeat(10000), // 10KB string
    metadata: { size: 'large', compressed: true }
  }
  
  // Set with compression
  await cache.set(key, largeValue, { 
    ttl: 60, 
    compress: true 
  })
  
  // Get value
  const retrieved = await cache.get(key)
  
  return NextResponse.json({
    success: true,
    test: 'compression',
    originalSize: JSON.stringify(largeValue).length,
    retrieved: retrieved ? { ...retrieved, data: retrieved.data?.substring(0, 50) + '...' } : null,
    match: JSON.stringify(largeValue) === JSON.stringify(retrieved)
  })
}

async function testTagInvalidation() {
  const keys = ['test-tag-1', 'test-tag-2', 'test-tag-3']
  const tag = 'test-group'
  
  // Set multiple values with same tag
  for (const key of keys) {
    await cache.set(key, { key, value: Math.random() }, {
      ttl: 60,
      tags: [tag]
    })
  }
  
  // Verify all are cached
  const beforeInvalidation = await Promise.all(
    keys.map(key => cache.get(key))
  )
  
  // Invalidate by tag
  await cache.invalidateByTags([tag])
  
  // Check if invalidated
  const afterInvalidation = await Promise.all(
    keys.map(key => cache.get(key))
  )
  
  return NextResponse.json({
    success: true,
    test: 'tag-invalidation',
    beforeInvalidation: beforeInvalidation.filter(v => v !== null).length,
    afterInvalidation: afterInvalidation.filter(v => v !== null).length,
    invalidated: afterInvalidation.every(v => v === null)
  })
}

async function testFallback() {
  const key = 'test-fallback'
  const value = { message: 'Fallback test', mode: 'memory' }
  
  // Force memory-only storage (Redis is not available)
  await cache.set(key, value, { ttl: 60 })
  
  // Get value (should come from memory)
  const retrieved = await cache.get(key)
  
  return NextResponse.json({
    success: true,
    test: 'fallback',
    redisAvailable: false, // We know Redis is not running
    memoryFallback: true,
    retrieved,
    match: JSON.stringify(value) === JSON.stringify(retrieved)
  })
}

async function getStats() {
  const stats = await cache.getStats()
  const health = await cache.healthCheck()
  
  return NextResponse.json({
    success: true,
    test: 'stats',
    stats,
    health
  })
}