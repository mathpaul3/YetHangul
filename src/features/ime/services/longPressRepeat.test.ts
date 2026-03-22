import { afterEach, describe, expect, it, vi } from 'vitest'
import { startLongPressRepeat } from '@/features/ime/services/longPressRepeat'

describe('longPressRepeat', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('repeats after a delay and stops when cancelled', () => {
    vi.useFakeTimers()
    const onRepeat = vi.fn()

    const controller = startLongPressRepeat({
      delayMs: 300,
      intervalMs: 50,
      onRepeat,
    })

    vi.advanceTimersByTime(299)
    expect(onRepeat).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onRepeat).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(onRepeat).toHaveBeenCalledTimes(3)

    controller.cancel()
    vi.advanceTimersByTime(200)
    expect(onRepeat).toHaveBeenCalledTimes(3)
  })
})
