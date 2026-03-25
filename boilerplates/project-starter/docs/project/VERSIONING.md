# Versioning

이 starter는 기본적으로 pre-1.0 SemVer 운영을 권장한다.

## Recommended Scheme

- `0.MINOR.PATCH`

## Rules

1. `MINOR`
   - 사용자에게 설명 가능한 기능 단위 추가
   - iteration 마무리 수준의 의미 있는 변경
2. `PATCH`
   - 버그 수정
   - UI/UX polish
   - 문서, 테스트, 운영 안정화
3. 커밋마다 버전을 올리지 않는다.
4. 릴리스 단위에서만 버전을 갱신한다.
5. 릴리스 시 아래를 일치시킨다.
   - `package.json`
   - footer version 표기
   - `CHANGELOG.md`
   - git tag `vX.Y.Z`
