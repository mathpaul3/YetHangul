import { applyInput, applyLiteralInput, getRenderedJamoIds } from '@/engine/core/engine'
import { createInitialEngineState } from '@/engine/core/state'
import { normalizeUnicodeToInputSymbols } from '@/engine/mapper/inputMapper'
import { jamoIdsToUnicode } from '@/engine/mapper/unicodeMapper'
import type {
  NormalizedBatchInputEvent,
  NormalizedInputBatch,
} from '@/features/ime/services/normalizedInput'

type NormalizedInputBatchRuntime = {
  commitCompositionToDocument: () => void
  hasSelection: () => boolean
  deleteSelection: () => void
  insertLiteralTextIntoDocument: (text: string) => void
}

export function createNormalizedInputBatchFromText(text: string): NormalizedInputBatch {
  const batch: NormalizedBatchInputEvent[] = []
  let literalBuffer = ''

  function flushLiteralBuffer() {
    if (!literalBuffer) {
      return
    }

    batch.push({
      type: 'literal',
      text: literalBuffer,
      directText: literalBuffer,
    })
    literalBuffer = ''
  }

  for (const char of text) {
    const symbols = normalizeUnicodeToInputSymbols(char)

    if (symbols.length > 0) {
      flushLiteralBuffer()

      for (const symbolId of symbols) {
        batch.push({
          type: 'symbol',
          symbolId,
          directText: char,
        })
      }
      continue
    }

    literalBuffer += char
  }

  flushLiteralBuffer()
  return batch
}

export function canonicalizeNormalizedInputBatch(batch: NormalizedInputBatch) {
  let normalizedTextState = createInitialEngineState()

  for (const event of batch) {
    if (event.type === 'symbol') {
      normalizedTextState = applyInput(normalizedTextState, event.symbolId)
      continue
    }

    normalizedTextState = applyLiteralInput(normalizedTextState, event.text)
  }

  return jamoIdsToUnicode(getRenderedJamoIds(normalizedTextState))
}

export function dispatchNormalizedInputBatch(
  batch: NormalizedInputBatch,
  runtime: NormalizedInputBatchRuntime,
) {
  runtime.commitCompositionToDocument()

  if (runtime.hasSelection()) {
    runtime.deleteSelection()
  }
  runtime.insertLiteralTextIntoDocument(canonicalizeNormalizedInputBatch(batch))
}

export function dispatchNormalizedTextBatch(
  text: string,
  runtime: NormalizedInputBatchRuntime,
) {
  return dispatchNormalizedInputBatch(createNormalizedInputBatchFromText(text), runtime)
}
