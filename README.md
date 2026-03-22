# YetHangul

웹 기반 옛한글 입력기 프로젝트입니다. 목표는 어떤 OS와 브라우저에서도 직관적인 규칙으로 옛한글을 입력할 수 있게 하는 것입니다.

## Agent Onboarding

이 프로젝트를 인수인계받은 Agent는 아래 순서로 문서를 읽고 작업을 시작하는 것을 권장합니다.

1. [README.md](README.md)
- 프로젝트 개요
- 폴더 구조
- 어떤 문서를 어떤 목적으로 읽어야 하는지 확인

2. [MEMORY.md](MEMORY.md)
- 장기 방향성
- 현재도 유효한 핵심 결정
- 프로젝트의 설계 의도

3. [docs/handoff/current-goals.md](docs/handoff/current-goals.md)
- 장기 목표
- 이번 iteration의 단기 목표
- coordinator의 즉시 우선순위

4. [docs/handoff/decisions.md](docs/handoff/decisions.md)
- 다음 Agent가 바로 이어받아야 하는 핵심 정책
- 최근 결정 사항

5. [docs/handoff/spec-status-v1.md](docs/handoff/spec-status-v1.md)
- spec 기준 구현 완료/부분완료 상태
- 현재 우선순위

6. 필요 시 세부 문서
- [docs/architecture/engine.md](docs/architecture/engine.md): 엔진 구조
- [docs/decisions/0001-engine-architecture.md](docs/decisions/0001-engine-architecture.md): 주요 설계 결정
- [docs/input-rules/keymap.md](docs/input-rules/keymap.md): 입력 규칙
- [docs/process/agent-project-playbook.md](docs/process/agent-project-playbook.md): 재사용 가능한 협업/문서화/운영 원칙
- [boilerplates/project-starter/](boilerplates/project-starter/README.md): 새 프로젝트 시작용 boilerplate

작업 원칙:

- 위 문서를 참고해 현재 프로젝트 문맥을 먼저 이해한 뒤 작업한다.
- 설계나 요구사항에 모호점이 있으면 즉시 질문한다.
- 구현 시에는 코드 변경, 검증, handoff 문서 갱신을 한 세트로 처리한다.
- spec을 update할 정도의 작업이 진행되었다면 commit을 고려한다.

## Tech Stack

- Vite
- React
- TypeScript
- Docker
- GitHub Actions

## Project Structure

- `src/engine`: FSM, sparse transition table, undo log 기반 입력 엔진
- `src/features/ime`: 입력기 UI, 키보드 모드, modifier 버튼
- `docs`: 제품/설계/결정 문서

### Documents by Purpose

- `README.md`
  - 프로젝트 개요와 진입점
  - 새 Agent의 문서 읽기 순서 안내

- `MEMORY.md`
  - 장기 기억
  - 제품 방향성과 핵심 설계 의도

- `docs/handoff/current-goals.md`
  - 장기 목표와 단기 목표
  - coordinator의 현재 iteration 우선순위

- `CHANGELOG.md`
  - 사용자 관점 변경 내역

- `docs/handoff/`
  - 단기 인수인계 문서
  - 현재 결정, 구현 상태, 다음 우선순위

- `docs/architecture/`
  - 시스템 구조 문서

- `docs/decisions/`
  - ADR 성격의 설계 결정 기록

- `docs/input-rules/`
  - 도메인 규칙 문서

- `docs/process/`
  - Agent 협업 방식, 템플릿, system prompt 초안

- `docs/process/templates/`
  - 새 프로젝트 시작 시 복사해서 사용할 템플릿 파일 세트

- `boilerplates/project-starter/`
  - 바로 복사해서 새 프로젝트에 쓸 수 있는 starter 구조

- `scripts/create-project-from-boilerplate.sh`
  - boilerplate를 새 프로젝트 디렉토리에 복사하고 기본 구조를 생성하는 스크립트

## Local Development

```bash
yarn
yarn dev
```

## Build

```bash
yarn build
```

## Deployment

루트 기준 `Dockerfile`과 `.github/workflows/main.yml`을 사용합니다.

## Boilerplate Automation

새 프로젝트를 빠르게 시작하려면 아래 스크립트를 사용할 수 있습니다.

```bash
scripts/create-project-from-boilerplate.sh /path/to/new-project "Project Name"
```

이 스크립트는 다음을 수행합니다.

- `boilerplates/project-starter/` 복사
- 기본 디렉토리(`src`, `tests`, `docs/architecture`, `docs/decisions`, `docs/input-rules`) 생성
- 선택적으로 `README.md`의 프로젝트 이름 치환
