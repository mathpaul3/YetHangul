function isInitialJamo(char: string) {
  const codePoint = char.codePointAt(0) ?? 0
  return (
    (codePoint >= 0x1100 && codePoint <= 0x115f) ||
    (codePoint >= 0xa960 && codePoint <= 0xa97c)
  )
}

function isMedialJamo(char: string) {
  const codePoint = char.codePointAt(0) ?? 0
  return (
    (codePoint >= 0x1160 && codePoint <= 0x11a7) ||
    (codePoint >= 0xd7b0 && codePoint <= 0xd7c6)
  )
}

function isFinalJamo(char: string) {
  const codePoint = char.codePointAt(0) ?? 0
  return (
    (codePoint >= 0x11a8 && codePoint <= 0x11ff) ||
    (codePoint >= 0xd7cb && codePoint <= 0xd7fb)
  )
}

function isToneMark(char: string) {
  const codePoint = char.codePointAt(0) ?? 0
  return codePoint === 0x302e || codePoint === 0x302f
}

function isStandaloneUnit(char: string) {
  return char === ' ' || char === '\n' || char === '\t'
}

export function segmentTextToEditorUnits(text: string) {
  const units: string[] = []
  let current = ''
  let currentHasMedial = false
  let currentHasFinal = false
  let currentHasTone = false

  function flush() {
    if (current.length > 0) {
      units.push(current)
      current = ''
      currentHasMedial = false
      currentHasFinal = false
      currentHasTone = false
    }
  }

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]

    if (char === '\r') {
      flush()
      units.push('\n')

      if (text[index + 1] === '\n') {
        index += 1
      }

      continue
    }

    if (isStandaloneUnit(char)) {
      flush()
      units.push(char)
      continue
    }

    if (isInitialJamo(char)) {
      flush()
      current = char
      continue
    }

    if (isMedialJamo(char)) {
      if (current.length === 0) {
        current = char
      } else if (currentHasMedial || currentHasFinal || currentHasTone) {
        flush()
        current = char
      } else {
        current += char
      }
      currentHasMedial = true
      continue
    }

    if (isFinalJamo(char)) {
      if (current.length === 0 || currentHasFinal || currentHasTone) {
        flush()
        current = char
      } else {
        current += char
      }
      currentHasFinal = true
      continue
    }

    if (isToneMark(char)) {
      if (current.length === 0 || currentHasTone) {
        flush()
        current = char
      } else {
        current += char
      }
      currentHasTone = true
      continue
    }

    flush()
    units.push(char)
  }

  flush()
  return units
}

export function insertUnitsAt(
  units: string[],
  index: number,
  inserted: string[],
) {
  return [...units.slice(0, index), ...inserted, ...units.slice(index)]
}

export function commitCompositionUnits(
  units: string[],
  caretIndex: number,
  compositionUnits: string[],
) {
  if (compositionUnits.length === 0) {
    return {
      units,
      caretIndex,
    }
  }

  return {
    units: insertUnitsAt(units, caretIndex, compositionUnits),
    caretIndex: caretIndex + compositionUnits.length,
  }
}

export function deleteUnitRange(
  units: string[],
  start: number,
  end: number,
) {
  return [...units.slice(0, start), ...units.slice(end)]
}

export function replaceSelectionWithUnits(
  units: string[],
  selectionRange: UnitSelectionRange,
  inserted: string[],
) {
  const bounds = normalizeSelectionRangeToDocument(selectionRange, units.length)

  if (bounds == null) {
    return {
      units,
      caretIndex: units.length,
    }
  }

  return {
    units: [...units.slice(0, bounds.start), ...inserted, ...units.slice(bounds.end)],
    caretIndex: bounds.start + inserted.length,
  }
}

export type UnitSelectionRange = {
  start: number
  end: number
} | null

export function createSelectionRange(anchor: number, head: number): UnitSelectionRange {
  if (anchor === head) {
    return null
  }

  return {
    start: Math.min(anchor, head),
    end: Math.max(anchor, head),
  }
}

export function clampCaretIndex(index: number, unitCount: number) {
  return Math.max(0, Math.min(index, unitCount))
}

export function getSelectionBounds(selectionRange: UnitSelectionRange) {
  if (selectionRange == null) {
    return null
  }

  return {
    start: Math.min(selectionRange.start, selectionRange.end),
    end: Math.max(selectionRange.start, selectionRange.end),
  }
}

export function normalizeSelectionRangeToDocument(
  selectionRange: UnitSelectionRange,
  unitCount: number,
) {
  const bounds = getSelectionBounds(selectionRange)

  if (bounds == null) {
    return null
  }

  const start = clampCaretIndex(bounds.start, unitCount)
  const end = clampCaretIndex(bounds.end, unitCount)

  if (start === end) {
    return null
  }

  return {
    start,
    end,
  }
}

export function cancelSelectionGesture(caretIndex: number, unitCount: number) {
  return {
    selectionRange: null as UnitSelectionRange,
    caretIndex: clampCaretIndex(caretIndex, unitCount),
  }
}

export function deleteBackwardUnit(
  units: string[],
  caretIndex: number,
) {
  if (caretIndex <= 0) {
    return {
      units,
      caretIndex,
    }
  }

  return {
    units: deleteUnitRange(units, caretIndex - 1, caretIndex),
    caretIndex: caretIndex - 1,
  }
}

export function deleteForwardUnit(
  units: string[],
  caretIndex: number,
) {
  if (caretIndex >= units.length) {
    return {
      units,
      caretIndex,
    }
  }

  return {
    units: deleteUnitRange(units, caretIndex, caretIndex + 1),
    caretIndex,
  }
}

export function moveCaretBackwardUnit(caretIndex: number, unitCount: number) {
  return clampCaretIndex(caretIndex - 1, unitCount)
}

export function moveCaretForwardUnit(caretIndex: number, unitCount: number) {
  return clampCaretIndex(caretIndex + 1, unitCount)
}

export function getLineStartIndex(
  units: string[],
  caretIndex: number,
) {
  const clampedCaretIndex = clampCaretIndex(caretIndex, units.length)

  for (let index = clampedCaretIndex - 1; index >= 0; index -= 1) {
    if (units[index] === '\n') {
      return index + 1
    }
  }

  return 0
}

export function getLineEndIndex(
  units: string[],
  caretIndex: number,
) {
  const clampedCaretIndex = clampCaretIndex(caretIndex, units.length)

  for (let index = clampedCaretIndex; index < units.length; index += 1) {
    if (units[index] === '\n') {
      return index
    }
  }

  return units.length
}
