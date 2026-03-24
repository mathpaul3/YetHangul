# Changelog

이 프로젝트는 Keep a Changelog 형식과 pre-1.0 Semantic Versioning 규칙을 따른다.

## [Unreleased]

### Changed

- 입력 경로를 `normalized input event -> single dispatcher -> engine/editor` 흐름으로 수렴시키는 작업 진행
- 모바일/태블릿 native keyboard proxy와 compact keyboard 공존 구조 보강
- on-screen modifier와 하드웨어/native 입력이 섞일 때 같은 기본 키의 후행 surface를 중복 반영하지 않도록 입력 suppression 규칙 보강
- Playwright smoke가 도움말 오버레이와 compact keyboard 기본값을 고려하도록 회귀 자산 정리
- input pipeline refactor Phase 1로 `NormalizedInputEvent`, shared dispatcher, native text batch adapter 경계를 코드와 문서에 고정
- input pipeline refactor Phase 2 첫 slice로 native text를 `NormalizedInputBatch`로 명시한 뒤 canonicalize / dispatch하는 경계를 추가
- native batch 경로의 newline/tone/selection replacement proof를 unit/service/e2e에 추가
- input pipeline refactor Phase 3 첫 slice로 editor mutation result shape를 helper 중심으로 공통화

## [0.1.0]

- Initialized YetHangul project structure
- Added first-pass docs for engine architecture and input rules
- Added Vite/React/TypeScript app scaffold
- Added Docker and GitHub Actions deployment baseline
