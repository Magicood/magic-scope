// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('默认渲染 elevated 变体的基础类名,且不可交互(无 tabIndex / 无 interactive 类)', () => {
    render(<Card data-testid="card">内容</Card>);
    const card = screen.getByTestId('card');

    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('ms-card', 'ms-card--elevated');
    expect(card).not.toHaveClass('ms-card--interactive');
    expect(card).not.toHaveAttribute('tabindex');
    expect(card).toHaveTextContent('内容');
  });

  it('variant="outline" 时使用 outline 变体类名', () => {
    render(
      <Card variant="outline" data-testid="card">
        描边卡片
      </Card>,
    );
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('ms-card--outline');
    expect(card).not.toHaveClass('ms-card--elevated');
  });

  it('interactive 时补 interactive 类并默认 tabIndex=0,显式 tabIndex 优先', () => {
    const { rerender } = render(
      <Card interactive data-testid="card">
        可交互
      </Card>,
    );
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('ms-card--interactive');
    expect(card).toHaveAttribute('tabindex', '0');

    rerender(
      <Card interactive tabIndex={-1} data-testid="card">
        可交互
      </Card>,
    );
    expect(card).toHaveAttribute('tabindex', '-1');
  });

  it('合并外部 className 并透传原生 div props(如 onClick 回调)', () => {
    const onClick = vi.fn();
    render(
      <Card className="custom-card" onClick={onClick} data-testid="card">
        点我
      </Card>,
    );
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('ms-card', 'ms-card--elevated', 'custom-card');

    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
