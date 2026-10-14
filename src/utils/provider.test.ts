import { describe, it, expect } from 'vitest';
import { isProvider } from './provider';

describe('isProvider', () => {
  it('anthropic과 google만 유효한 Provider로 판별한다', () => {
    expect(isProvider('anthropic')).toBe(true);
    expect(isProvider('google')).toBe(true);
    expect(isProvider('openai')).toBe(false);
    expect(isProvider(null)).toBe(false);
  });
});
