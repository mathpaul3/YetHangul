import { INPUT_SYMBOL_IDS } from '@/engine/tables/inputSymbolTable'

type BeforeInputParams = {
  data: string | null
  inputType: string
  isComposing: boolean
  compositionActive: boolean
  recentCommittedText: string | null
}

type CompositionEndParams = {
  data: string
  recentCommittedText: string | null
}

type InteropDecision = {
  dispatchText: string | null
  nextRecentCommittedText: string | null
}

type DirectDispatchSuppressionParams = {
  text: string
  recentDirectText: string | null
  recentDirectTimestamp: number | null
  recentDirectSymbolId?: number | null
  normalizeTextToSymbols?: (text: string) => number[]
  now: number
  windowMs?: number
}

function isCompositionInputType(inputType: string) {
  return inputType.includes('Composition') || inputType === 'insertFromComposition'
}

function toCanonicalInputSymbolId(symbolId: number | null | undefined) {
  if (symbolId == null) {
    return null
  }

  switch (symbolId) {
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_GIYEOK:
      return INPUT_SYMBOL_IDS.GIYEOK
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_DIGEUT:
      return INPUT_SYMBOL_IDS.DIGEUT
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_NIEUN:
      return INPUT_SYMBOL_IDS.NIEUN
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_RIEUL:
      return INPUT_SYMBOL_IDS.RIEUL
    case INPUT_SYMBOL_IDS.SHIFT_MIEUM:
      return INPUT_SYMBOL_IDS.MIEUM
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_BIEUP:
      return INPUT_SYMBOL_IDS.BIEUP
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_SIOS:
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SIOS:
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SSANGSIOS:
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SIOS:
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SSANGSIOS:
      return INPUT_SYMBOL_IDS.SIOS
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_IEUNG:
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_OLD_IEUNG:
    case INPUT_SYMBOL_IDS.DIRECT_FINAL_U_11F0:
      return INPUT_SYMBOL_IDS.IEUNG
    case INPUT_SYMBOL_IDS.SSANGCIEUC:
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_CIEUC:
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SSANGCIEUC:
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_CIEUC:
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SSANGCIEUC:
      return INPUT_SYMBOL_IDS.CIEUC
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_BANCHIEUM:
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_CHIEUCH:
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_CHIEUCH:
      return INPUT_SYMBOL_IDS.CHIEUCH
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_THIEUTH:
      return INPUT_SYMBOL_IDS.THIEUTH
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_HIEUH:
    case INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_YEORINHIEUH:
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_YEORINHIEUH:
      return INPUT_SYMBOL_IDS.HIEUH
    case INPUT_SYMBOL_IDS.ARAEA:
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_SSANGARAEA:
      return INPUT_SYMBOL_IDS.A
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_O:
      return INPUT_SYMBOL_IDS.O
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_U:
      return INPUT_SYMBOL_IDS.U
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_EU:
      return INPUT_SYMBOL_IDS.EU
    case INPUT_SYMBOL_IDS.SPECIAL_SHIFT_I:
      return INPUT_SYMBOL_IDS.I
    default:
      return symbolId
  }
}

export function isLineBreakBeforeInput(inputType: string, data: string | null) {
  if (inputType === 'insertParagraph' || inputType === 'insertLineBreak') {
    return true
  }

  return inputType === 'insertText' && (data === '\n' || data === '\r')
}

export function resolveBeforeInputInterop({
  data,
  inputType,
  isComposing,
  compositionActive,
  recentCommittedText,
}: BeforeInputParams): InteropDecision {
  if (isComposing || compositionActive) {
    return {
      dispatchText: null,
      nextRecentCommittedText: recentCommittedText,
    }
  }

  if (!inputType.startsWith('insert') || !data) {
    return {
      dispatchText: null,
      nextRecentCommittedText: recentCommittedText,
    }
  }

  if (recentCommittedText === data && isCompositionInputType(inputType)) {
    return {
      dispatchText: null,
      nextRecentCommittedText: null,
    }
  }

  return {
    dispatchText: data,
    nextRecentCommittedText: isCompositionInputType(inputType) ? data : recentCommittedText,
  }
}

export function resolveCompositionEndInterop({
  data,
  recentCommittedText,
}: CompositionEndParams): InteropDecision {
  if (!data) {
    return {
      dispatchText: null,
      nextRecentCommittedText: recentCommittedText,
    }
  }

  if (recentCommittedText === data) {
    return {
      dispatchText: null,
      nextRecentCommittedText: null,
    }
  }

  return {
    dispatchText: data,
    nextRecentCommittedText: data,
  }
}

export function shouldSuppressInteropTextAfterDirectDispatch({
  text,
  recentDirectText,
  recentDirectTimestamp,
  recentDirectSymbolId = null,
  normalizeTextToSymbols,
  now,
  windowMs = 64,
}: DirectDispatchSuppressionParams) {
  if (!text || recentDirectTimestamp == null) {
    return false
  }

  if (now - recentDirectTimestamp > windowMs) {
    return false
  }

  if (recentDirectText != null && recentDirectText === text) {
    return true
  }

  if (!normalizeTextToSymbols || recentDirectSymbolId == null) {
    return false
  }

  const normalizedSymbols = normalizeTextToSymbols(text)
  if (normalizedSymbols.length !== 1) {
    return false
  }

  return (
    toCanonicalInputSymbolId(normalizedSymbols[0]) ===
    toCanonicalInputSymbolId(recentDirectSymbolId)
  )
}
