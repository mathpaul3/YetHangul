# YetHangul Input Flow Review

이 문서는 현재 YetHangul의 입력 수집부터 입력 결과창 렌더링까지의 흐름을 함수 단위로 정리하고,
어디서 분기가 생기며 어디를 공통 파이프라인으로 합쳐야 하는지 설명한다.

## 요약

- 입력 source는 3개다.
  - UI on-screen keyboard
  - 모바일/태블릿 OS native keyboard
  - PC hardware keyboard
- 이 3개는 **입력 수집 방식 자체는 완전히 같아질 수 없다.**
- 특히 모바일/태블릿 native IME는 `keydown`를 안정적인 canonical source로 제공하지 않기 때문에,
  **모든 source를 keydown 하나로 통일하는 설계는 현실적으로 안전하지 않다.**
- 대신 목표는 다음이다.

```text
source-specific adapter
-> normalized input event
-> single dispatcher
-> engine/editor
-> rendered units
```

즉, **수집은 adapter별로 다르게 하고, 수집 결과를 normalized event boundary에서 통합**하는 것이 현재 구조와 가장 잘 맞는다.

## 1. UI 키보드 -> 입력 결과창

시작점:
- `src/features/ime/ui/ImeWorkbench.tsx`

주요 흐름:
1. 사용자가 on-screen key 클릭
2. `renderKeyboardAction(...)`
3. `dispatchNormalizedInputEvent(...)`
4. `useImeWorkbench.ts`
5. event type별 분기
   - `symbol`
   - `literal`
   - `modifier`
   - `utility`
   - `navigation`
6. 엔진 또는 editor helper 호출
7. `compositionText`
8. `compositionUnits`
9. `renderedUnits`
10. 입력 결과창 렌더

특징:
- 이미 “정규화된 이벤트 객체”를 직접 dispatcher에 넣는 구조다.
- 가장 통제하기 쉬운 source다.

## 2. 모바일/태블릿 native keyboard -> 입력 결과창

시작점:
- `ImeWorkbench.tsx`의 offscreen textarea focus

주요 흐름:
1. 사용자가 입력 결과창 tap
2. `focusInputSurface()`
3. offscreen textarea focus
4. OS native keyboard 표시
5. 브라우저 이벤트 진입
   - `handleBeforeInput(...)`
   - `handleCompositionStart(...)`
   - `handleCompositionEnd(...)`
6. `resolveBeforeInputInterop(...)` / `resolveCompositionEndInterop(...)`
7. `shouldSuppressInteropTextAfterDirectDispatch(...)`
8. `dispatchUnicodeText(...)`
9. 문자열을 internal symbol/literal로 정규화
10. editor/document 반영
11. `renderedUnits` 렌더

특징:
- native IME는 보통 문자/조합 결과를 `beforeinput` / `composition*`로 전달한다.
- `keydown`만으로는 안정적인 문자 의미를 얻기 어렵다.
- 따라서 **native keyboard는 event adapter가 따로 필요한 source**다.

## 3. PC hardware keyboard -> 입력 결과창

시작점:
- `useImeWorkbench.ts`의 `handleKeyDown(...)`

주요 흐름:
1. 사용자가 물리 키 입력
2. `handleKeyDown(...)`
3. `resolveVisualKeyLabelFromKeyboardEvent(...)`
4. `resolveInputSymbolFromKeyboardEvent(...)`
5. `resolveTransientModifiersFromKeyboardEvent(...)`
6. `dispatchNormalizedInputEvent(...)`
7. 엔진 또는 editor helper 호출
8. `compositionText`
9. `compositionUnits`
10. `renderedUnits`
11. 입력 결과창 렌더

특징:
- 하드웨어 쪽은 `keydown/keyup`가 가장 유효한 source다.
- 좌/우 modifier 추적도 이 경로에 적합하다.

## 왜 `keydown` 하나로 통일할 수 없는가

겉보기엔 “UI keyboard / hardware keyboard / native keyboard 모두 keydown으로 받자”가 단순해 보인다.
하지만 실제로는 다음 문제 때문에 unsafe하다.

### 1. 모바일/태블릿 native IME는 meaningful keydown을 보장하지 않는다

- 일부 브라우저/OS에서는 `keydown`가 아예 오지 않는다.
- 와도 `Process`, `Unidentified`, generic key만 오는 경우가 있다.
- 사용자가 실제로 입력한 건 `ㅆ`인데, keydown만 보면 정확한 문자/조합 상태를 모를 수 있다.

### 2. composition이 있는 언어 입력은 keydown보다 committed text가 더 canonical하다

- 한글 IME는 조합 중간 상태가 많다.
- 사용자가 “최종적으로 무엇을 넣었는가”는 `beforeinput` / `compositionend`가 더 정확히 표현한다.

### 3. native selection/editing surface와의 충돌

- native keyboard를 띄우기 위해 hidden textarea를 포커스하는 현재 구조에서는
  브라우저가 input surface에서 발생시키는 text event를 읽는 것이 가장 안전하다.

결론:
- **hardware는 keydown-first**
- **native IME는 beforeinput/composition-first**
- 그러나 두 adapter의 출력은 공통 normalized event boundary로 수렴해야 한다.

## 현재 구조에서 어쩔 수 없이 분기되는 부분

### A. 입력 수집

- UI keyboard: click / pointer
- hardware keyboard: keydown / keyup
- native keyboard: beforeinput / composition

이 분기는 유지하는 것이 맞다.

### B. modifier 취득

- UI keyboard: on-screen modifier state
- hardware keyboard: transient modifier state + key location
- native keyboard: modifier 개념이 거의 없음

### C. 해석 단위

- UI/hardware: symbol 중심
- native: committed text 중심

## 공통으로 합쳐야 하는 부분

### 1. normalized input event model

현재 공통 dispatcher는 `dispatchNormalizedInputEvent(...)`다.

이벤트 종류:
- `symbol`
- `literal`
- `modifier`
- `utility`
- `navigation`

장기적으로는 native 문자열 입력도 이 boundary를 더 직접 타게 만드는 것이 좋다.

### 2. duplicate suppression

`shouldSuppressInteropTextAfterDirectDispatch(...)`는
- direct dispatch 직후
- native `beforeinput` / `compositionend`가 같은 입력을 다시 내보내는 경우
중복 반영을 막는다.

이 suppression은 source-specific가 아니라 **normalized boundary 직전의 공통 규칙**이어야 한다.

### 3. editor mutation path

다음은 source와 무관하게 하나의 경로를 타야 한다.
- selection deletion
- replacement
- line break insertion
- caret movement
- document unit mutation

현재 이 역할은 `editorUnits.ts` helper가 담당한다.

### 4. render path

최종 렌더는 항상:

```text
engine active syllable
+ document units
-> renderedUnits
-> output surface
```

로 통일돼야 한다.

## 현재 가장 중요한 구조적 차이

현재도 공통 dispatcher는 존재하지만, native text 경로는 여전히 `dispatchUnicodeText(...)`라는 별도 우회 경로를 가진다.

즉 지금은:

- UI/hardware
  - `dispatchNormalizedInputEvent(...)`
- native IME
  - `resolveBeforeInputInterop(...)`
  - `resolveCompositionEndInterop(...)`
  - `dispatchUnicodeText(...)`

로 되어 있다.

이 구조는 실용적이지만, “완전히 같은 dispatcher”라고 보기엔 아직 1단계 덜 정리된 상태다.

## 추천 구조 원칙

### 원칙 1. adapter는 분리한다

- UI adapter
- hardware adapter
- native IME adapter

### 원칙 2. adapter 출력은 normalized event boundary로 모은다

가능한 모든 입력을:

```text
normalized input event
-> single dispatcher
```

로 모은다.

### 원칙 3. native는 keydown이 아니라 text-commit source를 canonical로 본다

즉:
- “입력 수집 자체를 keydown으로 통일”은 하지 않는다.
- “수집 결과를 normalized event로 통일”한다.

## 다음 리팩터링 후보

### 후보 A. native text -> normalized batch dispatcher

현재 `dispatchUnicodeText(...)`는 문자열을 한 번에 임시 엔진 상태로 canonicalize한 뒤 문서에 삽입한다.

다음 단계에서는 이 경로를:
- text
- -> normalized symbol/literal batch
- -> common dispatcher batch

로 더 끌어올릴 수 있다.

주의:
- reducer state와 modifier 소비 순서를 깨지 않도록 batch semantics를 먼저 정의해야 한다.

### 후보 B. modifier consumption timing unification

지금까지의 중복 버그 대부분은 다음 셋의 소비 시점 차이에서 발생했다.
- on-screen modifier state
- hardware transient modifier
- native 후행 text surface

따라서 modifier consumption timing은 앞으로도 공통 정책으로 유지해야 한다.

## 결론

- `keydown` 하나로 모든 source를 통일하는 것은 권장하지 않는다.
- 대신 source-specific adapter는 유지하되,
- **normalized input event boundary 이후는 반드시 하나의 dispatcher / engine-editor pipeline을 사용**하도록 계속 정리하는 것이 가장 안전하다.
