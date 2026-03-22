# YetHangul Spec v1 Status

이 문서는 기존 "설계 명세 v1" 기준으로 현재 구현 상태를 정리한 것이다.

상태 표기:

- `Done`: 구현 완료 또는 실질적으로 동작 확인 완료
- `Partial`: 일부 구현 완료, 추가 보강 필요
- `Not Started`: 아직 구현되지 않음

## 1. 제품 목표

- Status: `Partial`
- 웹 입력기, 내부 엔진 기반, Unicode 조합용 자모 출력 구조는 구현됨
- 목표 inventory인 `초성 125 × 중성 95 × 종성 138` 자체는 direct inventory symbol까지 포함해 테이블상 수용 가능
- 다만 모든 자모에 대해 규칙 기반 직접 입력 UX가 완성된 것은 아님
- 목표 inventory 자체는 `inventoryCatalog.ts`, `targetInventory.ts`에 데이터로 고정했고, 현재 coverage도 계산 가능

## 2. 플랫폼 정책

- Status: `Partial`
- 데스크톱/모바일 선호 모드 표시와 기본 분기는 구현됨
- 태블릿의 실제 하드웨어 키보드 감지 품질은 아직 단순 heuristics 수준

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

## 14. 재분석 롤백 규칙

- Status: `Done`
- 재분석 직후 모음 삭제 시 원래 상태로 복구되는 테스트 통과

## 15. 백스페이스 정책

- Status: `Done`
- 입력 단계 기준 undo 구현 및 테스트 완료
- 단일 입력 1개만 남은 상태에서도 backspace로 정상 삭제되는 회귀 테스트 추가
- editor-layer selection이 있을 때는 선택된 음절 단위를 통째로 삭제하는 동작을 지원

## 16. 온스크린 버튼

- Status: `Partial`
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
- on-screen `Backspace`는 long press repeat를 지원해 하드웨어 auto-repeat와의 차이를 일부 줄임
- meta-row의 modifier 상태 텍스트는 제거됨
- 왜 Partial인지:
  - 기능적 경로는 대부분 맞췄지만, on-screen modifier 사용감과 utility key parity가 아직 hardware parity와 완전히 일치하지 않는다.
  - `docs/handoff/input-parity-checklist.md`의 modifier 사용감 / auto-repeat / composition / caret-selection 항목이 아직 Partial이다.
- Done 조건:
  - input-parity-checklist의 on-screen 관련 항목이 모두 Done이 되고, on-screen keyboard의 키 배치/피드백이 hardware와의 체감 차이를 더 이상 유의미하게 만들지 않을 때.
- Next proof needed:
  - on-screen modifier, Backspace repeat, Enter, and copy flows that match hardware parity in a cross-browser smoke test.

## 17. 모바일 자체 자판

- Status: `Partial`
- 모바일 우선 자체 자판이 두벌식 QWERTY 한글 배열에 가깝게 재배치됨
- `PC / Tablet / Mobile / Mobile-Small` 4단계 media query로 재정리함
- 60% 키보드 줄 배열 자체는 유지하고, 폭/간격/패딩만 줄이는 방식으로 레이아웃 붕괴를 완화함
- 왜 Partial인지:
  - 레이아웃과 기본 입력은 갖췄지만, 모바일에서 조합 힌트와 active modifier 피드백이 아직 충분히 명시적이지 않다.
  - 터치 중심 환경에서의 조합 안내와 시각적 feedback이 hardware/on-screen parity 수준까지 닿지 않았다.
- Done 조건:
  - 모바일에서 현재 조합 상태, modifier 상태, 선택/삭제 결과가 명확히 보이고, 작은 화면에서도 60% 배열이 깨지지 않는 상태가 검증되면.
- Next proof needed:
  - Mobile and Mobile-Small screenshots or a smoke run that show stable rows, visible state feedback, and no layout collapse.

## 18. 하드웨어 키보드 감지

- Status: `Partial`
- user agent 기반 선호 모드와 keyboard event adapter는 구현
- 좌/우 Ctrl/Shift 상태는 keydown/keyup 기반으로 추적
- blur / visibilitychange 시 stuck modifier 방지를 위한 hardware state reset을 추가함
- 왜 Partial인지:
  - 현재 감지는 user agent와 keyboard event 기반 heuristics에 의존한다.
  - 실제 하드웨어 키보드 연결 여부를 플랫폼/브라우저별로 신뢰도 높게 판정하는 단계는 아직 아니다.
- Done 조건:
  - desktop/tablet 주요 조합에서 hardware 연결 여부 판정이 일관되고, 오탐/미탐이 충분히 낮은 수준으로 검증되면.
- Next proof needed:
  - A platform matrix showing the detected mode for connected and disconnected keyboard cases on desktop/tablet.

## 19. 입력 이벤트 처리

- Status: `Partial`
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
- 왜 Partial인지:
  - `beforeinput` / `composition*` 경로는 연결했지만, 브라우저별 실제 DOM surface 차이까지 포괄하는 end-to-end 안정성은 아직 충분히 잠기지 않았다.
  - hardware key path와 system IME path를 같은 수준으로 검증하는 회귀 세트가 더 필요하다.
- Done 조건:
  - 주요 브라우저/OS 조합에서 `keydown`, `beforeinput`, `composition*`가 동일한 편집 결과로 수렴하고, 중복 commit/누락이 재현되지 않으면.
- Next proof needed:
  - A cross-browser input matrix covering insert, delete, enter, and composition end behavior.

## 19-1. 편집기 레이어

- Status: `Partial`
- `document units + caret index + selection range` 구조를 훅 레이어에 추가함
- 결과 영역은 caret boundary 클릭, 음절 단위 drag selection, selection 삭제를 지원하는 editor surface로 동작
- `ArrowLeft/Right`, `Home`, `End`, `Shift + ArrowLeft/Right`, `Shift + Home/End`, `Delete`를 editor-layer에 연결함
- `Home/End`는 문서 전체가 아니라 현재 줄 기준으로 이동하도록 보강함
- `Copy All`, `Copy Selection` 버튼을 추가했고, plain text serialization을 기준으로 복사 경로를 통일함
- 브라우저 기본 selection은 가능한 한 차단하고, 자체 selection을 source of truth로 유지하는 방향으로 정리 중
- 조합 버퍼 flush와 selection bounds 계산을 `editorUnits.ts` helper로 분리했고, 훅은 snapshot ref 기준으로 caret/document 동기화를 맞추도록 보강함
- 줄바꿈 unit을 editor surface에서 실제 line break처럼 보이도록 렌더링 보강함
- unit 위 클릭은 caret 이동, drag일 때만 selection 생성으로 interaction을 보정함
- selection replacement와 Backspace/Delete의 newline unit 처리도 helper 기반으로 정리함
- on-screen `Backspace`도 하드웨어 `Backspace`와 같은 editor-layer 삭제 경로를 타도록 수정함
- 왜 Partial인지:
  - caret/selection의 핵심 편집 흐름은 동작하지만, 장문 편집과 모바일 touch selection 같은 실제 사용자 interaction edge case가 아직 남아 있다.
  - selection/caret 복사 경로와 브라우저 native selection을 완전히 동일한 수준으로 잠그는 단계는 아직 아니다.
- Done 조건:
  - click/drag/replace/delete/home-end/newline/copy가 주요 브라우저에서 동일한 단위 모델로 안정화되고, 장문 및 모바일 interaction 회귀가 통과하면.
- Next proof needed:
  - A long-document interaction run showing caret, selection, replace, delete, and copy behavior staying stable across multiple edits.

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
- 현재 테스트 수: 110

## 24. MVP 완료 정의

- Status: `Partial`
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
- 아직 부족한 항목:
  - 전체 규칙 집합을 실제 키 입력 UX에 더 촘촘히 반영하는 작업
  - 모바일 자판의 실사용 완성도
  - paste/composition/input 이벤트 완성도
  - `Shift + ㅁ` 같은 macro 규칙 정제
- 왜 Partial인지:
  - 섹션 16/17/18/19/19-1에 남아 있는 사용자-facing parity와 DOM/event edge case가 아직 MVP 수준의 최종 안정성에 도달하지 않았다.
  - 운영/배포는 준비되어 있지만, 입력기 본체의 최종 사용감과 브라우저 호환성을 더 잠가야 한다.
- Done 조건:
  - 위 사용자-facing Partial 항목들이 모두 Done이 되고, spec의 핵심 입력/편집 경로가 주요 브라우저와 기기군에서 재현성 있게 통과하면.
- Next proof needed:
  - One end-to-end smoke test per remaining Partial area that passes without manual intervention.

## 현재 다음 우선순위

- 1. composition 이벤트 처리의 실제 DOM surface 검증 넓히기
- 2. caret/selection editor-layer 회귀 테스트를 더 늘리기
- 3. 실제 사용자 interaction 기준 회귀 테스트를 더 늘리기
- 4. 모바일 자체 자판의 조합 힌트와 시각 피드백 강화
- 5. 태블릿/하드웨어 키보드 감지 품질 보강
- 극단 상호작용 시나리오 목록과 대응 초안은 `docs/handoff/extreme-interaction-cases.md`에 정리함
- 하드웨어/on-screen 입력 차이 추적은 `docs/handoff/input-parity-checklist.md`에 정리함
