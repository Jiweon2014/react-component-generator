import { describe, it, expect } from 'vitest';
import { reviveComponents } from './components';

describe('reviveComponents', () => {
  it('저장된 createdAt 문자열을 Date로 복원한다', () => {
    const iso = '2026-10-14T03:00:00.000Z';

    const [component] = reviveComponents([{ id: '1', prompt: 'p', code: 'c', createdAt: iso }]);

    expect(component.createdAt).toBeInstanceOf(Date);
    expect(component.createdAt.toISOString()).toBe(iso);
    expect(component).toMatchObject({ id: '1', prompt: 'p', code: 'c' });
  });

  it('배열이 아니거나 형식이 맞지 않는 항목은 버린다', () => {
    const valid = { id: '1', prompt: 'p', code: 'c', createdAt: '2026-10-14T03:00:00.000Z' };

    expect(reviveComponents('not array')).toEqual([]);
    expect(
      reviveComponents([valid, null, { id: '2' }, { ...valid, id: '3', createdAt: 'invalid-date' }]),
    ).toHaveLength(1);
  });
});
