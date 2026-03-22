import type { ActiveSyllable, EngineState, ModifierState } from '@/engine/core/types'

export const EMPTY_STATE_ID = 0

export const initialModifierState = (): ModifierState => ({
  leftCtrl: 'off',
  rightCtrl: 'off',
  leftShift: 'off',
  rightShift: 'off',
})

export const createEmptyActiveSyllable = (): ActiveSyllable => ({
  stateId: EMPTY_STATE_ID,
  inputHistory: [],
  initial: [],
  medial: [],
  final: [],
  tones: [],
  jamoIds: [],
})

export const createInitialEngineState = (): EngineState => ({
  committed: [],
  active: createEmptyActiveSyllable(),
  undoStack: [],
  modifierState: initialModifierState(),
})
