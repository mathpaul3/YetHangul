import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  applyContextualFiller,
  applyInput,
  applyLiteralInput,
  applyInputWithModifiers,
  getRenderedJamoIds,
  setModifierMode,
} from '@/engine/core/engine'
import { createInitialEngineState } from '@/engine/core/state'
import { normalizeUnicodeToInputSymbols } from '@/engine/mapper/inputMapper'
import type { ModifierKey, ModifierMode } from '@/engine/core/types'
import { jamoIdsToUnicode } from '@/engine/mapper/unicodeMapper'
import { INPUT_SYMBOL_IDS } from '@/engine/tables/inputSymbolTable'
import {
  resolveInputSymbolFromKeyboardEvent,
  resolveVisualKeyLabelFromKeyboardEvent,
  resolveTransientModifiersFromKeyboardEvent,
} from '@/features/ime/services/hardwareKeyboard'
import {
  isLineBreakBeforeInput,
  resolveBeforeInputInterop,
  resolveCompositionEndInterop,
} from '@/features/ime/services/inputInterop'
import type { PressedModifierState } from '@/features/ime/services/hardwareKeyboard'
import {
  clampCaretIndex,
  commitCompositionUnits,
  createSelectionRange,
  deleteBackwardUnit,
  deleteForwardUnit,
  getSelectionBounds,
  getLineEndIndex,
  getLineStartIndex,
  insertUnitsAt,
  moveCaretBackwardUnit,
  moveCaretForwardUnit,
  normalizeSelectionRangeToDocument,
  replaceSelectionWithUnits,
  segmentTextToEditorUnits,
} from '@/features/ime/services/editorUnits'

type Action =
  | { type: 'input'; symbolId: number }
  | { type: 'literalInput'; text: string }
  | { type: 'contextualFiller' }
  | {
      type: 'inputWithModifiers'
      symbolId: number
      transientModifiers: Partial<Record<ModifierKey, boolean>>
    }
  | { type: 'setModifierMode'; modifierKey: ModifierKey; mode: ModifierMode }
  | { type: 'resetBuffer' }

function reducer(state: ReturnType<typeof createInitialEngineState>, action: Action) {
  switch (action.type) {
    case 'input':
      return applyInput(state, action.symbolId)
    case 'literalInput':
      return applyLiteralInput(state, action.text)
    case 'contextualFiller':
      return applyContextualFiller(state)
    case 'inputWithModifiers':
      return applyInputWithModifiers(
        state,
        action.symbolId,
        action.transientModifiers,
      )
    case 'setModifierMode':
      return setModifierMode(state, action.modifierKey, action.mode)
    case 'resetBuffer':
      return {
        ...createInitialEngineState(),
        modifierState: state.modifierState,
      }
  }
}

type SelectionRange = {
  start: number
  end: number
} | null

export function useImeWorkbench() {
  const [engineState, dispatch] = useReducer(reducer, undefined, createInitialEngineState)
  const [hardwareModifierState, setHardwareModifierState] = useState<PressedModifierState>({})
  const [pressedVisualKeys, setPressedVisualKeys] = useState<Record<string, boolean>>({})
  const [documentUnits, setDocumentUnits] = useState<string[]>([])
  const [caretIndex, setCaretIndex] = useState(0)
  const [selectionRange, setSelectionRange] = useState<SelectionRange>(null)
  const pressedModifiersRef = useRef<PressedModifierState>({})
  const documentUnitsRef = useRef<string[]>([])
  const caretIndexRef = useRef(0)
  const selectionRangeRef = useRef<SelectionRange>(null)
  const compositionActiveRef = useRef(false)
  const recentImeCommitRef = useRef<string | null>(null)
  const virtualKeyTimeoutsRef = useRef<Record<string, number>>({})
  const backspaceRepeatTimeoutRef = useRef<number | null>(null)
  const backspaceRepeatIntervalRef = useRef<number | null>(null)
  const selectionAnchorRef = useRef<number | null>(null)
  const isDraggingSelectionRef = useRef(false)
  const didMoveSelectionRef = useRef(false)
  const dragStartUnitIndexRef = useRef<number | null>(null)
  const compositionText = useMemo(
    () => jamoIdsToUnicode(getRenderedJamoIds(engineState)),
    [engineState],
  )
  const compositionUnits = useMemo(
    () => segmentTextToEditorUnits(compositionText),
    [compositionText],
  )
  const renderedUnits = useMemo(
    () => insertUnitsAt(documentUnits, caretIndex, compositionUnits),
    [caretIndex, compositionUnits, documentUnits],
  )
  const renderedCaretIndex = useMemo(
    () => caretIndex + compositionUnits.length,
    [caretIndex, compositionUnits.length],
  )
  const renderedText = useMemo(() => renderedUnits.join(''), [renderedUnits])

  useEffect(() => {
    documentUnitsRef.current = documentUnits
    const nextCaretIndex = clampCaretIndex(caretIndexRef.current, documentUnits.length)
    if (nextCaretIndex !== caretIndexRef.current) {
      caretIndexRef.current = nextCaretIndex
      setCaretIndex(nextCaretIndex)
    }

    const nextSelectionRange = normalizeSelectionRangeToDocument(
      selectionRangeRef.current,
      documentUnits.length,
    )

    if (nextSelectionRange !== selectionRangeRef.current) {
      selectionRangeRef.current = nextSelectionRange
      setSelectionRange(nextSelectionRange)
    }
  }, [documentUnits])

  useEffect(() => {
    caretIndexRef.current = caretIndex
  }, [caretIndex])

  useEffect(() => {
    selectionRangeRef.current = selectionRange
  }, [selectionRange])

  useEffect(() => {
    if (selectionRange == null && typeof window !== 'undefined') {
      window.getSelection()?.removeAllRanges()
    }
  }, [selectionRange])

  function resetHardwareInteractionState() {
    pressedModifiersRef.current = {}
    setHardwareModifierState({})
    setPressedVisualKeys({})
    isDraggingSelectionRef.current = false
    didMoveSelectionRef.current = false
    dragStartUnitIndexRef.current = null
    compositionActiveRef.current = false
    recentImeCommitRef.current = null
  }

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') {
        resetHardwareInteractionState()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (typeof window === 'undefined') {
        return
      }

      for (const timeoutId of Object.values(virtualKeyTimeoutsRef.current)) {
        window.clearTimeout(timeoutId)
      }

      if (backspaceRepeatTimeoutRef.current != null) {
        window.clearTimeout(backspaceRepeatTimeoutRef.current)
      }

      if (backspaceRepeatIntervalRef.current != null) {
        window.clearInterval(backspaceRepeatIntervalRef.current)
      }
    }
  }, [])

  function setHardwareModifier(modifierKey: ModifierKey, pressed: boolean) {
    pressedModifiersRef.current[modifierKey] = pressed

    setHardwareModifierState((previous) => {
      if (previous[modifierKey] === pressed) {
        return previous
      }

      return {
        ...previous,
        [modifierKey]: pressed,
      }
    })
  }

  function setPressedVisualKey(key: string, pressed: boolean) {
    setPressedVisualKeys((previous) => {
      if (previous[key] === pressed) {
        return previous
      }

      return {
        ...previous,
        [key]: pressed,
      }
    })
  }

  function flashVirtualKey(label: string) {
    if (typeof window === 'undefined') {
      return
    }

    setPressedVisualKey(label, true)

    const existingTimeout = virtualKeyTimeoutsRef.current[label]
    if (existingTimeout) {
      window.clearTimeout(existingTimeout)
    }

    virtualKeyTimeoutsRef.current[label] = window.setTimeout(() => {
      setPressedVisualKey(label, false)
      delete virtualKeyTimeoutsRef.current[label]
    }, 110)
  }

  function handleInput(symbolId: number, visualKeyLabel?: string) {
    if (visualKeyLabel) {
      flashVirtualKey(visualKeyLabel)
    }

    if (symbolId === INPUT_SYMBOL_IDS.BACKSPACE) {
      if (handleEditorBackspace()) {
        return
      }
    }

    commitCompositionToDocument()

    if (selectionRangeRef.current) {
      deleteSelection()
    }
    dispatch({ type: 'input', symbolId })
  }

  function handleEditorBackspace() {
    if (selectionRangeRef.current) {
      commitCompositionToDocument()
      deleteSelection()
      return true
    }

    if (compositionUnits.length === 0) {
      const nextState = deleteBackwardUnit(documentUnitsRef.current, caretIndexRef.current)

      if (
        nextState.units !== documentUnitsRef.current ||
        nextState.caretIndex !== caretIndexRef.current
      ) {
        documentUnitsRef.current = nextState.units
        caretIndexRef.current = nextState.caretIndex
        setDocumentUnits(nextState.units)
        setCaretIndex(nextState.caretIndex)
      }
      return true
    }

    return false
  }

  function handleEditorDelete() {
    if (selectionRangeRef.current) {
      commitCompositionToDocument()
      deleteSelection()
      return
    }

    if (compositionUnits.length === 0 && caretIndexRef.current < documentUnitsRef.current.length) {
      const nextState = deleteForwardUnit(documentUnitsRef.current, caretIndexRef.current)
      documentUnitsRef.current = nextState.units
      caretIndexRef.current = nextState.caretIndex
      setDocumentUnits(nextState.units)
      setCaretIndex(nextState.caretIndex)
    }
  }

  function clearBackspaceRepeat() {
    if (typeof window === 'undefined') {
      return
    }

    if (backspaceRepeatTimeoutRef.current != null) {
      window.clearTimeout(backspaceRepeatTimeoutRef.current)
      backspaceRepeatTimeoutRef.current = null
    }

    if (backspaceRepeatIntervalRef.current != null) {
      window.clearInterval(backspaceRepeatIntervalRef.current)
      backspaceRepeatIntervalRef.current = null
    }
  }

  function handleVirtualBackspacePointerDown() {
    if (typeof window === 'undefined') {
      handleInput(INPUT_SYMBOL_IDS.BACKSPACE, 'Backspace')
      return
    }

    clearBackspaceRepeat()
    handleInput(INPUT_SYMBOL_IDS.BACKSPACE, 'Backspace')

    backspaceRepeatTimeoutRef.current = window.setTimeout(() => {
      handleInput(INPUT_SYMBOL_IDS.BACKSPACE, 'Backspace')
      backspaceRepeatIntervalRef.current = window.setInterval(() => {
        handleInput(INPUT_SYMBOL_IDS.BACKSPACE, 'Backspace')
      }, 60)
    }, 320)
  }

  function handleLiteralInput(text: string, visualKeyLabel?: string) {
    if (visualKeyLabel) {
      flashVirtualKey(visualKeyLabel)
    }

    commitCompositionToDocument()

    if (selectionRangeRef.current) {
      deleteSelection()
    }
    dispatch({ type: 'literalInput', text })
  }

  function clearCompositionBuffer() {
    dispatch({ type: 'resetBuffer' })
  }

  function clearBrowserSelection() {
    if (typeof window === 'undefined') {
      return
    }

    window.getSelection()?.removeAllRanges()
  }

  function commitCompositionToDocument(targetCaretIndex = caretIndexRef.current) {
    const snapshotUnits = documentUnitsRef.current
    const nextState = commitCompositionUnits(snapshotUnits, targetCaretIndex, compositionUnits)

    if (nextState.units === snapshotUnits) {
      return {
        didCommit: false,
        caretIndex: targetCaretIndex,
        unitCount: snapshotUnits.length,
      }
    }

    documentUnitsRef.current = nextState.units
    caretIndexRef.current = nextState.caretIndex
    setDocumentUnits(nextState.units)
    setCaretIndex(nextState.caretIndex)
    selectionAnchorRef.current = null
    clearCompositionBuffer()

    return {
      didCommit: true,
      caretIndex: nextState.caretIndex,
      unitCount: nextState.units.length,
    }
  }

  function collapseSelectionTo(index: number) {
    const nextIndex = clampCaretIndex(index, documentUnitsRef.current.length)
    selectionAnchorRef.current = null
    selectionRangeRef.current = null
    caretIndexRef.current = nextIndex
    setSelectionRange(null)
    setCaretIndex(nextIndex)
    clearBrowserSelection()
  }

  function deleteSelection() {
    commitCompositionToDocument()

    const bounds = getSelectionBounds(selectionRangeRef.current)

    if (!bounds) {
      return
    }

    const nextState = replaceSelectionWithUnits(documentUnitsRef.current, selectionRangeRef.current, [])
    documentUnitsRef.current = nextState.units
    selectionRangeRef.current = null
    caretIndexRef.current = nextState.caretIndex
    setDocumentUnits(nextState.units)
    setSelectionRange(null)
    setCaretIndex(nextState.caretIndex)
    selectionAnchorRef.current = null
    clearBrowserSelection()
  }

  function extendSelectionTo(nextCaretIndex: number) {
    const anchor = selectionAnchorRef.current ?? caretIndexRef.current
    const clampedCaretIndex = clampCaretIndex(nextCaretIndex, documentUnitsRef.current.length)
    selectionAnchorRef.current = anchor
    setCaretIndex(clampedCaretIndex)
    setSelectionRange(createSelectionRange(anchor, clampedCaretIndex))
    clearBrowserSelection()
  }

  function handleModifierMainClick(modifierKey: ModifierKey) {
    const currentMode = engineState.modifierState[modifierKey]
    const nextMode =
      currentMode === 'off'
        ? 'oneshot'
        : currentMode === 'oneshot'
          ? 'locked'
          : 'off'

    dispatch({
      type: 'setModifierMode',
      modifierKey,
      mode: nextMode,
    })

    const labelMap: Record<ModifierKey, string> = {
      leftCtrl: 'L Ctrl',
      rightCtrl: 'R Ctrl',
      leftShift: 'L Shift',
      rightShift: 'R Shift',
    }

    flashVirtualKey(labelMap[modifierKey])
  }

  function dispatchUnicodeText(text: string) {
    commitCompositionToDocument()

    if (selectionRangeRef.current) {
      deleteSelection()
    }

    for (const char of text) {
      const symbols = normalizeUnicodeToInputSymbols(char)

      if (symbols.length > 0) {
        for (const symbolId of symbols) {
          dispatch({ type: 'input', symbolId })
        }
        continue
      }

      dispatch({ type: 'literalInput', text: char })
    }
  }

  function handleCopy(event: React.ClipboardEvent<HTMLElement>) {
    const bounds = getSelectionBounds(selectionRangeRef.current)

    if (!bounds) {
      return
    }
    const text = renderedUnits.slice(bounds.start, bounds.end).join('')

    event.preventDefault()
    event.clipboardData.setData('text/plain', text)
  }

  async function copyAllText() {
    await navigator.clipboard.writeText(renderedText)
  }

  async function copySelectionText() {
    const bounds = getSelectionBounds(selectionRangeRef.current)

    if (!bounds) {
      return
    }

    await navigator.clipboard.writeText(renderedUnits.slice(bounds.start, bounds.end).join(''))
  }

  function handleUtilityInput(utilityKey: 'space' | 'period' | 'semicolon' | 'enter') {
    const utilityLabelMap = {
      space: 'Space',
      period: '.',
      semicolon: ';',
      enter: 'Enter',
    } as const

    flashVirtualKey(utilityLabelMap[utilityKey])

    commitCompositionToDocument()

    if (selectionRangeRef.current) {
      deleteSelection()
    }

    if (utilityKey === 'enter') {
      dispatch({ type: 'literalInput', text: '\n' })
      return
    }

    const ctrlActive =
      engineState.modifierState.leftCtrl !== 'off' ||
      engineState.modifierState.rightCtrl !== 'off' ||
      hardwareModifierState.leftCtrl === true ||
      hardwareModifierState.rightCtrl === true

    if (utilityKey === 'space') {
      if (!ctrlActive) {
        dispatch({ type: 'input', symbolId: INPUT_SYMBOL_IDS.SPACE })
        return
      }

      dispatch({ type: 'contextualFiller' })
      return
    }

    if (!ctrlActive) {
      return
    }

    dispatch({
      type: 'input',
      symbolId:
        utilityKey === 'period'
          ? INPUT_SYMBOL_IDS.TONE_SINGLE
          : INPUT_SYMBOL_IDS.TONE_DOUBLE,
    })
  }

  function isShiftActive() {
    return (
      engineState.modifierState.leftShift !== 'off' ||
      engineState.modifierState.rightShift !== 'off' ||
      hardwareModifierState.leftShift === true ||
      hardwareModifierState.rightShift === true
    )
  }

  function handleNavigationInput(direction: 'arrowLeft' | 'arrowRight' | 'home' | 'end') {
    const utilityLabelMap = {
      arrowLeft: '←',
      arrowRight: '→',
      home: 'Home',
      end: 'End',
    } as const

    flashVirtualKey(utilityLabelMap[direction])
    commitCompositionToDocument()

    const flushState = {
      caretIndex: caretIndexRef.current,
      unitCount: documentUnitsRef.current.length,
    }

    if (direction === 'arrowLeft' || direction === 'arrowRight') {
      if (!isShiftActive()) {
        const bounds = getSelectionBounds(selectionRangeRef.current)

        if (bounds) {
          collapseSelectionTo(direction === 'arrowLeft' ? bounds.start : bounds.end)
          return
        }
      }

      const nextCaretIndex =
        direction === 'arrowLeft'
          ? moveCaretBackwardUnit(flushState.caretIndex, flushState.unitCount)
          : moveCaretForwardUnit(flushState.caretIndex, flushState.unitCount)

      if (isShiftActive()) {
        extendSelectionTo(nextCaretIndex)
        return
      }

      collapseSelectionTo(nextCaretIndex)
      return
    }

    const targetIndex =
      direction === 'home'
        ? getLineStartIndex(documentUnitsRef.current, flushState.caretIndex)
        : getLineEndIndex(documentUnitsRef.current, flushState.caretIndex)

    if (isShiftActive()) {
      extendSelectionTo(targetIndex)
      return
    }

    collapseSelectionTo(targetIndex)
  }

  function handlePaste(event: React.ClipboardEvent<HTMLElement>) {
    const text = event.clipboardData.getData('text/plain')
    const hasSupportedChars = [...text].some((char) => normalizeUnicodeToInputSymbols(char).length > 0)

    if (!hasSupportedChars && text.length === 0) {
      return
    }

    event.preventDefault()
    dispatchUnicodeText(text)
  }

  function handleBeforeInput(event: React.FormEvent<HTMLElement>) {
    const nativeEvent = event.nativeEvent as InputEvent

    if (isLineBreakBeforeInput(nativeEvent.inputType, nativeEvent.data)) {
      event.preventDefault()
      handleLiteralInput('\n')
      return
    }

    if (nativeEvent.inputType === 'deleteContentBackward') {
      event.preventDefault()
      handleEditorBackspace()
      return
    }

    if (nativeEvent.inputType === 'deleteContentForward') {
      event.preventDefault()
      handleEditorDelete()
      return
    }

    const decision = resolveBeforeInputInterop({
      data: nativeEvent.data,
      inputType: nativeEvent.inputType,
      isComposing: nativeEvent.isComposing,
      compositionActive: compositionActiveRef.current,
      recentCommittedText: recentImeCommitRef.current,
    })

    recentImeCommitRef.current = decision.nextRecentCommittedText

    if (!decision.dispatchText) {
      return
    }

    event.preventDefault()
    dispatchUnicodeText(decision.dispatchText)
  }

  function handleCompositionStart() {
    compositionActiveRef.current = true
  }

  function handleCompositionEnd(event: React.CompositionEvent<HTMLElement>) {
    compositionActiveRef.current = false
    const decision = resolveCompositionEndInterop({
      data: event.data,
      recentCommittedText: recentImeCommitRef.current,
    })

    recentImeCommitRef.current = decision.nextRecentCommittedText

    if (!decision.dispatchText) {
      return
    }

    event.preventDefault()
    dispatchUnicodeText(decision.dispatchText)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    const visualKeyLabel = resolveVisualKeyLabelFromKeyboardEvent(event.nativeEvent)

    if (visualKeyLabel) {
      setPressedVisualKey(visualKeyLabel, true)
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      handleNavigationInput('arrowLeft')
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      handleNavigationInput('arrowRight')
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      handleNavigationInput('home')
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      handleNavigationInput('end')
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      handleLiteralInput('\n')
      return
    }

    if (event.key === 'Control') {
      if (event.nativeEvent.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT) {
        setHardwareModifier('leftCtrl', true)
      }

      if (event.nativeEvent.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
        setHardwareModifier('rightCtrl', true)
      }

      return
    }

    if (event.key === 'Shift') {
      if (event.nativeEvent.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT) {
        setHardwareModifier('leftShift', true)
      }

      if (event.nativeEvent.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
        setHardwareModifier('rightShift', true)
      }

      return
    }

    const symbolId = resolveInputSymbolFromKeyboardEvent(event.nativeEvent)

    if (symbolId == null) {
      if (
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        !compositionActiveRef.current &&
        event.key.length === 1
      ) {
        event.preventDefault()
        dispatch({ type: 'literalInput', text: event.key })
      }
      return
    }

    if ((symbolId === INPUT_SYMBOL_IDS.BACKSPACE || event.key === 'Delete') && selectionRangeRef.current) {
      event.preventDefault()
      commitCompositionToDocument()
      deleteSelection()
      return
    }

    if (
      symbolId === INPUT_SYMBOL_IDS.BACKSPACE &&
      compositionUnits.length === 0 &&
      !selectionRangeRef.current
    ) {
      if (caretIndexRef.current > 0) {
        event.preventDefault()
        handleEditorBackspace()
      }
      return
    }

    if (event.key === 'Delete' && compositionUnits.length === 0 && !selectionRangeRef.current) {
      if (caretIndexRef.current < documentUnitsRef.current.length) {
        event.preventDefault()
        handleEditorDelete()
      }
      return
    }

    event.preventDefault()

    if (event.nativeEvent.ctrlKey && event.key === ' ') {
      dispatch({ type: 'contextualFiller' })
      return
    }

    dispatch({
      type: 'inputWithModifiers',
      symbolId,
      transientModifiers: resolveTransientModifiersFromKeyboardEvent(
        event.nativeEvent,
        pressedModifiersRef.current,
      ),
    })
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLElement>) {
    const visualKeyLabel = resolveVisualKeyLabelFromKeyboardEvent(event.nativeEvent)

    if (visualKeyLabel) {
      setPressedVisualKey(visualKeyLabel, false)
    }

    if (event.key === 'Control') {
      if (event.nativeEvent.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT) {
        setHardwareModifier('leftCtrl', false)
      }

      if (event.nativeEvent.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
        setHardwareModifier('rightCtrl', false)
      }
    }

    if (event.key === 'Shift') {
      if (event.nativeEvent.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT) {
        setHardwareModifier('leftShift', false)
      }

      if (event.nativeEvent.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
        setHardwareModifier('rightShift', false)
      }
    }
  }

  function handleEditorBlur(event: React.FocusEvent<HTMLElement>) {
    const nextFocusedTarget = event.relatedTarget

    if (nextFocusedTarget instanceof Node && event.currentTarget.contains(nextFocusedTarget)) {
      return
    }

    commitCompositionToDocument()
    resetHardwareInteractionState()
    clearBrowserSelection()
  }

  function handleEditorFocus() {
    clearBrowserSelection()
  }

  function handleCaretPlacement(nextIndex: number) {
    commitCompositionToDocument()
    const clampedIndex = clampCaretIndex(nextIndex, documentUnitsRef.current.length)
    selectionRangeRef.current = null
    caretIndexRef.current = clampedIndex
    setSelectionRange(null)
    setCaretIndex(clampedIndex)
    selectionAnchorRef.current = null
    clearBrowserSelection()
  }

  function handleSelectionStart(unitIndex: number) {
    commitCompositionToDocument()
    const clampedIndex = clampCaretIndex(unitIndex + 1, documentUnitsRef.current.length)
    isDraggingSelectionRef.current = true
    didMoveSelectionRef.current = false
    dragStartUnitIndexRef.current = unitIndex
    selectionAnchorRef.current = unitIndex
    selectionRangeRef.current = null
    caretIndexRef.current = clampedIndex
    setSelectionRange(null)
    setCaretIndex(clampedIndex)
    clearBrowserSelection()
  }

  function handleSelectionEnter(unitIndex: number) {
    if (!isDraggingSelectionRef.current || selectionAnchorRef.current == null) {
      return
    }

    const anchor = selectionAnchorRef.current
    didMoveSelectionRef.current = true
    const clampedIndex = clampCaretIndex(unitIndex + 1, documentUnitsRef.current.length)
    selectionRangeRef.current = {
      start: Math.min(anchor, unitIndex),
      end: Math.max(anchor + 1, clampedIndex),
    }
    caretIndexRef.current = clampedIndex
    setSelectionRange({
      start: Math.min(anchor, unitIndex),
      end: Math.max(anchor + 1, clampedIndex),
    })
    setCaretIndex(clampedIndex)
    clearBrowserSelection()
  }

  function handleSelectionEnd() {
    if (!isDraggingSelectionRef.current) {
      return
    }

    isDraggingSelectionRef.current = false
    if (!didMoveSelectionRef.current && dragStartUnitIndexRef.current != null) {
      collapseSelectionTo(dragStartUnitIndexRef.current + 1)
    }

    didMoveSelectionRef.current = false
    dragStartUnitIndexRef.current = null
    selectionAnchorRef.current = null
  }

  return {
    caretIndex,
    selectionRange,
    renderedUnits,
    renderedCaretIndex,
    engineState,
    hardwareModifierState,
    pressedVisualKeys,
    renderedText,
    handleInput,
    handleVirtualBackspacePointerDown,
    clearBackspaceRepeat,
    handleLiteralInput,
    handleUtilityInput,
    handleNavigationInput,
    handleModifierMainClick,
    handleCaretPlacement,
    handleSelectionStart,
    handleSelectionEnter,
    handleSelectionEnd,
    handleKeyDown,
    handleKeyUp,
    handleEditorFocus,
    handleEditorBlur,
    handlePaste,
    handleCopy,
    copyAllText,
    copySelectionText,
    handleBeforeInput,
    handleCompositionStart,
    handleCompositionEnd,
  }
}
