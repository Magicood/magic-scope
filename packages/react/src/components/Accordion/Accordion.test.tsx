// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

  it('single + collapsible=false:已展开的唯一项再点保持展开', () => {
    render(<Accordion type="single" collapsible={false} defaultValue="a" items={items} />);
    const headerA = screen.getByRole('button', { name: 'A' });
    expect(headerA).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(headerA);
    expect(headerA).toHaveAttribute('aria-expanded', 'true');
  });

  it('受控:value 决定展开,点击只触发 onValueChange 不自行改变', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Accordion type="single" value="a" onValueChange={onValueChange} items={items} />,
    );
    const headerB = screen.getByRole('button', { name: 'B' });
    expect(headerB).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(headerB);
    // 受控未改 prop:UI 不变,但回调收到下一个值
    expect(headerB).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).toHaveBeenCalledWith('b');
    // 父组件回写 value 后才更新
    rerender(<Accordion type="single" value="b" onValueChange={onValueChange} items={items} />);
    expect(headerB).toHaveAttribute('aria-expanded', 'true');
  });

  it('multiple:onValueChange 回数组,可同时展开多项', () => {
    const onValueChange = vi.fn();
    render(
      <Accordion
        type="multiple"
        defaultValue={['a']}
        onValueChange={onValueChange}
        items={items}
      />,
    );
    const headerB = screen.getByRole('button', { name: 'B' });
    fireEvent.click(headerB);
    expect(onValueChange).toHaveBeenCalledWith(['a', 'b']);
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-expanded', 'true');
    expect(headerB).toHaveAttribute('aria-expanded', 'true');
  });

  it('事件:用户 item.onClick / onTriggerClick / onExpandedChange 都触发且不互相覆盖', () => {
    const itemClick = vi.fn();
    const onTriggerClick = vi.fn();
    const onExpandedChange = vi.fn();
    const withClick = [{ ...items[0], onClick: itemClick }, items[1]];
    render(
      <Accordion
        items={withClick as typeof items}
        onTriggerClick={onTriggerClick}
        onExpandedChange={onExpandedChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'A' }));
    expect(itemClick).toHaveBeenCalledTimes(1);
    expect(onTriggerClick).toHaveBeenCalledWith('a', expect.anything());
    expect(onExpandedChange).toHaveBeenCalledWith('a', true);
  });

  it('留口:...rest 原生事件透传到根、tone 类挂根', () => {
    const onContextMenu = vi.fn();
    const { container } = render(
      <Accordion tone="success" data-testid="acc" onContextMenu={onContextMenu} items={items} />,
    );
    const root = container.querySelector('.ms-accordion');
    expect(root).toHaveClass('ms-tone-success');
    expect(root).toHaveAttribute('data-testid', 'acc');
    if (root) {
      fireEvent.contextMenu(root);
    }
    expect(onContextMenu).toHaveBeenCalledTimes(1);
  });

  it('事件:用户 onKeyDown 先触发,且不阻断内部 ↑↓ 导航', () => {
    const onKeyDown = vi.fn();
    render(<Accordion items={items} onKeyDown={onKeyDown} />);
    const headerA = screen.getByRole('button', { name: 'A' });
    headerA.focus();
    fireEvent.keyDown(headerA, { key: 'ArrowDown' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'B' })).toHaveFocus();
  });
});
