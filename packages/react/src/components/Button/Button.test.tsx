// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('渲染变体与尺寸类名,默认 type=button', () => {
    render(
      <Button variant="outline" size="lg">
        点我
      </Button>,
    );
    const btn = screen.getByRole('button', { name: '点我' });
    expect(btn).toHaveClass('ms-button', 'ms-button--outline', 'ms-button--lg');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('点击触发 onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>点</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disabled 时不触发 onClick', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        禁用
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
