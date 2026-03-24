import { describe, expect, it } from 'vitest'
import {
  isLineBreakBeforeInput,
  resolveBeforeInputInterop,
  resolveCompositionEndInterop,
  shouldSuppressInteropTextAfterDirectDispatch,
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

  it('keeps enter and delete beforeinput flows stable after focus regain', () => {
    expect(isLineBreakBeforeInput('insertParagraph', null)).toBe(true)
    expect(isLineBreakBeforeInput('insertLineBreak', null)).toBe(true)

    const initialComposition = resolveCompositionEndInterop({
      data: '간',
      recentCommittedText: null,
    })

    expect(initialComposition).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })

    expect(
      resolveBeforeInputInterop({
        data: null,
        inputType: 'deleteContentBackward',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: initialComposition.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: null,
      nextRecentCommittedText: initialComposition.nextRecentCommittedText,
    })

    expect(
      resolveBeforeInputInterop({
        data: null,
        inputType: 'insertParagraph',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: initialComposition.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: null,
      nextRecentCommittedText: initialComposition.nextRecentCommittedText,
    })

    expect(
      resolveCompositionEndInterop({
        data: '간',
        recentCommittedText: initialComposition.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: null,
      nextRecentCommittedText: null,
    })

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

  it('keeps focus-regain delete and enter flows from blocking a fresh composition session', () => {
    const committed = resolveCompositionEndInterop({
      data: '가',
      recentCommittedText: null,
    })

    expect(committed).toEqual({
      dispatchText: '가',
      nextRecentCommittedText: '가',
    })

    const deleteAfterFocusRegain = resolveBeforeInputInterop({
      data: null,
      inputType: 'deleteContentBackward',
      isComposing: false,
      compositionActive: false,
      recentCommittedText: committed.nextRecentCommittedText,
    })

    expect(deleteAfterFocusRegain).toEqual({
      dispatchText: null,
      nextRecentCommittedText: committed.nextRecentCommittedText,
    })

    const enterAfterFocusRegain = resolveBeforeInputInterop({
      data: null,
      inputType: 'insertParagraph',
      isComposing: false,
      compositionActive: false,
      recentCommittedText: deleteAfterFocusRegain.nextRecentCommittedText,
    })

    expect(enterAfterFocusRegain).toEqual({
      dispatchText: null,
      nextRecentCommittedText: deleteAfterFocusRegain.nextRecentCommittedText,
    })

    expect(
      resolveCompositionEndInterop({
        data: '나',
        recentCommittedText: enterAfterFocusRegain.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: '나',
      nextRecentCommittedText: '나',
    })
  })

  it('keeps a single focus-regain composition/delete/enter sequence aligned through the service layer', () => {
    const firstComposition = resolveCompositionEndInterop({
      data: '간',
      recentCommittedText: null,
    })

    expect(firstComposition).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })

    const afterDelete = resolveBeforeInputInterop({
      data: null,
      inputType: 'deleteContentBackward',
      isComposing: false,
      compositionActive: false,
      recentCommittedText: firstComposition.nextRecentCommittedText,
    })

    expect(afterDelete).toEqual({
      dispatchText: null,
      nextRecentCommittedText: firstComposition.nextRecentCommittedText,
    })

    const afterEnter = resolveBeforeInputInterop({
      data: null,
      inputType: 'insertParagraph',
      isComposing: false,
      compositionActive: false,
      recentCommittedText: afterDelete.nextRecentCommittedText,
    })

    expect(afterEnter).toEqual({
      dispatchText: null,
      nextRecentCommittedText: afterDelete.nextRecentCommittedText,
    })

    expect(isLineBreakBeforeInput('insertText', '\n')).toBe(true)

    expect(
      resolveCompositionEndInterop({
        data: '나',
        recentCommittedText: afterEnter.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: '나',
      nextRecentCommittedText: '나',
    })
  })

  it('suppresses immediate duplicate text after direct key dispatch', () => {
    expect(
      shouldSuppressInteropTextAfterDirectDispatch({
        text: 'ㅆ',
        recentDirectText: 'ㅆ',
        recentDirectTimestamp: 100,
        now: 140,
      }),
    ).toBe(true)

    expect(
      shouldSuppressInteropTextAfterDirectDispatch({
        text: 'ㅆ',
        recentDirectText: 'ㅅ',
        recentDirectTimestamp: 100,
        now: 140,
      }),
    ).toBe(false)

    expect(
      shouldSuppressInteropTextAfterDirectDispatch({
        text: 'ㅆ',
        recentDirectText: 'ㅆ',
        recentDirectTimestamp: 100,
        now: 220,
      }),
    ).toBe(false)
  })

  it('allows insertFromComposition again after the focus-regain duplicate marker has cleared', () => {
    const firstComposition = resolveCompositionEndInterop({
      data: '간',
      recentCommittedText: null,
    })

    expect(firstComposition).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })

    const duplicateSuppressed = resolveBeforeInputInterop({
      data: '간',
      inputType: 'insertFromComposition',
      isComposing: false,
      compositionActive: false,
      recentCommittedText: firstComposition.nextRecentCommittedText,
    })

    expect(duplicateSuppressed).toEqual({
      dispatchText: null,
      nextRecentCommittedText: null,
    })

    expect(
      resolveBeforeInputInterop({
        data: '간',
        inputType: 'insertFromComposition',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: duplicateSuppressed.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })
  })

  it('keeps insertLineBreak stable after focus regain in the same beforeinput contract', () => {
    const committed = resolveCompositionEndInterop({
      data: '간',
      recentCommittedText: null,
    })

    expect(committed).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })

    expect(isLineBreakBeforeInput('insertLineBreak', null)).toBe(true)

    expect(
      resolveBeforeInputInterop({
        data: null,
        inputType: 'insertLineBreak',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: committed.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: null,
      nextRecentCommittedText: committed.nextRecentCommittedText,
    })

    expect(
      resolveCompositionEndInterop({
        data: '나',
        recentCommittedText: committed.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: '나',
      nextRecentCommittedText: '나',
    })
  })

  it('keeps composition-end and beforeinput insert surfaces aligned in a small recovered-focus matrix', () => {
    const recovered = resolveCompositionEndInterop({
      data: '나',
      recentCommittedText: null,
    })

    expect(recovered).toEqual({
      dispatchText: '나',
      nextRecentCommittedText: '나',
    })

    const cases = [
      {
        name: 'insertText',
        decision: resolveBeforeInputInterop({
          data: '나',
          inputType: 'insertText',
          isComposing: false,
          compositionActive: false,
          recentCommittedText: recovered.nextRecentCommittedText,
        }),
        expected: {
          dispatchText: '나',
          nextRecentCommittedText: recovered.nextRecentCommittedText,
        },
      },
      {
        name: 'insertReplacementText',
        decision: resolveBeforeInputInterop({
          data: '나',
          inputType: 'insertReplacementText',
          isComposing: false,
          compositionActive: false,
          recentCommittedText: recovered.nextRecentCommittedText,
        }),
        expected: {
          dispatchText: '나',
          nextRecentCommittedText: recovered.nextRecentCommittedText,
        },
      },
      {
        name: 'insertFromComposition duplicate',
        decision: resolveBeforeInputInterop({
          data: '나',
          inputType: 'insertFromComposition',
          isComposing: false,
          compositionActive: false,
          recentCommittedText: recovered.nextRecentCommittedText,
        }),
        expected: {
          dispatchText: null,
          nextRecentCommittedText: null,
        },
      },
    ] as const

    for (const testCase of cases) {
      expect(testCase.decision, testCase.name).toEqual(testCase.expected)
    }

    expect(
      resolveBeforeInputInterop({
        data: '나',
        inputType: 'insertFromComposition',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: cases[2].decision.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: '나',
      nextRecentCommittedText: '나',
    })
  })

  it('keeps a compact composition-end and beforeinput family contract stable', () => {
    const compositionEnd = resolveCompositionEndInterop({
      data: '간',
      recentCommittedText: null,
    })

    expect(compositionEnd).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })

    const matrix = [
      {
        name: 'insertText stays literal after composition-end',
        decision: resolveBeforeInputInterop({
          data: '간',
          inputType: 'insertText',
          isComposing: false,
          compositionActive: false,
          recentCommittedText: compositionEnd.nextRecentCommittedText,
        }),
        expected: {
          dispatchText: '간',
          nextRecentCommittedText: compositionEnd.nextRecentCommittedText,
        },
      },
      {
        name: 'insertReplacementText stays literal after composition-end',
        decision: resolveBeforeInputInterop({
          data: '간',
          inputType: 'insertReplacementText',
          isComposing: false,
          compositionActive: false,
          recentCommittedText: compositionEnd.nextRecentCommittedText,
        }),
        expected: {
          dispatchText: '간',
          nextRecentCommittedText: compositionEnd.nextRecentCommittedText,
        },
      },
      {
        name: 'insertFromComposition is deduped after composition-end',
        decision: resolveBeforeInputInterop({
          data: '간',
          inputType: 'insertFromComposition',
          isComposing: false,
          compositionActive: false,
          recentCommittedText: compositionEnd.nextRecentCommittedText,
        }),
        expected: {
          dispatchText: null,
          nextRecentCommittedText: null,
        },
      },
    ] as const

    for (const testCase of matrix) {
      expect(testCase.decision, testCase.name).toEqual(testCase.expected)
    }

    expect(isLineBreakBeforeInput('insertParagraph', null)).toBe(true)
    expect(isLineBreakBeforeInput('insertLineBreak', null)).toBe(true)

    expect(
      resolveCompositionEndInterop({
        data: '간',
        recentCommittedText: matrix[2].decision.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })
  })

  it('keeps a compact browser-surface breadth matrix stable', () => {
    const compositionEnd = resolveCompositionEndInterop({
      data: '간',
      recentCommittedText: null,
    })

    expect(compositionEnd).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })

    const matrix = [
      {
        browser: 'chromium-like',
        decision: resolveBeforeInputInterop({
          data: '간',
          inputType: 'insertFromComposition',
          isComposing: false,
          compositionActive: false,
          recentCommittedText: compositionEnd.nextRecentCommittedText,
        }),
        expected: {
          dispatchText: null,
          nextRecentCommittedText: null,
        },
      },
      {
        browser: 'webkit-like',
        decision: resolveBeforeInputInterop({
          data: '간',
          inputType: 'insertText',
          isComposing: false,
          compositionActive: false,
          recentCommittedText: compositionEnd.nextRecentCommittedText,
        }),
        expected: {
          dispatchText: '간',
          nextRecentCommittedText: compositionEnd.nextRecentCommittedText,
        },
      },
      {
        browser: 'gecko-like',
        decision: resolveBeforeInputInterop({
          data: '간',
          inputType: 'insertReplacementText',
          isComposing: false,
          compositionActive: false,
          recentCommittedText: compositionEnd.nextRecentCommittedText,
        }),
        expected: {
          dispatchText: '간',
          nextRecentCommittedText: compositionEnd.nextRecentCommittedText,
        },
      },
    ] as const

    for (const testCase of matrix) {
      expect(testCase.decision, testCase.browser).toEqual(testCase.expected)
    }

    expect(isLineBreakBeforeInput('insertParagraph', null)).toBe(true)
    expect(isLineBreakBeforeInput('insertLineBreak', null)).toBe(true)
  })

  it('keeps insertReplacementText stable after focus regain in the same beforeinput contract', () => {
    const committed = resolveCompositionEndInterop({
      data: '간',
      recentCommittedText: null,
    })

    expect(committed).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })

    expect(
      resolveBeforeInputInterop({
        data: '갓',
        inputType: 'insertReplacementText',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: committed.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: '갓',
      nextRecentCommittedText: committed.nextRecentCommittedText,
    })

    expect(
      resolveCompositionEndInterop({
        data: '나',
        recentCommittedText: committed.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: '나',
      nextRecentCommittedText: '나',
    })
  })

  it('keeps deleteWordBackward and deleteSoftLineBackward stable after focus regain in the same beforeinput contract', () => {
    const committed = resolveCompositionEndInterop({
      data: '간',
      recentCommittedText: null,
    })

    expect(committed).toEqual({
      dispatchText: '간',
      nextRecentCommittedText: '간',
    })

    expect(
      resolveBeforeInputInterop({
        data: null,
        inputType: 'deleteWordBackward',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: committed.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: null,
      nextRecentCommittedText: committed.nextRecentCommittedText,
    })

    expect(
      resolveBeforeInputInterop({
        data: null,
        inputType: 'deleteSoftLineBackward',
        isComposing: false,
        compositionActive: false,
        recentCommittedText: committed.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: null,
      nextRecentCommittedText: committed.nextRecentCommittedText,
    })

    expect(
      resolveCompositionEndInterop({
        data: '나',
        recentCommittedText: committed.nextRecentCommittedText,
      }),
    ).toEqual({
      dispatchText: '나',
      nextRecentCommittedText: '나',
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
