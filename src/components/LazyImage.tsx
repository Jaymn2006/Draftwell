import { memo, useState } from 'react'
import type { ReactNode, ImgHTMLAttributes } from 'react'
import { Loader2, ImageOff, BookOpen, RotateCw } from 'lucide-react'
import { useLazyLoad, type UseLazyLoadOptions, type UseLazyLoadResult } from '../hooks/useLazyLoad'

// Re-export hook and options
export { useLazyLoad }
export type { UseLazyLoadOptions, UseLazyLoadResult }

export interface UseIntersectionObserverOptions {
  rootMargin?: string
  threshold?: number | number[]
  freezeOnceVisible?: boolean
}

/**
 * Backward-compatible intersection observer wrapper
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
) {
  const result = useLazyLoad<T>(undefined, {
    rootMargin: options.rootMargin,
    threshold: options.threshold,
    freezeOnceVisible: options.freezeOnceVisible,
  })
  return [result.elementRef, result.isVisible] as const
}

export interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  aspectRatio?: string | number
  fallbackSrc?: string
  skeletonClassName?: string
  showSpinner?: boolean
}

/**
 * LazyImage Component:
 * Observes viewport entry using useLazyLoad before initiating network fetch.
 * Displays an active loading spinner while fetching, and an elegant fallback placeholder
 * state if the asset fails to load.
 */
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = '',
  aspectRatio = '0.7',
  fallbackSrc,
  skeletonClassName = '',
  showSpinner = true,
  ...props
}: LazyImageProps) {
  const { ref, isVisible, isLoading, isLoaded, hasError, currentSrc, retry } = useLazyLoad<HTMLDivElement>(
    src,
    {
      rootMargin: '150px 0px',
      fallbackSrc,
      freezeOnceVisible: true,
    }
  )

  return (
    <div
      ref={ref}
      className={`lazy-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: typeof aspectRatio === 'number' ? `${aspectRatio}` : aspectRatio,
        backgroundColor: 'var(--surface-raised, #13171e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 1. Loading State: Shimmer backdrop + Animated Spinner */}
      {isLoading && (
        <div
          className={`lazy-skeleton ${skeletonClassName}`}
          aria-label="Loading image…"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(90deg, var(--surface, #0c1015) 25%, var(--surface-hover, #18202b) 50%, var(--surface, #0c1015) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            zIndex: 2,
          }}
        >
          {showSpinner && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
                color: 'var(--accent, #e5a93b)',
              }}
            >
              <Loader2 size={18} className="animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* 2. Fallback Placeholder State: Clean fallback on error or offline */}
      {hasError && (
        <div
          className="lazy-image-fallback"
          role="img"
          aria-label={`Fallback placeholder for ${alt}`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            textAlign: 'center',
            background: 'linear-gradient(135deg, var(--surface, #0c1015) 0%, var(--surface-raised, #161c24) 100%)',
            border: '1px dashed var(--line, #252e3d)',
            zIndex: 3,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: 'var(--surface-hover, #1a222e)',
              color: 'var(--muted, #8b9bb4)',
              marginBottom: 6,
            }}
          >
            <ImageOff size={16} />
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'DM Mono', monospace",
              color: 'var(--muted, #8b9bb4)',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
            }}
          >
            Cover Offline
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              retry()
            }}
            title="Retry loading image"
            style={{
              marginTop: 6,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: 'var(--surface-hover, #1a222e)',
              color: 'var(--ink, #e6edf8)',
              border: '1px solid var(--line, #252e3d)',
              cursor: 'pointer',
            }}
          >
            <RotateCw size={10} /> Retry
          </button>
        </div>
      )}

      {/* 3. Loaded State: Smooth image presentation */}
      {isVisible && currentSrc && !hasError && (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 1,
          }}
          {...props}
        />
      )}
    </div>
  )
})

export interface LazyNovelCoverProps {
  title: string
  author?: string
  coverImage?: string
  fallbackSrc?: string
  coverColor?: string
  coverGradient?: string
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
  showMeta?: boolean
}

/**
 * LazyNovelCover Component:
 * Dedicated novel shelf cover component powered by `useLazyLoad`.
 * 
 * - Leverages IntersectionObserver to defer remote book cover requests.
 * - Displays an elegant loading spinner overlay while the cover asset downloads.
 * - Renders a stylized typographic fallback placeholder state if the asset fails or user is offline.
 * - Zero Cumulative Layout Shift (CLS) with consistent aspect-ratio.
 */
export const LazyNovelCover = memo(function LazyNovelCover({
  title,
  author,
  coverImage,
  fallbackSrc,
  coverColor = '#1a1612',
  coverGradient,
  size = 'md',
  onClick,
  className = '',
  showMeta = true,
}: LazyNovelCoverProps) {
  const { ref, isVisible, isLoading, isLoaded, hasError, currentSrc, retry } = useLazyLoad<HTMLDivElement>(
    coverImage,
    {
      rootMargin: '140px 0px',
      fallbackSrc,
      freezeOnceVisible: true,
    }
  )

  const defaultBackground = coverGradient ?? coverColor ?? '#161d26'
  const cls = `story-cover story-cover--${size}${onClick ? ' story-cover--btn' : ''} ${className}`

  const minHeight = size === 'sm' ? 86 : size === 'lg' ? 240 : 160
  const isSm = size === 'sm'

  const innerContent = (
    <div
      ref={ref}
      className={cls}
      style={{
        background: defaultBackground,
        minHeight,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image Layer (Active when loaded) */}
      {currentSrc && !hasError && (
        <div
          className="story-cover__img-layer"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${currentSrc}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.35s ease',
            zIndex: 1,
          }}
        />
      )}

      {/* Loading Spinner State: Shown while intersecting & downloading image */}
      {isLoading && (
        <div
          className="story-cover__spinner-overlay"
          aria-label={`Loading cover for ${title}`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(10, 14, 20, 0.65)',
            backdropFilter: 'blur(2px)',
            zIndex: 3,
            transition: 'opacity 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isSm ? 24 : 34,
              height: isSm ? 24 : 34,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'var(--accent, #e5a93b)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            <Loader2 size={isSm ? 14 : 18} className="animate-spin" />
          </div>
          {!isSm && (
            <span
              style={{
                marginTop: 6,
                fontSize: 9,
                fontFamily: "'DM Mono', monospace",
                color: 'rgba(255, 255, 255, 0.75)',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              Loading…
            </span>
          )}
        </div>
      )}

      {/* Fallback Placeholder State: Shown if image load fails or is offline */}
      {hasError && (
        <div
          className="story-cover__fallback-badge"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 6px',
            borderRadius: 4,
            backgroundColor: 'rgba(15, 20, 28, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--muted, #8b9bb4)',
            fontSize: 9,
            fontFamily: "'DM Mono', monospace",
            zIndex: 3,
          }}
          title="Remote cover unavailable — showing default shelf placeholder"
        >
          <BookOpen size={10} />
          <span>Shelf</span>
        </div>
      )}

      {/* Metadata typography banner */}
      {showMeta && (
        <div className="story-cover__inner" style={{ position: 'relative', zIndex: 2 }}>
          <span className="story-cover__title">{title}</span>
          {author && <span className="story-cover__author">{author}</span>}
        </div>
      )}
    </div>
  )

  return onClick ? (
    <button
      type="button"
      className="story-cover-btn-wrapper"
      onClick={onClick}
      aria-label={`Open ${title}`}
      style={{
        padding: 0,
        margin: 0,
        border: 'none',
        background: 'none',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'block',
        width: '100%',
      }}
    >
      {innerContent}
    </button>
  ) : (
    innerContent
  )
})

export interface LazyCoverProps {
  children: ReactNode
  className?: string
  aspectRatio?: string
  minHeight?: number | string
}

/**
 * LazyCover Component:
 * Defers rendering heavy book cover styling, DOM hierarchies, and gradients
 * until the novel enters or nears the visible viewport.
 */
export const LazyCover = memo(function LazyCover({
  children,
  className = '',
  aspectRatio = '0.7',
  minHeight = '140px',
}: LazyCoverProps) {
  const { ref, isVisible } = useLazyLoad<HTMLDivElement>(undefined, {
    rootMargin: '100px 0px',
    freezeOnceVisible: true,
  })

  return (
    <div
      ref={ref}
      className={`lazy-cover-wrapper ${className}`}
      style={{
        minHeight,
        aspectRatio,
        position: 'relative',
      }}
    >
      {isVisible ? (
        <div className="lazy-cover-content" style={{ animation: 'cover-fade-in 0.25s ease forwards' }}>
          {children}
        </div>
      ) : (
        <div
          className="lazy-cover-placeholder"
          aria-hidden="true"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, var(--surface, #0c1015) 0%, var(--surface-raised, #161c24) 100%)',
            border: '1px solid var(--line, #252e3d)',
            opacity: 0.8,
          }}
        />
      )}
    </div>
  )
})
