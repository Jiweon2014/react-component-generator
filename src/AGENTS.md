# src/AGENTS.md

## Module Context

Vite로 빌드되는 브라우저 프론트엔드. `/api/generate`로 받은 코드를 react-live로 렌더링하고, `/api` 호출은 Vite 프록시를 통해 서버로 전달된다.

## Tech Stack & Constraints

- `tsconfig.app.json`의 `erasableSyntaxOnly`(enum, namespace, 파라미터 프로퍼티 사용 불가)와 `verbatimModuleSyntax`(타입은 `import type`)가 켜져 있다. 기존 코드도 `import type`을 쓴다 (`App.tsx:5`, `hooks/useComponentGenerator.ts:2`).
- `noUnusedLocals`, `noUnusedParameters`가 켜져 있어 미사용 변수는 빌드 오류다.
- 스타일은 `App.css`, `index.css`의 클래스 기반이다. 단, AI가 생성하는 컴포넌트 코드는 inline style만 쓴다 (서버 시스템 프롬프트 규칙).

## Implementation Patterns

- 미리보기는 `LiveProvider`에 `noInline`을 준다 (`components/LivePreview.tsx:14`). noInline 모드는 코드에 `render(...)` 호출이 있어야 그려지므로, 이 옵션을 바꾸면 서버의 `ensureRenderCall`과 시스템 프롬프트가 함께 무효화된다.
- 미리보기 새로고침은 `key={previewKey}`로 `LivePreview`를 리마운트해서 구현한다 (`components/ComponentCard.tsx:70`). 애니메이션 컴포넌트를 처음부터 다시 보이게 하는 동작이므로 상태 초기화 방식으로 바꾸지 않는다.
- 서버 통신은 `hooks/useComponentGenerator.ts`에 모여 있다. 컴포넌트에서 `/api/generate`를 직접 호출하지 않는다. 서버가 내려주는 `error` 문자열을 그대로 `setError`로 노출한다 (`useComponentGenerator.ts:31-33`).
- 클라이언트 `provider` 기본값은 `google`(`App.tsx:16`)이고 서버 기본값은 `anthropic`(`server/index.ts:161`)이다. 훅이 항상 `provider`를 명시해서 보내므로(`useComponentGenerator.ts:26`) 문제가 없다. 이 전송을 생략하지 않는다.

## Testing Strategy

- 테스트 실행: 루트에서 `bun run test`. 환경은 jsdom이며 `src/test/setup.ts`가 `jest-dom` 매처를 등록하고 매 테스트 후 `cleanup()`을 호출한다 (`setup.ts:1-8`). 테스트 파일에서 `cleanup`을 다시 호출하지 않는다.
- 패턴: Testing Library `render` + `userEvent` + 역할 기반 쿼리(`getByRole`)를 쓴다 (`components/PromptInput.test.tsx`).
- 테스트 경계: `PromptInput`에만 테스트가 있다. `App.tsx`, `ComponentCard.tsx`, `LivePreview.tsx`, `useComponentGenerator.ts`는 테스트가 없다. 이 파일들을 수정할 때는 변경 범위에 대한 테스트를 함께 추가하고, 추가하지 못하면 `bun run dev`로 직접 확인한 결과를 보고한다.

## Local Golden Rules

- `App.tsx:34`의 API 키 누락 검사는 서버 검사(`server/index.ts:169`)의 보조다. 서버에 키가 있는지 여부는 `/api/config`의 `envKeys`로만 판단하고 (`App.tsx:25-27`), 키 값 자체를 클라이언트에서 요청하거나 저장하지 않는다.
- 사용자가 입력한 API 키는 컴포넌트 state에만 둔다 (`App.tsx:14`). `localStorage` 등에 영속 저장하지 않는다. 프로바이더 변경 시 키를 초기화하는 동작을 유지한다 (`App.tsx:41-44`).
- `LivePreview`는 AI가 생성한 코드를 브라우저에서 실행한다. 생성된 코드에 의존하는 로직을 앱 전역 상태나 인증 정보에 연결하지 않는다.
