export type LongPressRepeatController = {
  cancel: () => void
}

type LongPressRepeatOptions = {
  delayMs?: number
  intervalMs?: number
  onRepeat: () => void
}

const DEFAULT_DELAY_MS = 320
const DEFAULT_INTERVAL_MS = 60

export function startLongPressRepeat({
  delayMs = DEFAULT_DELAY_MS,
  intervalMs = DEFAULT_INTERVAL_MS,
  onRepeat,
}: LongPressRepeatOptions): LongPressRepeatController {
  let intervalId: ReturnType<typeof setInterval> | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => {
    onRepeat()
    timeoutId = null
    intervalId = setInterval(() => {
      onRepeat()
    }, intervalMs)
  }, delayMs)

  return {
    cancel() {
      if (timeoutId != null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      if (intervalId != null) {
        clearInterval(intervalId)
        intervalId = null
      }
    },
  }
}
