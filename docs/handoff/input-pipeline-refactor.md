# YetHangul Input Pipeline Refactor Spec

이 문서는 YetHangul의 입력 수집부터 입력 결과창 렌더링까지의 경로를 더 명확하게 정리하기 위한 refactor spec이다.
이 작업은 **spec-first** 방식으로 진행한다.

즉, 먼저 다음을 명확히 정의한 뒤 구현을 진행한다.

1. 어떤 입력 source가 존재하는지
2. 어떤 부분은 adapter별로 분기해야 하는지
3. 어떤 부분은 공통 pipeline으로 합쳐야 하는지
4. 각 phase가 완료되었다고 판단할 수 있는 기준이 무엇인지

## 1. Goals

- 입력 source별 차이를 숨기되, source마다 반드시 달라야 하는 부분은 adapter로 격리한다.
- UI keyboard, PC hardware keyboard, 모바일/태블릿 native keyboard가 가능한 한 같은 normalized event pipeline을 타도록 만든다.
- `keydown` 하나로 모든 source를 억지 통일하지 않고, source-specific adapter와 shared normalized boundary를 분리한다.
- duplicate suppression, modifier consumption, editor mutation, render path를 source와 무관한 공통 규칙으로 좁힌다.
- 이후 기능 확장이나 브라우저/기기군 확장 시에도 입력 경계가 다시 섞이지 않게 한다.

## 2. Non-Goals

- 모바일 native IME를 `keydown` 하나로 완전히 대체하는 것
- UI keyboard와 native IME의 low-level DOM event까지 완전히 동일하게 만드는 것
- 이번 refactor에서 새 입력 기능을 추가하는 것
- editor-layer의 사용자-facing 기능을 바꾸는 것
- keyboard layout, help overlay, branding shell 같은 시각적 기능을 다시 설계하는 것

## 3. Current Flows

### 3-1. UI Keyboard

현재 흐름:

1. 사용자가 on-screen key를 클릭한다.
2. `src/features/ime/ui/ImeWorkbench.tsx`의 `renderKeyboardAction(...)`가 동작한다.
3. `dispatchNormalizedInputEvent(...)`가 호출된다.
4. `useImeWorkbench.ts`가 event type별로 분기한다.
5. `symbol / literal / modifier / utility / navigation` 중 하나로 정규화된다.
6. 엔진 또는 editor helper를 호출한다.
7. `renderedUnits`가 갱신된다.

### 3-2. Mobile / Tablet Native Keyboard

현재 흐름:

1. 사용자가 입력 결과창을 탭한다.
2. offscreen textarea에 focus가 간다.
3. OS native keyboard가 표시된다.
4. `beforeinput` / `compositionstart` / `compositionend`가 들어온다.
5. `resolveBeforeInputInterop(...)` / `resolveCompositionEndInterop(...)`가 동작한다.
6. `shouldSuppressInteropTextAfterDirectDispatch(...)`가 중복 입력을 방어한다.
7. `dispatchNormalizedTextBatch(...)`가 문자열을 internal symbol / literal batch로 정규화한다.
8. editor/document가 갱신된다.
9. `renderedUnits`가 갱신된다.

### 3-3. PC Hardware Keyboard

현재 흐름:

1. 사용자가 물리 키를 누른다.
2. `handleKeyDown(...)`이 동작한다.
3. `resolveVisualKeyLabelFromKeyboardEvent(...)`가 하이라이트용 label을 찾는다.
4. `resolveInputSymbolFromKeyboardEvent(...)`가 symbol id를 찾는다.
5. `resolveTransientModifiersFromKeyboardEvent(...)`가 transient modifier를 계산한다.
6. `dispatchNormalizedInputEvent(...)`가 호출된다.
7. 엔진 또는 editor helper를 호출한다.
8. `renderedUnits`가 갱신된다.

## 4. Unavoidable Adapter-Specific Branches

다음은 현재도 분리 유지가 필요한 영역이다.

### 4-1. Input Collection

- UI keyboard는 click/pointer adapter가 필요하다.
- PC hardware keyboard는 `keydown/keyup` adapter가 필요하다.
- mobile native keyboard는 `beforeinput/composition*` adapter가 필요하다.

### 4-2. Modifier Acquisition

- UI keyboard는 on-screen modifier state를 사용한다.
- PC hardware keyboard는 transient modifier state와 key location을 사용한다.
- native keyboard는 modifier가 명시적이지 않은 경우가 많다.

### 4-3. Text Granularity

- UI / hardware는 대체로 symbol 중심이다.
- native IME는 committed text 중심이다.

이 분기는 없애지 않고 adapter 경계에 가둔다.

## 5. Required Shared Pipeline Stages

다음 단계는 source와 무관하게 하나로 합쳐야 한다.

### 5-1. Normalized Input Event

공통 이벤트 타입은 현재 다음 분류를 가진다.

- `symbol`
- `literal`
- `modifier`
- `utility`
- `navigation`

### 5-2. Single Dispatcher

- 모든 adapter 출력은 가능한 한 `dispatchNormalizedInputEvent(...)` 또는 동등한 공통 진입점으로 모인다.
- 이 경계에서 엔진과 editor helper로 나뉜다.

### 5-3. Duplicate Suppression

- direct dispatch 직후의 native `beforeinput` / `compositionend`는 공통 suppression rule로 막는다.
- suppression은 source별 개별 규칙이 아니라 shared boundary 직전 정책이어야 한다.

### 5-4. Editor Mutation Helpers

다음은 source와 무관하게 같은 helper를 타야 한다.

- selection deletion
- replacement
- line break insertion
- caret movement
- document unit mutation

### 5-5. Render Path

최종 렌더는 항상 같은 순서를 유지한다.

```text
engine active syllable
+ document units
-> renderedUnits
-> output surface
```

## 6. Phased Plan

### Phase 1. Dispatcher Boundary Clarification

목표:
- 현재 흩어져 있는 직접 호출을 정리하고, 공통 진입점을 명시한다.

작업:
- `dispatchNormalizedInputEvent(...)`를 single dispatcher로 더 분명히 만든다.
- `handleInput(...)`, `handleLiteralInput(...)`, `handleUtilityInput(...)`, `handleNavigationInput(...)`의 역할을 dispatcher 하위 handler로 정리한다.
- native 전용 문자열 경로는 역할이 드러나도록 이름과 위치를 명확히 한다.

Done Criteria:
- 공통 dispatcher가 코드상으로 더 잘 드러난다.
- 기존 테스트가 깨지지 않는다.
- UI / hardware / native adapter가 어느 경로를 타는지 문서로 설명 가능하다.

Key Regression Tests:
- UI keyboard 입력이 기존과 동일하게 동작한다.
- hardware keyboard 입력이 기존과 동일하게 동작한다.
- native beforeinput / compositionend가 기존과 동일하게 동작한다.
- duplicate suppression이 유지된다.

### Phase 2. Native Batch Normalization

목표:
- native 문자열 경로를 explicit batch adapter로 승격하고, shared normalized vocabulary를 더 직접적으로 공유하게 만든다.
- current-goals의 atomic task ids는 `R25-2`, `R25-2a`, `R25-2b`로 추적한다.

작업:
- `dispatchNormalizedTextBatch(...)`의 역할을 batch adapter로 명시한다.
- native text를 normalized symbol/literal batch로 분해할 수 있는 경로를 먼저 정리한다.
- batch adapter와 `dispatchNormalizedInputEvent(...)`가 같은 normalized vocabulary를 공유하되, document 반영은 batch canonicalization 경계에서 수행한다.
- batch adapter와 modifier consumption rule을 shared rule로 고정한다.

Done Criteria:
- mixed literal + Hangul + tone / filler / composition cases가 batch adapter를 통해 같은 normalized vocabulary를 더 많이 공유한다.
- direct dispatch 이후 native 후행 입력이 더 적은 특수 처리로 막힌다.
- native text 경로가 raw DOM text 처리보다 batch signature 기준으로 설명 가능하다.

Key Regression Tests:
- mixed paste 순서 보존
- compositionend / beforeinput 중복 억제
- tone / filler / newline / replacement text 회귀
- 동일 기본 키에서 파생된 modifier형 후행 text duplicate 억제
- batch adapter가 literal + Hangul mix를 canonical order로 유지하는지 확인

Current Atomic Slice:
- `R25-2a` `Landed`
  - native text를 `NormalizedInputBatch`로 먼저 만들고, 그 batch를 canonicalize한 뒤 document에 넣는 경계를 코드로 드러냈다.
  - mixed literal + Hangul 순서 보존을 batch 생성 / batch canonicalization / batch dispatch regression으로 고정했다.
- `R25-2b` `Landed`
  - tone / filler / newline / selection replacement / duplicate suppression이 batch 경계에서도 shared rule을 유지하는지 unit/service/e2e regression으로 고정했다.

### Phase 3. Editor Mutation Unification

목표:
- source와 무관하게 document mutation이 완전히 같은 helper 경로를 타게 만든다.
- current-goals의 atomic task ids는 `R25-3`, `R25-3a`, `R25-3b`, `R25-3c`로 추적한다.

작업:
- selection replacement
- backspace/delete
- line break insertion
- caret movement
- document shrink / selection normalization
를 editor helper로 완전히 일원화한다.

Done Criteria:
- editor-layer mutation이 source별 분기보다 helper별 분기로만 설명된다.
- keyboard / mouse / touch / native IME가 같은 document mutation surface를 사용한다.
- source-specific adapter는 input collection까지만 맡고, mutation 자체는 shared helper layer에서만 일어난다.

Key Regression Tests:
- caret placement
- selection replacement
- newline boundary edits
- long-document copy / replace / delete / shrink
- touch drag selection / pointer cancel

Current Atomic Slice:
- `R25-3a` `Landed`
  - selection replacement, literal/newline insertion, backspace/delete가 같은 editor mutation result shape를 통해 적용되도록 정리했다.
  - 첫 단계에서는 gesture/source adapter를 바꾸지 않고, `useImeWorkbench.ts` 안의 반복적인 document/caret/selection state 적용을 helper 중심으로 줄였다.
- `R25-3b` `Open`
  - newline 경계의 caret 이동, selection collapse, delete/backspace가 같은 line-aware helper 규칙을 따르는지 추가 regression으로 고정한다.
- mixed-source editor mutation parity
- selection normalization after replacement / deletion

## 7. Suggested Implementation Order

1. Phase 1부터 시작한다.
2. Phase 1이 끝나면 native batch normalization을 검토한다.
3. Phase 2는 `R25-2` 계열 atomic task id로 쪼개서 한 번에 1개만 잡는다.
4. Phase 2가 안정되면 editor mutation unification을 더 좁혀간다.

## 8. Related Documents

- `docs/handoff/input-flow-review.md`
- `docs/handoff/decisions.md`
- `docs/handoff/spec-status-v1.md`
- `docs/handoff/current-goals.md`
