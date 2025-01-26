import { KeyStateType, PhonemeStateType } from "@/types";
import { ChoSungs, JungSungs, JongSungs } from "@/variables";

export const hangeulToYetHangeulChoSung = (
  phonemeState: PhonemeStateType,
  keyState: KeyStateType
): (string | boolean)[] => {
  let { before: prevKey, curKey: key } = phonemeState;
  let { leftShiftKey, rightShiftKey, leftCtrlKey, rightCtrlKey } = keyState;

  switch (key) {
    case "ㄱ":
    case "\u1100":
      if (leftShiftKey || rightShiftKey) return ["\u1101", false]; // ᄁ

      if (prevKey == "\u1100")
        // ᄀ
        return ["\u1101", true]; // ᄁ
      if (prevKey == "\u1102")
        // ᄂ
        return ["\u1113", true]; // ᄓ
      if (prevKey == "\u1103")
        // ᄃ
        return ["\u1117", true]; // ᄗ
      if (prevKey == "\u1105")
        // ᄅ
        return ["\uA964", true]; // ꥤ
      if (prevKey == "\u1106")
        // ᄆ
        return ["\uA96F", true]; // ꥯ
      if (prevKey == "\u1107")
        // ᄇ
        return ["\u111E", true]; // ᄞ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u112D", true]; // ᄭ
      if (prevKey == "\u110B")
        // ᄋ
        return ["\u1141", true]; // ᅁ
      if (prevKey == "\uA964")
        // ꥤ
        return ["\uA965", true]; // ꥥ
      if (prevKey == "\u1121")
        // ᄡ
        return ["\u1122", true]; // ᄢ
      if (prevKey == "\u1132")
        // ᄲ
        return ["\u1133", true]; // ᄳ

      return ["\u1100", false]; // ᄀ

    case "ㄲ":
    case "\u1101":
      if (prevKey == "\u1105")
        // ᄅ
        return ["\uA965", true]; // ꥥ
      return ["\u1101", false]; // ᄁ

    case "ㄴ":
    case "\u1102":
      if (leftShiftKey || rightShiftKey) return ["\u1114", false]; // ᄔ

      if (prevKey == "\u1102")
        // ᄂ
        return ["\u1114", true]; // ᄔ
      if (prevKey == "\u1105")
        // ᄅ
        return ["\u1118", true]; // ᄘ
      if (prevKey == "\u1107")
        // ᄇ
        return ["\u111F", true]; // ᄟ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u112E", true]; // ᄮ

      return ["\u1102", false]; // ᄂ

    case "ㄷ":
    case "\u1103":
      if (leftShiftKey || rightShiftKey) return ["\u1104", false]; // ᄄ

      if (prevKey == "\u1100")
        // ᄀ
        return ["\u115A", true]; // ᅚ
      if (prevKey == "\u1102")
        // ᄂ
        return ["\u1115", true]; // ᄕ
      if (prevKey == "\u1103")
        // ᄃ
        return ["\u1104", true]; // ᄄ
      if (prevKey == "\u1105")
        // ᄅ
        return ["\uA966", true]; // ꥦ
      if (prevKey == "\u1106")
        // ᄆ
        return ["\uA970", true]; // ꥰ
      if (prevKey == "\u1107")
        // ᄇ
        return ["\u1120", true]; // ᄠ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u112F", true]; // ᄯ
      if (prevKey == "\u110B")
        // ᄋ
        return ["\u1142", true]; // ᅂ
      if (prevKey == "\uA966")
        // ꥦ
        return ["\uA967", true]; // ꥧ
      if (prevKey == "\u1121")
        // ᄡ
        return ["\u1123", true]; // ᄣ

      return ["\u1103", false]; // ᄃ

    case "ㄸ":
    case "\u1104":
      if (prevKey == "\u1105")
        // ᄅ
        return ["\uA967", true]; // ꥧ

      return ["\u1104", false]; // ᄄ

    case "ㄹ":
    case "\u1105":
      if (leftShiftKey || rightShiftKey) return ["\u1119", false]; // ᄙ

      if (prevKey == "\u1103")
        // ᄃ
        return ["\u115E", true]; // ᅞ
      if (prevKey == "\u1105")
        // ᄅ
        return ["\u1119", true]; // ᄙ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u1130", true]; // ᄰ
      if (prevKey == "\u110B")
        // ᄋ
        return ["\uA976", true]; // ꥶ

      return ["\u1105", false]; // ᄅ

    case "ㅁ":
    case "\u1106":
      if (prevKey == "\u1103")
        // ᄃ
        return ["\uA960", true]; // ꥠ
      if (prevKey == "\u1105")
        // ᄅ
        return ["\uA968", true]; // ꥨ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u1131", true]; // ᄱ
      if (prevKey == "\u110B")
        // ᄋ
        return ["\u1143", true]; // ᅃ

      return ["\u1106", false]; // ᄆ

    case "ㅂ":
    case "\u1107":
      if (leftShiftKey || rightShiftKey) return ["\u1108", false]; // ᄈ

      if (prevKey == "\u1102")
        // ᄂ
        return ["\u1116", true]; // ᄖ
      if (prevKey == "\u1103")
        // ᄃ
        return ["\uA961", true]; // ꥡ
      if (prevKey == "\u1105")
        // ᄅ
        return ["\uA969", true]; // ꥩ
      if (prevKey == "\u1106")
        // ᄆ
        return ["\u111C", true]; // ᄜ
      if (prevKey == "\u1107")
        // ᄇ
        return ["\u1108", true]; // ᄈ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u1132", true]; // ᄲ
      if (prevKey == "\u110A")
        // ᄊ
        return ["\uA975", true]; // ꥵ
      if (prevKey == "\u110B")
        // ᄋ
        return ["\u1144", true]; // ᅄ
      if (prevKey == "\u1111")
        // ᄑ
        return ["\u1156", true]; // ᅖ
      if (prevKey == "\uA969")
        // ꥩ
        return ["\uA96A", true]; // ꥪ
      if (prevKey == "\u1121")
        // ᄡ
        return ["\u1124", true]; // ᄤ

      return ["\u1107", false]; // ᄇ

    case "ㅃ":
    case "\u1108":
      if (prevKey == "\u1105")
        // ᄅ
        return ["\uA96A", true]; // ꥪ

      return ["\u1108", false]; // ᄈ

    case "ㅅ":
    case "\u1109":
      if ((leftShiftKey || rightShiftKey) && leftCtrlKey)
        return ["\u113D", false]; // ᄽ
      if ((leftShiftKey || rightShiftKey) && rightCtrlKey)
        return ["\u113F", false]; // ᄿ
      if (leftCtrlKey) return ["\u113C", false]; // ᄼ
      if (rightCtrlKey) return ["\u113E", false]; // ᄾ

      if (prevKey == "\u1102")
        // ᄂ
        return ["\u115B", true]; // ᅛ
      if (prevKey == "\u1103")
        // ᄃ
        return ["\uA962", true]; // ꥢ
      if (prevKey == "\u1105")
        // ᄅ
        return ["\uA96C", true]; // ꥬ
      if (prevKey == "\u1106")
        // ᄆ
        return ["\uA971", true]; // ꥱ
      if (prevKey == "\u1107")
        // ᄇ
        return ["\u1121", true]; // ᄡ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u110A", true]; // ᄊ
      if (prevKey == "\u110A")
        // ᄊ
        return ["\u1134", true]; // ᄴ
      if (prevKey == "\u110B")
        // ᄋ
        return ["\u1145", true]; // ᅅ
      if (prevKey == "\u1112")
        // ᄒ
        return ["\uA97B", true]; // ꥻ
      if (prevKey == "\u1121")
        // ᄡ
        return ["\u1125", true]; // ᄥ

      return ["\u1109", false]; // ᄉ

    case "ㅆ":
    case "\u110A":
      if (leftCtrlKey) return ["\u113D", false]; // ᄽ
      if (rightCtrlKey) return ["\u113F", false]; // ᄿ

      if (prevKey == "\u1109")
        // ᄉ
        return ["\u1134", true]; // ᄴ
      if (prevKey == "\u1107")
        // ᄇ
        return ["\u1125", true]; // ᄥ

      return ["\u110A", false]; // ᄊ

    case "ㅇ":
    case "\u110B":
      if (leftShiftKey || rightShiftKey) return ["\u1147", false]; // ᅇ
      if (leftCtrlKey || rightCtrlKey) return ["\u114C", false]; // ᅌ (옛이응)

      if (prevKey == "\u1109")
        // ᄉ
        return ["\u1135", true]; // ᄵ
      if (prevKey == "\u110B")
        // ᄋ
        return ["\u1147", true]; // ᅇ
      if (prevKey == "\u110C")
        // ᄌ
        return ["\u114D", true]; // ᅍ
      if (prevKey == "\u1111")
        // ᄑ
        return ["\u1157", true]; // ᅗ
      if (prevKey == "\u1105")
        // ᄅ
        return ["\u111B", true]; // ᄛ
      if (prevKey == "\u1106")
        // ᄆ
        return ["\u111D", true]; // ᄝ
      if (prevKey == "\u1107")
        // ᄇ
        return ["\u112B", true]; // ᄫ
      if (prevKey == "\u1108")
        // ᄈ
        return ["\u112C", true]; // ᄬ
      if (prevKey == "\uA969")
        // ꥩ
        return ["\uA96B", true]; // ꥫ

      return ["\u110B", false]; // ᄋ

    case "ㅈ":
    case "\u110C":
      if ((leftShiftKey || rightShiftKey) && leftCtrlKey)
        return ["\u114F", false]; // ᅏ
      if ((leftShiftKey || rightShiftKey) && rightCtrlKey)
        return ["\u1151", false]; // ᅑ
      if (leftCtrlKey) return ["\u114E", false]; // ᅎ
      if (rightCtrlKey) return ["\u1150", false]; // ᅐ

      if (prevKey == "\u1102")
        // ᄂ
        return ["\u115C", true]; // ᅜ
      if (prevKey == "\u1103")
        // ᄃ
        return ["\uA963", true]; // ꥣ
      if (prevKey == "\u1105")
        // ᄅ
        return ["\uA96D", true]; // ꥭ
      if (prevKey == "\u1107")
        // ᄇ
        return ["\u1127", true]; // ᄧ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u1136", true]; // ᄶ
      if (prevKey == "\u110B")
        // ᄋ
        return ["\u1148", true]; // ᅈ
      if (prevKey == "\u1121")
        // ᄡ
        return ["\u1126", true]; // ᄦ

      return ["\u110C", false]; // ᄌ

    case "ㅉ":
    case "\u110D":
      if (leftCtrlKey) return ["\u114F", false]; // ᅏ
      if (rightCtrlKey) return ["\u1151", false]; // ᅑ

      return ["\u110D", false]; // ᄍ

    case "ㅊ":
    case "\u110E":
      if (leftShiftKey || rightShiftKey) {
        if (prevKey == "\u110B")
          // ᄋ
          return ["\u1146", true]; // ᅆ
        return ["\u1140", false]; // ᅀ
      }
      if (leftCtrlKey) return ["\u1154", false]; // ᅔ
      if (rightCtrlKey) return ["\u1155", false]; // ᅕ

      if (prevKey == "\u1107")
        // ᄇ
        return ["\u1128", true]; // ᄨ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u1137", true]; // ᄷ
      if (prevKey == "\u110B")
        // ᄋ
        return ["\u1149", true]; // ᅉ

      return ["\u110E", false]; // ᄎ

    case "ㅋ":
    case "\u110F":
      if (prevKey == "\u1105")
        // ᄅ
        return ["\uA96E", true]; // ꥮ
      if (prevKey == "\u1107")
        // ᄇ
        return ["\uA973", true]; // ꥳ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u1138", true]; // ᄸ
      if (prevKey == "\u110E")
        // ᄎ
        return ["\u1152", true]; // ᅒ

      return ["\u110F", false]; // ᄏ

    case "ㅌ":
    case "\u1110":
      if (leftShiftKey || rightShiftKey) return ["\uA979", false]; // ꥹ

      if (prevKey == "\u1107")
        // ᄇ
        return ["\u1129", true]; // ᄩ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u1139", true]; // ᄹ
      if (prevKey == "\u110B")
        // ᄋ
        return ["\u114A", true]; // ᅊ
      if (prevKey == "\u1110")
        // ᄐ
        return ["\uA979", true]; // ꥹ
      if (prevKey == "\u1121")
        // ᄡ
        return ["\uA972", true]; // ꥲ

      return ["\u1110", false]; // ᄐ

    case "ㅍ":
    case "\u1111":
      if (prevKey == "\u1107")
        // ᄇ
        return ["\u112A", true]; // ᄪ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u113A", true]; // ᄺ
      if (prevKey == "\u110B")
        // ᄋ
        return ["\u114B", true]; // ᅋ

      return ["\u1111", false]; // ᄑ

    case "ㅎ":
    case "\u1112":
      if ((leftShiftKey || rightShiftKey) && (leftCtrlKey || rightCtrlKey))
        return ["\uA97C", false]; // ꥼ
      if (leftShiftKey || rightShiftKey) return ["\u1158", false]; // ᅘ
      if (leftCtrlKey || rightCtrlKey) return ["\u1159", false]; // ᅙ

      if (prevKey == "\u1102")
        // ᄂ
        return ["\u115D", true]; // ᅝ
      if (prevKey == "\u1105")
        // ᄅ
        return ["\u111A", true]; // ᄚ
      if (prevKey == "\u1107")
        // ᄇ
        return ["\uA974", true]; // ꥴ
      if (prevKey == "\u1109")
        // ᄉ
        return ["\u113B", true]; // ᄻ
      if (prevKey == "\u110B")
        // ᄋ
        return ["\uA977", true]; // ꥷ
      if (prevKey == "\u110D")
        // ᄍ
        return ["\uA978", true]; // ꥸ
      if (prevKey == "\u110E")
        // ᄎ
        return ["\u1153", true]; // ᅓ
      if (prevKey == "\u1111")
        // ᄑ
        return ["\uA97A", true]; // ꥺ
      if (prevKey == "\u1112")
        // ᄒ
        return ["\u1158", true]; // ᅘ

      return ["\u1112", false]; // ᄒ

    case " ":
      if (leftCtrlKey || rightCtrlKey) return ["\u115F", false]; // ᅟ

      return [" ", false];

    default:
      if (key.length === 1) return [key, false];
      return ["", false];
  }
};

export const hangeulToYetHangeulJungSung = (
  phonemeState: PhonemeStateType,
  keyState: KeyStateType
) => {
  let { curKey: key, before: prevKey } = phonemeState;
  let { leftCtrlKey, rightCtrlKey, leftShiftKey, rightShiftKey } = keyState;

  switch (key) {
    case "ㅏ":
    case "\u1161":
    case "\u119E":
      if (leftCtrlKey || rightCtrlKey) {
        if (leftShiftKey || rightShiftKey) return ["\u11A2", false]; // ᆢ

        if (prevKey == "\u1175")
          // ᅵ
          return ["\u119D", true]; // ᆝ
        if (prevKey == "\u119E")
          // ᆞ
          return ["\u11A2", true]; // ᆢ
        return ["\u119E", false]; // ᆞ
      }

      if (prevKey == "\u119E")
        // ᆞ
        return ["\uD7C5", true]; // ퟅ
      if (prevKey == "\u1169")
        // ᅩ
        return ["\u116A", true]; // ᅪ
      if (prevKey == "\u116D")
        // ᅭ
        return ["\uD7B2", true]; // ힲ
      if (prevKey == "\u116E")
        // ᅮ
        return ["\u1189", true]; // ᆉ
      if (prevKey == "\u1172")
        // ᅲ
        return ["\u118E", true]; // ᆎ
      if (prevKey == "\u1173")
        // ᅳ
        return ["\uD7B9", true]; // ힹ
      if (prevKey == "\u1175")
        // ᅵ
        return ["\u1198", true]; // ᆘ

      return ["\u1161", false]; // ᅡ

    case "ㅐ":
    case "\u1162":
      if (prevKey == "\u1169")
        // ᅩ
        return ["\u116B", true]; // ᅫ
      if (prevKey == "\u116D")
        // ᅭ
        return ["\uD7B3", true]; // ힳ
      if (prevKey == "\u1172")
        // ᅲ
        return ["\uD7B7", true]; // ힷ

      return ["\u1162", false]; // ᅢ

    case "ㅑ":
    case "\u1163":
      if (prevKey == "\u1167")
        // ᅧ
        return ["\u11A5", true]; // ᆥ
      if (prevKey == "\u1169")
        // ᅩ
        return ["\u11A6", true]; // ᆦ
      if (prevKey == "\u116D")
        // ᅭ
        return ["\u1184", true]; // ᆄ (ㅛ+ㅑ) ??
      if (prevKey == "\u1175")
        // ᅵ
        return ["\u1199", true]; // ᆙ

      return ["\u1163", false]; // ᅣ

    case "ㅒ":
    case "\u1164":
      if (prevKey == "\u1169")
        // ᅩ
        return ["\u11A7", true]; // ᆧ
      if (prevKey == "\u116D")
        // ᅭ
        return ["\u1185", true]; // ᆅ
      if (prevKey == "\u116E")
        // ᅮ
        return ["\u118A", true]; // ᆊ
      if (prevKey == "\u1175")
        // ᅵ
        return ["\uD7BE", true]; // ힾ (ㅣ+ㅒ)

      return ["\u1164", false]; // ᅤ (ㅑ+ㅣ)

    case "ㅓ":
    case "\u1165":
      if (prevKey == "\u119E")
        // ᆞ
        return ["\u119F", true]; // ᆟ
      if (prevKey == "\u1169")
        // ᅩ
        return ["\u117F", true]; // ᅿ
      if (prevKey == "\u116D")
        // ᅭ
        return ["\uD7B4", true]; // ힴ
      if (prevKey == "\u116E")
        // ᅮ
        return ["\u116F", true]; // ᅯ
      if (prevKey == "\u1172")
        // ᅲ
        return ["\u118F", true]; // ᆏ (ㅠ+ㅓ)
      if (prevKey == "\u1173")
        // ᅳ
        return ["\uD7BA", true]; // ힺ

      return ["\u1165", false]; // ᅥ

    case "ㅔ":
    case "\u1166":
      if (prevKey == "\u119E")
        // ᆞ
        return ["\uD7C6", true]; // ퟆ
      if (prevKey == "\u1169")
        // ᅩ
        return ["\u1180", true]; // ᆀ
      if (prevKey == "\u116E")
        // ᅮ
        return ["\u1170", true]; // ᅰ
      if (prevKey == "\u1172")
        // ᅲ
        return ["\u1190", true]; // ᆐ
      if (prevKey == "\u1173")
        // ᅳ
        return ["\uD7BB", true]; // ힻ

      return ["\u1166", false]; // ᅦ

    case "ㅕ":
    case "\u1167":
      if (prevKey == "\u1169")
        // ᅩ
        return ["\uD7B0", true]; // ힰ
      if (prevKey == "\u116D")
        // ᅭ
        return ["\u1186", true]; // ᆆ
      if (prevKey == "\u116E")
        // ᅮ
        return ["\uD7B5", true]; // ힵ
      if (prevKey == "\u1172")
        // ᅲ
        return ["\u1191", true]; // ᆑ
      if (prevKey == "\u1175")
        // ᅵ
        return ["\uD7BF", true]; // ힿ (ㅣ+ㅕ)

      return ["\u1167", false]; // ᅧ

    case "ㅖ":
    case "\u1168":
      if (prevKey == "\u1169")
        // ᅩ
        return ["\u1181", true]; // ᆁ
      if (prevKey == "\u116E")
        // ᅮ
        return ["\u118C", true]; // ᆌ
      if (prevKey == "\u1172")
        // ᅲ
        return ["\u1192", true]; // ᆒ
      if (prevKey == "\u1175")
        // ᅵ
        return ["\uD7C0", true]; // ퟀ (ㅣ+ㅖ)

      return ["\u1168", false]; // ᅨ

    case "ㅗ":
    case "\u1169":
      if (leftShiftKey || rightShiftKey) return ["\u1182", false]; // ᆂ

      if (prevKey == "\u1161")
        // ᅡ
        return ["\u1176", true]; // ᅶ
      if (prevKey == "\u1163")
        // ᅣ
        return ["\u1178", true]; // ᅸ
      if (prevKey == "\u1165")
        // ᅥ
        return ["\u117A", true]; // ᅺ
      if (prevKey == "\u1167")
        // ᅧ
        return ["\u117D", true]; // ᅽ
      if (prevKey == "\u1169")
        // ᅩ
        return ["\u1182", true]; // ᆂ
      if (prevKey == "\u116D")
        // ᅭ
        return ["\u1187", true]; // ᆇ
      if (prevKey == "\u1172")
        // ᅲ
        return ["\uD7B8", true]; // ힸ
      if (prevKey == "\u1173")
        // ᅳ
        return ["\uD7BC", true]; // ힼ (ㅡ+ㅗ)
      if (prevKey == "\u1175")
        // ᅵ
        return ["\u119A", true]; // ᆚ

      return ["\u1169", false]; // ᅩ

    case "ㅛ":
    case "\u116D":
      if (prevKey == "\u1163")
        // ᅣ
        return ["\u1179", true]; // ᅹ
      if (prevKey == "\u1175")
        // ᅵ
        return ["\uD7C2", true]; // ퟂ

      return ["\u116D", false]; // ᅭ

    case "ㅜ":
    case "\u116E":
      if (leftShiftKey || rightShiftKey) return ["\u118D", false]; // ᆍ

      if (prevKey == "\u1161")
        // ᅡ
        return ["\u1177", true]; // ᅷ
      if (prevKey == "\u119E")
        // ᆞ
        return ["\u11A0", true]; // ᆠ
      if (prevKey == "\u1163")
        // ᅣ
        return ["\u11A4", true]; // ᆤ
      if (prevKey == "\u1165")
        // ᅥ
        return ["\u117B", true]; // ᅻ
      if (prevKey == "\u1167")
        // ᅧ
        return ["\u117E", true]; // ᅾ
      if (prevKey == "\u1169")
        // ᅩ
        return ["\u1183", true]; // ᆃ
      if (prevKey == "\u116E")
        // ᅮ
        return ["\u118D", true]; // ᆍ
      if (prevKey == "\u1172")
        // ᅲ
        return ["\u1193", true]; // ᆓ
      if (prevKey == "\u1173")
        // ᅳ
        return ["\u1195", true]; // ᆕ
      if (prevKey == "\u1174")
        // ᅴ
        return ["\u1197", true]; // ᆗ
      if (prevKey == "\u1199")
        // ᆙ
        return ["\uD7BD", true]; // ힽ
      if (prevKey == "\u1175")
        // ᅵ
        return ["\u119B", true]; // ᆛ

      return ["\u116E", false]; // ᅮ

    case "ㅠ":
    case "\u1172":
      if (prevKey == "\u1175")
        // ᅵ
        return ["\uD7C3", true]; // ퟃ

      return ["\u1172", false]; // ᅲ

    case "ㅡ":
    case "\u1173":
      if (leftShiftKey || rightShiftKey) return ["\u1196", false]; // ᆖ

      if (prevKey == "\u1161")
        // ᅡ
        return ["\u11A3", true]; // ᆣ
      if (prevKey == "\u1165")
        // ᅥ
        return ["\u117C", true]; // ᅼ
      if (prevKey == "\u116F")
        // ᅯ
        return ["\u118B", true]; // ᆋ (ㅜ+ㅓ+ㅡ)
      if (prevKey == "\u1173")
        // ᅳ
        return ["\u1196", true]; // ᆖ
      if (prevKey == "\u1175")
        // ᅵ
        return ["\u119C", true]; // ᆜ

      return ["\u1173", false]; // ᅳ

    case "ㅣ":
    case "\u1175":
      if (leftShiftKey || rightShiftKey) {
        if (prevKey == "\u116E")
          // ᅮ
          return ["\uD7B6", true]; // ힶ (ㅜ+ㅣ+ㅣ)

        return ["\uD7C4", false]; // ퟄ
      }

      if (prevKey == "\u1161")
        // ᅡ
        return ["\u1162", true]; // ᅢ
      if (prevKey == "\u119E")
        // ᆞ
        return ["\u11A1", true]; // ᆡ
      if (prevKey == "\u1169") return ["\u116C", true]; // ᅬ
      if (prevKey == "\u1182")
        // ᆂ
        return ["\uD7B1", true]; // ힱ (ㅗ+ㅗ+ㅣ)
      if (prevKey == "\u116D")
        // ᅭ
        return ["\u1188", true]; // ᆈ
      if (prevKey == "\u116E")
        // ᅮ
        return ["\u1171", true]; // ᅱ
      if (prevKey == "\u1171")
        // ᅱ
        return ["\uD7B6", true]; // ힶ (ㅜ+ㅣ+ㅣ)
      if (prevKey == "\u1172")
        // ᅲ
        return ["\u1194", true]; // ᆔ
      if (prevKey == "\u1173")
        // ᅳ
        return ["\u1174", true]; // ᅴ
      if (prevKey == "\u119A")
        // ᆚ
        return ["\uD7C1", true]; // ퟁ (ㅣ+ㅗ+ㅣ)
      if (prevKey == "\u1175")
        // ᅵ
        return ["\uD7C4", true]; // ퟄ (ㅣ+ㅣ)

      return ["\u1175", false]; // ᅵ

    case " ":
      if (leftCtrlKey || rightCtrlKey) return ["\u1160", false]; // ᅠ

      return [" ", false];

    default:
      if (key.length === 1) return [key, false];
      return ["", false];
  }
};

export const hangeulToYetHangeulJongSung = (
  phonemeState: PhonemeStateType,
  keyState: KeyStateType,
  isPrevJungSung: boolean
) => {
  let { before: prevKey, curKey: key } = phonemeState;
  let { leftShiftKey, rightShiftKey, leftCtrlKey, rightCtrlKey } = keyState;

  switch (key) {
    case "ㄱ":
      if (leftShiftKey || rightShiftKey) {
        if (prevKey == "\u11AF")
          // ᆯ
          return ["\uD7D5", true]; // ퟕ
        if (prevKey == "\u11BC")
          // ᆼ
          return ["\u11ED", true]; // ᇭ

        if (isPrevJungSung) return ["\u11A9", false]; // ᆩ
        break;
      }

      if (prevKey == "\u11A8")
        // ᄀ
        return ["\u11A9", true]; // ᆩ
      if (prevKey == "\u11AA")
        // ᆪ
        return ["\u11C4", true]; // ᇄ
      if (prevKey == "\u11AB")
        // ᆫ
        return ["\u11C5", true]; // ᇅ
      if (prevKey == "\u11AE")
        // ᆮ
        return ["\u11CA", true]; // ᇊ
      if (prevKey == "\uD7D0")
        // ퟐ
        return ["\uD7D1", true]; // ퟑ
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\u11B0", true]; // ᆰ
      if (prevKey == "\u11B0")
        // ᆰ
        return ["\uD7D5", true]; // ퟕ
      if (prevKey == "\u11B1")
        // ᆱ
        return ["\u11D1", true]; // ᇑ
      if (prevKey == "\u11B7") return ["\u11DA", true]; // ᇚ
      if (prevKey == "\u11BA")
        // ᆺ
        return ["\u11E7", true]; // ᇧ
      if (prevKey == "\u11BB")
        // ᆻ
        return ["\uD7EC", true]; // ퟬ
      if (prevKey == "\u11BC")
        // ᆼ
        return ["\u11EC", true]; // ᇬ
      if (prevKey == "\u11EC")
        // ᇬ
        return ["\u11ED", true]; // ᇭ

      if (isPrevJungSung) return ["\u11A8", false]; // ᆨ
      break;

    case "ㄲ":
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\uD7D5", true]; // ퟕ
      if (prevKey == "\u11BC")
        // ᆼ
        return ["\u11ED", true]; // ᇭ

      if (isPrevJungSung) return ["\u11A9", false]; // ᆩ
      break;

    case "ㄴ":
      if (leftShiftKey || rightShiftKey) {
        if (prevKey == "\u11B7")
          // ᆷ
          return ["\uD7DF", true]; // ퟟ

        if (isPrevJungSung) return ["\u11FF", false]; // ᇿ
        break;
      }

      if (prevKey == "\u11A8")
        // ᆨ
        return ["\u11FA", true]; // ᇺ
      if (prevKey == "\u11AB")
        // ᆫ
        return ["\u11FF", true]; // ᇿ
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\u11CD", true]; // ᇍ
      if (prevKey == "\u11B7")
        // ᆷ
        return ["\uD7DE", true]; // ퟞ
      if (prevKey == "\uD7DE")
        // ퟞ
        return ["\uD7DF", true]; // ퟟ
      if (prevKey == "\u11C2")
        // ᇂ
        return ["\u11F5", true]; // ᇵ

      if (isPrevJungSung) return ["\u11AB", false]; // ᆫ
      break;

    case "ㄷ":
      if (leftShiftKey || rightShiftKey) {
        if (isPrevJungSung) return ["\uD7CD", false]; // ퟍ
        break;
      }

      if (prevKey == "\u11AB")
        // ᆫ
        return ["\u11C6", true]; // ᇆ
      if (prevKey == "\u11AE")
        // ᆮ
        return ["\uD7CD", true]; // ퟍ
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\u11CE", true]; // ᇎ
      if (prevKey == "\u11B2")
        // ᆲ
        return ["\uD7D9", true]; // ퟙ
      if (prevKey == "\u11B8")
        // ᆸ
        return ["\uD7E3", true]; // ퟣ
      if (prevKey == "\u11B9")
        // ᆹ
        return ["\uD7E7", true]; // ퟧ
      if (prevKey == "\u11BA")
        // ᆺ
        return ["\u11E8", true]; // ᇨ
      if (prevKey == "\u11BB")
        // ᆻ
        return ["\uD7ED", true]; // ퟭ

      if (isPrevJungSung) return ["\u11AE", false]; // ᆮ
      break;

    case "ㄸ":
      if (isPrevJungSung) return ["\uD7CD", false]; // ퟍ
      break;

    case "ㄹ":
      if (leftShiftKey || rightShiftKey) {
        if (isPrevJungSung) return ["\u11D0", false]; // ᇐ
        break;
      }

      if (prevKey == "\u11A8")
        // ᆨ
        return ["\u11C3", true]; // ᇃ
      if (prevKey == "\u11AB")
        // ᆫ
        return ["\uD7CB", true]; // ퟋ
      if (prevKey == "\u11AE")
        // ᆮ
        return ["\u11CB", true]; // ᇋ
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\u11D0", true]; // ᇐ
      if (prevKey == "\u11B7")
        // ᆷ
        return ["\u11DB", true]; // ᇛ
      if (prevKey == "\u11B8")
        // ᆸ
        return ["\u11E3", true]; // ᇣ
      if (prevKey == "\u11BA")
        // ᆺ
        return ["\u11E9", true]; // ᇩ
      if (prevKey == "\u11C2")
        // ᇂ
        return ["\u11F6", true]; // ᇶ

      if (isPrevJungSung) return ["\u11AF", false]; // ᆯ
      break;

    case "ㅁ":
      if (leftShiftKey || rightShiftKey) {
        if (isPrevJungSung) return ["\uD7E0", false]; // ퟠ
        break;
      }

      if (prevKey == "\u11AF")
        // ᆯ
        return ["\u11B1", true]; // ᆱ
      if (prevKey == "\u11B7")
        // ᆷ
        return ["\uD7E0", true]; // ퟠ
      if (prevKey == "\u11B8")
        // ᆸ
        return ["\uD7E5", true]; // ퟥ
      if (prevKey == "\u11BA")
        // ᆺ
        return ["\uD7EA", true]; // ퟪ
      if (prevKey == "\u11F0")
        // ᇰ(옛이응)
        return ["\uD7F5", true]; // ퟵ
      if (prevKey == "\u11C2")
        // ᇂ
        return ["\u11F7", true]; // ᇷ

      if (isPrevJungSung) return ["\u11B7", false]; // ᆷ
      break;

    case "ㅂ":
      if (leftShiftKey || rightShiftKey) {
        if (prevKey == "\u11BD")
          // ᆽ
          return ["\uD7F8", true]; // ퟸ

        if (isPrevJungSung) return ["\uD7E6", false]; // ퟦ
        break;
      }

      if (prevKey == "\u11A8")
        // ᆨ
        return ["\u11FB", true]; // ᇻ
      if (prevKey == "\uD7CD")
        // ퟍ
        return ["\uD7CE", true]; // ퟎ
      if (prevKey == "\u11AE")
        // ᆮ
        return ["\uD7CF", true]; // ퟏ
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\u11B2", true]; // ᆲ
      if (prevKey == "\u11B7")
        // ᆷ
        return ["\u11DC", true]; // ᇜ
      if (prevKey == "\u11B8")
        // ᆸ
        return ["\uD7E6", true]; // ퟦ
      if (prevKey == "\u11BA")
        // ᆺ
        return ["\u11EA", true]; // ᇪ
      if (prevKey == "\u11BD")
        // ᆽ
        return ["\uD7F7", true]; // ퟷ
      if (prevKey == "\uD7F7")
        // ퟷ
        return ["\uD7F8", true]; // ퟸ
      if (prevKey == "\u11EB")
        // ᇫ
        return ["\uD7F3", true]; // ퟳ
      if (prevKey == "\u11C1")
        // ᇁ
        return ["\u11F3", true]; // ᇳ
      if (prevKey == "\u11C2")
        // ᇂ
        return ["\u11F8", true]; // ᇸ

      if (isPrevJungSung) return ["\u11B8", false]; // ᆸ
      break;

    case "ㅃ":
      if (prevKey == "\u11BD")
        // ᆽ
        return ["\uD7F8", true]; // ퟸ

      if (isPrevJungSung) return ["\uD7E6", false]; // ퟦ
      break;

    case "ㅅ":
      if (leftShiftKey || rightShiftKey) {
        if (prevKey == "\u11B7")
          // ᆷ
          return ["\u11DE", true]; // ᇞ

        if (isPrevJungSung) return ["\u11BB", false]; // ᆻ
        break;
      }

      if (prevKey == "\u11A8")
        // ᆨ
        return ["\u11AA", true]; // ᆪ
      if (prevKey == "\u11AB")
        // ᆫ
        return ["\u11C7", true]; // ᇇ
      if (prevKey == "\u11AE")
        // ᆮ
        return ["\uD7D0", true]; // ퟐ
      if (prevKey == "\u11B0")
        // ᆰ
        return ["\u11CC", true]; // ᇌ
      if (prevKey == "\u11B1")
        // ᆱ
        return ["\u11D2", true]; // ᇒ
      if (prevKey == "\u11B2")
        // ᆲ
        return ["\u11D3", true]; // ᇓ
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\u11B3", true]; // ᆳ
      if (prevKey == "\u11B3")
        // ᆳ
        return ["\u11D6", true]; // ᇖ
      if (prevKey == "\u11DC")
        // ᇜ
        return ["\uD7E1", true]; // ퟡ
      if (prevKey == "\u11B7")
        // ᆷ
        return ["\u11DD", true]; // ᇝ
      if (prevKey == "\u11DD")
        // ᇝ
        return ["\u11DE", true]; // ᇞ
      if (prevKey == "\u11B8")
        // ᆸ
        return ["\u11B9", true]; // ᆹ
      if (prevKey == "\u11BA")
        // ᆺ
        return ["\u11BB", true]; // ᆻ
      if (prevKey == "\u11BC")
        // ᆼ
        return ["\u11F1", true]; // ᇱ
      if (prevKey == "\u11C1")
        // ᇁ
        return ["\uD7FA", true]; // ퟺ

      if (isPrevJungSung) return ["\u11BA", false]; // ᆺ
      break;

    case "ㅆ":
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\u11D6", true]; // ᇖ
      if (prevKey == "\u11B7")
        // ᆷ
        return ["\u11DE", true]; // ᇞ

      if (isPrevJungSung) return ["\u11BB", false]; // ᆻ
      break;

    case "ㅇ":
      if (leftShiftKey || rightShiftKey) {
        if (isPrevJungSung) return ["\u11EE", false]; // ᇮ
        break;
      }
      if (leftCtrlKey || rightCtrlKey) {
        if (prevKey == "\u11AF")
          // ᆯ
          return ["\uD7DB", true]; // ퟛ

        if (isPrevJungSung) return ["\u11F0", false]; // ᇰ(옛이응)
        break;
      }

      if (prevKey == "\u11B2")
        // ᆲ
        return ["\u11D5", true]; // ᇕ
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\uD7DD", true]; // ퟝ
      if (prevKey == "\u11B7")
        // ᆷ
        return ["\u11E2", true]; // ᇢ
      if (prevKey == "\u11B8")
        // ᆸ
        return ["\u11E6", true]; // ᇦ
      if (prevKey == "\u11EA")
        // ᇪ
        return ["\uD7EB", true]; // ퟫ
      if (prevKey == "\u11BC")
        // ᆼ
        return ["\u11EE", true]; // ᇮ
      if (prevKey == "\uD7F3")
        // ퟳ
        return ["\uD7F4", true]; // ퟴ
      if (prevKey == "\u11C1")
        // ᇁ
        return ["\u11F4", true]; // ᇴ

      if (isPrevJungSung) return ["\u11BC", false]; // ᆼ
      break;

    case "ㅈ":
      if (leftShiftKey || rightShiftKey) {
        if (isPrevJungSung) return ["\uD7F9", false]; // ퟹ
        break;
      }

      if (prevKey == "\u11AB")
        // ᆫ
        return ["\u11AC", true]; // ᆬ
      if (prevKey == "\u11AE")
        // ᆮ
        return ["\uD7D2", true]; // ퟒ
      if (prevKey == "\u11B7")
        // ᆷ
        return ["\uD7E2", true]; // ퟢ
      if (prevKey == "\u11B8")
        // ᆸ
        return ["\uD7E8", true]; // ퟨ
      if (prevKey == "\u11BA")
        // ᆺ
        return ["\uD7EF", true]; // ퟯ
      if (prevKey == "\u11BD")
        // ᆽ
        return ["\uD7F9", true]; // ퟹ

      if (isPrevJungSung) return ["\u11BD", false]; // ᆽ
      break;

    case "ㅉ":
      if (isPrevJungSung) return ["\uD7F9", false]; // ퟹ
      break;

    case "ㅊ":
      if (leftShiftKey || rightShiftKey) {
        if (prevKey == "\u11AB")
          // ᆫ
          return ["\u11C8", true]; // ᇈ
        if (prevKey == "\u11AF")
          // ᆯ
          return ["\u11D7", true]; // ᇗ
        if (prevKey == "\u11B7")
          // ᆷ
          return ["\u11DF", true]; // ᇟ
        if (prevKey == "\u11BA")
          // ᆺ
          return ["\uD7EE", true]; // ퟮ
        if (prevKey == "\u11BC")
          // ᆼ
          return ["\u11F2", true]; // ᇲ

        if (isPrevJungSung) return ["\u11EB", false]; // ᇫ
        break;
      }

      if (prevKey == "\u11A8")
        // ᆨ
        return ["\u11FC", true]; // ᇼ
      if (prevKey == "\u11AB")
        // ᆫ
        return ["\uD7CC", true]; // ퟌ
      if (prevKey == "\u11AE")
        // ᆮ
        return ["\uD7D3", true]; // ퟓ
      if (prevKey == "\u11B7")
        // ᆷ
        return ["\u11E0", true]; // ᇠ
      if (prevKey == "\u11B8")
        // ᆸ
        return ["\uD7E9", true]; // ퟩ
      if (prevKey == "\u11BA")
        // ᆺ
        return ["\uD7F0", true]; // ퟰ

      if (isPrevJungSung) return ["\u11BE", false]; // ᆾ
      break;

    case "ㅋ":
      if (prevKey == "\u11A8")
        // ᆨ
        return ["\u11FD", true]; // ᇽ
      if (prevKey == "\u11D0")
        // ᇐ
        return ["\uD7D7", true]; // ퟗ
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\u11D8", true]; // ᇘ
      if (prevKey == "\u11BC")
        // ᆼ
        return ["\u11EF", true]; // ᇯ

      if (isPrevJungSung) return ["\u11BF", false]; // ᆿ
      break;

    case "ㅌ":
      if (prevKey == "\u11AB")
        // ᆫ
        return ["\u11C9", true]; // ᇉ
      if (prevKey == "\u11AE")
        // ᆮ
        return ["\uD7D4", true]; // ퟔ
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\u11B4", true]; // ᆴ
      if (prevKey == "\u11BA")
        // ᆺ
        return ["\uD7F1", true]; // ퟱ
      if (prevKey == "\u11C1")
        // ᇁ
        return ["\uD7FB", true]; // ퟻ

      if (isPrevJungSung) return ["\u11C0", false]; // ᇀ
      break;

    case "ㅍ":
      if (prevKey == "\u11B2")
        // ᆲ
        return ["\uD7DA", true]; // ퟚ
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\u11B5", true]; // ᆵ
      if (prevKey == "\u11E3")
        // ᇣ
        return ["\uD7E4", true]; // ퟤ
      if (prevKey == "\u11B8")
        // ᆸ
        return ["\u11E4", true]; // ᇤ

      if (isPrevJungSung) return ["\u11C1", false]; // ᇁ
      break;

    case "ㅎ":
      if (leftCtrlKey || rightCtrlKey) {
        if (prevKey == "\u11AF")
          // ᆯ
          return ["\u11D9", true]; // ᇙ

        if (isPrevJungSung) return ["\u11F9", false]; // ᇹ
        break;
      }

      if (prevKey == "\u11A8")
        // ᆨ
        return ["\u11FE", true]; // ᇾ
      if (prevKey == "\u11AB")
        // ᆫ
        return ["\u11AD", true]; // ᆭ
      if (prevKey == "\u11B0")
        // ᆰ
        return ["\uD7D6", true]; // ퟖ
      if (prevKey == "\u11CE")
        // ᇎ
        return ["\u11CF", true]; // ᇏ
      if (prevKey == "\u11B1")
        // ᆱ
        return ["\uD7D8", true]; // ퟘ
      if (prevKey == "\u11B2")
        // ᆲ
        return ["\u11D4", true]; // ᇔ
      if (prevKey == "\u11AF")
        // ᆯ
        return ["\u11B6", true]; // ᆶ
      if (prevKey == "\u11D9")
        // ᇙ
        return ["\uD7DC", true]; // ퟜ
      if (prevKey == "\u11B7")
        // ᆷ
        return ["\u11E1", true]; // ᇡ
      if (prevKey == "\u11B8")
        // ᆸ
        return ["\u11E5", true]; // ᇥ
      if (prevKey == "\u11BA")
        // ᆺ
        return ["\uD7F2", true]; // ퟲ
      if (prevKey == "\u11F0")
        // ᇰ(옛이응)
        return ["\uD7F6", true]; // ퟶ

      if (isPrevJungSung) return ["\u11C2", false]; // ᇂ
      break;

    case " ":
      return [" ", false];
    default:
      if (key.length === 1) return [key, false];
      return ["", false];
  }
  return hangeulToYetHangeulChoSung(phonemeState, keyState);
};

export const hanguelToYetHanguel = (
  phonemeState: PhonemeStateType,
  keyState: KeyStateType
) => {
  let { before: prevKey, curKey: key } = phonemeState;

  if ("ㄱ" <= key && key <= "ㅎ") {
    let isPrevJungSung = JungSungs.includes(prevKey);
    let isPrevJongSung = JongSungs.includes(prevKey);
    if (isPrevJungSung || isPrevJongSung) {
      return hangeulToYetHangeulJongSung(
        phonemeState,
        keyState,
        isPrevJungSung
      );
    }

    return hangeulToYetHangeulChoSung(phonemeState, keyState);
  } else if ("ㅏ" <= key && key <= "ㅣ") {
    let result = hangeulToYetHangeulJungSung(phonemeState, keyState);
    return result;
  } else if (key == " ") {
    let result;
    if (isChoSung(prevKey))
      result = hangeulToYetHangeulJungSung(phonemeState, keyState);
    else result = hangeulToYetHangeulChoSung(phonemeState, keyState);
    return result;
  } else if (
    (keyState.leftCtrlKey || keyState.rightCtrlKey) &&
    [".", ";"].includes(key)
  ) {
    // 방점 입력(거성  〮, 상성  〯)
    if (key == ".") return ["\u302E", false];
    else return ["\u302F", false];
  } else if (key.length == 1) return key;
  else return "";
};

export const isChoSung = (char: string) => {
  return ChoSungs.includes(char);
};

export const isJungSung = (char: string) => {
  return JungSungs.includes(char);
};

export const isJongSung = (char: string) => {
  return JongSungs.includes(char);
};
