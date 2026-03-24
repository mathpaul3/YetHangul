import type { ModifierKey } from '@/engine/core/types'
import {
  getNormalizedInputEventSignature,
  type NormalizedInputEvent,
  type NormalizedNavigationDirection,
  type NormalizedUtilityKey,
} from '@/features/ime/services/normalizedInput'

type NormalizedDispatcherRuntime = {
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

export function dispatchNormalizedInputEvent(
  event: NormalizedInputEvent,
  runtime: NormalizedDispatcherRuntime,
) {
  const signature = getNormalizedInputEventSignature(event)

  switch (event.type) {
    case 'symbol': {
      if (runtime.shouldSuppressNormalizedEvent(signature)) {
        return
      }

      runtime.markRecentDirectDispatch(event.directText ?? null, event.symbolId)

      if (event.transientModifiers) {
        runtime.handleTransientSymbolInput(
          event.symbolId,
          event.transientModifiers,
          event.visualKeyLabel,
        )
        return
      }

      runtime.handleInput(event.symbolId, event.visualKeyLabel)
      return
    }

    case 'literal':
      if (runtime.shouldSuppressNormalizedEvent(signature)) {
        return
      }

      runtime.markRecentDirectDispatch(event.directText ?? event.text)
      runtime.handleLiteralInput(event.text, event.visualKeyLabel)
      return

    case 'modifier':
      runtime.handleModifierMainClick(event.modifierKey)
      return

    case 'utility':
      if (runtime.shouldSuppressNormalizedEvent(signature)) {
        return
      }

      runtime.markRecentDirectDispatch(
        event.directText ?? (event.utilityKey === 'enter' ? '\n' : null),
      )
      runtime.handleUtilityInput(event.utilityKey)
      return

    case 'navigation':
      runtime.handleNavigationInput(event.direction)
      return
  }
}
