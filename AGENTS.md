# AGENTS.md

## Operational Commands

패키지 매니저는 bun 고정이다 (`bun.lock` 사용). npm/yarn/pnpm으로 설치하거나 락파일을 만들지 않는다.

- 설치: `bun install`
- 개발 (API 서버 + Vite 동시): `bun run dev`
- API 서버만: `bun run server` (포트 3002)
- 테스트: `bun run test` (= `vitest run`). `bun test`는 bun 자체 러너를 호출하므로 사용하지 않는다. 근거: `package.json` scripts, `vite.config.ts:14-19` (jsdom, setupFiles, include 설정이 vitest 전용).
- 린트: `bun run lint`
- 빌드: `bun run build` (= `tsc -b && vite build`)

작업 완료 전 `bun run test`와 `bun run lint`를 실행한다. `bun run build`의 타입체크는 `server/`를 포함하지 않는다 (`server/AGENTS.md` 참고).

## Golden Rules

### Immutable

- API 키 값(`ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`)을 클라이언트로 내려보내지 않는다. `/api/config`는 키 존재 여부(boolean)만 반환한다. 근거: `server/index.ts:147-157`.
- `.env`는 읽거나 출력하거나 커밋하지 않는다. `.gitignore`에 등록되어 있고 `.worktreeinclude`로 워크트리에만 복사된다.
- 키, 토큰, 키가 포함된 URL을 로그나 에러 메시지에 넣지 않는다. Gemini 호출 URL은 쿼리스트링에 키를 포함하므로(`server/index.ts:99`) 에러에는 상태 코드만 담는다 (`server/index.ts:112`).

### Do's & Don'ts

- Vite 프록시 대상 포트(`vite.config.ts:11`의 `3002`)와 `Bun.serve` 포트(`server/index.ts:139`)는 항상 함께 바꾼다. 한쪽만 바꾸면 `/api` 호출이 실패한다.
- AI 응답 후처리와 시스템 프롬프트는 이중 방어 구조다. 시스템 프롬프트가 "코드펜스 금지, `render(...)` 호출 포함, import 금지, TS 문법 금지"를 지시하고(`server/index.ts:11-12, 16, 20`), 서버가 `stripCodeFences`/`ensureRenderCall`로 한 번 더 보정한다 (`server/index.ts:188`). 한쪽을 제거하면 모델이 지시를 어긴 응답에서 미리보기가 깨진다. 제거하거나 약화하지 않는다.
- API 키 누락 검사도 두 곳에 있다: 클라이언트 `src/App.tsx:46`, 서버 `server/index.ts:169`. 서버 검사가 최종 방어선이므로 클라이언트 검사만 보고 서버 검사를 제거하지 않는다.
- 프로바이더 간 처리는 비대칭이다. Google만 모델 폴백(`server/index.ts:134-136`)과 `MAX_TOKENS` 잘림 감지(`server/index.ts:123-125`)가 있고 Anthropic 경로(`server/index.ts:68-96`)에는 없다. 한쪽 프로바이더 코드를 수정할 때 다른 쪽에 같은 처리가 필요한지 확인하고, 필요 없다면 사유를 커밋 메시지에 남긴다.
- `Provider` 타입이 `src/types/index.ts:1`과 `server/index.ts:57`에 중복 정의되어 있다. 프로바이더를 추가하면 두 곳과 `src/App.tsx:11-14`의 `PROVIDER_CONFIG`, `server/index.ts:59-62`의 `ENV_KEYS`를 함께 수정한다.
- 새 외부 호출이나 기능 추가 시 순수 로직은 `server/generator.ts`, `server/fallback.ts`처럼 부수효과 없는 모듈로 분리하고 테스트를 함께 작성한다.

## Project Context

프롬프트를 입력하면 AI가 React 컴포넌트를 생성하고 react-live로 미리보기와 코드를 보여주는 도구.

Tech Stack: React 19, TypeScript 5.9, Vite 8, Vitest 4, react-live, Bun (API 서버), Anthropic Claude / Google Gemini.

## Standards & References

- 설치, 실행, 기능 설명은 `README.md` 참고. 반복하지 않는다.
- 커밋 메시지: 한국어 `feat|fix|refactor|chore: 요약` 형식. 절차는 `.claude/skills/commit/SKILL.md`를 따른다.
- 테스트 이름과 주석은 한국어로 작성한다 (`server/*.test.ts`, `src/components/PromptInput.test.tsx`의 기존 패턴).
- Maintenance Policy: 이 파일의 규칙과 코드가 어긋난 것을 발견하면 작업을 멈추지 말고 수정안을 사용자에게 제안한다. 인용된 파일·라인은 코드 변경 시 어긋날 수 있으므로 규칙의 의미를 우선한다.

## Context Map

- **[서버 코드 수정 (Bun API, AI 호출, 폴백, 에러 매핑)](./server/AGENTS.md)** — `server/` 하위 파일을 수정하거나 프로바이더를 추가할 때.
- **[프론트엔드 수정 (React, react-live 미리보기, 컴포넌트 테스트)](./src/AGENTS.md)** — `src/` 하위 파일을 수정하거나 UI 테스트를 작성할 때.
