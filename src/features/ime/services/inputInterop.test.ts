import { describe, expect, it } from 'vitest'
import {
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
