# YetHangul Active Requirements

이 문서는 **현재 살아 있는 요구사항**만 관리한다.
이미 릴리스에 반영된 요구사항은 `docs/requirements/archive/`로 옮긴다.

## Status

- 현재 active requirement는 비어 있다.
- 새 피드백이나 운영 이슈가 들어오면 아래 형식으로 추가한다.

## Entry Template

- `REQ-<version>-<id>`
  - Source:
  - Type: `user` | `developer` | `ops`
  - Summary:
  - Acceptance:
  - Related Tasks:
  - Status: `active` | `deferred`

## Rules

1. 요구사항은 “무엇을 원했는가”만 적고, 구현 단계나 파일 경로는 쓰지 않는다.
2. 구현 항목은 `docs/tasks/active.md`에서 관리한다.
3. 한 iteration이 끝나면, 이번 릴리스에 반영된 요구사항은 해당 버전 archive로 이동한다.
