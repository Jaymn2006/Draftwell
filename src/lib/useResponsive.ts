import { useEffect, useState } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface ResponsiveState {
  device: DeviceType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
}

const MOBILE_BREAKPOINT = 640
const TABLET_BREAKPOINT = 1024

function getDeviceState(width: number, height: number): ResponsiveState {
  const isMobile = width < MOBILE_BREAKPOINT
  const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT
  const isDesktop = width >= TABLET_BREAKPOINT

  let device: DeviceType = 'desktop'
  if (isMobile) device = 'mobile'
  else if (isTablet) device = 'tablet'

  return {
    device,
    isMobile,
    isTablet,
    isDesktop,
    width,
    height,
  }
}

/**
 * useResponsive: High-performance viewport listener hook
 * Strictly adheres to responsive architecture:
 * - Mobile: < 640px (Phones)
 * - Tablet: >= 640px and < 1024px (iPads, Tablets)
 * - Desktop: >= 1024px (Laptops, Monitors)
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return getDeviceState(1200, 800)
    }
    return getDeviceState(window.innerWidth, window.innerHeight)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    let timeoutId: number | null = null

    const handleResize = () => {
      // Micro-debounce to prevent layout thrashing on rapid resize
      if (timeoutId !== null) {
        window.cancelAnimationFrame(timeoutId)
      }
      timeoutId = window.requestAnimationFrame(() => {
        setState(getDeviceState(window.innerWidth, window.innerHeight))
      })
    }

    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('orientationchange', handleResize, { passive: true })

    // Initial check
    handleResize()

    return () => {
      if (timeoutId !== null) {
        window.cancelAnimationFrame(timeoutId)
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return state
}
