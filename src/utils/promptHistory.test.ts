import { describe, it, expect } from 'vitest';
import { addPromptToHistory } from './promptHistory';

describe('addPromptToHistory', () => {
  it('새 프롬프트를 목록 맨 앞에 추가한다', () => {
    expect(addPromptToHistory(['b', 'a'], 'c')).toEqual(['c', 'b', 'a']);
  });

  it('이미 있는 프롬프트는 중복 없이 맨 앞으로 옮긴다', () => {
    expect(addPromptToHistory(['c', 'b', 'a'], 'a')).toEqual(['a', 'c', 'b']);
  });

  it('최대 개수를 넘으면 가장 오래된 프롬프트부터 제거한다', () => {
    expect(addPromptToHistory(['c', 'b', 'a'], 'd', 3)).toEqual(['d', 'c', 'b']);
  });
});
