export function loadState<T>(
  key: string,
  fallback: T,
  isValid?: (value: unknown) => value is T,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value: unknown = JSON.parse(raw);
    if (isValid && !isValid(value)) return fallback;
    return value as T;
  } catch {
    return fallback;
  }
}

export function saveState(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 용량 초과나 저장소 차단 환경에서도 앱은 계속 동작해야 한다.
  }
}
