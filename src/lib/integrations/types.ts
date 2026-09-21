/**
 * Draftwell Integration Types & Contracts
 * Production definitions for Media CDN, Telemetry, and Reader Performance
 */

export interface MediaTransformOptions {
  width?: number
  height?: number
  quality?: number | 'auto'
  format?: 'webp' | 'avif' | 'auto' | 'png' | 'jpg'
  crop?: 'fill' | 'scale' | 'thumb' | 'fit'
  blur?: number
}

export interface TelemetryEvent {
  name: string
  category: 'reader' | 'navigation' | 'studio' | 'system'
  payload: Record<string, unknown>
  timestamp: number
  sessionId: string
  userId?: string
}

export interface ReaderScrollPerformanceMetrics {
  storyId: string
  chapterId: number
  wordCount: number
  scrollDepthPercent: number
  durationSeconds: number
  renderJankCount: number
}
