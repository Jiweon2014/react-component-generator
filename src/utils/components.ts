import type { GeneratedComponent } from '../types';

function isStoredComponent(item: unknown): item is Omit<GeneratedComponent, 'createdAt'> & { createdAt: string } {
  if (typeof item !== 'object' || item === null) return false;
  const c = item as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.prompt === 'string' &&
    typeof c.code === 'string' &&
    typeof c.createdAt === 'string' &&
    !Number.isNaN(new Date(c.createdAt).getTime())
  );
}

/** 저장된 JSON(createdAt이 문자열)을 GeneratedComponent[]로 복원한다. 형식이 맞지 않는 항목은 버린다. */
export function reviveComponents(raw: unknown): GeneratedComponent[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isStoredComponent).map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt),
  }));
}
