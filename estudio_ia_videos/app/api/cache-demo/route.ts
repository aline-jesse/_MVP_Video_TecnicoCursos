/**
 * API de demonstração do sistema de cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheHelpers } from '@/lib/cache/cache-middleware';

// Simulação de dados pesados para demonstrar o cache
const generateHeavyData = async (complexity: number = 1000) => {
  // Simular processamento pesado
  await new Promise(resolve => setTimeout(resolve, Math.max(500, complexity)));
  
  return {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
    complexity,
    data: Array.from({ length: complexity }, (_, i) => ({
      index: i,
      value: Math.random() * 1000,
      category: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      nested: {
        subValue: Math.random() * 100,
        flag: Math.random() > 0.5
      }
    })),
    metadata: {
      processedAt: new Date().toISOString(),
      processingTime: Math.max(500, complexity),
      fromCache: false
    }
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const complexity = parseInt(searchParams.get('complexity') || '1000');
    const forceRefresh = searchParams.get('refresh') === 'true';
    const category = searchParams.get('category') || 'default';

    const cacheKey = `demo-data:${category}:complexity-${complexity}`;

    if (forceRefresh) {
      // Invalidar cache antes de buscar novos dados
      await cacheHelpers.invalidateResource('demo', cacheKey);
    }

    const startTime = Date.now();
    
    const data = await cacheHelpers.withCache(
      cacheKey,
      async () => {
        const result = await generateHeavyData(complexity);
        return result;
      },
      {
        ttl: 10 * 60 * 1000, // 10 minutos
        tags: ['demo', `category:${category}`, 'heavy-data']
      }
    );

    const processingTime = Date.now() - startTime;
    const fromCache = processingTime < 100; // Se foi muito rápido, provavelmente veio do cache

    return NextResponse.json({
      ...data,
      metadata: {
        ...data.metadata,
        fromCache,
        requestProcessingTime: processingTime,
        cacheKey
      }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=300',
        'X-Cache-Key': cacheKey,
        'X-Processing-Time': processingTime.toString(),
        'X-From-Cache': fromCache.toString(),
        'X-Complexity': complexity.toString()
      }
    });

  } catch (error) {
    console.error('Erro na API de demonstração:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, target, pattern } = body;

    switch (action) {
      case 'invalidate-by-tag':
        if (!target) {
          return NextResponse.json(
            { error: 'Tag é obrigatória' },
            { status: 400 }
          );
        }
        
        const invalidatedByTag = await cacheHelpers.invalidateResource('demo', target);
        
        return NextResponse.json({
          message: `Cache invalidado por tag: ${target}`,
          action: 'invalidate-by-tag',
          target,
          count: invalidatedByTag
        });

      case 'invalidate-by-pattern':
        if (!pattern) {
          return NextResponse.json(
            { error: 'Padrão é obrigatório' },
            { status: 400 }
          );
        }
        
        // Usar o middleware para invalidação por padrão
        const { cacheMiddleware } = await import('@/lib/cache/cache-middleware');
        const invalidatedByPattern = await cacheMiddleware.invalidate([pattern]);
        
        return NextResponse.json({
          message: `Cache invalidado por padrão: ${pattern}`,
          action: 'invalidate-by-pattern',
          pattern,
          count: invalidatedByPattern
        });

      case 'clear-all-demo':
        const { cacheManager } = await import('@/lib/cache/cache-manager');
        await cacheManager.clear('api');
        
        return NextResponse.json({
          message: 'Todo cache de demonstração foi limpo',
          action: 'clear-all-demo'
        });

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Erro na operação de cache:', error);
    return NextResponse.json(
      { error: 'Erro na operação de cache' },
      { status: 500 }
    );
  }
}