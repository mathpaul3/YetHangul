# Versioning Policy

이 프로젝트는 기본적으로 Semantic Versioning을 따르되, `1.0.0` 이전에는 아래의 pre-1.0 운영 기준을 사용한다.

## Format

- `MAJOR.MINOR.PATCH`

## Pre-1.0 Rule

- `0.MINOR.PATCH`를 기본 형식으로 사용한다.
- `MAJOR`는 `0`으로 고정한다.
- `MINOR`는 사용자 입장에서 의미 있는 기능 단위가 추가되거나, 단기 Goal 수준의 iteration이 마무리될 때 올린다.
- `PATCH`는 버그 수정, UI/UX polish, 테스트 보강, 문서 갱신, 운영 안정화처럼 기존 기능 의미를 바꾸지 않는 변경에 사용한다.

## Post-1.0 Rule

- `MAJOR`
  - 기존 사용법이나 결과와 호환되지 않는 breaking change
  - 제품 Goal 자체가 크게 바뀌는 수준의 변화
- `MINOR`
  - 기존 호환성을 유지하면서 기능이 추가되는 경우
- `PATCH`
  - 버그 수정, 성능 개선, 작은 UI/문서 수정

## Release Unit

- 버전은 커밋마다 올리지 않는다.
- `릴리스 가능한 단위`가 만들어졌을 때만 올린다.
- 릴리스 커밋에는 반드시 같은 버전의 `vX.Y.Z` git tag를 붙인다.
- 배포 파이프라인은 브랜치 push보다 `v...` tag push를 기준으로 trigger한다.
- 기준:
  - 사용자에게 설명 가능한 변화가 모였는가
  - CHANGELOG에 독립 섹션으로 남길 수 있는가
  - 빌드와 핵심 테스트가 통과하는가

## Changelog Rule

- `CHANGELOG.md`는 사용자 관점의 변화만 적는다.
- 권장 섹션:
  - `Added`
  - `Changed`
  - `Fixed`
  - `Docs`
- 아직 릴리스되지 않은 작업은 `Unreleased`에 모은다.

## Recommended Interpretation For This Project

- `0.1.x`
  - MVP 안정화, 입력 버그 수정, UI 다듬기
- `0.2.0`
  - 사용자 입장에서 기능이 분명히 하나 늘어난 시점
- `1.0.0`
  - 입력 규칙, 편집 surface, 배포/운영 구조가 안정화되어 “공개 서비스”로 봐도 되는 시점
