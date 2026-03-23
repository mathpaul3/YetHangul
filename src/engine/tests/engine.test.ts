import { describe, expect, it } from 'vitest'
import { applyContextualFiller, applyInput, applyInputWithModifiers, applyLiteralInput, setModifierMode } from '@/engine/core/engine'
import { createInitialEngineState } from '@/engine/core/state'
import { normalizeUnicodeToInputSymbols } from '@/engine/mapper/inputMapper'
import { jamoIdsToUnicode } from '@/engine/mapper/unicodeMapper'
import {
  ARCHAIC_FINAL_RULES,
  ARCHAIC_INITIAL_RULES,
  ARCHAIC_MEDIAL_RULES,
} from '@/engine/tables/archaicRuleCatalog'
import {
  PRIMITIVE_FINALS,
  PRIMITIVE_INITIALS,
  PRIMITIVE_MEDIALS,
} from '@/engine/tables/archaicPrimitiveCatalog'
import { INPUT_SYMBOL_IDS } from '@/engine/tables/inputSymbolTable'
import { TARGET_INVENTORY } from '@/engine/tables/inventoryCatalog'
import {
  TARGET_AUXILIARY_COVERAGE,
  TARGET_INVENTORY_COUNTS,
  TARGET_INVENTORY_COVERAGE,
} from '@/engine/tables/targetInventory'
import {
  BASE_FINAL_TARGET_CHARS,
} from '@/engine/tables/baseInventoryCoverage'
import { normalizePastedTextToInputSymbols } from '@/features/ime/services/normalizePaste'

function runSequence(sequence: number[]) {
  return sequence.reduce((state, symbolId) => applyInput(state, symbolId), createInitialEngineState())
}

function render(sequence: number[]) {
  const state = runSequence(sequence)
  return jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])
}

function roundTrip(char: string) {
  return render(normalizeUnicodeToInputSymbols(char))
}

const MEDIAL_ONLY_OVERLAP_CHARS = new Set(['ᆧ'])

describe('engine', () => {
  it('covers the core ctrl-based consonant shape conversions from the spec', () => {
    const cases = [
      [{ symbolId: INPUT_SYMBOL_IDS.SIOS, modifiers: { leftCtrl: true } }, 'ᄼ'],
      [{ symbolId: INPUT_SYMBOL_IDS.SIOS, modifiers: { rightCtrl: true } }, 'ᄾ'],
      [{ symbolId: INPUT_SYMBOL_IDS.SIOS, modifiers: { leftCtrl: true, leftShift: true } }, 'ᄽ'],
      [{ symbolId: INPUT_SYMBOL_IDS.SIOS, modifiers: { rightCtrl: true, rightShift: true } }, 'ᄿ'],
      [{ symbolId: INPUT_SYMBOL_IDS.IEUNG, modifiers: { leftCtrl: true } }, 'ᅌ'],
      [{ symbolId: INPUT_SYMBOL_IDS.CIEUC, modifiers: { leftCtrl: true } }, 'ᅎ'],
      [{ symbolId: INPUT_SYMBOL_IDS.CIEUC, modifiers: { rightCtrl: true } }, 'ᅐ'],
      [{ symbolId: INPUT_SYMBOL_IDS.SSANGCIEUC, modifiers: { leftCtrl: true } }, 'ᅏ'],
      [{ symbolId: INPUT_SYMBOL_IDS.SSANGCIEUC, modifiers: { rightCtrl: true } }, 'ᅑ'],
      [{ symbolId: INPUT_SYMBOL_IDS.CHIEUCH, modifiers: { leftShift: true } }, 'ᅀ'],
      [{ symbolId: INPUT_SYMBOL_IDS.CHIEUCH, modifiers: { leftCtrl: true } }, 'ᅔ'],
      [{ symbolId: INPUT_SYMBOL_IDS.CHIEUCH, modifiers: { rightCtrl: true } }, 'ᅕ'],
      [{ symbolId: INPUT_SYMBOL_IDS.HIEUH, modifiers: { leftCtrl: true } }, 'ᅙ'],
      [{ symbolId: INPUT_SYMBOL_IDS.HIEUH, modifiers: { leftCtrl: true, leftShift: true } }, 'ꥼ'],
    ] as const

    for (const [input, expected] of cases) {
      const state = applyInputWithModifiers(
        createInitialEngineState(),
        input.symbolId,
        input.modifiers,
      )

      expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe(expected)
    }
  })

  it('covers the core shift-based doubled consonant and vowel conversions from the spec', () => {
    const cases = [
      [{ symbolId: INPUT_SYMBOL_IDS.GIYEOK, modifiers: { leftShift: true } }, 'ᄁ'],
      [{ symbolId: INPUT_SYMBOL_IDS.NIEUN, modifiers: { leftShift: true } }, 'ᄔ'],
      [{ symbolId: INPUT_SYMBOL_IDS.DIGEUT, modifiers: { leftShift: true } }, 'ᄄ'],
      [{ symbolId: INPUT_SYMBOL_IDS.RIEUL, modifiers: { leftShift: true } }, 'ᄙ'],
      [{ symbolId: INPUT_SYMBOL_IDS.BIEUP, modifiers: { leftShift: true } }, 'ᄈ'],
      [{ symbolId: INPUT_SYMBOL_IDS.SIOS, modifiers: { leftShift: true } }, 'ᄊ'],
      [{ symbolId: INPUT_SYMBOL_IDS.IEUNG, modifiers: { leftShift: true } }, 'ᅇ'],
      [{ symbolId: INPUT_SYMBOL_IDS.CIEUC, modifiers: { leftShift: true } }, 'ᄍ'],
      [{ symbolId: INPUT_SYMBOL_IDS.THIEUTH, modifiers: { leftShift: true } }, 'ꥹ'],
      [{ symbolId: INPUT_SYMBOL_IDS.HIEUH, modifiers: { leftShift: true } }, 'ᅘ'],
      [{ symbolId: INPUT_SYMBOL_IDS.O, modifiers: { leftShift: true } }, 'ᆂ'],
      [{ symbolId: INPUT_SYMBOL_IDS.U, modifiers: { leftShift: true } }, 'ᆍ'],
      [{ symbolId: INPUT_SYMBOL_IDS.EU, modifiers: { leftShift: true } }, 'ᆖ'],
      [{ symbolId: INPUT_SYMBOL_IDS.I, modifiers: { leftShift: true } }, 'ퟄ'],
      [{ symbolId: INPUT_SYMBOL_IDS.A, modifiers: { leftCtrl: true } }, 'ᆞ'],
      [{ symbolId: INPUT_SYMBOL_IDS.A, modifiers: { leftCtrl: true, leftShift: true } }, 'ᆢ'],
    ] as const

    for (const [input, expected] of cases) {
      const state = applyInputWithModifiers(
        createInitialEngineState(),
        input.symbolId,
        input.modifiers,
      )

      expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe(expected)
    }
  })

  it('renders the pieup-sios-giyeok example', () => {
    expect(
      render([
        INPUT_SYMBOL_IDS.BIEUP,
        INPUT_SYMBOL_IDS.SIOS,
        INPUT_SYMBOL_IDS.GIYEOK,
        INPUT_SYMBOL_IDS.U,
        INPUT_SYMBOL_IDS.RIEUL,
      ]),
    ).toBe('ᄢᅮᆯ')
  })

  it('renders the yu-a medial cluster example', () => {
    expect(
      render([
        INPUT_SYMBOL_IDS.GIYEOK,
        INPUT_SYMBOL_IDS.YU,
        INPUT_SYMBOL_IDS.A,
        INPUT_SYMBOL_IDS.NIEUN,
      ]),
    ).toBe('ᄀᆎᆫ')
  })

  it('renders the i-ya medial cluster example', () => {
    expect(
      render([
        INPUT_SYMBOL_IDS.THIEUTH,
        INPUT_SYMBOL_IDS.I,
        INPUT_SYMBOL_IDS.YA,
        INPUT_SYMBOL_IDS.NIEUN,
      ]),
    ).toBe('ᄐᆙᆫ')
  })

  it('promotes archaic initial clusters from sequential input', () => {
    expect(render([INPUT_SYMBOL_IDS.NIEUN, INPUT_SYMBOL_IDS.GIYEOK])).toBe('ᄓ')
    expect(
      render([INPUT_SYMBOL_IDS.RIEUL, INPUT_SYMBOL_IDS.GIYEOK, INPUT_SYMBOL_IDS.GIYEOK]),
    ).toBe('ꥥ')
  })

  it('greedily segments onset-only input into separate initial letters when no larger cluster exists', () => {
    expect(
      render([
        INPUT_SYMBOL_IDS.RIEUL,
        INPUT_SYMBOL_IDS.IEUNG,
        INPUT_SYMBOL_IDS.KHIEUKH,
        INPUT_SYMBOL_IDS.KHIEUKH,
      ]),
    ).toBe('ᄛᄏᄏ')

    expect(render([INPUT_SYMBOL_IDS.GIYEOK, INPUT_SYMBOL_IDS.NIEUN])).toBe('ᄀᄂ')
  })

  it('promotes archaic medial clusters from sequential input', () => {
    expect(render([INPUT_SYMBOL_IDS.O, INPUT_SYMBOL_IDS.O, INPUT_SYMBOL_IDS.I])).toBe('ힱ')
    expect(render([INPUT_SYMBOL_IDS.A, INPUT_SYMBOL_IDS.EU])).toBe('ᆣ')
  })

  it('promotes archaic final clusters from sequential input', () => {
    expect(render([INPUT_SYMBOL_IDS.GIYEOK, INPUT_SYMBOL_IDS.A, INPUT_SYMBOL_IDS.GIYEOK, INPUT_SYMBOL_IDS.RIEUL])).toBe('가ᇃ')
    expect(render([INPUT_SYMBOL_IDS.GIYEOK, INPUT_SYMBOL_IDS.A, INPUT_SYMBOL_IDS.MIEUM, INPUT_SYMBOL_IDS.MIEUM])).toBe('가ퟠ')
  })

  it('keeps sequential input deterministic for the same key sequence', () => {
    const sequence = [
      INPUT_SYMBOL_IDS.NIEUN,
      INPUT_SYMBOL_IDS.GIYEOK,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.CHIEUCH,
    ]

    expect(render(sequence)).toBe(render(sequence))
  })

  it('undoes by input step', () => {
    const state = runSequence([
      INPUT_SYMBOL_IDS.BIEUP,
      INPUT_SYMBOL_IDS.SIOS,
      INPUT_SYMBOL_IDS.GIYEOK,
      INPUT_SYMBOL_IDS.BACKSPACE,
    ])

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᄡ')
  })

  it('deletes the final remaining symbol with backspace', () => {
    const state = runSequence([
      INPUT_SYMBOL_IDS.GIYEOK,
      INPUT_SYMBOL_IDS.BACKSPACE,
    ])

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('')
  })

  it('does not revive a consumed oneshot shift after backspace undo', () => {
    const state = applyInput(
      applyInputWithModifiers(
        createInitialEngineState(),
        INPUT_SYMBOL_IDS.RIEUL,
        { leftShift: true },
      ),
      INPUT_SYMBOL_IDS.BACKSPACE,
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('')
    expect(state.modifierState.leftShift).toBe('off')
  })

  it('preserves locked modifiers through backspace undo', () => {
    const lockedState = setModifierMode(createInitialEngineState(), 'leftShift', 'locked')
    const state = applyInput(
      applyInput(lockedState, INPUT_SYMBOL_IDS.RIEUL),
      INPUT_SYMBOL_IDS.BACKSPACE,
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('')
    expect(state.modifierState.leftShift).toBe('locked')
  })

  it('passes literal latin text through without qwerty-to-hangul remapping', () => {
    const state = applyLiteralInput(
      applyLiteralInput(
        applyLiteralInput(createInitialEngineState(), 'r'),
        'k',
      ),
      's',
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('rks')
  })

  it('inserts a plain space when space is pressed without ctrl', () => {
    expect(
      render([
        INPUT_SYMBOL_IDS.GIYEOK,
        INPUT_SYMBOL_IDS.A,
        INPUT_SYMBOL_IDS.SPACE,
        INPUT_SYMBOL_IDS.NIEUN,
        INPUT_SYMBOL_IDS.A,
      ]),
    ).toBe('가 나')
  })

  it('reparses final consonant when a following vowel is typed', () => {
    expect(
      render([
        INPUT_SYMBOL_IDS.GIYEOK,
        INPUT_SYMBOL_IDS.A,
        INPUT_SYMBOL_IDS.NIEUN,
        INPUT_SYMBOL_IDS.A,
      ]),
    ).toBe('가나')
  })

  it('rolls back reparsing when the vowel is deleted', () => {
    const state = runSequence([
      INPUT_SYMBOL_IDS.GIYEOK,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.NIEUN,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.BACKSPACE,
    ])

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('간')
  })

  it('restores a reparsed compound-final boundary exactly after literal undo', () => {
    const reparseState = runSequence([
      INPUT_SYMBOL_IDS.GIYEOK,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.BIEUP,
      INPUT_SYMBOL_IDS.SIOS,
      INPUT_SYMBOL_IDS.A,
    ])

    const withLiteral = applyLiteralInput(reparseState, 'X')
    expect(jamoIdsToUnicode([...withLiteral.committed, ...withLiteral.active.jamoIds])).toBe(
      '갑사X',
    )

    const undone = applyInput(withLiteral, INPUT_SYMBOL_IDS.BACKSPACE)
    expect(jamoIdsToUnicode([...undone.committed, ...undone.active.jamoIds])).toBe('갑사')
  })

  it('keeps recursive carry plus contextual macro boundaries stable under undo', () => {
    const reparseState = runSequence([
      INPUT_SYMBOL_IDS.GIYEOK,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.BIEUP,
      INPUT_SYMBOL_IDS.SIOS,
      INPUT_SYMBOL_IDS.A,
    ])

    const macroState = applyInputWithModifiers(
      reparseState,
      INPUT_SYMBOL_IDS.MIEUM,
      { leftShift: true },
    )

    expect(jamoIdsToUnicode([...macroState.committed, ...macroState.active.jamoIds])).toBe(
      '갑사ퟠ',
    )

    const undone = applyInput(macroState, INPUT_SYMBOL_IDS.BACKSPACE)
    expect(jamoIdsToUnicode([...undone.committed, ...undone.active.jamoIds])).toBe('갑사')
  })

  it('maps ctrl + ieung to old ieung', () => {
    const state = applyInputWithModifiers(
      createInitialEngineState(),
      INPUT_SYMBOL_IDS.IEUNG,
      { leftCtrl: true },
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᅌ')
  })

  it('maps ctrl + ieung to final old ieung when a syllable already has a medial', () => {
    let state = applyInputWithModifiers(
      createInitialEngineState(),
      INPUT_SYMBOL_IDS.IEUNG,
      { leftCtrl: true },
    )
    state = applyInput(state, INPUT_SYMBOL_IDS.A)
    state = applyInputWithModifiers(state, INPUT_SYMBOL_IDS.IEUNG, { leftCtrl: true })

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᅌᅡᇰ')
  })

  it('maps ctrl + ieung to an initial old ieung after a syllable already has a final', () => {
    let state = runSequence([
      INPUT_SYMBOL_IDS.GIYEOK,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.NIEUN,
    ])
    state = applyInputWithModifiers(state, INPUT_SYMBOL_IDS.IEUNG, { leftCtrl: true })

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('간ᅌ')
  })

  it('ignores additional tone input once a syllable already has a tone mark', () => {
    const state = runSequence([
      INPUT_SYMBOL_IDS.RIEUL,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.SIOS,
      INPUT_SYMBOL_IDS.TONE_SINGLE,
      INPUT_SYMBOL_IDS.TONE_SINGLE,
      INPUT_SYMBOL_IDS.TONE_DOUBLE,
    ])

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('랏〮')
  })

  it('allows a tone mark to be reapplied after it is removed with backspace', () => {
    const state = runSequence([
      INPUT_SYMBOL_IDS.RIEUL,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.SIOS,
      INPUT_SYMBOL_IDS.TONE_SINGLE,
      INPUT_SYMBOL_IDS.BACKSPACE,
      INPUT_SYMBOL_IDS.TONE_SINGLE,
    ])

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('랏〮')
  })

  it('commits a standalone medial after a toned syllable before starting the next consonant-led syllable', () => {
    const state = runSequence([
      INPUT_SYMBOL_IDS.CIEUC,
      INPUT_SYMBOL_IDS.YA,
      INPUT_SYMBOL_IDS.IEUNG,
      INPUT_SYMBOL_IDS.TONE_DOUBLE,
      INPUT_SYMBOL_IDS.I,
      INPUT_SYMBOL_IDS.DIGEUT,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.IEUNG,
    ])

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('쟝〯ᅵ당')
  })

  it('ignores tone input when there is no medial-bearing syllable to attach to', () => {
    const state = runSequence([
      INPUT_SYMBOL_IDS.RIEUL,
      INPUT_SYMBOL_IDS.TONE_SINGLE,
    ])

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᄅ')
  })

  it('maps shift + chieuch to banchieum', () => {
    const state = applyInputWithModifiers(
      createInitialEngineState(),
      INPUT_SYMBOL_IDS.CHIEUCH,
      { leftShift: true },
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᅀ')
  })

  it('maps left ctrl + shift + sios to chidueum ssangsios', () => {
    const state = applyInputWithModifiers(
      createInitialEngineState(),
      INPUT_SYMBOL_IDS.SIOS,
      { leftCtrl: true, leftShift: true },
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᄽ')
  })

  it('maps shift + o to double o', () => {
    const state = applyInputWithModifiers(
      createInitialEngineState(),
      INPUT_SYMBOL_IDS.O,
      { leftShift: true },
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᆂ')
  })

  it('maps ctrl + shift + hieuh to ssang-yeorinhieuh', () => {
    const state = applyInputWithModifiers(
      createInitialEngineState(),
      INPUT_SYMBOL_IDS.HIEUH,
      { leftCtrl: true, leftShift: true },
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ꥼ')
  })

  it('maps ctrl + shift + a to ssang-araea', () => {
    const state = applyInputWithModifiers(
      createInitialEngineState(),
      INPUT_SYMBOL_IDS.A,
      { leftCtrl: true, leftShift: true },
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᆢ')
  })

  it('uses shift + mieum as contextual macro after an initial', () => {
    const state = applyInputWithModifiers(
      applyInput(createInitialEngineState(), INPUT_SYMBOL_IDS.GIYEOK),
      INPUT_SYMBOL_IDS.MIEUM,
      { leftShift: true },
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᄀᅠퟠ')
  })

  it('uses shift + mieum as contextual macro after an initial and medial', () => {
    const next = applyInputWithModifiers(
      runSequence([INPUT_SYMBOL_IDS.GIYEOK, INPUT_SYMBOL_IDS.A]),
      INPUT_SYMBOL_IDS.MIEUM,
      { leftShift: true },
    )

    expect(jamoIdsToUnicode([...next.committed, ...next.active.jamoIds])).toBe('가ퟠ')
  })

  it('uses shift + mieum as contextual macro when only a medial exists', () => {
    const state = applyInputWithModifiers(
      runSequence([INPUT_SYMBOL_IDS.A]),
      INPUT_SYMBOL_IDS.MIEUM,
      { leftShift: true },
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᅟᅡퟠ')
  })

  it('uses shift + mieum as contextual macro from an empty state', () => {
    const state = applyInputWithModifiers(
      createInitialEngineState(),
      INPUT_SYMBOL_IDS.MIEUM,
      { leftShift: true },
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᅟᅠퟠ')
  })

  it('uses shift + mieum as contextual macro after literal text by starting a filled syllable', () => {
    const state = applyInputWithModifiers(
      applyLiteralInput(createInitialEngineState(), 'A'),
      INPUT_SYMBOL_IDS.MIEUM,
      { leftShift: true },
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('Aᅟᅠퟠ')
  })

  it('uses shift + mieum as contextual macro after a completed syllable', () => {
    const state = applyInputWithModifiers(
      runSequence([INPUT_SYMBOL_IDS.GIYEOK, INPUT_SYMBOL_IDS.A, INPUT_SYMBOL_IDS.NIEUN]),
      INPUT_SYMBOL_IDS.MIEUM,
      { leftShift: true },
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('간ᅟᅠퟠ')
  })

  it('undoes contextual shift + mieum as a single input step', () => {
    const state = applyInput(
      applyInputWithModifiers(
        runSequence([INPUT_SYMBOL_IDS.GIYEOK, INPUT_SYMBOL_IDS.A]),
        INPUT_SYMBOL_IDS.MIEUM,
        { leftShift: true },
      ),
      INPUT_SYMBOL_IDS.BACKSPACE,
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('가')
  })

  it('undoes contextual shift + mieum as a single input step from an empty state', () => {
    const state = applyInput(
      applyInputWithModifiers(
        createInitialEngineState(),
        INPUT_SYMBOL_IDS.MIEUM,
        { leftShift: true },
      ),
      INPUT_SYMBOL_IDS.BACKSPACE,
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('')
  })

  it('undoes contextual shift + mieum as a single input step after a completed syllable', () => {
    const state = applyInput(
      applyInputWithModifiers(
        runSequence([INPUT_SYMBOL_IDS.GIYEOK, INPUT_SYMBOL_IDS.A, INPUT_SYMBOL_IDS.NIEUN]),
        INPUT_SYMBOL_IDS.MIEUM,
        { leftShift: true },
      ),
      INPUT_SYMBOL_IDS.BACKSPACE,
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('간')
  })

  it('uses ctrl + space as contextual filler after an initial', () => {
    const state = applyContextualFiller(
      applyInput(createInitialEngineState(), INPUT_SYMBOL_IDS.GIYEOK),
    )

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᄀᅠ')
  })

  it('uses ctrl + space as choseong filler from an empty state', () => {
    const state = applyContextualFiller(createInitialEngineState())

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᅟ')
  })

  it('uses ctrl + space as choseong filler when only a medial exists', () => {
    const state = applyContextualFiller(runSequence([INPUT_SYMBOL_IDS.A]))

    expect(jamoIdsToUnicode([...state.committed, ...state.active.jamoIds])).toBe('ᅟᅡ')
  })

  it('starts a new filled syllable when a non-composable vowel follows a completed syllable', () => {
    expect(
      render([
        INPUT_SYMBOL_IDS.NIEUN,
        INPUT_SYMBOL_IDS.GIYEOK,
        INPUT_SYMBOL_IDS.A,
        INPUT_SYMBOL_IDS.A,
        INPUT_SYMBOL_IDS.CHIEUCH,
      ]),
    ).toBe('ᄓᅡᅟᅡᆾ')
  })

  it('builds modern compound vowels across the full medial range', () => {
    expect(
      render([
        INPUT_SYMBOL_IDS.GIYEOK,
        INPUT_SYMBOL_IDS.O,
        INPUT_SYMBOL_IDS.A,
        INPUT_SYMBOL_IDS.I,
      ]),
    ).toBe('괘')
  })

  it('builds modern compound finals across the full jongseong range', () => {
    expect(
      render([
        INPUT_SYMBOL_IDS.GIYEOK,
        INPUT_SYMBOL_IDS.A,
        INPUT_SYMBOL_IDS.BIEUP,
        INPUT_SYMBOL_IDS.SIOS,
      ]),
    ).toBe('값')
  })

  it('reparses the last consonant of a compound final when a vowel follows', () => {
    expect(
      render([
        INPUT_SYMBOL_IDS.GIYEOK,
        INPUT_SYMBOL_IDS.A,
        INPUT_SYMBOL_IDS.BIEUP,
        INPUT_SYMBOL_IDS.SIOS,
        INPUT_SYMBOL_IDS.A,
      ]),
    ).toBe('갑사')
  })

  it('normalizes pasted compatibility jamo', () => {
    expect(normalizePastedTextToInputSymbols('ㄱㅠㅏㄴ')).toEqual([
      INPUT_SYMBOL_IDS.GIYEOK,
      INPUT_SYMBOL_IDS.YU,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.NIEUN,
    ])
  })

  it('exposes the engine-level unicode mapper for interoperability boundaries', () => {
    expect(normalizeUnicodeToInputSymbols('값')).toEqual([
      INPUT_SYMBOL_IDS.GIYEOK,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.BIEUP,
      INPUT_SYMBOL_IDS.SIOS,
    ])
  })

  it('normalizes pasted precomposed modern hangul into input symbols', () => {
    expect(normalizePastedTextToInputSymbols('간')).toEqual([
      INPUT_SYMBOL_IDS.GIYEOK,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.NIEUN,
    ])
  })

  it('normalizes pasted complex precomposed hangul with compound final', () => {
    expect(normalizePastedTextToInputSymbols('값')).toEqual([
      INPUT_SYMBOL_IDS.GIYEOK,
      INPUT_SYMBOL_IDS.A,
      INPUT_SYMBOL_IDS.BIEUP,
      INPUT_SYMBOL_IDS.SIOS,
    ])
  })

  it('normalizes pasted archaic direct jamo', () => {
    expect(normalizePastedTextToInputSymbols('ᅀᆢ')).toEqual([
      INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_BANCHIEUM,
      INPUT_SYMBOL_IDS.SPECIAL_SHIFT_SSANGARAEA,
    ])
  })

  it('matches the target inventory counts for old hangul scope', () => {
    expect(TARGET_INVENTORY_COUNTS).toEqual({
      initial: 125,
      medial: 95,
      final: 138,
    })
  })

  it('stores the full target inventory without duplicates', () => {
    expect(new Set(TARGET_INVENTORY.initial.map((entry) => entry.codePoint)).size).toBe(125)
    expect(new Set(TARGET_INVENTORY.medial.map((entry) => entry.codePoint)).size).toBe(95)
    expect(new Set(TARGET_INVENTORY.final.map((entry) => entry.codePoint)).size).toBe(138)
  })

  it('reports 100 percent inventory coverage with no missing samples', () => {
    expect(TARGET_INVENTORY_COVERAGE.initial.supportedCount).toBe(125)
    expect(TARGET_INVENTORY_COVERAGE.initial.missingCount).toBe(0)
    expect(TARGET_INVENTORY_COVERAGE.initial.missing).toEqual([])

    expect(TARGET_INVENTORY_COVERAGE.medial.supportedCount).toBe(95)
    expect(TARGET_INVENTORY_COVERAGE.medial.missingCount).toBe(0)
    expect(TARGET_INVENTORY_COVERAGE.medial.missing).toEqual([])

    expect(TARGET_INVENTORY_COVERAGE.final.supportedCount).toBe(138)
    expect(TARGET_INVENTORY_COVERAGE.final.missingCount).toBe(0)
    expect(TARGET_INVENTORY_COVERAGE.final.missing).toEqual([])

    expect(TARGET_AUXILIARY_COVERAGE.supportedCount).toBe(4)
    expect(TARGET_AUXILIARY_COVERAGE.missingCount).toBe(0)
    expect(TARGET_AUXILIARY_COVERAGE.missing).toEqual([])
  })

  it('normalizes pasted direct archaic initial jamo from the target inventory', () => {
    expect(normalizePastedTextToInputSymbols('ᄓ').length).toBe(1)
  })

  it('normalizes pasted direct archaic medial jamo from the target inventory', () => {
    expect(normalizePastedTextToInputSymbols('ᅶ').length).toBe(1)
  })

  it('normalizes pasted direct archaic final jamo from the target inventory', () => {
    expect(normalizePastedTextToInputSymbols('ᇃ').length).toBe(1)
  })

  it('normalizes every target initial jamo in the direct inventory', () => {
    for (const entry of TARGET_INVENTORY.initial) {
      expect(normalizePastedTextToInputSymbols(entry.char).length).toBeGreaterThan(0)
    }
  })

  it('normalizes every target medial jamo in the direct inventory', () => {
    for (const entry of TARGET_INVENTORY.medial) {
      expect(normalizePastedTextToInputSymbols(entry.char).length).toBeGreaterThan(0)
    }
  })

  it('normalizes every target final jamo in the direct inventory', () => {
    for (const entry of TARGET_INVENTORY.final) {
      expect(normalizePastedTextToInputSymbols(entry.char).length).toBeGreaterThan(0)
    }
  })

  it('round-trips every target initial jamo exactly through normalize -> engine -> unicode', () => {
    for (const entry of TARGET_INVENTORY.initial) {
      expect(roundTrip(entry.char)).toBe(entry.char)
    }
  })

  it('round-trips every target medial jamo exactly through normalize -> engine -> unicode', () => {
    for (const entry of TARGET_INVENTORY.medial) {
      expect(roundTrip(entry.char)).toBe(entry.char)
    }
  })

  it('canonicalizes standalone base final jamo toward initial-bearing forms', () => {
    for (const char of BASE_FINAL_TARGET_CHARS) {
      expect(roundTrip(char)).not.toBe(char)
    }
  })

  it('round-trips standalone final-only primitives exactly through normalize -> engine -> unicode', () => {
    for (const entry of PRIMITIVE_FINALS) {
      if (BASE_FINAL_TARGET_CHARS.includes(entry.char) || MEDIAL_ONLY_OVERLAP_CHARS.has(entry.char)) {
        continue
      }
      expect(roundTrip(entry.char)).toBe(entry.char)
    }
  })

  it('treats tone marks as context-sensitive marks rather than standalone round-trip symbols', () => {
    expect(normalizeUnicodeToInputSymbols('〮')).toEqual([INPUT_SYMBOL_IDS.TONE_SINGLE])
    expect(normalizeUnicodeToInputSymbols('〯')).toEqual([INPUT_SYMBOL_IDS.TONE_DOUBLE])
    expect(roundTrip('〮')).toBe('')
    expect(roundTrip('〯')).toBe('')
  })

  it('promotes every archaic initial rule from sequential input', () => {
    for (const entry of ARCHAIC_INITIAL_RULES) {
      expect(render(entry.sequence)).toBe(entry.char)
    }
  })

  it('promotes every archaic medial rule from sequential input', () => {
    for (const entry of ARCHAIC_MEDIAL_RULES) {
      expect(render(entry.sequence)).toBe(entry.char)
    }
  })

  it('promotes every archaic final rule from sequential input', () => {
    for (const entry of ARCHAIC_FINAL_RULES) {
      expect(
        render([INPUT_SYMBOL_IDS.GIYEOK, INPUT_SYMBOL_IDS.A, ...entry.sequence]),
      ).toBe(`가${entry.char}`)
    }
  })

  it('renders every primitive initial entry from its direct sequence', () => {
    for (const entry of PRIMITIVE_INITIALS) {
      expect(render(entry.sequence)).toBe(entry.char)
    }
  })

  it('renders every primitive medial entry from its direct sequence', () => {
    for (const entry of PRIMITIVE_MEDIALS) {
      expect(render(entry.sequence)).toBe(entry.char)
    }
  })

  it('renders every primitive final entry from its direct sequence', () => {
    for (const entry of PRIMITIVE_FINALS) {
      expect(render([INPUT_SYMBOL_IDS.GIYEOK, INPUT_SYMBOL_IDS.A, ...entry.sequence])).toBe(
        `가${entry.char}`,
      )
    }
  })

  it('covers every target initial with a primitive or rule path', () => {
    const covered = new Set([
      ...PRIMITIVE_INITIALS.map((entry) => entry.char),
      ...ARCHAIC_INITIAL_RULES.map((entry) => entry.char),
    ])

    for (const entry of TARGET_INVENTORY.initial) {
      expect(covered.has(entry.char)).toBe(true)
    }
  })

  it('covers every target medial with a primitive or rule path', () => {
    const covered = new Set([
      ...PRIMITIVE_MEDIALS.map((entry) => entry.char),
      ...ARCHAIC_MEDIAL_RULES.map((entry) => entry.char),
    ])

    for (const entry of TARGET_INVENTORY.medial) {
      expect(covered.has(entry.char)).toBe(true)
    }
  })

  it('covers every target final with a primitive or rule path', () => {
    const covered = new Set([
      ...PRIMITIVE_FINALS.map((entry) => entry.char),
      ...ARCHAIC_FINAL_RULES.map((entry) => entry.char),
    ])

    for (const entry of TARGET_INVENTORY.final) {
      expect(covered.has(entry.char)).toBe(true)
    }
  })

})
