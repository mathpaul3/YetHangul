#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/boilerplates/project-starter"

usage() {
  cat <<'EOF'
Usage:
  scripts/create-project-from-boilerplate.sh <target-dir> [project-name]

Examples:
  scripts/create-project-from-boilerplate.sh /path/to/new-project
  scripts/create-project-from-boilerplate.sh /path/to/new-project "My Project"
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

TARGET_DIR="${1:-}"
PROJECT_NAME="${2:-}"

if [[ -z "$TARGET_DIR" ]]; then
  usage
  exit 1
fi

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Boilerplate source not found: $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

if [[ -n "$(find "$TARGET_DIR" -mindepth 1 -maxdepth 1 2>/dev/null)" ]]; then
  echo "Target directory is not empty: $TARGET_DIR" >&2
  exit 1
fi

cp -R "$SOURCE_DIR"/. "$TARGET_DIR"

mkdir -p \
  "$TARGET_DIR/src" \
  "$TARGET_DIR/tests" \
  "$TARGET_DIR/docs/architecture" \
  "$TARGET_DIR/docs/decisions" \
  "$TARGET_DIR/docs/requirements/archive" \
  "$TARGET_DIR/docs/tasks/archive" \
  "$TARGET_DIR/docs/tasks/checklists" \
  "$TARGET_DIR/docs/specs/active" \
  "$TARGET_DIR/docs/specs/archive" \
  "$TARGET_DIR/docs/project"

if [[ -n "$PROJECT_NAME" ]]; then
  README_PATH="$TARGET_DIR/README.md"
  if [[ -f "$README_PATH" ]]; then
    TEMP_FILE="$(mktemp)"
    {
      printf '# %s\n' "$PROJECT_NAME"
      tail -n +2 "$README_PATH"
    } > "$TEMP_FILE"
    mv "$TEMP_FILE" "$README_PATH"
  fi
fi

cat <<EOF
Created new project starter at:
  $TARGET_DIR

Next steps:
  1. Fill in README.md and MEMORY.md
  2. Update docs/handoff/current.md
  3. Update docs/requirements/active.md, docs/tasks/active.md, and docs/specs/active/spec-v1-status.md
  4. Review docs/project/PROJECT_START_CHECKLIST.md
EOF
