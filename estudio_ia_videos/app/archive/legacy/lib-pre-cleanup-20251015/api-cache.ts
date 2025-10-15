/**
 * Middleware de Cache para API Routes
 */

import { NextResponse } from 'next/server';
import { cache, withCache } from '@/lib/cache';

// Cache para GET requests
export function withApiCache(
  handler: Function,
  options: { ttl?: number; keyPrefix?: string } = {}
) {
  return async (req: Request, context: any) => {
    const { method, url } = req;

    // Só fazer cache de GET requests
    if (method !== 'GET') {
      return handler(req, context);
    }

    // Gerar chave de cache baseada na URL
    const cacheKey = `${options.keyPrefix || 'api'}:${url}`;

    // Tentar pegar do cache
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    // Executar handler
    const response = await handler(req, context);
    const data = await response.json();

    // Salvar no cache
    cache.set(cacheKey, data, options.ttl);

    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=300',
      },
    });
  };
}

// Exemplo de uso:
// 
// // app/api/courses/route.ts
// import { withApiCache } from '@/lib/api-cache';
// 
// export const GET = withApiCache(
//   async (req: Request) => {
//     const courses = await getCourses();
//     return NextResponse.json(courses);
//   },
//   { ttl: 5 * 60 * 1000 } // 5 minutos
// );
