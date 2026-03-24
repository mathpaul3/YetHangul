import type { ModifierKey } from '@/engine/core/types'

export type NormalizedSymbolInputEvent = {
  type: 'symbol'
  symbolId: number
  visualKeyLabel?: string
  transientModifiers?: Partial<Record<ModifierKey, boolean>>
  directText?: string | null
}

export type NormalizedLiteralInputEvent = {
  type: 'literal'
  text: string
  visualKeyLabel?: string
  directText?: string | null
}

export type NormalizedModifierInputEvent = {
  type: 'modifier'
  modifierKey: ModifierKey
  visualKeyLabel?: string
}

export type NormalizedUtilityKey = 'space' | 'period' | 'semicolon' | 'enter'

export type NormalizedUtilityInputEvent = {
  type: 'utility'
  utilityKey: NormalizedUtilityKey
  directText?: string | null
}

export type NormalizedNavigationDirection = 'arrowLeft' | 'arrowRight' | 'home' | 'end'

export type NormalizedNavigationInputEvent = {
  type: 'navigation'
  direction: NormalizedNavigationDirection
}

export type NormalizedInputEvent =
  | NormalizedSymbolInputEvent
  | NormalizedLiteralInputEvent
  | NormalizedModifierInputEvent
  | NormalizedUtilityInputEvent
  | NormalizedNavigationInputEvent

export function getNormalizedInputEventSignature(event: NormalizedInputEvent) {
  switch (event.type) {
    case 'symbol':
      return `symbol:${event.symbolId}:${event.visualKeyLabel ?? ''}`
    case 'literal':
      return `literal:${event.text}`
    case 'utility':
      return `utility:${event.utilityKey}`
    case 'modifier':
      return `modifier:${event.modifierKey}`
    case 'navigation':
      return `navigation:${event.direction}`
  }
}
