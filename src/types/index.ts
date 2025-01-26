export type KeyStateType = {
  leftCtrlKey: boolean;
  rightCtrlKey: boolean;
  leftShiftKey: boolean;
  rightShiftKey: boolean;
};

export const initialKeyState: KeyStateType = {
  leftCtrlKey: false,
  rightCtrlKey: false,
  leftShiftKey: false,
  rightShiftKey: false,
};

export type PhonemeStateType = {
  ago: string; // 2글자 전
  before: string;
  after: string;
  lastKey: string;
  curKey: string;
};

export const initialPhonemeState: PhonemeStateType = {
  ago: "",
  before: "",
  after: "",
  lastKey: "",
  curKey: "",
};
