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
  replaceSelectionWithUnits,
  segmentTextToEditorUnits,
} from '@/features/ime/services/editorUnits'

describe('editorUnits', () => {
  it('segments jamo text into syllable-like editor units', () => {
    expect(segmentTextToEditorUnits('간ᅟᅡ\nA')).toEqual(['간', 'ᅟᅡ', '\n', 'A'])
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

  it('creates normalized selection ranges', () => {
    expect(createSelectionRange(4, 1)).toEqual({ start: 1, end: 4 })
    expect(createSelectionRange(2, 2)).toBeNull()
  })

  it('returns normalized selection bounds', () => {
    expect(getSelectionBounds({ start: 4, end: 1 })).toEqual({ start: 1, end: 4 })
    expect(getSelectionBounds(null)).toBeNull()
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
})
