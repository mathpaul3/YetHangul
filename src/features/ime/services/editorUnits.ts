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

  for (const char of text) {
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

export function deleteUnitRange(
  units: string[],
  start: number,
  end: number,
) {
  return [...units.slice(0, start), ...units.slice(end)]
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
