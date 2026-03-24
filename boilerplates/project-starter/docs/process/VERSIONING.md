# Versioning Policy

이 starter는 기본적으로 Semantic Versioning을 따르되, `1.0.0` 이전에는 `0.MINOR.PATCH` 운영을 권장한다.

## Rule of Thumb

- `MINOR`
  - 사용자에게 설명 가능한 기능 단위가 추가되었을 때
  - 단기 Goal / iteration이 하나 마무리되었을 때
- `PATCH`
  - 버그 수정
  - UI/UX polish
  - 문서/테스트/운영 보강

## Release Discipline

- 버전은 커밋마다 올리지 않는다.
- 릴리스 가능한 단위가 생겼을 때만 올린다.
- `CHANGELOG.md`에는 사용자 관점의 변화만 적는다.

## Suggested Changelog Shape

- `Unreleased`
- `Added`
- `Changed`
- `Fixed`
- `Docs`
