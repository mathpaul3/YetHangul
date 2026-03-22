import { describe, expect, it } from 'vitest'
import {
  clampCaretIndex,
  commitCompositionUnits,
  createSelectionRange,
  deleteUnitRange,
  getSelectionBounds,
  insertUnitsAt,
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
})
