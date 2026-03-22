export function detectPreferredKeyboardMode() {
  if (typeof navigator === 'undefined') {
    return 'hardware'
  }

  const ua = navigator.userAgent.toLowerCase()
  const isMobile = /iphone|android.+mobile/.test(ua)
  const isTablet = /ipad|android(?!.*mobile)/.test(ua)

  if (isMobile) {
    return 'onscreen'
  }

  if (isTablet) {
    return 'auto'
  }

  return 'hardware'
}

