import type { ModifierKey } from '@/engine/core/types'
import { normalizeUnicodeToInputSymbols } from '@/engine/mapper/inputMapper'
import { dispatchNormalizedInputBatch as dispatchBatchThroughSharedDispatcher } from '@/features/ime/services/normalizedDispatcher'
import type {
  NormalizedBatchInputEvent,
  NormalizedInputBatch,
  NormalizedNavigationDirection,
  NormalizedUtilityKey,
} from '@/features/ime/services/normalizedInput'

type NormalizedInputBatchRuntime = {
  shouldSuppressNormalizedEvent: (signature: string) => boolean
  markRecentDirectDispatch: (text: string | null, symbolId?: number | null) => void
  handleInput: (symbolId: number, visualKeyLabel?: string) => void
  handleLiteralInput: (text: string, visualKeyLabel?: string) => void
  handleModifierMainClick: (modifierKey: ModifierKey) => void
  handleUtilityInput: (utilityKey: NormalizedUtilityKey) => void
  handleNavigationInput: (direction: NormalizedNavigationDirection) => void
  handleTransientSymbolInput: (
    symbolId: number,
    transientModifiers: Partial<Record<ModifierKey, boolean>>,
    visualKeyLabel?: string,
  ) => void
}

export function createNormalizedInputBatchFromText(text: string): NormalizedInputBatch {
  const batch: NormalizedBatchInputEvent[] = []

  for (const char of text) {
    const symbols = normalizeUnicodeToInputSymbols(char)

    if (symbols.length > 0) {
      for (const symbolId of symbols) {
        batch.push({
          type: 'symbol',
          symbolId,
          directText: char,
        })
      }
      continue
    }

    const previousEvent = batch.at(-1)

    if (previousEvent?.type === 'literal') {
      previousEvent.text += char
      continue
    }

    batch.push({
      type: 'literal',
      text: char,
      directText: char,
    })
  }

  return batch
}

export function dispatchNormalizedInputBatch(
  batch: NormalizedInputBatch,
  runtime: NormalizedInputBatchRuntime,
) {
  return dispatchBatchThroughSharedDispatcher(batch, runtime)
}

export function dispatchNormalizedTextBatch(
  text: string,
  runtime: NormalizedInputBatchRuntime,
) {
  return dispatchNormalizedInputBatch(createNormalizedInputBatchFromText(text), runtime)
}
