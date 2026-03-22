export type InputSymbolId = number
export type JamoId = number
export type StateId = number

export type ModifierMode = 'off' | 'oneshot' | 'locked'

export type ModifierState = {
  leftCtrl: ModifierMode
  rightCtrl: ModifierMode
  leftShift: ModifierMode
  rightShift: ModifierMode
}

export type ActiveSyllable = {
  stateId: StateId
  inputHistory: InputSymbolId[]
  initial: InputSymbolId[]
  medial: InputSymbolId[]
  final: InputSymbolId[]
  tones: JamoId[]
  jamoIds: JamoId[]
}

export type EngineState = {
  committed: JamoId[]
  active: ActiveSyllable
  undoStack: UndoRecord[]
  modifierState: ModifierState
}

export type UndoRecord = {
  committedLengthBefore: number
  activeBefore: ActiveSyllable
  modifierBefore: ModifierState
}

export type ModifierKey = keyof ModifierState
