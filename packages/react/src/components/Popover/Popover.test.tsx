// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Popover } from './Popover';

describe('Popover', () => {
  it('渲染 trigger 与浮层结构,并注入 aria 关联属性', () => {
    render(<Popover trigger={<button type="button">打开</button>}>浮层内容</Popover>);

    // trigger 注入了 aria-haspopup / aria-expanded / aria-controls
    const trigger = screen.getByRole('button', { name: '打开' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const controls = trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();

    // 浮层是 role="dialog",aria-modal="false",id 与 trigger 的 aria-controls 一致
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'false');
    expect(dialog).toHaveAttribute('id', controls);
    expect(dialog).toHaveTextContent('浮层内容');
  });

  it('应用默认 placement 与自定义 placement 的变体类名', () => {
    const { rerender } = render(
      <Popover trigger={<button type="button">触发</button>}>内容</Popover>,
    );
    let dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveClass('ms-popover');
    expect(dialog).toHaveClass('ms-popover--bottom');

    rerender(
      <Popover trigger={<button type="button">触发</button>} placement="top" className="extra">
        内容
      </Popover>,
    );
    dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveClass('ms-popover--top');
    expect(dialog).toHaveClass('extra');
    expect(dialog).not.toHaveClass('ms-popover--bottom');
  });

  it('非受控模式下点击 trigger 切换 aria-expanded 并触发 onOpenChange', () => {
    const onOpenChange = vi.fn();
    render(
      <Popover trigger={<button type="button">切换</button>} onOpenChange={onOpenChange}>
        内容
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: '切换' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('受控模式下 open 决定 aria-expanded,点击只回调不自行改状态', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Popover
        trigger={<button type="button">受控</button>}
        open={false}
        onOpenChange={onOpenChange}
      >
        内容
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: '受控' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // 受控:点击只触发回调,状态不应自行翻转(仍为 false)
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // 父级回传 open=true 后才反映为展开
    rerender(
      <Popover
        trigger={<button type="button">受控</button>}
        open={true}
        onOpenChange={onOpenChange}
      >
        内容
      </Popover>,
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
