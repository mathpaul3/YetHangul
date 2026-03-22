import { describe, expect, it } from 'vitest'
import {
  clampCaretIndex,
  commitCompositionUnits,
  createSelectionRange,
  deleteBackwardUnit,
  deleteForwardUnit,
  deleteUnitRange,
  getLineEndIndex,
  getLineStartIndex,
  getSelectionBounds,
  insertUnitsAt,
  normalizeSelectionRangeToDocument,
  replaceSelectionWithUnits,
  segmentTextToEditorUnits,
} from '@/features/ime/services/editorUnits'

function serializeUnits(units: string[], selectionRange: { start: number; end: number } | null) {
  const bounds = getSelectionBounds(selectionRange)

  if (!bounds) {
    return ''
  }

  return units.slice(bounds.start, bounds.end).join('')
}

describe('editorUnits', () => {
  it('segments jamo text into syllable-like editor units', () => {
    expect(segmentTextToEditorUnits('간ᅟᅡ\nA')).toEqual(['간', 'ᅟᅡ', '\n', 'A'])
  })

  it('normalizes CRLF and lone carriage returns into newline editor units', () => {
    expect(segmentTextToEditorUnits('A\r\nB\rC')).toEqual(['A', '\n', 'B', '\n', 'C'])
  })

  it('keeps pasted CRLF text stable across selection replacement and follow-up deletion', () => {
    const units = segmentTextToEditorUnits('가\r\n나')

    expect(units).toEqual(['가', '\n', '나'])

    const replaced = replaceSelectionWithUnits(units, { start: 0, end: 2 }, ['하'])

    expect(replaced).toEqual({
      units: ['하', '나'],
      caretIndex: 1,
    })

    expect(deleteForwardUnit(replaced.units, replaced.caretIndex)).toEqual({
      units: ['하'],
      caretIndex: 1,
    })
  })

  it('serializes the same selection consistently before and after a blur/focus round trip', () => {
    const units = segmentTextToEditorUnits('가\n나')
    const selection = createSelectionRange(0, 2)

    expect(serializeUnits(units, selection)).toBe('가\n')

    const blurredAndFocusedSelection = createSelectionRange(0, 2)

    expect(serializeUnits(units, blurredAndFocusedSelection)).toBe('가\n')
  })

  it('keeps repeated copy flows stable across blur and focus transitions', () => {
    const units = segmentTextToEditorUnits('가\n나\n다')
    const firstSelection = createSelectionRange(0, 3)
    const firstCopy = serializeUnits(units, firstSelection)

    expect(firstCopy).toBe('가\n나')

    const blurredSelection = createSelectionRange(0, 3)
    const secondCopy = serializeUnits(units, blurredSelection)

    expect(secondCopy).toBe(firstCopy)
  })

  it('inserts units at a caret position', () => {
    expect(insertUnitsAt(['가', '나'], 1, ['다'])).toEqual(['가', '다', '나'])
  })

  it('commits composition units into the document and advances the caret', () => {
    expect(commitCompositionUnits(['가', '나'], 1, ['다'])).toEqual({
      units: ['가', '다', '나'],
      caretIndex: 2,
    })
  })

  it('deletes a unit range', () => {
    expect(deleteUnitRange(['가', '나', '다'], 1, 2)).toEqual(['가', '다'])
  })

  it('replaces the selected range with inserted units', () => {
    expect(
      replaceSelectionWithUnits(['가', '\n', '나'], { start: 0, end: 2 }, ['다']),
    ).toEqual({
      units: ['다', '나'],
      caretIndex: 1,
    })
  })

  it('replaces selections that cross a newline boundary without breaking unit order', () => {
    expect(
      replaceSelectionWithUnits(['가', '\n', '나', '다'], { start: 1, end: 3 }, ['하']),
    ).toEqual({
      units: ['가', '하', '다'],
      caretIndex: 2,
    })
  })

  it('replaces a selection across a newline and keeps follow-up caret movement stable', () => {
    const replaced = replaceSelectionWithUnits(
      ['가', '\n', '나', '다'],
      { start: 1, end: 3 },
      ['마'],
    )

    expect(replaced).toEqual({
      units: ['가', '마', '다'],
      caretIndex: 2,
    })

    expect(deleteBackwardUnit(replaced.units, replaced.caretIndex)).toEqual({
      units: ['가', '다'],
      caretIndex: 1,
    })
  })

  it('replaces a newline-crossing selection and immediately supports backspace and delete', () => {
    const replaced = replaceSelectionWithUnits(
      ['가', '\n', '나', '다'],
      { start: 1, end: 4 },
      ['하'],
    )

    expect(replaced).toEqual({
      units: ['가', '하'],
      caretIndex: 2,
    })

    expect(deleteBackwardUnit(replaced.units, replaced.caretIndex)).toEqual({
      units: ['가'],
      caretIndex: 1,
    })

    expect(deleteForwardUnit(replaced.units, replaced.caretIndex)).toEqual({
      units: ['가', '하'],
      caretIndex: 2,
    })
  })

  it('creates normalized selection ranges', () => {
    expect(createSelectionRange(4, 1)).toEqual({ start: 1, end: 4 })
    expect(createSelectionRange(2, 2)).toBeNull()
  })

  it('returns normalized selection bounds', () => {
    expect(getSelectionBounds({ start: 4, end: 1 })).toEqual({ start: 1, end: 4 })
    expect(getSelectionBounds(null)).toBeNull()
  })

  it('normalizes selections into the current document bounds after document shrinkage', () => {
    expect(normalizeSelectionRangeToDocument({ start: 1, end: 4 }, 2)).toEqual({
      start: 1,
      end: 2,
    })
    expect(normalizeSelectionRangeToDocument({ start: 2, end: 2 }, 2)).toBeNull()
    expect(normalizeSelectionRangeToDocument(null, 2)).toBeNull()
  })

  it('clamps caret indices into valid editor bounds', () => {
    expect(clampCaretIndex(-1, 3)).toBe(0)
    expect(clampCaretIndex(2, 3)).toBe(2)
    expect(clampCaretIndex(9, 3)).toBe(3)
  })

  it('deletes the previous unit and moves the caret back', () => {
    expect(deleteBackwardUnit(['가', '\n', '나'], 2)).toEqual({
      units: ['가', '나'],
      caretIndex: 1,
    })
  })

  it('deletes the next unit without moving the caret', () => {
    expect(deleteForwardUnit(['가', '\n', '나'], 1)).toEqual({
      units: ['가', '나'],
      caretIndex: 1,
    })
  })

  it('moves through a newline boundary with backspace and delete in sequence', () => {
    const lineStart = getLineStartIndex(['가', '\n', '나'], 2)

    expect(lineStart).toBe(2)

    const afterBackspace = deleteBackwardUnit(['가', '\n', '나'], lineStart)

    expect(afterBackspace).toEqual({
      units: ['가', '나'],
      caretIndex: 1,
    })

    expect(deleteForwardUnit(afterBackspace.units, afterBackspace.caretIndex)).toEqual({
      units: ['가'],
      caretIndex: 1,
    })
  })

  it('removes newline-adjacent selections without leaving stray units behind', () => {
    expect(
      replaceSelectionWithUnits(['가', '\n', '나', '\n', '다'], { start: 1, end: 4 }, []),
    ).toEqual({
      units: ['가', '다'],
      caretIndex: 1,
    })
  })

  it('finds the current line start from the caret position', () => {
    expect(getLineStartIndex(['가', '\n', '나', '다'], 0)).toBe(0)
    expect(getLineStartIndex(['가', '\n', '나', '다'], 1)).toBe(0)
    expect(getLineStartIndex(['가', '\n', '나', '다'], 2)).toBe(2)
    expect(getLineStartIndex(['가', '\n', '나', '다'], 4)).toBe(2)
  })

  it('finds the current line end from the caret position', () => {
    expect(getLineEndIndex(['가', '\n', '나', '다'], 0)).toBe(1)
    expect(getLineEndIndex(['가', '\n', '나', '다'], 1)).toBe(1)
    expect(getLineEndIndex(['가', '\n', '나', '다'], 2)).toBe(4)
    expect(getLineEndIndex(['가', '\n', '나', '다'], 4)).toBe(4)
  })

  it('treats click-only transitions as caret moves and drag transitions as selections', () => {
    expect(createSelectionRange(2, 2)).toBeNull()
    expect(createSelectionRange(2, 4)).toEqual({ start: 2, end: 4 })
    expect(createSelectionRange(4, 2)).toEqual({ start: 2, end: 4 })
  })
})
