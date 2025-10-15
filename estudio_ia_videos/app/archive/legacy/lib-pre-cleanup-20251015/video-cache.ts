
/**
 * 🎬 Cache de Vídeo em Memória
 * Sistema de cache para armazenar vídeos gerados temporariamente
 */

interface CachedVideo {
  buffer: Buffer
  contentType: string
  createdAt: number
  duration: number
  thumbnailBuffer?: Buffer
}

export class VideoCache {
  private static cache = new Map<string, CachedVideo>()
  private static readonly MAX_AGE = 1000 * 60 * 15 // 15 minutos
  private static readonly MAX_SIZE = 50 // máximo 50 vídeos

  // Armazenar vídeo no cache
  static store(key: string, buffer: Buffer, contentType: string, duration: number = 0, thumbnailBuffer?: Buffer) {
    console.log(`💾 Armazenando vídeo no cache: ${key} (${buffer.length} bytes)`)
    
    // Limpar cache se muito grande
    if (this.cache.size >= this.MAX_SIZE) {
      this.cleanup()
    }

    this.cache.set(key, {
      buffer,
      contentType,
      createdAt: Date.now(),
      duration,
      thumbnailBuffer
    })
  }

  // Recuperar vídeo do cache
  static get(key: string): CachedVideo | null {
    const cached = this.cache.get(key)
    
    if (!cached) {
      console.log(`❌ Vídeo não encontrado no cache: ${key}`)
      return null
    }

    // Verificar se expirou
    if (Date.now() - cached.createdAt > this.MAX_AGE) {
      console.log(`⏰ Vídeo expirado no cache: ${key}`)
      this.cache.delete(key)
      return null
    }

    console.log(`✅ Vídeo encontrado no cache: ${key}`)
    return cached
  }

  // Limpar itens expirados
  static cleanup() {
    const now = Date.now()
    let removed = 0

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.createdAt > this.MAX_AGE) {
        this.cache.delete(key)
        removed++
      }
    }

    console.log(`🧹 Cache vídeo cleanup: ${removed} itens removidos, ${this.cache.size} restantes`)
  }

  // Obter estatísticas do cache
  static getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE,
      maxAge: this.MAX_AGE,
      totalSize: Array.from(this.cache.values()).reduce((sum, item) => sum + item.buffer.length, 0)
    }
  }

  // Limpar todo o cache
  static clear() {
    const size = this.cache.size
    this.cache.clear()
    console.log(`🗑️ Cache vídeo limpo: ${size} itens removidos`)
  }
}
