import { describe, expect, it, vi } from 'vitest'
import { dispatchNormalizedTextBatch } from '@/features/ime/services/nativeTextBatch'

describe('native text batch adapter', () => {
  it('canonicalizes mixed literal and supported text in order', () => {
    const insertLiteralTextIntoDocument = vi.fn()

    dispatchNormalizedTextBatch('A간B', {
      commitCompositionToDocument: vi.fn(),
      hasSelection: () => false,
      deleteSelection: vi.fn(),
      insertLiteralTextIntoDocument,
    })

    expect(insertLiteralTextIntoDocument).toHaveBeenCalledWith('A간B')
  })

  it('deletes the current selection before inserting normalized batch text', () => {
    const deleteSelection = vi.fn()

    dispatchNormalizedTextBatch('간', {
      commitCompositionToDocument: vi.fn(),
      hasSelection: () => true,
      deleteSelection,
      insertLiteralTextIntoDocument: vi.fn(),
    })

    expect(deleteSelection).toHaveBeenCalledTimes(1)
  })
})
