# Engine Architecture

YetHangul uses an input engine built on three pillars:

- Finite-state machine
- Sparse transition table
- Undo log

## Core Model

- `committed`: finalized jamo ids
- `active`: current syllable being edited
- `undoStack`: state snapshots for input-step rollback

## Why This Structure

- avoids reparsing the full string on every key input
- keeps backspace behavior natural
- makes hardware and on-screen keyboard logic share the same engine

## Key Rules

- internal representation is numeric ids
- Unicode conversion is done by the mapper
- ambiguous standalone consonant inputs default to initial
- finals are context-derived from the current syllable state
- reparsing is limited to local syllable transitions such as final-to-initial carry
- `ᆧ` remains medial-only and is not generalized as a standalone final target
