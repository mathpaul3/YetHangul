# MEMORY

## Current Goal

옛한글 웹 입력기 MVP를 구현한다.

현재 장/단기 목표와 coordinator 기준 우선순위는 `docs/handoff/current-goals.md`를 source of truth로 사용한다.

## Confirmed Decisions

- Engine architecture: FSM + sparse transition table + undo log
- Internal representation: numeric ids mapped to Unicode only at render and interoperability boundaries
- Ambiguous standalone consonant inputs default to initial; finals are context-derived
- `ᆧ` is medial-only and is not treated as a general final-consonant target
- canonical starter source of truth is `boilerplates/project-starter/`
- multi-agent runs use coordinator-owned commit authority by default
- each development cycle should end with a review of the development process itself, not only the feature result
- Desktop and tablet with hardware keyboard: hardware keyboard first
- Mobile: on-screen keyboard first
- Backspace: input-step undo
- Font stack: `"NanumBarunGothic-YetHangul", "Noto Sans KR", sans-serif`
- Batch reparsing of the full string is not allowed during normal typing

## Initial Deliverables

- React/Vite app shell
- Engine scaffolding and table formats
- IME workspace UI
- CI/CD pipeline compatible with Docker + NAS deployment

## Open Questions

- Exact internal modeling of special macros such as `Shift + ㅁ`
- Paste normalization edge cases for compatibility jamo and precomposed syllables
- Final production font asset placement and licensing checks
