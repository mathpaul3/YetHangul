export function detectPreferredKeyboardMode() {
  if (typeof navigator === 'undefined') {
    return 'hardware'
  }

  const ua = navigator.userAgent.toLowerCase()
  const isMobile = /iphone|android.+mobile/.test(ua)
  const isTablet = /ipad|android(?!.*mobile)/.test(ua)
  const hasTouch =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  if (isMobile) {
    return 'onscreen'
  }

  if (isTablet) {
    return 'auto'
  }

  if (hasTouch) {
    return 'auto'
  }

  return 'hardware'
}
