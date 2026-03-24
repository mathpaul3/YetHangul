import { createEmptyActiveSyllable, EMPTY_STATE_ID } from '@/engine/core/state'
import { encodeLiteralTextAsJamoIds } from '@/engine/mapper/literalRegistry'
import type {
  ActiveSyllable,
  EngineState,
  InputSymbolId,
  JamoId,
  ModifierKey,
  ModifierMode,
  ModifierState,
  UndoRecord,
} from '@/engine/core/types'
import { STATE_IDS, toTransitionKey, transitionMap } from '@/engine/fsm/transitions'
import { INPUT_SYMBOL_COUNT, INPUT_SYMBOL_IDS } from '@/engine/tables/inputSymbolTable'
import { JAMO_IDS } from '@/engine/tables/jamoTable'
import {
  FINAL_CLUSTER_MAP,
  INITIAL_CLUSTER_MAP,
  MEDIAL_CLUSTER_MAP,
  SIMPLE_FINAL_JAMO,
  SIMPLE_INITIAL_JAMO,
  SIMPLE_MEDIAL_JAMO,
  resolveCluster,
} from '@/engine/tables/compositionTables'

function cloneActive(active: ActiveSyllable): ActiveSyllable {
  return {
    stateId: active.stateId,
    inputHistory: [...active.inputHistory],
    initial: [...active.initial],
    medial: [...active.medial],
    final: [...active.final],
    tones: [...active.tones],
    jamoIds: [...active.jamoIds],
  }
}

function cloneModifierState(modifierState: ModifierState): ModifierState {
  return { ...modifierState }
}

function createUndoRecord(engineState: EngineState): UndoRecord {
  return {
    committedLengthBefore: engineState.committed.length,
    activeBefore: cloneActive(engineState.active),
    modifierBefore: consumeOneShotModifiers(cloneModifierState(engineState.modifierState)),
  }
}

function consumeModifierMode(mode: ModifierMode) {
  return mode === 'oneshot' ? 'off' : mode
}

function consumeOneShotModifiers(modifierState: ModifierState): ModifierState {
  return {
    leftCtrl: consumeModifierMode(modifierState.leftCtrl),
    rightCtrl: consumeModifierMode(modifierState.rightCtrl),
    leftShift: consumeModifierMode(modifierState.leftShift),
    rightShift: consumeModifierMode(modifierState.rightShift),
  }
}

function mergeModifierStates(
  base: ModifierState,
  transient?: Partial<Record<ModifierKey, boolean>>,
): ModifierState {
  if (!transient) {
    return cloneModifierState(base)
  }

  return {
    leftCtrl: transient.leftCtrl ? 'oneshot' : base.leftCtrl,
    rightCtrl: transient.rightCtrl ? 'oneshot' : base.rightCtrl,
    leftShift: transient.leftShift ? 'oneshot' : base.leftShift,
    rightShift: transient.rightShift ? 'oneshot' : base.rightShift,
  }
}

function resolveInitialJamo(inputIds: InputSymbolId[]) {
  return resolveCluster(INITIAL_CLUSTER_MAP, inputIds)
}

function resolveMedialJamo(inputIds: InputSymbolId[]) {
  return resolveCluster(MEDIAL_CLUSTER_MAP, inputIds)
}

function resolveFinalJamo(inputIds: InputSymbolId[]) {
  return resolveCluster(FINAL_CLUSTER_MAP, inputIds)
}

function renderActiveSyllable(active: ActiveSyllable) {
  const jamoIds: JamoId[] = []
  const initialJamo =
    active.initial.length > 0
      ? resolveInitialJamo(active.initial) ??
        SIMPLE_INITIAL_JAMO[active.initial.at(-1)!]
      : undefined
  const medialJamo =
    active.medial.length > 0
      ? resolveMedialJamo(active.medial) ??
        SIMPLE_MEDIAL_JAMO[active.medial.at(-1)!]
      : undefined
  const finalJamo =
    active.final.length > 0
      ? resolveFinalJamo(active.final) ??
        SIMPLE_FINAL_JAMO[active.final.at(-1)!]
      : undefined

  if (
    active.initial.length > 1 &&
    active.medial.length === 0 &&
    !resolveInitialJamo(active.initial)
  ) {
    for (const initial of active.initial) {
      const mapped = SIMPLE_INITIAL_JAMO[initial]
      if (mapped) {
        jamoIds.push(mapped)
      }
    }
  } else if (initialJamo) {
    jamoIds.push(initialJamo)
  }

  if (medialJamo) {
    jamoIds.push(medialJamo)
  }

  if (finalJamo) {
    jamoIds.push(finalJamo)
  }

  jamoIds.push(...active.tones)
  active.jamoIds = jamoIds
}

function computeStateId(active: ActiveSyllable) {
  if (active.tones.length > 0) {
    return STATE_IDS.TONE_ATTACHED
  }
  if (active.initial.length > 0 && active.medial.length > 0 && active.final.length > 0) {
    return STATE_IDS.INITIAL_MEDIAL_FINAL
  }
  if (active.initial.length > 0 && active.medial.length > 0) {
    return STATE_IDS.INITIAL_MEDIAL
  }
  if (active.initial.length > 0) {
    return STATE_IDS.INITIAL_ONLY
  }
  if (active.medial.length > 0) {
    return STATE_IDS.MEDIAL_ONLY
  }
  return EMPTY_STATE_ID
}

function updateActive(active: ActiveSyllable) {
  active.stateId = computeStateId(active)
  renderActiveSyllable(active)
}

function commitActive(engineState: EngineState) {
  if (engineState.active.jamoIds.length === 0) {
    return
  }
  engineState.committed.push(...engineState.active.jamoIds)
  engineState.active = createEmptyActiveSyllable()
}

function insertInitialFiller(active: ActiveSyllable) {
  if (active.initial.length === 0) {
    active.initial = [INPUT_SYMBOL_IDS.CHOSEONG_FILLER]
    active.inputHistory.push(INPUT_SYMBOL_IDS.CHOSEONG_FILLER)
  }
}

function insertMedialFiller(active: ActiveSyllable) {
  if (active.medial.length === 0) {
    active.medial = [INPUT_SYMBOL_IDS.JUNGSEONG_FILLER]
    active.inputHistory.push(INPUT_SYMBOL_IDS.JUNGSEONG_FILLER)
  }
}

function applyContextualShiftMieum(engineState: EngineState) {
  const active = cloneActive(engineState.active)

  if (active.initial.length > 0 && active.medial.length === 0) {
    insertMedialFiller(active)
    active.final = [INPUT_SYMBOL_IDS.SHIFT_MIEUM]
    active.inputHistory.push(INPUT_SYMBOL_IDS.SHIFT_MIEUM)
    updateActive(active)
    engineState.active = active
    return
  }

  if (active.initial.length === 0 && active.medial.length > 0 && active.final.length === 0) {
    insertInitialFiller(active)
    active.final = [INPUT_SYMBOL_IDS.SHIFT_MIEUM]
    active.inputHistory.push(INPUT_SYMBOL_IDS.SHIFT_MIEUM)
    updateActive(active)
    engineState.active = active
    return
  }

  if (active.initial.length > 0 && active.medial.length > 0 && active.final.length === 0) {
    active.final = [INPUT_SYMBOL_IDS.SHIFT_MIEUM]
    active.inputHistory.push(INPUT_SYMBOL_IDS.SHIFT_MIEUM)
    updateActive(active)
    engineState.active = active
    return
  }

  commitActive(engineState)
  const nextActive = createEmptyActiveSyllable()
  insertInitialFiller(nextActive)
  insertMedialFiller(nextActive)
  nextActive.final = [INPUT_SYMBOL_IDS.SHIFT_MIEUM]
  nextActive.inputHistory.push(INPUT_SYMBOL_IDS.SHIFT_MIEUM)
  updateActive(nextActive)
  engineState.active = nextActive
}

function restartWithFilledMedial(engineState: EngineState, symbolId: InputSymbolId) {
  commitActive(engineState)

  const nextActive = createEmptyActiveSyllable()
  nextActive.initial = [INPUT_SYMBOL_IDS.CHOSEONG_FILLER]
  nextActive.medial = [symbolId]
  nextActive.inputHistory.push(INPUT_SYMBOL_IDS.CHOSEONG_FILLER, symbolId)
  updateActive(nextActive)
  engineState.active = nextActive
}

function restartWithInitial(engineState: EngineState, symbolId: InputSymbolId) {
  commitActive(engineState)

  const nextActive = createEmptyActiveSyllable()
  nextActive.initial = [symbolId]
  nextActive.inputHistory.push(symbolId)
  updateActive(nextActive)
  engineState.active = nextActive
}

export function applyContextualFiller(engineState: EngineState) {
  const nextState: EngineState = {
    committed: [...engineState.committed],
    active: cloneActive(engineState.active),
    undoStack: [...engineState.undoStack, createUndoRecord(engineState)],
    modifierState: cloneModifierState(engineState.modifierState),
  }
  const active = cloneActive(nextState.active)

  if (active.initial.length === 0 && active.medial.length === 0) {
    active.initial = [INPUT_SYMBOL_IDS.CHOSEONG_FILLER]
    active.inputHistory.push(INPUT_SYMBOL_IDS.CHOSEONG_FILLER)
    updateActive(active)
    nextState.active = active
    nextState.modifierState = consumeOneShotModifiers(nextState.modifierState)
    return nextState
  }

  if (active.initial.length > 0 && active.medial.length === 0) {
    active.medial = [INPUT_SYMBOL_IDS.JUNGSEONG_FILLER]
    active.inputHistory.push(INPUT_SYMBOL_IDS.JUNGSEONG_FILLER)
    updateActive(active)
    nextState.active = active
    nextState.modifierState = consumeOneShotModifiers(nextState.modifierState)
    return nextState
  }

  if (active.initial.length === 0 && active.medial.length > 0) {
    active.initial = [INPUT_SYMBOL_IDS.CHOSEONG_FILLER]
    active.inputHistory.push(INPUT_SYMBOL_IDS.CHOSEONG_FILLER)
    updateActive(active)
    nextState.active = active
    nextState.modifierState = consumeOneShotModifiers(nextState.modifierState)
    return nextState
  }

  commitActive(nextState)
  nextState.active.initial = [INPUT_SYMBOL_IDS.CHOSEONG_FILLER]
  nextState.active.inputHistory.push(INPUT_SYMBOL_IDS.CHOSEONG_FILLER)
  updateActive(nextState.active)
  nextState.modifierState = consumeOneShotModifiers(nextState.modifierState)
  return nextState
}

function applyTransition(engineState: EngineState, symbolId: InputSymbolId): void {
  const active = cloneActive(engineState.active)
  const transition = transitionMap.get(
    toTransitionKey(active.stateId, symbolId, INPUT_SYMBOL_COUNT),
  )

  if (!transition) {
    commitActive(engineState)
    const retry = transitionMap.get(
      toTransitionKey(engineState.active.stateId, symbolId, INPUT_SYMBOL_COUNT),
    )
    if (!retry) {
      return
    }
    applyTransition(engineState, symbolId)
    return
  }

  active.inputHistory.push(symbolId)

  switch (transition.op) {
    case 'append_initial':
      active.initial.push(symbolId)
      break
    case 'append_medial':
      active.medial.push(symbolId)
      break
    case 'append_final':
      active.final = [symbolId]
      break
    case 'replace_initial_cluster':
      active.initial.push(symbolId)
      if (active.initial.length > 1 && !resolveInitialJamo(active.initial)) {
        restartWithInitial(engineState, symbolId)
        return
      }
      break
    case 'replace_medial_cluster':
      active.medial.push(symbolId)
      if (active.medial.length > 1 && !resolveMedialJamo(active.medial)) {
        restartWithFilledMedial(engineState, symbolId)
        return
      }
      break
    case 'replace_final_cluster':
      active.final.push(symbolId)
      if (!resolveFinalJamo(active.final)) {
        active.inputHistory.pop()
        active.final.pop()
        commitActive(engineState)
        applyTransition(engineState, symbolId)
        return
      }
      break
    case 'append_tone':
      active.tones.push(
        symbolId === INPUT_SYMBOL_IDS.TONE_SINGLE
          ? JAMO_IDS.TONE_SINGLE
          : JAMO_IDS.TONE_DOUBLE,
      )
      break
    case 'insert_filler_then_append':
      active.initial = [INPUT_SYMBOL_IDS.CHOSEONG_FILLER]
      active.medial = [INPUT_SYMBOL_IDS.JUNGSEONG_FILLER]
      active.final = []
      active.tones = []
      active.jamoIds = [
        JAMO_IDS.CHOSEONG_FILLER,
        JAMO_IDS.JUNGSEONG_FILLER,
        JAMO_IDS.JONGSEONG_SSANGMIEUM,
      ]
      active.inputHistory.push(
        INPUT_SYMBOL_IDS.CHOSEONG_FILLER,
        INPUT_SYMBOL_IDS.JUNGSEONG_FILLER,
      )
      updateActive(active)
      active.jamoIds.push(JAMO_IDS.JONGSEONG_SSANGMIEUM)
      active.stateId = STATE_IDS.INITIAL_MEDIAL_FINAL
      engineState.active = active
      return
    case 'reparse_final_as_initial': {
      const carriedFinal = active.final.pop()
      if (carriedFinal == null) {
        active.medial.push(symbolId)
        break
      }

      const previousSyllable = cloneActive(active)
      previousSyllable.final = [...active.final]
      previousSyllable.tones = []
      updateActive(previousSyllable)
      engineState.committed.push(...previousSyllable.jamoIds)

      active.initial = [carriedFinal]
      active.medial = [symbolId]
      active.final = []
      active.tones = []
      active.inputHistory = [carriedFinal, symbolId]
      break
    }
    case 'commit_and_restart':
      commitActive(engineState)
      applyTransition(engineState, symbolId)
      return
  }

  updateActive(active)
  engineState.active = active
}

function resolveModifiedSymbol(
  symbolId: InputSymbolId,
  modifierState: ModifierState,
  active: ActiveSyllable,
): InputSymbolId {
  const leftCtrlActive = modifierState.leftCtrl !== 'off'
  const rightCtrlActive = modifierState.rightCtrl !== 'off'
  const ctrlActive = leftCtrlActive || rightCtrlActive
  const shiftActive =
    modifierState.leftShift !== 'off' || modifierState.rightShift !== 'off'

  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.CHIEUCH) {
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_BANCHIEUM
  }
  if (leftCtrlActive && shiftActive && symbolId === INPUT_SYMBOL_IDS.SIOS) {
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SSANGSIOS
  }
  if (rightCtrlActive && shiftActive && symbolId === INPUT_SYMBOL_IDS.SIOS) {
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SSANGSIOS
  }
  if (leftCtrlActive && symbolId === INPUT_SYMBOL_IDS.SIOS) {
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SIOS
  }
  if (rightCtrlActive && symbolId === INPUT_SYMBOL_IDS.SIOS) {
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SIOS
  }
  if (ctrlActive && symbolId === INPUT_SYMBOL_IDS.IEUNG) {
    if (
      active.initial.length > 0 &&
      active.medial.length > 0 &&
      active.final.length === 0 &&
      active.tones.length === 0
    ) {
      return INPUT_SYMBOL_IDS.DIRECT_FINAL_U_11F0
    }
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_OLD_IEUNG
  }
  if (leftCtrlActive && symbolId === INPUT_SYMBOL_IDS.CIEUC) {
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_CIEUC
  }
  if (rightCtrlActive && symbolId === INPUT_SYMBOL_IDS.CIEUC) {
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_CIEUC
  }
  if (leftCtrlActive && symbolId === INPUT_SYMBOL_IDS.SSANGCIEUC) {
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SSANGCIEUC
  }
  if (rightCtrlActive && symbolId === INPUT_SYMBOL_IDS.SSANGCIEUC) {
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SSANGCIEUC
  }
  if (leftCtrlActive && symbolId === INPUT_SYMBOL_IDS.CHIEUCH) {
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_CHIEUCH
  }
  if (rightCtrlActive && symbolId === INPUT_SYMBOL_IDS.CHIEUCH) {
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_CHIEUCH
  }
  if (ctrlActive && shiftActive && symbolId === INPUT_SYMBOL_IDS.HIEUH) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_YEORINHIEUH
  }
  if (ctrlActive && symbolId === INPUT_SYMBOL_IDS.HIEUH) {
    return INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_YEORINHIEUH
  }
  if (ctrlActive && shiftActive && symbolId === INPUT_SYMBOL_IDS.A) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_SSANGARAEA
  }
  if (ctrlActive && symbolId === INPUT_SYMBOL_IDS.A) {
    return INPUT_SYMBOL_IDS.ARAEA
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.GIYEOK) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_GIYEOK
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.DIGEUT) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_DIGEUT
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.NIEUN) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_NIEUN
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.RIEUL) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_RIEUL
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.MIEUM) {
    return INPUT_SYMBOL_IDS.SHIFT_MIEUM
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.BIEUP) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_BIEUP
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.SIOS) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_SIOS
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.IEUNG) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_IEUNG
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.CIEUC) {
    return INPUT_SYMBOL_IDS.SSANGCIEUC
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.THIEUTH) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_THIEUTH
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.HIEUH) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_HIEUH
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.U) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_U
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.O) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_O
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.EU) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_EU
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.ARAEA) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_SSANGARAEA
  }
  if (shiftActive && symbolId === INPUT_SYMBOL_IDS.I) {
    return INPUT_SYMBOL_IDS.SPECIAL_SHIFT_I
  }
  return symbolId
}

export function applyInput(engineState: EngineState, inputSymbolId: InputSymbolId) {
  if (inputSymbolId === INPUT_SYMBOL_IDS.BACKSPACE) {
    const previous = engineState.undoStack.at(-1)
    if (!previous) {
      return engineState
    }
    return {
      committed: engineState.committed.slice(0, previous.committedLengthBefore),
      active: cloneActive(previous.activeBefore),
      undoStack: engineState.undoStack.slice(0, -1),
      modifierState: cloneModifierState(previous.modifierBefore),
    }
  }

  if (
    (inputSymbolId === INPUT_SYMBOL_IDS.TONE_SINGLE ||
      inputSymbolId === INPUT_SYMBOL_IDS.TONE_DOUBLE) &&
    (engineState.active.tones.length > 0 ||
      engineState.active.medial.length === 0)
  ) {
    return {
      ...engineState,
      modifierState: consumeOneShotModifiers(cloneModifierState(engineState.modifierState)),
    }
  }

  const nextState: EngineState = {
    committed: [...engineState.committed],
    active: cloneActive(engineState.active),
    undoStack: [...engineState.undoStack, createUndoRecord(engineState)],
    modifierState: cloneModifierState(engineState.modifierState),
  }

  if (inputSymbolId === INPUT_SYMBOL_IDS.SPACE) {
    commitActive(nextState)
    nextState.committed.push(JAMO_IDS.SPACE)
    nextState.modifierState = consumeOneShotModifiers(nextState.modifierState)
    return nextState
  }

  const resolvedSymbolId = resolveModifiedSymbol(
    inputSymbolId,
    nextState.modifierState,
    nextState.active,
  )
  if (resolvedSymbolId === INPUT_SYMBOL_IDS.SHIFT_MIEUM) {
    applyContextualShiftMieum(nextState)
    nextState.modifierState = consumeOneShotModifiers(nextState.modifierState)
    return nextState
  }
  applyTransition(nextState, resolvedSymbolId)
  nextState.modifierState = consumeOneShotModifiers(nextState.modifierState)
  return nextState
}

export function applyLiteralInput(engineState: EngineState, text: string) {
  if (text.length === 0) {
    return engineState
  }

  const nextState: EngineState = {
    committed: [...engineState.committed],
    active: cloneActive(engineState.active),
    undoStack: [...engineState.undoStack, createUndoRecord(engineState)],
    modifierState: cloneModifierState(engineState.modifierState),
  }

  commitActive(nextState)
  nextState.committed.push(...encodeLiteralTextAsJamoIds(text))
  nextState.modifierState = consumeOneShotModifiers(nextState.modifierState)
  return nextState
}

export function applyInputWithModifiers(
  engineState: EngineState,
  inputSymbolId: InputSymbolId,
  transientModifiers?: Partial<Record<ModifierKey, boolean>>,
) {
  return applyInput(
    {
      ...engineState,
      modifierState: mergeModifierStates(engineState.modifierState, transientModifiers),
    },
    inputSymbolId,
  )
}

export function toggleModifier(engineState: EngineState, modifierKey: ModifierKey) {
  const cycle: ModifierMode[] = ['off', 'oneshot', 'locked']
  const current = engineState.modifierState[modifierKey]
  const next = cycle[(cycle.indexOf(current) + 1) % cycle.length]

  return setModifierMode(engineState, modifierKey, next)
}

export function setModifierMode(
  engineState: EngineState,
  modifierKey: ModifierKey,
  nextMode: ModifierMode,
) {
  const siblingModifierMap: Partial<Record<ModifierKey, ModifierKey>> = {
    leftCtrl: 'rightCtrl',
    rightCtrl: 'leftCtrl',
    leftShift: 'rightShift',
    rightShift: 'leftShift',
  }
  const siblingModifier = siblingModifierMap[modifierKey]

  return {
    ...engineState,
    modifierState: {
      ...engineState.modifierState,
      ...(siblingModifier && nextMode !== 'off' ? { [siblingModifier]: 'off' } : {}),
      [modifierKey]: nextMode,
    },
  }
}

export function getRenderedJamoIds(engineState: EngineState) {
  return [...engineState.committed, ...engineState.active.jamoIds]
}
