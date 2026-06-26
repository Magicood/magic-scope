// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('打开时渲染对话框结构、children 与基础类名', () => {
    render(
      <Dialog open onClose={() => {}}>
        <p>对话框内容</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass('ms-dialog');
    expect(dialog.querySelector('.ms-dialog__panel')).toBeInTheDocument();
    expect(screen.getByText('对话框内容')).toBeInTheDocument();
  });

  it('合并外部 className 并透传原生属性', () => {
    render(
      <Dialog open onClose={() => {}} className="custom" aria-label="确认弹窗">
        内容
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveClass('ms-dialog');
    expect(dialog).toHaveClass('custom');
    expect(dialog).toHaveAttribute('aria-label', '确认弹窗');
  });

  it('dismissable 时点击遮罩(dialog 本身)触发 onClose', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        内容
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { hidden: true });
    // 点击 dialog 元素本身 = 点击遮罩区域
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('dismissable=false 时点击遮罩不触发 onClose', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} dismissable={false}>
        内容
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('原生 close 事件触发 onClose 回调', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        内容
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent(dialog, new Event('close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('子部件 Title / Description 自动挂 id 并被根关联 aria-labelledby / -describedby', () => {
    render(
      <Dialog open onClose={() => {}}>
        <Dialog.Header>
          <Dialog.Title>标题</Dialog.Title>
          <Dialog.Description>说明文字</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>正文</Dialog.Body>
        <Dialog.Footer>底部</Dialog.Footer>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { hidden: true });
    const labelledby = dialog.getAttribute('aria-labelledby');
    const describedby = dialog.getAttribute('aria-describedby');
    expect(labelledby).toBeTruthy();
    expect(describedby).toBeTruthy();
    expect(screen.getByText('标题')).toHaveAttribute('id', labelledby);
    expect(screen.getByText('说明文字')).toHaveAttribute('id', describedby);
    // 无 Title/Description 时不应输出空关联,这里两者都在,验证结构类名
    expect(dialog.querySelector('.ms-dialog__footer')).toBeInTheDocument();
    expect(dialog.querySelector('.ms-dialog__body')).toBeInTheDocument();
  });

  it('size / placement / tone 输出对应类名', () => {
    render(
      <Dialog open onClose={() => {}} size="lg" placement="top" tone="danger">
        内容
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveClass('ms-dialog--lg');
    expect(dialog).toHaveClass('ms-dialog--top');
    expect(dialog).toHaveClass('ms-tone-danger');
  });

  it('close 按钮走 i18n(默认中文兜底);hideCloseButton 时不渲染', () => {
    const { rerender } = render(
      <Dialog open onClose={() => {}}>
        内容
      </Dialog>,
    );
    expect(screen.getByRole('button', { name: '关闭', hidden: true })).toBeInTheDocument();

    rerender(
      <Dialog open onClose={() => {}} hideCloseButton>
        内容
      </Dialog>,
    );
    expect(screen.queryByRole('button', { name: '关闭', hidden: true })).not.toBeInTheDocument();
  });

  it('closeIcon 自定义关闭按钮内容', () => {
    render(
      <Dialog open onClose={() => {}} closeIcon={<span data-testid="x">×</span>}>
        内容
      </Dialog>,
    );
    expect(screen.getByTestId('x')).toBeInTheDocument();
  });

  it('点击关闭按钮:onOpenChange(false) 与 onClose 各触发一次', () => {
    const onOpenChange = vi.fn();
    const onClose = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange} onClose={onClose}>
        内容
      </Dialog>,
    );
    fireEvent.click(screen.getByRole('button', { name: '关闭', hidden: true }));
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('onEscapeKeyDown 调 preventDefault 可拦截关闭', () => {
    const onClose = vi.fn();
    const onOpenChange = vi.fn();
    const onEscapeKeyDown = vi.fn((e: KeyboardEvent) => e.preventDefault());
    render(
      <Dialog open onClose={onClose} onOpenChange={onOpenChange} onEscapeKeyDown={onEscapeKeyDown}>
        内容
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    // 被拦截:关闭回调都不触发
    expect(onClose).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('onEscapeKeyDown 不拦截时 Esc 正常触发关闭', () => {
    const onClose = vi.fn();
    const onEscapeKeyDown = vi.fn();
    render(
      <Dialog open onClose={onClose} onEscapeKeyDown={onEscapeKeyDown}>
        内容
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('点遮罩:onPointerDownOutside / onInteractOutside 触发;preventDefault 可拦截关闭', () => {
    const onClose = vi.fn();
    const onPointerDownOutside = vi.fn();
    const onInteractOutside = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <Dialog
        open
        onClose={onClose}
        onPointerDownOutside={onPointerDownOutside}
        onInteractOutside={onInteractOutside}
      >
        内容
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent.click(dialog);
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    // onInteractOutside 拦截后不关闭
    expect(onClose).not.toHaveBeenCalled();
  });

  it('用户 onClick 与内部遮罩检测都触发(compose 不丢用户处理器)', () => {
    const userClick = vi.fn();
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} onClick={userClick}>
        内容
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent.click(dialog);
    expect(userClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('classNames 分部位与 panelProps 透传', () => {
    render(
      <Dialog
        open
        onClose={() => {}}
        classNames={{ backdrop: 'bk', panel: 'pn', close: 'cl' }}
        panelProps={{ id: 'my-panel', className: 'extra-panel' }}
      >
        内容
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveClass('bk');
    const panel = dialog.querySelector('.ms-dialog__panel');
    expect(panel).toHaveClass('pn');
    expect(panel).toHaveClass('extra-panel');
    expect(panel).toHaveAttribute('id', 'my-panel');
    expect(dialog.querySelector('.ms-dialog__close')).toHaveClass('cl');
  });

  it('renderPanel 替换 panel 外壳并保留 children', () => {
    render(
      <Dialog
        open
        onClose={() => {}}
        renderPanel={({ className, children }) => (
          <section className={className} data-testid="custom-panel">
            {children}
          </section>
        )}
      >
        <p>正文</p>
      </Dialog>,
    );
    const panel = screen.getByTestId('custom-panel');
    expect(panel).toHaveClass('ms-dialog__panel');
    expect(panel).toContainElement(screen.getByText('正文'));
  });
});
