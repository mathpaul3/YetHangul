import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectPreferredKeyboardMode } from '@/features/ime/services/keyboardMode'

describe('keyboard mode detection', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('defaults to hardware mode when navigator is unavailable', () => {
    vi.stubGlobal('navigator', undefined)

    expect(detectPreferredKeyboardMode()).toBe('hardware')
  })

  it('prefers onscreen mode for mobile user agents', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
    })

    expect(detectPreferredKeyboardMode()).toBe('onscreen')
  })

  it('prefers auto mode for tablet user agents', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
    })

    expect(detectPreferredKeyboardMode()).toBe('auto')
  })

  it('prefers auto mode for touch-capable non-mobile devices', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15',
      maxTouchPoints: 5,
    })
    vi.stubGlobal('window', {
      ontouchstart: () => undefined,
    })

    expect(detectPreferredKeyboardMode()).toBe('auto')
  })

  it('prefers hardware mode for desktop user agents', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15',
    })

    expect(detectPreferredKeyboardMode()).toBe('hardware')
  })
})
