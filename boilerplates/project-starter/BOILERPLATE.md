# Boilerplate Guide

이 디렉토리는 새 프로젝트를 시작할 때 바로 복사해서 사용할 수 있는 starter 세트입니다.

## Files

- `README.md`
- `MEMORY.md`
- `CHANGELOG.md`
- `docs/handoff/decisions.md`
- `docs/specs/active/spec-v1-status.md`
- `docs/process/PROJECT_START_CHECKLIST.md`
- `docs/process/AGENT_PROFILES.md`
- `docs/process/AGENT_SYSTEM_PROMPT_TEMPLATES.md`

## How To Use

1. 이 디렉토리 내용을 새 프로젝트 루트로 복사합니다.
2. `README.md`에 프로젝트 개요와 실행 방법을 채웁니다.
3. `MEMORY.md`에 장기 방향성과 핵심 제약을 적습니다.
4. `docs/handoff/` 문서에 현재 iteration 목표와 구현 상태를 적습니다.
5. `docs/process/AGENT_PROFILES.md`와 `docs/process/AGENT_SYSTEM_PROMPT_TEMPLATES.md`를 바탕으로 Agent 세트를 정합니다.
6. checklist를 보면서 초기 세팅을 마칩니다.

## Canonical Source

- 새 프로젝트 starter의 source of truth는 이 디렉토리 하나로 유지합니다.
- 같은 역할의 템플릿이나 초안 문서가 다른 위치에 생기면, 장기 유지 전에 여기로 흡수하거나 정리합니다.

## Operating Advice

- 멀티 Agent 구조라면 commit은 Coordinator가 review 후 수행하는 것을 기본값으로 둡니다.
- 목표는 `requirements / tasks / specs / handoff current`를 분리해 관리하는 것이 좋습니다.
- 한 cycle이 끝날 때마다 기능뿐 아니라 개발 과정, 문서, boilerplate, subagent lifecycle도 함께 회고합니다.

## Recommended Additions

- `docs/architecture/`
- `docs/decisions/`
- `docs/input-rules/`
- CI/CD workflow
- 테스트 명령과 배포 명령
