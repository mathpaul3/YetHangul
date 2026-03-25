# Documentation Structure

이 문서는 starter 프로젝트의 문서 구조와 각 문서의 역할을 정의한다.

## 1. Requirements

- 위치:
  - `docs/requirements/active.md`
  - `docs/requirements/archive/*.md`
- 역할:
  - 사용자/개발자/운영 관점에서 “무엇을 원했는가”를 기록

## 2. Tasks

- 위치:
  - `docs/tasks/active.md`
  - `docs/tasks/archive/*.md`
- 역할:
  - requirements를 실제 구현 가능한 작업 단위로 관리

## 3. Specs

- 위치:
  - `docs/specs/active/*.md`
  - `docs/specs/archive/*.md`
- 역할:
  - 제품이 현재 어떤 상태여야 하는지 관리

## 4. Architecture / Decisions

- 위치:
  - `docs/architecture/*.md`
  - `docs/decisions/*.md`
- 역할:
  - 왜 이렇게 설계했는지, 어떤 구조를 쓰는지 설명

## 5. Project

- 위치:
  - `docs/project/*.md`
- 역할:
  - 개발 방법론, 버저닝, Agent 운영 규칙

## 6. Handoff

- 위치:
  - `docs/handoff/current.md`
  - `docs/handoff/decisions.md`
- 역할:
  - 다음 agent가 바로 이어받아야 하는 현재 상태와 빠른 요약

## Rules

1. `handoff`에는 현재 상태 요약만 둔다.
2. 요구사항과 task는 반드시 분리한다.
3. spec은 제품 상태, architecture는 구조, project는 운영 원칙, handoff는 현재 요약만 담당한다.
4. 완료된 iteration의 requirement/task/spec은 각 archive로 이동한다.
