# Agent Instructions

## Blueprint (.blueprint/)

이 프로젝트의 목표, 결정, 규칙은 `.blueprint/` 그래프에 있다. `docs/handoff/decisions.md`, `docs/decisions/`, `docs/specs/`의 결정을 옮겨 온 것이다.

- 코드를 바꾸기 전에 `blueprint context <고칠 파일 또는 노드 ID>`로 지켜야 할 결정과 제약을 읽는다.
- 그래프와 기존 문서의 내용이 다르면 진행하기 전에 사용자에게 알린다.
- 새 노드나 결정을 만들기 전에 같은 것이 이미 있는지 찾는다.
- 새 결정은 `proposed`로 적는다. `accepted`는 approver(사람)만 정한다.
- 코드를 바꾸면 같은 커밋에서 관련 노드의 `implementation`(status, refs)을 고친다.
- `.blueprint/`를 고친 뒤 `blueprint lint`로 검사해 오류를 고친다. `blueprint` 명령은 blueprint 플러그인에 들어 있다.
- 커밋 메시지 끝에 `Actor: <자리 ID>@<세션 ID>` 트레일러를 남긴다. 자리 ID는 `.blueprint/actors.yaml`에 있다.
- 자세한 절차는 ProjectManager 저장소의 blueprint 플러그인에 있다. Claude Code에서는 blueprint 스킬로 쓴다.
