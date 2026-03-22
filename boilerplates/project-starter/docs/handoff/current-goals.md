# Current Goals

이 문서는 현재 프로젝트의 장기 목표와 단기 목표를 짧고 실행 가능한 형태로 정리한 문서다.
Coordinator와 subagent는 새로운 작업을 시작하기 전에 이 문서의 `Current Iteration Goals`와 `Immediate Queue`를 먼저 확인한다.

## Long-Term Goals

1. 프로젝트가 장기적으로 달성해야 할 목표
2. 여러 iteration에 걸쳐 유지되어야 하는 사용자 가치
3. 장기적으로 안정화해야 할 품질 기준

## Medium-Term Goals

1. 현재 분기나 현재 phase에서 줄여야 할 핵심 문제
2. 이번 spec/version에서 `Partial`을 `Done`으로 바꾸기 위해 필요한 큰 축

## Current Iteration Goals

현재 iteration에서 실제로 집중할 3~5개의 목표만 적는다.

1. 
2. 
3. 

## Immediate Queue

현재 라운드에서 가장 우선순위가 높은 작업을 3~5개만 적는다.
이 목록에 없는 작업은 blocker, ambiguity, 또는 major milestone이 아닌 이상 뒤로 미룬다.

1. 
2. 
3. 

## Atomic Queue

반복 보고와 중복 작업을 줄이기 위해, 남은 작업을 더 작은 task id 단위로 관리한다.
subagent는 새 라운드를 시작할 때 아래에서 정확히 1개 task id만 잡는다.

- `T1` `Open`
  - 
- `T2` `Open`
  - 
- `T3` `Open`
  - 

### Queue Rules

1. 같은 task id를 연속 두 라운드에서 다시 보고하지 않는다.
2. `Open -> In Progress -> Landed -> Done` 중 하나로 상태를 갱신한다.
3. `Landed`는 main 반영 완료를 뜻하고, `Done`은 남은 proof gap이 사실상 없을 때만 사용한다.
4. 새 task를 추가할 때는 왜 기존 task로 표현할 수 없는지도 같이 적는다.
5. 특정 task가 두 라운드 이상 반복되면, 더 작은 sub-task id로 분해한 뒤 그중 정확히 1개만 잡는다.

## Deprioritized For Now

지금 당장 하지 않을 작업을 적는다.

1. 
2. 

## Coordination Rules

1. 새 작업은 가능하면 `Current Iteration Goals` 중 하나를 직접 줄이는 경우에만 시작한다.
2. `Immediate Queue`에 없는 작업은 blocker, ambiguity, 또는 major milestone이 아닌 이상 뒤로 미룬다.
3. 문서/테스트가 없는 구현은 우선순위를 낮춘다.
4. 장황한 탐색보다, 현재 `Partial` 항목에 대응되는 proof를 1개라도 더 닫는 작업을 우선한다.
