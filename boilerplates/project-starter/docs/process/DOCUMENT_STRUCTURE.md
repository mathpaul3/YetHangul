# Documentation Structure

이 starter는 문서를 아래 5계층으로 나누는 것을 권장한다.

## 1. Requirements

- `docs/requirements/active.md`
- `docs/requirements/archive/*.md`

“무엇을 원했는가”를 관리한다.

## 2. Tasks

- `docs/tasks/active.md`
- `docs/tasks/archive/*.md`

requirements를 실제 구현 가능한 작업 단위로 관리한다.

## 3. Specs

- `docs/specs/active/*.md`
- `docs/specs/archive/*.md`

제품이 현재 어떤 상태여야 하는지 관리한다.

## 4. Architecture / Decisions

- `docs/architecture/*.md`
- `docs/decisions/*.md`

왜 이렇게 설계했는지 설명한다.

## 5. Handoff

- `docs/handoff/current.md`
- `docs/handoff/decisions.md`

다음 agent가 지금 당장 알아야 하는 현재 상태만 요약한다.

## Rules

1. `handoff`에는 active summary만 둔다.
2. 완료된 iteration의 requirement/task는 archive로 옮긴다.
3. 요구사항과 task를 섞지 않는다.
4. spec과 architecture를 handoff 안에 계속 욱여넣지 않는다.
