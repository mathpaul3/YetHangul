import { describe, expect, it, vi } from 'vitest'
import { dispatchNormalizedInputEvent } from '@/features/ime/services/normalizedDispatcher'

describe('normalized dispatcher', () => {
  it('routes transient symbol input through the transient symbol handler', () => {
    const shouldSuppressNormalizedEvent = vi.fn(() => false)
    const markRecentDirectDispatch = vi.fn()
    const handleTransientSymbolInput = vi.fn()

    dispatchNormalizedInputEvent(
      {
        type: 'symbol',
        symbolId: 101,
        visualKeyLabel: 'ㅅ',
        directText: 'ㅅ',
        transientModifiers: { rightCtrl: true, rightShift: true },
      },
      {
        shouldSuppressNormalizedEvent,
        markRecentDirectDispatch,
        handleInput: vi.fn(),
        handleLiteralInput: vi.fn(),
        handleModifierMainClick: vi.fn(),
        handleUtilityInput: vi.fn(),
        handleNavigationInput: vi.fn(),
        handleTransientSymbolInput,
      },
    )

    expect(shouldSuppressNormalizedEvent).toHaveBeenCalledWith('symbol:101:ㅅ')
    expect(markRecentDirectDispatch).toHaveBeenCalledWith('ㅅ', 101)
    expect(handleTransientSymbolInput).toHaveBeenCalledWith(
      101,
      { rightCtrl: true, rightShift: true },
      'ㅅ',
    )
  })

  it('routes literal input through the shared literal path', () => {
    const handleLiteralInput = vi.fn()

    dispatchNormalizedInputEvent(
      {
        type: 'literal',
        text: 'A',
        directText: 'A',
      },
      {
        shouldSuppressNormalizedEvent: () => false,
        markRecentDirectDispatch: vi.fn(),
        handleInput: vi.fn(),
        handleLiteralInput,
        handleModifierMainClick: vi.fn(),
        handleUtilityInput: vi.fn(),
        handleNavigationInput: vi.fn(),
        handleTransientSymbolInput: vi.fn(),
      },
    )

    expect(handleLiteralInput).toHaveBeenCalledWith('A', undefined)
  })

  it('does not execute suppressed utility events', () => {
    const handleUtilityInput = vi.fn()

    dispatchNormalizedInputEvent(
      {
        type: 'utility',
        utilityKey: 'enter',
        directText: '\n',
      },
      {
        shouldSuppressNormalizedEvent: () => true,
        markRecentDirectDispatch: vi.fn(),
        handleInput: vi.fn(),
        handleLiteralInput: vi.fn(),
        handleModifierMainClick: vi.fn(),
        handleUtilityInput,
        handleNavigationInput: vi.fn(),
        handleTransientSymbolInput: vi.fn(),
      },
    )

    expect(handleUtilityInput).not.toHaveBeenCalled()
  })
})
