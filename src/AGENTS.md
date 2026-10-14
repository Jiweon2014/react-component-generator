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
- 클라이언트 `provider` 기본값은 `google`(`App.tsx:23`)이고 서버 기본값은 `anthropic`(`server/index.ts:161`)이다. 훅이 항상 `provider`를 명시해서 보내므로(`useComponentGenerator.ts:26`) 문제가 없다. 이 전송을 생략하지 않는다.

## Testing Strategy

- 테스트 실행: 루트에서 `bun run test`. 환경은 jsdom이며 `src/test/setup.ts`가 `jest-dom` 매처를 등록하고 매 테스트 후 `cleanup()`을 호출한다 (`setup.ts:1-8`). 테스트 파일에서 `cleanup`을 다시 호출하지 않는다.
- 패턴: Testing Library `render` + `userEvent` + 역할 기반 쿼리(`getByRole`)를 쓴다 (`components/PromptInput.test.tsx`).
- 테스트 경계: `PromptInput`, `App`(영속성), `useComponentGenerator`(영속성), `usePersistentState`, `src/utils/*`에는 테스트가 있다. `ComponentCard.tsx`, `LivePreview.tsx`는 테스트가 없다. 이 파일들을 수정할 때는 변경 범위에 대한 테스트를 함께 추가하고, 추가하지 못하면 `bun run dev`로 직접 확인한 결과를 보고한다.
- `src/test/setup.ts`는 jsdom에서 `localStorage`가 없는 Node 환경을 위해 메모리 기반 대체 구현을 등록한다. 저장소 테스트는 `beforeEach`에서 `localStorage.clear()`로 초기화한다.

## Local Golden Rules

- `App.tsx:46`의 API 키 누락 검사는 서버 검사(`server/index.ts:169`)의 보조다. 서버에 키가 있는지 여부는 `/api/config`의 `envKeys`로만 판단하고 (`App.tsx:37-39`), 서버(.env)에 설정된 키 값 자체는 클라이언트에서 요청하지 않는다.
- 영속 상태(API 키, Provider, 프롬프트 히스토리, 컴포넌트 목록)는 `localStorage`의 `rcg:` 접두사 키에 저장한다 (`App.tsx:21-26`, `hooks/useComponentGenerator.ts:6`). 읽고 쓰기는 `utils/storage.ts`의 `loadState`/`saveState`만 사용한다. 이 함수들은 깨진 JSON, 형식 불일치, 용량 초과를 조용히 처리한다.
- API 키가 `localStorage`에 저장된다는 점을 잊지 않는다. `LivePreview`는 AI가 생성한 코드를 같은 origin에서 실행하므로(`components/LivePreview.tsx:14`, iframe 격리 없음) 생성된 코드가 `localStorage`를 읽을 수 있다. 키를 서버로 보내거나 화면에 노출하는 코드를 추가하지 않고, `LivePreview`를 격리 없이 확장하지 않는다.
- 프로바이더 변경 시 키를 초기화하는 동작을 유지한다 (`App.tsx:54-57`). 초기화된 값도 저장되어 다른 프로바이더의 키가 남지 않는다.
- 저장된 컴포넌트의 `createdAt`은 JSON에서 문자열이 되므로 `utils/components.ts`의 `reviveComponents`로 `Date`를 복원한다. 새 영속 필드를 추가하면 같은 방식으로 복원과 검증을 추가한다.
