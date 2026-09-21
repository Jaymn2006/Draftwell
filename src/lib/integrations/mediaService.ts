/**
 * Draftwell Media & CDN Optimization Engine
 * 
 * Pairs with Cloudinary and Supabase Storage CDN to deliver responsive WebP/AVIF covers,
 * blur-up low-res placeholders, and retina DPR scaling.
 * Strictly gated behind GATE_CONFIG.mediaCdn (VITE_ALLOW_MEDIA_CDN === 'true').
 */

import { GATE_CONFIG } from './gateConfig'
import type { MediaTransformOptions } from './types'

class MediaService {
  private cloudName: string

  constructor() {
    this.cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || ''
  }

  public isLiveMode(): boolean {
    return GATE_CONFIG.mediaCdn && !!this.cloudName
  }

  /**
   * Generates a fully transformed, responsive cover image URL
   */
  public getOptimizedCoverUrl(rawUrl: string, options: MediaTransformOptions = {}): string {
    if (!this.isLiveMode() || !rawUrl || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
      // ── STAGE 1: SAFE FALLBACK MODE ──────────────────────────────────────
      return rawUrl
    }

    // ── STAGE 2: CLOUDINARY CDN TRANSFORMATION PIPELINE ──────────────────
    const {
      width = 400,
      height = 600,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
      blur,
    } = options

    const transformations = [
      `w_${width}`,
      `h_${height}`,
      `c_${crop}`,
      `q_${quality}`,
      `f_${format}`,
      blur ? `e_blur:${blur}` : '',
    ]
      .filter(Boolean)
      .join(',')

    // Handle Cloudinary public IDs or remote fetch URLs
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return `https://res.cloudinary.com/${this.cloudName}/image/fetch/${transformations}/${encodeURIComponent(rawUrl)}`
    }

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations}/${rawUrl}`
  }

  /**
   * Produces an HTML srcset attribute for responsive DPR displays (1x, 2x, 3x)
   */
  public getResponsiveSrcSet(rawUrl: string, baseWidth: number, baseHeight: number): string {
    if (!this.isLiveMode()) return ''

    const dprs = [1, 2, 3]
    return dprs
      .map((dpr) => {
        const url = this.getOptimizedCoverUrl(rawUrl, {
          width: Math.round(baseWidth * dpr),
          height: Math.round(baseHeight * dpr),
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        })
        return `${url} ${dpr}x`
      })
      .join(', ')
  }

  /**
   * Generates a micro low-resolution image placeholder (LQIP) for instant blur-up rendering
   */
  public getBlurPlaceholderUrl(rawUrl: string): string {
    if (!this.isLiveMode()) return ''
    return this.getOptimizedCoverUrl(rawUrl, {
      width: 20,
      height: 30,
      quality: 30,
      format: 'webp',
      blur: 800,
    })
  }
}

export const mediaService = new MediaService()
