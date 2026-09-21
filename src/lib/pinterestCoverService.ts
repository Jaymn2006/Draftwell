/**
 * ════════════════════════════════════════════════════════════════════════════
 * Draftwell — Pinterest Cover Service (`src/lib/pinterestCoverService.ts`)
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Fetches sample book cover inspiration images from Pinterest boards using the
 * official Pinterest API v5.
 * 
 * Features:
 * 1. Pinterest API v5 Board Pins Fetcher (`fetchBoardCovers(boardId)`)
 * 2. Authorization via `process.env.VITE_PINTEREST_ACCESS_TOKEN`
 * 3. Automated CDN check against `VITE_ALLOW_MEDIA_CDN` to proxy images via Cloudinary (WebP)
 * 4. Robust Error Boundary defaulting to instant local SVG placeholders if the API fails or if in offline mode.
 */

// Ambient declaration for process.env compatibility in browser/Vite environments
declare const process: {
  env?: Record<string, string | undefined>
} | undefined

export interface PinterestImageVariant {
  url: string
  width?: number
  height?: number
}

export interface PinterestPinItem {
  id: string
  title?: string
  description?: string
  media?: {
    media_type: string
    images?: {
      '150x150'?: PinterestImageVariant
      '400x300'?: PinterestImageVariant
      '600x'?: PinterestImageVariant
      '736x'?: PinterestImageVariant
      originals?: PinterestImageVariant
      [key: string]: PinterestImageVariant | undefined
    }
  }
}

export interface PinterestBoardResponse {
  items: PinterestPinItem[]
  bookmark?: string
}

export interface FetchCoverOptions {
  /** Target device or resolution width (default: 400) */
  width?: number
  /** Target device or resolution height (default: 600) */
  height?: number
  /** Limit of covers to return (default: 12) */
  limit?: number
  /** Bypass cache if true */
  forceRefresh?: boolean
}

// ── Zero-Reflow Geometric SVG Covers for Offline & Error Boundary ─────────
export const LOCAL_COVER_PLACEHOLDERS: string[] = [
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#09131d" />
          <stop offset="50%" stop-color="#0f2b38" />
          <stop offset="100%" stop-color="#1b4d58" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#g1)" />
      <circle cx="200" cy="270" r="95" fill="none" stroke="rgba(216,232,236,0.18)" stroke-width="2" stroke-dasharray="6 4" />
      <polygon points="200,200 260,320 140,320" fill="none" stroke="rgba(14,165,233,0.4)" stroke-width="2" />
      <text x="200" y="540" font-family="sans-serif" font-size="12" letter-spacing="4" fill="rgba(216,232,236,0.4)" text-anchor="middle">DRAFTWELL FOLIO</text>
    </svg>
  `)}`,
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
      <defs>
        <linearGradient id="g2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#2a081a" />
          <stop offset="50%" stop-color="#4a154b" />
          <stop offset="100%" stop-color="#180b2a" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#g2)" />
      <rect x="40" y="40" width="320" height="520" fill="none" stroke="rgba(244,114,182,0.2)" stroke-width="1.5" />
      <circle cx="200" cy="280" r="80" fill="none" stroke="rgba(244,114,182,0.3)" stroke-width="2" />
      <text x="200" y="540" font-family="serif" font-size="12" letter-spacing="4" fill="rgba(244,114,182,0.4)" text-anchor="middle">CHRONICLES</text>
    </svg>
  `)}`,
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
      <defs>
        <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#022c22" />
          <stop offset="50%" stop-color="#064e3b" />
          <stop offset="100%" stop-color="#021f17" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#g3)" />
      <polygon points="200,160 290,260 200,360 110,260" fill="none" stroke="rgba(52,211,153,0.3)" stroke-width="2" />
      <circle cx="200" cy="260" r="4" fill="rgba(52,211,153,0.6)" />
      <text x="200" y="540" font-family="monospace" font-size="11" letter-spacing="4" fill="rgba(52,211,153,0.4)" text-anchor="middle">VERDANT SAGA</text>
    </svg>
  `)}`,
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
      <defs>
        <linearGradient id="g4" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stop-color="#2a1208" />
          <stop offset="50%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#180a03" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#g4)" />
      <circle cx="200" cy="260" r="100" fill="none" stroke="rgba(245,158,11,0.25)" stroke-width="2" />
      <line x1="100" y1="260" x2="300" y2="260" stroke="rgba(245,158,11,0.2)" stroke-width="1.5" />
      <text x="200" y="540" font-family="serif" font-size="12" letter-spacing="4" fill="rgba(245,158,11,0.4)" text-anchor="middle">ARCHIVE EDITION</text>
    </svg>
  `)}`,
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
      <defs>
        <linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#18181b" />
          <stop offset="50%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#g5)" />
      <circle cx="200" cy="260" r="70" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
      <polygon points="200,190 250,290 150,290" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
      <text x="200" y="540" font-family="monospace" font-size="11" letter-spacing="4" fill="rgba(255,255,255,0.3)" text-anchor="middle">NOCTURNE</text>
    </svg>
  `)}`,
]

class PinterestCoverService {
  private cachePrefix = 'draftwell_pinterest_v5_'

  /**
   * Retrieves Pinterest API v5 Access Token using `process.env.VITE_PINTEREST_ACCESS_TOKEN`
   * with fallback to `import.meta.env.VITE_PINTEREST_ACCESS_TOKEN`.
   */
  public getAccessToken(): string | null {
    try {
      if (typeof process !== 'undefined' && process?.env?.VITE_PINTEREST_ACCESS_TOKEN) {
        return process.env.VITE_PINTEREST_ACCESS_TOKEN
      }
    } catch {
      // ignore
    }

    try {
      if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PINTEREST_ACCESS_TOKEN) {
        return import.meta.env.VITE_PINTEREST_ACCESS_TOKEN as string
      }
    } catch {
      // ignore
    }

    return null
  }

  /**
   * Checks whether media CDN proxying is active via `VITE_ALLOW_MEDIA_CDN`.
   */
  public isMediaCdnEnabled(): boolean {
    try {
      if (typeof process !== 'undefined' && process?.env?.VITE_ALLOW_MEDIA_CDN === 'true') {
        return true
      }
    } catch {
      // ignore
    }

    try {
      if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ALLOW_MEDIA_CDN === 'true') {
        return true
      }
    } catch {
      // ignore
    }

    return false
  }

  /**
   * Retrieves configured Cloudinary cloud name.
   */
  public getCloudinaryCloudName(): string {
    try {
      if (typeof process !== 'undefined' && process?.env?.VITE_CLOUDINARY_CLOUD_NAME) {
        return process.env.VITE_CLOUDINARY_CLOUD_NAME
      }
    } catch {
      // ignore
    }

    try {
      if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME) {
        return import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
      }
    } catch {
      // ignore
    }

    return ''
  }

  /**
   * Checks if running in an offline environment.
   */
  public isOffline(): boolean {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true
    }
    if (typeof localStorage !== 'undefined' && localStorage.getItem('draftwell-offline-mode') === 'true') {
      return true
    }
    return false
  }

  /**
   * Automatically checks `VITE_ALLOW_MEDIA_CDN` and proxies raw images through Cloudinary
   * outputting WebP compressed assets.
   */
  public proxyThroughCloudinary(rawUrl: string, width = 400, height = 600): string {
    if (!rawUrl || rawUrl.startsWith('data:') || !this.isMediaCdnEnabled()) {
      return rawUrl
    }

    const cloudName = this.getCloudinaryCloudName()
    if (!cloudName) {
      return rawUrl
    }

    const transformations = `w_${width},h_${height},c_fill,q_auto,f_webp`
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${encodeURIComponent(rawUrl)}`
  }

  /**
   * Fetches cover images from a Pinterest board using Pinterest API v5.
   * Includes robust error boundaries for offline mode, auth errors, and network limits.
   */
  public async fetchBoardCovers(
    boardId: string = 'sample-webnovel-covers',
    options: FetchCoverOptions = {}
  ): Promise<string[]> {
    const { width = 400, height = 600, limit = 12, forceRefresh = false } = options
    const cacheKey = `${this.cachePrefix}${boardId}`

    // ── ERROR BOUNDARY CHECK 1: Offline mode detection ────────────────────
    if (this.isOffline()) {
      console.info('[PinterestCoverService] Device is offline. Defaulting to cached covers or local placeholders.')
      const cached = this.getCachedUrls(cacheKey)
      if (cached && cached.length > 0) {
        return cached.slice(0, limit).map((url) => this.proxyThroughCloudinary(url, width, height))
      }
      return this.getLocalPlaceholders(limit)
    }

    // ── ERROR BOUNDARY CHECK 2: Local Cache (1 hour TTL) ─────────────────
    if (!forceRefresh) {
      const cached = this.getCachedUrls(cacheKey)
      if (cached && cached.length > 0) {
        return cached.slice(0, limit).map((url) => this.proxyThroughCloudinary(url, width, height))
      }
    }

    // ── ERROR BOUNDARY CHECK 3: Access Token authorization ────────────────
    const accessToken = this.getAccessToken()
    if (!accessToken) {
      console.info('[PinterestCoverService] VITE_PINTEREST_ACCESS_TOKEN not found. Serving local placeholders.')
      return this.getLocalPlaceholders(limit)
    }

    // ── API v5 Network Request ───────────────────────────────────────────
    try {
      const cleanId = boardId.trim().replace(/^\/+/, '')
      const endpoint = cleanId.startsWith('http')
        ? cleanId
        : `https://api.pinterest.com/v5/boards/${cleanId}/pins`

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
      const timeout = controller ? setTimeout(() => controller.abort(), 7000) : null

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'User-Agent': 'Draftwell/1.0 WebnovelPlatform',
        },
        signal: controller?.signal,
      })

      if (timeout) clearTimeout(timeout)

      // Rate limit (429) or Auth error (401/403)
      if (response.status === 429 || response.status === 401 || response.status === 403 || !response.ok) {
        console.warn(`[PinterestCoverService] API returned status ${response.status}. Short-circuiting to placeholders.`)
        return this.resolveFallback(cacheKey, limit, width, height)
      }

      const json = (await response.json()) as PinterestBoardResponse
      const extractedUrls: string[] = []

      if (json && Array.isArray(json.items)) {
        for (const item of json.items) {
          const imgs = item.media?.images
          if (!imgs) continue
          const url = imgs['736x']?.url || imgs.originals?.url || imgs['600x']?.url || imgs['400x300']?.url
          if (url && typeof url === 'string') {
            extractedUrls.push(url)
          }
        }
      }

      if (extractedUrls.length > 0) {
        this.setCachedUrls(cacheKey, extractedUrls)
        return extractedUrls.slice(0, limit).map((u) => this.proxyThroughCloudinary(u, width, height))
      }

      return this.getLocalPlaceholders(limit)
    } catch (err) {
      console.warn('[PinterestCoverService] API fetch failed or timed out. Engaging fallback:', err)
      return this.resolveFallback(cacheKey, limit, width, height)
    }
  }

  private resolveFallback(cacheKey: string, limit: number, width: number, height: number): string[] {
    const cached = this.getCachedUrls(cacheKey)
    if (cached && cached.length > 0) {
      return cached.slice(0, limit).map((u) => this.proxyThroughCloudinary(u, width, height))
    }
    return this.getLocalPlaceholders(limit)
  }

  public getLocalPlaceholders(count = 6): string[] {
    const result: string[] = []
    for (let i = 0; i < count; i++) {
      result.push(LOCAL_COVER_PLACEHOLDERS[i % LOCAL_COVER_PLACEHOLDERS.length])
    }
    return result
  }

  private getCachedUrls(key: string): string[] | null {
    if (typeof localStorage === 'undefined') return null
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (Date.now() - parsed.ts < 60 * 60 * 1000) {
        return parsed.urls
      }
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
    return null
  }

  private setCachedUrls(key: string, urls: string[]): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify({ urls, ts: Date.now() }))
    } catch {
      // storage quota
    }
  }
}

export const pinterestCoverService = new PinterestCoverService()

/**
 * Convenience wrapper function for novel discovery shelf
 */
export async function fetchSampleCoversFromBoard(
  boardId: string = 'sample-webnovel-covers',
  options?: FetchCoverOptions
): Promise<string[]> {
  return pinterestCoverService.fetchBoardCovers(boardId, options)
}
