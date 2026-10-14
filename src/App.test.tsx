import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { saveState } from './utils/storage';

describe('App 영속성', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ json: async () => ({ envKeys: { anthropic: false, google: false } }) })),
    );
  });

  it('저장된 Provider와 API 키를 새로고침 후에도 복원한다', () => {
    saveState('rcg:provider', 'anthropic');
    saveState('rcg:apiKey', 'test-key');

    render(<App />);

    expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
    expect(screen.getByLabelText('API Key')).toHaveValue('test-key');
  });

  it('생성을 요청하면 프롬프트가 히스토리로 저장된다', async () => {
    saveState('rcg:apiKey', 'test-key');
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: '' }), '프로필 카드');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));

    expect(localStorage.getItem('rcg:promptHistory')).toBe(JSON.stringify(['프로필 카드']));
  });
});
