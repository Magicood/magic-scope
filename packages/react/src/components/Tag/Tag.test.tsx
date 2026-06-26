// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tag } from './Tag';

describe('Tag', () => {
  it('默认渲染 neutral/soft/md,带基础类名与子内容,不渲染关闭按钮', () => {
    render(<Tag>标签内容</Tag>);
    const label = screen.getByText('标签内容');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('ms-tag__label');

    const root = label.parentElement as HTMLElement;
    expect(root).toHaveClass('ms-tag', 'ms-tone-neutral', 'ms-tag--soft', 'ms-tag--md');
    expect(root).not.toHaveClass('ms-tag--closable');

    // 不可关闭时不渲染移除按钮
    expect(screen.queryByRole('button', { name: '移除' })).not.toBeInTheDocument();
  });

  it('tone 走统一 resolver 类名(ms-tone-*),并合并自定义 className 与透传属性', () => {
    render(
      <Tag tone="success" className="extra" data-testid="t" aria-label="状态">
        OK
      </Tag>,
    );
    const root = screen.getByTestId('t');
    expect(root).toHaveClass('ms-tag', 'ms-tone-success', 'extra');
    expect(root).toHaveAttribute('aria-label', '状态');
  });

  it('variant / size 映射到对应类名', () => {
    render(
      <Tag variant="outline" size="sm" data-testid="t">
        标签
      </Tag>,
    );
    const root = screen.getByTestId('t');
    expect(root).toHaveClass('ms-tag--outline', 'ms-tag--sm');
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

  it('点击关闭按钮触发 onRemove 并携带事件', () => {
    const onRemove = vi.fn();
    render(
      <Tag closable onRemove={onRemove}>
        删我
      </Tag>,
    );
    fireEvent.click(screen.getByRole('button', { name: '移除' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove.mock.calls[0]?.[0]).toBeTruthy();
  });

  it('关闭按钮 onClick 阻止冒泡:不触发根 onClick', () => {
    const onRootClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <Tag closable onClick={onRootClick} onRemove={onRemove}>
        隔离
      </Tag>,
    );
    fireEvent.click(screen.getByRole('button', { name: '移除' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRootClick).not.toHaveBeenCalled();
  });

  it('closeButtonProps.onClick 与内部隔离逻辑都触发(compose)', () => {
    const userClose = vi.fn();
    const onRemove = vi.fn();
    render(
      <Tag closable onRemove={onRemove} closeButtonProps={{ onClick: userClose, title: '关闭' }}>
        compose
      </Tag>,
    );
    const closeBtn = screen.getByRole('button', { name: '移除' });
    expect(closeBtn).toHaveAttribute('title', '关闭');
    fireEvent.click(closeBtn);
    expect(userClose).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('自定义 closeIcon 替代默认的 ×', () => {
    render(
      <Tag closable closeIcon={<span data-testid="x">关</span>}>
        自定义图标
      </Tag>,
    );
    expect(screen.getByTestId('x')).toHaveTextContent('关');
    expect(screen.getByRole('button', { name: '移除' })).not.toHaveTextContent('×');
  });

  it('icon 槽渲染到 .ms-tag__icon', () => {
    render(<Tag icon={<i data-testid="ico" />}>带图标</Tag>);
    const ico = screen.getByTestId('ico');
    expect(ico.parentElement).toHaveClass('ms-tag__icon');
  });

  it('checkable 暴露 role=button / tabindex / aria-pressed,点击触发 onClick', () => {
    const onClick = vi.fn();
    render(
      <Tag checkable selected onClick={onClick}>
        过滤
      </Tag>,
    );
    const root = screen.getByRole('button', { name: '过滤' });
    expect(root).toHaveClass('ms-tag--checkable', 'ms-tag--selected');
    expect(root).toHaveAttribute('tabindex', '0');
    expect(root).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('checkable 键盘 Enter/Space 激活 onClick,并保留用户 onKeyDown', () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Tag checkable onClick={onClick} onKeyDown={onKeyDown}>
        键盘
      </Tag>,
    );
    const root = screen.getByRole('button', { name: '键盘' });
    fireEvent.keyDown(root, { key: 'Enter' });
    fireEvent.keyDown(root, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onKeyDown).toHaveBeenCalledTimes(2);
  });

  it('用户 onClick 与原生事件透传都生效(根 spread ...rest)', () => {
    const onClick = vi.fn();
    const onMouseEnter = vi.fn();
    render(
      <Tag onClick={onClick} onMouseEnter={onMouseEnter} data-testid="t">
        透传
      </Tag>,
    );
    const root = screen.getByTestId('t');
    fireEvent.click(root);
    fireEvent.mouseEnter(root);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });

  it('asChild 把样式与可交互语义合并到子元素(链接多态)', () => {
    render(
      <Tag asChild checkable selected>
        <a href="/x">链接标签</a>
      </Tag>,
    );
    const link = screen.getByRole('button', { name: '链接标签' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/x');
    expect(link).toHaveClass('ms-tag', 'ms-tag--checkable', 'ms-tag--selected');
    expect(link).toHaveAttribute('aria-pressed', 'true');
  });
});
