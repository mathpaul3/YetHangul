# YetHangul Handoff Decisions

이 문서는 다음 에이전트가 빠르게 문맥을 이어받을 수 있도록, 지금까지의 주요 논점과 최종 결정을 정리한 문서다.

## Product Goal

- 목표는 어떤 OS/브라우저에서도 직관적인 규칙으로 옛한글을 입력할 수 있는 웹 입력기다.
- OS 기본 입력기에 의존하지 않고, 웹 앱 내부 입력 엔진이 직접 조합을 수행한다.
- 사용자는 가능하면 현대 한글 자모 규칙과 modifier 규칙을 기반으로 옛한글을 입력한다.
- 목표 지원 범위는 문자 집합 위키의 "유니코드 옛한글 1638750자" 페이지 기준으로 잡는다.
- 범위 정의:
  - 초성 125자
  - 중성 95자
  - 종성 138자
  - 초성/중성/종성 중 한 성분 이상이 없는 경우도 포함

## Core Architecture

- 핵심 구조는 `FSM + sparse transition table + undo log`로 확정했다.
- 입력 중 전체 문자열을 매번 재계산하지 않는다.
- 편집 중인 마지막 음절만 active syllable로 관리하고, 확정된 앞부분은 committed jamo로 둔다.
- backspace는 문자열 삭제가 아니라 입력 단계 기준 undo로 구현한다.

## Internal Representation

- 내부 저장은 문자열 자체가 아니라 numeric id 중심으로 관리한다.
- 주요 단위:
  - `InputSymbolId`
  - `JamoId`
  - `StateId`
- 렌더링 직전에만 `JamoId[] -> Unicode string` 변환을 수행한다.
- 붙여넣기나 외부 문자열 처리도 mapper/normalizer를 통해 internal symbol sequence로 바꾼다.
- `inputMapper.ts`를 추가해 `Unicode string -> internal input symbol sequence` 경로를 엔진 mapper 계층으로 올렸다.

## Unicode Strategy

- 현대/옛한글 모두 최종 출력은 Unicode 조합용 자모를 사용한다.
- 단일 Unicode 자모가 존재하는 경우에는 해당 자모로 축약한다.
- 단일 자모가 없는 복합 조합은 입력 이력 기반으로 시퀀스를 유지하거나, 가능한 범위의 표준 조합으로 변환한다.
- 코드포인트 상수는 수동 번호 유지가 위험하다고 판단하여, 현재는 이름-유니코드 정의에서 자동으로 id를 생성하는 구조로 바꿨다.
- `inputSymbolTable`과 `jamoTable`은 현재 영어 key가 아니라 실제 한글 자모 순서를 기준으로 정렬한다.
- 구체적으로는 현대 한글 자모 순서를 우선하고, 관련 옛한글/특수 자모는 가까운 기본 자모 옆에 배치한다.
- `compositionTables.ts`도 선언형 데이터 테이블로 재구성했고, 초성/중성/종성 단순 매핑과 복합 조합표를 한글 순 기준으로 점검할 수 있게 정리했다.
- 목표 범위 125/95/138은 `inventoryCatalog.ts`와 `targetInventory.ts`에 Unicode 범위 기반 inventory 데이터로 올렸다.
- 현재 지원 자모가 목표 inventory에서 어디까지 커버되는지 coverage 계산도 같은 파일에서 관리한다.
- coverage 계산은 `primitive + automatic rule` 전체를 기준으로 한다.
- 현재 목표값은 `초성 125/125`, `중성 95/95`, `종성 138/138`이며 missing sample도 비어 있어야 한다.
- auxiliary coverage에는 방점과 채움문자도 포함한다.
- coverage가 완전히 충족된 뒤에는 UI의 Engine Notes에서 coverage / missing sample 표시를 제거한다.
- 빠진 자모는 `DIRECT_INITIAL_*`, `DIRECT_MEDIAL_*`, `DIRECT_FINAL_*` 형태의 direct inventory symbol로 편입하기 시작했다.
- 이 direct symbol은 기본 자판 입력용이 아니라, 목표 inventory 전체를 내부 표현/붙여넣기/렌더링 기준으로 수용하기 위한 확장 레이어다.
- 현재는 초성/중성/종성 target inventory 전 범위를 direct inventory symbol까지 포함해 테이블상 수용한다.

## Keyboard Policy

- 데스크톱: 하드웨어 키보드 우선
- 태블릿: 하드웨어 키보드가 감지되면 하드웨어 우선, 아니면 자체 자판 우선
- 모바일: 자체 자판 우선
- 반응형 구간은 `PC / Tablet / Mobile / Mobile-Small` 4단계로 본다.
- 직접 입력 대상은 일반적인 키보드로 칠 수 있는 기본 자모(`ㄱ-ㅎ`, `ㅏ-ㅣ`)로 제한한다.
- 영문 QWERTY 물리 키(`r`, `k`, `s` 등)는 더 이상 두벌식 치환으로 해석하지 않는다.
- 하드웨어 경로에서는 실제 한글 자모 key value(`ㄱ`, `ㅏ`, `ㄴ` 등)가 들어온 경우에만 엔진 조합 입력으로 본다.
- 로마자/기타 외국어 입력은 literal text로 그대로 통과시킨다.
- 특수 입력은 `L/R Ctrl`, `L/R Shift` 버튼 또는 물리 modifier 조합으로 접근한다.
- 온스크린 UI는 두벌식 QWERTY 한글 배열을 그대로 따르는 일반 자모 버튼과 숫자 row, `L/R Ctrl`, `L/R Shift`, `Space`, `.`, `;`, `Backspace`를 같은 키보드 배열 안에 배치한다.
- 자체 자판은 60% 키보드 느낌을 유지하고, 반응형에서도 각 줄의 QWERTY 배열 자체는 무너지지 않게 유지한다.
- 별도 modifier 패널은 두지 않고, 키보드만 남기는 방향으로 간다.
- `Space`는 기본적으로 일반 공백을 입력한다.
- 채움문자와 방점은 별도 상시 버튼보다 `modifier + Space / . / ;` 방식으로 유지한다.
- 즉 `L/R Ctrl + Space`일 때만 filler, `L/R Ctrl + .` / `L/R Ctrl + ;`일 때만 방점 입력으로 처리한다.

## Modifier Policy

- `L Ctrl`, `R Ctrl`, `L Shift`, `R Shift`를 지원 대상으로 둔다.
- 하드웨어 키보드에서는 modifier keydown/keyup를 따로 추적해서 좌/우 상태를 읽는다.
- 하드웨어 modifier의 눌림 상태는 React state에도 반영해서, 물리 `Shift`/`Ctrl`을 누를 때 on-screen modifier 시각 상태도 함께 갱신한다.
- modifier 외 일반 키도, 하드웨어에서 눌린 key가 on-screen keyboard에 대응되면 해당 keycap을 눌림 상태로 하이라이트한다.
- shift가 섞인 이중 자모(`ㅃㅉㄸㄲㅆㅒㅖ`)도 `event.code` 기반으로 대응 기본 키를 하이라이트한다.
- 물리 키가 없거나 좌우 구분이 어려운 환경에서는 on-screen modifier 버튼으로 대체한다.
- on-screen modifier는 hover만으로 상태가 바뀌지 않는다.
- on-screen modifier는 한 번 누를 때마다 `off -> oneshot -> locked -> off` 순으로 순환한다.
- modifier는 단순 치환 키가 아니라, 현재 음절 상태를 보정하는 연산자로도 동작한다.
- 특히 `Shift + ㅁ`은 문맥형 매크로로 해석한다.
  - 초성만 있으면 `중성 채움 + 쌍미음`
  - 초중성이 있으면 `쌍미음`
  - 입력이 없거나 종성까지 있으면 `초성 채움 + 중성 채움 + 쌍미음`
- `Ctrl + Space`도 같은 철학으로 문맥형 filler 연산으로 해석한다.
- utility key(`Space`, `.`, `;`)는 on-screen modifier 상태뿐 아니라 현재 눌린 하드웨어 `Ctrl` 상태도 함께 본다.
- `Enter`는 줄바꿈 literal input으로 처리한다.
- `Ctrl + Shift + ㅎ -> ꥼ`, `Ctrl + Shift + ㅏ -> ᆢ`도 단계 축약 규칙으로 본다.
- 소비된 `oneshot` modifier는 backspace undo 후에도 되살아나지 않는다.
- `locked` modifier는 입력/undo를 거쳐도 유지된다.
- 방점은 한 음절에 하나만 허용하고, 이미 방점이 있거나 중성이 없는 경우의 추가 방점 입력은 무시한다.

## Input Rule Policy

- 병서와 복합 중성은 가능한 한 입력 이력 기반으로 조합한다.
- 초성/중성/종성은 일부 예시만이 아니라 현대 한글 전 범위에 가깝게 확장하는 방향으로 구현 중이다.
- 현대 한글 기본 조합을 엔진 기본층으로 올리고, 그 위에 옛한글 특수 규칙을 얹는 구조로 정했다.
- 사용자가 제공한 옛한글 분해표를 `archaicRuleCatalog.ts`에 원문에 가깝게 보존하고, 이를 초성/중성/종성 cluster map으로 파싱해 자동 승격 규칙에 연결하기 시작했다.
- 현재 방향은 “가능한 한 항상 순차 입력 자동 승격, 필요한 경우만 filler/문맥형 매크로 보조”다.
- primitive로 남는 자모는 `archaicPrimitiveCatalog.ts`에 따로 정리해서, target inventory 전체가 `primitive 또는 automatic rule` 중 하나로 설명되도록 맞추고 있다.
- `Ctrl + ㅇ`은 문맥에 따라 분기한다.
  - 초성/중성이 아직 없는 문맥: `ᅌ`
  - 이미 `초성 + 중성`이 있는 문맥: 종성 `ᇰ`

## Reparse Policy

- 종성 뒤에 모음이 입력되면, 마지막 종성 자음을 다음 음절 초성으로 재분석한다.
- 복합 종성의 경우에도 마지막 자음을 떼어내고 나머지 종성은 앞 음절에 유지하는 방식으로 처리한다.
- 재분석 직후 입력한 모음을 backspace로 지우면, 재분석 이전 상태로 되돌린다.
- 이미 완성된 초중성 뒤에 조합되지 않는 추가 모음이 들어오면, 기존 중성을 덮어쓰지 않는다.
- 이 경우 현재 음절을 commit하고, `초성 채움 + 새 모음`으로 새 음절을 시작한다.
- 예: `ㄴ + ㄱ + ㅏ + ㅏ + ㅊ -> ᄓᅡᅟᅡᆾ`
- 초성-only 연속 입력은 가능한 최대 초성 조합까지만 만든 뒤, 더 이상 확장되지 않으면 새 초성 글자로 분리한다.
- 예: `ㄹ + ㅇ + ㅋ + ㅋ -> ᄛᄏᄏ`

## Shift + ㅁ Policy

- `Shift + ㅁ`은 기본 탑재한다.
- 현재 구현은 filler 기반 특수 거동을 갖는 macro로 남아 있으며, 가장 완성도 높은 방식으로 마무리된 상태는 아니다.
- 이 항목은 여전히 추가 설계/정제가 필요한 영역이다.

## Paste Normalization Policy

- 붙여넣기는 최소한 다음 범위를 지원한다.
  - compatibility jamo
  - conjoining jamo
  - modern precomposed Hangul
- 가능한 경우 input symbol sequence로 정규화한다.
- 복합 중성과 겹받침도 단일 문자로 유지하지 않고 입력 심볼 시퀀스로 확장한다.
- 현재 target inventory `초성 125 / 중성 95 / 종성 138` 전체에 대해 direct jamo paste normalize 전수 테스트를 통과한다.

## Font Policy

- 폰트 스택은 `"NanumBarunGothic-YetHangul", "Noto Sans KR", sans-serif`로 확정했다.
- `src/assets/fonts/NanumBarunGothic-YetHangul.ttf`를 웹폰트로 로드한다.
- 폰트 수정 내역은 `src/assets/fonts/README.md`에 기록돼 있다.

## Deployment Policy

- 루트 앱 기준 Vite + React + TypeScript 구조를 유지한다.
- Docker 기반 배포를 사용한다.
- GitHub Actions workflow는 `main`/`master` push와 `workflow_dispatch`를 지원한다.
- Docker Hub push 후 NAS 서버에서 pull/run 하는 구조다.

## Scope Clarification

- 사용자 확인으로 범위를 다음처럼 고정했다.
- 목표 inventory는 문자 집합 위키의 125/95/138 전체를 지향한다.
- 하지만 모든 글자를 개별 버튼이나 직접 키로 노출하지는 않는다.
- 일반 자모 직접 입력 + modifier 조합으로 특수 자모를 생성하는 방향이다.
- 특수 자모 전용 팔레트는 우선순위에서 내리고, 입력 버튼 집합은 최대한 단순하게 유지한다.

## Current Design Direction

- 지금 단계의 우선순위는 "전 범위 현대 한글 초중종 조합 + 옛한글 특수자 확장"이다.
- 초성/중성/종성 조합표와 기본 단일 자모 매핑은 `src/engine/tables/compositionTables.ts`로 분리했다.
- 현대 한글 기본 초중종 조합은 현재 지원 symbol inventory 기준으로 한 번에 채워 넣는 방향으로 진행 중이다.
- 현재 composition table은 "현재 지원 중인 inventory를 빠짐없이 점검하기 쉬운 구조"로 먼저 정리한 상태다.
- 최종적으로는 125 × 95 × 138 조합 공간을 다룰 수 있도록 symbol inventory와 composition table을 확장해야 한다.
- target inventory 전체는 현재 `automatic rule` 또는 `primitive` 중 하나의 경로로 설명되도록 연결되어 있다.
- 다음 단계는 실제 키 입력 규칙이 이 전체 규칙 집합을 얼마나 자연스럽게 소화하는지 더 촘촘히 검증하는 것이다.
- 동시에 `keydown`만으로 부족한 환경을 위해 `beforeinput` / `compositionstart` / `compositionend` 경로를 부분 도입해, 시스템 IME가 만든 한글 자모/음절도 normalize 후 엔진에 태우는 방향으로 가고 있다.
- `beforeinput`과 `compositionend`가 같은 조합 결과를 중복 전달하는 브라우저를 대비해, 최근 commit 텍스트를 기준으로 한 dedupe 규칙을 도입했다.
- 편집기 1차 구현으로 `document units + caret index + selection range` 레이어를 입력기 위에 얹었다.
- 현재 결과 영역은 음절 단위 caret 경계 클릭, drag selection, 선택 삭제, 좌우/Home/End 이동을 지원한다.
- 브라우저 기본 selection은 가능한 한 배제하고, 자체 selection과 copy 버튼(`Copy All`, `Copy Selection`)을 우선한다.
- caret/selection 동기화는 훅 내부의 ad-hoc 계산 대신 snapshot ref와 `editorUnits.ts` helper(`commitCompositionUnits`, `getSelectionBounds`)를 기준으로 맞춘다.
- 조합 버퍼를 문서에 flush할 때는 “어느 caret 위치에, 몇 개 unit을” 넣었는지를 helper 기준으로 결정하고, 그 결과를 문서 배열과 caret state에 동시에 반영한다.
- 줄바꿈 unit은 editor surface에서 실제 line break처럼 보이도록 별도 unit class로 렌더링한다.
- unit 위의 짧은 클릭은 selection을 남기지 않고 caret 이동으로 처리하고, 실제 drag가 일어났을 때만 selection을 만든다.
- 극단적 상호작용 시나리오와 대응 전략은 `docs/handoff/extreme-interaction-cases.md`에 별도 정리한다.
- focus 이탈이나 `visibilitychange`가 발생하면 hardware modifier state, pressed key highlight, drag-in-progress 상태를 초기화한다.

## Objective Quality Criteria

- 입력기의 “자연스러움”은 주관 대신 다음 기준으로 본다.
- 입력 보존성: 같은 key sequence는 항상 같은 Unicode 출력으로 수렴해야 한다.
- 최소 surprise: 조합되지 않는 추가 입력은 기존 음절을 덮지 않고 commit-and-restart 되어야 한다.
- undo 일관성: backspace 1회는 사용자 입력 1단계를 정확히 취소해야 한다.
- 문맥 재분석 정확성: 종성 뒤 모음, 복합 종성, 비조합 추가 모음 같은 경계 케이스가 규칙대로 동작해야 한다.
- 전 범위 커버리지: target inventory 125/95/138 전체가 primitive 또는 rule 경로로 설명되어야 한다.
- 실제 키 입력 흐름 검증: `QWERTY key -> input symbol -> transient modifier -> engine output` 경로가 서비스 레벨 테스트로 검증되어야 한다.
- 이 기준들은 현재 엔진 테스트로 계속 수치화/회귀 검증하는 방향으로 관리한다.
