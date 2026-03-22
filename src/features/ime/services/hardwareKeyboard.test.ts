import { describe, expect, it } from 'vitest'
import { applyContextualFiller, applyInputWithModifiers, applyLiteralInput, getRenderedJamoIds } from '@/engine/core/engine'
import { createInitialEngineState } from '@/engine/core/state'
import { jamoIdsToUnicode } from '@/engine/mapper/unicodeMapper'
import type { ModifierKey } from '@/engine/core/types'
import {
  resolveInputSymbolFromKeyboardEvent,
  resolveTransientModifiersFromKeyboardEvent,
  resolveVisualKeyLabelFromKeyboardEvent,
} from '@/features/ime/services/hardwareKeyboard'

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
    pressedModifiers?: Partial<Record<ModifierKey, boolean>>
    contextualFiller?: boolean
  }>,
) {
  let state = createInitialEngineState()

  for (const step of sequence) {
    if (step.contextualFiller) {
      state = applyContextualFiller(state)
      continue
    }

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
      resolveTransientModifiersFromKeyboardEvent(event, step.pressedModifiers),
    )
  }

  return jamoIdsToUnicode(getRenderedJamoIds(state))
}

describe('hardware keyboard flow', () => {
  it('maps qwerty keys to ordinary jamo input', () => {
    expect(renderFromHardwareSequence([{ key: 'r' }, { key: 'k' }, { key: 's' }])).toBe('rks')
  })

  it('still maps direct hangul jamo keys into the engine flow', () => {
    expect(renderFromHardwareSequence([{ key: 'ㄱ' }, { key: 'ㅏ' }, { key: 'ㄴ' }])).toBe('간')
  })

  it('maps left ctrl modifier flow to chidueum sios', () => {
    expect(
      renderFromHardwareSequence([
        {
          key: 'ㅅ',
          ctrlKey: true,
          pressedModifiers: { leftCtrl: true },
        },
      ]),
    ).toBe('ᄼ')
  })

  it('maps left ctrl + left shift flow to ssang-yeorinhieuh', () => {
    expect(
      renderFromHardwareSequence([
        {
          key: 'ㅎ',
          ctrlKey: true,
          shiftKey: true,
          pressedModifiers: { leftCtrl: true, leftShift: true },
        },
      ]),
    ).toBe('ꥼ')
  })

  it('keeps non-composable extra vowels as a new filled syllable in hardware flow', () => {
    expect(
      renderFromHardwareSequence([
        { key: 'ㄴ' },
        { key: 'ㄱ' },
        { key: 'ㅏ' },
        { key: 'ㅏ' },
        { key: 'ㅊ' },
      ]),
    ).toBe('ᄓᅡᅟᅡᆾ')
  })

  it('uses contextual filler from ctrl + space behavior in hardware flow', () => {
    expect(
      renderFromHardwareSequence([
        { key: 'ㄱ' },
        { key: ' ', ctrlKey: true, pressedModifiers: { leftCtrl: true }, contextualFiller: true },
      ]),
    ).toBe('ᄀᅠ')
  })

  it('resolves shifted double-jamo keys to their visible base key by physical code', () => {
    expect(
      resolveVisualKeyLabelFromKeyboardEvent(
        createKeyboardStub({ key: 'ㅃ', code: 'KeyQ', shiftKey: true }),
      ),
    ).toBe('ㅂ')
    expect(
      resolveVisualKeyLabelFromKeyboardEvent(
        createKeyboardStub({ key: 'ㅖ', code: 'KeyP', shiftKey: true }),
      ),
    ).toBe('ㅔ')
  })
})
