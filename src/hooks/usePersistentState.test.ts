import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';
import { saveState } from '../utils/storage';

describe('usePersistentState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 값이 없으면 초기값을 반환한다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init'));

    expect(result.current[0]).toBe('init');
  });

  it('저장된 값이 있으면 초기값 대신 복원한다', () => {
    saveState('k', 'stored');

    const { result } = renderHook(() => usePersistentState('k', 'init'));

    expect(result.current[0]).toBe('stored');
  });

  it('값을 바꾸면 같은 키로 저장된다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init'));

    act(() => result.current[1]('changed'));

    expect(localStorage.getItem('k')).toBe(JSON.stringify('changed'));
  });
});
