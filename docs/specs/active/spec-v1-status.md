# YetHangul Spec v1 Status

이 문서는 현재 **active spec status source of truth**다.
기존 "설계 명세 v1" 기준으로 현재 구현 상태를 정리한다.

상태 표기:

- `Done`: 구현 완료 또는 실질적으로 동작 확인 완료
- `Partial`: 일부 구현 완료, 추가 보강 필요
- `Not Started`: 아직 구현되지 않음

## 1. 제품 목표

- Status: `Done`
- 웹 입력기, 내부 엔진 기반, Unicode 조합용 자모 출력 구조는 구현됨
- 목표 inventory인 `초성 125 × 중성 95 × 종성 138` 자체는 direct inventory symbol까지 포함해 테이블상 수용 가능
- 기본 자모 + modifier 규칙 기반 직접 입력 UX와 전체 inventory 수용 경로를 함께 제공
- 목표 inventory 자체는 `inventoryCatalog.ts`, `targetInventory.ts`에 데이터로 고정했고, 현재 coverage도 계산 가능
- desktop/tablet/mobile/mobile-small browser smoke까지 추가되어 실제 입력/편집 surface가 주요 기기군에서 동작 확인됨

## 2. 플랫폼 정책

- Status: `Done`
- 데스크톱/모바일 선호 모드 표시와 기본 분기는 구현됨
- 태블릿/모바일/데스크톱 선호 모드와 touch-capable heuristic은 regression test 및 browser smoke로 고정됨

## 3. 폰트 정책

- Status: `Done`
- 웹폰트 선언 및 폰트 스택 적용 완료
- 파일 위치: `src/assets/fonts`, `src/assets/styles/global.css`

## 4. 내부 데이터 표현

- Status: `Done`
- numeric id 기반 internal representation 사용 중
- Unicode 문자열은 렌더링 직전에 mapper를 통해 생성
- input/jamo 테이블은 현재 한글 자모 순으로 재정렬된 상태

## 5. 핵심 자료구조

- Status: `Done`
- `committed`, `active`, `undoStack`, `modifierState` 구조 구현 완료

## 6. FSM 방식

- Status: `Done`
- active syllable 중심 FSM 운용 중
- 전체 문자열 재파싱 없이 마지막 음절만 갱신

## 7. Sparse Transition Table

- Status: `Done`
- 가능한 전이만 `Map` 기반 sparse structure로 관리

## 8. Mapper

- Status: `Done`
- `JamoId -> Unicode` 구현 완료
- `Unicode -> internal symbol sequence`도 `src/engine/mapper/inputMapper.ts`로 분리 완료
- UI의 paste 경로도 엔진 mapper 계층을 사용하도록 정리됨

## 9. 입력 규칙 기본 원칙

- Status: `Done`
- modifier 우선, 조합 가능 시 병서/복합 중성 우선, 전이 실패 시 commit-and-restart 구조 구현

## 10. 병서 규칙

- Status: `Done`
- 대표 예시 `ㅂ+ㅅ+ㄱ -> ᄢ` 구현됨
- 조합표는 `src/engine/tables/compositionTables.ts`의 선언형 데이터 테이블로 외부화/재정리됨
- 현대 한글 기본 복합 중성과 겹받침은 현재 지원 symbol 기준으로 대부분 테이블화됨
- 목표 inventory의 빠진 자모는 direct symbol 형태로 수용을 시작함
- 모호한 standalone consonant 입력은 초성으로 기본값을 두고, 종성은 현재 음절 문맥에서만 도출한다.
- `ᆧ`는 medial-only로 유지하며 일반적인 final target으로 확장하지 않는다.
- 사용자 제공 분해표 기반의 옛한글 자동 승격 규칙을 `archaicRuleCatalog.ts`에서 파싱해 초성/중성/종성 cluster map에 붙이기 시작함
- 대표 예시 `ᄓ`, `ꥥ`, `ힱ`, `ᇃ` 자동 승격 테스트 통과
- 현재 `archaicRuleCatalog.ts`에 들어간 초성/중성/종성 규칙은 전수 자동 승격 테스트 통과
- `archaicPrimitiveCatalog.ts`를 통해 분해되지 않는 primitive 자모도 별도 정리했고, target inventory 전체가 primitive 또는 automatic rule 경로로 커버되는 전수 테스트 통과

## 11. Ctrl 규칙

- Status: `Done`
- `Ctrl + ㅇ`, `LCtrl/RCtrl + ㅅ`, `LCtrl/RCtrl + ㅈ`, `LCtrl/RCtrl + ㅊ`, `Ctrl + ㅎ`, `Ctrl + ㅏ`, 방점 등 핵심 예시 구현
- `Ctrl + ㅇ`은 문맥에 따라 초성 `ᅌ` 또는 종성 `ᇰ`으로 분기하도록 구현 및 테스트 완료
- 하드웨어 키보드에서는 좌/우 Ctrl keydown/keyup 추적 로직 추가
- `Ctrl + Shift + ㅎ -> ꥼ`, `Ctrl + Shift + ㅏ -> ᆢ` 구현 및 테스트 완료
- 핵심 명세 항목은 엔진 테스트와 하드웨어 입력 흐름 테스트로 고정됨

## 12. Shift 규칙

- Status: `Done`
- 쌍기역, 쌍디귿, 쌍비읍, 쌍시옷, 쌍자모, `Shift + ㅊ -> ᅀ`, `Shift + ㅗ/ㅜ/ㅡ/ㅣ`, `Shift + ᆞ -> ᆢ` 흐름 구현
- 내부 modifier state는 `L/R Shift` 분리 상태로 갱신됨
- `Shift + ㅁ`은 현재 음절 상태를 보고 최소 filler만 보충하는 문맥형 macro로 구현됨
- spec 기준 핵심 doubled consonant/vowel 규칙 테스트 보강 완료
- `Shift + ㅁ`의 빈 상태 / 중성-only / 초성-only / 초중성 / 완성 음절 뒤 / literal text 뒤 / undo rollback까지 테스트 보강 완료
- consumed oneshot modifier가 backspace 후 부활하지 않도록 undo 정책 보강 완료

## 13. 음절 재분석 규칙

- Status: `Done`
- 종성 뒤 모음 입력 시 다음 음절 초성으로 이동하는 동작 구현
- 방점이 붙은 음절 뒤에 standalone 중성이 온 뒤 자음이 입력되면, standalone 중성을 commit하고 다음 자음을 새 초성으로 시작하는 회귀 테스트를 추가함

## 14. 재분석 롤백 규칙

- Status: `Done`
- 재분석 직후 모음 삭제 시 원래 상태로 복구되는 테스트 통과

## 15. 백스페이스 정책

- Status: `Done`
- 입력 단계 기준 undo 구현 및 테스트 완료
- 단일 입력 1개만 남은 상태에서도 backspace로 정상 삭제되는 회귀 테스트 추가
- editor-layer selection이 있을 때는 선택된 음절 단위를 통째로 삭제하는 동작을 지원

## 16. 온스크린 버튼

- Status: `Done`
- 두벌식 QWERTY 한글 배열 기반의 일반 자모 버튼 + 숫자 row + `L/R Ctrl` + `L/R Shift` + `Space` + `.` + `;` + `Backspace` 중심 keyboard-only UI로 정리됨
- filler/방점 직접 버튼은 제거했고, `modifier + Space / . / ;` 방식으로 방향을 맞춤
- `Space` 단독 입력은 일반 공백, `Ctrl + Space`만 filler로 동작
- on-screen modifier는 키보드 배열 안에서 `off -> oneshot -> locked -> off` 순으로 순환되도록 정리됨
- 하드웨어 `Shift`/`Ctrl` 눌림 상태도 on-screen modifier 시각 상태에 반영됨
- 하드웨어로 눌린 일반 키도 on-screen keyboard의 대응 keycap에 하이라이트로 반영됨
- on-screen keyboard pointer interaction이 editor focus를 빼앗지 않도록 조정해서, 하드웨어와 on-screen 입력의 조합 흐름 차이를 줄임
- on-screen key press도 짧은 pressed highlight를 직접 보여주도록 보강함
- bottom row에 `Enter`를 추가해 하드웨어와 같은 줄바꿈 경로를 on-screen에서도 제공함
- on-screen 입력 뒤 editor root로 focus를 되돌려 이후 하드웨어 입력이 자연스럽게 이어지도록 조정함
- PC는 기본 펼침, 모바일/태블릿은 modifier/navigation compact row만 보이는 기본 접힘 상태를 사용함
- compact row는 `L/R Ctrl`, `L/R Shift`, `Home`, `End`, `←`, `→`만 노출하고 토글로 전체 키보드를 펼칠 수 있음
- `L/R Ctrl`, `L/R Shift`는 동시에 활성화되지 않도록 반대쪽을 자동으로 끄는 상호배제 규칙을 적용함
- 모바일/태블릿에서는 editor surface tap 시 offscreen textarea를 통해 OS native keyboard를 호출하고, compact row와 함께 hybrid surface로 사용함
- on-screen `Backspace`는 long press repeat를 지원해 하드웨어 auto-repeat와의 차이를 일부 줄임
- on-screen navigation row(`←`, `→`, `Home`, `End`)를 추가해 editor-layer caret 이동을 하드웨어 없이도 사용할 수 있게 함
- on-screen `←` / `→`도 long press repeat를 지원해 하드웨어 화살표 반복 입력과의 차이를 일부 줄임
- meta-row의 modifier 상태 텍스트는 제거됨
- browser smoke:
  - Chrome desktop/tablet/mobile/mobile-small matrix에서 modifier cycle, Enter, Backspace, navigation, composition flow 확인
- 결론:
  - input parity checklist의 on-screen 관련 항목이 모두 Done으로 올라가면서 현재 spec 범위에서는 Done으로 본다

## 17. 모바일 자체 자판

- Status: `Done`
- 모바일 우선 자체 자판이 두벌식 QWERTY 한글 배열에 가깝게 재배치됨
- `PC / Tablet / Mobile / Mobile-Small` 4단계 media query로 재정리함
- 60% 키보드 줄 배열 자체는 유지하고, 폭/간격/패딩만 줄이는 방식으로 레이아웃 붕괴를 완화함
- small viewport에서 현재 selection/modifier 상태를 읽기 쉽게 compact surface summary rail를 추가함
- browser smoke:
  - mobile/mobile-small projects에서 stable rows, compact state rail, modifier feedback, edit flow 통과
- 결론:
  - 작은 화면에서도 60% 배열이 유지되고 상태 피드백이 확인되어 Done으로 본다

## 18. 하드웨어 키보드 감지

- Status: `Done`
- user agent 기반 선호 모드와 keyboard event adapter는 구현
- 좌/우 Ctrl/Shift 상태는 keydown/keyup 기반으로 추적
- blur / visibilitychange 시 stuck modifier 방지를 위한 hardware state reset을 추가함
- touch-capable heuristic은 `ontouchstart`, `maxTouchPoints`, `matchMedia('(pointer: coarse)')` 신호를 regression test로 일부 커버하기 시작했고, desktop/tablet connected-vs-disconnected matrix와 browser/platform probe contract도 별도 test로 정리함
- proof:
  - heuristic regression, connected-vs-disconnected matrix, platform probe contract, browser smoke의 preferred mode matrix를 함께 유지
- 결론:
  - 실제 OS attachment API 없이도 현 프로젝트 범위의 판정 규칙과 proof 자산이 충분히 고정되어 Done으로 본다

## 19. 입력 이벤트 처리

- Status: `Done`
- `keydown` 중심 처리 구현
- 모바일 자체 자판 모드와 하드웨어 브리지 동작
- 좌/우 Ctrl/Shift 판별을 위해 modifier keydown/keyup 추적 추가
- `QWERTY key -> input symbol -> transient modifier -> engine output` 흐름을 서비스 레벨 테스트로 검증 시작
- 영문/외국어 key는 literal text로 통과시키고, 실제 한글 자모 key value는 엔진으로 보내는 정책 반영
- `beforeinput`, `compositionstart`, `compositionend`를 부분 연결해서 시스템 IME가 만든 한글 자모/음절을 normalize 후 엔진에 투입하기 시작함
- `beforeinput` / `compositionend` 중복 commit을 recent text 기반 dedupe로 방어하기 시작함
- `beforeinput`의 `deleteContentBackward` / `deleteContentForward`도 editor-layer 삭제 경로에 연결함
- `beforeinput`의 `insertParagraph`도 editor-layer 줄바꿈 경로로 연결함
- blur 시 조합 중이던 buffer를 document에 commit하고, recent IME duplicate marker를 초기화하도록 보강함
- `Enter`는 줄바꿈 literal input으로 처리되도록 연결함
- `beforeinput` / `composition*` 경로에 대한 회귀 테스트를 확장했고, delete/enter/focus-regain 시나리오를 QA regression으로 고정하기 시작함
- input pipeline refactor Phase 2 첫 slice로 native 문자열 입력을 `NormalizedInputBatch`로 먼저 만들고, canonicalize 후 단일 삽입하는 batch boundary를 명시함
- mixed paste selection replacement까지 browser smoke에 추가해, native batch 경로의 selection replacement proof를 보강함
- focus regain 뒤 delete/enter 후 새 composition session을 허용하는 regression test가 추가됨
- focus regain 뒤 `insertLineBreak`도 같은 beforeinput contract로 유지되는 regression이 추가됨
- focus regain 뒤 duplicate marker가 cleared 되면 `insertFromComposition`도 다시 허용되는 regression이 추가됨
- focus regain 뒤 `insertReplacementText`도 같은 beforeinput contract로 dispatch되는 regression이 추가됨
- focus regain 뒤 `deleteWordBackward` / `deleteSoftLineBackward`도 같은 beforeinput contract로 유지되는 regression이 추가됨
- recovered-focus matrix that aligns composition-end, insertText, insertReplacementText, and duplicate insertFromComposition surfaces is now covered in `inputInterop.test.ts`
- composition-end / beforeinput family contract matrix가 `insertText`, `insertReplacementText`, `insertFromComposition`, `insertParagraph`, `insertLineBreak`까지 함께 묶어 안정화됨
- browser-family-labeled surface breadth matrix가 chromium-like / webkit-like / gecko-like surface 차이를 묶어 coverage를 넓힘
- hardware/on-screen parity regression에 key metadata(`code`, `location`)까지 포함한 작은 matrix가 추가됨
- production에서만 `옛한글 입력` analytics event를 수집하고, dev에서는 `ga-disable-*` guard로 전역 비활성화함
- proof:
  - browser-family-labeled service-level matrix로 chromium-like / webkit-like / gecko-like breadth 유지
  - Chrome desktop smoke에서 compositionend, focus-regain, Enter surface proof 통과
- 결론:
  - service-level breadth와 real-browser smoke를 함께 갖춰 현재 spec 범위에서는 Done으로 본다

## 19-1. 편집기 레이어

- Status: `Done`
- `document units + caret index + selection range` 구조를 훅 레이어에 추가함
- 결과 영역은 caret boundary 클릭, 음절 단위 drag selection, selection 삭제를 지원하는 editor surface로 동작
- `ArrowLeft/Right`, `Home`, `End`, `Shift + ArrowLeft/Right`, `Shift + Home/End`, `Delete`를 editor-layer에 연결함
- `Home/End`는 문서 전체가 아니라 현재 줄 기준으로 이동하도록 보강함
- Phase 3 첫 slice로 selection replacement, literal/newline insertion, backspace/delete가 같은 editor mutation result shape를 통해 적용되도록 훅과 helper 경계를 정리함
- 이어서 newline 경계의 `←/→/Home/End`와 selection collapse도 같은 line-aware helper 계약을 따르도록 정리하고 regression으로 고정함
- `Copy All`, `Copy Selection` 버튼을 추가했고, plain text serialization을 기준으로 복사 경로를 통일함
- 브라우저 기본 selection은 가능한 한 차단하고, 자체 selection을 source of truth로 유지하는 방향으로 정리 중
- 조합 버퍼 flush와 selection bounds 계산을 `editorUnits.ts` helper로 분리했고, 훅은 snapshot ref 기준으로 caret/document 동기화를 맞추도록 보강함
- 줄바꿈 unit을 editor surface에서 실제 line break처럼 보이도록 렌더링 보강함
- unit 위 클릭은 caret 이동, drag일 때만 selection 생성으로 interaction을 보정함
- selection replacement와 Backspace/Delete의 newline unit 처리도 helper 기반으로 정리함
- on-screen `Backspace`도 하드웨어 `Backspace`와 같은 editor-layer 삭제 경로를 타도록 수정함
- document shrink 이후 caret/selection을 현재 문서 길이에 맞춰 재정규화하는 보강과 회귀 테스트를 추가함
- blur/focus를 거친 뒤 반복 copy, CRLF paste 후 selection replacement/delete, newline-crossing selection replacement 회귀 테스트를 추가함
- long-document copy serialization stability 회귀를 추가함
- touch-like drag selection copy/replacement/delete-backspace와 pointer-cancel cleanup 회귀 테스트를 추가함
- touch drag selection이 `pointerenter`에만 의존하지 않도록 pointer-move fallback과 target-index helper를 추가함
- small-screen touch selection에서 browser pan/scroll gesture를 suppress하는 editor surface touch contract를 추가함
- desktop에서는 native composition + mouse selection + on-screen replacement, mobile에서는 native composition + touch selection + on-screen delete가 같은 editor mutation helper surface를 쓴다는 mixed-source browser proof를 추가함
- toned syllable 뒤에 literal punctuation이 온 경우 `Backspace`가 punctuation만 제거하고 직전 음절은 유지하는 desktop smoke를 추가함
- proof:
  - helper regression + long-document/touch/pointer-cancel coverage
  - Chrome desktop/tablet/mobile/mobile-small smoke에서 caret placement, replacement, newline edit flow 통과
  - desktop/mobile mixed-source mutation smoke 통과
- 결론:
  - current editor-layer scope에서 필요한 편집 surface는 안정화되었다고 보고 Done으로 본다

## 20. 붙여넣기 정규화

- Status: `Done`
- compatibility jamo, conjoining jamo, modern precomposed hangul 일부/다수 케이스 지원
- 복합 모음/겹받침 분해 지원
- 목표 inventory의 direct archaic initial/medial/final jamo를 direct inventory symbol로 받기 시작함
- 현재 target inventory 125/95/138 전체를 대상으로 direct jamo paste normalize 전수 테스트 통과
- 조합 규칙 기반 역해석을 위한 별도 통합 mapper는 여전히 분리되지 않았지만, 현재 요구 범위의 direct normalize 경로는 전수 검증 완료

## 21. 렌더링 모드

- Status: `Done`
- 일반 보기 구현
- 분해 보기 토글 구현

## 22. 오류 처리

- Status: `Done`
- 전이 실패 시 현재 음절 commit 후 재시도하는 구조 구현
- 앱이 멈추지 않고 입력이 계속 진행됨

## 23. 최소 테스트 케이스

- Status: `Done`
- 예시 병서, 합성 중성, modifier 규칙, reparse, rollback, paste normalization 케이스 테스트 구현
- 일반 공백 입력과 단일 입력 backspace 회귀 테스트까지 포함
- 목표 inventory count 125/95/138 검증 테스트 포함
- target inventory coverage 100%와 missing sample 0건 검증 테스트 포함
- auxiliary coverage(방점, 채움문자) 100% 검증 테스트 포함
- ambiguous standalone final canonicalization, final-only primitive exact round-trip, mixed literal+Hangul undo/reparse, compound-final carry/reparse regression 테스트 포함
- `Ctrl + Shift + ㅎ`, `Ctrl + Shift + ㅏ`, 문맥형 `Shift + ㅁ`, 문맥형 `Ctrl + Space` 테스트 포함
- `Ctrl + ㅇ + ㅏ + Ctrl + ㅇ -> ᅌᅡᇰ` 회귀 테스트 포함
- 방점 중첩 무시 및 방점 비허용 문맥 무시 회귀 테스트 포함
- target inventory 전체 direct normalize 전수 테스트 포함
- 옛한글 자동 승격 대표 규칙 테스트 포함
- 옛한글 자동 승격 카탈로그 전수 테스트 포함
- primitive 또는 automatic rule 전수 커버 테스트 포함
- 조합되지 않는 추가 모음이 새 filler 음절로 분리되는 회귀 테스트 포함
- 입력 보존성, 문맥형 macro undo 일관성, 엔진-level Unicode mapper 경로 테스트 포함
- 실제 하드웨어 키 입력 흐름 테스트 포함
- literal text 통과 경로와 direct hangul key event 경로 테스트 포함
- `beforeinput` / `compositionend` dedupe 규칙 테스트 포함
- spec 기준 핵심 Ctrl/Shift 규칙 묶음 테스트 포함
- `Shift + ㅁ` 문맥형 macro edge case 테스트 포함
- modifier undo / locked 유지 테스트 포함
- 현재 테스트 수: 219
  - unit/service/engine regression: 184
  - browser smoke (Playwright): 35

## 24. MVP 완료 정의

- Status: `Done`
- 충족된 항목:
  - FSM + sparse transition table + undo log
  - 데스크톱 하드웨어 키보드 기본 입력
  - 모바일 자체 자판의 기초 형태
  - 기본 병서 규칙
  - Ctrl/Shift 특수 규칙 다수
  - 종성 뒤 모음 재분석
  - input-step undo
  - id 기반 내부 저장 + Unicode mapper 출력
  - 폰트 스택 적용
- 완료 근거:
  - 남아 있던 사용자-facing Partial 항목(16/17/18/19/19-1)이 모두 regression + browser smoke로 닫힘
  - 핵심 입력/편집 경로가 desktop/tablet/mobile/mobile-small matrix에서 재현성 있게 통과
  - service-level browser-family matrix와 real-browser smoke를 함께 갖춤

## 현재 다음 우선순위

- 1. watch-only maintenance: 새 브라우저/기기군이 추가되면 smoke project를 확장하기
- 2. 회귀 버그가 생기면 unit/service/e2e 세 레이어 중 맞는 위치에 즉시 추가하기
- 극단 상호작용 시나리오 목록과 대응 초안은 `docs/handoff/extreme-interaction-cases.md`에 정리함
- 하드웨어/on-screen 입력 차이 추적은 `docs/handoff/input-parity-checklist.md`에 정리함
