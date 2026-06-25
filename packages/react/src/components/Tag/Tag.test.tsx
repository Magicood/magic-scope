// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tag } from './Tag';

describe('Tag', () => {
  it('默认渲染 neutral 色调,带基础类名与子内容,不渲染关闭按钮', () => {
    render(<Tag>标签内容</Tag>);
    const label = screen.getByText('标签内容');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('ms-tag__label');

    const root = label.parentElement as HTMLElement;
    expect(root).toHaveClass('ms-tag', 'ms-tag--neutral');
    expect(root).not.toHaveClass('ms-tag--closable');

    // 不可关闭时不渲染移除按钮
    expect(screen.queryByRole('button', { name: '移除' })).not.toBeInTheDocument();
  });

  it('tone 变体映射到对应类名,并合并自定义 className 与透传属性', () => {
    render(
      <Tag tone="success" className="extra" data-testid="t" aria-label="状态">
        OK
      </Tag>,
    );
    const root = screen.getByTestId('t');
    expect(root).toHaveClass('ms-tag', 'ms-tag--success', 'extra');
    expect(root).toHaveAttribute('aria-label', '状态');
  });

  it('closable 时渲染 aria-label="移除" 的关闭按钮并加 closable 类名', () => {
    render(<Tag closable>可关闭</Tag>);
    const root = screen.getByText('可关闭').parentElement as HTMLElement;
    expect(root).toHaveClass('ms-tag--closable');

    const closeBtn = screen.getByRole('button', { name: '移除' });
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).toHaveAttribute('type', 'button');
    expect(closeBtn).toHaveClass('ms-tag__close');
  });

  it('点击关闭按钮触发 onRemove 回调', () => {
    const onRemove = vi.fn();
    render(
      <Tag closable onRemove={onRemove}>
        删我
      </Tag>,
    );
    fireEvent.click(screen.getByRole('button', { name: '移除' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
