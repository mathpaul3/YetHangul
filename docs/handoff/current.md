# YetHangul Current Handoff

이 문서는 **지금 이 순간 다음 사람이 가장 먼저 알아야 할 것**만 담는 현재 handoff 요약이다.

## Current State

- 현재 릴리스 버전: `0.2.2`
- spec v1 상태: 전체 `Done`
- 현재 iteration: `v0.2.3` patch
  - active requirement: `REQ-V023-001` ~ `REQ-V023-003` (`docs/requirements/active.md`)
  - active task: `TASK-V023-001` ~ `TASK-V023-003` (`docs/tasks/active.md`)
  - 작업 브랜치: `feat/v0.2.3` (구현 완료, code review `VERDICT: OK`, main merge 대기)
  - 태그 전 실기기 수동 확인이 필요하다 (`docs/tasks/active.md`의 Release Gate 참고).
- 참고: 과거 로컬에만 있던 `v0.2.3`(Windows `Process` 키 치환 시도)과 `v0.2.4`(그 롤백) 태그는 배포되지 않았고 제거했다. `v0.2.3`은 이번 iteration으로 다시 정의한다.
- 현재 단계: maintenance / patch release 운영 단계

## Read Order

1. `README.md`
2. `MEMORY.md`
3. `docs/specs/active/spec-v1-status.md`
4. `docs/requirements/active.md`
5. `docs/tasks/active.md`
6. 필요한 경우:
   - `docs/architecture/input-pipeline.md`
   - `docs/architecture/input-pipeline-refactor.md`
   - `docs/decisions/0001-engine-architecture.md`
   - `docs/handoff/decisions.md`

## What To Do Next

- 새 요구사항이 들어오면 `docs/requirements/active.md`에 먼저 기록
- 그 요구사항을 구현 task로 쪼개 `docs/tasks/active.md`에 추가
- 작업이 충분히 쌓이면 새 iteration/version으로 archive를 만든다
