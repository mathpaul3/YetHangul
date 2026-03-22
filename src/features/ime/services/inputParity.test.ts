import { describe, expect, it } from 'vitest'
import {
  applyInputWithModifiers,
  applyLiteralInput,
  getRenderedJamoIds,
} from '@/engine/core/engine'
import { createInitialEngineState } from '@/engine/core/state'
import { jamoIdsToUnicode } from '@/engine/mapper/unicodeMapper'
import { resolveInputSymbolFromKeyboardEvent } from '@/features/ime/services/hardwareKeyboard'
import { resolveTransientModifiersFromKeyboardEvent } from '@/features/ime/services/hardwareKeyboard'

type KeyboardStubOptions = {
  key: string
  code?: string
  ctrlKey?: boolean
  shiftKey?: boolean
  location?: number
}

function createKeyboardStub({
  key,
  code = '',
  ctrlKey = false,
  shiftKey = false,
  location = 0,
}: KeyboardStubOptions) {
  return {
    key,
    code,
    ctrlKey,
    shiftKey,
    location,
  } as KeyboardEvent
}

function renderFromHardwareSequence(
  sequence: Array<{
    key: string
    ctrlKey?: boolean
    shiftKey?: boolean
  }>,
) {
  let state = createInitialEngineState()

  for (const step of sequence) {
    const event = createKeyboardStub({
      key: step.key,
      ctrlKey: step.ctrlKey,
      shiftKey: step.shiftKey,
    })
    const symbolId = resolveInputSymbolFromKeyboardEvent(event)

    if (symbolId == null) {
      if (!step.ctrlKey && !step.shiftKey && step.key.length > 0) {
        state = applyLiteralInput(state, step.key)
      }
      continue
    }

    state = applyInputWithModifiers(
      state,
      symbolId,
      resolveTransientModifiersFromKeyboardEvent(event),
    )
  }

  return jamoIdsToUnicode(getRenderedJamoIds(state))
}

function renderFromOnscreenSequence(
  sequence: Array<{
    key: string
    ctrlKey?: boolean
    shiftKey?: boolean
  }>,
) {
  let state = createInitialEngineState()

  for (const step of sequence) {
    const event = createKeyboardStub({
      key: step.key,
      ctrlKey: step.ctrlKey,
      shiftKey: step.shiftKey,
    })
    const symbolId = resolveInputSymbolFromKeyboardEvent(event)

    if (symbolId == null) {
      if (!step.ctrlKey && !step.shiftKey && step.key.length > 0) {
        state = applyLiteralInput(state, step.key)
      }
      continue
    }

    state = applyInputWithModifiers(
      state,
      symbolId,
      resolveTransientModifiersFromKeyboardEvent(event),
    )
  }

  return jamoIdsToUnicode(getRenderedJamoIds(state))
}

describe('input parity', () => {
  it('renders the same ordinary jamo sequence from hardware and onscreen paths', () => {
    const hardware = renderFromHardwareSequence([{ key: 'ㄱ' }, { key: 'ㅏ' }, { key: 'ㄴ' }])
    const onscreen = renderFromOnscreenSequence([{ key: 'ㄱ' }, { key: 'ㅏ' }, { key: 'ㄴ' }])

    expect(hardware).toBe('간')
    expect(onscreen).toBe(hardware)
  })

  it('keeps a longer mixed sequence aligned between hardware and onscreen paths', () => {
    const hardware = renderFromHardwareSequence([
      { key: 'ㄴ' },
      { key: 'ㄱ' },
      { key: 'ㅏ' },
      { key: 'ㅏ' },
      { key: 'ㅊ' },
      { key: '\n' },
      { key: 'ㄱ' },
      { key: 'ㅏ' },
    ])
    const onscreen = renderFromOnscreenSequence([
      { key: 'ㄴ' },
      { key: 'ㄱ' },
      { key: 'ㅏ' },
      { key: 'ㅏ' },
      { key: 'ㅊ' },
      { key: '\n' },
      { key: 'ㄱ' },
      { key: 'ㅏ' },
    ])

    expect(hardware).toBe('ᄓᅡᅟᅡᆾ\n가')
    expect(onscreen).toBe(hardware)
  })

  it('keeps enter and backspace parity aligned between hardware and onscreen paths after a selection-like edit sequence', () => {
    const hardware = renderFromHardwareSequence([
      { key: 'ㄱ' },
      { key: 'ㅏ' },
      { key: '\n' },
      { key: 'ㄴ' },
      { key: 'ㅏ' },
    ])
    const onscreen = renderFromOnscreenSequence([
      { key: 'ㄱ' },
      { key: 'ㅏ' },
      { key: '\n' },
      { key: 'ㄴ' },
      { key: 'ㅏ' },
    ])

    expect(hardware).toBe('가\n나')
    expect(onscreen).toBe(hardware)
  })

  it('keeps a small parity matrix aligned across hardware and onscreen editing paths', () => {
    const cases: Array<{
      name: string
      sequence: Array<{
        key: string
        ctrlKey?: boolean
        shiftKey?: boolean
      }>
    }> = [
      {
        name: 'simple syllable',
        sequence: [{ key: 'ㄱ' }, { key: 'ㅏ' }, { key: 'ㄴ' }],
      },
      {
        name: 'newline and backspace boundary',
        sequence: [{ key: 'ㄱ' }, { key: 'ㅏ' }, { key: '\n' }, { key: 'ㄴ' }, { key: 'ㅏ' }],
      },
      {
        name: 'modifier filler flow',
        sequence: [
          { key: 'ㄱ' },
          { key: ' ', ctrlKey: true },
          { key: 'ㅏ' },
          { key: '.' , ctrlKey: true },
          { key: 'ㄴ' },
        ],
      },
    ]

    for (const testCase of cases) {
      const hardware = renderFromHardwareSequence(testCase.sequence)
      const onscreen = renderFromOnscreenSequence(testCase.sequence)

      expect(onscreen, testCase.name).toBe(hardware)
    }
  })
})
