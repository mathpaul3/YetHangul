# Project Name

프로젝트 한 줄 소개.

## Agent Onboarding

이 프로젝트를 인수인계받은 Agent는 아래 순서로 문서를 읽고 작업을 시작한다.

1. `README.md`
2. `MEMORY.md`
3. `docs/handoff/current.md`
4. `docs/requirements/active.md`
5. `docs/tasks/active.md`
6. `docs/handoff/decisions.md`
7. `docs/specs/active/spec-v1-status.md`
6. 필요한 세부 문서

작업 원칙:

- 문맥을 먼저 이해한 뒤 작업한다.
- 모호한 요구사항은 즉시 질문한다.
- 코드 변경, 검증, handoff 문서 갱신을 함께 처리한다.
- spec을 update할 정도의 작업이 진행되었다면 commit을 고려한다.
- 멀티 Agent 구조라면 commit은 Coordinator가 review 후 수행하는 것을 기본값으로 둔다.
- 한 cycle이 마무리될 때마다 개발 과정 자체에 대한 review를 진행하고, reusable insight는 boilerplate에도 반영한다.

## Tech Stack

- Framework:
- Language:
- Infra:
- CI/CD:

## Project Structure

- `src/`
- `docs/`
- `tests/`

## Documents by Purpose

- `README.md`: 프로젝트 개요와 진입점
- `MEMORY.md`: 장기 방향성과 핵심 설계 의도
- `CHANGELOG.md`: 사용자 관점 변경 내역
- 릴리스 시 `package.json`, footer, `CHANGELOG.md`, git tag 버전을 서로 일치시킨다
- `docs/handoff/`: 현재 인수인계 요약
- `docs/handoff/current.md`: 지금 읽어야 할 문서와 현재 상태
- `docs/requirements/`: active/archive 요구사항
- `docs/tasks/`: active/archive 작업 항목
- `docs/specs/`: active/archive spec 상태
- `docs/architecture/`: 시스템 구조
- `docs/decisions/`: 설계 결정 기록
- `docs/process/`: 협업 규칙, 템플릿, system prompt
- `docs/process/DOCUMENT_STRUCTURE.md`: 문서 계층 구조와 source of truth
- `docs/process/AGENT_PROFILES.md`: 재사용 가능한 Agent 역할 정의
- `docs/process/AGENT_SYSTEM_PROMPT_TEMPLATES.md`: 범용 Agent system prompt 템플릿

## Process Notes

- 이 starter 디렉토리가 새 프로젝트용 canonical source of truth다.
- current summary와 requirement/task/spec는 분리해서 관리하는 것을 권장한다.
- 같은 작업이 두 라운드 이상 진전 없이 반복되면 더 작은 sub-task로 다시 쪼갠다.
- cycle 종료 시에는 기능 리뷰와 별개로 개발 과정/문서/boilerplate/subagent lifecycle까지 함께 회고한다.

## Local Development

```bash
# install

# run
```

## Build

```bash
# build
```

## Deployment

- 배포 방식:
- 주요 환경 변수:
- 운영 환경:

## Starter Automation

이 boilerplate는 상위 프로젝트의 스크립트로 자동 생성할 수 있다.

```bash
scripts/create-project-from-boilerplate.sh /path/to/new-project "Project Name"
```
