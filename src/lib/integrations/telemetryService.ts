/**
 * Draftwell Telemetry & Real-Time Performance Monitor
 * 
 * Pairs with Sentry and OpenTelemetry to track reader session retention,
 * DOM layout shift during 5000+ word chapter rendering, and sync error spikes.
 * Strictly gated behind GATE_CONFIG.telemetry (VITE_ALLOW_TELEMETRY === 'true').
 */

import { GATE_CONFIG } from './gateConfig'
import type { ReaderScrollPerformanceMetrics, TelemetryEvent } from './types'

class TelemetryService {
  private dsn: string
  private sessionId: string

  constructor() {
    this.dsn = (import.meta.env.VITE_SENTRY_DSN as string) || ''
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }

  public isLiveMode(): boolean {
    return GATE_CONFIG.telemetry && !!this.dsn
  }

  /**
   * Log an application event
   */
  public logEvent(category: TelemetryEvent['category'], name: string, payload: Record<string, unknown> = {}): void {
    const event: TelemetryEvent = {
      name,
      category,
      payload,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    }

    if (!this.isLiveMode()) {
      // ── STAGE 1: SAFE DEV CONSOLE RECORDING ──────────────────────────────
      if (import.meta.env.DEV) {
        // console.debug(`[Telemetry:Mock] [${category.toUpperCase()}] ${name}`, payload)
      }
      return
    }

    // ── STAGE 2: PRODUCTION TELEMETRY DISPATCH ────────────────────────────
    try {
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon(
          '/api/telemetry',
          JSON.stringify({ ...event, dsn: this.dsn })
        )
      }
    } catch {
      // Fail silently to never disrupt the reader
    }
  }

  /**
   * Monitor reader progress and scroll retention on 5000+ word chapters
   */
  public reportChapterEngagement(metrics: ReaderScrollPerformanceMetrics): void {
    this.logEvent('reader', 'chapter_scroll_benchmark', {
      storyId: metrics.storyId,
      chapterId: metrics.chapterId,
      wordCount: metrics.wordCount,
      scrollDepthPercent: Math.round(metrics.scrollDepthPercent),
      durationSeconds: Math.round(metrics.durationSeconds),
      renderJankCount: metrics.renderJankCount,
      wordsPerMinute:
        metrics.durationSeconds > 10
          ? Math.round((metrics.wordCount * (metrics.scrollDepthPercent / 100)) / (metrics.durationSeconds / 60))
          : 0,
    })
  }

  /**
   * Capture caught UI error boundaries or offline sync failures
   */
  public captureException(error: Error, context: Record<string, unknown> = {}): void {
    if (!this.isLiveMode()) {
      console.warn('[Telemetry:Mock] Error captured:', error.message, context)
      return
    }

    // Live Sentry bridge
    const windowWithSentry = window as unknown as { Sentry?: { captureException: (e: Error, c: unknown) => void } }
    if (windowWithSentry.Sentry) {
      windowWithSentry.Sentry.captureException(error, { extra: context })
    }
  }
}

export const telemetryService = new TelemetryService()
