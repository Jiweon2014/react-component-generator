import { useEffect, useState } from 'react';
import { loadState, saveState } from '../utils/storage';

export function usePersistentState<T>(
  key: string,
  initial: T,
  isValid?: (value: unknown) => value is T,
): [T, (value: T) => void] {
  const [value, setValue] = useState(() => loadState(key, initial, isValid));

  useEffect(() => {
    saveState(key, value);
  }, [key, value]);

  return [value, setValue];
}
