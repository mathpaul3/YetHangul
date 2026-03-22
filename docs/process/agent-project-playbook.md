# Agent Project Playbook

이 문서는 Domain에 상관없이 개발 프로젝트를 시작하고, Agent와 함께 진행하고, 인수인계하고, 운영으로 넘기기 위한 공통 초기 설정 문서다.

목표는 다음 세 가지다.

- Agent가 프로젝트 문맥을 빠르게 이해하고 실수를 줄이게 한다.
- 장기 프로젝트에서도 문맥 손실 없이 iteration을 이어가게 한다.
- 기획, 구현, 운영이 분리되되 끊기지 않게 한다.

## 1. 프로젝트 단계

프로젝트 개발은 다음 세 단계로 구성한다.

1. 기획 단계
- 로직 구상
- DB 설계
- 화면 구성
- 사용자 요구사항 수렴 및 목록화
- 성공 기준, 범위, 제약 조건 정의

2. 구현 단계
- 개발 환경 구축
- 코드 구현
- 테스트 자동화
- 배포 환경 구성
- CI/CD 파이프라인 구축

3. 운영 단계
- 실제 서비스 운영
- 개선 사항 수집
- 비즈니스 확장 가능성 논의
- 성능/장애/비용/수익 지표 확인
- 개선 backlog가 일정 규모 이상 쌓이면 기획 단계로 되돌려 새 iteration 생성

## 2. Agent 기본 원칙

- 모호하거나 불명확한 요구사항은 즉시 질문한다.
- 사용자의 요구를 만족시키는 방향으로 먼저 구현하되, 장기 유지보수 비용이 큰 경우는 미리 경고한다.
- 항상 인수인계를 염두에 두고 문서를 작성한다.
- 작업 중 context window가 커지면 handoff 문서를 먼저 갱신한다.
- 설명보다 구현이 필요한 단계에서는 실제 변경, 검증, 문서 갱신까지 한 turn 안에서 끝내는 것을 우선한다.
- 테스트나 빌드를 돌리지 못했다면 반드시 명시한다.

### 2-1. Coordinator 자율 진행 규칙

멀티 Agent 구조를 사용할 때는 아래 운영 규칙을 기본값으로 두는 것이 좋다.

- 중단 지시가 있을 때까지 Coordinator가 계속 작업을 진행한다.
- 사용자에게는 blocker, ambiguity, major milestone만 보고한다.
- 그 외의 중간 단계에서는 Coordinator가 subagent 결과를 먼저 검토하고, feedback과 다음 작업을 직접 배정한다.
- 사용자가 매번 `계속 진행`을 입력해야만 workflow가 이어지는 구조를 피한다.
- 이 규칙을 쓸 때는 README, handoff 문서, agent prompt에 같은 내용을 함께 적어 source of truth를 맞춘다.

## 3. Agent에게 항상 제공하면 좋은 정보

### 3-1. Agent Profile

- 역할: planner / implementer / reviewer / deployer / operator 중 무엇인지
- 현재 목표: 이번 iteration의 단기 목표
- 제약 조건: 기술 스택, 성능 목표, 비용 제한, 운영 환경, 사용 가능한 인프라
- 금지 사항: 데이터 삭제 금지, 강제 reset 금지, 외부 API 호출 제한 등

### 3-2. Long Term Memory

장기 문맥에는 다음이 들어가야 한다.

- 제품 목표
- 핵심 설계 의도
- 확정된 명세
- 아키텍처 결정
- 주요 trade-off
- 절대 깨지면 안 되는 정책

권장 파일:

- `docs/architecture/*.md`
- `docs/decisions/*.md`
- `docs/input-rules/*.md`
- `docs/process/*.md`
- `MEMORY.md`

### 3-3. Short Term Memory

단기 문맥에는 다음이 들어가야 한다.

- 현재 iteration 목표
- 현재 진행률
- 최근 변경 사항
- 막힌 이슈
- 다음 우선순위

권장 파일:

- `docs/handoff/decisions.md`
- `docs/handoff/spec-status-v1.md`
- `CHANGELOG.md`

## 4. 문서 체계 권장안

프로젝트 루트에는 최소한 아래 문서를 둔다.

- `README.md`
  - 프로젝트 소개
  - 실행 방법
  - 배포 개요

- `MEMORY.md`
  - 장기 방향성
  - 확정 정책
  - 현재도 유효한 핵심 결정

- `CHANGELOG.md`
  - 사용자 관점 변경점

- `docs/handoff/decisions.md`
  - 다음 Agent가 빠르게 이어받아야 하는 핵심 결정

- `docs/handoff/spec-status-v1.md`
  - spec 기준 완료/부분완료/미착수 상태

- `docs/decisions/0001-*.md`
  - ADR 형식 설계 결정

## 5. 기획 단계 규칙

- 요구사항은 기능 목록과 제약 조건으로 분리한다.
- 설계 명세는 Yes/No로 구현 여부를 판정할 수 있을 정도로 구체화한다.
- 화면 구성은 “예쁘다/직관적이다” 같은 표현보다 상태, 버튼, 흐름, 예외 상황을 기준으로 쓴다.
- 모호한 부분은 미루지 않고 질문한다.
- 범위가 큰 경우 MVP / 확장 / 운영 항목으로 나눈다.

권장 출력물:

- 제품 목표
- 사용자 시나리오
- 상태 전이 규칙
- 데이터 모델
- API/DB 개요
- 에러 처리 정책
- 테스트 기준

## 6. 구현 단계 규칙

- 구현은 항상 `코드 변경 + 검증 + 문서 갱신`을 한 세트로 본다.
- 로직 변경이 있으면 회귀 테스트를 추가한다.
- spec을 update할 정도의 작업이 진행되었다면 `git commit`을 진행한다.
- commit 전 권장 기준:
  - 빌드 통과
  - 핵심 테스트 통과
  - handoff 문서 갱신

권장 commit 기준:

- 설계 정책이 확정되었을 때
- 테스트 가능한 기능 단위가 끝났을 때
- 배포 가능한 상태가 되었을 때
- handoff 기준으로 맥락이 한 번 끊길 수 있을 때

## 7. 운영 단계 규칙

- 운영 중 발견한 이슈는 바로 backlog로만 던지지 말고, 재현 조건과 영향 범위를 기록한다.
- 개선 요구는 다음 네 가지로 분류한다.
  - 버그
  - 사용성 개선
  - 비즈니스 확장
  - 운영/비용 최적화
- backlog가 커지면 우선순위와 success metric을 붙여 다음 기획 단계로 넘긴다.

## 8. 내가 느낀 추가 권장 사항

이건 실제 협업을 진행하면서 특히 있으면 좋겠다고 느낀 항목들이다.

### 8-1. “모호점 즉시 질문”을 더 구체화

다음 경우에는 바로 질문하는 것이 좋다.

- 입력 규칙이 충돌할 수 있을 때
- UX가 크게 달라지는 정책 선택지가 있을 때
- 복구 불가능한 데이터 구조를 정해야 할 때
- 운영 비용이나 수익화 구조에 영향을 주는 결정일 때

### 8-2. “자연스러움” 같은 주관 표현은 측정 기준으로 바꾸기

예:

- 입력 보존성
- undo 일관성
- commit-and-restart 정확성
- key-sequence coverage
- inventory coverage

즉 감각적인 표현은 테스트 가능한 기준으로 바꿔 spec에 남긴다.

### 8-3. Handoff 문서는 별도 자산으로 유지

장기 프로젝트에서는 `README`만으로는 부족하다.

권장:

- handoff 문서는 “다음 Agent가 지금 당장 알아야 하는 것”만 적는다.
- 장기 설계 문서와 분리한다.
- context가 길어질수록 먼저 handoff를 갱신한다.

### 8-4. 테스트를 “설명용”으로도 쓰기

테스트는 단순 검증뿐 아니라 규칙 문서 역할도 해야 한다.

좋은 테스트 예:

- 대표 입력 예시
- 회귀 버그 재현 케이스
- 정책 경계값
- 전체 inventory 전수 검증

### 8-5. 구현보다 먼저 surface를 나누기

복잡한 입력기나 편집기류 프로젝트는 다음 계층을 먼저 분리하는 편이 좋다.

- core engine
- mapper / normalizer
- input adapter
- UI
- docs / handoff

이렇게 나누면 Agent를 여러 개 써도 충돌이 줄어든다.

### 8-6. service-level proof와 real-browser smoke를 분리하기

브라우저 입력이나 editor interaction처럼 surface 차이가 큰 문제는 증명 층을 나눠두는 편이 좋다.

- service-level matrix
  - browser family 차이(chromium-like / webkit-like / gecko-like)
  - input event contract
  - helper / adapter 회귀
- real-browser smoke
  - 실제 브라우저에서 주요 사용자 흐름이 통과하는지
  - desktop / tablet / mobile / small mobile 같은 surface matrix

다운로드형 브라우저 자동화가 막히거나 비용이 클 때는,
설치된 시스템 브라우저 채널을 real-browser smoke에 재사용하고, breadth는 service-level matrix로 유지하는 편이 효율적이다.

### 8-7. 구현 말미에는 service shell을 하나의 묶음으로 처리하기

프로젝트 구현 단계가 마무리에 접어들면 아래 항목이 산발적으로 생기기 쉽다.

- top navigation
- footer / version / legal
- branding / logo
- analytics scaffold
- 외부 링크 / 문의 경로

이 시점에는 이를 흩어진 미세 task로 두기보다, `service shell` 묶음으로 다루는 편이 좋다.

- 실제 사용 기반 polish와 함께 묶어서 처리한다.
- layout / copy / legal / analytics env를 한 번에 정리한다.
- smoke test 표면도 같은 라운드에 같이 갱신한다.
- 설치된 system browser channel을 먼저 활용하고
- 나머지 breadth는 service-level matrix로 유지하는 방식이 실용적이다.

### 8-8. 긴 규칙표나 장문 설명은 main workspace를 밀어내지 않게 분리하기

입력기나 편집기처럼 핵심 작업 surface가 있는 서비스에서는,
길고 자주 읽지 않는 설명이 main workspace를 밀어내기 쉽다.

- 긴 규칙표는 modal, drawer, 별도 도움말 surface로 분리한다.
- main 화면에는 지금 바로 필요한 원칙만 짧게 남긴다.
- product shell을 정리할 때는 “지금 바로 써야 하는 정보”와 “필요할 때 열어보는 정보”를 분리한다.

### 8-9. 수익화/운영 확장을 일찍 메모하기

기능 구현과 별개로 운영 단계에서 바로 필요해질 수 있다.

예:

- 광고 배치 가능 지점
- 사용자 행동 이벤트
- 사전/검색 기능 확장성
- 유료화 가능 기능
- 관리 도구 필요 여부

즉 현재 iteration에 구현하지 않더라도, Long Term Memory에는 남겨두는 편이 좋다.

### 8-10. public config와 true secret을 구분하기

운영 중에는 env 값이 많아지면서, public identifier와 실제 secret이 섞여 혼동되기 쉽다.

- client-side에서 노출될 수밖에 없는 값은 public config로 본다.
- API key, signing key, private token, DB credential처럼 재발급/폐기가 필요한 값만 true secret으로 분류한다.
- public config라도 hardcode보다 deploy-time env 주입이 운영상 깔끔하면 env를 선호한다.
- 보안 판단은 “노출되면 위험한가”와 “운영상 분리하는 편이 좋은가”를 구분해서 기록한다.

## 9. 멀티 Agent 사용 시 권장 구조

- Planner Agent
  - 범위 정의
  - spec 작성
  - open question 정리

- Worker Agent
  - 파일 단위 구현
  - 테스트 추가
  - 로직 수정

- Reviewer Agent
  - 회귀 위험
  - 명세 불일치
  - 누락 테스트 탐지

- Deployer/Operator Agent
  - CI/CD
  - 배포 체크리스트
  - 운영 이슈 triage

중요 원칙:

- write scope가 겹치지 않게 분리한다.
- handoff 문서를 공통 진실 원천으로 둔다.
- immediate blocker는 메인 Agent가 직접 해결한다.

## 10. 추천 초기 체크리스트

새 프로젝트를 시작할 때 아래를 먼저 만든다.

- `README.md`
- `MEMORY.md`
- `CHANGELOG.md`
- `docs/handoff/decisions.md`
- `docs/handoff/spec-status-v1.md`
- 기본 폴더 구조
- 테스트 실행 명령
- 빌드 명령
- 배포 방식 메모

## 11. 추천 운영 체크리스트

- 장애/버그 재현 절차가 기록돼 있는가
- 성능/비용/수익화 관점 backlog가 분리돼 있는가
- 새 iteration으로 넘길 backlog에 우선순위가 있는가
- spec과 실제 구현 상태가 문서상 동기화돼 있는가

## 12. 이 문서를 Agent skill처럼 쓰는 방법

새 프로젝트를 시작할 때 Agent에게 최소한 아래를 전달하면 좋다.

1. 현재 프로젝트 단계
2. 현재 iteration 목표
3. Long Term Memory 문서 위치
4. Short Term Memory 문서 위치
5. commit 기준
6. 질문이 필요한 모호점 처리 원칙
7. 테스트/배포 명령

요약하면:

- 장기 방향은 `MEMORY`
- 현재 상황은 `handoff`
- 사용자 가치는 `spec`
- 실제 안전성은 `tests`
- 작업 끊김 방지는 `commit + docs`
