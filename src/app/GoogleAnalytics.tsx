import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_TRACKING_ID ?? 'G-MPW0RV0L7Z'

export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
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
