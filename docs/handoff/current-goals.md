# YetHangul Current Goals

이 문서는 현재 YetHangul 프로젝트의 장기 목표와 단기 목표를 짧고 실행 가능한 형태로 정리한 문서다.
Coordinator와 subagent는 새로운 작업을 시작하기 전에 이 문서의 `Current Iteration Goals`와 `Immediate Queue`를 먼저 확인한다.

## Long-Term Goals

1. 어떤 OS/브라우저에서도 옛한글을 입력할 수 있는 웹 입력기를 완성한다.
2. 기본 한글 자모(`ㄱ-ㅎ`, `ㅏ-ㅣ`)와 modifier 규칙만으로 옛한글 입력 경험을 최대한 일관되게 만든다.
3. 하드웨어 키보드, on-screen 키보드, 시스템 IME 입력이 가능한 한 같은 편집 결과로 수렴하도록 만든다.
4. 입력기 위에 실사용 가능한 편집기 레이어를 얹어 caret, selection, copy/paste, multiline editing까지 안정적으로 지원한다.
5. handoff/spec/tests가 항상 현재 코드 상태를 설명하도록 유지해서 agent 교체 비용을 낮춘다.

## Medium-Term Goals

1. `docs/handoff/spec-status-v1.md`의 남은 `Partial` 항목을 순차적으로 `Done`으로 전환한다.
2. 모바일/touch interaction parity를 높여 hardware-first 환경과의 체감 차이를 줄인다.
3. `beforeinput` / `composition*` / `keydown` 경로의 브라우저 표면 차이를 더 작은 proof gap으로 압축한다.
4. on-screen keyboard parity checklist를 기반으로 남은 입력 표면 차이를 줄인다.

## Current Iteration Goals

현재 iteration은 아래 4개에 집중한다.

1. 모바일/touch interaction parity
2. `beforeinput` / `composition*` cross-browser proof
3. 장문 편집에서의 caret/selection 안정성
4. hardware keyboard detection heuristics의 proof 정리

## Immediate Queue

현재 라운드에서 가장 우선순위가 높은 작업은 아래와 같다.

1. 모바일/touch selection과 pointer transition cleanup을 더 잠근다.
2. on-screen/hardware parity를 regression test로 더 고정한다.
3. `beforeinput` / `composition*`의 focus-regain 및 delete/enter 흐름을 더 검증한다.
4. hardware keyboard detection의 현재 heuristic을 문서와 테스트 기준으로 더 명확히 설명한다.

## Atomic Queue

반복 보고를 줄이기 위해, 남은 작업은 아래처럼 더 작은 task id 단위로 관리한다.
subagent는 새 라운드를 시작할 때 아래에서 **정확히 1개 task id만** 잡아야 한다.
이미 `Done` 또는 `Landed` 상태인 task는 다시 다루지 않는다.

- `T17-1` `Done`
  - touch-cancel 시 stale selection을 남기지 않도록 cleanup한다.
- `T17-2` `Done`
  - touch drag selection이 `pointerenter`에만 의존하지 않도록 fallback을 추가한다.
- `T17-3` `Landed`
  - 모바일 small viewport에서 현재 modifier/selection 상태가 충분히 읽히도록 compact surface summary rail를 추가하고 smoke proof를 만든다.
- `T18-1` `Done`
  - `ontouchstart`, `maxTouchPoints`, `matchMedia('(pointer: coarse)')` 신호를 heuristic regression으로 고정한다.
- `T18-2` `Landed`
  - desktop/tablet connected vs disconnected keyboard matrix를 문서/테스트 수준으로 정리한다.
  - `T18-2a` `Landed`
    - desktop without touch, desktop with touch signals, tablet ambiguity에 대한 기본 matrix proof를 regression test로 고정한다.
- `T18-2b` `Landed`
    - 연결/미연결 matrix 위에 browser/platform probe contract를 더 좁게 정의하고, 남은 heuristic gap을 문서/테스트 수준으로 한 번 더 압축한다.
    - mobile UA > tablet UA > touch-capable desktop > hardware fallback 순서의 probe contract를 regression test로 고정한다.
- `T19-1` `Done`
  - focus-regain 뒤 `deleteContentBackward`, `insertParagraph`, `insertLineBreak` 흐름을 regression으로 고정한다.
- `T19-2` `Done`
  - focus-regain 뒤 `insertFromComposition` recovery를 regression으로 고정한다.
- `T19-3` `Landed`
  - `insertReplacementText`, `deleteWordBackward`, `deleteSoftLineBackward`까지 포함해 focus-regain 이후 beforeinput surface proof를 넓힌다.
- `T19-4` `Landed`
  - composition-end 계열과 beforeinput 계열을 더 넓은 cross-browser surface proof로 묶는다.
  - `T19-4a` `Landed`
    - recovered-focus family matrix, line-break recognition, replacement-text, and delete-surface 계열을 하나의 service-level proof로 묶는다.
  - `T19-4b` `Landed`
    - service-level proof를 넘어 browser surface breadth를 더 설명하는 최소 matrix 또는 smoke proof를 추가한다.
    - browser family labels(chromium-like / webkit-like / gecko-like)로 composition-end and beforeinput family breadth를 regression test로 고정한다.
- `T19-1E` `Done`
  - long-document copy/replace/delete/shrink regression을 고정한다.
- `T19-2E` `Landed`
  - 모바일 touch selection의 마지막 edge case를 줄이기 위해 editor surface touch-action contract를 추가했다.

### Queue Rules

1. 같은 task id를 연속 두 라운드에서 다시 보고하지 않는다.
2. `Open -> In Progress -> Landed -> Done` 중 하나로 상태를 갱신한다.
3. `Landed`는 main 반영 완료를 뜻하고, `Done`은 남은 proof gap이 사실상 없을 때만 사용한다.
4. 새 task를 추가할 때는 왜 기존 task로 표현할 수 없는지도 같이 적는다.
5. 특정 task가 두 라운드 이상 반복되면, 더 작은 sub-task id로 분해한 뒤 그중 정확히 1개만 잡는다.

## Deprioritized For Now

아래 항목은 지금 당장 파지 않는다.

1. engine 로직의 대규모 확장
2. 새로운 UI 실험이나 시각 polish 위주의 변경
3. 새로운 기능 축 추가

이 항목들은 blocker가 되거나 현재 `Partial` 항목을 직접 줄일 수 있을 때만 다시 끌어올린다.

## Coordination Rules

1. 새 작업은 가능하면 `Current Iteration Goals` 중 하나를 직접 줄이는 경우에만 시작한다.
2. `Immediate Queue`에 없는 작업은 blocker, ambiguity, 또는 major milestone이 아닌 이상 뒤로 미룬다.
3. 문서/테스트가 없는 구현은 우선순위를 낮춘다.
4. 장황한 탐색보다, 현재 `Partial` 항목에 대응되는 proof를 1개라도 더 닫는 작업을 우선한다.
