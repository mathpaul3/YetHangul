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

function isCompositionInputType(inputType: string) {
  return inputType.includes('Composition') || inputType === 'insertFromComposition'
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
