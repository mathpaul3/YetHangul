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

function renderFromOnscreenSequence(sequence: string[]) {
  let state = createInitialEngineState()

  for (const key of sequence) {
    const event = createKeyboardStub({ key })
    const symbolId = resolveInputSymbolFromKeyboardEvent(event)

    if (symbolId == null) {
      state = applyLiteralInput(state, key)
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
    const onscreen = renderFromOnscreenSequence(['ㄱ', 'ㅏ', 'ㄴ'])

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
    const onscreen = renderFromOnscreenSequence(['ㄴ', 'ㄱ', 'ㅏ', 'ㅏ', 'ㅊ', '\n', 'ㄱ', 'ㅏ'])

    expect(hardware).toBe('ᄓᅡᅟᅡᆾ\n가')
    expect(onscreen).toBe(hardware)
  })
})
