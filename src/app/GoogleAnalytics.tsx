import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
    [key: `ga-disable-${string}`]: boolean | undefined
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_TRACKING_ID
const IS_PRODUCTION = import.meta.env.PROD

function isAnalyticsEnabled() {
  return IS_PRODUCTION && Boolean(GA_MEASUREMENT_ID)
}

export function trackAnalyticsEvent(
  action: string,
  {
    category = 'Input',
    ...params
  }: {
    category?: string
    [key: string]: string | number | boolean | undefined
  } = {},
) {
  if (!isAnalyticsEnabled() || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return
  }

  window.gtag('event', action, {
    event_category: category,
    ...params,
  })
}

export function GoogleAnalytics() {
  useEffect(() => {
    if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
      window[`ga-disable-${GA_MEASUREMENT_ID}`] = !IS_PRODUCTION
    }

    if (!isAnalyticsEnabled()) {
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`

    const inlineScript = document.createElement('script')
    inlineScript.textContent = [
      'window.dataLayer = window.dataLayer || [];',
      'function gtag(){dataLayer.push(arguments);}',
      "gtag('js', new Date());",
      `gtag('config', '${GA_MEASUREMENT_ID}');`,
    ].join('\n')

    document.head.appendChild(script)
    document.head.appendChild(inlineScript)

    return () => {
      script.remove()
      inlineScript.remove()
    }
  }, [])

  return null
}
