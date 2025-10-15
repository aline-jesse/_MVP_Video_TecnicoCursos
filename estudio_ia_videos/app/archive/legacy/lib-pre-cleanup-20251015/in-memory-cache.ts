/**
 * 💾 IN-MEMORY CACHE - Fallback quando Redis não está disponível
 * 
 * Cache em memória para desenvolvimento e ambientes sem Redis
 * 
 * @version 1.0.0
 * @date 08/10/2025
 */

interface CacheEntry {
  value: string;
  expiresAt: number;
}

class InMemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Limpar cache expirado a cada minuto
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar se expirou
    if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: 0 // Sem expiração
    });
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (seconds * 1000)
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt > 0 && now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  disconnect(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Singleton
let cacheInstance: InMemoryCache | null = null;

export function getInMemoryCache(): InMemoryCache {
  if (!cacheInstance) {
    cacheInstance = new InMemoryCache();
    console.log('⚠️  Usando cache em memória (Redis não disponível)');
  }
  return cacheInstance;
}

export default getInMemoryCache;
