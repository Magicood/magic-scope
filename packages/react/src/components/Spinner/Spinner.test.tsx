// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('默认渲染 role=status,尺寸与变体类,aria-label 走 i18n(加载中)', () => {
    render(<Spinner />);
    const sp = screen.getByRole('status');
    expect(sp).toHaveClass('ms-spinner', 'ms-spinner--md', 'ms-spinner--ring');
    expect(sp).toHaveAttribute('aria-label', '加载中');
  });

  it('自定义 label 覆盖 aria-label', () => {
    render(<Spinner label="加载中" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '加载中');
  });

  it('tone 映射到 ms-tone-* 类;不传 tone 时不加 tone 类(跟随 currentColor)', () => {
    const { rerender } = render(<Spinner />);
    expect(screen.getByRole('status').className).not.toMatch(/ms-tone-/);
    rerender(<Spinner tone="success" />);
    expect(screen.getByRole('status')).toHaveClass('ms-tone-success');
  });

  it('variant=dots 渲染三个圆点;bars 渲染四条', () => {
    const { container, rerender } = render(<Spinner variant="dots" />);
    expect(container.querySelectorAll('.ms-spinner__dot')).toHaveLength(3);
    expect(screen.getByRole('status')).toHaveClass('ms-spinner--dots');
    rerender(<Spinner variant="bars" />);
    expect(container.querySelectorAll('.ms-spinner__bar')).toHaveLength(4);
  });

  it('showLabel 渲染可见旁注文字 + 放置类;labelContent 覆盖可见内容但 aria 仍用 label', () => {
    const { rerender, container } = render(<Spinner showLabel labelPlacement="bottom" />);
    expect(container.querySelector('.ms-spinner__label')).toHaveTextContent('加载中');
    expect(screen.getByRole('status')).toHaveClass(
      'ms-spinner--with-label',
      'ms-spinner--label-bottom',
    );
    rerender(<Spinner label="读屏用" labelContent={<span>看得见的</span>} />);
    expect(container.querySelector('.ms-spinner__label')).toHaveTextContent('看得见的');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '读屏用');
  });

  it('留口:...rest 透传原生事件与属性到根,ref 接到根', () => {
    const onMouseEnter = vi.fn();
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} data-testid="sp" onMouseEnter={onMouseEnter} />);
    const sp = screen.getByTestId('sp');
    expect(sp).toBe(ref.current);
    fireEvent.mouseEnter(sp);
    expect(onMouseEnter).toHaveBeenCalledOnce();
  });
});
