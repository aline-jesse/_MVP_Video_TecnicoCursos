/**
 * Minimal Redis wrapper for environments without Redis.
 * Exports an object with get/set/ttl operations backed by an in-memory Map.
 * If REDIS_URL is set and the 'redis' package is available, you can evolve this to use a real client.
 */

type TTLInfo = { value: string; expiresAt: number | null }

class InMemoryRedis {
  private store = new Map<string, TTLInfo>()

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key)
    if (!item) return null
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key)
      return null
    }
    return item.value
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<'OK'> {
    const expiresAt = options?.EX ? Date.now() + options.EX * 1000 : null
    this.store.set(key, { value, expiresAt })
    return 'OK'
  }

  async ttl(key: string): Promise<number> {
    const item = this.store.get(key)
    if (!item || !item.expiresAt) return -1
    const remaining = item.expiresAt - Date.now()
    return remaining > 0 ? Math.ceil(remaining / 1000) : -2
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0
  }
}

export const redis = new InMemoryRedis()