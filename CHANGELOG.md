# Changelog

이 프로젝트는 Keep a Changelog 형식과 pre-1.0 Semantic Versioning 규칙을 따른다.

## [Unreleased]

### Changed

- 입력 경로를 `normalized input event -> single dispatcher -> engine/editor` 흐름으로 수렴시키는 작업 진행
- 모바일/태블릿 native keyboard proxy와 compact keyboard 공존 구조 보강
- on-screen modifier와 하드웨어/native 입력이 섞일 때 같은 기본 키의 후행 surface를 중복 반영하지 않도록 입력 suppression 규칙 보강
- on-screen keyboard가 현재 `Shift` / `Ctrl` 상태에 따라 실제 입력 결과를 미리 보여주는 dynamic keycap label을 사용하도록 정리
- Playwright smoke가 도움말 오버레이와 compact keyboard 기본값을 고려하도록 회귀 자산 정리
- input pipeline refactor Phase 1로 `NormalizedInputEvent`, shared dispatcher, native text batch adapter 경계를 코드와 문서에 고정
- input pipeline refactor Phase 2 첫 slice로 native text를 `NormalizedInputBatch`로 명시한 뒤 canonicalize / dispatch하는 경계를 추가
- native batch 경로의 newline/tone/selection replacement proof를 unit/service/e2e에 추가
- input pipeline refactor Phase 3 첫 slice로 editor mutation result shape를 helper 중심으로 공통화
- input pipeline refactor Phase 3 후속 slice로 newline 경계의 `←/→/Home/End`와 selection collapse를 line-aware helper 계약으로 고정
- input pipeline refactor Phase 3 마지막 slice로 desktop/mobile mixed-source editor mutation smoke를 고정
- production-only Google Analytics event helper를 추가하고, 분해 보기 기준 입력 글자 수 증가량만큼 `옛한글 입력` event를 수집하도록 보강
- toned syllable 뒤 literal punctuation을 입력한 뒤 `Backspace`를 눌렀을 때 punctuation만 제거되도록 editor-layer 회귀를 추가
- on-screen `.` / `;` key가 `Ctrl` 없이도 literal punctuation으로 입력되도록 수정

## [0.1.0]

- Initialized YetHangul project structure
- Added first-pass docs for engine architecture and input rules
- Added Vite/React/TypeScript app scaffold
- Added Docker and GitHub Actions deployment baseline
