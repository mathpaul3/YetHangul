# Changelog

이 프로젝트는 Keep a Changelog 형식과 pre-1.0 Semantic Versioning 규칙을 따른다.

## [Unreleased]

### Changed

- 입력 경로를 `normalized input event -> single dispatcher -> engine/editor` 흐름으로 수렴시키는 작업 진행
- 모바일/태블릿 native keyboard proxy와 compact keyboard 공존 구조 보강
- on-screen modifier와 하드웨어/native 입력이 섞일 때 같은 기본 키의 후행 surface를 중복 반영하지 않도록 입력 suppression 규칙 보강
- Playwright smoke가 도움말 오버레이와 compact keyboard 기본값을 고려하도록 회귀 자산 정리

## [0.1.0]

- Initialized YetHangul project structure
- Added first-pass docs for engine architecture and input rules
- Added Vite/React/TypeScript app scaffold
- Added Docker and GitHub Actions deployment baseline
