/**
 * ════════════════════════════════════════════════════════════════════════════
 * Draftwell — Pinterest Inspiration Cover Pipeline (`pinterestCoverService.ts`)
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Secure, gated pipeline to fetch and serve high-resolution book covers from Pinterest:
 * 1. Pinterest API v5 Board Fetching Service (`fetchSampleCoversFromBoard`)
 * 2. Edge Compression Proxy Wrapper (`transformForDevice` via Cloudinary / WebP)
 * 3. Secure Fallback Runtime Guards (Rate-limit 429, Auth 401/403, Offline Cache short-circuit)
 * 
 * Execution Note:
 * Set `VITE_PINTEREST_ACCESS_TOKEN` in your environment to enable live Pinterest v5 sync.
 * Optionally set `VITE_ALLOW_MEDIA_CDN="true"` & `VITE_CLOUDINARY_CLOUD_NAME` to activate
 * automatic edge WebP transcoding.
 */

import { offlineCacheService } from './offlineCacheService'
import { transformForDevice, type DeviceProfile } from './mediaOptimization'
import { GATE_CONFIG } from './gateConfig'

// ── Pinterest API v5 Schema Definitions ───────────────────────────────────

export interface PinterestImageVariant {
  url: string
  width?: number
  height?: number
}

export interface PinterestPinMediaImages {
  '150x150'?: PinterestImageVariant
  '400x300'?: PinterestImageVariant
  '600x'?: PinterestImageVariant
  '736x'?: PinterestImageVariant
  originals?: PinterestImageVariant
  [key: string]: PinterestImageVariant | undefined
}

export interface PinterestPinMedia {
  media_type: 'image' | 'video' | string
  images?: PinterestPinMediaImages
}

export interface PinterestPinItem {
  id: string
  title?: string
  description?: string
  link?: string
  alt_text?: string
  media?: PinterestPinMedia
}

export interface PinterestBoardPinsResponse {
  items: PinterestPinItem[]
  bookmark?: string
}

export interface CoverFetchOptions {
  /** Target device for Cloudinary WebP optimization */
  device?: DeviceProfile
  /** Maximum number of covers to return */
  limit?: number
  /** Cache time-to-live in milliseconds (default: 1 hour) */
  cacheTtlMs?: number
  /** Force refresh and bypass cache */
  forceRefresh?: boolean
}

// ── Curated Local Fallback Geometric SVG Covers ───────────────────────────
// Zero-reflow SVGs designed specifically for 2:3 webnovel aspect ratios
const FALLBACK_GEOMETRIC_COVERS: string[] = [
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
      <defs>
        <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#311042" />
        </linearGradient>
        <radialGradient id="glow1" cx="30%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#c084fc" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="900" fill="url(#bg1)" />
      <rect width="600" height="900" fill="url(#glow1)" />
      <circle cx="300" cy="420" r="160" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" stroke-dasharray="8 6"/>
      <polygon points="300,310 390,490 210,490" fill="none" stroke="rgba(192,132,252,0.4)" stroke-width="2" />
      <text x="300" y="820" font-family="serif" font-size="22" letter-spacing="6" fill="rgba(255,255,255,0.4)" text-anchor="middle">DRAFTWELL ARCHIVE</text>
    </svg>
  `)}`,
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06101a" />
          <stop offset="60%" stop-color="#0f2b38" />
          <stop offset="100%" stop-color="#1b4d58" />
        </linearGradient>
      </defs>
      <rect width="600" height="900" fill="url(#bg2)" />
      <path d="M 0,550 Q 150,450 300,600 T 600,500 L 600,900 L 0,900 Z" fill="rgba(216,232,236,0.06)" />
      <path d="M 0,620 Q 200,560 400,660 T 600,620 L 600,900 L 0,900 Z" fill="rgba(14,165,233,0.1)" />
      <circle cx="440" cy="240" r="70" fill="none" stroke="rgba(14,165,233,0.3)" stroke-width="2"/>
      <text x="300" y="820" font-family="monospace" font-size="20" letter-spacing="8" fill="rgba(216,232,236,0.35)" text-anchor="middle">CHRONICLES</text>
    </svg>
  `)}`,
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
      <defs>
        <linearGradient id="bg3" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stop-color="#2a1208" />
          <stop offset="50%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#1c0a02" />
        </linearGradient>
      </defs>
      <rect width="600" height="900" fill="url(#bg3)" />
      <rect x="60" y="60" width="480" height="780" fill="none" stroke="rgba(245,158,11,0.2)" stroke-width="1.5"/>
      <rect x="75" y="75" width="450" height="750" fill="none" stroke="rgba(245,158,11,0.1)" stroke-width="1"/>
      <circle cx="300" cy="400" r="110" fill="none" stroke="rgba(245,158,11,0.3)" stroke-width="3"/>
      <text x="300" y="820" font-family="serif" font-size="22" letter-spacing="6" fill="rgba(245,158,11,0.5)" text-anchor="middle">FOLIO EDITION</text>
    </svg>
  `)}`,
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
      <defs>
        <linearGradient id="bg4" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#022c22" />
          <stop offset="50%" stop-color="#064e3b" />
          <stop offset="100%" stop-color="#06251f" />
        </linearGradient>
      </defs>
      <rect width="600" height="900" fill="url(#bg4)" />
      <polygon points="300,200 440,340 300,480 160,340" fill="none" stroke="rgba(52,211,153,0.3)" stroke-width="2"/>
      <line x1="300" y1="160" x2="300" y2="520" stroke="rgba(52,211,153,0.2)" stroke-width="1.5" />
      <text x="300" y="820" font-family="monospace" font-size="20" letter-spacing="8" fill="rgba(52,211,153,0.4)" text-anchor="middle">VERDANT SAGA</text>
    </svg>
  `)}`,
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
      <defs>
        <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#18181b" />
          <stop offset="50%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
      </defs>
      <rect width="600" height="900" fill="url(#bg5)" />
      <circle cx="300" cy="400" r="140" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
      <circle cx="300" cy="400" r="100" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" />
      <circle cx="300" cy="400" r="4" fill="rgba(255,255,255,0.6)" />
      <text x="300" y="820" font-family="serif" font-size="22" letter-spacing="6" fill="rgba(255,255,255,0.4)" text-anchor="middle">NOCTURNE</text>
    </svg>
  `)}`,
]

export class PinterestCoverService {
  private cacheKeyPrefix = 'draftwell_pinterest_board_'

  /**
   * Retrieves access token safely from environment with multi-runtime fallback
   */
  private getAccessToken(): string | null {
    // 1. Check Vite standard client variable
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PINTEREST_ACCESS_TOKEN) {
      return import.meta.env.VITE_PINTEREST_ACCESS_TOKEN as string
    }
    // 2. Check process.env for Node / SSR / Test environments
    const globalProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    if (globalProcess?.env?.VITE_PINTEREST_ACCESS_TOKEN) {
      return globalProcess.env.VITE_PINTEREST_ACCESS_TOKEN
    }
    return null
  }

  /**
   * Builds normalized Pinterest API v5 endpoint URL
   * Accepts raw board ID ('123456789') or path formats ('username/board-name')
   */
  public buildBoardEndpoint(boardId: string): string {
    const cleanId = boardId.trim().replace(/^\/+/, '')

    // Support direct format: https://api.pinterest.com/v5/boards/{board_id}/pins
    // If the input already contains a full URL, respect it
    if (cleanId.startsWith('http://') || cleanId.startsWith('https://')) {
      return cleanId.endsWith('/pins') ? cleanId : `${cleanId}/pins`
    }

    return `https://api.pinterest.com/v5/boards/${cleanId}/pins`
  }

  /**
   * 1. PINTEREST BOARD FETCHING SERVICE
   * 
   * Fetches high-resolution book inspiration pins from a Pinterest Board.
   * Extracts `media.images.736x.url` (or original resolution configurations).
   * 
   * 2. EDGE COMPRESSION PROXY COMPATIBILITY WRAPPER
   * Integrates with `mediaOptimization.ts` to transform raw Pinterest URLs into
   * lightweight, high-performance WebP assets when `VITE_ALLOW_MEDIA_CDN="true"`.
   * 
   * 3. SECURE FALLBACK RUNTIME GUARDS
   * Instantly short-circuits on offline status, missing/expired tokens (401/403),
   * or rate-limits (429), returning zero-reflow local SVG covers.
   */
  public async fetchSampleCoversFromBoard(
    boardId: string,
    options: CoverFetchOptions = {}
  ): Promise<string[]> {
    const {
      device = 'smartphone',
      limit = 12,
      cacheTtlMs = 60 * 60 * 1000, // 1 hour
      forceRefresh = false,
    } = options

    const sanitizedBoardId = boardId.trim()
    const cacheKey = `${this.cacheKeyPrefix}${sanitizedBoardId}`

    // ── GUARD 1: Offline Cache & Network State Check ────────────────────────
    if (offlineCacheService.isOffline()) {
      console.warn('[PinterestCoverService] Device is offline; checking local cache before falling back.')
      const cached = offlineCacheService.getCached<string[]>(cacheKey)
      if (cached && cached.length > 0) {
        return this.applyProxyOptimizations(cached.slice(0, limit), device)
      }
      return this.getLocalFallbackCovers(limit)
    }

    // ── GUARD 2: Cache Hit Check (unless force refresh) ────────────────────
    if (!forceRefresh) {
      const cached = offlineCacheService.getCached<string[]>(cacheKey)
      if (cached && cached.length > 0) {
        return this.applyProxyOptimizations(cached.slice(0, limit), device)
      }
    }

    // ── GUARD 3: Authentication Token Verification ──────────────────────────
    const accessToken = this.getAccessToken()
    if (!accessToken) {
      console.info(
        '[PinterestCoverService:SafeMode] VITE_PINTEREST_ACCESS_TOKEN is not configured. Serving local curated covers.'
      )
      return this.getLocalFallbackCovers(limit)
    }

    // ── Network Fetch from Pinterest API v5 ─────────────────────────────────
    const endpoint = this.buildBoardEndpoint(sanitizedBoardId)

    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
      const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'User-Agent': 'Draftwell/1.0 WebnovelPlatform',
        },
        signal: controller?.signal,
      })

      if (timeoutId) clearTimeout(timeoutId)

      // ── GUARD 4: Rate-Limit (429) & Auth Expiry (401/403) Handling ──────────
      if (response.status === 429) {
        console.warn('[PinterestCoverService] Pinterest API rate limit exceeded (429). Short-circuiting to fallback.')
        return this.resolveFallbackWithCache(cacheKey, limit, device)
      }

      if (response.status === 401 || response.status === 403) {
        console.warn(
          `[PinterestCoverService] Pinterest credentials invalid or expired (${response.status}). Short-circuiting.`
        )
        return this.resolveFallbackWithCache(cacheKey, limit, device)
      }

      if (!response.ok) {
        console.warn(`[PinterestCoverService] Unexpected response status ${response.status} from Pinterest API.`)
        return this.resolveFallbackWithCache(cacheKey, limit, device)
      }

      // ── Payload Mapping: Extract 736x or Original Resolution URLs ───────────
      const data = (await response.json()) as PinterestBoardPinsResponse
      const rawUrls: string[] = []

      if (data && Array.isArray(data.items)) {
        for (const item of data.items) {
          const images = item.media?.images
          if (!images) continue

          // Priority order: 736x (ideal webnovel mobile/tablet ratio) -> originals -> 600x
          const targetUrl =
            images['736x']?.url ||
            images.originals?.url ||
            images['600x']?.url ||
            images['400x300']?.url

          if (targetUrl && typeof targetUrl === 'string') {
            rawUrls.push(targetUrl)
          }
        }
      }

      // If Pinterest board yielded pins, cache them and apply edge proxy
      if (rawUrls.length > 0) {
        offlineCacheService.setCached(cacheKey, rawUrls, cacheTtlMs)
        return this.applyProxyOptimizations(rawUrls.slice(0, limit), device)
      }

      // Empty board response guard
      return this.getLocalFallbackCovers(limit)
    } catch (err: unknown) {
      console.warn('[PinterestCoverService] Network fetch failed or timed out:', err)
      return this.resolveFallbackWithCache(cacheKey, limit, device)
    }
  }

  /**
   * Applies Cloudinary / WebP edge proxy transformations when VITE_ALLOW_MEDIA_CDN="true".
   */
  private applyProxyOptimizations(urls: string[], device: DeviceProfile): string[] {
    if (!GATE_CONFIG.mediaCdn) {
      return urls
    }
    return urls.map((url) => {
      // Avoid re-transforming SVG data URIs
      if (url.startsWith('data:image/svg')) return url
      return transformForDevice(url, device)
    })
  }

  /**
   * Short-circuits to previously cached images if available, otherwise returns zero-reflow SVGs.
   */
  private resolveFallbackWithCache(cacheKey: string, limit: number, device: DeviceProfile): string[] {
    const cached = offlineCacheService.getCached<string[]>(cacheKey)
    if (cached && cached.length > 0) {
      return this.applyProxyOptimizations(cached.slice(0, limit), device)
    }
    return this.getLocalFallbackCovers(limit)
  }

  /**
   * Generates a repeatable, stable local fallback array of book covers
   */
  public getLocalFallbackCovers(count: number = 6): string[] {
    const covers: string[] = []
    for (let i = 0; i < count; i++) {
      covers.push(FALLBACK_GEOMETRIC_COVERS[i % FALLBACK_GEOMETRIC_COVERS.length])
    }
    return covers
  }
}

// ── Exported Singleton & Standalone Wrapper Function ──────────────────────

export const pinterestCoverService = new PinterestCoverService()

/**
 * Standard top-level wrapper function matching specification:
 * `fetchSampleCoversFromBoard(boardId: string)`
 */
export async function fetchSampleCoversFromBoard(
  boardId: string,
  options?: CoverFetchOptions
): Promise<string[]> {
  return pinterestCoverService.fetchSampleCoversFromBoard(boardId, options)
}
