# Agent Instructions

## Blueprint

이 프로젝트의 목표, 결정, 규칙은 Blueprint 서비스의 yethangul 프로젝트에 있다. 저장소에 그래프 파일은 없다. `docs/handoff/decisions.md`, `docs/decisions/`, `docs/specs/`의 결정을 옮겨 온 것이다.

- 그래프는 blueprint 플러그인의 MCP 도구로만 읽고 쓴다. bps는 쓰지 않는다(사람과 관리 일이다). 서비스에 닿지 않으면 그래프를 쓰지 말고 사용자에게 알린다.
- 모든 MCP 도구 호출에 cwd로 지금 작업 폴더의 절대 경로(main 체크아웃이나 워크트리)를 준다. 빠뜨리면 그래프 쓰기와 시험이 main으로 간다.
- 코드를 바꾸기 전에 context 도구(view implementation, targets에 고칠 파일이나 ID)로 지킬 결정과 제약을 읽는다.
- 그래프와 기존 문서의 내용이 다르면 진행하기 전에 사용자에게 알린다.
- 새 노드나 결정을 만들기 전에 find로 같은 것을 찾는다.
- 새 결정은 proposed로 적는다. accepted는 승인 권한이 있는 주체(사람)만 정한다. 사람의 승인은 웹에서 한다.
- 코드를 바꾸면 같은 브랜치에서 관련 구현(status, refs)을 apply로 고친다. 그 브랜치의 그래프 변경은 변경 묶음에 쌓인다.
- QA 조건을 확인하면 verify 도구(result 또는 run)로 기록한다. 커밋 메시지에 도구용 트레일러를 달지 않는다.
- 그래프를 고친 뒤 lint 도구로 검사해 오류를 고친다.
- 코드 브랜치를 병합하기 전에 cwd를 그 워크트리로 주고 review와 changeset_merge를 부른다.
- 자세한 절차는 blueprint 플러그인의 blueprint 스킬에 있다.
