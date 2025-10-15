
/**
 * 🎵 Cache de Áudio em Memória
 * Sistema de cache para armazenar áudios gerados temporariamente
 */

interface CachedAudio {
  buffer: Buffer
  contentType: string
  createdAt: number
  duration: number
}

export class AudioCache {
  private static cache = new Map<string, CachedAudio>()
  private static readonly MAX_AGE = 1000 * 60 * 10 // 10 minutos
  private static readonly MAX_SIZE = 100 // máximo 100 áudios

  // Armazenar áudio no cache
  static store(key: string, buffer: Buffer, contentType: string, duration: number = 0) {
    console.log(`💾 Armazenando áudio no cache: ${key} (${buffer.length} bytes)`)
    
    // Limpar cache se muito grande
    if (this.cache.size >= this.MAX_SIZE) {
      this.cleanup()
    }

    this.cache.set(key, {
      buffer,
      contentType,
      createdAt: Date.now(),
      duration
    })
  }

  // Recuperar áudio do cache
  static get(key: string): CachedAudio | null {
    const cached = this.cache.get(key)
    
    if (!cached) {
      console.log(`❌ Áudio não encontrado no cache: ${key}`)
      return null
    }

    // Verificar se expirou
    if (Date.now() - cached.createdAt > this.MAX_AGE) {
      console.log(`⏰ Áudio expirado no cache: ${key}`)
      this.cache.delete(key)
      return null
    }

    console.log(`✅ Áudio encontrado no cache: ${key}`)
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

    console.log(`🧹 Cache cleanup: ${removed} itens removidos, ${this.cache.size} restantes`)
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
    console.log(`🗑️ Cache limpo: ${size} itens removidos`)
  }
}
