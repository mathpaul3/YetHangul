import { describe, expect, it } from 'vitest'
import {
  isLineBreakBeforeInput,
  resolveBeforeInputInterop,
  resolveCompositionEndInterop,
} from '@/features/ime/services/inputInterop'

describe('input interop', () => {
  it('ignores beforeinput while composition is still active', () => {
    expect(
      resolveBeforeInputInterop({
        data: '가',
        inputType: 'insertCompositionText',
        isComposing: true,
        compositionActive: true,
        recentCommittedText: null,
      }),
    ).toEqual({
      dispatchText: null,
      nextRecentCommittedText: null,
    })
  })

  it('ignores beforeinput composition text even if composing has already flipped false while composition is still active', () => {
    expect(
      resolveBeforeInputInterop({
        data: '간',
        inputType: 'insertFromComposition',
        isComposing: false,
        compositionActive: true,
        recentCommittedText: '간',
      }),
    ).toEqual({
      dispatchText: null,
      nextRecentCommittedText: '간',
    })
  })

  it('dispatches beforeinput text when composition has ended', () => {
    expect(
      resolveBeforeInputInterop({
        data: '가',
        inputType: 'insertText',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: null,
      }),
    ).toEqual({
      dispatchText: '가',
      nextRecentCommittedText: null,
    })
  })

  it('recognizes browser line break input types and newline data', () => {
    expect(isLineBreakBeforeInput('insertParagraph', null)).toBe(true)
    expect(isLineBreakBeforeInput('insertLineBreak', null)).toBe(true)
    expect(isLineBreakBeforeInput('insertText', '\n')).toBe(true)
    expect(isLineBreakBeforeInput('insertText', '\r')).toBe(true)
    expect(isLineBreakBeforeInput('insertText', '가')).toBe(false)
    expect(isLineBreakBeforeInput('deleteContentBackward', null)).toBe(false)
  })

  it('ignores beforeinput delete commands so editor-layer deletion remains the source of truth', () => {
    expect(
      resolveBeforeInputInterop({
        data: null,
        inputType: 'deleteContentBackward',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: '가',
      }),
    ).toEqual({
      dispatchText: null,
      nextRecentCommittedText: '가',
    })

    expect(
      resolveBeforeInputInterop({
        data: null,
        inputType: 'deleteContentForward',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: null,
      }),
    ).toEqual({
      dispatchText: null,
      nextRecentCommittedText: null,
    })
  })

  it('consumes duplicate beforeinput emitted after composition commit', () => {
    expect(
      resolveBeforeInputInterop({
        data: '가',
        inputType: 'insertFromComposition',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: '가',
      }),
    ).toEqual({
      dispatchText: null,
      nextRecentCommittedText: null,
    })
  })

  it('accepts a fresh composition session after a duplicate composition commit has been cleared', () => {
    const firstComposition = resolveCompositionEndInterop({
      data: '간',
      recentCommittedText: null,
    })

    expect(firstComposition).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })

    const duplicateCompositionEnd = resolveCompositionEndInterop({
      data: '간',
      recentCommittedText: firstComposition.nextRecentCommittedText,
    })

    expect(duplicateCompositionEnd).toEqual({
      dispatchText: null,
      nextRecentCommittedText: null,
    })

    expect(
      resolveBeforeInputInterop({
        data: '간',
        inputType: 'insertFromComposition',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: duplicateCompositionEnd.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })
  })

  it('dispatches compositionend text when it has not been committed yet', () => {
    expect(
      resolveCompositionEndInterop({
        data: '간',
        recentCommittedText: null,
      }),
    ).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })
  })

  it('consumes duplicate compositionend text after beforeinput already committed it', () => {
    expect(
      resolveCompositionEndInterop({
        data: '간',
        recentCommittedText: '간',
      }),
    ).toEqual({
      dispatchText: null,
      nextRecentCommittedText: null,
    })
  })

  it('allows the same composition text again after the duplicate marker has been cleared', () => {
    const consumed = resolveCompositionEndInterop({
      data: '간',
      recentCommittedText: '간',
    })

    expect(consumed).toEqual({
      dispatchText: null,
      nextRecentCommittedText: null,
    })

    expect(
      resolveCompositionEndInterop({
        data: '간',
        recentCommittedText: consumed.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })
  })
})
