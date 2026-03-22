import { BASE_FINAL_TARGET_CHARS, BASE_INITIAL_TARGET_CHARS, BASE_MEDIAL_TARGET_CHARS } from '@/engine/tables/baseInventoryCoverage'
import { TARGET_INVENTORY, toInventorySymbolName } from '@/engine/tables/inventoryCatalog'
import { INPUT_SYMBOL_IDS } from '@/engine/tables/inputSymbolTable'

const COMPATIBILITY_TO_SYMBOL: Record<string, number> = {
  'ㄱ': INPUT_SYMBOL_IDS.GIYEOK,
  'ㄲ': INPUT_SYMBOL_IDS.SPECIAL_SHIFT_GIYEOK,
  'ㄴ': INPUT_SYMBOL_IDS.NIEUN,
  'ㄷ': INPUT_SYMBOL_IDS.DIGEUT,
  'ㄸ': INPUT_SYMBOL_IDS.SPECIAL_SHIFT_DIGEUT,
  'ㄹ': INPUT_SYMBOL_IDS.RIEUL,
  'ㅁ': INPUT_SYMBOL_IDS.MIEUM,
  'ㅂ': INPUT_SYMBOL_IDS.BIEUP,
  'ㅃ': INPUT_SYMBOL_IDS.SPECIAL_SHIFT_BIEUP,
  'ㅅ': INPUT_SYMBOL_IDS.SIOS,
  'ㅆ': INPUT_SYMBOL_IDS.SPECIAL_SHIFT_SIOS,
  'ㅇ': INPUT_SYMBOL_IDS.IEUNG,
  'ㅈ': INPUT_SYMBOL_IDS.CIEUC,
  'ㅉ': INPUT_SYMBOL_IDS.SSANGCIEUC,
  'ㅊ': INPUT_SYMBOL_IDS.CHIEUCH,
  'ㅋ': INPUT_SYMBOL_IDS.KHIEUKH,
  'ㅌ': INPUT_SYMBOL_IDS.THIEUTH,
  'ㅍ': INPUT_SYMBOL_IDS.PHIEUPH,
  'ㅎ': INPUT_SYMBOL_IDS.HIEUH,
  'ㅏ': INPUT_SYMBOL_IDS.A,
  'ㅐ': INPUT_SYMBOL_IDS.AE,
  'ㅑ': INPUT_SYMBOL_IDS.YA,
  'ㅒ': INPUT_SYMBOL_IDS.YAE,
  'ㅓ': INPUT_SYMBOL_IDS.EO,
  'ㅔ': INPUT_SYMBOL_IDS.E,
  'ㅕ': INPUT_SYMBOL_IDS.YEO,
  'ㅖ': INPUT_SYMBOL_IDS.YE,
  'ㅛ': INPUT_SYMBOL_IDS.YO,
  'ㅣ': INPUT_SYMBOL_IDS.I,
  'ㅠ': INPUT_SYMBOL_IDS.YU,
  'ㅜ': INPUT_SYMBOL_IDS.U,
  'ㅗ': INPUT_SYMBOL_IDS.O,
  'ㅡ': INPUT_SYMBOL_IDS.EU,
}

const CONJOINING_TO_SYMBOL: Record<string, number[]> = {
  'ᄀ': [INPUT_SYMBOL_IDS.GIYEOK],
  'ᄁ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_GIYEOK],
  'ᄂ': [INPUT_SYMBOL_IDS.NIEUN],
  'ᄔ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_NIEUN],
  'ᄃ': [INPUT_SYMBOL_IDS.DIGEUT],
  'ᄄ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_DIGEUT],
  'ᄅ': [INPUT_SYMBOL_IDS.RIEUL],
  'ᄙ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_RIEUL],
  'ᄆ': [INPUT_SYMBOL_IDS.MIEUM],
  'ᄇ': [INPUT_SYMBOL_IDS.BIEUP],
  'ᄈ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_BIEUP],
  'ᄉ': [INPUT_SYMBOL_IDS.SIOS],
  'ᄊ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_SIOS],
  'ᄋ': [INPUT_SYMBOL_IDS.IEUNG],
  'ᄌ': [INPUT_SYMBOL_IDS.CIEUC],
  'ᄍ': [INPUT_SYMBOL_IDS.SSANGCIEUC],
  'ᄎ': [INPUT_SYMBOL_IDS.CHIEUCH],
  'ᄏ': [INPUT_SYMBOL_IDS.KHIEUKH],
  'ᄐ': [INPUT_SYMBOL_IDS.THIEUTH],
  'ᄑ': [INPUT_SYMBOL_IDS.PHIEUPH],
  'ᄒ': [INPUT_SYMBOL_IDS.HIEUH],
  'ᄢ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_PIEUP_SIOS_GIYEOK],
  'ᄼ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SIOS],
  'ᄾ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SIOS],
  'ᄽ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SSANGSIOS],
  'ᄿ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SSANGSIOS],
  'ᅀ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_BANCHIEUM],
  'ᅌ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_OLD_IEUNG],
  'ᅇ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_IEUNG],
  'ᅎ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_CIEUC],
  'ᅐ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_CIEUC],
  'ᅏ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SSANGCIEUC],
  'ᅑ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SSANGCIEUC],
  'ᅔ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_CHIEUCH],
  'ᅕ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_CHIEUCH],
  'ꥹ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_THIEUTH],
  'ᅘ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_HIEUH],
  'ᅙ': [INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_YEORINHIEUH],
  'ꥼ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_YEORINHIEUH],
  'ᅟ': [INPUT_SYMBOL_IDS.CHOSEONG_FILLER],
  'ᅡ': [INPUT_SYMBOL_IDS.A],
  'ᅢ': [INPUT_SYMBOL_IDS.AE],
  'ᅣ': [INPUT_SYMBOL_IDS.YA],
  'ᅤ': [INPUT_SYMBOL_IDS.YAE],
  'ᅥ': [INPUT_SYMBOL_IDS.EO],
  'ᅦ': [INPUT_SYMBOL_IDS.E],
  'ᅧ': [INPUT_SYMBOL_IDS.YEO],
  'ᅨ': [INPUT_SYMBOL_IDS.YE],
  'ᅩ': [INPUT_SYMBOL_IDS.O],
  'ᅪ': [INPUT_SYMBOL_IDS.O, INPUT_SYMBOL_IDS.A],
  'ᅫ': [INPUT_SYMBOL_IDS.O, INPUT_SYMBOL_IDS.AE],
  'ᅬ': [INPUT_SYMBOL_IDS.O, INPUT_SYMBOL_IDS.I],
  'ᅭ': [INPUT_SYMBOL_IDS.YO],
  'ᅮ': [INPUT_SYMBOL_IDS.U],
  'ᅯ': [INPUT_SYMBOL_IDS.U, INPUT_SYMBOL_IDS.EO],
  'ᅰ': [INPUT_SYMBOL_IDS.U, INPUT_SYMBOL_IDS.E],
  'ᅱ': [INPUT_SYMBOL_IDS.U, INPUT_SYMBOL_IDS.I],
  'ᅲ': [INPUT_SYMBOL_IDS.YU],
  'ᅳ': [INPUT_SYMBOL_IDS.EU],
  'ᅴ': [INPUT_SYMBOL_IDS.EU, INPUT_SYMBOL_IDS.I],
  'ᅵ': [INPUT_SYMBOL_IDS.I],
  'ᆞ': [INPUT_SYMBOL_IDS.ARAEA],
  'ᆢ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_SSANGARAEA],
  'ᆂ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_O],
  'ᆍ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_U],
  'ᆖ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_EU],
  'ᆎ': [INPUT_SYMBOL_IDS.SPECIAL_JUNGSEONG_YU_A],
  'ᆙ': [INPUT_SYMBOL_IDS.SPECIAL_JUNGSEONG_I_YA],
  'ퟄ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_I],
  'ᅠ': [INPUT_SYMBOL_IDS.JUNGSEONG_FILLER],
  'ᆨ': [INPUT_SYMBOL_IDS.GIYEOK],
  'ᆩ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_GIYEOK],
  'ᆪ': [INPUT_SYMBOL_IDS.GIYEOK, INPUT_SYMBOL_IDS.SIOS],
  'ᆫ': [INPUT_SYMBOL_IDS.NIEUN],
  'ᆬ': [INPUT_SYMBOL_IDS.NIEUN, INPUT_SYMBOL_IDS.CIEUC],
  'ᆭ': [INPUT_SYMBOL_IDS.NIEUN, INPUT_SYMBOL_IDS.HIEUH],
  'ᆮ': [INPUT_SYMBOL_IDS.DIGEUT],
  'ᆯ': [INPUT_SYMBOL_IDS.RIEUL],
  'ᆰ': [INPUT_SYMBOL_IDS.RIEUL, INPUT_SYMBOL_IDS.GIYEOK],
  'ᆱ': [INPUT_SYMBOL_IDS.RIEUL, INPUT_SYMBOL_IDS.MIEUM],
  'ᆲ': [INPUT_SYMBOL_IDS.RIEUL, INPUT_SYMBOL_IDS.BIEUP],
  'ᆳ': [INPUT_SYMBOL_IDS.RIEUL, INPUT_SYMBOL_IDS.SIOS],
  'ᆴ': [INPUT_SYMBOL_IDS.RIEUL, INPUT_SYMBOL_IDS.THIEUTH],
  'ᆵ': [INPUT_SYMBOL_IDS.RIEUL, INPUT_SYMBOL_IDS.PHIEUPH],
  'ᆶ': [INPUT_SYMBOL_IDS.RIEUL, INPUT_SYMBOL_IDS.HIEUH],
  'ᆷ': [INPUT_SYMBOL_IDS.MIEUM],
  'ퟠ': [INPUT_SYMBOL_IDS.SHIFT_MIEUM],
  'ᆸ': [INPUT_SYMBOL_IDS.BIEUP],
  'ᆹ': [INPUT_SYMBOL_IDS.BIEUP, INPUT_SYMBOL_IDS.SIOS],
  'ᆺ': [INPUT_SYMBOL_IDS.SIOS],
  'ᆻ': [INPUT_SYMBOL_IDS.SPECIAL_SHIFT_SIOS],
  'ᆼ': [INPUT_SYMBOL_IDS.IEUNG],
  'ᆽ': [INPUT_SYMBOL_IDS.CIEUC],
  'ᆾ': [INPUT_SYMBOL_IDS.CHIEUCH],
  'ᆿ': [INPUT_SYMBOL_IDS.KHIEUKH],
  'ᇀ': [INPUT_SYMBOL_IDS.THIEUTH],
  'ᇁ': [INPUT_SYMBOL_IDS.PHIEUPH],
  'ᇂ': [INPUT_SYMBOL_IDS.HIEUH],
  '〮': [INPUT_SYMBOL_IDS.TONE_SINGLE],
  '〯': [INPUT_SYMBOL_IDS.TONE_DOUBLE],
}

const DIRECT_TARGET_TO_SYMBOL: Record<string, number[]> = {}

function registerDirectTargetSymbols(entries: readonly { char: string }[], symbolLookup: (char: string) => number) {
  for (const entry of entries) {
    if (DIRECT_TARGET_TO_SYMBOL[entry.char] != null) {
      continue
    }

    DIRECT_TARGET_TO_SYMBOL[entry.char] = [symbolLookup(entry.char)]
  }
}

registerDirectTargetSymbols(
  TARGET_INVENTORY.initial.filter((entry) => !BASE_INITIAL_TARGET_CHARS.includes(entry.char)),
  (char) => INPUT_SYMBOL_IDS[toInventorySymbolName({ kind: 'initial', char, codePoint: char.codePointAt(0) ?? 0, label: `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}` })],
)
registerDirectTargetSymbols(
  TARGET_INVENTORY.medial.filter((entry) => !BASE_MEDIAL_TARGET_CHARS.includes(entry.char)),
  (char) => INPUT_SYMBOL_IDS[toInventorySymbolName({ kind: 'medial', char, codePoint: char.codePointAt(0) ?? 0, label: `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}` })],
)
registerDirectTargetSymbols(
  TARGET_INVENTORY.final.filter((entry) => !BASE_FINAL_TARGET_CHARS.includes(entry.char)),
  (char) => INPUT_SYMBOL_IDS[toInventorySymbolName({ kind: 'final', char, codePoint: char.codePointAt(0) ?? 0, label: `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}` })],
)

const S_BASE = 0xac00
const L_BASE = 0x1100
const V_BASE = 0x1161
const T_BASE = 0x11a7
const N_COUNT = 588
const T_COUNT = 28
const S_COUNT = 11172

function decomposePrecomposedHangul(char: string) {
  const codePoint = char.codePointAt(0)

  if (codePoint == null) {
    return []
  }

  const sIndex = codePoint - S_BASE

  if (sIndex < 0 || sIndex >= S_COUNT) {
    return []
  }

  const lIndex = Math.floor(sIndex / N_COUNT)
  const vIndex = Math.floor((sIndex % N_COUNT) / T_COUNT)
  const tIndex = sIndex % T_COUNT
  const decomposed = [
    String.fromCodePoint(L_BASE + lIndex),
    String.fromCodePoint(V_BASE + vIndex),
  ]

  if (tIndex > 0) {
    decomposed.push(String.fromCodePoint(T_BASE + tIndex))
  }

  return decomposed
}

export function normalizeUnicodeToInputSymbols(text: string) {
  const normalized: number[] = []

  for (const char of text) {
    if (COMPATIBILITY_TO_SYMBOL[char] != null) {
      normalized.push(COMPATIBILITY_TO_SYMBOL[char])
      continue
    }

    if (DIRECT_TARGET_TO_SYMBOL[char] != null) {
      normalized.push(...DIRECT_TARGET_TO_SYMBOL[char])
      continue
    }

    if (CONJOINING_TO_SYMBOL[char] != null) {
      normalized.push(...CONJOINING_TO_SYMBOL[char])
      continue
    }

    const decomposed = decomposePrecomposedHangul(char)

    if (decomposed.length > 0) {
      for (const jamo of decomposed) {
        const mapped = CONJOINING_TO_SYMBOL[jamo]
        if (mapped != null) {
          normalized.push(...mapped)
        }
      }
    }
  }

  return normalized
}
