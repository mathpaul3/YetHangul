# YetHangul Extreme Interaction Cases

이 문서는 실제 서비스 사용 중 발생할 수 있는 극단적 상호작용 시나리오를 정리한 것이다.
단일 입력 1회가 아니라, 여러 단계의 입력/이동/선택/붙여넣기/조합이 겹칠 때 발생할 수 있는 케이스를 우선한다.

각 항목은 아래 기준으로 정리한다.

- `시나리오`: 사용자가 실제로 할 수 있는 입력 흐름
- `위험`: 현재 구조에서 어떤 문제가 날 수 있는지
- `대응`: 구현/정책 측면에서 어떤 방어가 필요한지
- `테스트`: 회귀 테스트를 어떻게 만들면 좋은지

## 1. 조합 버퍼 + caret 이동 충돌

- 시나리오:
  1. 중간 위치를 클릭해 caret을 둔다.
  2. 새 자모를 조합 중인 상태에서 `ArrowLeft`, `ArrowRight`, `Home`, `End`를 누른다.
  3. 다시 입력하거나 `Backspace`, `Delete`를 누른다.
- 위험:
  - 조합 중 음절이 문서에 flush되는 위치와 caret 이동 위치가 어긋날 수 있다.
  - 기대와 다른 위치에 문자가 삽입되거나 삭제될 수 있다.
- 대응:
  - 조합 버퍼 flush는 helper 한 군데에서만 수행한다.
  - flush 결과로 나온 새 문서 배열과 새 caret index를 같은 transaction처럼 반영한다.
  - caret 계산은 렌더된 길이 기준 ad-hoc 계산보다 snapshot ref + helper 기준으로 통일한다.
- 테스트:
  - “중간 클릭 -> 조합 -> 화살표 이동 -> 입력/삭제” 시퀀스를 hook/service 레벨 테스트로 고정한다.

## 2. selection 직후 입력 치환

- 시나리오:
  1. 여러 음절을 drag로 선택한다.
  2. 바로 자모를 입력하거나 paste한다.
  3. 선택을 지운 직후 backspace/delete/arrow 이동을 연속으로 수행한다.
- 위험:
  - 선택 범위가 안 지워진 채 새 조합이 append될 수 있다.
  - selection이 비워졌는데 브라우저 native selection이 남아 복사/붙여넣기 동작이 엇갈릴 수 있다.
  - selection replacement 직후 caret가 예상 밖 위치로 남아 다음 삭제가 엉뚱한 unit에 작동할 수 있다.
- 대응:
  - 입력 시작 전 selection이 있으면 항상 먼저 selection delete를 수행한다.
  - native selection은 최대한 제거하고, 자체 selection만 source of truth로 유지한다.
  - selection replacement 이후에는 caret index를 replacement 끝점에 다시 고정한다.
- 테스트:
  - “선택 -> 입력”, “선택 -> 붙여넣기”, “선택 -> 줄바꿈 입력”, “선택 -> delete/backspace 연속” 회귀 테스트

## 3. 클릭과 drag의 경계

- 시나리오:
  1. 사용자가 unit 위를 클릭한다.
  2. 클릭인지 drag인지 애매한 아주 짧은 이동이 들어온다.
  3. 클릭 후 즉시 입력하면 caret만 이동해야 하는데 selection이 남아 있으면 안 된다.
- 위험:
  - 클릭인데 selection이 생기거나, drag였는데 caret만 이동할 수 있다.
  - click-only와 drag transition의 판정이 흔들리면 삭제/복사 범위가 예상과 달라질 수 있다.
- 대응:
  - pointer down에서는 selection을 만들지 않고 anchor만 기록한다.
  - 실제 pointer move/enter가 있었을 때만 selection을 생성한다.
  - 클릭 종료 시 movement가 없으면 caret 이동으로 확정한다.
- 테스트:
  - “click only”, “drag one unit”, “drag backwards”, “click 후 즉시 입력”을 분리 테스트

## 4. 조합 버퍼 + selection 확장 충돌

- 시나리오:
  1. 음절 조합 중이다.
  2. `Shift + ArrowLeft/Right`로 선택을 확장한다.
  3. 다시 입력하거나 `Backspace`/`Delete`를 누른다.
- 위험:
  - 조합 버퍼가 문서에 들어간 뒤 selection anchor/head가 꼬일 수 있다.
  - 조합 중 음절이 selection에 포함되는지 여부가 불명확해질 수 있다.
- 대응:
  - selection 확장 전에 조합 버퍼를 먼저 flush하고, 그 뒤에 확장한다.
  - selection은 항상 committed document units 기준으로만 계산한다.
- 테스트:
  - “조합 중 -> shift+arrow -> 입력/삭제” 테스트

## 5. 줄바꿈 경계에서의 이동/삭제

- 시나리오:
  1. 여러 줄 텍스트가 있다.
  2. 줄 끝/줄 시작에서 `ArrowLeft/Right`, `Backspace`, `Delete`, `Home`, `End`를 누른다.
  3. 줄 시작에 caret을 둔 뒤 backspace를 누르고 바로 delete를 눌러 같은 경계에서 연속 조작한다.
- 위험:
  - 줄바꿈이 일반 unit처럼 처리되지 않거나, 반대로 화면상 줄바꿈과 내부 unit 경계가 다르게 보일 수 있다.
  - `Backspace`가 줄 전체를 지우거나, `Delete`가 다음 줄 첫 글자를 건너뛸 수 있다.
  - 줄 시작/끝에서 연속으로 누를 때 caret가 줄 밖으로 튀는 문제가 생길 수 있다.
- 대응:
  - newline을 독립 unit으로 유지하되 렌더링은 실제 줄바꿈처럼 보이게 한다.
  - `Home/End`는 현재 줄 기준으로 이동하도록 맞춘다.
  - `Backspace/Delete`는 newline unit을 다른 unit과 같은 경로로만 지운다.
- 테스트:
  - “줄 끝 Backspace”, “줄 시작 Delete”, “newline 양옆 caret 이동”, “줄 경계 backspace -> delete 연속” 테스트

## 6. 방점 + 편집기 상호작용

- 시나리오:
  1. 방점이 붙은 음절 뒤에서 중간 삽입을 한다.
  2. 방점이 붙은 음절 일부만 선택 삭제한다.
  3. 방점이 붙을 수 없는 unit 옆에서 `Ctrl + .` / `Ctrl + ;`를 누른다.
- 위험:
  - 방점이 음절에서 분리되어 고아 문자처럼 남을 수 있다.
  - 줄바꿈/공백/영문 등에 방점이 붙으려 할 수 있다.
- 대응:
  - 방점은 whitelist 기반으로, 중성이 있는 음절 unit에만 붙인다.
  - 방점은 해당 음절 unit의 일부로 같이 움직이도록 unit segmentation을 유지한다.
- 테스트:
  - “방점 음절 선택 삭제”, “영문 뒤 방점 무시”, “공백 뒤 방점 무시” 테스트

## 7. filler 자동 삽입 + undo

- 시나리오:
  1. `Shift + ㅁ`이나 `Ctrl + Space` 같은 문맥형 매크로를 사용한다.
  2. 이어서 추가 입력을 하고, `Backspace`를 여러 번 누른다.
- 위험:
  - 자동 삽입된 filler만 남거나, 반대로 매크로 전체가 아닌 일부만 롤백될 수 있다.
- 대응:
  - 매크로로 삽입된 filler와 결과 자모를 하나의 input step으로 기록한다.
  - backspace 한 번으로 그 input step 전체가 롤백되어야 한다.
- 테스트:
  - “macro -> 추가 입력 -> backspace x N” 회귀 테스트

## 8. 복합 종성 재분석 + 중간 삽입

- 시나리오:
  1. 복합 종성이 있는 음절을 만든다.
  2. 뒤에 모음을 입력해 reparse한다.
  3. 다시 중간으로 돌아가 다른 자모를 삽입한다.
- 위험:
  - reparse 이전 상태와 이후 상태가 혼재될 수 있다.
  - 복합 종성 분해 규칙이 깨지거나 잘못된 위치에 새 음절이 생길 수 있다.
- 대응:
  - reparse는 input-step undo 가능 상태로만 수행한다.
  - 편집기 중간 삽입 시에는 active composition과 committed units를 명확히 분리해야 한다.
- 테스트:
  - “겹받침 -> 모음 reparse -> 중간 삽입 -> backspace” 테스트

## 9. 영문/숫자/공백과 한글 조합 혼합

- 시나리오:
  1. 영문, 숫자, 공백, 한글 조합을 섞어서 긴 문장을 입력한다.
  2. 그 사이사이 중간 삽입/선택 삭제를 한다.
- 위험:
  - editor unit segmentation이 한글 음절과 literal text 경계를 잘못 합칠 수 있다.
  - `Ctrl + .` 같은 유틸리티가 영문 구간에도 작동하려 할 수 있다.
- 대응:
  - 한글 조합 unit과 literal unit을 분리 유지한다.
  - 유틸리티 입력은 문맥 whitelist 기반으로 허용 범위를 제한한다.
- 테스트:
  - “영문 + 한글 + 숫자 + 공백 + 줄바꿈” 혼합 문장 회귀 세트

## 10. 시스템 IME + 자체 엔진 중복 입력

- 시나리오:
  1. macOS/iOS/Android 시스템 한글 IME가 `composition*` 이벤트를 발생시킨다.
  2. 같은 입력이 `beforeinput`과 `compositionend`로 중복 들어온다.
  3. 일부 브라우저는 `compositionActive`가 아직 참인 상태에서도 `beforeinput(insertFromComposition)`를 먼저 보낼 수 있다.
  4. 한 번 소비된 텍스트와 같은 새 composition session이 이어서 들어올 수 있다.
- 위험:
  - 같은 음절이 두 번 들어간다.
  - dedupe가 과도하면 정상 입력도 누락될 수 있다.
  - `compositionActive`와 `isComposing`의 타이밍이 엇갈리면 정상 입력을 오탐으로 막을 수 있다.
- 대응:
  - `beforeinput`/`compositionend` dedupe는 “최근 commit 텍스트” 기준으로만 최소한으로 처리한다.
  - 브라우저별 로그를 남겨 실제 차이를 확인할 수 있는 debug mode도 고려할 만하다.
  - `compositionActive`가 참이면 `beforeinput`은 무조건 무시한다.
  - duplicate marker는 한 번 소비되면 즉시 비워서 다음 composition session을 막지 않게 한다.
- 테스트:
  - 같은 text가 `beforeinput`과 `compositionend`로 연속 들어올 때 1회만 commit되는지 테스트
  - `compositionActive`가 남아 있을 때의 `beforeinput(insertFromComposition)` 무시 테스트
  - duplicate marker가 cleared 된 뒤 같은 text의 새 composition session이 다시 허용되는지 테스트

## 11. 하드웨어 modifier stuck state

- 시나리오:
  1. `Ctrl` 또는 `Shift`를 누른 상태에서 창 focus를 잃는다.
  2. keyup이 오지 않은 채 다시 돌아온다.
- 위험:
  - UI에는 modifier가 계속 눌린 것으로 남고, 이후 입력이 모두 잘못 해석될 수 있다.
- 대응:
  - `blur`, `visibilitychange`, `pointercancel` 시 hardware modifier state를 초기화하는 정책이 필요하다.
- 테스트:
  - 훅 레벨에서 “modifier down -> blur -> 다음 입력” 시나리오 테스트

## 12. 긴 문서에서의 성능 저하

- 시나리오:
  1. 수백~수천 음절을 입력한다.
  2. 중간 삽입, 드래그 selection, copy를 반복한다.
- 위험:
  - 매 입력마다 전체 unit 배열을 재구성하면 느려질 수 있다.
  - drag selection 중 re-render가 잦아질 수 있다.
- 대응:
  - 지금은 MVP 단계라 단순 배열로도 충분하지만, 이후 길이가 커지면 rope/piece table 같은 구조도 검토 가능하다.
  - 우선은 React render profiling과 memoization 포인트를 잡는 게 현실적이다.
- 테스트:
  - 긴 문자열 benchmark 또는 synthetic performance test

## 13. 모바일 터치 selection

- 시나리오:
  1. 모바일에서 결과 영역을 터치한다.
  2. 살짝 스크롤하려 했는데 drag selection으로 해석된다.
- 위험:
  - 스크롤과 selection이 충돌한다.
  - 작은 화면에서 caret placement가 어렵다.
- 대응:
  - 모바일에서는 drag selection보다 “탭 caret 이동 + 별도 선택 모드”가 더 적합할 수 있다.
  - 현재는 desktop/tablet interaction을 먼저 기준으로 잡고, 모바일은 별도 정책이 필요하다.
- 테스트:
  - viewport 기준으로 interaction policy를 분기하는 경우 E2E 수준 테스트 필요

## 14. 붙여넣기 문자열에 줄바꿈/조합용 자모/완성형이 섞인 경우

- 시나리오:
  1. 외부 문서에서 여러 줄 텍스트를 복사해 붙여넣는다.
  2. 안에는 완성형 현대 한글, 옛한글 조합용 자모, 영문, 숫자, 공백이 섞여 있다.
- 위험:
  - 줄바꿈이 사라지거나, 특정 구간만 normalize되고 나머지는 깨질 수 있다.
- 대응:
  - paste pipeline은 문자 단위 normalize + literal fallback을 유지한다.
  - 줄바꿈은 절대 보존해야 한다.
- 테스트:
  - “혼합 문자열 multi-line paste” 회귀 테스트

## 15. 선택 범위 복사와 전체 복사의 불일치

- 시나리오:
  1. selection이 있는 상태에서 `Cmd/Ctrl + C`를 누른다.
  2. 이어서 `Copy All`, `Copy Selection` 버튼도 눌러본다.
  3. selection을 복사한 뒤 blur/focus를 한 번 거치고 같은 범위를 다시 복사한다.
- 위험:
  - 세 경로의 결과가 서로 다를 수 있다.
  - native selection과 자체 selection이 분리되면 복사 범위가 엇갈릴 수 있다.
- 대응:
  - 모든 복사 경로는 결국 같은 plain text serialization을 사용해야 한다.
  - selection 복사와 전체 복사가 같은 newline serialization 규칙을 공유해야 한다.
- 테스트:
  - selection copy / button copy 결과 일치 테스트
  - blur/focus 이후 같은 selection을 다시 복사했을 때 결과가 같은지 테스트

## 16. 입력 도중 focus 이탈

- 시나리오:
  1. 조합 중 혹은 selection 상태에서 다른 버튼이나 브라우저 UI로 focus가 나간다.
  2. 다시 돌아와 입력을 이어간다.
  3. focus 복귀 직후 `beforeinput(deleteContentBackward/Forward)` 또는 selection replacement가 들어온다.
- 위험:
  - active composition과 selection이 반쯤 남아 잘못된 위치에 이어 입력될 수 있다.
  - blur 이후 stale native selection이 남아 있으면 다음 delete/replace가 예상 밖 범위에 작동할 수 있다.
- 대응:
  - blur 시 “selection은 유지, hardware modifier는 해제, composition은 commit 또는 reset” 중 어떤 정책이 맞는지 정해야 한다.
  - 현재는 hardware modifier reset을 먼저 우선 고려하는 것이 안전하다.
  - focus 복귀 뒤의 deletion은 editor-layer 선택/삭제 경로로만 처리한다.
- 테스트:
  - blur/focus recovery 테스트
  - blur 직후 beforeinput delete가 들어와도 editor-layer contract가 유지되는지 테스트

## 17. 같은 key sequence의 결정성 붕괴

- 시나리오:
  1. 같은 key sequence를 caret 위치/selection 여부/이전 composition 상태만 다르게 두고 반복한다.
- 위험:
  - 입력 sequence는 같아도 결과가 달라질 수 있다.
- 대응:
  - 엔진-level에서는 같은 input sequence가 항상 같은 출력으로 수렴해야 한다.
  - editor-level에서는 “삽입 위치”만 다르고 조합 결과 자체는 같아야 한다.
- 테스트:
  - 동일 sequence를 여러 문맥에서 넣어도 unit local output이 같은지 확인

## 18. native selection / clipboard serialization 경계

- 시나리오:
  1. 브라우저 native selection과 자체 selection이 모두 존재하는 상태에서 복사를 수행한다.
  2. CRLF가 포함된 외부 텍스트를 붙여넣은 뒤 selection replacement와 delete/backspace를 연속으로 수행한다.
- 위험:
  - 복사/붙여넣기 serialization 규칙이 selection replacement와 엇갈릴 수 있다.
  - beforeinput delete 경로가 editor-layer와 중복 반영되면 같은 unit이 두 번 삭제될 수 있다.
- 대응:
  - clipboard serialization은 newline 정규화 규칙을 단일 source of truth로 유지한다.
  - delete/backspace는 editor-layer helper가 최종 권한을 갖도록 유지한다.
- 테스트:
  - CRLF paste -> selection replacement -> delete/backspace 연속 회귀 테스트
  - deleteContentBackward / deleteContentForward beforeinput이 interop layer에서 no-op인지 확인하는 테스트

## 우선순위 제안

가장 먼저 닫아야 할 케이스:

1. 조합 버퍼 + caret 이동 충돌
2. selection 직후 입력 치환
3. 클릭과 drag의 경계
4. 줄바꿈 경계에서의 이동/삭제
5. 시스템 IME + 자체 엔진 중복 입력
6. hardware modifier stuck state

그다음 단계에서 볼 케이스:

1. 복합 종성 재분석 + 중간 삽입
2. 긴 문서 성능
3. 모바일 터치 selection
4. blur/focus recovery
