import type { InputSymbolId, StateId } from '@/engine/core/types'
import {
  DIRECT_FINAL_SYMBOL_IDS,
  DIRECT_INITIAL_SYMBOL_IDS,
  DIRECT_MEDIAL_SYMBOL_IDS,
} from '@/engine/tables/compositionTables'
import { INPUT_SYMBOL_COUNT, INPUT_SYMBOL_IDS } from '@/engine/tables/inputSymbolTable'

export type TransitionOperation =
  | 'append_initial'
  | 'append_medial'
  | 'append_final'
  | 'append_tone'
  | 'replace_initial_cluster'
  | 'replace_medial_cluster'
  | 'replace_final_cluster'
  | 'reparse_final_as_initial'
  | 'insert_filler_then_append'
  | 'commit_and_restart'

export type Transition = {
  nextStateId: StateId
  op: TransitionOperation
  data?: number[]
}

export type TransitionMap = Map<number, Transition>

export function toTransitionKey(
  stateId: StateId,
  inputSymbolId: InputSymbolId,
  inputSymbolCount: number,
) {
  return stateId * inputSymbolCount + inputSymbolId
}

export const STATE_IDS = Object.freeze({
  EMPTY: 0,
  INITIAL_ONLY: 1,
  MEDIAL_ONLY: 2,
  INITIAL_MEDIAL: 3,
  INITIAL_MEDIAL_FINAL: 4,
  TONE_ATTACHED: 5,
} as const)

function register(
  map: TransitionMap,
  stateId: StateId,
  inputSymbolId: InputSymbolId,
  transition: Transition,
) {
  map.set(toTransitionKey(stateId, inputSymbolId, INPUT_SYMBOL_COUNT), transition)
}

const CONSONANTS = [
  INPUT_SYMBOL_IDS.GIYEOK,
  INPUT_SYMBOL_IDS.DIGEUT,
  INPUT_SYMBOL_IDS.KHIEUKH,
  INPUT_SYMBOL_IDS.NIEUN,
  INPUT_SYMBOL_IDS.RIEUL,
  INPUT_SYMBOL_IDS.MIEUM,
  INPUT_SYMBOL_IDS.BIEUP,
  INPUT_SYMBOL_IDS.SIOS,
  INPUT_SYMBOL_IDS.IEUNG,
  INPUT_SYMBOL_IDS.CIEUC,
  INPUT_SYMBOL_IDS.SSANGCIEUC,
  INPUT_SYMBOL_IDS.CHIEUCH,
  INPUT_SYMBOL_IDS.THIEUTH,
  INPUT_SYMBOL_IDS.PHIEUPH,
  INPUT_SYMBOL_IDS.HIEUH,
  ...DIRECT_INITIAL_SYMBOL_IDS,
  ...DIRECT_FINAL_SYMBOL_IDS,
]

const VOWELS = [
  INPUT_SYMBOL_IDS.A,
  INPUT_SYMBOL_IDS.AE,
  INPUT_SYMBOL_IDS.YA,
  INPUT_SYMBOL_IDS.YAE,
  INPUT_SYMBOL_IDS.EO,
  INPUT_SYMBOL_IDS.E,
  INPUT_SYMBOL_IDS.YEO,
  INPUT_SYMBOL_IDS.YE,
  INPUT_SYMBOL_IDS.YO,
  INPUT_SYMBOL_IDS.I,
  INPUT_SYMBOL_IDS.YU,
  INPUT_SYMBOL_IDS.U,
  INPUT_SYMBOL_IDS.ARAEA,
  INPUT_SYMBOL_IDS.O,
  INPUT_SYMBOL_IDS.EU,
  ...DIRECT_MEDIAL_SYMBOL_IDS,
]

const SPECIAL_INITIALS = [
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_PIEUP_SIOS_GIYEOK,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SIOS,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SIOS,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SSANGSIOS,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SSANGSIOS,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_OLD_IEUNG,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_CIEUC,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_CIEUC,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SSANGCIEUC,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SSANGCIEUC,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_BANCHIEUM,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_CHIEUCH,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_CHIEUCH,
  INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_YEORINHIEUH,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_GIYEOK,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_DIGEUT,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_NIEUN,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_BIEUP,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_RIEUL,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_SIOS,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_IEUNG,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_CIEUC,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_THIEUTH,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_HIEUH,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_YEORINHIEUH,
  ...DIRECT_INITIAL_SYMBOL_IDS,
]

const SPECIAL_MEDIALS = [
  INPUT_SYMBOL_IDS.SPECIAL_JUNGSEONG_YU_A,
  INPUT_SYMBOL_IDS.SPECIAL_JUNGSEONG_I_YA,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_SSANGARAEA,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_O,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_U,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_EU,
  INPUT_SYMBOL_IDS.SPECIAL_SHIFT_I,
]

export function createTransitionMap(): TransitionMap {
  const map: TransitionMap = new Map()

  for (const symbolId of [...CONSONANTS, ...SPECIAL_INITIALS]) {
    register(map, STATE_IDS.EMPTY, symbolId, {
      nextStateId: STATE_IDS.INITIAL_ONLY,
      op: 'append_initial',
    })
    register(map, STATE_IDS.MEDIAL_ONLY, symbolId, {
      nextStateId: STATE_IDS.INITIAL_MEDIAL_FINAL,
      op: 'append_final',
    })
    register(map, STATE_IDS.INITIAL_MEDIAL, symbolId, {
      nextStateId: STATE_IDS.INITIAL_MEDIAL_FINAL,
      op: 'append_final',
    })
    register(map, STATE_IDS.INITIAL_MEDIAL_FINAL, symbolId, {
      nextStateId: STATE_IDS.INITIAL_MEDIAL_FINAL,
      op: 'replace_final_cluster',
    })
    register(map, STATE_IDS.TONE_ATTACHED, symbolId, {
      nextStateId: STATE_IDS.INITIAL_ONLY,
      op: 'commit_and_restart',
    })
  }

  for (const symbolId of [...VOWELS, ...SPECIAL_MEDIALS, INPUT_SYMBOL_IDS.JUNGSEONG_FILLER]) {
    register(map, STATE_IDS.EMPTY, symbolId, {
      nextStateId: STATE_IDS.MEDIAL_ONLY,
      op: 'append_medial',
    })
    register(map, STATE_IDS.INITIAL_ONLY, symbolId, {
      nextStateId: STATE_IDS.INITIAL_MEDIAL,
      op: 'append_medial',
    })
    register(map, STATE_IDS.INITIAL_MEDIAL_FINAL, symbolId, {
      nextStateId: STATE_IDS.INITIAL_MEDIAL,
      op: 'reparse_final_as_initial',
    })
    register(map, STATE_IDS.TONE_ATTACHED, symbolId, {
      nextStateId: STATE_IDS.MEDIAL_ONLY,
      op: 'commit_and_restart',
    })
  }

  register(map, STATE_IDS.EMPTY, INPUT_SYMBOL_IDS.CHOSEONG_FILLER, {
    nextStateId: STATE_IDS.INITIAL_ONLY,
    op: 'append_initial',
  })

  for (const symbolId of [...CONSONANTS, ...SPECIAL_INITIALS]) {
    register(map, STATE_IDS.INITIAL_ONLY, symbolId, {
      nextStateId: STATE_IDS.INITIAL_ONLY,
      op: 'replace_initial_cluster',
    })
  }

  for (const symbolId of [...VOWELS, ...SPECIAL_MEDIALS]) {
    register(map, STATE_IDS.MEDIAL_ONLY, symbolId, {
      nextStateId: STATE_IDS.MEDIAL_ONLY,
      op: 'replace_medial_cluster',
    })
    register(map, STATE_IDS.INITIAL_MEDIAL, symbolId, {
      nextStateId: STATE_IDS.INITIAL_MEDIAL,
      op: 'replace_medial_cluster',
    })
  }

  for (const toneId of [INPUT_SYMBOL_IDS.TONE_SINGLE, INPUT_SYMBOL_IDS.TONE_DOUBLE]) {
    register(map, STATE_IDS.MEDIAL_ONLY, toneId, {
      nextStateId: STATE_IDS.TONE_ATTACHED,
      op: 'append_tone',
    })
    register(map, STATE_IDS.INITIAL_MEDIAL, toneId, {
      nextStateId: STATE_IDS.TONE_ATTACHED,
      op: 'append_tone',
    })
    register(map, STATE_IDS.INITIAL_MEDIAL_FINAL, toneId, {
      nextStateId: STATE_IDS.TONE_ATTACHED,
      op: 'append_tone',
    })
  }

  register(map, STATE_IDS.EMPTY, INPUT_SYMBOL_IDS.SHIFT_MIEUM, {
    nextStateId: STATE_IDS.INITIAL_MEDIAL_FINAL,
    op: 'insert_filler_then_append',
  })

  return map
}

export const transitionMap = createTransitionMap()
