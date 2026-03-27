import { INPUT_SYMBOL_IDS } from '@/engine/tables/inputSymbolTable'
import type { ModifierKey } from '@/engine/core/types'

const DOM_KEY_LOCATION_LEFT = 1
const DOM_KEY_LOCATION_RIGHT = 2

const CODE_TO_VISUAL_KEY: Record<string, string> = {
  Digit1: '1',
  Digit2: '2',
  Digit3: '3',
  Digit4: '4',
  Digit5: '5',
  Digit6: '6',
  Digit7: '7',
  Digit8: '8',
  Digit9: '9',
  Digit0: '0',
  KeyQ: 'ㅂ',
  KeyW: 'ㅈ',
  KeyE: 'ㄷ',
  KeyR: 'ㄱ',
  KeyT: 'ㅅ',
  KeyY: 'ㅛ',
  KeyU: 'ㅕ',
  KeyI: 'ㅑ',
  KeyO: 'ㅐ',
  KeyP: 'ㅔ',
  KeyA: 'ㅁ',
  KeyS: 'ㄴ',
  KeyD: 'ㅇ',
  KeyF: 'ㄹ',
  KeyG: 'ㅎ',
  KeyH: 'ㅗ',
  KeyJ: 'ㅓ',
  KeyK: 'ㅏ',
  KeyL: 'ㅣ',
  KeyZ: 'ㅋ',
  KeyX: 'ㅌ',
  KeyC: 'ㅊ',
  KeyV: 'ㅍ',
  KeyB: 'ㅠ',
  KeyN: 'ㅜ',
  KeyM: 'ㅡ',
  Space: 'Space',
  Semicolon: ';',
  Period: '.',
  Backspace: 'Backspace',
  Enter: 'Enter',
  Home: 'Home',
  End: 'End',
  ArrowLeft: '←',
  ArrowRight: '→',
}

const BASE_KEY_TO_SYMBOL: Record<string, number> = {
  'ㄱ': INPUT_SYMBOL_IDS.GIYEOK,
  'ㄲ': INPUT_SYMBOL_IDS.GIYEOK,
  'ㄷ': INPUT_SYMBOL_IDS.DIGEUT,
  'ㄸ': INPUT_SYMBOL_IDS.DIGEUT,
  'ㅋ': INPUT_SYMBOL_IDS.KHIEUKH,
  'ㄴ': INPUT_SYMBOL_IDS.NIEUN,
  'ㄹ': INPUT_SYMBOL_IDS.RIEUL,
  'ㅁ': INPUT_SYMBOL_IDS.MIEUM,
  'ㅂ': INPUT_SYMBOL_IDS.BIEUP,
  'ㅃ': INPUT_SYMBOL_IDS.BIEUP,
  'ㅅ': INPUT_SYMBOL_IDS.SIOS,
  'ㅆ': INPUT_SYMBOL_IDS.SIOS,
  'ㅇ': INPUT_SYMBOL_IDS.IEUNG,
  'ㅈ': INPUT_SYMBOL_IDS.CIEUC,
  'ㅉ': INPUT_SYMBOL_IDS.SSANGCIEUC,
  'ㅊ': INPUT_SYMBOL_IDS.CHIEUCH,
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

export type PressedModifierState = Partial<Record<ModifierKey, boolean>>

export function resolveVisualKeyLabelFromKeyboardEvent(event: KeyboardEvent) {
  if (event.key === 'Control') {
    if (event.location === DOM_KEY_LOCATION_LEFT) {
      return 'L Ctrl'
    }

    if (event.location === DOM_KEY_LOCATION_RIGHT) {
      return 'R Ctrl'
    }
  }

  if (event.key === 'Shift') {
    if (event.location === DOM_KEY_LOCATION_LEFT) {
      return 'L Shift'
    }

    if (event.location === DOM_KEY_LOCATION_RIGHT) {
      return 'R Shift'
    }
  }

  if (CODE_TO_VISUAL_KEY[event.code]) {
    return CODE_TO_VISUAL_KEY[event.code]
  }

  if (/^[0-9]$/.test(event.key)) {
    return event.key
  }

  if (event.key === ' ' || event.key === 'Spacebar') {
    return 'Space'
  }

  if (
    event.key === '.' ||
    event.key === ';' ||
    event.key === 'Backspace' ||
    event.key === 'Enter' ||
    event.key === 'Home' ||
    event.key === 'End'
  ) {
    if (event.key === 'Backspace' || event.key === 'Enter' || event.key === 'Home' || event.key === 'End') {
      return event.key
    }

    return event.key
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    return event.key === 'ArrowLeft' ? '←' : '→'
  }

  const shiftedBaseKeyMap: Record<string, string> = {
    'ㅃ': 'ㅂ',
    'ㅉ': 'ㅈ',
    'ㄸ': 'ㄷ',
    'ㄲ': 'ㄱ',
    'ㅆ': 'ㅅ',
    'ㅒ': 'ㅐ',
    'ㅖ': 'ㅔ',
  }

  if (shiftedBaseKeyMap[event.key]) {
    return shiftedBaseKeyMap[event.key]
  }

  if (/^[ㄱ-ㅎㅏ-ㅣ]$/.test(event.key)) {
    return event.key
  }

  return null
}

export function resolveTransientModifiersFromKeyboardEvent(
  event: KeyboardEvent,
  pressedModifiers: PressedModifierState = {},
) {
  const leftCtrl =
    pressedModifiers.leftCtrl ??
    (event.ctrlKey && event.location === DOM_KEY_LOCATION_LEFT)
  const rightCtrl =
    pressedModifiers.rightCtrl ??
    (event.ctrlKey && event.location === DOM_KEY_LOCATION_RIGHT)
  const leftShift =
    pressedModifiers.leftShift ??
    (event.shiftKey && event.location === DOM_KEY_LOCATION_LEFT)
  const rightShift =
    pressedModifiers.rightShift ??
    (event.shiftKey && event.location === DOM_KEY_LOCATION_RIGHT)

  return {
    leftCtrl,
    rightCtrl,
    leftShift,
    rightShift,
  }
}

export function resolveInputSymbolFromKeyboardEvent(event: KeyboardEvent) {
  if (event.key === 'Backspace') {
    return INPUT_SYMBOL_IDS.BACKSPACE
  }

  if (event.key === '.') {
    return event.ctrlKey ? INPUT_SYMBOL_IDS.TONE_SINGLE : null
  }

  if (event.key === ';') {
    return event.ctrlKey ? INPUT_SYMBOL_IDS.TONE_DOUBLE : null
  }

  if (event.key === ' ') {
    return event.ctrlKey
      ? INPUT_SYMBOL_IDS.CHOSEONG_FILLER
      : INPUT_SYMBOL_IDS.SPACE
  }

  return BASE_KEY_TO_SYMBOL[event.key] ?? BASE_KEY_TO_SYMBOL[event.key.toLowerCase()] ?? null
}
