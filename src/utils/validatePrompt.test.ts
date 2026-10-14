import { describe, it, expect } from 'vitest';
import { validatePromptLength, PROMPT_MAX_LENGTH } from './validatePrompt';

describe('validatePromptLength', () => {
  it('정확히 500자인 프롬프트는 유효하다', () => {
    const result = validatePromptLength('a'.repeat(PROMPT_MAX_LENGTH));

    expect(result.valid).toBe(true);
    expect(result.length).toBe(500);
  });

  it('500자를 초과하면 유효하지 않다', () => {
    const result = validatePromptLength('a'.repeat(PROMPT_MAX_LENGTH + 1));

    expect(result.valid).toBe(false);
    expect(result.length).toBe(501);
  });

  it('500자를 초과하면 사용자에게 보여줄 에러 메시지를 반환한다', () => {
    const result = validatePromptLength('a'.repeat(PROMPT_MAX_LENGTH + 1));

    expect(result.error).toBe('프롬프트는 500자 이하로 입력해주세요.');
  });
});
