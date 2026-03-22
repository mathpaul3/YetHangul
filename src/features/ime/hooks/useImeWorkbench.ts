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
  resolveBeforeInputInterop,
  resolveCompositionEndInterop,
} from '@/features/ime/services/inputInterop'
import type { PressedModifierState } from '@/features/ime/services/hardwareKeyboard'
import {
  clampCaretIndex,
  createSelectionRange,
  deleteUnitRange,
  insertUnitsAt,
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
  const compositionActiveRef = useRef(false)
  const recentImeCommitRef = useRef<string | null>(null)
  const selectionAnchorRef = useRef<number | null>(null)
  const isDraggingSelectionRef = useRef(false)
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
    if (selectionRange == null && typeof window !== 'undefined') {
      window.getSelection()?.removeAllRanges()
    }
  }, [selectionRange])

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

  function handleInput(symbolId: number) {
    if (selectionRange) {
      deleteSelection()
    }
    dispatch({ type: 'input', symbolId })
  }

  function handleLiteralInput(text: string) {
    if (selectionRange) {
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

  function commitCompositionToDocument() {
    if (compositionUnits.length === 0) {
      return
    }

    setDocumentUnits((previous) => insertUnitsAt(previous, caretIndex, compositionUnits))
    setCaretIndex((previous) => previous + compositionUnits.length)
    selectionAnchorRef.current = null
    clearCompositionBuffer()
  }

  function collapseSelectionTo(index: number) {
    selectionAnchorRef.current = null
    setSelectionRange(null)
    setCaretIndex(index)
    clearBrowserSelection()
  }

  function deleteSelection() {
    if (!selectionRange) {
      return
    }

    const start = Math.min(selectionRange.start, selectionRange.end)
    const end = Math.max(selectionRange.start, selectionRange.end)

    setDocumentUnits((previous) => deleteUnitRange(previous, start, end))
    setSelectionRange(null)
    setCaretIndex(start)
    selectionAnchorRef.current = null
    clearBrowserSelection()
  }

  function extendSelectionTo(nextCaretIndex: number) {
    const anchor = selectionAnchorRef.current ?? caretIndex
    selectionAnchorRef.current = anchor
    setCaretIndex(nextCaretIndex)
    setSelectionRange(createSelectionRange(anchor, nextCaretIndex))
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
  }

  function dispatchUnicodeText(text: string) {
    if (selectionRange) {
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
    if (!selectionRange) {
      return
    }

    const start = Math.min(selectionRange.start, selectionRange.end)
    const end = Math.max(selectionRange.start, selectionRange.end)
    const text = renderedUnits.slice(start, end).join('')

    event.preventDefault()
    event.clipboardData.setData('text/plain', text)
  }

  async function copyAllText() {
    await navigator.clipboard.writeText(renderedText)
  }

  async function copySelectionText() {
    if (!selectionRange) {
      return
    }

    const start = Math.min(selectionRange.start, selectionRange.end)
    const end = Math.max(selectionRange.start, selectionRange.end)
    await navigator.clipboard.writeText(renderedUnits.slice(start, end).join(''))
  }

  function handleUtilityInput(utilityKey: 'space' | 'period' | 'semicolon') {
    if (selectionRange) {
      deleteSelection()
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

    if (nativeEvent.inputType === 'insertParagraph') {
      event.preventDefault()
      dispatch({ type: 'literalInput', text: '\n' })
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
      const didCommitComposition = compositionUnits.length > 0
      const currentIndex = didCommitComposition ? renderedCaretIndex : caretIndex
      const unitCount = didCommitComposition ? renderedUnits.length : documentUnits.length
      commitCompositionToDocument()

      if (event.shiftKey) {
        extendSelectionTo(clampCaretIndex(currentIndex - 1, unitCount))
        return
      }

      if (selectionRange) {
        collapseSelectionTo(Math.min(selectionRange.start, selectionRange.end))
        return
      }

      setCaretIndex(clampCaretIndex(currentIndex - 1, unitCount))
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      const didCommitComposition = compositionUnits.length > 0
      const currentIndex = didCommitComposition ? renderedCaretIndex : caretIndex
      const unitCount = didCommitComposition ? renderedUnits.length : documentUnits.length
      commitCompositionToDocument()

      if (event.shiftKey) {
        extendSelectionTo(clampCaretIndex(currentIndex + 1, unitCount))
        return
      }

      if (selectionRange) {
        collapseSelectionTo(Math.max(selectionRange.start, selectionRange.end))
        return
      }

      setCaretIndex(clampCaretIndex(currentIndex + 1, unitCount))
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      commitCompositionToDocument()
      if (event.shiftKey) {
        extendSelectionTo(0)
      } else {
        collapseSelectionTo(0)
      }
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      commitCompositionToDocument()
      if (event.shiftKey) {
        extendSelectionTo(documentUnits.length)
      } else {
        collapseSelectionTo(documentUnits.length)
      }
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (selectionRange) {
        deleteSelection()
      }
      dispatch({ type: 'literalInput', text: '\n' })
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

    if ((symbolId === INPUT_SYMBOL_IDS.BACKSPACE || event.key === 'Delete') && selectionRange) {
      event.preventDefault()
      commitCompositionToDocument()
      deleteSelection()
      return
    }

    if (
      symbolId === INPUT_SYMBOL_IDS.BACKSPACE &&
      compositionUnits.length === 0 &&
      !selectionRange
    ) {
      if (caretIndex > 0) {
        event.preventDefault()
        setDocumentUnits((previous) => deleteUnitRange(previous, caretIndex - 1, caretIndex))
        setCaretIndex((previous) => previous - 1)
      }
      return
    }

    if (event.key === 'Delete' && compositionUnits.length === 0 && !selectionRange) {
      if (caretIndex < documentUnits.length) {
        event.preventDefault()
        setDocumentUnits((previous) => deleteUnitRange(previous, caretIndex, caretIndex + 1))
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

  function handleCaretPlacement(nextIndex: number) {
    commitCompositionToDocument()
    setSelectionRange(null)
    setCaretIndex(nextIndex)
    selectionAnchorRef.current = null
    clearBrowserSelection()
  }

  function handleSelectionStart(unitIndex: number) {
    commitCompositionToDocument()
    isDraggingSelectionRef.current = true
    selectionAnchorRef.current = unitIndex
    setSelectionRange({ start: unitIndex, end: unitIndex + 1 })
    setCaretIndex(unitIndex + 1)
  }

  function handleSelectionEnter(unitIndex: number) {
    if (!isDraggingSelectionRef.current || selectionAnchorRef.current == null) {
      return
    }

    const anchor = selectionAnchorRef.current
    setSelectionRange({
      start: Math.min(anchor, unitIndex),
      end: Math.max(anchor + 1, unitIndex + 1),
    })
  }

  function handleSelectionEnd() {
    if (!isDraggingSelectionRef.current) {
      return
    }

    isDraggingSelectionRef.current = false
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
    handleLiteralInput,
    handleUtilityInput,
    handleModifierMainClick,
    handleCaretPlacement,
    handleSelectionStart,
    handleSelectionEnter,
    handleSelectionEnd,
    handleKeyDown,
    handleKeyUp,
    handlePaste,
    handleCopy,
    copyAllText,
    copySelectionText,
    handleBeforeInput,
    handleCompositionStart,
    handleCompositionEnd,
  }
}
