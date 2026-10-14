# server/AGENTS.md

## Module Context

Bun 런타임에서 실행되는 AI API 프록시. 프론트엔드의 `/api/generate`, `/api/config` 요청을 받아 Anthropic/Google API로 중계한다.

## Tech Stack & Constraints

- 런타임은 Bun이다 (`Bun.serve`, `process.env`). 서버 코드는 외부 HTTP 클라이언트 없이 전역 `fetch`만 사용한다 (`index.ts:69, 101`).
- 파일 간 import는 확장자 없이 `./generator` 형태로 쓴다 (`index.ts:1-2`).

## Testing Strategy

- 테스트 실행: 루트에서 `bun run test`. `server/**/*.test.ts`는 `vite.config.ts:19`에서 수집된다.
- 테스트 경계: `generator.ts`, `fallback.ts`에는 테스트가 있고 `index.ts`에는 없다. `index.ts`는 import 시점에 `Bun.serve`가 포트 3002로 서버를 띄우므로(`index.ts:138`) 테스트에서 import하지 않는다. 테스트할 로직은 `generator.ts`처럼 부수효과 없는 모듈로 분리한다 (`generator.ts:1-2` 주석 참고).
- `index.ts`의 에러 매핑, 프로바이더 호출, 라우팅을 수정하면 자동 테스트가 없으므로 `bun run server` 후 `/api/config`와 `/api/generate`를 직접 호출해 확인한다.

## Local Golden Rules

- 타입체크 사각지대: `tsconfig.app.json`은 `src`만, `tsconfig.node.json`은 `vite.config.ts`만 포함하므로 `bun run build`(`tsc -b`)는 `server/`를 검사하지 않는다. 서버 코드 변경 후에는 `bun run lint`와 `bun run test`로 확인하고, 타입 오류 가능성이 있는 변경은 직접 검토한다.
- 에러 메시지 형식 결합: `index.ts:194, 201`은 `message.includes('503')`, `includes('429')`로 상태를 판별한다. 이 문자열은 `Claude API error: ${status}`(`index.ts:85`), `Gemini API error: ${status}`(`index.ts:112`)에서 온다. 이 메시지에서 상태 코드를 빼면 503/429 응답 매핑이 조용히 500으로 바뀐다.
- `withModelFallback`은 모든 모델이 실패하면 마지막 에러만 던진다 (`fallback.ts:19`). 앞선 모델의 실패 원인은 버려지므로 디버깅이 필요하면 호출부에서 별도로 기록한다.
- `GOOGLE_MODELS` 배열은 우선순위 순서다 (`index.ts:4-5`). 순서를 바꾸면 폴백 우선순위가 바뀐다.
- Anthropic 모델 ID는 단일 값으로 하드코딩되어 있다 (`index.ts:77`). 모델 변경은 이 한 곳만 수정한다.
- 시스템 프롬프트(`index.ts:7-49`)는 react-live `noInline` 실행 조건(import 금지, `render(...)` 호출, JS 문법만)을 담고 있다. 수정 시 `src/AGENTS.md`의 react-live 제약과 `generator.ts`의 후처리와 함께 확인한다.
- 새 엔드포인트도 응답에 `CORS_HEADERS`를 포함한다 (`index.ts:51-55`, 모든 응답이 사용 중). 키 값을 응답 본문에 포함하는 엔드포인트는 만들지 않는다.
