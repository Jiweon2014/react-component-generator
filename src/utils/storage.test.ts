import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadState, saveState } from './storage';

describe('loadState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 값이 없으면 기본값을 반환한다', () => {
    expect(loadState('missing', 'fallback')).toBe('fallback');
  });

  it('저장한 값을 같은 키로 다시 읽을 수 있다', () => {
    saveState('list', [{ id: 1 }, { id: 2 }]);

    expect(loadState('list', [])).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('저장된 값이 깨진 JSON이면 기본값을 반환한다', () => {
    localStorage.setItem('broken', '{not json');

    expect(loadState('broken', 'fallback')).toBe('fallback');
  });

  it('검증 함수를 통과하지 못한 값은 기본값을 반환한다', () => {
    saveState('provider', 'unknown');
    const isProvider = (v: unknown): v is 'anthropic' | 'google' => v === 'anthropic' || v === 'google';

    expect(loadState('provider', 'google', isProvider)).toBe('google');
  });
});

describe('saveState', () => {
  it('저장소가 쓰기에 실패해도 예외를 던지지 않는다', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new DOMException('quota exceeded', 'QuotaExceededError');
      },
    });

    expect(() => saveState('k', 'v')).not.toThrow();

    vi.unstubAllGlobals();
  });
});
