import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';
import { saveState } from '../utils/storage';

const STORAGE_KEY = 'rcg:components';

describe('useComponentGenerator 영속성', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 컴포넌트 목록을 새로고침 후에도 복원한다', () => {
    saveState(STORAGE_KEY, [
      { id: '1', prompt: '카드', code: 'render(<div />)', createdAt: '2026-10-14T03:00:00.000Z' },
    ]);

    const { result } = renderHook(() => useComponentGenerator());

    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });

  it('컴포넌트를 삭제하면 저장된 목록도 갱신된다', () => {
    saveState(STORAGE_KEY, [
      { id: '1', prompt: '카드', code: 'render(<div />)', createdAt: '2026-10-14T03:00:00.000Z' },
    ]);
    const { result } = renderHook(() => useComponentGenerator());

    act(() => result.current.removeComponent('1'));

    expect(localStorage.getItem(STORAGE_KEY)).toBe('[]');
  });
});
