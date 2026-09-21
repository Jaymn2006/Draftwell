import { useEffect, useRef, useState, useCallback } from 'react'

export interface UseLazyLoadOptions {
  /**
   * Root margin offset before the element enters the viewport.
   * Default: '120px 0px' (starts fetching slightly before entering view for smooth perception)
   */
  rootMargin?: string
  /**
   * Threshold ratio of visibility required to trigger intersection.
   * Default: 0.05
   */
  threshold?: number | number[]
  /**
   * If true, stops observing after the element first intersects.
   * Default: true
   */
  freezeOnceVisible?: boolean
  /**
   * Fallback image URL if primary image load fails.
   */
  fallbackSrc?: string
  /**
   * Optional manual override to bypass intersection observing and load immediately.
   */
  enabled?: boolean
}

export interface UseLazyLoadResult<T extends HTMLElement = HTMLDivElement> {
  /** Ref to attach to the observed container or image DOM node */
  ref: (node: T | null) => void
  /** React MutableRefObject holding the current DOM node */
  elementRef: React.MutableRefObject<T | null>
  /** Whether the element has entered or approached the viewport */
  isVisible: boolean
  /** True while the image asset is actively fetching / decoding over the network */
  isLoading: boolean
  /** True once the image has successfully decoded and loaded */
  isLoaded: boolean
  /** True if the primary image request failed or encountered a network error */
  hasError: boolean
  /** The currently active image source URL (undefined until intersecting, fallback on error) */
  currentSrc: string | undefined
  /** Trigger a re-attempt of the image fetch */
  retry: () => void
}

/**
 * useLazyLoad custom hook
 * 
 * Leverages the IntersectionObserver API to defer image fetching until the novel
 * cover approaches the active viewport, preventing network contention on dense shelves.
 * 
 * Provides responsive lifecycle states:
 * - `isVisible`: Tracks intersection entrance
 * - `isLoading`: Enables loading spinners
 * - `hasError`: Triggers fallback placeholder states
 * - `isLoaded`: Enables smooth fade-in transitions
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  src?: string,
  options: UseLazyLoadOptions = {}
): UseLazyLoadResult<T> {
  const {
    rootMargin = '120px 0px',
    threshold = 0.05,
    freezeOnceVisible = true,
    fallbackSrc,
    enabled = true,
  } = options

  const elementRef = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState<boolean>(!enabled)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined)
  const [retryNonce, setRetryNonce] = useState<number>(0)

  // Disconnect & observe ref callback
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (node: T | null) => {
      elementRef.current = node

      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!node || !enabled) return

      // Graceful fallback if IntersectionObserver is not supported
      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        setIsVisible(true)
        return
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (freezeOnceVisible && observerRef.current) {
              observerRef.current.unobserve(node)
              observerRef.current.disconnect()
              observerRef.current = null
            }
          } else if (!freezeOnceVisible) {
            setIsVisible(false)
          }
        },
        { rootMargin, threshold }
      )

      observerRef.current.observe(node)
    },
    [rootMargin, threshold, freezeOnceVisible, enabled]
  )

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [])

  // Image preloading & fetching lifecycle once visible
  useEffect(() => {
    if (!isVisible || !src) {
      if (!src) {
        setIsLoading(false)
        setIsLoaded(false)
        setHasError(false)
        setCurrentSrc(undefined)
      }
      return
    }

    let isSubscribed = true
    setIsLoading(true)
    setHasError(false)

    // Construct an offscreen Image loader to decode ahead of paint
    const img = new Image()
    img.src = src

    // Handle cached images synchronously
    if (img.complete) {
      setIsLoading(false)
      setIsLoaded(true)
      setCurrentSrc(src)
      return
    }

    img.onload = () => {
      if (!isSubscribed) return
      setIsLoading(false)
      setIsLoaded(true)
      setHasError(false)
      setCurrentSrc(src)
    }

    img.onerror = () => {
      if (!isSubscribed) return
      setIsLoading(false)
      setHasError(true)
      setIsLoaded(false)
      setCurrentSrc(fallbackSrc || undefined)
    }

    return () => {
      isSubscribed = false
      img.onload = null
      img.onerror = null
    }
  }, [src, isVisible, fallbackSrc, retryNonce])

  const retry = useCallback(() => {
    setHasError(false)
    setIsLoaded(false)
    setIsLoading(true)
    setRetryNonce((n) => n + 1)
  }, [])

  return {
    ref,
    elementRef,
    isVisible,
    isLoading,
    isLoaded,
    hasError,
    currentSrc,
    retry,
  }
}
