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

1. 현재 `Done` 상태로 닫힌 spec 항목들이 회귀 없이 유지되도록 watch-only maintenance를 수행한다.
2. 모바일/touch interaction parity와 editor-layer 안정성을 smoke project 수준에서 계속 재사용 가능하게 유지한다.
3. `beforeinput` / `composition*` / `keydown` proof 자산을 새 브라우저/기기군으로 확장 가능하게 유지한다.
4. on-screen keyboard parity checklist를 maintenance checklist로 전환한다.

## Current Iteration Goals

현재 iteration은 구현 마무리 이후의 구조 정리와 실제 사용 기반 polish 단계다.

1. 실제 사용 중 발견되는 UX 문제를 작은 묶음으로 빠르게 닫는다.
2. service shell(nav / footer / legal / analytics / branding)을 한 번에 정리한다.
3. smoke / regression / handoff / boilerplate를 현재 구현 상태와 계속 동기화한다.
4. 입력 source를 바꾸지 않으면서도 `normalized input event -> single dispatcher -> engine/editor` 경계를 더 명확하게 만든다.
5. 입력 파이프라인 refactor는 `docs/handoff/input-pipeline-refactor.md` 기준으로 spec-first로 진행한다.

## Immediate Queue

현재 라운드의 즉시 작업은 live usage polish 기준으로 아래만 유지한다.

1. 키보드 배열, editor surface, copy/newline 같은 실제 사용 문제를 우선 수정한다.
2. nav / footer / logo / license / analytics scaffold를 service shell 묶음으로 유지한다.
3. 새 회귀가 생기면 unit/service/e2e 중 맞는 레이어에 즉시 고정한다.
4. input pipeline refactor는 spec-first로 진행하고, Phase 2는 native batch normalization을 `R25-2` 계열 atomic task id로 쪼개서 한 번에 1개만 다룬다.

## Atomic Queue

반복 보고를 줄이기 위해, 최근 iteration에서 다룬 task id를 아래처럼 기록한다.
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

- `S16-1` `Landed`
  - Chrome desktop/tablet/mobile/mobile-small smoke로 on-screen keyboard parity를 고정했다.
- `S17-1` `Landed`
  - mobile/mobile-small layout과 compact state feedback smoke를 고정했다.
- `S18-1` `Landed`
  - preferred mode browser smoke matrix로 hardware detection surface proof를 고정했다.
- `S19-1` `Landed`
  - compositionend + focus-regain + Enter browser smoke를 고정했다.
- `S19-1E` `Landed`
  - caret placement / replacement / newline edit browser smoke를 고정했다.
- `S24-1` `Done`
  - 남아 있던 spec Partial 항목을 smoke + regression 근거로 모두 닫았다.
- `R25-1` `Landed`
  - input pipeline refactor spec을 고정하고, adapter-specific input collection과 shared normalized boundary를 분리한다.
- `R25-1a` `Landed`
  - 입력 흐름과 adapter boundary를 `docs/handoff/input-flow-review.md`, `docs/handoff/input-pipeline-refactor.md`에 정리한다.
- `R25-1b` `Landed`
  - `NormalizedInputEvent` 타입과 single dispatcher / native batch adapter를 코드 경계로 드러내고 기존 동작을 유지한다.
- `R25-1c` `Landed`
  - dispatcher/batch adapter 경계에 대한 unit/service regression을 추가하고, 기존 parity smoke가 유지되는지 확인한다.
- `R25-2` `Landed`
  - native beforeinput / composition 문자열 경로를 batch adapter로 승격하고, shared normalized boundary를 명시한다.
- `R25-2a` `Landed`
  - native mixed literal + Hangul 입력이 normalized batch로 canonical order를 유지하는지 regression으로 고정한다.
- `R25-2b` `Landed`
  - native batch 경로에서 duplicate suppression, tone / filler / newline, selection replacement가 shared rule을 따르는지 regression으로 고정한다.

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
5. 구현 마무리 단계에서는 nav / footer / legal / analytics / branding을 흩어진 소작업으로 다루지 말고, service shell task로 묶어 처리한다.
