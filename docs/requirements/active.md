# YetHangul Active Requirements

이 문서는 **현재 살아 있는 요구사항**만 관리한다.
이미 릴리스에 반영된 요구사항은 `docs/requirements/archive/`로 옮긴다.

## Status

- 현재 iteration: `v0.2.3` (patch)
- 새 피드백이나 운영 이슈가 들어오면 아래 형식으로 추가한다.

## Active Requirements

- `REQ-V023-001`
  - Source: user (2026-10-17)
  - Type: `user`
  - Summary: Windows에서 한글 IME가 켜진 상태로도 하드웨어 키보드로 옛한글을 입력할 수 있어야 한다.
  - Background:
    - v0.2.3 첫 시도(Windows 한글 IME의 `Process` 키를 물리 키 기준 두벌식으로 치환)는 일본어/중국어 등 다른 IME 입력까지 한글로 바꿔 v0.2.4로 롤백되었다. 두 태그는 배포되지 않은 채 제거했고, 이번 iteration에서 `v0.2.3`을 다시 정의한다.
  - Acceptance:
    - Windows 한글 IME(한글 모드)에서 기본 자모 키 입력이 macOS 등 다른 환경과 같은 조합 결과로 입력 결과창에 즉시 반영된다. `Shift` 조합(쌍자모 등)도 같다.
    - 병서/복합 중성/재분석/Backspace undo 등 기존 입력 규칙이 Windows 한글 IME 입력에서도 같은 결과를 낸다.
    - `Ctrl` 조합 규칙도 Windows 하드웨어 키보드에서 동작한다. 단, 브라우저가 가로채서 페이지가 막을 수 없는 예약 단축키(`Ctrl + T`, `Ctrl + W` 등)는 on-screen modifier로 대체한다.
    - 편집기에 선택 영역이 있을 때 `Ctrl + C`는 복사로 동작한다.
    - 일본어/중국어 등 한글이 아닌 IME 입력은 한글로 바뀌지 않고 원래 텍스트(literal) 그대로 입력된다.
    - IME 영문 모드의 로마자 입력은 지금처럼 literal로 입력된다.
  - Related Tasks: `TASK-V023-003`
  - Status: `active`

- `REQ-V023-002`
  - Source: user (2026-10-17)
  - Type: `user`
  - Summary: 모바일/태블릿의 OS native 키보드 입력을 제거하고, 웹페이지 자체 가상 키보드로만 입력한다.
  - Background:
    - OS native 키보드가 자체 가상 키보드와 겹쳐 화면을 가리고 UX를 해친다고 판단했다.
  - Acceptance:
    - 모바일/태블릿에서 입력 결과창, 가상 키보드 등 어떤 요소를 눌러도 OS 가상 키보드가 올라오지 않는다.
    - 모바일/태블릿에서 자체 가상 키보드만으로 모든 입력과 편집이 가능하다. 글자 키가 바로 보이도록 기본적으로 펼쳐진 상태로 시작한다.
    - 데스크톱과, 물리 키보드를 연결한 태블릿/터치 노트북의 하드웨어 키보드 입력은 영향받지 않는다.
  - Related Tasks: `TASK-V023-002`
  - Status: `active`

- `REQ-V023-003`
  - Source: user (2026-10-17)
  - Type: `user`
  - Summary: UX 개선을 위해 반치음(`ᅀ`) 입력을 `Shift + ㅊ`에서 `Ctrl + ㅁ`으로 바꾼다.
  - Acceptance:
    - `L Ctrl + ㅁ`, `R Ctrl + ㅁ` 모두 `ᅀ`를 입력한다. on-screen 키보드와 하드웨어 키보드 모두 같다.
    - `Shift + ㅊ`는 더 이상 `ᅀ`를 입력하지 않고, 특수 규칙이 없는 다른 `Shift` 조합처럼 동작한다.
    - 초성/종성 문맥 등 `ᅀ`의 조합 동작은 기존과 같다.
    - 도움말 규칙표와 on-screen 키캡 미리보기가 새 규칙을 보여준다. `Ctrl = 자형 변환` 원칙의 반치음 예외 표기는 없앤다.
  - Related Tasks: `TASK-V023-001`
  - Status: `active`

## Entry Template

- `REQ-<version>-<id>`
  - Source:
  - Type: `user` | `developer` | `ops`
  - Summary:
  - Acceptance:
  - Related Tasks:
  - Status: `active` | `deferred`

## Rules

1. 요구사항은 “무엇을 원했는가”만 적고, 구현 단계나 파일 경로는 쓰지 않는다.
2. 구현 항목은 `docs/tasks/active.md`에서 관리한다.
3. 한 iteration이 끝나면, 이번 릴리스에 반영된 요구사항은 해당 버전 archive로 이동한다.
