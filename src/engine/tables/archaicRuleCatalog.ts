import { INPUT_SYMBOL_IDS } from '@/engine/tables/inputSymbolTable'

type RuleEntry = {
  char: string
  sequence: number[]
}

const TOKEN_TO_INPUT: Record<string, number> = {
  'ㄱ': INPUT_SYMBOL_IDS.GIYEOK,
  'ㄴ': INPUT_SYMBOL_IDS.NIEUN,
  'ㄷ': INPUT_SYMBOL_IDS.DIGEUT,
  'ㄹ': INPUT_SYMBOL_IDS.RIEUL,
  'ㅁ': INPUT_SYMBOL_IDS.MIEUM,
  'ㅂ': INPUT_SYMBOL_IDS.BIEUP,
  'ㅅ': INPUT_SYMBOL_IDS.SIOS,
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
  'ㅗ': INPUT_SYMBOL_IDS.O,
  'ㅛ': INPUT_SYMBOL_IDS.YO,
  'ㅜ': INPUT_SYMBOL_IDS.U,
  'ㅠ': INPUT_SYMBOL_IDS.YU,
  'ㅡ': INPUT_SYMBOL_IDS.EU,
  'ㅣ': INPUT_SYMBOL_IDS.I,
  'ᄼ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SIOS,
  'ᄽ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SSANGSIOS,
  'ᄾ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SIOS,
  'ᄿ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SSANGSIOS,
  'ᅀ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_BANCHIEUM,
  'ᅌ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_OLD_IEUNG,
  'ᅎ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_CIEUC,
  'ᅏ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_SSANGCIEUC,
  'ᅐ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_CIEUC,
  'ᅑ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_SSANGCIEUC,
  'ᅔ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_CHIDUEUM_CHIEUCH,
  'ᅕ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_JEONGCHIEUM_CHIEUCH,
  'ᅙ': INPUT_SYMBOL_IDS.SPECIAL_CHOSEONG_YEORINHIEUH,
  'ᆞ': INPUT_SYMBOL_IDS.ARAEA,
  'HCF': INPUT_SYMBOL_IDS.CHOSEONG_FILLER,
  'HJF': INPUT_SYMBOL_IDS.JUNGSEONG_FILLER,
}

function parseRuleText(text: string) {
  const entries: RuleEntry[] = []
  const tokens = text.trim().split(/\s+/)

  for (let index = 0; index < tokens.length; index += 2) {
    const char = tokens[index]
    const decomposition = tokens[index + 1]

    if (!char || !decomposition) {
      continue
    }

    if (!decomposition.includes('+')) {
      continue
    }

    const sequence = decomposition
      .split('+')
      .map((token) => TOKEN_TO_INPUT[token])
      .filter((value): value is number => value != null)

    if (sequence.length > 1) {
      entries.push({ char, sequence })
    }
  }

  return entries
}

const INITIAL_RULE_TEXT = `
ᄁ ㄱ+ㄱ ᅚ ㄱ+ㄷ ᄓ ㄴ+ㄱ ᄔ ㄴ+ㄴ ᄕ ㄴ+ㄷ ᄖ ㄴ+ㅂ ᅛ ㄴ+ㅅ ᅜ ㄴ+ㅈ ᅝ ㄴ+ㅎ
ᄗ ㄷ+ㄱ ᄄ ㄷ+ㄷ ᅞ ㄷ+ㄹ ꥠ ㄷ+ㅁ ꥡ ㄷ+ㅂ ꥢ ㄷ+ㅅ ꥣ ㄷ+ㅈ
ꥤ ㄹ+ㄱ ꥥ ㄹ+ㄱ+ㄱ ᄘ ㄹ+ㄴ ꥦ ㄹ+ㄷ ꥧ ㄹ+ㄷ+ㄷ ᄙ ㄹ+ㄹ ꥨ ㄹ+ㅁ ꥩ ㄹ+ㅂ ꥪ ㄹ+ㅂ+ㅂ
ꥫ ㄹ+ㅂ+ㅇ ꥬ ㄹ+ㅅ ꥭ ㄹ+ㅈ ꥮ ㄹ+ㅋ ᄚ ㄹ+ㅎ ᄛ ㄹ+ㅇ
ꥯ ㅁ+ㄱ ꥰ ㅁ+ㄷ ᄜ ㅁ+ㅂ ꥱ ㅁ+ㅅ ᄝ ㅁ+ㅇ
ᄞ ㅂ+ㄱ ᄟ ㅂ+ㄴ ᄠ ㅂ+ㄷ ᄈ ㅂ+ㅂ ᄡ ㅂ+ㅅ ᄢ ㅂ+ㅅ+ㄱ ᄣ ㅂ+ㅅ+ㄷ ᄤ ㅂ+ㅅ+ㅂ ᄥ ㅂ+ㅅ+ㅅ
ᄦ ㅂ+ㅅ+ㅈ ꥲ ㅂ+ㅅ+ㅌ ᄧ ㅂ+ㅈ ᄨ ㅂ+ㅊ ꥳ ㅂ+ㅋ ᄩ ㅂ+ㅌ ᄪ ㅂ+ㅍ ꥴ ㅂ+ㅎ ᄫ ㅂ+ㅇ ᄬ ㅂ+ㅂ+ㅇ
ᄭ ㅅ+ㄱ ᄮ ㅅ+ㄴ ᄯ ㅅ+ㄷ ᄰ ㅅ+ㄹ ᄱ ㅅ+ㅁ ᄲ ㅅ+ㅂ ᄳ ㅅ+ㅂ+ㄱ ᄊ ㅅ+ㅅ ꥵ ㅅ+ㅅ+ㅂ ᄴ ㅅ+ㅅ+ㅅ
ᄵ ㅅ+ㅇ ᄶ ㅅ+ㅈ ᄷ ㅅ+ㅊ ᄸ ㅅ+ㅋ ᄹ ㅅ+ㅌ ᄺ ㅅ+ㅍ ᄻ ㅅ+ㅎ
ᅁ ㅇ+ㄱ ᅂ ㅇ+ㄷ ꥶ ㅇ+ㄹ ᅃ ㅇ+ㅁ ᅄ ㅇ+ㅂ ᅅ ㅇ+ㅅ ᅆ ㅇ+ᅀ ᅇ ㅇ+ㅇ ᅈ ㅇ+ㅈ ᅉ ㅇ+ㅊ ᅊ ㅇ+ㅌ ᅋ ㅇ+ㅍ ꥷ ㅇ+ㅎ
ᅍ ㅈ+ㅇ ᄍ ㅈ+ㅈ ꥸ ㅈ+ㅈ+ㅎ
ᅒ ㅊ+ㅋ ᅓ ㅊ+ㅎ
ꥹ ㅌ+ㅌ
ᅖ ㅍ+ㅂ ꥺ ㅍ+ㅎ ᅗ ㅍ+ㅇ
ꥻ ㅎ+ㅅ ᅘ ㅎ+ㅎ ꥼ ᅙ+ᅙ
`

const MEDIAL_RULE_TEXT = `
ᅶ ㅏ+ㅗ ᅷ ㅏ+ㅜ ᆣ ㅏ+ㅡ
ᅸ ㅑ+ㅗ ᅹ ㅑ+ㅛ ᆤ ㅑ+ㅜ
ᅺ ㅓ+ㅗ ᅻ ㅓ+ㅜ ᅼ ㅓ+ㅡ
ᆥ ㅕ+ㅑ ᅽ ㅕ+ㅗ ᅾ ㅕ+ㅜ
ᅪ ㅗ+ㅏ ᅫ ㅗ+ㅐ ᆦ ㅗ+ㅑ ᆧ ㅗ+ㅒ ᅿ ㅗ+ㅓ ᆀ ㅗ+ㅔ ힰ ㅗ+ㅕ ᆁ ㅗ+ㅖ ᆂ ㅗ+ㅗ ힱ ㅗ+ㅗ+ㅣ ᆃ ㅗ+ㅜ ᅬ ㅗ+ㅣ
ힲ ㅛ+ㅏ ힳ ㅛ+ㅐ ᆄ ㅛ+ㅑ ᆅ ㅛ+ㅒ ힴ ㅛ+ㅓ ᆆ ㅛ+ㅕ ᆇ ㅛ+ㅗ ᆈ ㅛ+ㅣ
ᆉ ㅜ+ㅏ ᆊ ㅜ+ㅐ ᅯ ㅜ+ㅓ ᆋ ㅜ+ㅓ+ㅡ ᅰ ㅜ+ㅔ ힵ ㅜ+ㅕ ᆌ ㅜ+ㅖ ᆍ ㅜ+ㅜ ᅱ ㅜ+ㅣ ힶ ㅜ+ㅣ+ㅣ
ᆎ ㅠ+ㅏ ힷ ㅠ+ㅐ ᆏ ㅠ+ㅓ ᆐ ㅠ+ㅔ ᆑ ㅠ+ㅕ ᆒ ㅠ+ㅖ ힸ ㅠ+ㅗ ᆓ ㅠ+ㅜ ᆔ ㅠ+ㅣ
ힹ ㅡ+ㅏ ힺ ㅡ+ㅓ ힻ ㅡ+ㅔ ힼ ㅡ+ㅗ ᆕ ㅡ+ㅜ ᆖ ㅡ+ㅡ ᅴ ㅡ+ㅣ ᆗ ㅡ+ㅣ+ㅜ
ᆘ ㅣ+ㅏ ᆙ ㅣ+ㅑ ힽ ㅣ+ㅑ+ㅗ ힾ ㅣ+ㅒ ힿ ㅣ+ㅕ ퟀ ㅣ+ㅖ ᆚ ㅣ+ㅗ ퟁ ㅣ+ㅗ+ㅣ ퟂ ㅣ+ㅛ ᆛ ㅣ+ㅜ ퟃ ㅣ+ㅠ ᆜ ㅣ+ㅡ ퟄ ㅣ+ㅣ ᆝ ㅣ+ᆞ
ퟅ ᆞ+ㅏ ᆟ ᆞ+ㅓ ퟆ ᆞ+ㅔ ᆠ ᆞ+ㅜ ᆡ ᆞ+ㅣ ᆢ ᆞ+ᆞ
`

const FINAL_RULE_TEXT = `
ᆩ ㄱ+ㄱ ᇺ ㄱ+ㄴ ᇃ ㄱ+ㄹ ᇻ ㄱ+ㅂ ᆪ ㄱ+ㅅ ᇄ ㄱ+ㅅ+ㄱ ᇼ ㄱ+ㅊ ᇽ ㄱ+ㅋ ᇾ ㄱ+ㅎ
ᇅ ㄴ+ㄱ ᇿ ㄴ+ㄴ ᇆ ㄴ+ㄷ ퟋ ㄴ+ㄹ ᇇ ㄴ+ㅅ ᇈ ㄴ+ᅀ ᆬ ㄴ+ㅈ ퟌ ㄴ+ㅊ ᇉ ㄴ+ㅌ ᆭ ㄴ+ㅎ
ᇊ ㄷ+ㄱ ퟍ ㄷ+ㄷ ퟎ ㄷ+ㄷ+ㅂ ᇋ ㄷ+ㄹ ퟏ ㄷ+ㅂ ퟐ ㄷ+ㅅ ퟑ ㄷ+ㅅ+ㄱ ퟒ ㄷ+ㅈ ퟓ ㄷ+ㅊ ퟔ ㄷ+ㅌ
ᆰ ㄹ+ㄱ ퟕ ㄹ+ㄱ+ㄱ ᇌ ㄹ+ㄱ+ㅅ ퟖ ㄹ+ㄱ+ㅎ ᇍ ㄹ+ㄴ ᇎ ㄹ+ㄷ ᇏ ㄹ+ㄷ+ㅎ ᇐ ㄹ+ㄹ ퟗ ㄹ+ㄹ+ㅋ
ᆱ ㄹ+ㅁ ᇑ ㄹ+ㅁ+ㄱ ᇒ ㄹ+ㅁ+ㅅ ퟘ ㄹ+ㅁ+ㅎ ᆲ ㄹ+ㅂ ퟙ ㄹ+ㅂ+ㄷ ᇓ ㄹ+ㅂ+ㅅ ퟚ ㄹ+ㅂ+ㅍ ᇔ ㄹ+ㅂ+ㅎ ᇕ ㄹ+ㅂ+ㅇ
ᆳ ㄹ+ㅅ ᇖ ㄹ+ㅅ+ㅅ ᇗ ㄹ+ᅀ ퟛ ㄹ+ᅌ ᇘ ㄹ+ㅋ ᆴ ㄹ+ㅌ ᆵ ㄹ+ㅍ ᆶ ㄹ+ㅎ ᇙ ㄹ+ᅙ ퟜ ㄹ+ᅙ+ㅎ ퟝ ㄹ+ㅇ
ᇚ ㅁ+ㄱ ퟞ ㅁ+ㄴ ퟟ ㅁ+ㄴ+ㄴ ᇛ ㅁ+ㄹ ퟠ ㅁ+ㅁ ᇜ ㅁ+ㅂ ퟡ ㅁ+ㅂ+ㅅ ᇝ ㅁ+ㅅ ᇞ ㅁ+ㅅ+ㅅ ᇟ ㅁ+ᅀ ퟢ ㅁ+ㅈ ᇠ ㅁ+ㅊ ᇡ ㅁ+ㅎ ᇢ ㅁ+ㅇ
ퟣ ㅂ+ㄷ ᇣ ㅂ+ㄹ ퟤ ㅂ+ㄹ+ㅍ ퟥ ㅂ+ㅁ ퟦ ㅂ+ㅂ ᆹ ㅂ+ㅅ ퟧ ㅂ+ㅅ+ㄷ ퟨ ㅂ+ㅈ ퟩ ㅂ+ㅊ ᇤ ㅂ+ㅍ ᇥ ㅂ+ㅎ ᇦ ㅂ+ㅇ
ᇧ ㅅ+ㄱ ᇨ ㅅ+ㄷ ᇩ ㅅ+ㄹ ퟪ ㅅ+ㅁ ᇪ ㅅ+ㅂ ퟫ ㅅ+ㅂ+ㅇ ᆻ ㅅ+ㅅ ퟬ ㅅ+ㅅ+ㄱ ퟭ ㅅ+ㅅ+ㄷ ퟮ ㅅ+ᅀ ퟯ ㅅ+ㅈ ퟰ ㅅ+ㅊ ퟱ ㅅ+ㅌ ퟲ ㅅ+ㅎ
ퟳ ᅀ+ㅂ ퟴ ᅀ+ㅂ+ㅇ
ᇬ ㅇ+ㄱ ᇭ ㅇ+ㄱ+ㄱ ퟵ ᅌ+ㅁ ᇱ ᅌ+ㅅ ᇲ ᅌ+ᅀ ᇮ ㅇ+ㅇ ᇯ ㅇ+ㅋ ퟶ ᅌ+ㅎ
ퟷ ㅈ+ㅂ ퟸ ㅈ+ㅂ+ㅂ ퟹ ㅈ+ㅈ
ᇳ ㅍ+ㅂ ퟺ ㅍ+ㅅ ퟻ ㅍ+ㅌ ᇴ ㅍ+ㅇ
ᇵ ㅎ+ㄴ ᇶ ㅎ+ㄹ ᇷ ㅎ+ㅁ ᇸ ㅎ+ㅂ
`

export const ARCHAIC_INITIAL_RULES = parseRuleText(INITIAL_RULE_TEXT)
export const ARCHAIC_MEDIAL_RULES = parseRuleText(MEDIAL_RULE_TEXT)
export const ARCHAIC_FINAL_RULES = parseRuleText(FINAL_RULE_TEXT)
