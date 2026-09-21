/**
 * Draftwell Media Optimization Engine
 * 
 * Provides device-tailored image transformations and WebP compression proxies.
 * Automatically engages Cloudinary or Supabase CDN when VITE_ALLOW_MEDIA_CDN="true".
 */

import { mediaService } from './mediaService'
import { GATE_CONFIG } from './gateConfig'
import type { MediaTransformOptions } from './types'

export type DeviceProfile = 'smartphone' | 'laptop' | 'tablet' | 'thumbnail'

export interface DeviceDimensionSpec {
  width: number
  height: number
  quality: number | 'auto'
  format: 'webp' | 'avif' | 'auto'
}

/**
 * Standard device specs optimized for webnovel cover proportions (2:3 book ratio)
 */
export const DEVICE_PROFILES: Record<DeviceProfile, DeviceDimensionSpec> = {
  smartphone: {
    width: 360,
    height: 540,
    quality: 'auto',
    format: 'webp',
  },
  laptop: {
    width: 720,
    height: 1080,
    quality: 'auto',
    format: 'webp',
  },
  tablet: {
    width: 480,
    height: 720,
    quality: 'auto',
    format: 'webp',
  },
  thumbnail: {
    width: 180,
    height: 270,
    quality: 'auto',
    format: 'webp',
  },
}

/**
 * Transforms an image URL to a high-efficiency WebP asset tailored for the requested device.
 * If media CDN is disabled, returns raw URL safely without network overhead.
 */
export function transformForDevice(
  rawUrl: string,
  device: DeviceProfile = 'smartphone',
  overrides: Partial<MediaTransformOptions> = {}
): string {
  if (!rawUrl) return ''

  // Short-circuit if custom CDN is disabled
  if (!GATE_CONFIG.mediaCdn) {
    return rawUrl
  }

  const profile = DEVICE_PROFILES[device] || DEVICE_PROFILES.smartphone

  return mediaService.getOptimizedCoverUrl(rawUrl, {
    width: profile.width,
    height: profile.height,
    format: profile.format,
    quality: profile.quality,
    crop: 'fill',
    ...overrides,
  })
}

/**
 * Convenience helper to optimize a book cover with custom width/height in WebP format
 */
export function getOptimizedWebPCover(rawUrl: string, width = 400, height = 600): string {
  return transformForDevice(rawUrl, 'smartphone', { width, height, format: 'webp' })
}

export { mediaService }
