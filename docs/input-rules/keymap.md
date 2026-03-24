# Keymap Notes

이 문서는 입력 규칙의 짧은 개요만 담는다.
정확한 source of truth는 `docs/handoff/decisions.md`, 구현 상태는 `docs/handoff/spec-status-v1.md`다.

## Confirmed Rules

- 병서 원리 기반 조합 지원
- `Ctrl`, `LCtrl`, `RCtrl`, `Shift` modifier 기반 특수 자모 지원
- `Shift + ㅁ` 기본 탑재
- 모바일에서는 자체 자판 우선
- 종성 뒤 모음을 끊어쓰려면 `Ctrl + Space` 후 모음을 입력

## Example Inputs

- `ㅂ + ㅅ + ㄱ + ㅜ + ㄹ -> ᄢᅮᆯ`
- `ㄱ + ㅠ + ㅏ + ㄴ -> ᄀᆎᆫ`
- `ㅌ + ㅣ + ㅑ + ㄴ -> ᄐᆙᆫ`
- `영 + Ctrl + Space + ㅣ -> 영ᅟᅵ`
