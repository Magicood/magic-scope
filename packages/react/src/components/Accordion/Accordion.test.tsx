// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Accordion } from './Accordion';

const items = [
  { value: 'a', title: 'A', content: 'content-a' },
  { value: 'b', title: 'B', content: 'content-b' },
];

describe('Accordion', () => {
  it('点击头部切换 aria-expanded', () => {
    render(<Accordion items={items} />);
    const headerA = screen.getByRole('button', { name: 'A' });
    expect(headerA).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(headerA);
    expect(headerA).toHaveAttribute('aria-expanded', 'true');
  });

  it('single 模式:展开一项时收起其他', () => {
    render(<Accordion type="single" defaultValue="a" items={items} />);
    const headerA = screen.getByRole('button', { name: 'A' });
    const headerB = screen.getByRole('button', { name: 'B' });
    expect(headerA).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(headerB);
    expect(headerB).toHaveAttribute('aria-expanded', 'true');
    expect(headerA).toHaveAttribute('aria-expanded', 'false');
  });
});
