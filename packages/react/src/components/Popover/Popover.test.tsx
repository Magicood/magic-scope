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

  it('placement 映射到主轴 data-ms-side / 副轴 data-ms-align 与变体类名', () => {
    const { rerender } = render(
      <Popover trigger={<button type="button">触发</button>}>内容</Popover>,
    );
    let dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveClass('ms-popover');
    expect(dialog).toHaveClass('ms-popover--bottom');
    expect(dialog).toHaveAttribute('data-ms-side', 'bottom');
    expect(dialog).toHaveAttribute('data-ms-align', 'center');

    rerender(
      <Popover trigger={<button type="button">触发</button>} placement="top-end" className="extra">
        内容
      </Popover>,
    );
    dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveClass('ms-popover--top');
    expect(dialog).toHaveClass('extra');
    expect(dialog).toHaveAttribute('data-ms-side', 'top');
    expect(dialog).toHaveAttribute('data-ms-align', 'end');
    expect(dialog).not.toHaveClass('ms-popover--bottom');
  });

  it('应用 tone class 并把 offset 写入 CSS 变量', () => {
    render(
      <Popover trigger={<button type="button">触发</button>} tone="danger" offset={16}>
        内容
      </Popover>,
    );
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveClass('ms-tone-danger');
    expect(dialog.style.getPropertyValue('--ms-popover-offset')).toBe('16px');
  });

  it('arrow=true 时渲染指向箭头', () => {
    const { container, rerender } = render(
      <Popover trigger={<button type="button">触发</button>}>内容</Popover>,
    );
    expect(container.querySelector('.ms-popover__arrow')).toBeNull();

    rerender(
      <Popover trigger={<button type="button">触发</button>} arrow>
        内容
      </Popover>,
    );
    expect(container.querySelector('.ms-popover__arrow')).not.toBeNull();
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

  it('trigger 上用户自带的 onClick 与内部切换处理器都触发(compose,不丢)', () => {
    const userClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Popover
        trigger={
          <button type="button" onClick={userClick}>
            合并
          </button>
        }
        onOpenChange={onOpenChange}
      >
        内容
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: '合并' }));
    expect(userClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('用户在 trigger onClick 中 preventDefault 可阻断内部切换', () => {
    const onOpenChange = vi.fn();
    render(
      <Popover
        trigger={
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            拦截
          </button>
        }
        onOpenChange={onOpenChange}
      >
        内容
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: '拦截' }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('triggerAction="hover" 时 pointerEnter 打开、pointerLeave 关闭(无延时)', () => {
    const onOpenChange = vi.fn();
    render(
      <Popover
        trigger={<button type="button">悬停</button>}
        triggerAction="hover"
        onOpenChange={onOpenChange}
      >
        内容
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: '悬停' });
    fireEvent.pointerEnter(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    fireEvent.pointerLeave(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Esc 关闭并触发 onEscapeKeyDown;preventDefault 可拦截关闭', () => {
    const onOpenChange = vi.fn();
    const onEscapeKeyDown = vi.fn((e: KeyboardEvent) => e.preventDefault());
    render(
      <Popover
        trigger={<button type="button">受控Esc</button>}
        open={true}
        onOpenChange={onOpenChange}
        onEscapeKeyDown={onEscapeKeyDown}
      >
        内容
      </Popover>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    // 用户 preventDefault 了 → 不触发关闭回调
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('点击外部触发 onPointerDownOutside / onInteractOutside 并关闭', () => {
    const onOpenChange = vi.fn();
    const onPointerDownOutside = vi.fn();
    const onInteractOutside = vi.fn();
    render(
      <div>
        <span data-testid="outside">外部</span>
        <Popover
          trigger={<button type="button">受控外</button>}
          open={true}
          onOpenChange={onOpenChange}
          onPointerDownOutside={onPointerDownOutside}
          onInteractOutside={onInteractOutside}
        >
          内容
        </Popover>
      </div>,
    );
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('...rest 透传原生属性 / data-* 到浮层根', () => {
    render(
      <Popover
        trigger={<button type="button">透传</button>}
        data-testid="pop-root"
        aria-label="自定义浮层"
      >
        内容
      </Popover>,
    );
    const dialog = screen.getByTestId('pop-root');
    expect(dialog).toHaveAttribute('aria-label', '自定义浮层');
    expect(dialog).toHaveClass('ms-popover');
  });

  it('classNames 槽位作用到 panel / arrow', () => {
    const { container } = render(
      <Popover
        trigger={<button type="button">槽位</button>}
        arrow
        classNames={{ panel: 'my-panel', arrow: 'my-arrow' }}
      >
        内容
      </Popover>,
    );
    expect(container.querySelector('.ms-popover__panel.my-panel')).not.toBeNull();
    expect(container.querySelector('.ms-popover__arrow.my-arrow')).not.toBeNull();
  });
});
