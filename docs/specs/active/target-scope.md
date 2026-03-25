# Target Scope

기준 페이지:

- [유니코드 옛한글 1638750자](https://charset.fandom.com/ko/wiki/%EC%9C%A0%EB%8B%88%EC%BD%94%EB%93%9C_%EC%98%9B%ED%95%9C%EA%B8%80_1638750%EC%9E%90)

## Scope Definition

문자 집합 위키 페이지는 다음 범위를 목표로 제시한다.

- 초성 125자
- 중성 95자
- 종성 138자
- 총 조합 공간: 1,638,750

페이지 설명에 따르면:

- "초성, 중성, 종성 중 한 성분 이상이 없는 경우도 포함"

즉, 최종 목표는 단순한 "완전한 음절"만이 아니라 다음도 포함하는 방향이다.

- 초성만 있는 경우
- 중성만 있는 경우
- 종성만 있는 경우
- 초성+중성
- 초성+종성
- 중성+종성
- 초성+중성+종성

## Current Gap

현재 엔진은 다음을 상당 부분 지원한다.

- 현대 한글 기본 초중종
- 복합 중성 다수
- 겹받침 다수
- 일부 옛한글 특수 초성/모음

하지만 아직 다음은 미완료다.

- 125개 초성 inventory 완전 수록
- 95개 중성 inventory 완전 수록
- 138개 종성 inventory 완전 수록
- 위 inventory 전체에 대한 조합 규칙/입력 규칙/정규화 규칙

## Implementation Implication

다음 단계에서는 우선 아래를 순서대로 진행하는 것이 좋다.

1. 목표 inventory를 데이터 파일로 완전 수록
2. 입력 심볼과 자모 id를 inventory 기준으로 확장
3. composition table을 inventory 전 범위 기준으로 확장
4. paste normalization을 inventory 전 범위 기준으로 확장
5. 모바일/하드웨어 키보드 입력 규칙을 inventory 기준으로 정리

## Clarified Input Strategy

사용자 확인으로 입력 전략은 다음처럼 정리되었다.

- 일반적인 키보드로 입력 가능한 기본 자모(`ㄱ-ㅎ`, `ㅏ-ㅣ`)만 직접 입력 대상으로 둔다.
- 나머지 옛한글 확장 자모는 `L/R Ctrl`, `L/R Shift` modifier 조합으로 접근한다.
- 온스크린 UI는 일반 자모 버튼과 `L/R Ctrl`, `L/R Shift`, `Backspace`를 우선 제공한다.
- 즉 목표 범위는 넓게 유지하되, UI는 "직접 입력 가능한 핵심 자모 + modifier" 구조를 따른다.
