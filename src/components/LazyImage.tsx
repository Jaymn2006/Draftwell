import { useEffect, useRef, useState, memo } from 'react'
import type { ReactNode, ImgHTMLAttributes } from 'react'

export interface UseIntersectionObserverOptions {
  rootMargin?: string
  threshold?: number | number[]
  freezeOnceVisible?: boolean
}

/**
 * High-performance Intersection Observer hook
 * Optimizes bundle & memory usage by only initiating asset loads
 * when elements enter or approach the active viewport.
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>({
  rootMargin = '120px 0px',
  threshold = 0.05,
  freezeOnceVisible = true,
}: UseIntersectionObserverOptions = {}) {
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Fallback if IntersectionObserver is unsupported in the current environment
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true)
      return
    }

    let hasUnobserved = false

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (freezeOnceVisible && !hasUnobserved) {
            hasUnobserved = true
            observer.unobserve(node)
          }
        } else if (!freezeOnceVisible) {
          setIsVisible(false)
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [rootMargin, threshold, freezeOnceVisible])

  return [ref, isVisible] as const
}

export interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  aspectRatio?: string | number
  fallbackSrc?: string
  skeletonClassName?: string
}

/**
 * LazyImage Component:
 * Observes viewport entry before requesting the image network stream,
 * displays a shimmering skeleton placeholder, and smoothly fades in.
 */
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = '',
  aspectRatio = '0.7',
  fallbackSrc,
  skeletonClassName = '',
  ...props
}: LazyImageProps) {
  const [containerRef, isVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '150px 0px',
  })
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)

  const activeSrc = hasError && fallbackSrc ? fallbackSrc : src

  return (
    <div
      ref={containerRef}
      className={`lazy-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: typeof aspectRatio === 'number' ? `${aspectRatio}` : aspectRatio,
      }}
    >
      {(!isVisible || !isLoaded) && (
        <div
          className={`lazy-skeleton ${skeletonClassName}`}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, var(--surface) 25%, var(--surface-hover) 50%, var(--surface) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            zIndex: 1,
          }}
        />
      )}

      {isVisible && (
        <img
          src={activeSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true)
            setIsLoaded(true)
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.28s ease',
          }}
          {...props}
        />
      )}
    </div>
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
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
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
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-raised) 100%)',
            border: '1px solid var(--line)',
            opacity: 0.8,
          }}
        />
      )}
    </div>
  )
})
