# YetHangul Input Parity Checklist

이 문서는 하드웨어 키보드 입력과 on-screen 키보드 입력 사이의 차이를 줄이기 위한 체크리스트다.

상태 표기:

- `Done`: 차이를 해소했거나 충분히 줄임
- `Partial`: 일부 해소, 추가 보강 필요
- `Open`: 아직 남아 있음

## 1. 연속 조합 유지

- Status: `Done`
- 문제:
  - on-screen 키를 누를 때마다 focus가 이동하며 blur가 발생해 조합 버퍼가 끊겼다.
- 대응:
  - 내부 blur는 무시하고, on-screen key pointer down에서 기본 focus 이동을 막는다.

## 2. on-screen Backspace 동작

- Status: `Done`
- 문제:
  - 하드웨어 `Backspace`는 editor-layer 삭제 경로를 타지만, on-screen `Backspace`는 엔진 symbol input만 타고 있었다.
- 대응:
  - on-screen `Backspace`도 selection 삭제 / 문서 unit 삭제 / 조합 버퍼 backspace 경로를 동일하게 탄다.

## 3. on-screen 눌림 피드백

- Status: `Done`
- 문제:
  - 하드웨어 키는 눌림 하이라이트가 보였지만, on-screen 클릭은 눌렸다는 피드백이 약했다.
- 대응:
  - on-screen 입력도 짧은 pressed highlight를 직접 발생시킨다.

## 4. on-screen Enter 부재

- Status: `Done`
- 문제:
  - 하드웨어는 `Enter`로 줄바꿈 가능하지만, on-screen에는 대응 키가 없었다.
- 대응:
  - bottom row에 `Enter` key를 추가하고 줄바꿈 literal input으로 연결했다.

## 5. on-screen 입력 후 하드웨어 입력으로 이어가기

- Status: `Done`
- 문제:
  - on-screen 클릭 이후 editor surface focus가 약해져 다음 하드웨어 입력이 자연스럽지 않을 수 있었다.
- 대응:
  - on-screen 입력 뒤 editor root에 다시 focus를 돌린다.

## 6. modifier 사용감 차이

- Status: `Partial`
- 문제:
  - 하드웨어 modifier는 “누르고 있는 동안만” 활성이고, on-screen modifier는 `off -> oneshot -> locked` 순환 토글이다.
- 현재 대응:
  - on-screen은 spec에 맞춰 cycle 모델 유지
  - 하드웨어 눌림 상태도 on-screen 색상에 반영
- 남은 차이:
  - on-screen에서 일시적 hold gesture를 따로 제공하지는 않음

## 7. auto-repeat 차이

- Status: `Partial`
- 문제:
  - 하드웨어 `Backspace` 길게 누르기, 화살표 길게 누르기 같은 auto-repeat가 on-screen에는 없다.
- 현재 대응:
  - on-screen `Backspace`는 long press 시 repeat timer로 반복 삭제를 지원한다.
- 남은 차이:
  - 화살표 key 자체가 아직 on-screen에 없다.
  - 다른 utility key의 auto-repeat는 제공하지 않는다.

## 8. composition 이벤트 개입 차이

- Status: `Partial`
- 문제:
  - 하드웨어 direct key path와 시스템 IME path(`beforeinput`/`composition*`)는 여전히 브라우저별 차이가 있다.
- 현재 대응:
  - recent committed text 기반 dedupe
  - blur 시 composition buffer commit + marker reset
- 남은 차이:
  - 브라우저/OS별 실제 DOM surface 차이에 대한 추가 검증 필요

## 9. caret/selection interaction 차이

- Status: `Partial`
- 문제:
  - 일반 텍스트 편집기처럼 느껴지는지 기준에서 아직 edge case가 남아 있다.
- 현재 대응:
  - click는 caret 이동
  - drag일 때만 selection
  - selection replacement / newline deletion helper화
  - 줄 단위 `Home/End` 이동은 이미 반영됨
- 남은 차이:
  - 장문 편집
  - 모바일 touch selection
  - selection/caret 복사 경로와 브라우저 native selection의 미세한 차이

## 다음 우선순위

1. composition 이벤트의 실제 DOM surface 회귀 테스트 확대
2. caret/selection edge case 회귀 테스트 확대
3. 화살표 key를 on-screen에 둘지 여부 검토
