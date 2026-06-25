// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tabs } from './Tabs';

const items = [
  { value: 'a', label: 'A', content: 'panel-a' },
  { value: 'b', label: 'B', content: 'panel-b' },
  { value: 'c', label: 'C', content: 'panel-c' },
];

describe('Tabs', () => {
  it('默认选中第一项并渲染其面板', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('panel-a')).toBeInTheDocument();
  });

  it('点击切换选中与面板', () => {
    render(<Tabs items={items} />);
    fireEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('panel-b')).toBeInTheDocument();
  });

  it('方向键 → 切换到下一标签', () => {
    render(<Tabs items={items} />);
    const tabA = screen.getByRole('tab', { name: 'A' });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
  });
});
