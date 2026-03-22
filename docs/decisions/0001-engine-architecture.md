# ADR 0001: Engine Architecture

## Status

Accepted

## Decision

Use `FSM + sparse transition table + undo log` as the core architecture for the YetHangul input engine.

## Context

The editor must support:

- hardware keyboard first on desktop
- on-screen keyboard first on mobile
- input-step undo
- ambiguous standalone consonant inputs default to initial, while finals are context-derived from the active syllable
- local reparsing of final consonants when a following vowel is typed
- `ᆧ` remains medial-only and is not generalized as a standalone final target

## Consequences

- engine state remains small and predictable
- input latency should remain stable
- Unicode rendering stays decoupled from internal editing logic
