---
name: create-pr
description: 현재 브랜치의 변경사항을 분석해 PR 제목과 본문을 작성하고 GitHub Pull Request를 생성하는 스킬. 본문은 references의 한국어(kr) 또는 영어(en) 템플릿을 따르며, 기본값은 kr이다. 사용자가 "PR 만들어줘", "PR 올려줘", "풀 리퀘스트 생성", "create a PR", "open a pull request" 등 PR 생성을 요청하면 스킬 이름을 말하지 않더라도 이 스킬을 사용한다.
context: fork
---

# create-pr

현재 브랜치의 커밋을 분석해 템플릿에 맞는 PR을 생성한다.
이 스킬은 별도 서브에이전트 컨텍스트(`context: fork`)에서 실행되므로 중간에 사용자에게 묻지 않고 끝까지 진행한 뒤 결과를 보고한다. 진행할 수 없는 조건이면 PR을 만들지 않고 이유를 보고한다.

입력 인자: `$ARGUMENTS`

## 1. 언어 결정

- 인자에 `en`이 있으면 영어, `kr`이 있거나 인자가 없으면 한국어로 작성한다.
- 템플릿은 언어에 맞는 파일 하나만 읽는다.
  - 한국어: `references/pr-template.kr.md`
  - 영어: `references/pr-template.en.md`
- 그 외 인자 값은 무시하지 말고 결과 보고에 "알 수 없는 인자"로 알린다.

## 2. 사전 조건 확인

```bash
git branch --show-current
gh repo view --json defaultBranchRef --jq .defaultBranchRef.name
git status --short
git rev-parse --abbrev-ref --symbolic-full-name @{u}
```

아래 중 하나라도 해당하면 PR을 만들지 않고 중단한 뒤 이유와 해결 방법을 보고한다.

- 현재 브랜치가 기본 브랜치(main 등)다. 기본 브랜치에서 자기 자신으로 PR을 열 수 없기 때문이다.
- 기본 브랜치 대비 커밋이 없다 (`git log <base>..HEAD`가 비어 있음).
- 이미 같은 브랜치의 열린 PR이 있다 (`gh pr view --json url`이 성공). 이 경우 기존 PR 링크를 보고한다.

브랜치가 아직 push되지 않았거나 원격보다 앞서 있으면 `git push -u origin <브랜치>`로 push한 뒤 진행한다. 커밋되지 않은 변경(`git status`)은 PR에 포함되지 않으므로 보고에 그 사실을 적는다.

## 3. 변경 분석

```bash
git log --oneline <base>..HEAD
git diff --stat <base>...HEAD
git diff <base>...HEAD
```

커밋 메시지만 보지 말고 실제 diff로 무엇이 왜 바뀌었는지 파악한다. 리뷰어가 본문만 읽고도 변경 의도와 확인할 지점을 알 수 있어야 하기 때문이다.

## 4. 제목과 본문 작성

- 제목: 커밋 컨벤션과 같은 `type: 요약` 형식(feat/fix/refactor/chore). 요약은 선택한 언어로 쓴다. 커밋이 하나면 그 메시지를 기준으로, 여러 개면 전체를 대표하는 한 줄로 쓴다.
- 본문: 선택한 템플릿의 섹션 구조를 그대로 유지하고 각 섹션을 채운다. 해당 내용이 없는 섹션은 지우지 말고 "없음"(en: "None")으로 적는다.
- 테스트 섹션에는 실제로 실행해서 확인한 것만 적는다. 실행하지 않은 테스트를 통과했다고 쓰지 않는다.

## 5. PR 생성

본문을 임시 파일에 저장한 뒤 생성한다. 셸 인용 문제로 본문이 깨지는 것을 막기 위해서다.

```bash
gh pr create --base <base> --head <브랜치> --title "<제목>" --body-file <임시 파일>
```

## 6. 결과 보고

- PR 링크
- 제목과 사용한 템플릿 언어
- 포함된 커밋 목록
- push 여부, 포함되지 않은 미커밋 변경이 있었는지

## 하지 않는 것

- 기본 브랜치로 직접 push하거나 강제 push하지 않는다.
- 리뷰어, 라벨, assignee는 요청받지 않았으므로 지정하지 않는다.
