# YetHangul Active Tasks

이 문서는 **현재 진행 중인 실제 작업 항목**만 관리한다.
완료된 task는 `docs/tasks/archive/`로 이동한다.

## Status

- 현재 iteration: `v0.2.3`
- 작업 브랜치: `feat/v0.2.3` (worktree: `.claude/worktrees/v0.2.3`)
- 진행 순서: `TASK-V023-001` → `TASK-V023-002` → `TASK-V023-003` (같은 훅/서비스 파일을 공유하므로 순차 진행)

## Active Tasks

- `TASK-V023-001`
  - Related Requirement: `REQ-V023-003`
  - Scope:
    - 엔진 modifier 해석: `L/R Ctrl + ㅁ → ᅀ`를 추가하고 `Shift + ㅊ → ᅀ`를 제거한다.
    - `Ctrl + Shift + ㅁ`은 Ctrl 우선 원칙(`ㅇ`, `ㅈ`, `ㅊ`과 같음)에 따라 `ᅀ`, `Ctrl + Shift + ㅊ`은 `L/R Ctrl + ㅊ` 결과를 낸다.
    - on-screen 키캡 미리보기 맵(Shift / L Ctrl / R Ctrl / Ctrl+Shift)과 도움말 규칙표를 갱신하고, 반치음 예외 표기를 없앤다.
    - direct dispatch 중복 억제의 기본 키 매핑에서 `ᅀ`의 기본 키를 `ㅊ`에서 `ㅁ`으로 바꾼다.
    - 관련 unit/e2e 테스트와 spec/decisions 문서를 갱신한다.
  - Done Criteria:
    - `L/R Ctrl + ㅁ`(on-screen/하드웨어)이 `ᅀ`를 내고, `Shift + ㅊ`는 `ᅀ`를 내지 않는 테스트가 있다.
    - `ㅁ`/`ㅊ` 키캡의 모든 modifier 조합 미리보기가 엔진 실제 출력과 같다는 테스트가 있다.
    - `yarn test`, `yarn lint`, `yarn build`, `yarn test:e2e`가 통과한다.
  - Status: `todo`

- `TASK-V023-002`
  - Related Requirement: `REQ-V023-002`
  - Scope:
    - editor surface tap/pointer-up으로 OS native 키보드를 부르는 경로를 제거한다.
    - 휴대폰(`onscreen` 모드)에서는 숨겨진 텍스트 입력 요소에 포커스를 보내지 않는다.
    - 하드웨어 키보드 입력용으로 남기는 숨겨진 텍스트 입력 요소는 `inputMode="none"`으로 OS 가상 키보드를 띄우지 않게 한다.
    - on-screen 키보드는 모든 모드에서 기본 펼침으로 시작하고, compact row 토글은 유지한다.
    - 관련 unit/e2e 테스트와 spec/decisions/input-pipeline 문서를 갱신한다.
  - Done Criteria:
    - mobile/mobile-small e2e에서 editor surface나 키를 눌러도 편집 가능한 요소에 포커스가 가지 않는다.
    - tablet e2e에서 포커스되는 텍스트 입력 요소가 `inputmode="none"`이다.
    - 모든 e2e 프로젝트에서 키보드가 기본 펼침이다.
    - desktop 하드웨어 입력 e2e/unit이 그대로 통과한다.
    - `yarn test`, `yarn lint`, `yarn build`, `yarn test:e2e`가 통과한다.
  - Status: `todo`

- `TASK-V023-003`
  - Related Requirement: `REQ-V023-001`
  - Scope:
    - 물리 키(`event.code`)를 두벌식 자모로 바꾸는 shift-aware resolver를 둔다.
    - Windows 한글 IME의 `Process` keydown은 바로 치환하지 않고 보류한다. 이어지는 composition 데이터가 한글일 때만 보류한 물리 키를 엔진 입력으로 확정한다.
    - 한글이 아니면(일본어/중국어 등) 보류한 키를 버리고 기존 native literal 경로에 맡긴다.
    - 한글 IME로 확정된 동안에는 IME가 만든 한글 텍스트(`compositionend`, `beforeinput`)를 중복 반영하지 않는다.
    - `Ctrl` 조합은 `event.key`가 자모가 아니어도 물리 키 기준으로 Ctrl 규칙이 있는 키(`ㅁ ㅅ ㅇ ㅈ ㅊ ㅎ ㅏ`)를 해석한다. 편집기 selection이 있을 때 `Ctrl + C`는 복사에 양보한다.
    - 데스크톱/태블릿에서 포커스가 root에 떨어져도 IME가 동작하는 텍스트 입력 요소로 포커스를 되돌린다.
    - service-level 테스트, 합성 이벤트 e2e smoke, input-pipeline/decisions/spec 문서를 갱신한다.
  - Done Criteria:
    - Windows 한글 IME 이벤트 시퀀스(`Process` + 한글 composition)로 `ᄢᅮᆯ` 등 기존 대표 예시가 재현된다.
    - Shift 쌍자모와 Backspace undo가 같은 시퀀스로 재현된다.
    - 일본어/중국어 IME 이벤트 시퀀스(`Process` + 비한글 composition)는 literal 그대로 입력된다.
    - 영문 latin `Ctrl + a/d/...` keydown이 Ctrl 규칙 결과를 내고, selection이 있는 `Ctrl + C`는 입력을 만들지 않는다.
    - `yarn test`, `yarn lint`, `yarn build`, `yarn test:e2e`가 통과한다.
  - Status: `todo`

## Entry Template

- `TASK-<version>-<id>`
  - Related Requirement:
  - Scope:
  - Done Criteria:
  - Status: `todo` | `in_progress` | `landed`

## Rules

1. task는 요구사항을 구현 가능한 작업 단위로 쪼갠 것이다.
2. source of truth는 task이며, 운영 메모나 회고를 같이 적지 않는다.
3. task가 `landed`가 되면 다음 iteration 종료 시 archive로 이동한다.
