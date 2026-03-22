# Project Name

프로젝트 한 줄 소개.

## Agent Onboarding

이 프로젝트를 인수인계받은 Agent는 아래 순서로 문서를 읽고 작업을 시작한다.

1. `README.md`
2. `MEMORY.md`
3. `docs/handoff/current-goals.md`
4. `docs/handoff/decisions.md`
5. `docs/handoff/spec-status-v1.md`
6. 필요한 세부 문서

작업 원칙:

- 문맥을 먼저 이해한 뒤 작업한다.
- 모호한 요구사항은 즉시 질문한다.
- 코드 변경, 검증, handoff 문서 갱신을 함께 처리한다.
- spec을 update할 정도의 작업이 진행되었다면 commit을 고려한다.

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
- `docs/handoff/`: 단기 인수인계 문서
- `docs/handoff/current-goals.md`: 장기/단기 목표와 coordinator의 즉시 우선순위
- `docs/architecture/`: 시스템 구조
- `docs/decisions/`: 설계 결정 기록
- `docs/process/`: 협업 규칙, 템플릿, system prompt
- `docs/process/AGENT_PROFILES.md`: 재사용 가능한 Agent 역할 정의
- `docs/process/AGENT_SYSTEM_PROMPT_TEMPLATES.md`: 범용 Agent system prompt 템플릿

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
