
/**
 * 🚀 CDN Configuration
 * 
 * Configuração de CDN para assets estáticos
 */

export const CDN_CONFIG = {
  // CDN base URL
  baseUrl: process.env.CDN_URL || '',
  
  // Domínios de imagens permitidos
  imageDomains: [
    'treinx.abacusai.app',
    'staging.treinx.abacusai.app',
    'res.cloudinary.com',
    'images.unsplash.com',
    's3.amazonaws.com',
    process.env.AWS_BUCKET_NAME || '',
  ].filter(Boolean),
  
  // Formatos de imagem suportados
  imageFormats: ['image/avif', 'image/webp', 'image/jpeg', 'image/png'],
  
  // Tamanhos de imagem
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  
  // Device sizes
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
}

/**
 * Gerar URL de imagem otimizada
 */
export function getOptimizedImageUrl(
  src: string,
  width?: number,
  quality = 75
): string {
  if (!CDN_CONFIG.baseUrl) {
    return src
  }
  
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  params.set('q', quality.toString())
  
  return `${CDN_CONFIG.baseUrl}${src}?${params.toString()}`
}

/**
 * Gerar srcset para imagens responsivas
 */
export function generateSrcSet(src: string, widths: number[]): string {
  return widths
    .map(width => `${getOptimizedImageUrl(src, width)} ${width}w`)
    .join(', ')
}

/**
 * Cache control headers para assets
 */
export const CACHE_HEADERS = {
  // Assets imutáveis (hash no nome)
  immutable: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
  
  // Assets estáticos (imagens, fonts)
  static: {
    'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400',
  },
  
  // HTML pages
  html: {
    'Cache-Control': 'public, max-age=0, must-revalidate',
  },
  
  // API responses
  api: {
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  },
  
  // API responses com cache
  apiCached: {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
  },
}

/**
 * Get cache headers baseado no tipo
 */
export function getCacheHeaders(type: keyof typeof CACHE_HEADERS) {
  return CACHE_HEADERS[type] || CACHE_HEADERS.html
}
