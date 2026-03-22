# MEMORY

## Current Goal

옛한글 웹 입력기 MVP를 구현한다.

## Confirmed Decisions

- Engine architecture: FSM + sparse transition table + undo log
- Internal representation: numeric ids mapped to Unicode only at render and interoperability boundaries
- Ambiguous standalone consonant inputs default to initial; finals are context-derived
- `ᆧ` is medial-only and is not treated as a general final-consonant target
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
