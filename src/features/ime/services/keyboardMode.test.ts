import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectPreferredKeyboardMode } from '@/features/ime/services/keyboardMode'

describe('keyboard mode detection', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function stubMatchMedia(matches: boolean) {
    vi.stubGlobal('window', {
      matchMedia: () => ({
        matches,
        media: '(pointer: coarse)',
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        onchange: null,
        dispatchEvent: () => false,
      }),
    })
  }

  const cases = [
    {
      name: 'defaults to hardware mode when navigator is unavailable',
      navigator: undefined,
      window: undefined,
      expected: 'hardware',
    },
    {
      name: 'prefers onscreen mode for iPhone user agents',
      navigator: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
      },
      window: undefined,
      expected: 'onscreen',
    },
    {
      name: 'prefers onscreen mode for Android phone user agents',
      navigator: {
        userAgent:
          'Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      },
      window: undefined,
      expected: 'onscreen',
    },
    {
      name: 'prefers auto mode for iPad user agents',
      navigator: {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
      },
      window: undefined,
      expected: 'auto',
    },
    {
      name: 'prefers auto mode for Android tablet user agents',
      navigator: {
        userAgent:
          'Mozilla/5.0 (Linux; Android 15; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      window: undefined,
      expected: 'auto',
    },
    {
      name: 'prefers auto mode for touch-capable desktop environments',
      navigator: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15',
        maxTouchPoints: 5,
      },
      window: {
        ontouchstart: true,
      },
      expected: 'auto',
    },
    {
      name: 'prefers auto mode when touch is exposed only through maxTouchPoints',
      navigator: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15',
        maxTouchPoints: 5,
      },
      window: {},
      expected: 'auto',
    },
    {
      name: 'prefers auto mode for coarse-pointer environments without touch globals',
      navigator: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15',
        maxTouchPoints: 0,
      },
      window: undefined,
      coarsePointer: true,
      expected: 'auto',
    },
    {
      name: 'prefers auto mode when touch is exposed only through coarse pointer media queries',
      navigator: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15',
        maxTouchPoints: 0,
      },
      window: undefined,
      coarsePointer: true,
      expected: 'auto',
    },
    {
      name: 'prefers hardware mode for desktop user agents without touch',
      navigator: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15',
        maxTouchPoints: 0,
      },
      window: {},
      expected: 'hardware',
    },
  ] as const

  for (const testCase of cases) {
    it(testCase.name, () => {
      if (testCase.navigator === undefined) {
        vi.stubGlobal('navigator', undefined)
      } else {
        vi.stubGlobal('navigator', testCase.navigator)
      }

      if (testCase.window !== undefined) {
        vi.stubGlobal('window', testCase.window)
      }

      if ('coarsePointer' in testCase && testCase.coarsePointer) {
        stubMatchMedia(true)
      } else if ('coarsePointer' in testCase && !testCase.coarsePointer) {
        stubMatchMedia(false)
      }

      expect(detectPreferredKeyboardMode()).toBe(testCase.expected)
    })
  }

  it('keeps a small browser/platform probe contract stable', () => {
    const contract = [
      {
        name: 'mobile user agents stay onscreen even with touch evidence',
        navigator: {
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
          maxTouchPoints: 5,
        },
        window: {
          ontouchstart: true,
        },
        expected: 'onscreen',
      },
      {
        name: 'tablet user agents stay auto without needing touch evidence',
        navigator: {
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
          maxTouchPoints: 0,
        },
        window: {},
        expected: 'auto',
      },
      {
        name: 'touch-capable desktop environments stay auto',
        navigator: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15',
          maxTouchPoints: 5,
        },
        window: {
          ontouchstart: true,
        },
        expected: 'auto',
      },
      {
        name: 'desktop user agents without touch evidence stay hardware',
        navigator: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15',
          maxTouchPoints: 0,
        },
        window: {},
        expected: 'hardware',
      },
    ] as const

    for (const testCase of contract) {
      vi.stubGlobal('navigator', testCase.navigator)
      vi.stubGlobal('window', testCase.window)
      expect(detectPreferredKeyboardMode(), testCase.name).toBe(testCase.expected)
    }
  })

  it('keeps a small desktop/tablet connected-vs-disconnected matrix stable', () => {
    const matrix = [
      {
        name: 'desktop without touch signals maps to hardware',
        navigator: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15',
          maxTouchPoints: 0,
        },
        window: {},
        expected: 'hardware',
      },
      {
        name: 'desktop with touch signals maps to auto',
        navigator: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15',
          maxTouchPoints: 5,
        },
        window: {},
        expected: 'auto',
      },
      {
        name: 'tablet user agent stays auto regardless of keyboard attachment ambiguity',
        navigator: {
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
          maxTouchPoints: 0,
        },
        window: {},
        expected: 'auto',
      },
    ] as const

    for (const testCase of matrix) {
      vi.stubGlobal('navigator', testCase.navigator)
      vi.stubGlobal('window', testCase.window)
      expect(detectPreferredKeyboardMode(), testCase.name).toBe(testCase.expected)
    }
  })
})
