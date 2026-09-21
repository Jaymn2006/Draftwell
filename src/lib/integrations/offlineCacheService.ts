/**
 * Draftwell Offline Cache Service
 * 
 * Provides local-first persistence and state inspection for network-disconnected states.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class OfflineCacheService {
  private memoryCache = new Map<string, CacheEntry<unknown>>()
  private prefix = 'draftwell_cache_'

  /**
   * Evaluates if the current runtime environment is operating offline
   */
  public isOffline(): boolean {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true
    }
    // Also check Draftwell manual offline simulation flag
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('draftwell-offline-mode') === 'true'
    }
    return false
  }

  /**
   * Retrieves a cached entry if available and unexpired
   */
  public getCached<T>(key: string): T | null {
    const fullKey = this.prefix + key

    // 1. Check memory cache first
    const mem = this.memoryCache.get(fullKey) as CacheEntry<T> | undefined
    if (mem) {
      if (Date.now() - mem.timestamp < mem.ttl) {
        return mem.data
      }
      this.memoryCache.delete(fullKey)
    }

    // 2. Check localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        const item = localStorage.getItem(fullKey)
        if (item) {
          const parsed = JSON.parse(item) as CacheEntry<T>
          if (Date.now() - parsed.timestamp < parsed.ttl) {
            this.memoryCache.set(fullKey, parsed)
            return parsed.data
          }
          localStorage.removeItem(fullKey)
        }
      } catch {
        // Ignore localStorage quota or parse issues
      }
    }

    return null
  }

  /**
   * Persists an entry with a configurable time-to-live (defaults to 2 hours)
   */
  public setCached<T>(key: string, data: T, ttlMs = 2 * 60 * 60 * 1000): void {
    const fullKey = this.prefix + key
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    }

    this.memoryCache.set(fullKey, entry)

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(fullKey, JSON.stringify(entry))
      } catch {
        // Storage quota safeguard
      }
    }
  }

  /**
   * Removes a cached entry
   */
  public removeCached(key: string): void {
    const fullKey = this.prefix + key
    this.memoryCache.delete(fullKey)
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(fullKey)
      } catch {
        // Ignore
      }
    }
  }
}

export const offlineCacheService = new OfflineCacheService()
