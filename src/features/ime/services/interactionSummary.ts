import type { ModifierState } from '@/engine/core/types'
import type { UnitSelectionRange } from '@/features/ime/services/editorUnits'

export type CompactModifierSummary = {
  key: keyof ModifierState
  label: string
  mode: ModifierState[keyof ModifierState]
}

export type CompactSurfaceSummary = {
  selectionLabel: string
  activeModifiers: CompactModifierSummary[]
}

const MODIFIER_LABELS: Record<keyof ModifierState, string> = {
  leftCtrl: 'L Ctrl',
  rightCtrl: 'R Ctrl',
  leftShift: 'L Shift',
  rightShift: 'R Shift',
}

export function buildCompactSurfaceSummary(
  selectionRange: UnitSelectionRange,
  modifierState: ModifierState,
): CompactSurfaceSummary {
  const selectionLabel =
    selectionRange == null
      ? 'Sel none'
      : `Sel ${Math.min(selectionRange.start, selectionRange.end)}-${Math.max(selectionRange.start, selectionRange.end)}`

  const activeModifiers = (Object.keys(MODIFIER_LABELS) as Array<keyof ModifierState>)
    .filter((key) => modifierState[key] !== 'off')
    .map((key) => ({
      key,
      label: MODIFIER_LABELS[key],
      mode: modifierState[key],
    }))

  return {
    selectionLabel,
    activeModifiers,
  }
}
