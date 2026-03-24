import { applyInput, applyLiteralInput, getRenderedJamoIds } from '@/engine/core/engine'
import { createInitialEngineState } from '@/engine/core/state'
import { normalizeUnicodeToInputSymbols } from '@/engine/mapper/inputMapper'
import { jamoIdsToUnicode } from '@/engine/mapper/unicodeMapper'

type NormalizedTextBatchRuntime = {
  commitCompositionToDocument: () => void
  hasSelection: () => boolean
  deleteSelection: () => void
  insertLiteralTextIntoDocument: (text: string) => void
}

export function dispatchNormalizedTextBatch(
  text: string,
  runtime: NormalizedTextBatchRuntime,
) {
  runtime.commitCompositionToDocument()

  if (runtime.hasSelection()) {
    runtime.deleteSelection()
  }

  let normalizedTextState = createInitialEngineState()

  for (const char of text) {
    const symbols = normalizeUnicodeToInputSymbols(char)

    if (symbols.length > 0) {
      for (const symbolId of symbols) {
        normalizedTextState = applyInput(normalizedTextState, symbolId)
      }
      continue
    }

    normalizedTextState = applyLiteralInput(normalizedTextState, char)
  }

  runtime.insertLiteralTextIntoDocument(
    jamoIdsToUnicode(getRenderedJamoIds(normalizedTextState)),
  )
}
