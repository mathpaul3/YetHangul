import { describe, expect, it, vi } from 'vitest'
import {
  canonicalizeNormalizedInputBatch,
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
      { type: 'literal', text: 'ABC', directText: 'ABC' },
    ])
  })

  it('canonicalizes a normalized batch to rendered unicode text', () => {
    expect(canonicalizeNormalizedInputBatch(createNormalizedInputBatchFromText('A간B'))).toBe(
      'A간B',
    )
  })

  it('dispatches a prepared normalized batch through the shared dispatcher runtime', () => {
    const commitCompositionToDocument = vi.fn()
    const deleteSelection = vi.fn()
    const insertLiteralTextIntoDocument = vi.fn()

    dispatchNormalizedInputBatch(createNormalizedInputBatchFromText('간A'), {
      commitCompositionToDocument,
      hasSelection: () => true,
      deleteSelection,
      insertLiteralTextIntoDocument,
    })

    expect(commitCompositionToDocument).toHaveBeenCalledTimes(1)
    expect(deleteSelection).toHaveBeenCalledTimes(1)
    expect(insertLiteralTextIntoDocument).toHaveBeenCalledWith('간A')
  })

  it('keeps the text wrapper aligned with the batch dispatcher', () => {
    const insertLiteralTextIntoDocument = vi.fn()

    dispatchNormalizedTextBatch('A간', {
      commitCompositionToDocument: vi.fn(),
      hasSelection: () => false,
      deleteSelection: vi.fn(),
      insertLiteralTextIntoDocument,
    })

    expect(insertLiteralTextIntoDocument).toHaveBeenCalledWith('A간')
  })

  it('preserves newline and tone order through the text batch wrapper', () => {
    const insertLiteralTextIntoDocument = vi.fn()

    dispatchNormalizedTextBatch('간〮\nA', {
      commitCompositionToDocument: vi.fn(),
      hasSelection: () => false,
      deleteSelection: vi.fn(),
      insertLiteralTextIntoDocument,
    })

    expect(insertLiteralTextIntoDocument).toHaveBeenCalledWith('간〮\nA')
  })

  it('exposes a stable signature for a normalized batch', () => {
    const batch = createNormalizedInputBatchFromText('A간')
    const signature = getNormalizedInputBatchSignature(batch)

    expect(signature).toMatch(/^literal:A\|symbol:\d+:\|symbol:\d+:\|symbol:\d+:$/)
    expect(getNormalizedInputBatchSignature(batch)).toBe(signature)
  })
})
