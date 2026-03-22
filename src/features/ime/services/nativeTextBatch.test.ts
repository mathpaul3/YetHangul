import { describe, expect, it, vi } from 'vitest'
import {
  createNormalizedInputBatchFromText,
  dispatchNormalizedInputBatch,
  dispatchNormalizedTextBatch,
} from '@/features/ime/services/nativeTextBatch'
import { getNormalizedInputBatchSignature } from '@/features/ime/services/normalizedInput'

describe('native text batch adapter', () => {
  it('creates a normalized batch that preserves mixed literal and supported input order', () => {
    expect(createNormalizedInputBatchFromText('A간B')).toEqual([
      { type: 'literal', text: 'A', directText: 'A' },
      { type: 'symbol', symbolId: expect.any(Number), directText: '간' },
      { type: 'symbol', symbolId: expect.any(Number), directText: '간' },
      { type: 'symbol', symbolId: expect.any(Number), directText: '간' },
      { type: 'literal', text: 'B', directText: 'B' },
    ])
  })

  it('groups adjacent literal text into a single literal batch event', () => {
    expect(createNormalizedInputBatchFromText('ABC')).toEqual([
      { type: 'literal', text: 'ABC', directText: 'A' },
    ])
  })

  it('dispatches a prepared normalized batch through the shared dispatcher runtime', () => {
    const handleInput = vi.fn()
    const handleLiteralInput = vi.fn()

    dispatchNormalizedInputBatch(createNormalizedInputBatchFromText('간A'), {
      shouldSuppressNormalizedEvent: () => false,
      markRecentDirectDispatch: vi.fn(),
      handleInput,
      handleLiteralInput,
      handleModifierMainClick: vi.fn(),
      handleUtilityInput: vi.fn(),
      handleNavigationInput: vi.fn(),
      handleTransientSymbolInput: vi.fn(),
    })

    expect(handleInput).toHaveBeenCalledTimes(3)
    expect(handleLiteralInput).toHaveBeenCalledWith('A', undefined)
  })

  it('keeps the text wrapper aligned with the batch dispatcher', () => {
    const handleInput = vi.fn()
    const handleLiteralInput = vi.fn()

    dispatchNormalizedTextBatch('A간', {
      shouldSuppressNormalizedEvent: () => false,
      markRecentDirectDispatch: vi.fn(),
      handleInput,
      handleLiteralInput,
      handleModifierMainClick: vi.fn(),
      handleUtilityInput: vi.fn(),
      handleNavigationInput: vi.fn(),
      handleTransientSymbolInput: vi.fn(),
    })

    expect(handleLiteralInput).toHaveBeenCalledWith('A', undefined)
    expect(handleInput).toHaveBeenCalledTimes(3)
  })

  it('preserves newline and tone order through the text batch wrapper', () => {
    const handleInput = vi.fn()
    const handleLiteralInput = vi.fn()

    dispatchNormalizedTextBatch('간〮\nA', {
      shouldSuppressNormalizedEvent: () => false,
      markRecentDirectDispatch: vi.fn(),
      handleInput,
      handleLiteralInput,
      handleModifierMainClick: vi.fn(),
      handleUtilityInput: vi.fn(),
      handleNavigationInput: vi.fn(),
      handleTransientSymbolInput: vi.fn(),
    })

    expect(handleInput).toHaveBeenCalledTimes(4)
    expect(handleLiteralInput).toHaveBeenNthCalledWith(1, '\nA', undefined)
  })

  it('exposes a stable signature for a normalized batch', () => {
    const batch = createNormalizedInputBatchFromText('A간')
    const signature = getNormalizedInputBatchSignature(batch)

    expect(signature).toMatch(/^literal:A\|symbol:\d+:\|symbol:\d+:\|symbol:\d+:$/)
    expect(getNormalizedInputBatchSignature(batch)).toBe(signature)
  })
})
